# DevSoc

Next.js website with MongoDB/Mongoose, an admin portal, and ImageKit uploads. Requires Node.js 24, pnpm 12, and MongoDB with replica-set support.

## Start locally

```powershell
pnpm install --frozen-lockfile
pnpm local:mongo
```

Keep MongoDB running. In another terminal:

```powershell
pnpm local:setup
pnpm db:init
pnpm dev
```

Open http://localhost:3000 or /admin. The generated local password is `devsoc-local-testing-only`. Local setup uses test ImageKit credentials; add your own `IMAGEKIT_*` values in `.env.local` to enable uploads.

A new database starts empty. Use admin to upload website images and manage community links, events, newsletters, and members. Existing configured databases keep their content.

## Commands

- `pnpm test`: run tests with local MongoDB running.
- `pnpm typecheck`: check TypeScript.
- `pnpm build` then `pnpm start`: build and run the production app locally.
- `pnpm admin:hash`: generate an admin password hash from stdin.

See [operations](docs/OPERATIONS.md) for configuration and [preview deployment](docs/PREVIEW_DEPLOYMENT.md) for Vercel setup.
