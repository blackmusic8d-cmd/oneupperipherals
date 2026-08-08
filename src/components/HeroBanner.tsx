import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, ArrowRight, PhoneCall, ShoppingCart, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { Category, Product } from '../types';
import { SHOP_WHATSAPP_NUMBER, buildSingleProductWhatsAppUrl } from '../utils/whatsapp';

interface HeroBannerProps {
  categories: Category[];
  products: Product[];
  onSelectCategory: (id: string) => void;
  onSelectBrand: (brand: string) => void;
  onSelectProduct: (product: Product) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  categories,
  products,
  onSelectCategory,
  onSelectBrand,
  onSelectProduct,
}) => {
  const featuredProducts = products.filter((p) => p.isFeatured || p.isBestSeller).length > 0
    ? products.filter((p) => p.isFeatured || p.isBestSeller)
    : products.slice(0, 6);

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const marqueeRef = useRef<HTMLDivElement>(null);

  // Auto slide interval for banner
  useEffect(() => {
    if (!isAutoScrolling || featuredProducts.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % featuredProducts.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [isAutoScrolling, featuredProducts.length]);

  const currentProduct = featuredProducts[currentSlideIndex] || products[0];

  return (
    <div className="relative bg-white pb-8 text-gray-900 pt-4">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6">

        {/* Auto-Scrolling Hero Banner Showcase */}
        <div 
          className="relative rounded-2xl overflow-hidden bg-amber-500/10 border border-amber-300/80 shadow-sm mb-8 group"
          onMouseEnter={() => setIsAutoScrolling(false)}
          onMouseLeave={() => setIsAutoScrolling(true)}
        >
          {/* Top Banner Control Header */}
          <div className="bg-amber-100/80 px-4 sm:px-6 py-2.5 border-b border-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-extrabold text-amber-900">
              <Sparkles className="w-4 h-4 text-amber-600 animate-pulse" />
              <span>FEATURED AUTO-SHOWCASE</span>
              <span className="bg-amber-200/80 text-amber-900 border border-amber-300 px-2 py-0.5 rounded text-[10px] font-bold">
                {isAutoScrolling ? 'Auto-Scrolling Active' : 'Paused on Hover'}
              </span>
            </div>

            {/* Slider Dots & Play/Pause */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsAutoScrolling(!isAutoScrolling)}
                className="text-gray-700 hover:text-gray-900 text-xs flex items-center gap-1 bg-white border border-gray-200 px-2 py-0.5 rounded font-semibold"
                title={isAutoScrolling ? 'Pause Auto Scroll' : 'Resume Auto Scroll'}
              >
                {isAutoScrolling ? <Pause className="w-3 h-3 text-amber-600" /> : <Play className="w-3 h-3 text-amber-600" />}
                <span className="hidden sm:inline">{isAutoScrolling ? 'Pause' : 'Play'}</span>
              </button>

              <div className="flex items-center gap-1.5">
                {featuredProducts.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlideIndex(idx)}
                    className={`h-2 rounded-full transition-all ${
                      currentSlideIndex === idx ? 'w-6 bg-amber-500' : 'w-2 bg-gray-300 hover:bg-amber-400'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Banner Main Slide Content */}
          {currentProduct && (
            <div className="p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-500">
              <div className="flex-1 max-w-2xl space-y-3 text-left">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800">
                  <span className="bg-amber-400/30 text-amber-950 px-2.5 py-1 rounded-md border border-amber-400/50 font-extrabold">
                    {currentProduct.brand}
                  </span>
                  <span className="text-gray-700">{currentProduct.subcategory}</span>
                  {currentProduct.isBestSeller && (
                    <span className="bg-red-600 text-white px-2 py-0.5 rounded text-[10px] font-bold">Best Seller</span>
                  )}
                </div>

                <h2 
                  onClick={() => onSelectProduct(currentProduct)}
                  className="text-xl sm:text-3xl md:text-4xl font-black text-gray-900 hover:text-amber-800 cursor-pointer transition-colors leading-snug line-clamp-2"
                >
                  {currentProduct.name}
                </h2>

                <p className="text-gray-600 text-xs sm:text-sm line-clamp-2 leading-relaxed font-medium">
                  {currentProduct.description}
                </p>

                <div className="flex items-baseline gap-3 pt-1">
                  <span className="text-2xl sm:text-3xl font-black text-amber-700">
                    ₹{currentProduct.price.toLocaleString('en-IN')}
                  </span>
                  {currentProduct.originalPrice > currentProduct.price && (
                    <span className="text-sm text-gray-400 line-through font-semibold">
                      ₹{currentProduct.originalPrice.toLocaleString('en-IN')}
                    </span>
                  )}
                  <span className="text-xs text-amber-900 font-extrabold bg-amber-200/80 px-2 py-0.5 rounded border border-amber-300">
                    Save ₹{(currentProduct.originalPrice - currentProduct.price).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-3">
                  <a
                    href={buildSingleProductWhatsAppUrl(currentProduct)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-amber-400 hover:bg-amber-500 text-slate-900 font-extrabold px-5 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2 text-xs sm:text-sm border border-amber-500"
                  >
                    <PhoneCall className="w-4 h-4" /> Order on WhatsApp
                  </a>

                  <button
                    onClick={() => onSelectProduct(currentProduct)}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2 text-xs sm:text-sm"
                  >
                    <span>View Product Details</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Slide Product Image */}
              <div 
                onClick={() => onSelectProduct(currentProduct)}
                className="w-full md:w-80 h-56 sm:h-64 bg-white rounded-xl p-4 flex items-center justify-center shrink-0 cursor-pointer hover:scale-102 transition-transform relative overflow-hidden border border-amber-200 shadow-md group/img"
              >
                <img
                  src={currentProduct.images[0]}
                  alt={currentProduct.name}
                  className="max-h-full max-w-full object-contain group-hover/img:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="bg-amber-400 text-slate-900 font-extrabold text-xs px-3 py-1.5 rounded-full shadow-lg">
                    Click to View
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Arrows */}
          <button
            onClick={() => setCurrentSlideIndex((prev) => (prev - 1 + featuredProducts.length) % featuredProducts.length)}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-amber-400 hover:text-slate-900 text-gray-800 border border-gray-200 shadow-md transition-all"
            title="Previous Product"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentSlideIndex((prev) => (prev + 1) % featuredProducts.length)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-amber-400 hover:text-slate-900 text-gray-800 border border-gray-200 shadow-md transition-all"
            title="Next Product"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Continuous Auto-Scrolling Product Ticker Strip */}
        <div className="mb-8 overflow-hidden rounded-xl bg-gray-50 border border-gray-200 p-3 shadow-sm">
          <div className="flex items-center gap-2 mb-2 px-2 text-xs font-extrabold text-amber-800">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>LIVE PRODUCT STREAM</span>
            <span className="text-gray-500 font-medium text-[11px] ml-auto">Scrolls automatically • Hover to pause</span>
          </div>

          <div className="overflow-x-auto scrollbar-none flex items-center gap-4 py-1" ref={marqueeRef}>
            {products.concat(products).map((p, idx) => (
              <div
                key={`${p.id}-${idx}`}
                onClick={() => onSelectProduct(p)}
                className="shrink-0 bg-white border border-gray-200 hover:border-amber-400 p-2.5 rounded-lg flex items-center gap-3 w-64 cursor-pointer hover:bg-amber-50/50 transition-all shadow-xs group"
              >
                <img
                  src={p.images[0]}
                  alt={p.name}
                  className="w-12 h-12 object-contain bg-gray-50 rounded p-1 shrink-0 border border-gray-100"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-gray-900 group-hover:text-amber-800 truncate">
                    {p.name}
                  </p>
                  <p className="text-[11px] font-extrabold text-amber-700">
                    ₹{p.price.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4-Tile Category Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 -mt-2">
          {/* Card 1 */}
          <div className="bg-white text-gray-900 rounded-xl p-5 shadow-sm border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold mb-1 text-gray-900">Computers & Laptops</h3>
              <p className="text-xs text-gray-500 mb-3">Gaming laptops, CPUs, GPUs & RAM</p>
              <div className="h-36 rounded-lg overflow-hidden bg-gray-50 mb-3">
                <img
                  src="https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80"
                  alt="Computers"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
            <button
              onClick={() => onSelectCategory('computers-laptops')}
              className="text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1 group mt-2"
            >
              <span>Explore Laptops & Parts</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Card 2 */}
          <div className="bg-white text-gray-900 rounded-xl p-5 shadow-sm border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold mb-1 text-gray-900">IFB Home Appliances</h3>
              <p className="text-xs text-gray-500 mb-3">Washing Machines, Microwaves & ACs</p>
              <div className="h-36 rounded-lg overflow-hidden bg-gray-50 mb-3">
                <img
                  src="https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=800&q=80"
                  alt="IFB Appliances"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
            <button
              onClick={() => onSelectBrand('IFB')}
              className="text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1 group mt-2"
            >
              <span>View IFB Store</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Card 3 */}
          <div className="bg-white text-gray-900 rounded-xl p-5 shadow-sm border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold mb-1 text-gray-900">Computer Accessories</h3>
              <p className="text-xs text-gray-500 mb-3">Keyboards, Logitech Mice, Monitors</p>
              <div className="h-36 rounded-lg overflow-hidden bg-gray-50 mb-3">
                <img
                  src="https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80"
                  alt="Accessories"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
            <button
              onClick={() => onSelectCategory('computer-accessories')}
              className="text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1 group mt-2"
            >
              <span>Shop Accessories</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Card 4 */}
          <div className="bg-white text-gray-900 rounded-xl p-5 shadow-sm border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold mb-1 text-gray-900">Mobile & Audio Gear</h3>
              <p className="text-xs text-gray-500 mb-3">Sony Earbuds, Anker Power Banks</p>
              <div className="h-36 rounded-lg overflow-hidden bg-gray-50 mb-3">
                <img
                  src="https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80"
                  alt="Mobile Gear"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
            <button
              onClick={() => onSelectCategory('mobile-accessories')}
              className="text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1 group mt-2"
            >
              <span>Explore Mobile Gear</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
