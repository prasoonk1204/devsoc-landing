# DevSoc

Next.js website with MongoDB/Mongoose, an admin portal, and ImageKit uploads. Requires Node.js 24, pnpm 12, and MongoDB with replica-set support.

## Start locally with the preview environment

Keep preview credentials in the ignored `.env` file, with `MONGODB_DB=devsoc_preview` and `APP_ORIGIN=http://localhost:3000`. Keep production values separately in `.env.deployment`. Then run:

```powershell
pnpm install --frozen-lockfile
pnpm dev
```

## Isolated database tests

Local MongoDB is optional and used for the isolated database test suite. Development does not need local database files.

```powershell
pnpm install --frozen-lockfile
pnpm local:mongo
```

Keep MongoDB running. In another terminal:

```powershell
pnpm test
```

Tests create temporary databases and remove them afterward. Stop local MongoDB before removing its `.local-mongo` directory.

A new database starts empty. Use admin to upload website images and manage community links, events, newsletters, and members. Existing configured databases keep their content.

## Commands

- `pnpm test`: run tests with local MongoDB running.
- `pnpm typecheck`: check TypeScript.
- `pnpm build` then `pnpm start`: build and run the production app locally.
- `pnpm admin:hash`: generate an admin password hash from stdin.
