import { build } from "esbuild";
import path from "path";

const entry = path.resolve("app.ts");
const outfile = path.resolve("index.js");

build({
  entryPoints: [entry],
  outfile,
  bundle: true,
  platform: "node",
  target: ["node22"],
  format: "esm",
  sourcemap: true,
  external: [
    // Exclude native node modules and dependencies you don't want bundled
    "express",
    "swagger-ui-express",
    "swagger-jsdoc",
    "path",
    "url",
  ],
  banner: {
    js: '#!/usr/bin/env node\nimport { createRequire as __createRequire } from "module"; const require = __createRequire(import.meta.url);',
  },
})
  .then(() => {
    console.log("esbuild: Bundled app.ts to index.js");
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
