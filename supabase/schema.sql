-- Run in Supabase SQL Editor. RLS policies are essential; do not disable them.
create table if not exists public.products (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id) on delete cascade,
 name text not null check (char_length(name) between 2 and 100),
 description text not null default '' check (char_length(description) <= 500),
 category text not null check (category in ('Necklaces','Earrings','Bracelets','Rings','Anklets','Sets')),
 price_cents integer not null check (price_cents between 0 and 100000000),
 stock integer not null default 0 check (stock between 0 and 100000),
 image_url text not null default '' check (char_length(image_url) <= 1000),
 published boolean not null default false,
 created_at timestamptz not null default now()
);
create index if not exists products_owner_created_idx on public.products(owner_id, created_at desc);
create index if not exists products_public_idx on public.products(created_at desc) where published = true;
alter table public.products enable row level security;
drop policy if exists "Public can view published products; owners can view all theirs" on public.products;
create policy "Public can view published products; owners can view all theirs" on public.products for select to anon, authenticated using (published = true or (select auth.uid()) = owner_id);
drop policy if exists "Owners insert products" on public.products;
create policy "Owners insert products" on public.products for insert to authenticated with check ((select auth.uid()) = owner_id);
drop policy if exists "Owners update products" on public.products;
create policy "Owners update products" on public.products for update to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
drop policy if exists "Owners delete products" on public.products;
create policy "Owners delete products" on public.products for delete to authenticated using ((select auth.uid()) = owner_id);
