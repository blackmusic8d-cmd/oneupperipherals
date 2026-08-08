import React from 'react';
import { Star, ShoppingCart, PhoneCall, Heart, Check, Sparkles, AlertTriangle, ArrowLeftRight } from 'lucide-react';
import { Product } from '../types';
import { formatPrice, buildSingleProductWhatsAppUrl } from '../utils/whatsapp';

interface ProductCardProps {
  product: Product;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  isInCart?: boolean;
  isInWishlist?: boolean;
  onToggleWishlist: (product: Product) => void;
  isComparing?: boolean;
  onToggleCompare?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelectProduct,
  onAddToCart,
  isInCart = false,
  isInWishlist = false,
  onToggleWishlist,
  isComparing = false,
  onToggleCompare,
}) => {
  const discountPercent =
    product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

  const whatsappUrl = buildSingleProductWhatsAppUrl(product, 1);

  // Split formatted price into currency and numerical string
  const formattedPriceNum = product.price.toLocaleString('en-IN');

  return (
    <div className={`bg-white p-4 rounded-xl shadow-xs border transition-all duration-200 flex flex-col justify-between group relative ${
      isComparing ? 'border-amber-500 ring-2 ring-amber-400/50 shadow-md' : 'border-gray-200 hover:border-amber-400 hover:shadow-md'
    }`}>
      {/* Badges Bar */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 items-start">
        {product.isBestSeller && (
          <span className="bg-amber-500 text-slate-900 font-bold text-[10px] px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" /> Best Seller
          </span>
        )}
        {discountPercent > 0 && (
          <span className="bg-red-600 text-white font-bold text-[10px] px-1.5 py-0.5 rounded shadow-sm">
            {discountPercent}% OFF
          </span>
        )}
      </div>

      {/* Top Right Actions (Wishlist & Compare) */}
      <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
        {onToggleCompare && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleCompare(product);
            }}
            className={`p-1.5 rounded-full backdrop-blur-md transition-all ${
              isComparing
                ? 'bg-amber-400 text-slate-900 font-bold'
                : 'bg-white/80 text-gray-400 hover:text-amber-600'
            } shadow-sm`}
            title={isComparing ? 'Remove from Comparison' : 'Add to Compare'}
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product);
          }}
          className={`p-1.5 rounded-full backdrop-blur-md transition-all ${
            isInWishlist ? 'bg-red-50 text-red-600' : 'bg-white/80 text-gray-400 hover:text-red-500'
          } shadow-sm`}
          title={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-red-500' : ''}`} />
        </button>
      </div>

      {/* Image Box */}
      <div
        onClick={() => onSelectProduct(product)}
        className="h-40 bg-gray-50 rounded flex items-center justify-center mb-4 p-2 cursor-pointer relative overflow-hidden"
      >
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80'}
          alt={product.name}
          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          {/* Brand */}
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
            {product.brand}
          </div>

          {/* Title */}
          <h4
            onClick={() => onSelectProduct(product)}
            className="text-sm font-medium line-clamp-2 leading-tight mb-2 text-gray-900 hover:text-amber-700 cursor-pointer transition-colors"
            title={product.name}
          >
            {product.name}
          </h4>

          {/* Rating */}
          <div className="flex items-center text-amber-400 text-xs mb-2">
            {'★'.repeat(Math.round(product.rating))}
            {'☆'.repeat(5 - Math.round(product.rating))}
            <span className="text-blue-500 ml-1 text-[10px]">({product.reviewCount})</span>
          </div>
        </div>

        {/* Footer Area with Price & Actions */}
        <div className="mt-auto pt-2">
          {/* Price */}
          <div className="flex items-baseline mb-3">
            <span className="text-xs align-top font-bold text-gray-900">₹</span>
            <span className="text-xl font-bold text-gray-900">{formattedPriceNum}</span>
            {product.originalPrice > product.price && (
              <span className="text-gray-400 text-xs line-through ml-2">
                ₹{product.originalPrice.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {/* Buttons */}
          <div className="space-y-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-amber-400 hover:bg-amber-500 py-2 rounded-full text-xs font-bold shadow-sm border border-amber-500 flex items-center justify-center gap-1 text-slate-900 transition-colors"
            >
              <PhoneCall className="w-3 h-3" /> Order on WhatsApp
            </a>

            <div className="flex gap-1.5">
              <button
                onClick={() => onAddToCart(product)}
                disabled={product.stock <= 0}
                className={`flex-1 py-1.5 rounded-full text-xs font-semibold flex items-center justify-center gap-1 transition-colors ${
                  isInCart
                    ? 'bg-gray-200 text-gray-800'
                    : 'bg-slate-800 hover:bg-slate-900 text-white'
                } ${product.stock <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <ShoppingCart className="w-3 h-3" />
                <span>{isInCart ? 'In Cart' : 'Add to Cart'}</span>
              </button>

              {onToggleCompare && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleCompare(product);
                  }}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition-colors flex items-center gap-1 cursor-pointer ${
                    isComparing
                      ? 'bg-amber-400 border-amber-500 text-slate-900'
                      : 'bg-gray-50 hover:bg-gray-100 border-gray-300 text-gray-700'
                  }`}
                  title={isComparing ? 'Selected for Compare' : 'Add to Compare'}
                >
                  <ArrowLeftRight className="w-3 h-3" />
                  <span className="hidden sm:inline">{isComparing ? 'Comparing' : 'Compare'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

