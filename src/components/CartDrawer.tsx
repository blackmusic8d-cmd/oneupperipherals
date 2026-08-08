import React, { useState } from 'react';
import {
  X,
  Plus,
  Minus,
  Trash2,
  PhoneCall,
  ShoppingCart,
  CheckCircle,
  Truck,
  ShieldCheck,
  Building,
  User,
  Phone,
  MapPin,
} from 'lucide-react';
import { CartItem } from '../types';
import { formatPrice, buildCartWhatsAppUrl } from '../utils/whatsapp';
import { logOrder } from '../services/api';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderLoggedSuccess, setOrderLoggedSuccess] = useState(false);

  if (!isOpen) return null;

  const totalAmount = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  const handleWhatsAppCheckout = async () => {
    if (cartItems.length === 0) return;

    setIsSubmitting(true);
    try {
      // 1. Log order to backend database for shop internal tracker
      const orderData = {
        customerName: customerName.trim() || 'WhatsApp Customer',
        customerPhone: customerPhone.trim() || 'Not Provided',
        customerAddress: customerAddress.trim() || 'Address via Chat',
        items: cartItems.map((ci) => ({
          productId: ci.product.id,
          name: ci.product.name,
          price: ci.product.price,
          quantity: ci.quantity,
          image: ci.product.images[0],
        })),
        totalAmount,
        notes: 'Placed via Website Cart WhatsApp Button',
      };

      await logOrder(orderData);
      setOrderLoggedSuccess(true);
    } catch (err) {
      console.warn('Could not save order log, opening WhatsApp anyway:', err);
    } finally {
      setIsSubmitting(false);

      // 2. Build WhatsApp URL and redirect
      const url = buildCartWhatsAppUrl(cartItems, {
        name: customerName,
        phone: customerPhone,
        address: customerAddress,
      });

      window.open(url, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 bg-[#131921] text-white flex items-center justify-between border-b border-gray-800">
          <div className="flex items-center gap-2 font-bold text-sm">
            <ShoppingCart className="w-5 h-5 text-[#febd69]" />
            <span>Shopping Cart ({cartItems.reduce((a, b) => a + b.quantity, 0)} items)</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-800 rounded-full text-gray-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 divide-y divide-gray-100">
          {cartItems.length === 0 ? (
            <div className="py-16 text-center text-gray-500 space-y-3">
              <ShoppingCart className="w-12 h-12 mx-auto text-gray-300 stroke-1" />
              <p className="font-bold text-gray-700">Your shopping cart is empty</p>
              <p className="text-xs">Browse our electronics catalog and add items to order!</p>
              <button
                onClick={onClose}
                className="mt-2 bg-[#febd69] hover:bg-[#f3a847] text-black font-extrabold px-4 py-2 rounded-lg text-xs"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.product.id} className="pt-3 flex gap-3 text-xs">
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  className="w-16 h-16 object-contain rounded bg-gray-50 border p-1 shrink-0"
                />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-gray-900 line-clamp-2 leading-tight">
                      {item.product.name}
                    </h4>
                    <span className="text-[11px] text-amber-800 font-extrabold uppercase">
                      {item.product.brand}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <span className="font-black text-gray-900 text-sm">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-1 border border-gray-300 rounded bg-gray-50">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, -1)}
                        className="p-1 hover:bg-gray-200 text-gray-700"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 font-bold">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, 1)}
                        className="p-1 hover:bg-gray-200 text-gray-700"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={() => onRemoveItem(item.product.id)}
                      className="text-gray-400 hover:text-red-600 p-1"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Checkout Form & Total Box */}
        {cartItems.length > 0 && (
          <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-3">
            {/* Customer Details optional inputs */}
            <div className="space-y-2 text-xs">
              <p className="font-bold text-gray-800 text-[11px] uppercase tracking-wider">
                Customer Details (Optional for WhatsApp Invoice)
              </p>

              <div className="flex items-center gap-2 bg-white border border-gray-300 rounded px-2 py-1">
                <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Your Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full text-xs focus:outline-none"
                />
              </div>

              <div className="flex gap-2">
                <div className="flex items-center gap-2 bg-white border border-gray-300 rounded px-2 py-1 flex-1">
                  <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Phone Number"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 bg-white border border-gray-300 rounded px-2 py-1">
                <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Delivery Address"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="w-full text-xs focus:outline-none"
                />
              </div>
            </div>

            {/* Total Calculation */}
            <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-600">Subtotal</span>
              <span className="text-xl font-black text-gray-900">{formatPrice(totalAmount)}</span>
            </div>

            {/* Order on WhatsApp CTA */}
            <button
              onClick={handleWhatsAppCheckout}
              disabled={isSubmitting}
              className="w-full bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-slate-900 font-black py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all border border-amber-500"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Send Order to WhatsApp (9862388771)</span>
            </button>

            <p className="text-[10px] text-gray-500 text-center leading-tight">
              Clicking will open WhatsApp with your cart order summary pre-filled.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
