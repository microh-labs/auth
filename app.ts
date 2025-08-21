import type { NextFunction, Request, Response } from "express";
import express from "express";
import path from "path";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi, { type SwaggerOptions } from "swagger-ui-express";

import { fileURLToPath } from "url";
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
    version: "1.0.0",
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

app.use(
  "/api-docs",
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
 * /api/hello:
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
app.get("/api/hello", (_req: Request, res: Response) => {
  res.json({ message: "Hello from Chien Tran!" });
});

// Only listen if not imported as middleware (i.e., if run as entrypoint)
if (import.meta.main) {
  app.use(express.static(path.join(__dirname, "dist")));
  const port = process.env.PORT ? Number(process.env.PORT) : 0;
  const server = app.listen(port, () => {
    const actualPort = (server.address() as any).port;
    console.log(`Server running at http://localhost:${actualPort}`);
    console.log(
      `Swagger UI available at http://localhost:${actualPort}/api-docs`
    );
  });
}

export default app;
