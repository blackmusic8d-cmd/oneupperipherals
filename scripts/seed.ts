// One-time script: pushes the existing hardcoded products/categories into Supabase.
// Run once after setting up your Supabase project and tables:
//   npm run seed
// Safe to re-run — it skips rows that already exist.

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS } from '../src/data/initialData';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(url, key);

async function seed() {
  console.log('Seeding categories...');
  for (const c of INITIAL_CATEGORIES) {
    const { error } = await supabase.from('categories').upsert({
      id: c.id,
      name: c.name,
      slug: c.slug,
      icon_name: c.iconName,
      subcategories: c.subcategories,
    });
    if (error) console.error(`  category ${c.id} failed:`, error.message);
  }

  console.log('Seeding products...');
  for (const p of INITIAL_PRODUCTS) {
    const { error } = await supabase.from('products').upsert({
      id: p.id,
      name: p.name,
      slug: p.slug,
      category_id: p.categoryId,
      subcategory: p.subcategory,
      brand: p.brand,
      price: p.price,
      original_price: p.originalPrice,
      rating: p.rating,
      review_count: p.reviewCount,
      stock: p.stock,
      description: p.description,
      specifications: p.specifications,
      images: p.images,
      is_featured: p.isFeatured || false,
      is_best_seller: p.isBestSeller || false,
      is_new_arrival: p.isNewArrival || false,
      created_at: p.createdAt || new Date().toISOString(),
    });
    if (error) console.error(`  product ${p.id} failed:`, error.message);
  }

  console.log('Done. Products + categories are now in Supabase.');
}

seed();
