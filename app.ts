import { saveAppConfig, loadAppConfig } from "./src/lib/app-config";
import type { NextFunction, Request, Response } from "express";
import express from "express";
import path from "path";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi, { type SwaggerOptions } from "swagger-ui-express";

import { fileURLToPath } from "url";
import fs from "fs";
import pkg from "./package.json" assert { type: "json" };
import crypto from "crypto";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
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

function keysExist() {
  return fs.existsSync(PRIVATE_KEY_PATH) && fs.existsSync(PUBLIC_KEY_PATH);
}

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
 *         description: App config
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
 */

// App config endpoints
app.get("/auth/api/app-config", (_req, res) => {
  const config = loadAppConfig();
  if (!config) return res.status(404).json({ error: "No config found" });
  res.json(config);
});

app.post("/auth/api/app-config", (req, res) => {
  const { appName, description, logoUrl } = req.body;
  if (!appName) return res.status(400).json({ error: "appName is required" });
  saveAppConfig({ appName, description, logoUrl });
  res.json({ success: true });
});
app.post("/auth/api/keys/save", (req, res) => {
  const { privateKey, publicKey } = req.body;
  if (!privateKey || !publicKey) {
    return res
      .status(400)
      .json({ error: "Both privateKey and publicKey are required." });
  }
  saveKeys(privateKey, publicKey);
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
