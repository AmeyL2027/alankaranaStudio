# Alankarana Studio

A small full-stack product inspired by an independent jewellery business. Built using TypeScript, Next.js, Supabase Auth, PostgreSQL, and Vercel.

## What works
- Public catalogue with category filtering and search
- Email/password seller sign-up and sign-in
- Seller dashboard with inventory counts and low-stock alerts
- Create, edit, delete, publish, and unpublish jewellery
- Server-enforced ownership through PostgreSQL Row Level Security
- Responsive interface, basic validation, error and empty states

## Known limitations / next steps
- Images use externally hosted HTTPS URLs; add Supabase Storage uploads next
- No checkout or payment collection
- No password-reset UI, automated tests, or transactional stock reservations
- This is an MVP, not a production commerce system

## Local setup
1. Install Node.js 20+.
2. Create a Supabase project at https://supabase.com/dashboard.
3. Open SQL Editor and run `supabase/schema.sql`.
4. In Supabase > Project Settings > API (or Connect), copy the Project URL and publishable/anon key.
5. Copy `.env.example` to `.env.local`, then fill in both values. Never use the service_role key in a `NEXT_PUBLIC_` variable.
6. In Supabase > Authentication > URL Configuration, set Site URL to `http://localhost:3000` and add `http://localhost:3000/**` to redirect URLs.
7. Run `npm install`, then `npm run dev`.
8. Open http://localhost:3000, sign up, and add a jewellery item. If email confirmation is enabled, confirm using the received email before signing in.

## Vercel deployment
1. Push this folder to a public GitHub repository (do not commit `.env.local`).
2. In https://vercel.com/new choose **Import Git Repository** and select the repo.
3. Set environment variables `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to the same values used locally.
4. Deploy. Vercel gives you a `https://YOUR-APP.vercel.app` URL.
5. In Supabase > Authentication > URL Configuration, change Site URL to your deployed URL and add `https://YOUR-APP.vercel.app/**` as an allowed redirect URL. Keep localhost redirect for local development.
6. Open the deployed site, sign up/sign in, create a product, publish it, and verify it appears on the public storefront.

## Architecture decisions
- **Next.js:** React UI and deployable full-stack framework with minimal setup.
- **TypeScript:** Type safety and compliance with the take-home language constraint.
- **PostgreSQL:** Structured inventory data, database constraints, indexing, durable persistence.
- **Supabase Auth + RLS:** Managed credentials and database-enforced tenant isolation. The browser uses a publishable key; RLS—not secrecy of the key—protects writes.
- **Vercel:** Managed HTTPS hosting and GitHub-based continuous deployment.

## Trade-offs
The Supabase browser client directly reads/writes PostgreSQL through its authenticated API, with RLS as the security boundary. This keeps the MVP small. For a larger system, add server-side domain services for transactional workflows and audit logs. Inventory totals are calculated client-side because the dataset is small; pagination/aggregation would be appropriate at scale. External image URLs are not trusted for sensitive data; production systems should use an upload service and a strict image content policy.

