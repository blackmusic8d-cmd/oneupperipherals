import React, { useState } from 'react';
import { X, User as UserIcon, LogIn, UserPlus, Heart, ShoppingBag, ShieldCheck, Check, LogOut, Phone, MapPin, Mail, Save } from 'lucide-react';
import { User, Product } from '../types';
import { registerUser, loginUser, updateUserProfile } from '../services/api';

interface UserAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onLoginSuccess: (user: User) => void;
  onLogout: () => void;
  wishlistProducts: Product[];
  onRemoveWishlist: (productId: string) => void;
  onAddToCart: (product: Product) => void;
}

export const UserAuthModal: React.FC<UserAuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  onLogout,
  wishlistProducts,
  onRemoveWishlist,
  onAddToCart,
}) => {
  if (!isOpen) return null;

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [tab, setTab] = useState<'profile' | 'wishlist'>('profile');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [address, setAddress] = useState(currentUser?.address || '');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const user = await loginUser({ email, password });
      onLoginSuccess(user);
      setSuccessMsg('Logged in successfully!');
      setTimeout(() => {
        setSuccessMsg('');
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const user = await registerUser({ name, email, password, phone, address });
      onLoginSuccess(user);
      setSuccessMsg('Account created successfully!');
      setTimeout(() => {
        setSuccessMsg('');
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const updated = await updateUserProfile({
        userId: currentUser.id,
        name: currentUser.name,
        phone,
        address,
      });
      onLoginSuccess(updated);
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 2500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-400/20 text-amber-400 rounded-lg">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">
                {currentUser ? `Welcome, ${currentUser.name}` : authMode === 'login' ? 'Customer Sign In' : 'Create Account'}
              </h3>
              <p className="text-xs text-gray-400">
                {currentUser ? 'Manage your account & saved items' : 'Access your personal wishlist and fast WhatsApp checkout'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-medium">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-lg font-medium flex items-center gap-2">
              <Check className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {currentUser ? (
            /* Logged In View */
            <div className="space-y-6">
              {/* Tab Selector */}
              <div className="flex border-b border-gray-200 text-xs font-bold">
                <button
                  onClick={() => setTab('profile')}
                  className={`pb-2.5 px-4 flex items-center gap-1.5 border-b-2 transition-all ${
                    tab === 'profile' ? 'border-amber-500 text-amber-800' : 'border-transparent text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <UserIcon className="w-4 h-4" /> Account Profile
                </button>
                <button
                  onClick={() => setTab('wishlist')}
                  className={`pb-2.5 px-4 flex items-center gap-1.5 border-b-2 transition-all ${
                    tab === 'wishlist' ? 'border-amber-500 text-amber-800' : 'border-transparent text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <Heart className="w-4 h-4 text-red-500" /> My Wishlist ({wishlistProducts.length})
                </button>
              </div>

              {tab === 'profile' ? (
                /* Profile Edit Form */
                <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Full Name</label>
                    <input
                      type="text"
                      disabled
                      value={currentUser.name}
                      className="w-full p-2.5 bg-gray-100 border border-gray-200 rounded text-gray-600 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Email Address</label>
                    <input
                      type="email"
                      disabled
                      value={currentUser.email}
                      className="w-full p-2.5 bg-gray-100 border border-gray-200 rounded text-gray-600 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Phone Number (for WhatsApp Orders)</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                      <input
                        type="tel"
                        placeholder="e.g. 9862388771"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-9 p-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Delivery Address (Aizawl / Mizoram / All India)</label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                      <textarea
                        rows={2}
                        placeholder="House / Building, Locality, City, Pincode"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full pl-9 p-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <Save className="w-4 h-4" /> Save Details
                    </button>

                    <button
                      type="button"
                      onClick={onLogout}
                      className="text-red-600 hover:text-red-800 font-bold flex items-center gap-1 hover:underline"
                    >
                      <LogOut className="w-4 h-4" /> Log Out
                    </button>
                  </div>
                </form>
              ) : (
                /* Wishlist Tab Inside Account Modal */
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {wishlistProducts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Heart className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <p className="font-bold text-sm">Your wishlist is empty</p>
                      <p className="text-xs">Save products using the heart icon on any product card.</p>
                    </div>
                  ) : (
                    wishlistProducts.map((p) => (
                      <div key={p.id} className="flex items-center gap-3 bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                        <img src={p.images[0]} alt={p.name} className="w-12 h-12 object-contain bg-white rounded p-1" />
                        <div className="flex-1 min-w-0 text-xs">
                          <p className="font-bold text-gray-900 truncate">{p.name}</p>
                          <p className="text-amber-800 font-bold">₹{p.price.toLocaleString('en-IN')}</p>
                        </div>
                        <button
                          onClick={() => onAddToCart(p)}
                          className="bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold text-xs px-2.5 py-1 rounded"
                        >
                          Add to Cart
                        </button>
                        <button
                          onClick={() => onRemoveWishlist(p.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Remove from wishlist"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Auth Form (Login / Register) */
            <div className="space-y-4">
              {/* Form Mode Selector */}
              <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-bold mb-4">
                <button
                  onClick={() => setAuthMode('login')}
                  className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    authMode === 'login' ? 'bg-white shadow-sm text-slate-900' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5 text-amber-500" /> Sign In
                </button>
                <button
                  onClick={() => setAuthMode('register')}
                  className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    authMode === 'register' ? 'bg-white shadow-sm text-slate-900' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5 text-amber-500" /> New Register
                </button>
              </div>

              {authMode === 'login' ? (
                <form onSubmit={handleLogin} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        required
                        placeholder="yourname@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-9 p-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-lg transition-all shadow-md flex items-center justify-center gap-2 mt-2"
                  >
                    <LogIn className="w-4 h-4 text-amber-400" />
                    <span>{loading ? 'Signing in...' : 'Sign In'}</span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRegister} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Lalrinchhana"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="yourname@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Password *</label>
                    <input
                      type="password"
                      required
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Phone Number (WhatsApp)</label>
                    <input
                      type="tel"
                      placeholder="e.g. 9862388771"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Address (Aizawl / Mizoram)</label>
                    <input
                      type="text"
                      placeholder="House / Street, Zarkawt, Aizawl"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold py-2.5 rounded-lg transition-all shadow-md flex items-center justify-center gap-2 mt-2"
                  >
                    <UserPlus className="w-4 h-4 text-slate-900" />
                    <span>{loading ? 'Creating account...' : 'Create Account'}</span>
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
