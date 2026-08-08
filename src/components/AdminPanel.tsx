import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { Logo } from './Logo';
import {
  X,
  Plus,
  Trash2,
  Edit2,
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  TrendingUp,
  Package,
  ShoppingBag,
  AlertTriangle,
  RefreshCw,
  Lock,
  LogOut,
  FolderPlus,
  ListFilter,
  DollarSign,
  Code,
  FileText,
} from 'lucide-react';
import { Product, Category, Order, OrderStatus, StoreStats } from '../types';
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkImportProducts,
  fetchCategories,
  createCategory,
  deleteCategory,
  fetchOrders,
  logOrder,
  updateOrderStatus,
  deleteOrder,
  fetchStats,
  adminLogin,
  resetStoreData,
} from '../services/api';
import { formatPrice } from '../utils/whatsapp';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshLiveStore: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose, onRefreshLiveStore }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'bulk' | 'categories' | 'orders' | 'apidocs'>('overview');

  // Stats & Data State
  const [stats, setStats] = useState<StoreStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const [searchFilter, setSearchFilter] = useState('');

  // Single Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields for Product
  const [prodName, setProdName] = useState('');
  const [prodCategoryId, setProdCategoryId] = useState('');
  const [prodSubcategory, setProdSubcategory] = useState('');
  const [prodBrand, setProdBrand] = useState('');
  const [prodPrice, setProdPrice] = useState<number | ''>('');
  const [prodOrigPrice, setProdOrigPrice] = useState<number | ''>('');
  const [prodStock, setProdStock] = useState<number | ''>(10);
  const [prodDescription, setProdDescription] = useState('');
  const [prodImages, setProdImages] = useState<string>('');
  const [prodSpecs, setProdSpecs] = useState<string>('{"Warranty": "1 Year Brand Warranty"}');
  const [prodIsFeatured, setProdIsFeatured] = useState(false);

  // Bulk CSV Upload State
  const [parsedCsvData, setParsedCsvData] = useState<any[]>([]);
  const [csvError, setCsvError] = useState('');
  const [importResultMsg, setImportResultMsg] = useState('');

  // Category Form
  const [newCatName, setNewCatName] = useState('');
  const [newCatSubs, setNewCatSubs] = useState('');

  // New Manual Order Form
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [ordCustName, setOrdCustName] = useState('');
  const [ordCustPhone, setOrdCustPhone] = useState('');
  const [ordItemName, setOrdItemName] = useState('');
  const [ordItemPrice, setOrdItemPrice] = useState<number | ''>('');
  const [ordItemQty, setOrdItemQty] = useState<number | ''>(1);

  useEffect(() => {
    const token = localStorage.getItem('oup_admin_token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && isOpen) {
      loadAdminData();
    }
  }, [isAuthenticated, isOpen]);

  const loadAdminData = async () => {
    try {
      const [sData, pData, cData, oData] = await Promise.all([
        fetchStats(),
        fetchProducts(),
        fetchCategories(),
        fetchOrders(),
      ]);
      setStats(sData);
      setProducts(pData);
      setCategories(cData);
      setOrders(oData);
    } catch (err) {
      console.error('Error loading admin data:', err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const success = await adminLogin(loginUser, loginPass);
    if (success) {
      setIsAuthenticated(true);
      loadAdminData();
    } else {
      setLoginError('Invalid username or password.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('oup_admin_token');
    setIsAuthenticated(false);
  };

  // Populate form for Edit
  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProdName(prod.name);
    setProdCategoryId(prod.categoryId);
    setProdSubcategory(prod.subcategory);
    setProdBrand(prod.brand);
    setProdPrice(prod.price);
    setProdOrigPrice(prod.originalPrice);
    setProdStock(prod.stock);
    setProdDescription(prod.description);
    setProdImages(prod.images.join(', '));
    setProdSpecs(JSON.stringify(prod.specifications || {}, null, 2));
    setProdIsFeatured(Boolean(prod.isFeatured));
    setIsProductModalOpen(true);
  };

  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProdName('');
    setProdCategoryId(categories[0]?.id || 'computers-laptops');
    setProdSubcategory('');
    setProdBrand('');
    setProdPrice('');
    setProdOrigPrice('');
    setProdStock(10);
    setProdDescription('');
    setProdImages('https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80');
    setProdSpecs('{"Warranty": "1 Year Brand Warranty"}');
    setProdIsFeatured(false);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName || !prodPrice || !prodCategoryId) {
      alert('Product Name, Price, and Category are required.');
      return;
    }

    let parsedSpecs = {};
    try {
      parsedSpecs = JSON.parse(prodSpecs);
    } catch (err) {
      parsedSpecs = { Specifications: prodSpecs };
    }

    const imageArray = prodImages
      .split(',')
      .map((url) => url.trim())
      .filter((url) => url.length > 0);

    const payload = {
      name: prodName,
      categoryId: prodCategoryId,
      subcategory: prodSubcategory || 'General',
      brand: prodBrand || 'Generic',
      price: Number(prodPrice),
      originalPrice: Number(prodOrigPrice || prodPrice),
      stock: Number(prodStock ?? 10),
      description: prodDescription,
      images: imageArray.length > 0 ? imageArray : ['https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80'],
      specifications: parsedSpecs,
      isFeatured: prodIsFeatured,
    };

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
      } else {
        await createProduct(payload);
      }
      setIsProductModalOpen(false);
      await loadAdminData();
      onRefreshLiveStore();
    } catch (err: any) {
      alert('Error saving product: ' + err.message);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await deleteProduct(id);
      await loadAdminData();
      onRefreshLiveStore();
    }
  };

  // CSV Import Parse
  const handleCsvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvError('');
    setImportResultMsg('');

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors && results.errors.length > 0) {
          setCsvError('Error parsing CSV file: ' + results.errors[0].message);
        }
        setParsedCsvData(results.data);
      },
      error: (err) => {
        setCsvError('Failed to parse CSV: ' + err.message);
      },
    });
  };

  const handleDownloadCsvTemplate = () => {
    const csvContent =
      'name,category,subcategory,brand,price,originalPrice,stock,description,images\n' +
      '"IFB 7kg Top Load Washing Machine","home-appliances","Washing Machine","IFB",21990,25990,12,"Fully automatic top load washing machine","https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=800&q=80"\n' +
      '"Zebronics Mechanical Gaming Keyboard","computer-accessories","Keyboard","Zebronics",1499,2499,35,"RGB Backlit Mechanical Keyboard","https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80"';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'OneUpPeripherals_Bulk_Import_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleConfirmBulkImport = async () => {
    if (parsedCsvData.length === 0) return;

    const formattedItems = parsedCsvData.map((row) => ({
      name: row.name || row.Name,
      categoryId: row.category || row.Category || 'computers-laptops',
      subcategory: row.subcategory || row.Subcategory || 'General',
      brand: row.brand || row.Brand || 'Generic',
      price: Number(row.price || row.Price || 0),
      originalPrice: Number(row.originalPrice || row.OriginalPrice || row.price || 0),
      stock: Number(row.stock || row.Stock || 10),
      description: row.description || row.Description || '',
      images: row.images ? [row.images] : undefined,
    }));

    try {
      const res = await bulkImportProducts(formattedItems);
      setImportResultMsg(res.message);
      setParsedCsvData([]);
      await loadAdminData();
      onRefreshLiveStore();
    } catch (err: any) {
      setCsvError(err.message || 'Bulk import failed');
    }
  };

  // Add Category
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;

    const subArray = newCatSubs
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    try {
      await createCategory(newCatName, subArray);
      setNewCatName('');
      setNewCatSubs('');
      await loadAdminData();
      onRefreshLiveStore();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteCat = async (id: string) => {
    if (confirm('Delete this category?')) {
      await deleteCategory(id);
      await loadAdminData();
      onRefreshLiveStore();
    }
  };

  // Manual Order Logging
  const handleSaveOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ordItemName || !ordItemPrice) return;

    try {
      await logOrder({
        customerName: ordCustName || 'Phone Customer',
        customerPhone: ordCustPhone || 'Not provided',
        items: [
          {
            productId: 'manual-' + Date.now(),
            name: ordItemName,
            price: Number(ordItemPrice),
            quantity: Number(ordItemQty || 1),
          },
        ],
        totalAmount: Number(ordItemPrice) * Number(ordItemQty || 1),
        notes: 'Manually logged by Shop Admin',
      });

      setIsOrderModalOpen(false);
      setOrdCustName('');
      setOrdCustPhone('');
      setOrdItemName('');
      setOrdItemPrice('');
      await loadAdminData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    await updateOrderStatus(orderId, newStatus);
    await loadAdminData();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <div className="bg-slate-900 text-white rounded-2xl max-w-6xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-slate-700 overflow-hidden">
        {/* Header Bar */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-amber-500 p-2 rounded-xl text-black font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <Logo size="md" />
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                <span className="text-amber-400 font-black">Admin Management Portal</span>
              </h2>
              <p className="text-[11px] text-slate-400">Manage catalog, stock levels, CSV batch import & orders</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="bg-slate-800 hover:bg-slate-700 text-red-400 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1.5"
              >
                <LogOut className="w-3 h-3" /> Logout
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Auth Screen if not logged in */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-12 max-w-md mx-auto text-center space-y-6">
            <div className="w-16 h-16 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto">
              <Lock className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Admin Authentication</h3>
              <p className="text-xs text-slate-400 mt-1">Enter your admin credentials to continue.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4 text-left">
              <div>
                <label className="text-xs font-bold text-slate-300">Username</label>
                <input
                  type="text"
                  value={loginUser}
                  onChange={(e) => setLoginUser(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500 mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300">Password</label>
                <input
                  type="password"
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  placeholder="Enter password"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500 mt-1"
                />
              </div>

              {loginError && <p className="text-xs text-red-400 font-bold">{loginError}</p>}

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold py-2.5 rounded-lg text-xs shadow-lg"
              >
                Sign In to Admin Dashboard
              </button>
            </form>
          </div>
        ) : (
          /* Main Admin Workspace */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Tabs Bar */}
            <div className="bg-slate-950/60 border-b border-slate-800 px-6 flex items-center gap-2 overflow-x-auto text-xs font-bold">
              {[
                { id: 'overview', label: 'Overview & Stats', icon: TrendingUp },
                { id: 'products', label: 'Product Inventory', icon: Package },
                { id: 'bulk', label: 'Bulk CSV Import', icon: FileSpreadsheet },
                { id: 'categories', label: 'Categories', icon: FolderPlus },
                { id: 'orders', label: 'WhatsApp Orders Log', icon: ShoppingBag },
                { id: 'apidocs', label: 'API & Payments Architecture', icon: Code },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-amber-500 text-amber-400 bg-slate-800/50'
                        : 'border-transparent text-slate-400 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Key Metrics Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-400 font-medium">Active Products</p>
                        <p className="text-2xl font-black text-white">{stats?.totalProducts || 0}</p>
                        <span className="text-[10px] text-amber-300 font-medium">In Catalog</span>
                      </div>
                      <div className="p-3 bg-amber-500/10 text-amber-400 rounded-lg">
                        <Package className="w-6 h-6" />
                      </div>
                    </div>

                    <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-400 font-medium">WhatsApp Orders Logged</p>
                        <p className="text-2xl font-black text-white">{stats?.totalOrders || 0}</p>
                        <span className="text-[10px] text-cyan-400 font-medium">Processed</span>
                      </div>
                      <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-lg">
                        <ShoppingBag className="w-6 h-6" />
                      </div>
                    </div>

                    <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-400 font-medium">Low Stock Alerts</p>
                        <p className="text-2xl font-black text-amber-400">{stats?.lowStockCount || 0}</p>
                        <span className="text-[10px] text-amber-300 font-medium">&lt; 10 items remaining</span>
                      </div>
                      <div className="p-3 bg-amber-500/10 text-amber-400 rounded-lg">
                        <AlertTriangle className="w-6 h-6" />
                      </div>
                    </div>

                    <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-400 font-medium">Total Sales Revenue</p>
                        <p className="text-2xl font-black text-amber-400">
                          {formatPrice(stats?.totalRevenue || 0)}
                        </p>
                        <span className="text-[10px] text-amber-300 font-medium">WhatsApp Orders</span>
                      </div>
                      <div className="p-3 bg-amber-500/10 text-amber-400 rounded-lg">
                        <DollarSign className="w-6 h-6" />
                      </div>
                    </div>
                  </div>

                  {/* Visual Charts & Widgets Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Visual Sales & Revenue Visualizer Bar Graph */}
                    <div className="lg:col-span-2 bg-slate-800/80 border border-slate-700 p-5 rounded-xl space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-amber-400" />
                            <span>Sales & Category Revenue Breakdown</span>
                          </h4>
                          <p className="text-xs text-slate-400">Calculated from logged WhatsApp customer orders</p>
                        </div>
                        <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded">
                          Live Metrics
                        </span>
                      </div>

                      {/* Visual Category Revenue Bars */}
                      <div className="space-y-3 pt-2">
                        {categories.map((cat, idx) => {
                          const categoryProds = products.filter((p) => p.categoryId === cat.id);
                          const totalCategoryVal = categoryProds.reduce((sum, p) => sum + (p.price * p.stock), 0);
                          const maxVal = Math.max(1, ...categories.map((c) => products.filter((p) => p.categoryId === c.id).reduce((s, p) => s + (p.price * p.stock), 0)));
                          const percent = Math.min(100, Math.round((totalCategoryVal / maxVal) * 100));

                          return (
                            <div key={cat.id} className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="font-bold text-slate-200">{cat.name} ({categoryProds.length} items)</span>
                                <span className="font-bold text-amber-400">{formatPrice(totalCategoryVal)}</span>
                              </div>
                              <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-700">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    idx % 3 === 0 ? 'bg-amber-400' : idx % 3 === 1 ? 'bg-indigo-400' : 'bg-cyan-400'
                                  }`}
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Low Stock Item Alerts Panel */}
                    <div className="bg-slate-800/80 border border-slate-700 p-5 rounded-xl space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-400" />
                          <span>Low-Stock Alerts</span>
                        </h4>
                        <span className="text-xs text-amber-400 font-bold bg-amber-400/10 px-2 py-0.5 rounded">
                          Action Required
                        </span>
                      </div>

                      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                        {products.filter((p) => p.stock <= 10).length === 0 ? (
                          <div className="text-center py-8 text-slate-400 text-xs">
                            <CheckCircle className="w-8 h-8 text-amber-400 mx-auto mb-1" />
                            <p>All stock levels are healthy (&gt;10 units)</p>
                          </div>
                        ) : (
                          products
                            .filter((p) => p.stock <= 10)
                            .map((p) => (
                              <div key={p.id} className="bg-slate-900 p-2.5 rounded-lg border border-slate-700 flex items-center justify-between text-xs">
                                <div className="min-w-0 pr-2">
                                  <p className="font-bold text-slate-200 truncate">{p.name}</p>
                                  <p className="text-[11px] text-amber-400 font-mono">
                                    Only {p.stock} units left
                                  </p>
                                </div>
                                <button
                                  onClick={() => {
                                    setEditingProduct(p);
                                    setProdName(p.name);
                                    setProdCategoryId(p.categoryId);
                                    setProdSubcategory(p.subcategory);
                                    setProdBrand(p.brand);
                                    setProdPrice(p.price);
                                    setProdOrigPrice(p.originalPrice);
                                    setProdStock(p.stock + 10);
                                    setProdDescription(p.description);
                                    setProdImages(p.images.join(', '));
                                    setIsProductModalOpen(true);
                                  }}
                                  className="bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold px-2 py-1 rounded text-[11px] shrink-0"
                                >
                                  + Restock
                                </button>
                              </div>
                            ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Recent Order Activity Table Widget */}
                  <div className="bg-slate-800/80 border border-slate-700 p-5 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-cyan-400" />
                        <span>Recent WhatsApp Order Activity</span>
                      </h4>
                      <button
                        onClick={() => setActiveTab('orders')}
                        className="text-xs text-amber-400 hover:underline font-bold"
                      >
                        View Full Log →
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-700">
                          <tr>
                            <th className="p-2.5">Customer</th>
                            <th className="p-2.5">Order Items</th>
                            <th className="p-2.5">Total Amount</th>
                            <th className="p-2.5">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {orders.slice(0, 5).map((ord) => (
                            <tr key={ord.id} className="hover:bg-slate-800/50">
                              <td className="p-2.5 font-bold text-white">
                                {ord.customerName}
                                <div className="text-[10px] text-slate-400 font-mono">{ord.customerPhone}</div>
                              </td>
                              <td className="p-2.5 text-slate-300">
                                {ord.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                              </td>
                              <td className="p-2.5 font-bold text-amber-400">
                                {formatPrice(ord.totalAmount)}
                              </td>
                              <td className="p-2.5">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  ord.status === 'delivered'
                                    ? 'bg-emerald-500/20 text-emerald-300'
                                    : ord.status === 'cancelled'
                                    ? 'bg-red-500/20 text-red-300'
                                    : ord.status === 'shipped'
                                    ? 'bg-cyan-500/20 text-cyan-300'
                                    : 'bg-amber-500/20 text-amber-300'
                                }`}>
                                  {ord.status.toUpperCase()}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Store Reset Button */}
                  <div className="bg-slate-800/40 border border-slate-700 p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-white">Reset Store Sample Dataset</h4>
                      <p className="text-[11px] text-slate-400">Restore default initial products & categories</p>
                    </div>
                    <button
                      onClick={async () => {
                        if (confirm('Reset store data to default sample dataset?')) {
                          await resetStoreData();
                          await loadAdminData();
                          onRefreshLiveStore();
                        }
                      }}
                      className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Reset Data
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: PRODUCTS MANAGEMENT */}
              {activeTab === 'products' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-800/60 p-3 rounded-xl border border-slate-700">
                    <input
                      type="text"
                      placeholder="Search inventory by name or brand..."
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      className="w-full sm:w-80 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                    />

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleOpenAddProduct}
                        className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 shadow"
                      >
                        <Plus className="w-4 h-4" /> Add Single Product
                      </button>
                    </div>
                  </div>

                  {/* Products Table */}
                  <div className="bg-slate-800/40 border border-slate-700 rounded-xl overflow-hidden overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-700">
                        <tr>
                          <th className="p-3">Product</th>
                          <th className="p-3">Category / Sub</th>
                          <th className="p-3">Brand</th>
                          <th className="p-3">Price</th>
                          <th className="p-3">Stock</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {products
                          .filter((p) =>
                            p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
                            p.brand.toLowerCase().includes(searchFilter.toLowerCase())
                          )
                          .map((p) => (
                            <tr key={p.id} className="hover:bg-slate-800/60">
                              <td className="p-3 flex items-center gap-3">
                                <img
                                  src={p.images[0]}
                                  alt={p.name}
                                  className="w-10 h-10 object-contain rounded bg-white p-0.5"
                                />
                                <span className="font-bold text-white line-clamp-1 max-w-xs">{p.name}</span>
                              </td>
                              <td className="p-3 text-slate-400">
                                {p.categoryId} / <span className="text-white">{p.subcategory}</span>
                              </td>
                              <td className="p-3 font-bold text-amber-400">{p.brand}</td>
                              <td className="p-3 font-extrabold text-white">{formatPrice(p.price)}</td>
                              <td className="p-3">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    p.stock > 5 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                                  }`}
                                >
                                  {p.stock} units
                                </span>
                              </td>
                              <td className="p-3 text-right space-x-2">
                                <button
                                  onClick={() => handleOpenEditProduct(p)}
                                  className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded text-amber-300"
                                  title="Edit Product"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(p.id)}
                                  className="p-1.5 bg-slate-700 hover:bg-red-950 rounded text-red-400"
                                  title="Delete Product"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: BULK CSV IMPORT */}
              {activeTab === 'bulk' && (
                <div className="space-y-6 max-w-3xl">
                  <div className="bg-slate-800/60 border border-slate-700 p-6 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                          <FileSpreadsheet className="w-5 h-5 text-amber-400" /> CSV / Excel Bulk Product Import
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">
                          Upload multiple products simultaneously. Duplicate names will be automatically skipped.
                        </p>
                      </div>

                      <button
                        onClick={handleDownloadCsvTemplate}
                        className="bg-slate-700 hover:bg-slate-600 text-amber-300 border border-slate-600 text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5"
                      >
                        <Download className="w-4 h-4" /> Download Sample CSV
                      </button>
                    </div>

                    <div className="border-2 border-dashed border-slate-700 rounded-xl p-6 text-center hover:border-amber-500 transition-colors">
                      <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                      <p className="text-xs font-bold text-white mb-1">Select or Drag CSV file here</p>
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleCsvFileUpload}
                        className="text-xs text-slate-400 cursor-pointer file:bg-amber-500 file:text-black file:font-bold file:border-0 file:px-3 file:py-1 file:rounded-lg"
                      />
                    </div>

                    {csvError && <p className="text-xs text-red-400 font-bold">{csvError}</p>}
                    {importResultMsg && <p className="text-xs text-emerald-400 font-bold">{importResultMsg}</p>}

                    {/* Live Preview Table */}
                    {parsedCsvData.length > 0 && (
                      <div className="space-y-3 pt-4 border-t border-slate-700">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-amber-300">
                            CSV Parsed Preview ({parsedCsvData.length} Items Found)
                          </h4>
                          <button
                            onClick={handleConfirmBulkImport}
                            className="bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs px-4 py-2 rounded-lg shadow"
                          >
                            Confirm & Import All Products
                          </button>
                        </div>

                        <div className="max-h-60 overflow-y-auto bg-slate-900 rounded-lg p-2 border border-slate-700">
                          <table className="w-full text-left text-[11px] text-slate-300">
                            <thead className="text-slate-400 uppercase text-[9px]">
                              <tr>
                                <th className="p-1">Name</th>
                                <th className="p-1">Category</th>
                                <th className="p-1">Brand</th>
                                <th className="p-1">Price</th>
                                <th className="p-1">Stock</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                              {parsedCsvData.slice(0, 10).map((row, idx) => (
                                <tr key={idx}>
                                  <td className="p-1 font-semibold text-white">{row.name || row.Name}</td>
                                  <td className="p-1">{row.category || row.Category}</td>
                                  <td className="p-1">{row.brand || row.Brand}</td>
                                  <td className="p-1 font-bold text-amber-400">₹{row.price || row.Price}</td>
                                  <td className="p-1">{row.stock || row.Stock || 10}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: CATEGORIES */}
              {activeTab === 'categories' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Category List */}
                  <div className="bg-slate-800/60 border border-slate-700 p-4 rounded-xl space-y-3">
                    <h3 className="font-bold text-sm text-white">Existing Store Categories</h3>
                    <div className="space-y-2">
                      {categories.map((cat) => (
                        <div
                          key={cat.id}
                          className="bg-slate-900 p-3 rounded-lg border border-slate-700 flex items-center justify-between"
                        >
                          <div>
                            <p className="font-bold text-xs text-white">{cat.name}</p>
                            <p className="text-[11px] text-slate-400">
                              Subcategories: {cat.subcategories.join(', ')}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeleteCat(cat.id)}
                            className="p-1 text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Add Category Form */}
                  <form
                    onSubmit={handleAddCategory}
                    className="bg-slate-800/60 border border-slate-700 p-4 rounded-xl space-y-3"
                  >
                    <h3 className="font-bold text-sm text-white">Add New Category</h3>
                    <div>
                      <label className="text-xs text-slate-300 font-semibold">Category Name</label>
                      <input
                        type="text"
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        placeholder="e.g. Smart Home Security"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-300 font-semibold">
                        Subcategories (Comma separated)
                      </label>
                      <input
                        type="text"
                        value={newCatSubs}
                        onChange={(e) => setNewCatSubs(e.target.value)}
                        placeholder="e.g. Security Cameras, Smart Locks, Motion Sensors"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none mt-1"
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs px-4 py-2 rounded-lg shadow"
                    >
                      Save Category
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 5: ORDERS LOG */}
              {activeTab === 'orders' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-white">Manual WhatsApp Orders Tracker</h3>
                    <button
                      onClick={() => setIsOrderModalOpen(true)}
                      className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" /> Record Manual Order
                    </button>
                  </div>

                  <div className="bg-slate-800/40 border border-slate-700 rounded-xl overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
                        <tr>
                          <th className="p-3">Order #</th>
                          <th className="p-3">Customer</th>
                          <th className="p-3">Items</th>
                          <th className="p-3">Amount</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {orders.map((o) => (
                          <tr key={o.id}>
                            <td className="p-3 font-bold text-amber-400">{o.orderNumber}</td>
                            <td className="p-3">
                              <p className="font-semibold text-white">{o.customerName}</p>
                              <p className="text-[10px] text-slate-400">{o.customerPhone}</p>
                            </td>
                            <td className="p-3">
                              {o.items.map((i, idx) => (
                                <p key={idx} className="line-clamp-1">
                                  {i.name} x{i.quantity}
                                </p>
                              ))}
                            </td>
                            <td className="p-3 font-extrabold text-white">{formatPrice(o.totalAmount)}</td>
                            <td className="p-3">
                              <select
                                value={o.status}
                                onChange={(e) => handleUpdateStatus(o.id, e.target.value as OrderStatus)}
                                className="bg-slate-900 border border-slate-700 text-xs text-white rounded p-1 font-bold focus:outline-none"
                              >
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </td>
                            <td className="p-3 text-right">
                              <button
                                onClick={async () => {
                                  if (confirm('Delete order record?')) {
                                    await deleteOrder(o.id);
                                    await loadAdminData();
                                  }
                                }}
                                className="text-red-400 hover:text-red-300"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 6: API & PAYMENTS ARCHITECTURE */}
              {activeTab === 'apidocs' && (
                <div className="bg-slate-800/60 border border-slate-700 p-6 rounded-2xl space-y-4 text-xs text-slate-300">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Code className="w-5 h-5 text-amber-400" /> Backend Endpoints & Payment Gateway Integration Architecture
                  </h3>

                  <p className="leading-relaxed">
                    The OneUpPeripherals system is designed with standard Express REST APIs so online payment gateways (e.g. Razorpay, UPI, Stripe) can be attached seamlessly in future iterations.
                  </p>

                  <div className="space-y-2 font-mono text-[11px]">
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-700">
                      <span className="text-emerald-400 font-bold">GET /api/products</span> - Filter products by category, subcategory, brand, price range & search query.
                    </div>
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-700">
                      <span className="text-amber-400 font-bold">POST /api/products/bulk</span> - Bulk CSV product import handler with duplicate prevention.
                    </div>
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-700">
                      <span className="text-cyan-400 font-bold">POST /api/orders</span> - Logs order details with pending payment status. Plug Razorpay Webhook or Payment Gateway verification callback here!
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal for Add / Edit Product */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 text-white text-xs max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-white">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={() => setIsProductModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3">
              <div>
                <label className="font-semibold text-slate-300">Product Title *</label>
                <input
                  type="text"
                  required
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white focus:outline-none mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300">Category *</label>
                  <select
                    value={prodCategoryId}
                    onChange={(e) => setProdCategoryId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white focus:outline-none mt-1"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-300">Subcategory</label>
                  <input
                    type="text"
                    value={prodSubcategory}
                    onChange={(e) => setProdSubcategory(e.target.value)}
                    placeholder="e.g. Laptops"
                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white focus:outline-none mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-300">Brand *</label>
                  <input
                    type="text"
                    required
                    value={prodBrand}
                    onChange={(e) => setProdBrand(e.target.value)}
                    placeholder="e.g. IFB, ASUS"
                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white focus:outline-none mt-1"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300">Sale Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={prodPrice}
                    onChange={(e) => setProdPrice(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white focus:outline-none mt-1"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300">Original Price (₹)</label>
                  <input
                    type="number"
                    value={prodOrigPrice}
                    onChange={(e) => setProdOrigPrice(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white focus:outline-none mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300">Stock Count *</label>
                  <input
                    type="number"
                    value={prodStock}
                    onChange={(e) => setProdStock(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white focus:outline-none mt-1"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    checked={prodIsFeatured}
                    onChange={(e) => setProdIsFeatured(e.target.checked)}
                    className="rounded text-amber-500 w-4 h-4"
                  />
                  <label className="font-bold text-amber-400">Featured Homepage Product</label>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300">Image URLs (Comma-separated)</label>
                <input
                  type="text"
                  value={prodImages}
                  onChange={(e) => setProdImages(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white focus:outline-none mt-1"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300">Description</label>
                <textarea
                  rows={3}
                  value={prodDescription}
                  onChange={(e) => setProdDescription(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white focus:outline-none mt-1"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded shadow"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Manual Order Log */}
      {isOrderModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 text-white text-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-sm text-white">Log Manual WhatsApp Order</h3>
              <button onClick={() => setIsOrderModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSaveOrder} className="space-y-3">
              <div>
                <label className="font-semibold text-slate-300">Customer Name</label>
                <input
                  type="text"
                  value={ordCustName}
                  onChange={(e) => setOrdCustName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white focus:outline-none mt-1"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-300">Customer Phone</label>
                <input
                  type="text"
                  value={ordCustPhone}
                  onChange={(e) => setOrdCustPhone(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white focus:outline-none mt-1"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-300">Product Item Name *</label>
                <input
                  type="text"
                  required
                  value={ordItemName}
                  onChange={(e) => setOrdItemName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white focus:outline-none mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-300">Unit Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={ordItemPrice}
                    onChange={(e) => setOrdItemPrice(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white focus:outline-none mt-1"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300">Quantity</label>
                  <input
                    type="number"
                    value={ordItemQty}
                    onChange={(e) => setOrdItemQty(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white focus:outline-none mt-1"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold py-2.5 rounded shadow mt-2"
              >
                Save Order Record
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
