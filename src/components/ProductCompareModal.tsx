import React from 'react';
import { Product, CartItem } from '../types';
import { X, Check, ArrowLeftRight, Star, PhoneCall, ShoppingCart, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { formatPrice, buildSingleProductWhatsAppUrl } from '../utils/whatsapp';

interface ProductCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  product1: Product | null;
  product2: Product | null;
  allProducts: Product[];
  onSelectProduct1: (product: Product) => void;
  onSelectProduct2: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  cartItems: CartItem[];
}

export const ProductCompareModal: React.FC<ProductCompareModalProps> = ({
  isOpen,
  onClose,
  product1,
  product2,
  allProducts,
  onSelectProduct1,
  onSelectProduct2,
  onAddToCart,
  cartItems,
}) => {
  if (!isOpen) return null;

  // Combine spec keys from both products
  const specs1 = product1?.specifications || {};
  const specs2 = product2?.specifications || {};
  const allSpecKeys = Array.from(
    new Set([...Object.keys(specs1), ...Object.keys(specs2)])
  );

  const isProduct1InCart = product1 ? cartItems.some((item) => item.product.id === product1.id) : false;
  const isProduct2InCart = product2 ? cartItems.some((item) => item.product.id === product2.id) : false;

  // Determine better price / better rating
  let priceWinner: 'product1' | 'product2' | 'equal' | null = null;
  if (product1 && product2) {
    if (product1.price < product2.price) priceWinner = 'product1';
    else if (product2.price < product1.price) priceWinner = 'product2';
    else priceWinner = 'equal';
  }

  let ratingWinner: 'product1' | 'product2' | 'equal' | null = null;
  if (product1 && product2) {
    if (product1.rating > product2.rating) ratingWinner = 'product1';
    else if (product2.rating > product1.rating) ratingWinner = 'product2';
    else ratingWinner = 'equal';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-5xl my-auto overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-amber-400 p-2 rounded-xl text-slate-900 font-bold">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                Side-by-Side Product Comparison
              </h2>
              <p className="text-xs text-gray-400">
                Compare prices, specifications, ratings, and features
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Close Comparison"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* Selectors Bar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-amber-50/60 p-4 rounded-xl border border-amber-200">
            {/* Product 1 Selector */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Product 1
              </label>
              <select
                value={product1?.id || ''}
                onChange={(e) => {
                  const found = allProducts.find((p) => p.id === e.target.value);
                  if (found) onSelectProduct1(found);
                }}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="" disabled>Select first product to compare...</option>
                {allProducts.map((p) => (
                  <option key={`p1-${p.id}`} value={p.id}>
                    [{p.brand}] {p.name} - {formatPrice(p.price)}
                  </option>
                ))}
              </select>
            </div>

            {/* Product 2 Selector */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Product 2
              </label>
              <select
                value={product2?.id || ''}
                onChange={(e) => {
                  const found = allProducts.find((p) => p.id === e.target.value);
                  if (found) onSelectProduct2(found);
                }}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="" disabled>Select second product to compare...</option>
                {allProducts.map((p) => (
                  <option key={`p2-${p.id}`} value={p.id}>
                    [{p.brand}] {p.name} - {formatPrice(p.price)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {!product1 || !product2 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-800 mb-1">Select Two Products to Compare</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                Use the dropdown menus above or click "Compare" on any product card in the store to compare side-by-side.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Main Product Cards Side by Side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Column 1 */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs relative flex flex-col justify-between">
                  {priceWinner === 'product1' && (
                    <span className="absolute top-3 right-3 bg-emerald-600 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1 z-10">
                      <Sparkles className="w-3 h-3" /> Lower Price
                    </span>
                  )}
                  <div>
                    <div className="h-44 bg-gray-50 rounded-lg p-3 flex items-center justify-center mb-4 border border-gray-100">
                      <img
                        src={product1.images[0]}
                        alt={product1.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                      {product1.brand}
                    </span>
                    <h3 className="text-base font-bold text-gray-900 mt-2 line-clamp-2">
                      {product1.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">{product1.subcategory}</p>

                    {/* Price */}
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-2xl font-black text-gray-900">
                        {formatPrice(product1.price)}
                      </span>
                      {product1.originalPrice > product1.price && (
                        <span className="text-xs text-gray-400 line-through">
                          {formatPrice(product1.originalPrice)}
                        </span>
                      )}
                    </div>

                    {/* Rating */}
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex items-center text-amber-400 text-sm">
                        {'★'.repeat(Math.round(product1.rating))}
                        {'☆'.repeat(5 - Math.round(product1.rating))}
                      </div>
                      <span className="text-xs font-bold text-gray-700">
                        {product1.rating} / 5
                      </span>
                      <span className="text-xs text-gray-500">
                        ({product1.reviewCount} reviews)
                      </span>
                      {ratingWinner === 'product1' && (
                        <span className="bg-amber-100 text-amber-900 font-bold text-[10px] px-1.5 py-0.5 rounded ml-auto">
                          ★ Higher Rated
                        </span>
                      )}
                    </div>

                    {/* Stock Status */}
                    <div className="mt-3">
                      {product1.stock > 0 ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                          <Check className="w-3.5 h-3.5" /> In Stock ({product1.stock} units)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded-md border border-red-200">
                          Out of Stock
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 space-y-2 pt-4 border-t border-gray-100">
                    <a
                      href={buildSingleProductWhatsAppUrl(product1)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs border border-amber-500 transition-colors"
                    >
                      <PhoneCall className="w-3.5 h-3.5" /> Order on WhatsApp
                    </a>
                    <button
                      onClick={() => onAddToCart(product1)}
                      disabled={product1.stock <= 0}
                      className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                        isProduct1InCart
                          ? 'bg-gray-200 text-gray-800'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      } ${product1.stock <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>{isProduct1InCart ? 'In Cart' : 'Add to Cart'}</span>
                    </button>
                  </div>
                </div>

                {/* Column 2 */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs relative flex flex-col justify-between">
                  {priceWinner === 'product2' && (
                    <span className="absolute top-3 right-3 bg-emerald-600 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1 z-10">
                      <Sparkles className="w-3 h-3" /> Lower Price
                    </span>
                  )}
                  <div>
                    <div className="h-44 bg-gray-50 rounded-lg p-3 flex items-center justify-center mb-4 border border-gray-100">
                      <img
                        src={product2.images[0]}
                        alt={product2.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                      {product2.brand}
                    </span>
                    <h3 className="text-base font-bold text-gray-900 mt-2 line-clamp-2">
                      {product2.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">{product2.subcategory}</p>

                    {/* Price */}
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-2xl font-black text-gray-900">
                        {formatPrice(product2.price)}
                      </span>
                      {product2.originalPrice > product2.price && (
                        <span className="text-xs text-gray-400 line-through">
                          {formatPrice(product2.originalPrice)}
                        </span>
                      )}
                    </div>

                    {/* Rating */}
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex items-center text-amber-400 text-sm">
                        {'★'.repeat(Math.round(product2.rating))}
                        {'☆'.repeat(5 - Math.round(product2.rating))}
                      </div>
                      <span className="text-xs font-bold text-gray-700">
                        {product2.rating} / 5
                      </span>
                      <span className="text-xs text-gray-500">
                        ({product2.reviewCount} reviews)
                      </span>
                      {ratingWinner === 'product2' && (
                        <span className="bg-amber-100 text-amber-900 font-bold text-[10px] px-1.5 py-0.5 rounded ml-auto">
                          ★ Higher Rated
                        </span>
                      )}
                    </div>

                    {/* Stock Status */}
                    <div className="mt-3">
                      {product2.stock > 0 ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                          <Check className="w-3.5 h-3.5" /> In Stock ({product2.stock} units)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded-md border border-red-200">
                          Out of Stock
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 space-y-2 pt-4 border-t border-gray-100">
                    <a
                      href={buildSingleProductWhatsAppUrl(product2)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs border border-amber-500 transition-colors"
                    >
                      <PhoneCall className="w-3.5 h-3.5" /> Order on WhatsApp
                    </a>
                    <button
                      onClick={() => onAddToCart(product2)}
                      disabled={product2.stock <= 0}
                      className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                        isProduct2InCart
                          ? 'bg-gray-200 text-gray-800'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      } ${product2.stock <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>{isProduct2InCart ? 'In Cart' : 'Add to Cart'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Specifications Table */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
                <div className="bg-slate-900 text-white px-5 py-3 font-bold text-sm flex items-center justify-between">
                  <span>Detailed Technical Specifications</span>
                  <span className="text-xs font-normal text-amber-400">Key Features Breakdown</span>
                </div>

                <div className="divide-y divide-gray-200">
                  {allSpecKeys.length === 0 ? (
                    <div className="p-4 text-center text-xs text-gray-500">
                      No specific technical specifications recorded for these products.
                    </div>
                  ) : (
                    allSpecKeys.map((key, idx) => {
                      const val1 = specs1[key] || 'N/A';
                      const val2 = specs2[key] || 'N/A';
                      const isDifferent = val1 !== val2;

                      return (
                        <div
                          key={`spec-row-${key}`}
                          className={`grid grid-cols-1 md:grid-cols-3 text-xs p-3.5 gap-2 ${
                            idx % 2 === 0 ? 'bg-gray-50/70' : 'bg-white'
                          } ${isDifferent ? 'border-l-4 border-l-amber-500' : ''}`}
                        >
                          <div className="font-bold text-gray-700 md:col-span-1 flex items-center">
                            {key}
                          </div>
                          <div className="text-gray-900 font-medium md:col-span-1 bg-white md:bg-transparent p-1.5 md:p-0 rounded border md:border-none border-gray-200">
                            <span className="md:hidden font-bold text-gray-500 block text-[10px]">Product 1:</span>
                            {val1}
                          </div>
                          <div className="text-gray-900 font-medium md:col-span-1 bg-white md:bg-transparent p-1.5 md:p-0 rounded border md:border-none border-gray-200">
                            <span className="md:hidden font-bold text-gray-500 block text-[10px]">Product 2:</span>
                            {val2}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Descriptions Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div>
                  <h4 className="font-bold text-gray-800 mb-1">About {product1.name}</h4>
                  <p className="leading-relaxed">{product1.description}</p>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-1">About {product2.name}</h4>
                  <p className="leading-relaxed">{product2.description}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-gray-500">
            Tip: You can swap products using the dropdown selectors above at any time.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
};
