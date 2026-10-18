'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { categories, money, type Product } from '@/lib/products';
export default function Storefront() {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [error, setError] = useState('');
  useEffect(() => { let active = true; supabase().from('products').select('*').eq('published', true).order('created_at', { ascending: false }).then(({data,error}) => {if (!active) return; if(error) setError(error.message); else setProducts((data ?? []) as Product[]);}); return () => {active = false;}; }, []);
  const filtered = useMemo(() => products.filter(p => (category === 'All' || p.category === category) && `${p.name} ${p.description}`.toLowerCase().includes(query.toLowerCase())), [products, category, query]);
  return <main><header className="top"><Link className="brand" href="/">✦ Alankarana <span>Studio</span></Link><nav><Link href="/login">Seller login →</Link></nav></header>
    <section className="hero"><p className="eyebrow">CURATED WITH LOVE</p><h1>Jewellery with a story.</h1><p>Explore unique pieces from independent jewellery makers.</p><a className="button" href="#collection">Explore collection</a></section>
    <section className="container" id="collection"><div className="section-title"><div><p className="eyebrow">THE COLLECTION</p><h2>Find your next favourite</h2></div><span>{filtered.length} pieces</span></div>
      <div className="filters"><input aria-label="Search jewellery" placeholder="Search jewellery…" value={query} onChange={e => setQuery(e.target.value)}/><select aria-label="Category" value={category} onChange={e => setCategory(e.target.value)}><option>All</option>{categories.map(c => <option key={c}>{c}</option>)}</select></div>
      {error && <p role="alert" className="error">{error}</p>}
      {filtered.length === 0 ? <div className="empty">No jewellery found yet. Sellers can sign in and publish their first piece.</div> : <div className="cards">{filtered.map(p => <article className="product" key={p.id}><div className="product-image">{p.image_url ? <img src={p.image_url} alt={p.name} loading="lazy" referrerPolicy="no-referrer"/> : <span>✦</span>}</div><div className="product-info"><small>{p.category} · {p.stock > 0 ? `${p.stock} available` : 'Sold out'}</small><h3>{p.name}</h3><p>{p.description}</p><strong>{money(p.price_cents)}</strong></div></article>)}</div>}
    </section><footer>✦ Alankarana Studio · Thoughtful jewellery, beautifully organized.</footer></main>;
}
