import React, { useState, useEffect } from 'react';
import {
  X,
  Star,
  PhoneCall,
  ShoppingCart,
  Heart,
  Truck,
  ShieldCheck,
  Check,
  Share2,
  Sparkles,
  RotateCcw,
  AlertTriangle,
  MessageSquare,
  ThumbsUp,
  UserCheck,
  Send,
  ArrowLeftRight,
} from 'lucide-react';
import { Product, Review } from '../types';
import { formatPrice, buildSingleProductWhatsAppUrl, SHOP_WHATSAPP_NUMBER } from '../utils/whatsapp';
import { fetchProductReviews, submitProductReview } from '../services/api';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  isInCart?: boolean;
  isInWishlist?: boolean;
  onToggleWishlist: (product: Product) => void;
  isComparing?: boolean;
  onToggleCompare?: (product: Product) => void;
  relatedProducts: Product[];
  onSelectProduct: (p: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  isInCart = false,
  isInWishlist = false,
  onToggleWishlist,
  isComparing = false,
  onToggleCompare,
  relatedProducts,
  onSelectProduct,
}) => {
  const [selectedImgIndex, setSelectedImgIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [copiedLink, setCopiedLink] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newRating, setNewRating] = useState<number>(5);
  const [newReviewerName, setNewReviewerName] = useState<string>('');
  const [newComment, setNewComment] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState<string>('');

  useEffect(() => {
    fetchProductReviews(product.id).then((data) => setReviews(data));
  }, [product.id]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewerName.trim() || !newComment.trim()) return;
    setSubmittingReview(true);
    try {
      const added = await submitProductReview(product.id, {
        userName: newReviewerName,
        rating: newRating,
        comment: newComment,
      });
      setReviews([added, ...reviews]);
      setNewReviewerName('');
      setNewComment('');
      setNewRating(5);
      setReviewSuccessMsg('Thank you! Your review has been published.');
      setTimeout(() => setReviewSuccessMsg(''), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReview(false);
    }
  };

  const images = product.images && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80'];

  const discountPercent =
    product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

  const savingsAmount = product.originalPrice > product.price ? product.originalPrice - product.price : 0;

  const whatsappUrl = buildSingleProductWhatsAppUrl(product, quantity);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.origin + '/?product=' + product.id);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-gray-200 relative animate-in fade-in zoom-in duration-200">
        {/* Sticky Header Bar */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-4 sm:px-6 py-3 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
            <span className="text-amber-700 font-extrabold uppercase">{product.brand}</span>
            <span>/</span>
            <span>{product.subcategory}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors flex items-center gap-1 text-xs"
              title="Copy link"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">{copiedLink ? 'Copied!' : 'Share'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: Image Gallery (5 cols) */}
          <div className="md:col-span-5 flex flex-col gap-3">
            <div className="relative h-72 sm:h-80 bg-gray-50 border border-gray-200 rounded-xl overflow-hidden flex items-center justify-center p-4">
              <img
                src={images[selectedImgIndex]}
                alt={product.name}
                className="max-h-full max-w-full object-contain"
              />
              {discountPercent > 0 && (
                <span className="absolute top-3 left-3 bg-red-600 text-white font-black text-xs px-2 py-1 rounded shadow">
                  -{discountPercent}% OFF
                </span>
              )}
            </div>

            {/* Thumbnails list */}
            {images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImgIndex(idx)}
                    className={`w-14 h-14 rounded-lg border-2 overflow-hidden bg-gray-50 p-1 shrink-0 transition-all ${
                      selectedImgIndex === idx ? 'border-amber-500 ring-2 ring-amber-200' : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}

            {/* Guarantees Box */}
            <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-3 text-xs space-y-2 mt-2">
              <div className="flex items-center gap-2 text-amber-950 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Original Brand Warranty & Invoice</span>
              </div>
              <div className="flex items-center gap-2 text-amber-950 font-semibold">
                <Truck className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Express Shipping to Your Doorstep</span>
              </div>
              <div className="flex items-center gap-2 text-amber-950 font-semibold">
                <RotateCcw className="w-4 h-4 text-cyan-600 shrink-0" />
                <span>Safe Delivery Guarantee</span>
              </div>
            </div>
          </div>

          {/* Middle Column: Specs & Overview (4 cols) */}
          <div className="md:col-span-4 space-y-4">
            <div>
              <h1 className="text-lg sm:text-xl font-black text-gray-900 leading-snug">{product.name}</h1>
              <div className="flex items-center gap-2 mt-2 text-xs">
                <div className="flex items-center text-amber-500 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-1" />
                  <span>{product.rating}</span>
                </div>
                <span className="text-gray-500">({product.reviewCount} customer ratings)</span>
              </div>
            </div>

            <div className="border-t border-b border-gray-200 py-3 space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-gray-900">{formatPrice(product.price)}</span>
                {product.originalPrice > product.price && (
                  <span className="text-sm text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
                )}
              </div>
              {savingsAmount > 0 && (
                <p className="text-xs font-bold text-amber-800">
                  You Save: {formatPrice(savingsAmount)} ({discountPercent}%)
                </p>
              )}
              <p className="text-[11px] text-gray-500">Inclusive of all taxes</p>
            </div>

            {/* Specifications Table */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div className="space-y-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-gray-900">Key Specifications</h3>
                <div className="bg-gray-50 rounded-lg border border-gray-200 divide-y divide-gray-200 text-xs">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="p-2 grid grid-cols-3 gap-2">
                      <span className="font-semibold text-gray-600">{key}</span>
                      <span className="col-span-2 text-gray-900 font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="space-y-1">
              <h3 className="font-bold text-xs uppercase tracking-wider text-gray-900">About this Item</h3>
              <p className="text-xs text-gray-700 leading-relaxed">{product.description}</p>
            </div>
          </div>

          {/* Right Column: Amazon-Style Buy Box (3 cols) */}
          <div className="md:col-span-3 bg-gray-50 p-4 rounded-xl border border-gray-200 flex flex-col justify-between gap-4 h-fit">
            <div className="space-y-3 text-xs">
              <div className="text-lg font-black text-gray-900">{formatPrice(product.price)}</div>

              {/* Stock Indicator */}
              {product.stock > 0 ? (
                <div className="text-slate-900 font-bold flex items-center gap-1.5 text-xs bg-white p-2 rounded border border-slate-300">
                  <Check className="w-4 h-4 text-amber-500" />
                  <span>In Stock ({product.stock} available)</span>
                </div>
              ) : (
                <div className="text-red-700 font-bold flex items-center gap-1.5 text-xs bg-red-50 p-2 rounded border border-red-200">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span>Currently Out of Stock</span>
                </div>
              )}

              {/* Quantity Selector */}
              {product.stock > 0 && (
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Quantity:</label>
                  <select
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full bg-white border border-gray-300 rounded p-1.5 text-xs font-bold text-gray-800 focus:ring-1 focus:ring-amber-500"
                  >
                    {Array.from({ length: Math.min(product.stock, 10) }, (_, i) => i + 1).map((qty) => (
                      <option key={qty} value={qty}>
                        {qty}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Direct WhatsApp Order CTA */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-slate-900 font-extrabold py-3 px-3 rounded-lg text-xs flex items-center justify-center gap-2 shadow-md transition-all border border-amber-500"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Order on WhatsApp Now</span>
              </a>

              {/* Add to Cart CTA */}
              <button
                onClick={() => onAddToCart(product, quantity)}
                disabled={product.stock <= 0}
                className="w-full bg-[#ffd814] hover:bg-[#f7ca00] active:bg-[#f0b800] text-black font-extrabold py-2.5 px-3 rounded-lg text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>{isInCart ? 'Add More to Cart' : 'Add to Cart'}</span>
              </button>

              {/* Wishlist Button */}
              <button
                onClick={() => onToggleWishlist(product)}
                className="w-full border border-gray-300 bg-white hover:bg-gray-100 font-bold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-2 transition-all text-gray-700 cursor-pointer"
              >
                <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-red-500 text-red-500' : ''}`} />
                <span>{isInWishlist ? 'In Wishlist' : 'Add to Wishlist'}</span>
              </button>

              {/* Compare Button */}
              {onToggleCompare && (
                <button
                  onClick={() => onToggleCompare(product)}
                  className={`w-full border font-bold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isComparing
                      ? 'bg-amber-400 border-amber-500 text-slate-900'
                      : 'border-gray-300 bg-white hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <ArrowLeftRight className="w-4 h-4" />
                  <span>{isComparing ? 'Remove from Comparison' : 'Compare with another product'}</span>
                </button>
              )}
            </div>

            {/* Shop Details Info */}
            <div className="pt-3 border-t border-gray-200 text-[11px] text-gray-500 space-y-1">
              <p>
                <span className="font-semibold text-gray-700">Sold & Shipped by:</span> OneUpPeripherals
              </p>
              <p>
                <span className="font-semibold text-gray-700">Helpline:</span> +91 9862388771
              </p>
            </div>
          </div>
        </div>

        {/* Similar / Related Products */}
        {relatedProducts.length > 0 && (
          <div className="px-4 sm:px-6 pb-6 pt-2 border-t border-gray-200">
            <h3 className="font-bold text-sm text-gray-900 mb-3 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" /> Similar Products You Might Like
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {relatedProducts.slice(0, 4).map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => onSelectProduct(rel)}
                  className="bg-gray-50 border border-gray-200 p-2.5 rounded-lg hover:bg-amber-50 cursor-pointer transition-all flex flex-col justify-between text-xs"
                >
                  <img src={rel.images[0]} alt={rel.name} className="h-24 w-full object-contain mb-2" />
                  <div>
                    <p className="font-semibold text-gray-900 line-clamp-1">{rel.name}</p>
                    <p className="font-bold text-amber-800">{formatPrice(rel.price)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Customer Reviews & Star Ratings Section */}
        <div className="px-4 sm:px-6 pb-8 pt-4 border-t border-gray-200 bg-gray-50/50">
          <div className="flex flex-col md:flex-row items-start justify-between gap-6">
            
            {/* Reviews List Column */}
            <div className="flex-1 w-full space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-amber-500" />
                  <span>Customer Reviews ({reviews.length})</span>
                </h3>

                <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="font-extrabold text-sm text-gray-900">
                    {reviews.length > 0
                      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
                      : product.rating}
                  </span>
                  <span className="text-xs text-gray-500">/ 5.0</span>
                </div>
              </div>

              {reviews.length === 0 ? (
                <div className="bg-white p-6 rounded-xl border border-gray-200 text-center text-gray-500 text-xs">
                  <p className="font-semibold text-sm text-gray-700 mb-1">No reviews submitted yet</p>
                  <p>Be the first customer to share your feedback for {product.name}!</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-amber-100 text-amber-800 font-bold rounded-full flex items-center justify-center text-xs">
                            {rev.userName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 flex items-center gap-1">
                              {rev.userName}
                              {rev.verifiedPurchase && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] text-slate-800 bg-slate-100 border border-slate-300 px-1.5 py-0.2 rounded font-normal">
                                  <UserCheck className="w-3 h-3 text-amber-600" /> Verified Buyer
                                </span>
                              )}
                            </p>
                            <span className="text-[10px] text-gray-400">
                              {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                        </div>

                        {/* Rating Stars */}
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < rev.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <p className="text-gray-700 leading-relaxed text-xs">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Review Column */}
            <div className="w-full md:w-80 bg-white p-5 rounded-xl border border-gray-200 shadow-xs shrink-0 text-xs">
              <h4 className="font-bold text-sm text-gray-900 mb-3 flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>Write a Product Review</span>
              </h4>

              {reviewSuccessMsg && (
                <div className="mb-3 p-2.5 bg-slate-100 border border-slate-300 text-slate-900 rounded font-medium text-xs">
                  {reviewSuccessMsg}
                </div>
              )}

              <form onSubmit={handleReviewSubmit} className="space-y-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Your Rating</label>
                  <div className="flex items-center gap-1 cursor-pointer">
                    {[1, 2, 3, 4, 5].map((starVal) => (
                      <button
                        key={starVal}
                        type="button"
                        onClick={() => setNewRating(starVal)}
                        className="p-1 text-amber-400 focus:outline-none transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            starVal <= newRating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-amber-800 ml-1">
                      {newRating === 5 ? '5.0 Excellent' : newRating === 4 ? '4.0 Good' : `${newRating}.0`}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Samuel"
                    value={newReviewerName}
                    onChange={(e) => setNewReviewerName(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Review Comment *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Share your experience with quality, performance, or delivery..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <Send className="w-3.5 h-3.5 text-amber-400" />
                  <span>{submittingReview ? 'Submitting...' : 'Submit Review'}</span>
                </button>
              </form>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
