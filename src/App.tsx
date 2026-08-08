import React, { useState, useEffect, useMemo } from 'react';
import {
  Header,
} from './components/Header';
import { CategoryNav } from './components/CategoryNav';
import { HeroBanner } from './components/HeroBanner';
import { ProductCard } from './components/ProductCard';
import { FilterSidebar } from './components/FilterSidebar';
import { ProductDetailModal } from './components/ProductDetailModal';
import { ProductCompareModal } from './components/ProductCompareModal';
import { CartDrawer } from './components/CartDrawer';
import { WishlistDrawer } from './components/WishlistDrawer';
import { UserAuthModal } from './components/UserAuthModal';
import { AdminPanel } from './components/AdminPanel';
import { Footer } from './components/Footer';

import { Product, Category, CartItem, FilterOptions, User } from './types';
import { fetchProducts, fetchCategories } from './services/api';
import {
  Sparkles,
  ShoppingBag,
  Filter,
  SlidersHorizontal,
  X,
  PhoneCall,
  Check,
  Zap,
  ArrowLeftRight,
} from 'lucide-react';
import { SHOP_WHATSAPP_NUMBER } from './utils/whatsapp';

export default function App() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter & Search State
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(250000);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating' | 'newest'>('featured');

  // Modals & Drawers
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Comparison State
  const [compareProducts, setCompareProducts] = useState<Product[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  const handleToggleCompare = (product: Product) => {
    setCompareProducts((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        return prev.filter((p) => p.id !== product.id);
      }
      if (prev.length >= 2) {
        // Replace second item if already 2 items
        return [prev[0], product];
      }
      return [...prev, product];
    });
  };

  // Current Logged-in User
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('oup_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('oup_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('oup_user');
    }
  }, [currentUser]);

  // Cart & Wishlist Persistent State
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('oup_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('oup_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Toast alert
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('oup_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('oup_wishlist', JSON.stringify(wishlistIds));
  }, [wishlistIds]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [catData, prodData] = await Promise.all([fetchCategories(), fetchProducts()]);
      setCategories(catData);
      setProducts(prodData);
    } catch (err) {
      console.error('Failed to load store data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Collect all available unique brands for filter
  const allAvailableBrands = useMemo(() => {
    const brandsSet = new Set<string>();
    products.forEach((p) => {
      if (p.brand) brandsSet.add(p.brand);
    });
    return Array.from(brandsSet).sort();
  }, [products]);

  // Filtered Products List
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category filter
      if (selectedCategoryId && p.categoryId !== selectedCategoryId) {
        return false;
      }
      // Subcategory filter
      if (selectedSubcategory && p.subcategory.toLowerCase() !== selectedSubcategory.toLowerCase()) {
        return false;
      }
      // Brand filter
      if (selectedBrands.length > 0 && !selectedBrands.includes(p.brand)) {
        return false;
      }
      // Price range
      if (minPrice && p.price < minPrice) return false;
      if (maxPrice && p.price > maxPrice) return false;

      // Stock filter
      if (inStockOnly && p.stock <= 0) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchBrand = p.brand.toLowerCase().includes(q);
        const matchSub = p.subcategory.toLowerCase().includes(q);
        const matchCat = p.categoryId.toLowerCase().includes(q);
        const matchDesc = p.description.toLowerCase().includes(q);
        if (!matchName && !matchBrand && !matchSub && !matchCat && !matchDesc) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'newest') return (b.createdAt || '').localeCompare(a.createdAt || '');
      return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    });
  }, [
    products,
    selectedCategoryId,
    selectedSubcategory,
    selectedBrands,
    searchQuery,
    minPrice,
    maxPrice,
    inStockOnly,
    sortBy,
  ]);

  // Wishlist Products List
  const wishlistProducts = useMemo(() => {
    return products.filter((p) => wishlistIds.includes(p.id));
  }, [products, wishlistIds]);

  // Handlers for Cart
  const handleAddToCart = (product: Product, quantity = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    showToast(`Added "${product.name.slice(0, 25)}..." to cart`);
  };

  const handleUpdateCartQuantity = (productId: string, delta: number) => {
    setCartItems((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // Wishlist Handler
  const handleToggleWishlist = (product: Product) => {
    setWishlistIds((prev) => {
      if (prev.includes(product.id)) {
        showToast('Removed from wishlist');
        return prev.filter((id) => id !== product.id);
      } else {
        showToast('Added to wishlist!');
        return [...prev, product.id];
      }
    });
  };

  const handleToggleBrandFilter = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const handleResetFilters = () => {
    setSelectedCategoryId('');
    setSelectedSubcategory('');
    setSelectedBrands([]);
    setSearchQuery('');
    setMinPrice(0);
    setMaxPrice(250000);
    setInStockOnly(false);
    setSortBy('featured');
  };

  // Related products for detail modal
  const relatedProducts = useMemo(() => {
    if (!selectedProduct) return [];
    return products.filter(
      (p) =>
        p.id !== selectedProduct.id &&
        (p.categoryId === selectedProduct.categoryId || p.brand === selectedProduct.brand)
    );
  }, [selectedProduct, products]);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans flex flex-col justify-between selection:bg-[#febd69] selection:text-black">
      {/* Header */}
      <Header
        categories={categories}
        products={products}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={(id) => setSelectedCategoryId(id)}
        searchQuery={searchQuery}
        onSearchChange={(q) => setSearchQuery(q)}
        cartItems={cartItems}
        onOpenCart={() => setIsCartOpen(true)}
        wishlistCount={wishlistIds.length}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onSelectProduct={(p) => setSelectedProduct(p)}
      />

      {/* Category Sub-header Nav */}
      <CategoryNav
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={(id) => setSelectedCategoryId(id)}
        selectedSubcategory={selectedSubcategory}
        onSelectSubcategory={(sub) => setSelectedSubcategory(sub)}
        selectedBrand={selectedBrands.length === 1 ? selectedBrands[0] : ''}
        onSelectBrand={(brand) => {
          if (!brand) setSelectedBrands([]);
          else setSelectedBrands([brand]);
        }}
      />

      {/* Hero Banner when no category/search filter is active */}
      {!selectedCategoryId && !searchQuery && selectedBrands.length === 0 && (
        <HeroBanner
          categories={categories}
          products={products}
          onSelectCategory={(id) => setSelectedCategoryId(id)}
          onSelectBrand={(brand) => setSelectedBrands([brand])}
          onSelectProduct={(p) => setSelectedProduct(p)}
        />
      )}

      {/* Toast Notification Popup */}
      {toastMessage && (
        <div className="fixed bottom-16 right-4 z-50 bg-gray-900 text-white font-bold text-xs px-4 py-3 rounded-xl shadow-2xl border border-amber-500/50 flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Store Content Layout */}
      <main className="max-w-[1500px] mx-auto px-4 py-6 flex-1 w-full">
        {/* Active Filter Chips & Breadcrumbs */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-gray-500 uppercase tracking-wider text-[11px]">
              Showing:
            </span>

            {selectedCategoryId ? (
              <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                Category: {categories.find((c) => c.id === selectedCategoryId)?.name}
                <button onClick={() => setSelectedCategoryId('')} className="hover:text-red-700">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ) : (
              <span className="bg-gray-100 text-gray-800 px-2.5 py-1 rounded-full font-bold">
                All Products
              </span>
            )}

            {selectedSubcategory && (
              <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                Sub: {selectedSubcategory}
                <button onClick={() => setSelectedSubcategory('')} className="hover:text-red-700">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedBrands.map((b) => (
              <span
                key={b}
                className="bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-full font-bold flex items-center gap-1"
              >
                Brand: {b}
                <button onClick={() => handleToggleBrandFilter(b)} className="hover:text-red-700">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {searchQuery && (
              <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                Search: "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="hover:text-red-700">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            <span className="text-gray-400 font-semibold">({filteredProducts.length} items found)</span>
          </div>

          {/* Controls: Mobile Filter Toggle & Sort Dropdown */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 text-xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filter</span>
            </button>

            <div className="flex items-center gap-1">
              <span className="text-gray-500 font-semibold text-[11px] hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-1 text-xs font-bold text-gray-800 focus:ring-1 focus:ring-amber-500 cursor-pointer"
              >
                <option value="featured">Featured Deals</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">New Arrivals</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content Columns: Left Sidebar (Desktop) + Right Grid */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block shrink-0 self-start sticky top-20">
            <FilterSidebar
              categories={categories}
              selectedCategoryId={selectedCategoryId}
              onSelectCategory={(id) => setSelectedCategoryId(id)}
              selectedSubcategory={selectedSubcategory}
              onSelectSubcategory={(sub) => setSelectedSubcategory(sub)}
              selectedBrands={selectedBrands}
              onToggleBrand={handleToggleBrandFilter}
              minPrice={minPrice}
              maxPrice={maxPrice}
              onPriceChange={(min, max) => {
                setMinPrice(min);
                setMaxPrice(max);
              }}
              inStockOnly={inStockOnly}
              onToggleInStock={() => setInStockOnly(!inStockOnly)}
              onResetFilters={handleResetFilters}
              allAvailableBrands={allAvailableBrands}
            />
          </div>

          {/* Product Grid */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="py-20 text-center space-y-3">
                <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="font-bold text-gray-600 text-sm">Loading electronics catalog...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-sm space-y-4">
                <ShoppingBag className="w-16 h-16 mx-auto text-gray-300" />
                <h3 className="text-lg font-bold text-gray-900">No matching products found</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Try adjusting your search query, clearing brand filters, or broadening your price range.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="bg-[#ffd814] hover:bg-[#f7ca00] text-black font-extrabold px-5 py-2.5 rounded-xl text-xs shadow-sm"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelectProduct={(p) => setSelectedProduct(p)}
                    onAddToCart={(p) => handleAddToCart(p)}
                    isInCart={cartItems.some((ci) => ci.product.id === product.id)}
                    isInWishlist={wishlistIds.includes(product.id)}
                    onToggleWishlist={(p) => handleToggleWishlist(p)}
                    isComparing={compareProducts.some((p) => p.id === product.id)}
                    onToggleCompare={(p) => handleToggleCompare(p)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Filter Drawer Overlay */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-start lg:hidden">
          <div className="w-80 bg-white h-full p-4 overflow-y-auto space-y-4 animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-extrabold text-sm text-gray-900">Filter Products</h3>
              <button onClick={() => setIsMobileFilterOpen(false)}>
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <FilterSidebar
              categories={categories}
              selectedCategoryId={selectedCategoryId}
              onSelectCategory={(id) => {
                setSelectedCategoryId(id);
                setIsMobileFilterOpen(false);
              }}
              selectedSubcategory={selectedSubcategory}
              onSelectSubcategory={(sub) => setSelectedSubcategory(sub)}
              selectedBrands={selectedBrands}
              onToggleBrand={handleToggleBrandFilter}
              minPrice={minPrice}
              maxPrice={maxPrice}
              onPriceChange={(min, max) => {
                setMinPrice(min);
                setMaxPrice(max);
              }}
              inStockOnly={inStockOnly}
              onToggleInStock={() => setInStockOnly(!inStockOnly)}
              onResetFilters={handleResetFilters}
              allAvailableBrands={allAvailableBrands}
            />
          </div>
        </div>
      )}

      {/* Floating Bottom Comparison Bar */}
      {compareProducts.length > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 max-w-xl w-[92%] sm:w-auto animate-bounce-short">
          <div className="flex items-center gap-2 overflow-hidden">
            {compareProducts.map((p) => (
              <div
                key={p.id}
                className="relative bg-white/10 rounded-lg p-1.5 flex items-center gap-2 border border-white/20 shrink-0"
              >
                <img
                  src={p.images[0]}
                  alt={p.name}
                  className="w-8 h-8 object-contain bg-white rounded"
                />
                <span className="text-xs font-bold truncate max-w-[100px] sm:max-w-[130px] hidden sm:inline">
                  {p.name}
                </span>
                <button
                  onClick={() => handleToggleCompare(p)}
                  className="text-gray-400 hover:text-white p-0.5"
                  title="Remove"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {compareProducts.length === 1 && (
              <span className="text-xs text-amber-400 font-semibold italic pl-1 hidden sm:inline">
                + Select 1 more to compare
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 ml-auto shrink-0">
            <button
              onClick={() => setIsCompareModalOpen(true)}
              className="bg-amber-400 hover:bg-amber-500 text-slate-900 font-extrabold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span>Compare ({compareProducts.length}/2)</span>
            </button>
            <button
              onClick={() => setCompareProducts([])}
              className="p-1.5 text-gray-400 hover:text-white"
              title="Clear Comparison"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={(p, qty) => handleAddToCart(p, qty)}
          isInCart={cartItems.some((ci) => ci.product.id === selectedProduct.id)}
          isInWishlist={wishlistIds.includes(selectedProduct.id)}
          onToggleWishlist={(p) => handleToggleWishlist(p)}
          isComparing={compareProducts.some((p) => p.id === selectedProduct.id)}
          onToggleCompare={(p) => handleToggleCompare(p)}
          relatedProducts={relatedProducts}
          onSelectProduct={(p) => setSelectedProduct(p)}
        />
      )}

      {/* Side-by-Side Product Comparison Modal */}
      <ProductCompareModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        product1={compareProducts[0] || null}
        product2={compareProducts[1] || null}
        allProducts={products}
        onSelectProduct1={(p) =>
          setCompareProducts((prev) => [p, prev[1]].filter(Boolean))
        }
        onSelectProduct2={(p) =>
          setCompareProducts((prev) => [prev[0], p].filter(Boolean))
        }
        onAddToCart={(p) => handleAddToCart(p)}
        cartItems={cartItems}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={() => setCartItems([])}
      />

      {/* Wishlist Drawer */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistProducts={wishlistProducts}
        onRemoveFromWishlist={(p) => handleToggleWishlist(p)}
        onAddToCart={(p) => handleAddToCart(p)}
        onSelectProduct={(p) => setSelectedProduct(p)}
      />

      {/* Customer Account & Wishlist Modal */}
      <UserAuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={(user) => setCurrentUser(user)}
        onLogout={() => setCurrentUser(null)}
        wishlistProducts={wishlistProducts}
        onRemoveWishlist={(productId) => {
          const prod = products.find((p) => p.id === productId);
          if (prod) handleToggleWishlist(prod);
        }}
        onAddToCart={(p) => handleAddToCart(p)}
      />

      {/* Admin Management Modal */}
      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onRefreshLiveStore={() => loadData()}
      />

      {/* Footer */}
      <Footer
        onSelectCategory={(id) => setSelectedCategoryId(id)}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />
    </div>
  );
}
