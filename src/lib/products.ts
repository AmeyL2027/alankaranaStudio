import { z } from 'zod';
export const categories = ['Necklaces', 'Earrings', 'Bracelets', 'Rings', 'Anklets', 'Sets'] as const;
export const productSchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().max(500),
  category: z.enum(categories),
  price_cents: z.number().int().min(0).max(100000000),
  stock: z.number().int().min(0).max(100000),
  image_url: z.union([z.literal(''), z.url().max(1000)]),
  published: z.boolean()
});
export type ProductInput = z.infer<typeof productSchema>;
export type Product = ProductInput & { id: string; owner_id: string; created_at: string };
export const money = (cents: number) => new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(cents / 100);
