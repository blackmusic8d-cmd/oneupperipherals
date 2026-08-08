import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  ShoppingCart,
  Heart,
  MapPin,
  Menu,
  ShieldCheck,
  PhoneCall,
  User,
  X,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { User as UserType, Category, Product, CartItem } from '../types';
import { SHOP_WHATSAPP_NUMBER } from '../utils/whatsapp';
import { Logo } from './Logo';

interface HeaderProps {
  categories: Category[];
  products: Product[];
  selectedCategoryId: string;
  onSelectCategory: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  cartItems: CartItem[];
  onOpenCart: () => void;
  wishlistCount: number;
  onOpenWishlist: () => void;
  currentUser: UserType | null;
  onOpenAuth: () => void;
  onSelectProduct: (product: Product) => void;
}

export const Header: React.FC<HeaderProps> = ({
  categories,
  products,
  selectedCategoryId,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  cartItems,
  onOpenCart,
  wishlistCount,
  onOpenWishlist,
  currentUser,
  onOpenAuth,
  onSelectProduct,
}) => {
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Live search suggestions
  const searchSuggestions = searchQuery.trim()
    ? products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.subcategory.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 6)
    : [];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSearchResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-slate-900 text-white select-none shadow-md border-b border-slate-800" id="header-root">
      {/* Top Bar */}
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 md:gap-6 h-16 shrink-0">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              onSelectCategory('');
              onSearchChange('');
            }}
            className="flex items-center group text-left focus:outline-none focus:ring-1 focus:ring-amber-400 p-1 rounded transition-opacity hover:opacity-95"
            title="OneUpPeripherals Home"
          >
            <Logo size="lg" />
          </button>
        </div>

        {/* Location Picker */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs hover:border-white border border-transparent p-1.5 rounded cursor-pointer transition-all">
          <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
          <div className="flex flex-col leading-tight">
            <span className="text-gray-400 text-[11px]">Deliver to</span>
            <span className="font-bold text-white">Aizawl 796001, Mizoram</span>
          </div>
        </div>

        {/* Search Bar */}
        <div
          ref={searchContainerRef}
          className="hidden md:flex flex-1 max-w-2xl relative items-center"
        >
          <div className="flex w-full rounded-md overflow-hidden bg-white text-gray-900 shadow-sm focus-within:ring-2 focus-within:ring-amber-400">
            {/* Category Filter Dropdown */}
            <select
              value={selectedCategoryId}
              onChange={(e) => onSelectCategory(e.target.value)}
              className="bg-gray-100 text-gray-700 px-3 text-sm border-r border-gray-200 focus:outline-none cursor-pointer max-w-[150px] truncate font-medium"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* Input */}
            <input
              type="text"
              placeholder="Search for laptops, monitors, accessories, IFB..."
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
              className="flex-1 px-4 py-2 text-gray-900 text-sm focus:outline-none placeholder-gray-400 bg-transparent"
            />

            {/* Clear button */}
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="px-2 text-gray-400 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Search Button */}
            <button
              onClick={() => setShowSearchResults(false)}
              className="bg-amber-400 hover:bg-amber-500 px-5 flex items-center justify-center transition-colors text-slate-900 font-bold"
              title="Search"
            >
              <Search className="w-5 h-5 text-slate-900" />
            </button>
          </div>

          {/* Live Search Auto-complete Dropdown */}
          {showSearchResults && searchSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white text-black rounded-md shadow-2xl border border-gray-200 z-50 overflow-hidden">
              <div className="bg-gray-50 px-3 py-1.5 text-xs font-bold text-gray-500 uppercase border-b border-gray-200">
                Matching Products ({searchSuggestions.length})
              </div>
              {searchSuggestions.map((product) => (
                <div
                  key={product.id}
                  onClick={() => {
                    onSelectProduct(product);
                    setShowSearchResults(false);
                  }}
                  className="flex items-center gap-3 px-3 py-2.5 hover:bg-amber-50 cursor-pointer border-b border-gray-100 transition-colors"
                >
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-10 h-10 object-contain rounded bg-gray-50 border p-1"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 truncate">{product.name}</p>
                    <div className="flex items-center gap-2 text-[11px] text-gray-500">
                      <span className="font-bold text-amber-700">₹{product.price.toLocaleString('en-IN')}</span>
                      <span>•</span>
                      <span>{product.brand}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Section Controls */}
        <div className="flex items-center gap-2 sm:gap-4 text-xs">
          {/* Mobile Search Toggle */}
          <button
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            className="md:hidden p-2 text-gray-200 hover:text-white"
            title="Toggle Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* WhatsApp Direct Help */}
          <a
            href={`https://wa.me/91${SHOP_WHATSAPP_NUMBER}?text=${encodeURIComponent('Hello OneUpPeripherals! I need help finding an item.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg transition-all shadow-sm"
            title="Order or Ask on WhatsApp"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">WhatsApp:</span>
            <span className="font-mono text-[11px]">9862388771</span>
          </a>

          {/* Wishlist */}
          <button
            onClick={onOpenWishlist}
            className="relative flex flex-col items-center justify-center p-1.5 hover:border-white border border-transparent rounded-lg cursor-pointer transition-all"
            title="View Wishlist"
          >
            <Heart className="w-5 h-5 text-amber-400" />
            <span className="text-[10px] hidden sm:inline text-gray-200 font-medium">Wishlist</span>
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-900 font-extrabold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Cart */}
          <button
            onClick={onOpenCart}
            className="relative flex items-center gap-1.5 p-1.5 hover:border-white border border-transparent rounded-lg cursor-pointer transition-all"
            title="Open Shopping Cart"
          >
            <div className="relative flex items-center">
              <ShoppingCart className="w-7 h-7 text-white" />
              <span className="bg-amber-400 text-slate-900 rounded-full w-5 h-5 flex items-center justify-center font-bold text-xs absolute -top-1 -right-1">
                {totalCartCount}
              </span>
            </div>
            <div className="hidden sm:flex flex-col text-left leading-tight pl-1">
              <span className="text-[10px] text-gray-400">Shopping</span>
              <span className="font-bold text-xs text-white">Cart</span>
            </div>
          </button>

          {/* User Account / Sign In */}
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 p-1.5 hover:border-white border border-transparent rounded-lg cursor-pointer transition-all"
            title={currentUser ? 'View Account & Profile' : 'Sign In / Register'}
          >
            <User className="w-5 h-5 text-amber-400" />
            <div className="hidden sm:flex flex-col text-left leading-tight">
              <span className="text-[10px] text-gray-400">
                {currentUser ? `Hello, ${currentUser.name.split(' ')[0]}` : 'Hello, Sign in'}
              </span>
              <span className="font-bold text-xs text-white">
                {currentUser ? 'Account' : 'Account & Wishlist'}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Search Bar Expansion */}
      {isMobileSearchOpen && (
        <div className="md:hidden px-3 py-2 bg-slate-900 border-t border-slate-800">
          <div className="flex items-center bg-white text-black border border-gray-300 rounded-md overflow-hidden">
            <input
              type="text"
              placeholder="Search products or brands..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full px-3 py-2 text-sm focus:outline-none bg-transparent text-gray-900"
            />
            {searchQuery && (
              <button onClick={() => onSearchChange('')} className="px-2 text-gray-400">
                <X className="w-4 h-4" />
              </button>
            )}
            <div className="bg-amber-400 p-2 text-slate-900">
              <Search className="w-4 h-4 text-slate-900" />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
