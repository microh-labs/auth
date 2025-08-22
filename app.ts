import bcrypt from "bcrypt";
import crypto from "crypto";
import express from "express";
import jwt from "jsonwebtoken";
import path from "path";
import { fileURLToPath } from "url";
import { db } from "./src/db/index";
import * as schema from "./src/db/schema";
import { loadAppConfig, saveAppConfig } from "./src/lib/app-config";

const { usersTable } = schema;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.post("/auth/api/signup", async (req, res) => {
  const { username, password } = req.body;
  function validateUsername(username: string) {
    return /^[a-z0-9_]{3,32}$/.test(username);
  }
  function validatePassword(password: string) {
    return /^(?=.*[a-zA-Z])(?=.*\d).{8,64}$/.test(password);
  }
  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required." });
  }
  if (!validateUsername(username)) {
    return res
      .status(400)
      .json({ error: "Username must be 3-32 characters, a-z, 0-9, or _" });
  }
  if (!validatePassword(password)) {
    return res.status(400).json({
      error: "Password must be 8-64 characters, include a letter and a number",
    });
  }
  // Hash password
  const passwordHash = await bcrypt.hash(password, 12);
  try {
    await db.insert(usersTable).values({ username, passwordHash });
    // Issue JWT on signup
    const config = await loadAppConfig();
    if (!config?.privateKey) {
      return res.status(500).json({
        error: "JWT private key not found in config. Please run setup.",
      });
    }
    const token = jwt.sign({ username }, config.privateKey, {
      algorithm: "RS256",
      expiresIn: "7d",
    });
    return res.json({ success: true, token });
  } catch (err: any) {
    if (err && err.cause.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(409).json({ error: "Username already exists." });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/auth/api/login", async (req, res) => {
  const { username, password } = req.body;
  function validateUsername(username: string) {
    return /^[a-z0-9_]{3,32}$/.test(username);
  }
  function validatePassword(password: string) {
    return /^(?=.*[a-zA-Z])(?=.*\d).{8,64}$/.test(password);
  }
  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required." });
  }
  if (!validateUsername(username)) {
    return res
      .status(400)
      .json({ error: "Username must be 3-32 characters, a-z, 0-9, or _" });
  }
  if (!validatePassword(password)) {
    return res.status(400).json({
      error: "Password must be 8-64 characters, include a letter and a number",
    });
  }
  const allUsersLogin = await db.select().from(usersTable).all();
  const user = allUsersLogin.find((u) => u.username === username);
  if (!user) {
    return res.status(401).json({ error: "Invalid username or password." });
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: "Invalid username or password." });
  }
  // Issue JWT on login
  const config = await loadAppConfig();
  if (!config?.privateKey) {
    return res.status(500).json({
      error: "JWT private key not found in config. Please run setup.",
    });
  }
  const token = jwt.sign({ username }, config.privateKey, {
    algorithm: "RS256",
    expiresIn: "7d",
  });
  res.json({ success: true, token });
});
// Generate and return a new keypair
app.post("/auth/api/keys/generate", (_req, res) => {
  const { privateKey, publicKey } = generateKeypair();
  res.json({ privateKey, publicKey });
});
// Trust proxy headers (needed for correct protocol detection behind Cloudflare Tunnel or reverse proxies)
app.set("trust proxy", true);

function generateKeypair() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });
  return { privateKey, publicKey };
}

app.use(express.json());

// App config endpoints
app.get("/auth/api/app-config", async (_req, res) => {
  const config = await loadAppConfig();
  if (!config) return res.status(404).json({ error: "No config found" });
  // Never expose privateKey
  const { privateKey, ...safeConfig } = config;
  res.json({ ...safeConfig, publicKey: config.publicKey });
});

// Expose public key only
app.get("/auth/api/public-key", async (_req, res) => {
  const config = await loadAppConfig();
  if (!config?.publicKey)
    return res.status(404).json({ error: "No public key found" });
  res.type("text/plain").send(config.publicKey);
});

app.post("/auth/api/app-config", async (req, res) => {
  if (await loadAppConfig()) {
    return res
      .status(403)
      .json({ error: "Config already exists. Overriding is not allowed." });
  }
  const { appName, description, logoUrl, privateKey, publicKey } = req.body;
  if (!appName) return res.status(400).json({ error: "appName is required" });
  // Validate keys if provided
  if (privateKey && publicKey) {
    try {
      crypto.createPrivateKey({
        key: privateKey,
        format: "pem",
        type: "pkcs8",
      });
    } catch (e) {
      return res.status(400).json({ error: "Invalid private key." });
    }
    try {
      crypto.createPublicKey({ key: publicKey, format: "pem", type: "spki" });
    } catch (e) {
      return res.status(400).json({ error: "Invalid public key." });
    }
  }
  await saveAppConfig({ appName, description, logoUrl, privateKey, publicKey });
  res.json({ success: true });
});

// Only listen if not imported as middleware (i.e., if run as entrypoint)
if (import.meta.main) {
  // Run migrations programmatically using pushSQLiteSchema
  (async () => {
    try {
      const { pushSQLiteSchema } = await import("drizzle-kit/api");
      const { apply } = await pushSQLiteSchema(schema, db);
      await apply();
      console.log("Migrations applied successfully.");
    } catch (e) {
      console.error("Failed to run drizzle migrations:", e);
      process.exit(1);
    }
    app.use("/auth", express.static(path.join(__dirname, "dist")));
    const port = process.env.PORT ? Number(process.env.PORT) : 0;
    const server = app.listen(port, () => {
      const actualPort = (server.address() as any).port;
      console.log(`Server running at http://localhost:${actualPort}/auth`);
    });
  })();
}

export default app;
