This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Database Setup

This project uses **Prisma** for database management. The database provider is **PostgreSQL**.

### Local Development

For local development, the project is configured to use **SQLite** (file-based) via `.env.local`:
```bash
DATABASE_URL="file:./prisma/dev.db"
```

To set up locally:

```bash
# Install dependencies
npm install

# Run migrations against local SQLite
npx prisma migrate dev

# Seed the database with sample data
npx prisma db seed

# Start the dev server
npm run dev
```

The SQLite database file will be created at `prisma/dev.db` and persists between restarts.

### Production

Production uses **Prisma Postgres** (a managed PostgreSQL instance). The `DATABASE_URL` is set via environment variables on Vercel.

When deploying to Vercel:
1. Add the `DATABASE_URL` environment variable in your Vercel project settings (the Prisma Postgres connection string).
2. The `vercel.json` file automatically runs migrations and seeding on each deploy:
   ```json
   "installCommand": "npm install && npx prisma migrate deploy && npx prisma db seed"
   ```

### Switching Databases

- **Schema provider**: Currently set to `postgresql` in `prisma/schema.prisma`.
- **Local override**: `.env.local` uses SQLite for local development (set at project root).
- **Production**: Set `DATABASE_URL` to the Prisma Postgres connection string in Vercel's environment variables.

If you need to run a production build locally for testing:

```bash
# Set the DATABASE_URL to your Postgres connection string
$env:DATABASE_URL = 'prisma+postgres://accelerate.prisma-data.net/?api_key=...'

# Run the build
npm run build
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
