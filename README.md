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

This project uses **Prisma** for database management with **SQLite** for local development.

### Local Development

For local development, the project uses **SQLite** (file-based database). Configuration is in `.env.local`:
```bash
DATABASE_URL="file:./prisma/dev.db"
```

To set up locally:

```bash
# Install dependencies
npm install

# Run migrations against local SQLite
npx prisma migrate dev

# Seed the database with sample data (40+ LEGO products)
npx prisma db seed

# Start the dev server
npm run dev
```

The SQLite database file will be created at `prisma/dev.db` and persists between restarts.

### Production / Vercel Deployment

For production on Vercel:
1. Add the `DATABASE_URL` environment variable in Vercel project settings
2. The `vercel.json` file automatically runs migrations and seeding on deploy:
   ```json
   "installCommand": "npm install && npx prisma migrate deploy && npx prisma db seed"
   ```

**Note:** Currently using SQLite for all environments. To use PostgreSQL on production, see advanced setup in `/docs` or contact the dev team.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
