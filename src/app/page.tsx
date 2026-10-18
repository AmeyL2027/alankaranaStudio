'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { filterAndSortProducts, type CatalogueSort } from '@/lib/catalogue';
import { categories, money, type Product } from '@/lib/products';
import { supabase } from '@/lib/supabase';

export default function Storefront() {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState<CatalogueSort>('newest');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    supabase().from('products').select('*').eq('published', true)
      .order('created_at', { ascending: false })
      .then(({ data, error: fetchError }) => {
        if (!active) return;
        if (fetchError) setError(fetchError.message);
        else setProducts((data ?? []) as Product[]);
        setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const filtered = useMemo(
    () => filterAndSortProducts(products, { query, category, inStockOnly, sort }),
    [products, query, category, inStockOnly, sort]
  );
  const hasFilters = Boolean(query.trim()) || category !== 'All' || inStockOnly;

  function clearFilters() {
    setQuery('');
    setCategory('All');
    setInStockOnly(false);
    setSort('newest');
  }

  return (
    <main>
      <header className="top">
        <Link className="brand" href="/">✦ Alankarana <span>Studio</span></Link>
        <nav><Link href="/login">Seller login →</Link></nav>
      </header>
      <section className="hero">
        <p className="eyebrow">CURATED WITH LOVE</p>
        <h1>Jewellery with a story.</h1>
        <p>Explore unique pieces from independent jewellery makers.</p>
        <a className="button" href="#collection">Explore collection</a>
      </section>
      <section className="container" id="collection">
        <div className="section-title">
          <div><p className="eyebrow">THE COLLECTION</p><h2>Find your next favourite</h2></div>
          <span aria-live="polite">{loading ? 'Loading…' : `${filtered.length} pieces`}</span>
        </div>
        <div className="filters catalogue-filters">
          <input aria-label="Search jewellery" placeholder="Search jewellery…" value={query} onChange={(e) => setQuery(e.target.value)} />
          <select aria-label="Category" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="All">All categories</option>
            {categories.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <select aria-label="Sort products" value={sort} onChange={(e) => setSort(e.target.value as CatalogueSort)}>
            <option value="newest">Newest first</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="name">Name: A to Z</option>
          </select>
        </div>
        <div className="catalogue-options">
          <label className="check"><input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} /> In stock only</label>
          {hasFilters && <button type="button" className="text-button" onClick={clearFilters}>Clear filters</button>}
        </div>
        {error && <p role="alert" className="error">Unable to load the collection: {error}</p>}
        {!error && loading && <div className="empty" role="status">Loading the collection…</div>}
        {!error && !loading && filtered.length === 0 && (
          <div className="empty">
            <p>{hasFilters ? 'No jewellery matches your filters.' : 'No jewellery has been published yet.'}</p>
            {hasFilters && <button type="button" className="text-button" onClick={clearFilters}>Show all jewellery</button>}
          </div>
        )}
        {!error && !loading && filtered.length > 0 && (
          <div className="cards">
            {filtered.map((product) => (
              <article className="product" key={product.id}>
                <div className="product-image">
                  {product.image_url ? <img src={product.image_url} alt={product.name} loading="lazy" referrerPolicy="no-referrer" /> : <span aria-hidden="true">✦</span>}
                </div>
                <div className="product-info">
                  <small>{product.category} · {product.stock > 0 ? `${product.stock} available` : 'Sold out'}</small>
                  <h3>{product.name}</h3><p>{product.description}</p>
                  <strong>{money(product.price_cents)}</strong>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
      <footer>✦ Alankarana Studio · Thoughtful jewellery, beautifully organized.</footer>
    </main>
  );
}
