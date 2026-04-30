import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Package, 
  Gavel, 
  ShoppingCart, 
  BarChart3, 
  Settings, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Loader2, 
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  MapPin,
  Star,
  ShieldCheck,
  ChevronLeft,
  X,
  PlusCircle,
  Truck,
  Wallet,
  MessageSquare
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import LiveChat from '@/components/sas/LiveChat';

// --- Sub-Components for Dashboard Views ---

const OverviewView = ({ stats, recentRFQs }) => (
  <div className="space-y-8 animate-in fade-in duration-500">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {[
        { title: 'إجمالي المبيعات', value: `$${stats.sales}`, icon: Wallet, color: 'text-green-600', bg: 'bg-green-50' },
        { title: 'المنتجات النشطة', value: stats.products, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
        { title: 'العروض المقدمة', value: stats.bids, icon: Gavel, color: 'text-purple-600', bg: 'bg-purple-50' },
        { title: 'تقييم المتجر', value: stats.rating, icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
      ].map((stat, i) => (
        <motion.div 
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4"
        >
          <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center`}>
            <stat.icon size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">{stat.title}</p>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        </motion.div>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
          <Clock size={20} className="text-sas-blue" /> أحدث طلبات الـ RFQ
        </h3>
        <div className="space-y-4">
          {recentRFQs.slice(0, 4).map((rfq) => (
            <div key={rfq.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
              <div>
                <h4 className="font-bold text-gray-900">{rfq.title}</h4>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                  <MapPin size={12} /> {rfq.shipping_destination} • <Package size={12} /> {rfq.quantity} {rfq.unit}
                </p>
              </div>
              <ChevronLeft size={18} className="text-gray-400" />
            </div>
          ))}
          {recentRFQs.length === 0 && <p className="text-center text-gray-400 py-10">لا توجد طلبات جديدة حالياً</p>}
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
          <BarChart3 size={20} className="text-sas-blue" /> أداء المتجر
        </h3>
        <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-100 rounded-xl">
          <p className="text-gray-400">إحصائيات المبيعات والزيارات قادمة قريباً</p>
        </div>
      </div>
    </div>
  </div>
);

const CatalogView = ({ products, onAdd, onEdit, onDelete }) => (
  <div className="space-y-6 animate-in fade-in duration-500">
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">كتالوج المنتجات</h2>
        <p className="text-gray-500 text-sm">أضف منتجاتك للسوق المفتوح ليراها المشترون مباشرة</p>
      </div>
      <Button onClick={onAdd} className="bg-sas-blue hover:bg-blue-700 text-white flex gap-2 rounded-xl py-6 px-8 shadow-lg shadow-blue-200">
        <Plus size={20} /> إضافة منتج جديد
      </Button>
    </div>

    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <table className="w-full text-right">
        <thead className="bg-gray-50 border-b text-gray-600 text-sm">
          <tr>
            <th className="p-4 font-bold">المنتج</th>
            <th className="p-4 font-bold">الفئة</th>
            <th className="p-4 font-bold">السعر</th>
            <th className="p-4 font-bold">أقل كمية (MOQ)</th>
            <th className="p-4 font-bold">المخزون</th>
            <th className="p-4 font-bold">الحالة</th>
            <th className="p-4 font-bold text-center">الإجراءات</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {products.length === 0 ? (
            <tr>
              <td colSpan="6" className="p-12 text-center text-gray-400">
                <div className="flex flex-col items-center">
                  <Package size={48} className="mb-2 opacity-20" />
                  <p>لا يوجد منتجات في الكتالوج حالياً</p>
                </div>
              </td>
            </tr>
          ) : (
            products.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden border border-gray-100">
                      {p.image_url ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full text-gray-400"><ImageIcon size={20} /></div>}
                    </div>
                    <span className="font-bold text-gray-900">{p.name}</span>
                  </div>
                </td>
                <td className="p-4 text-gray-600">{p.category}</td>
                <td className="p-4 font-bold text-sas-blue">${p.price}</td>
                <td className="p-4"><span className="bg-blue-50 text-sas-blue px-2 py-1 rounded text-xs font-bold">{p.minimum_quantity} {p.unit || 'قطعة'}</span></td>
                <td className="p-4 text-gray-600">{p.stock}</td>
                <td className="p-4">
                  {p.is_approved ? (
                    <span className="flex items-center gap-1 text-green-600 text-xs font-bold">
                      <CheckCircle2 size={14} /> معتمد
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-amber-600 text-xs font-bold">
                      <Clock size={14} /> بانتظار المراجعة
                    </span>
                  )}
                </td>
                <td className="p-4">
                  <div className="flex justify-center gap-2">
                    <button onClick={() => onEdit(p)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit size={18} /></button>
                    <button onClick={() => onDelete(p.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
);

const BidCenterView = ({ rfqs, myBids, onBid, onChat }) => (
  <div className="space-y-6 animate-in fade-in duration-500">
    <div>
      <h2 className="text-2xl font-bold text-gray-900">مركز العطاءات والفرص</h2>
      <p className="text-gray-500 text-sm">اكتشف أحدث طلبات الشراء المخصصة وقدم عروضك التنافسية</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {rfqs.map((rfq) => {
        const hasBid = myBids.includes(rfq.id);
        return (
          <motion.div 
            key={rfq.id}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group flex flex-col"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="bg-blue-50 text-sas-blue text-xs font-bold px-3 py-1 rounded-full">{rfq.category}</span>
              <span className="text-xs text-gray-400 flex items-center gap-1"><Clock size={14} /> {new Date(rfq.created_at).toLocaleDateString('ar-EG')}</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{rfq.title}</h3>
            <div className="text-sm text-gray-500 mb-4 border-b pb-4">
              {rfq.buyer?.company_name} | <span className="text-amber-500 font-bold">{rfq.buyer?.trust_score} ⭐</span>
            </div>
            <div className="space-y-2 mb-6 flex-1">
              <div className="flex items-center text-sm text-gray-600 gap-2"><Package size={16} /> <span>الكمية: <strong>{rfq.quantity} {rfq.unit}</strong></span></div>
              <div className="flex items-center text-sm text-gray-600 gap-2"><MapPin size={16} /> <span className="truncate">الوجهة: {rfq.shipping_destination}</span></div>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => onChat(rfq.buyer_id)}
                className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-sas-blue hover:text-white transition-all shadow-sm border border-gray-100"
                title="تحدث مع المشتري"
              >
                <MessageSquare size={20} />
              </button>
              {hasBid ? (
                <div className="flex-1 py-3 bg-green-50 text-green-700 font-bold rounded-xl flex items-center justify-center gap-2 border border-green-100">
                  <CheckCircle2 size={18} /> تم العرض
                </div>
              ) : (
                <button 
                  onClick={() => onBid(rfq)}
                  className="flex-1 py-3 bg-sas-blue text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-100"
                >
                  تقديم عرض <ChevronLeft size={18} />
                </button>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  </div>
);

// --- Main Supplier Dashboard Component ---

export default function SupplierDashboard() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [rfqs, setRfqs] = useState([]);
  const [myBids, setMyBids] = useState([]);
  
  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeRecipient, setActiveRecipient] = useState(null);
  const [selectedRFQ, setSelectedRFQ] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form States
  const [productForm, setProductForm] = useState({ 
    name: '', 
    category: '', 
    price: '', 
    stock: '', 
    minimum_quantity: 1, 
    image_url: '', 
    description: '',
    tiered_prices: [] // Array of { min_qty: number, price: number }
  });
  const [bidForm, setBidForm] = useState({ price: '', deliveryDays: '', notes: '' });

  const fetchData = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      // 1. Fetch Products
      const { data: prodData } = await supabase.from('products').select('*').eq('vendor_id', currentUser.id);
      setProducts(prodData || []);

      // 2. Fetch Open RFQs
      const { data: rfqData } = await supabase.from('rfqs').select('*, buyer:users!buyer_id(company_name, trust_score)').eq('status', 'OPEN').order('created_at', { ascending: false });
      setRfqs(rfqData || []);

      // 3. Fetch My Bids
      const { data: bidsData } = await supabase.from('quotations').select('rfq_id').eq('supplier_id', currentUser.id);
      setMyBids(bidsData ? bidsData.map(b => b.rfq_id) : []);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  // Handlers
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = { ...productForm, vendor_id: currentUser.id };
      if (editingProduct) {
        await supabase.from('products').update(payload).eq('id', editingProduct.id);
        toast({ title: '✅ تم تحديث المنتج' });
      } else {
        await supabase.from('products').insert([payload]);
        toast({ title: '✅ تم إضافة المنتج للكتالوج' });
      }
      setIsProductModalOpen(false);
      setEditingProduct(null);
      fetchData();
    } catch (err) {
      toast({ title: '❌ خطأ', description: err.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitBid = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await supabase.from('quotations').insert([{
        rfq_id: selectedRFQ.id,
        supplier_id: currentUser.id,
        price: parseFloat(bidForm.price),
        lead_time_days: parseInt(bidForm.deliveryDays),
        notes: bidForm.notes,
        status: 'PENDING'
      }]);
      toast({ title: '🚀 تم إرسال العرض بنجاح' });
      setIsBidModalOpen(false);
      fetchData();
    } catch (err) {
      toast({ title: '❌ خطأ', description: err.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    await supabase.from('products').delete().eq('id', id);
    fetchData();
  };

  const stats = {
    sales: products.reduce((acc, p) => acc + (p.price * 5), 0), // Mock data
    products: products.length,
    bids: myBids.length,
    rating: currentUser?.trust_score || 4.8
  };

  const navItems = [
    { id: 'overview', label: 'لوحة التحكم', icon: LayoutDashboard },
    { id: 'catalog', label: 'إدارة الكتالوج', icon: Package },
    { id: 'bids', label: 'مركز العطاءات', icon: Gavel },
    { id: 'orders', label: 'الطلبات والشحن', icon: Truck },
    { id: 'analytics', label: 'الإحصائيات', icon: BarChart3 },
    { id: 'settings', label: 'الإعدادات', icon: Settings },
  ];

  if (!currentUser) return <div className="h-screen flex items-center justify-center">يرجى تسجيل الدخول أولاً</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row" dir="rtl">
      
      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-white border-l border-gray-100 flex flex-col sticky top-0 h-auto md:h-screen z-20">
        <div className="p-8 border-b border-gray-50">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-sas-blue rounded-xl flex items-center justify-center text-white font-bold">SAS</div>
            <h1 className="font-black text-xl text-gray-900">مركز الموردين</h1>
          </div>
          <div className="bg-blue-50 p-4 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-blue-100 overflow-hidden">
              <ShieldCheck className="text-sas-blue" size={24} />
            </div>
            <div className="flex-1">
              <p className="text-xs text-blue-600 font-bold">مورد موثق</p>
              <p className="text-sm font-bold text-gray-900 truncate">{currentUser.company_name}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                activeTab === item.id 
                  ? 'bg-sas-blue text-white shadow-lg shadow-blue-100 font-bold scale-[1.02]' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-sas-blue'
              }`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-gray-50">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors">
            <X size={20} />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 lg:p-12 overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-black text-gray-900">{navItems.find(i => i.id === activeTab)?.label}</h2>
            <p className="text-gray-500 mt-1">مرحباً بك مجدداً، إليك نظرة سريعة على أعمالك اليوم.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="text" placeholder="بحث سريع..." className="pr-10 pl-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-sas-blue outline-none w-64" />
            </div>
            <button className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-50">
              <Filter size={18} />
            </button>
          </div>
        </header>

        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="animate-spin text-sas-blue w-12 h-12" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && <OverviewView key="overview" stats={stats} recentRFQs={rfqs} />}
            {activeTab === 'catalog' && (
              <CatalogView 
                key="catalog"
                products={products} 
                onAdd={() => { setEditingProduct(null); setProductForm({ name: '', category: '', price: '', stock: '', minimum_quantity: 1, image_url: '', description: '', tiered_prices: [] }); setIsProductModalOpen(true); }}
                onEdit={(p) => { setEditingProduct(p); setProductForm({ ...p, tiered_prices: p.tiered_prices || [] }); setIsProductModalOpen(true); }}
                onDelete={handleDeleteProduct}
              />
            )}
            {activeTab === 'bids' && <BidCenterView key="bids" rfqs={rfqs} myBids={myBids} onBid={(rfq) => { setSelectedRFQ(rfq); setIsBidModalOpen(true); }} onChat={(bidderId) => { setActiveRecipient(bidderId); setIsChatOpen(true); }} />}
            {['orders', 'analytics', 'settings'].includes(activeTab) && (
              <div key="placeholder" className="h-96 flex flex-col items-center justify-center bg-white rounded-3xl border border-gray-100 shadow-sm border-dashed">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
                   <PlusCircle size={40} />
                </div>
                <h3 className="text-xl font-bold text-gray-400">هذا القسم قيد التطوير</h3>
                <p className="text-gray-300 mt-2">سيكون متاحاً في التحديث القادم للوصول لمستوى علي بابا</p>
              </div>
            )}
          </AnimatePresence>
        )}
      </main>

      {/* Product Modal */}
      <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
        <DialogContent className="sm:max-w-xl p-0 overflow-hidden rounded-3xl border-none shadow-2xl" dir="rtl">
          <div className="p-8 bg-gradient-to-br from-blue-600 to-sas-blue text-white">
            <h3 className="text-2xl font-black">{editingProduct ? 'تعديل بيانات المنتج' : 'إضافة منتج جديد للكتالوج'}</h3>
            <p className="text-blue-100 mt-2 opacity-80">أضف صوراً ومواصفات دقيقة لزيادة فرص البيع</p>
          </div>
          <form onSubmit={handleSaveProduct} className="p-8 space-y-5 bg-white">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1">
                <label className="text-sm font-bold text-gray-700">اسم المنتج</label>
                <input required value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-sas-blue outline-none" placeholder="مثال: مضخة مياه توربينية عالية الجودة" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700">الفئة</label>
                <input required value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-sas-blue outline-none" placeholder="مثال: معدات ثقيلة" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700">السعر ($)</label>
                <input required type="number" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-sas-blue outline-none" placeholder="0.00" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700">أقل كمية للطلب (MOQ)</label>
                <input required type="number" value={productForm.minimum_quantity} onChange={e => setProductForm({...productForm, minimum_quantity: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-sas-blue outline-none" placeholder="1" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700">المخزون المتاح</label>
                <input required type="number" value={productForm.stock} onChange={e => setProductForm({...productForm, stock: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-sas-blue outline-none" placeholder="0" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">رابط صورة المنتج</label>
              <input value={productForm.image_url} onChange={e => setProductForm({...productForm, image_url: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-sas-blue outline-none text-left" dir="ltr" placeholder="https://..." />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">وصف المنتج</label>
              <textarea rows="3" value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-sas-blue outline-none" placeholder="اكتب تفاصيل المنتج ومميزاته..."></textarea>
            </div>

            <div className="space-y-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-gray-700">الأسعار المتدرجة (Tiered Pricing)</label>
                <button 
                  type="button"
                  onClick={() => setProductForm({...productForm, tiered_prices: [...(productForm.tiered_prices || []), { min_qty: '', price: '' }]})}
                  className="text-xs bg-sas-blue text-white px-3 py-1 rounded-lg font-bold hover:bg-blue-700 transition-colors"
                >
                  + إضافة مستوى
                </button>
              </div>
              <p className="text-[10px] text-gray-400">مثال: 100 قطعة بسعر $80 بدلاً من السعر الأصلي.</p>
              
              <div className="space-y-2">
                {productForm.tiered_prices?.map((tier, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input 
                      type="number" 
                      placeholder="أقل كمية" 
                      className="flex-1 px-3 py-2 text-sm bg-white border border-gray-100 rounded-lg outline-none focus:ring-1 focus:ring-sas-blue"
                      value={tier.min_qty}
                      onChange={(e) => {
                        const newTiers = [...productForm.tiered_prices];
                        newTiers[idx].min_qty = e.target.value;
                        setProductForm({...productForm, tiered_prices: newTiers});
                      }}
                    />
                    <input 
                      type="number" 
                      placeholder="السعر ($)" 
                      className="flex-1 px-3 py-2 text-sm bg-white border border-gray-100 rounded-lg outline-none focus:ring-1 focus:ring-sas-blue"
                      value={tier.price}
                      onChange={(e) => {
                        const newTiers = [...productForm.tiered_prices];
                        newTiers[idx].price = e.target.value;
                        setProductForm({...productForm, tiered_prices: newTiers});
                      }}
                    />
                    <button 
                      type="button" 
                      onClick={() => {
                        const newTiers = productForm.tiered_prices.filter((_, i) => i !== idx);
                        setProductForm({...productForm, tiered_prices: newTiers});
                      }}
                      className="p-2 text-red-400 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-4 flex gap-3">
              <button disabled={isSubmitting} type="submit" className="flex-1 bg-sas-blue text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (editingProduct ? 'حفظ التعديلات' : 'نشر المنتج الآن')}
              </button>
              <button type="button" onClick={() => setIsProductModalOpen(false)} className="px-8 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-colors">إلغاء</button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Bid Modal */}
      <Dialog open={isBidModalOpen} onOpenChange={setIsBidModalOpen}>
        <DialogContent className="sm:max-w-lg p-8 rounded-3xl shadow-2xl border-none" dir="rtl">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-black text-gray-900">تقديم عرض سعر</DialogTitle>
          </DialogHeader>
          <div className="bg-blue-50 p-4 rounded-2xl mb-6">
             <p className="text-sm text-blue-900">أنت تقدم عرضاً على: <strong className="block text-lg mt-1">{selectedRFQ?.title}</strong></p>
          </div>
          <form onSubmit={handleSubmitBid} className="space-y-5">
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">السعر الإجمالي المقترح ($)</label>
              <input required type="number" value={bidForm.price} onChange={e => setBidForm({...bidForm, price: e.target.value})} className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-sas-blue outline-none text-xl font-black text-sas-blue" placeholder="0.00" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">مدة التوصيل (بالأيام)</label>
              <input required type="number" value={bidForm.deliveryDays} onChange={e => setBidForm({...bidForm, deliveryDays: e.target.value})} className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-sas-blue outline-none" placeholder="15" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">ملاحظات العرض</label>
              <textarea rows="3" value={bidForm.notes} onChange={e => setBidForm({...bidForm, notes: e.target.value})} className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-sas-blue outline-none" placeholder="أضف تفاصيل حول الشحن أو جودة المنتج..."></textarea>
            </div>
            <button disabled={isSubmitting} type="submit" className="w-full bg-sas-blue text-white py-5 rounded-2xl font-bold shadow-xl shadow-blue-100 hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-lg">
              {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : 'إرسال العرض التنافسي'}
            </button>
          </form>
        </DialogContent>
      </Dialog>

      <AnimatePresence>
        {isChatOpen && (
          <LiveChat 
            isOpen={isChatOpen} 
            onClose={() => setIsChatOpen(false)} 
            recipientId={activeRecipient}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
