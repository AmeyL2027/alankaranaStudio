import { z } from 'zod';
import { categories } from '@/lib/products';

export const aiDescriptionInputSchema = z.object({
  name: z.string().trim().min(2).max(100),
  category: z.enum(categories),
  details: z.string().trim().max(350),
});
