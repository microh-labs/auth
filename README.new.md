# @microh-labs/auth

> Modern, secure authentication SPA and API for your apps. Built with React, Express, Drizzle ORM, shadcn/ui, and Vite.

---

## Features

- Username/password authentication with JWT (RS256, public/private key)
- Professional, responsive UI (shadcn/ui, React, Vite)
- Secure config, validation, and error handling
- Auto-migrating SQLite DB (Drizzle ORM)
- API docs (Swagger UI)

---

## Quick Start (End Users)

1. **Install:**
   ```sh
   npx @microh-labs/auth
   # or clone and run: pnpm install && pnpm build && node .
   ```
2. **First Run:**
   - Visit the setup page (`/setup`) to configure branding and upload/generate your JWT keypair.
3. **Sign Up/Login:**
   - Use the web UI to create your first user and log in.
4. **API Docs:**
   - Visit `/auth/api-docs` for Swagger API documentation.

---

## Developer Guide

### Local Development

```sh
pnpm install
pnpm dev
# Open http://localhost:5173
```

### Project Structure

- `src/pages/` — React pages (Auth, Profile, Setup, etc.)
- `src/db/` — Drizzle ORM schema and DB logic
- `app.ts` — Express backend (API, config, JWT, etc.)
- `drizzle.config.ts` — Drizzle ORM config
- `public/` — Static assets

### Database & Migrations

- Uses SQLite (`drizzle.db`)
- Migrations auto-run on server start (`drizzle-kit migrate`)
- To create a new migration:
  ```sh
  pnpm drizzle-kit generate:sqlite
  # or see Drizzle docs for details
  ```

### Linting & Build

```sh
pnpm lint
pnpm build
```

---

## Maintainers

- **Publishing:**
  - Update version in `package.json`
  - Build and publish to npm
- **Config:**
  - All app config (branding, keys) is stored in `auth-app-config.json`
- **Screenshots:**
  - See `/screenshots/` for UI previews
- **Entrypoint:**
  - `index.js` (CLI) and `app.ts` (server)
- **Drizzle ORM:**
  - See `drizzle.config.ts` and `/drizzle/` for schema/migrations

---

## License

MIT — Chien Tran, microh-labs
