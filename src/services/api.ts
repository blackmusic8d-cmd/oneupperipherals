import { Product, Category, Order, FilterOptions, StoreStats, User, Review } from '../types';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES } from '../data/initialData';

export async function fetchProducts(filters?: FilterOptions): Promise<Product[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.categoryId) params.append('category', filters.categoryId);
    if (filters?.subcategory) params.append('subcategory', filters.subcategory);
    if (filters?.brands && filters.brands.length > 0) params.append('brand', filters.brands.join(','));
    if (filters?.searchQuery) params.append('search', filters.searchQuery);
    if (filters?.minPrice) params.append('minPrice', String(filters.minPrice));
    if (filters?.maxPrice) params.append('maxPrice', String(filters.maxPrice));
    if (filters?.inStockOnly) params.append('inStock', 'true');
    if (filters?.sortBy) params.append('sort', filters.sortBy);

    const res = await fetch(`/api/products?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch products');
    const data = await res.json();
    return data.products;
  } catch (err) {
    console.warn('API fetch failed, fallback to local dataset:', err);
    let list = [...INITIAL_PRODUCTS];
    if (filters?.categoryId) list = list.filter((p) => p.categoryId === filters.categoryId);
    if (filters?.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q));
    }
    return list;
  }
}

export async function fetchProductById(id: string): Promise<Product | null> {
  try {
    const res = await fetch(`/api/products/${id}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return INITIAL_PRODUCTS.find((p) => p.id === id || p.slug === id) || null;
  }
}

export async function createProduct(productData: Partial<Product>): Promise<Product> {
  const res = await fetch('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productData),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Failed to create product');
  }
  return await res.json();
}

export async function updateProduct(id: string, productData: Partial<Product>): Promise<Product> {
  const res = await fetch(`/api/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productData),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Failed to update product');
  }
  return await res.json();
}

export async function deleteProduct(id: string): Promise<void> {
  const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete product');
}

export async function bulkImportProducts(items: any[]): Promise<{ addedCount: number; skippedCount: number; message: string }> {
  const res = await fetch('/api/products/bulk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Failed to import bulk products');
  }
  return await res.json();
}

export async function fetchCategories(): Promise<Category[]> {
  try {
    const res = await fetch('/api/categories');
    if (!res.ok) throw new Error('Failed to fetch categories');
    return await res.json();
  } catch (err) {
    return INITIAL_CATEGORIES;
  }
}

export async function createCategory(name: string, subcategories: string[], iconName?: string): Promise<Category> {
  const res = await fetch('/api/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, subcategories, iconName }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Failed to create category');
  }
  return await res.json();
}

export async function deleteCategory(id: string): Promise<void> {
  const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete category');
}

export async function fetchOrders(): Promise<Order[]> {
  try {
    const res = await fetch('/api/orders');
    if (!res.ok) throw new Error('Failed to fetch orders');
    return await res.json();
  } catch (err) {
    return [];
  }
}

export async function logOrder(orderData: Partial<Order>): Promise<Order> {
  const res = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Failed to log order');
  }
  return await res.json();
}

export async function updateOrderStatus(id: string, status: string, notes?: string): Promise<Order> {
  const res = await fetch(`/api/orders/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, notes }),
  });
  if (!res.ok) throw new Error('Failed to update order status');
  return await res.json();
}

export async function deleteOrder(id: string): Promise<void> {
  const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete order');
}

export async function fetchStats(): Promise<StoreStats> {
  try {
    const res = await fetch('/api/stats');
    if (!res.ok) throw new Error('Failed to fetch stats');
    return await res.json();
  } catch (err) {
    return {
      totalProducts: 15,
      totalOrders: 2,
      lowStockCount: 2,
      totalRevenue: 58980,
      pendingOrdersCount: 1,
    };
  }
}

export async function adminLogin(username: string, password: string): Promise<boolean> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    if (data.success) {
      localStorage.setItem('oup_admin_token', data.token);
      return true;
    }
    return false;
  } catch (err) {
    console.error('Admin login request failed:', err);
    return false;
  }
}

export async function resetStoreData(): Promise<void> {
  await fetch('/api/seed/reset', { method: 'POST' });
}

// User Authentication API
export async function registerUser(userData: { name: string; email: string; password: string; phone?: string; address?: string }): Promise<User> {
  const res = await fetch('/api/auth/user/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Registration failed');
  }
  const data = await res.json();
  return data.user;
}

export async function loginUser(credentials: { email: string; password: string }): Promise<User> {
  const res = await fetch('/api/auth/user/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Login failed');
  }
  const data = await res.json();
  return data.user;
}

export async function updateUserProfile(profileData: { userId: string; name?: string; phone?: string; address?: string; wishlistProductIds?: string[] }): Promise<User> {
  const res = await fetch('/api/auth/user/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profileData),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Profile update failed');
  }
  const data = await res.json();
  return data.user;
}

// Reviews API
export async function fetchProductReviews(productId: string): Promise<Review[]> {
  try {
    const res = await fetch(`/api/products/${productId}/reviews`);
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    return [];
  }
}

export async function submitProductReview(productId: string, reviewData: { userName: string; rating: number; comment: string }): Promise<Review> {
  const res = await fetch(`/api/products/${productId}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reviewData),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Failed to submit review');
  }
  return await res.json();
}
