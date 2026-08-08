import express, { Request, Response, Router } from 'express';
import bcrypt from 'bcryptjs';
import { getSupabaseClient } from './supabaseClient';
import { Product, Category, Order, OrderStatus } from '../types';

// ---------- Row <-> App type mapping ----------
// Supabase/Postgres columns are snake_case; the app's TS types are camelCase.

function rowToProduct(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    categoryId: row.category_id,
    subcategory: row.subcategory,
    brand: row.brand,
    price: Number(row.price),
    originalPrice: Number(row.original_price),
    rating: Number(row.rating),
    reviewCount: row.review_count,
    stock: row.stock,
    description: row.description,
    specifications: row.specifications || {},
    images: row.images || [],
    isFeatured: row.is_featured,
    isBestSeller: row.is_best_seller,
    isNewArrival: row.is_new_arrival,
    createdAt: row.created_at,
  };
}

function rowToCategory(row: any): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    iconName: row.icon_name,
    subcategories: row.subcategories || [],
  };
}

function rowToOrder(row: any): Order {
  return {
    id: row.id,
    orderNumber: row.order_number,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerAddress: row.customer_address,
    items: row.items || [],
    totalAmount: Number(row.total_amount),
    status: row.status,
    createdAt: row.created_at,
    notes: row.notes,
    paymentMethod: row.payment_method,
  };
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function createApiRouter(): Router {
  const router = express.Router();
  const supabase = getSupabaseClient();

  // ---------------- Health ----------------
  router.get('/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      storeName: 'OneUpPeripherals',
      whatsapp: '9862388771',
      email: '1upperipherals@gmail.com',
    });
  });

  // ---------------- Admin Auth ----------------
  // Real credentials live only in environment variables (never in frontend code).
  router.post('/auth/login', (req: Request, res: Response) => {
    const { username, password } = req.body;
    const adminUser = process.env.ADMIN_USERNAME || 'admin';
    const adminPass = process.env.ADMIN_PASSWORD;

    if (!adminPass) {
      return res.status(500).json({
        success: false,
        message: 'Admin password not configured on server. Set ADMIN_PASSWORD in environment variables.',
      });
    }

    if (username === adminUser && password === adminPass) {
      return res.json({
        success: true,
        token: 'admin-session-' + Date.now() + '-' + Math.random().toString(36).slice(2),
        username: adminUser,
      });
    }
    return res.status(401).json({ success: false, message: 'Invalid username or password' });
  });

  // ---------------- User Auth ----------------
  router.post('/auth/user/register', async (req: Request, res: Response) => {
    const { name, email, password, phone, address } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (existing) {
      return res.status(400).json({ message: 'Account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = {
      id: 'user-' + Date.now(),
      name: String(name).trim(),
      email: normalizedEmail,
      password_hash: passwordHash,
      phone: phone || '',
      address: address || '',
      wishlist_product_ids: [],
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('users').insert(newUser);
    if (error) return res.status(500).json({ message: error.message });

    const { password_hash, ...userWithoutPassword } = newUser;
    return res.status(201).json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        address: newUser.address,
        wishlistProductIds: [],
        createdAt: newUser.created_at,
      },
    });
  });

  router.post('/auth/user/login', async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    return res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        wishlistProductIds: user.wishlist_product_ids || [],
        createdAt: user.created_at,
      },
    });
  });

  router.put('/auth/user/profile', async (req: Request, res: Response) => {
    const { userId, name, phone, address, wishlistProductIds } = req.body;
    if (!userId) return res.status(400).json({ message: 'userId is required' });

    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (address !== undefined) updates.address = address;
    if (Array.isArray(wishlistProductIds)) updates.wishlist_product_ids = wishlistProductIds;

    const { data, error } = await supabase.from('users').update(updates).eq('id', userId).select().maybeSingle();
    if (error) return res.status(500).json({ message: error.message });
    if (!data) return res.status(404).json({ message: 'User not found' });

    return res.json({
      success: true,
      user: {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        wishlistProductIds: data.wishlist_product_ids || [],
        createdAt: data.created_at,
      },
    });
  });

  // ---------------- Reviews ----------------
  router.get('/products/:id/reviews', async (req: Request, res: Response) => {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', req.params.id)
      .order('created_at', { ascending: false });
    if (error) return res.status(500).json({ message: error.message });
    res.json(
      (data || []).map((r: any) => ({
        id: r.id,
        productId: r.product_id,
        userName: r.user_name,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.created_at,
        verifiedPurchase: r.verified_purchase,
      }))
    );
  });

  router.post('/products/:id/reviews', async (req: Request, res: Response) => {
    const { userName, rating, comment } = req.body;
    const productId = req.params.id;
    if (!userName || !rating || !comment) {
      return res.status(400).json({ message: 'User name, rating, and review comment are required' });
    }

    const newReview = {
      id: 'rev-' + Date.now(),
      product_id: productId,
      user_name: String(userName).trim(),
      rating: Number(rating),
      comment: String(comment).trim(),
      created_at: new Date().toISOString(),
      verified_purchase: true,
    };

    const { error: insertErr } = await supabase.from('reviews').insert(newReview);
    if (insertErr) return res.status(500).json({ message: insertErr.message });

    // Recalculate product rating & reviewCount
    const { data: allReviews } = await supabase.from('reviews').select('rating').eq('product_id', productId);
    if (allReviews && allReviews.length > 0) {
      const avg = allReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / allReviews.length;
      await supabase
        .from('products')
        .update({ rating: Number(avg.toFixed(1)), review_count: allReviews.length })
        .eq('id', productId);
    }

    res.status(201).json({
      id: newReview.id,
      productId: newReview.product_id,
      userName: newReview.user_name,
      rating: newReview.rating,
      comment: newReview.comment,
      createdAt: newReview.created_at,
      verifiedPurchase: newReview.verified_purchase,
    });
  });

  // ---------------- Products ----------------
  router.get('/products', async (req: Request, res: Response) => {
    const { category, subcategory, brand, search, minPrice, maxPrice, sort, inStock } = req.query;
    let query = supabase.from('products').select('*');

    if (category) query = query.eq('category_id', String(category));
    if (subcategory) query = query.ilike('subcategory', String(subcategory));
    if (brand) {
      const brandList = String(brand).split(',').map((b) => b.trim());
      query = query.in('brand', brandList);
    }
    if (search) {
      const q = String(search);
      query = query.or(
        `name.ilike.%${q}%,brand.ilike.%${q}%,subcategory.ilike.%${q}%,description.ilike.%${q}%`
      );
    }
    if (minPrice) query = query.gte('price', Number(minPrice));
    if (maxPrice) query = query.lte('price', Number(maxPrice));
    if (inStock === 'true') query = query.gt('stock', 0);

    if (sort === 'price-low') query = query.order('price', { ascending: true });
    else if (sort === 'price-high') query = query.order('price', { ascending: false });
    else if (sort === 'rating') query = query.order('rating', { ascending: false });
    else if (sort === 'newest') query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) return res.status(500).json({ message: error.message });

    const products = (data || []).map(rowToProduct);
    res.json({ products, total: products.length });
  });

  router.get('/products/:id', async (req: Request, res: Response) => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .or(`id.eq.${req.params.id},slug.eq.${req.params.id}`)
      .maybeSingle();
    if (!data) return res.status(404).json({ message: 'Product not found' });
    res.json(rowToProduct(data));
  });

  router.post('/products', async (req: Request, res: Response) => {
    const body = req.body;
    if (!body.name || !body.price || !body.categoryId) {
      return res.status(400).json({ message: 'Name, price, and category are required' });
    }

    const row = {
      id: 'p-' + Date.now(),
      name: String(body.name).trim(),
      slug: slugify(body.slug || body.name),
      category_id: body.categoryId,
      subcategory: body.subcategory || 'General',
      brand: body.brand || 'Generic',
      price: Number(body.price),
      original_price: Number(body.originalPrice || body.price),
      rating: Number(body.rating || 4.5),
      review_count: Number(body.reviewCount || 1),
      stock: Number(body.stock ?? 10),
      description: body.description || '',
      specifications: body.specifications || {},
      images:
        Array.isArray(body.images) && body.images.length > 0
          ? body.images
          : ['https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80'],
      is_featured: Boolean(body.isFeatured),
      is_best_seller: Boolean(body.isBestSeller),
      is_new_arrival: true,
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('products').insert(row);
    if (error) return res.status(500).json({ message: error.message });
    res.status(201).json(rowToProduct(row));
  });

  router.put('/products/:id', async (req: Request, res: Response) => {
    const body = req.body;
    const updates: any = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.categoryId !== undefined) updates.category_id = body.categoryId;
    if (body.subcategory !== undefined) updates.subcategory = body.subcategory;
    if (body.brand !== undefined) updates.brand = body.brand;
    if (body.price !== undefined) updates.price = Number(body.price);
    if (body.originalPrice !== undefined) updates.original_price = Number(body.originalPrice);
    if (body.stock !== undefined) updates.stock = Number(body.stock);
    if (body.description !== undefined) updates.description = body.description;
    if (body.specifications !== undefined) updates.specifications = body.specifications;
    if (body.images !== undefined) updates.images = body.images;
    if (body.isFeatured !== undefined) updates.is_featured = Boolean(body.isFeatured);
    if (body.isBestSeller !== undefined) updates.is_best_seller = Boolean(body.isBestSeller);

    const { data, error } = await supabase.from('products').update(updates).eq('id', req.params.id).select().maybeSingle();
    if (error) return res.status(500).json({ message: error.message });
    if (!data) return res.status(404).json({ message: 'Product not found' });
    res.json(rowToProduct(data));
  });

  router.delete('/products/:id', async (req: Request, res: Response) => {
    const { data, error } = await supabase.from('products').delete().eq('id', req.params.id).select().maybeSingle();
    if (error) return res.status(500).json({ message: error.message });
    if (!data) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted successfully', deletedId: data.id });
  });

  router.post('/products/bulk', async (req: Request, res: Response) => {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Items array is required' });
    }

    const { data: existingProducts } = await supabase.from('products').select('name');
    const existingNames = new Set((existingProducts || []).map((p: any) => p.name.toLowerCase()));

    let addedCount = 0;
    let skippedCount = 0;
    const rows: any[] = [];

    for (const item of items) {
      if (!item.name || !item.price || existingNames.has(String(item.name).toLowerCase())) {
        skippedCount++;
        continue;
      }
      rows.push({
        id: 'p-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        name: String(item.name).trim(),
        slug: slugify(item.name),
        category_id: item.categoryId || 'computers-laptops',
        subcategory: item.subcategory || 'General',
        brand: item.brand || 'Generic',
        price: Number(item.price),
        original_price: Number(item.originalPrice || item.price),
        rating: 4.5,
        review_count: 1,
        stock: Number(item.stock ?? 10),
        description: item.description || '',
        specifications: typeof item.specifications === 'object' ? item.specifications : {},
        images:
          Array.isArray(item.images) && item.images.length > 0
            ? item.images
            : ['https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80'],
        created_at: new Date().toISOString(),
      });
      addedCount++;
    }

    if (rows.length > 0) {
      const { error } = await supabase.from('products').insert(rows);
      if (error) return res.status(500).json({ message: error.message });
    }

    res.json({
      message: `Bulk import completed. Added ${addedCount} products. Skipped ${skippedCount} duplicate/invalid entries.`,
      addedCount,
      skippedCount,
    });
  });

  // ---------------- Categories ----------------
  router.get('/categories', async (req: Request, res: Response) => {
    const { data, error } = await supabase.from('categories').select('*');
    if (error) return res.status(500).json({ message: error.message });
    res.json((data || []).map(rowToCategory));
  });

  router.post('/categories', async (req: Request, res: Response) => {
    const { name, subcategories, iconName } = req.body;
    if (!name) return res.status(400).json({ message: 'Category name is required' });

    const slug = slugify(name);
    const { data: existing } = await supabase.from('categories').select('id').eq('slug', slug).maybeSingle();
    if (existing) return res.status(400).json({ message: 'Category with this name already exists' });

    const row = {
      id: slug,
      name: String(name).trim(),
      slug,
      icon_name: iconName || 'Folder',
      subcategories: Array.isArray(subcategories) ? subcategories : [],
    };
    const { error } = await supabase.from('categories').insert(row);
    if (error) return res.status(500).json({ message: error.message });
    res.status(201).json(rowToCategory(row));
  });

  router.delete('/categories/:id', async (req: Request, res: Response) => {
    const { data, error } = await supabase.from('categories').delete().eq('id', req.params.id).select().maybeSingle();
    if (error) return res.status(500).json({ message: error.message });
    if (!data) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category deleted' });
  });

  // ---------------- Orders ----------------
  router.get('/orders', async (req: Request, res: Response) => {
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (error) return res.status(500).json({ message: error.message });
    res.json((data || []).map(rowToOrder));
  });

  router.post('/orders', async (req: Request, res: Response) => {
    const { customerName, customerPhone, customerAddress, items, totalAmount, notes } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order items are required' });
    }

    const row = {
      id: 'ord-' + Date.now(),
      order_number: 'OUP-' + Math.floor(1000 + Math.random() * 9000),
      customer_name: customerName || 'WhatsApp Customer',
      customer_phone: customerPhone || 'Not provided',
      customer_address: customerAddress || '',
      items,
      total_amount: Number(totalAmount || items.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0)),
      status: 'pending' as OrderStatus,
      created_at: new Date().toISOString(),
      notes: notes || 'Logged from WhatsApp order flow',
      payment_method: 'whatsapp_manual',
    };

    const { error } = await supabase.from('orders').insert(row);
    if (error) return res.status(500).json({ message: error.message });

    // Reduce stock for ordered items
    for (const item of items) {
      const { data: prod } = await supabase.from('products').select('stock').eq('id', item.productId).maybeSingle();
      if (prod) {
        const newStock = Math.max(0, prod.stock - item.quantity);
        await supabase.from('products').update({ stock: newStock }).eq('id', item.productId);
      }
    }

    res.status(201).json(rowToOrder(row));
  });

  router.patch('/orders/:id/status', async (req: Request, res: Response) => {
    const { status, notes } = req.body;
    const updates: any = {};
    if (status) updates.status = status;
    if (notes !== undefined) updates.notes = notes;

    const { data, error } = await supabase.from('orders').update(updates).eq('id', req.params.id).select().maybeSingle();
    if (error) return res.status(500).json({ message: error.message });
    if (!data) return res.status(404).json({ message: 'Order not found' });
    res.json(rowToOrder(data));
  });

  router.delete('/orders/:id', async (req: Request, res: Response) => {
    const { data, error } = await supabase.from('orders').delete().eq('id', req.params.id).select().maybeSingle();
    if (error) return res.status(500).json({ message: error.message });
    if (!data) return res.status(404).json({ message: 'Order not found' });
    res.json({ message: 'Order deleted' });
  });

  // ---------------- Stats ----------------
  router.get('/stats', async (req: Request, res: Response) => {
    const { data: products } = await supabase.from('products').select('stock');
    const { data: orders } = await supabase.from('orders').select('status,total_amount');

    const totalProducts = products?.length || 0;
    const lowStockCount = (products || []).filter((p: any) => p.stock <= 5).length;
    const totalOrders = orders?.length || 0;
    const totalRevenue = (orders || [])
      .filter((o: any) => o.status !== 'cancelled')
      .reduce((acc: number, o: any) => acc + Number(o.total_amount), 0);
    const pendingOrdersCount = (orders || []).filter((o: any) => o.status === 'pending').length;

    res.json({ totalProducts, totalOrders, lowStockCount, totalRevenue, pendingOrdersCount });
  });

  return router;
}
