import React from 'react';
import { X, Heart, ShoppingCart, Trash2, PhoneCall } from 'lucide-react';
import { Product } from '../types';
import { formatPrice, buildSingleProductWhatsAppUrl } from '../utils/whatsapp';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistProducts: Product[];
  onRemoveFromWishlist: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  wishlistProducts,
  onRemoveFromWishlist,
  onAddToCart,
  onSelectProduct,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 bg-[#131921] text-white flex items-center justify-between border-b border-gray-800">
          <div className="flex items-center gap-2 font-bold text-sm">
            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
            <span>My Saved Wishlist ({wishlistProducts.length})</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-800 rounded-full text-gray-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wishlist Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 divide-y divide-gray-100">
          {wishlistProducts.length === 0 ? (
            <div className="py-16 text-center text-gray-500 space-y-3">
              <Heart className="w-12 h-12 mx-auto text-gray-300 stroke-1" />
              <p className="font-bold text-gray-700">Your wishlist is empty</p>
              <p className="text-xs">Click the heart icon on any product to save it for later!</p>
            </div>
          ) : (
            wishlistProducts.map((product) => (
              <div key={product.id} className="pt-3 flex gap-3 text-xs">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  onClick={() => {
                    onSelectProduct(product);
                    onClose();
                  }}
                  className="w-16 h-16 object-contain rounded bg-gray-50 border p-1 shrink-0 cursor-pointer"
                />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h4
                      onClick={() => {
                        onSelectProduct(product);
                        onClose();
                      }}
                      className="font-bold text-gray-900 line-clamp-2 hover:text-amber-800 cursor-pointer leading-tight"
                    >
                      {product.name}
                    </h4>
                    <span className="font-extrabold text-amber-800">{formatPrice(product.price)}</span>
                  </div>

                  <div className="flex items-center justify-between mt-2 gap-2">
                    <button
                      onClick={() => onAddToCart(product)}
                      className="bg-[#ffd814] hover:bg-[#f7ca00] text-black font-bold px-2.5 py-1 rounded text-[11px] flex items-center gap-1"
                    >
                      <ShoppingCart className="w-3 h-3" /> Add to Cart
                    </button>

                    <a
                      href={buildSingleProductWhatsAppUrl(product, 1)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#25D366] text-white font-bold px-2.5 py-1 rounded text-[11px] flex items-center gap-1"
                    >
                      <PhoneCall className="w-3 h-3" /> WhatsApp
                    </a>

                    <button
                      onClick={() => onRemoveFromWishlist(product)}
                      className="text-gray-400 hover:text-red-600 p-1"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
