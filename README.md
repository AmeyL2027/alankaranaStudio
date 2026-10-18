# Alankarana Studio

A TypeScript/Next.js jewellery storefront and seller inventory MVP, backed by Supabase Authentication and PostgreSQL. The seller can draft and publish product listings, manage inventory, and request editable product-description suggestions.

## Features

- Public catalogue with search, category filtering, sorting and stock visibility
- Seller authentication through Supabase
- Inventory create, edit, delete, publish and unpublish workflows
- PostgreSQL Row Level Security (RLS) to restrict product modifications to their owner
- Product-description generation API with two explicitly distinguished modes:
  - **Mock mode:** deterministic templates for free demonstration; **not a real AI model**
  - **Anthropic mode:** real Claude API integration, requiring an API key and paid API access
- Error recovery, loading and not-found pages

## Tech stack

Next.js (App Router), React, TypeScript, Supabase Auth, PostgreSQL, Zod and Vercel. The Anthropic SDK is used only when the real model integration is enabled.

## Local development

1. Install a Node.js version supported by the project's Next.js version.
2. Create a Supabase project and run `supabase/schema.sql` in its SQL Editor.
3. Create `.env.local` in the project root with:

   ```dotenv
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-PUBLISHABLE-OR-ANON-KEY
   ENABLE_MOCK_DESCRIPTIONS=true
   # Only required for real Claude requests:
   # ANTHROPIC_API_KEY=YOUR_KEY
   ANTHROPIC_MODEL=claude-haiku-4-5
   ```

4. Run `npm install`, `npm run typecheck`, `npm run build`, and `npm run dev`.
5. Open `http://localhost:3000`. Sign in and test creating, editing and publishing a product.
6. In the seller dashboard, generate a description and review it before saving.

The Supabase publishable/anon key is safe to expose to the browser **only with correct RLS policies**. Never expose a Supabase service-role key or an Anthropic key in `NEXT_PUBLIC_` variables. Never commit `.env.local`.

## Description generator modes

`ENABLE_MOCK_DESCRIPTIONS=true` uses the free template-based demo. This is **not LLM inference** and should be labeled accordingly in the interface and demonstrations.

`ENABLE_MOCK_DESCRIPTIONS=false` (or unset) calls Anthropic, provided `ANTHROPIC_API_KEY` is configured. API requests are made server-side. Seller authentication and input validation are required in both modes. Before opening real AI generation to untrusted public traffic, add persistent rate limiting, quotas and abuse monitoring.

## Vercel deployment

1. Connect the GitHub repository in Vercel and select the intended production branch (for this project, verify whether `develop` is configured as production).
2. Choose the **Next.js** framework preset.
3. Configure `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `ENABLE_MOCK_DESCRIPTIONS=true` under the appropriate Vercel environment.
4. Only add `ANTHROPIC_API_KEY` and `ANTHROPIC_MODEL` if real Claude generation will be used.
5. Deploy and copy the production URL.
6. In Supabase Authentication → URL Configuration, set the production Site URL and add the production URL to allowed redirects. Keep localhost redirects for local development.
7. Verify login, product CRUD, publication, catalogue search/sorting, and description generation on the deployed URL.

## Architecture and trade-offs

The browser uses the Supabase client for authenticated inventory operations; PostgreSQL RLS is the ownership boundary. The description-generation endpoint is a Next.js server route and does not send Anthropic credentials to the browser. Seller review is required before generated text is saved.

This is an MVP rather than a production commerce system. There is no checkout, payment processing, inventory reservation, password-reset UI, image upload pipeline or automated end-to-end test suite. Externally hosted image URLs are used instead of managed uploads. Real AI mode requires cost controls before public use.

## Manual release checklist

- `npm run typecheck` passes
- `npm run build` passes
- `.env.local` and other secrets are untracked
- Public users cannot change other sellers' inventory
- Unpublished products are not visible publicly
- Mock output is clearly identified as a demo
- Unknown routes show the custom 404 page
- Vercel deployment and Supabase redirects work
