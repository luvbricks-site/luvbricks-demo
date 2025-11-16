# Copilot Instructions for lastluvbrickssite

## Project Overview
- This is a Next.js app using the `/src/app` directory structure and TypeScript.
- Data and business logic are organized in `/src/lib` and `/prisma/schema.prisma` (for database models).
- UI components are in `/src/components` and `/src/components/ui`.
- Pages are routed via `/src/app/[route]/page.tsx` (e.g., `/products/[slug]/page.tsx`).

## Key Workflows
- **Development:** Use `npm run dev` to start the local server (uses SQLite via `.env.local`).
- **Database:** 
  - **Local:** SQLite (`file:./prisma/dev.db`) configured in `.env.local`.
  - **Production:** Prisma Postgres configured via `DATABASE_URL` environment variable on Vercel.
  - Always run migrations after schema changes: `npx prisma migrate dev`
  - Seed with: `npx prisma db seed`

## Patterns & Conventions
- **Component Structure:** Prefer functional React components. Shared UI primitives are in `/src/components/ui`.
- **Routing:** Dynamic routes use `[slug]` folders. Example: `/src/app/products/[slug]/page.tsx`.
- **Database Access:** Use functions from `/src/lib/db.ts` for querying. Models are defined in Prisma schema.
- **Styling:** Global styles in `/src/app/globals.css`. Component styles use CSS modules or Tailwind (if present).
- **TypeScript:** All code is typed. Use interfaces/types from `/src/lib` or define locally.

## Integration Points
- **Prisma:** Database schema in `/prisma/schema.prisma`. Migrations in `/prisma/migrations`. Seed logic in `/prisma/seed.cjs`.
- **Next.js:** API routes and SSR/SSG logic can be added in `/src/app/api` (if present).
- **External Assets:** Images and brand assets in `/public/brand` and `/public/images`.

## Examples
- To add a new product page: create `/src/app/products/[slug]/page.tsx` and update database via Prisma.
- To add a new UI component: add to `/src/components` or `/src/components/ui` and import as needed.
- To update database schema: edit `/prisma/schema.prisma`, run migration, and update `/src/lib/db.ts` if needed.

## References
- See `/README.md` for basic setup and Next.js links.
- See `/prisma/schema.prisma` for data models.
- See `/src/lib` for business logic and helpers.
- See `/src/components` for UI patterns.

---

If any conventions or workflows are unclear, please ask for clarification or examples from the codebase.