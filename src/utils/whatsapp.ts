import { Product, CartItem } from '../types';

export const SHOP_WHATSAPP_NUMBER = '9862388771';
export const SHOP_EMAIL = '1upperipherals@gmail.com';
export const SHOP_ADDRESS = 'E-3 Lalbuaia Shopping Complex, Zarkawt, Aizawl, Mizoram - 796001';

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function buildSingleProductWhatsAppUrl(product: Product, quantity: number = 1): string {
  const currentUrl = typeof window !== 'undefined' ? window.location.origin + '/?product=' + product.id : '';
  const text = `Hello OneUpPeripherals! 👋\nI am interested in placing an order for:\n\n📦 *Product:* ${product.name}\n🏷️ *Brand:* ${product.brand}\n💰 *Price:* ${formatPrice(product.price)} (Original: ${formatPrice(product.originalPrice)})\n🔢 *Quantity:* ${quantity}\n🔗 *Product Link:* ${currentUrl}\n\nPlease confirm availability and delivery details. Thank you!`;

  return `https://wa.me/91${SHOP_WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

export function buildCartWhatsAppUrl(
  cartItems: CartItem[],
  customerInfo?: { name: string; phone: string; address: string }
): string {
  const total = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  let itemsList = cartItems
    .map(
      (item, idx) =>
        `${idx + 1}. *${item.product.name}*\n   Qty: ${item.quantity} x ${formatPrice(item.product.price)} = ${formatPrice(item.product.price * item.quantity)}`
    )
    .join('\n\n');

  let text = `Hello OneUpPeripherals! 👋\nI would like to place an order for the following items from my cart:\n\n🛒 *Order Items:*\n${itemsList}\n\n💳 *Total Amount:* ${formatPrice(total)}`;

  if (customerInfo?.name) {
    text += `\n\n👤 *Customer Details:*\nName: ${customerInfo.name}\nPhone: ${customerInfo.phone}\nAddress: ${customerInfo.address || 'To be specified'}`;
  }

  text += `\n\nPlease confirm stock and guide me on delivery. Thank you!`;

  return `https://wa.me/91${SHOP_WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}
