import type { Product } from './products';

export type CatalogueSort = 'newest' | 'price-asc' | 'price-desc' | 'name';

export type CatalogueFilters = {
  query: string;
  category: string;
  inStockOnly: boolean;
  sort: CatalogueSort;
};

export function filterAndSortProducts(products: Product[], filters: CatalogueFilters): Product[] {
  const query = filters.query.trim().toLocaleLowerCase();
  const matching = products.filter((product) => {
    const matchesCategory = filters.category === 'All' || product.category === filters.category;
    const matchesStock = !filters.inStockOnly || product.stock > 0;
    const searchable = `${product.name} ${product.category} ${product.description}`.toLocaleLowerCase();
    return matchesCategory && matchesStock && searchable.includes(query);
  });

  return matching.sort((a, b) => {
    switch (filters.sort) {
      case 'price-asc': return a.price_cents - b.price_cents || a.name.localeCompare(b.name);
      case 'price-desc': return b.price_cents - a.price_cents || a.name.localeCompare(b.name);
      case 'name': return a.name.localeCompare(b.name);
      default: return Date.parse(b.created_at) - Date.parse(a.created_at);
    }
  });
}
