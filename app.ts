import bcrypt from "bcrypt";
import { db } from "./src/db/index";
import { usersTable } from "./src/db/schema";
import jwt from "jsonwebtoken";
// ...existing code...
import type { NextFunction, Request, Response } from "express";
import express from "express";
import path from "path";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi, { type SwaggerOptions } from "swagger-ui-express";
import { loadAppConfig, saveAppConfig } from "./src/lib/app-config";

import crypto from "crypto";
import fs from "fs";
import { fileURLToPath } from "url";
import pkg from "./package.json";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
/**
 * @swagger
 * /auth/api/signup:
 *   post:
 *     summary: Register a new user with username and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *       400:
 *         description: Missing username or password
 *       409:
 *         description: Username already exists
 */
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
    let privateKey;
    try {
      privateKey = fs.readFileSync(
        path.join(process.cwd(), "keys", "jwtRS256.key"),
        "utf8"
      );
    } catch (e) {
      return res
        .status(500)
        .json({ error: "JWT private key not found. Please run setup." });
    }
    const token = jwt.sign({ username }, privateKey, {
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

/**
 * @swagger
 * /auth/api/login:
 *   post:
 *     summary: Login with username and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 username:
 *                   type: string
 *       400:
 *         description: Missing username or password
 *       401:
 *         description: Invalid username or password
 */
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
  // TODO: Issue JWT or session here
  res.json({ success: true, username });
});
// Generate and return a new keypair
app.post("/auth/api/keys/generate", (_req, res) => {
  const { privateKey, publicKey } = generateKeypair();
  res.json({ privateKey, publicKey });
});
// Trust proxy headers (needed for correct protocol detection behind Cloudflare Tunnel or reverse proxies)
app.set("trust proxy", true);

// Swagger definition (servers will be set at runtime)
const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "@microh-lab/auth API",
    version: pkg.version,
    description: "API documentation for @microh-lab/auth",
  },
  servers: [],
};

const options: SwaggerOptions = {
  swaggerDefinition,
  apis: [path.join(__dirname, "app.ts")], // Path to the API docs
};

let swaggerSpec = swaggerJSDoc(options) as any;

// Middleware to update Swagger server URL dynamically
app.use((req: Request, _res: Response, next: NextFunction) => {
  if (!swaggerSpec.servers || swaggerSpec.servers.length === 0) {
    const proto = req.protocol;
    const host = req.get("host");
    swaggerSpec.servers = [
      {
        url: `${proto}://${host}`,
      },
    ];
  }
  next();
});

// --- JWT Keypair Setup Endpoints ---
const KEYS_DIR = path.resolve(process.cwd(), "keys");
const PRIVATE_KEY_PATH = path.join(KEYS_DIR, "jwtRS256.key");
const PUBLIC_KEY_PATH = path.join(KEYS_DIR, "jwtRS256.key.pub");

function saveKeys(privateKey: string, publicKey: string) {
  if (!fs.existsSync(KEYS_DIR)) fs.mkdirSync(KEYS_DIR);
  fs.writeFileSync(PRIVATE_KEY_PATH, privateKey, { mode: 0o600 });
  fs.writeFileSync(PUBLIC_KEY_PATH, publicKey, { mode: 0o644 });
}

function generateKeypair() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });
  saveKeys(privateKey, publicKey);
  return { privateKey, publicKey };
}

app.use(express.json());

// Place this after app is declared and before other route registrations
/**
 * @swagger
 * /auth/api/app-config:
 *   get:
 *     summary: Get app display config
 *     tags: [AppConfig]
 *     responses:
 *       200:
 *         description: App config (never includes privateKey)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 appName:
 *                   type: string
 *                 description:
 *                   type: string
 *                 logoUrl:
 *                   type: string
 *                 publicKey:
 *                   type: string
 *   post:
 *     summary: Save app display config
 *     tags: [AppConfig]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               appName:
 *                 type: string
 *               description:
 *                 type: string
 *               logoUrl:
 *                 type: string
 *               privateKey:
 *                 type: string
 *                 description: PEM-encoded private key (required only on first setup, never returned)
 *               publicKey:
 *                 type: string
 *                 description: PEM-encoded public key
 *     responses:
 *       200:
 *         description: Config saved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       403:
 *         description: Config already exists. Overriding is not allowed.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */

/**
 * @swagger
 * /auth/api/public-key:
 *   get:
 *     summary: Get the public key for JWT verification
 *     tags: [AppConfig]
 *     responses:
 *       200:
 *         description: PEM-encoded public key
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *       404:
 *         description: No public key found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */

// App config endpoints
app.get("/auth/api/app-config", (_req, res) => {
  const config = loadAppConfig();
  if (!config) return res.status(404).json({ error: "No config found" });
  // Optionally, load public key from disk if not present in config
  let publicKey = config.publicKey;
  if (!publicKey) {
    try {
      publicKey = fs.existsSync(PUBLIC_KEY_PATH)
        ? fs.readFileSync(PUBLIC_KEY_PATH, "utf8")
        : undefined;
    } catch {}
  }
  // Never expose privateKey
  const { privateKey, ...safeConfig } = config;
  res.json({ ...safeConfig, publicKey });
});

// Expose public key only
app.get("/auth/api/public-key", (_req, res) => {
  let publicKey = undefined;
  const config = loadAppConfig();
  if (config && config.publicKey) {
    publicKey = config.publicKey;
  } else if (fs.existsSync(PUBLIC_KEY_PATH)) {
    publicKey = fs.readFileSync(PUBLIC_KEY_PATH, "utf8");
  }
  if (!publicKey) return res.status(404).json({ error: "No public key found" });
  res.type("text/plain").send(publicKey);
});

app.post("/auth/api/app-config", (req, res) => {
  if (loadAppConfig()) {
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
  saveAppConfig({ appName, description, logoUrl, privateKey, publicKey });
  // Optionally, also save keys to disk if provided
  if (privateKey && publicKey) {
    saveKeys(privateKey, publicKey);
  }
  res.json({ success: true });
});

app.use(
  "/auth/api-docs",
  swaggerUi.serve,
  (req: Request, res: Response, next: NextFunction) => {
    const proto = req.protocol;
    const host = req.get("host");
    swaggerSpec.servers = [
      {
        url: `${proto}://${host}`,
      },
    ];
    swaggerUi.setup(swaggerSpec)(req, res, next);
  }
);

/**
 * @swagger
 * /auth/api/hello:
 *   get:
 *     summary: Returns a greeting message
 *     responses:
 *       200:
 *         description: A greeting message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Hello from Chien Tran!
 */
app.get("/auth/api/hello", (_req: Request, res: Response) => {
  res.json({ message: "Hello from Chien Tran!" });
});

// Only listen if not imported as middleware (i.e., if run as entrypoint)
if (import.meta.main) {
  app.use("/auth", express.static(path.join(__dirname, "dist")));
  const port = process.env.PORT ? Number(process.env.PORT) : 0;
  const server = app.listen(port, () => {
    const actualPort = (server.address() as any).port;
    console.log(`Server running at http://localhost:${actualPort}/auth`);
    console.log(
      `Swagger UI available at http://localhost:${actualPort}/auth/api-docs`
    );
  });
}

export default app;
