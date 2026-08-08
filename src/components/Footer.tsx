import React from 'react';
import {
  PhoneCall,
  Mail,
  MapPin,
  ChevronUp,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  CreditCard,
  MessageSquare,
} from 'lucide-react';
import { SHOP_WHATSAPP_NUMBER, SHOP_EMAIL, SHOP_ADDRESS } from '../utils/whatsapp';
import { Logo } from './Logo';

interface FooterProps {
  onSelectCategory: (id: string) => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectCategory, onOpenAdmin }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-900 text-white text-xs mt-12 shrink-0 border-t border-slate-800">
      {/* Back to Top Button */}
      <button
        onClick={scrollToTop}
        className="w-full bg-slate-800 hover:bg-slate-700 text-gray-200 py-2.5 text-center text-xs font-bold transition-colors flex items-center justify-center gap-1"
      >
        <span>Back to top</span>
        <ChevronUp className="w-4 h-4" />
      </button>

      {/* Trust Badges Ribbon */}
      <div className="bg-slate-800/50 border-b border-slate-800 py-6">
        <div className="max-w-[1500px] mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-center sm:text-left">
          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <div className="p-2 bg-amber-400/10 text-amber-400 rounded-lg">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Direct WhatsApp Ordering</h4>
              <p className="text-gray-400 text-xs">Chat on +91 {SHOP_WHATSAPP_NUMBER}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <div className="p-2 bg-amber-400/10 text-amber-400 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">100% Genuine Tech</h4>
              <p className="text-gray-400 text-xs">Original warranty on all electronics</p>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <div className="p-2 bg-amber-400/10 text-amber-400 rounded-lg">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Safe India Express Delivery</h4>
              <p className="text-gray-400 text-xs">Insured packaging for delicate parts</p>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <div className="p-2 bg-amber-400/10 text-amber-400 rounded-lg">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Future Payment Gateway Ready</h4>
              <p className="text-gray-400 text-xs">UPI & Cards support architecture</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-[1500px] mx-auto px-6 py-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {/* Get to Know Us */}
        <div className="space-y-3">
          <p className="font-bold text-sm text-white mb-1">Get to Know Us</p>
          <div className="py-1">
            <Logo size="lg" />
          </div>
          <p className="text-gray-400 leading-relaxed text-xs">
            Your premier electronics & home appliances destination. High-performance computers, accessories, and IFB Washing Machines & ACs.
          </p>
          <button
            onClick={onOpenAdmin}
            className="text-amber-400 hover:underline font-bold text-xs flex items-center gap-1 pt-1"
          >
            🔒 Shop Admin Portal
          </button>
        </div>

        {/* Categories Links */}
        <div className="space-y-2">
          <p className="font-bold text-sm text-white mb-2">Top Categories</p>
          <ul className="space-y-1.5 text-gray-300">
            <li>
              <button onClick={() => onSelectCategory('computers-laptops')} className="hover:underline hover:text-amber-400 transition-colors">
                Computers & Laptops
              </button>
            </li>
            <li>
              <button onClick={() => onSelectCategory('computer-accessories')} className="hover:underline hover:text-amber-400 transition-colors">
                Computer Accessories
              </button>
            </li>
            <li>
              <button onClick={() => onSelectCategory('mobile-accessories')} className="hover:underline hover:text-amber-400 transition-colors">
                Mobiles & Accessories
              </button>
            </li>
            <li>
              <button onClick={() => onSelectCategory('home-appliances')} className="hover:underline hover:text-amber-400 transition-colors">
                Home Appliances (IFB)
              </button>
            </li>
          </ul>
        </div>

        {/* Customer Service */}
        <div className="space-y-2">
          <p className="font-bold text-sm text-white mb-2">Customer Service</p>
          <p className="text-gray-300">WhatsApp: +91 {SHOP_WHATSAPP_NUMBER}</p>
          <p className="text-gray-300">Email: {SHOP_EMAIL}</p>
          <p className="text-gray-300">Address: {SHOP_ADDRESS}</p>
        </div>

        {/* Featured Brands */}
        <div className="space-y-2">
          <p className="font-bold text-sm text-white mb-2">Featured Brands</p>
          <div className="flex flex-wrap gap-1.5">
            {['IFB', 'ASUS', 'Apple', 'Samsung', 'Logitech', 'Sony', 'Dell', 'HP'].map((b) => (
              <span key={b} className="bg-slate-800 text-gray-300 px-2 py-0.5 rounded text-[11px] border border-slate-700">
                {b}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-slate-950 py-4 text-center text-xs text-gray-400 border-t border-slate-800">
        <p>© {new Date().getFullYear()} OneUpPeripherals Store. Professional Tech Hub.</p>
      </div>
    </footer>
  );
};
