import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Gavel, 
  Wallet, 
  Truck, 
  Settings, 
  Plus, 
  Search, 
  Filter, 
  Loader2, 
  Package, 
  Clock, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  Star,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  X,
  MessageCircle,
  ShieldCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import LiveChat from '@/components/sas/LiveChat';
import LogisticsTimeline from '@/components/sas/LogisticsTimeline';

// --- Sub-Components for Buyer Views ---

const BuyerOverview = ({ stats, rfqs, setActiveRecipient, setIsChatOpen }) => (
  <div className="space-y-8 animate-in fade-in duration-500">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {[
        { title: 'الميزانية المحتجزة', value: `$${stats.escrow}`, icon: Wallet, color: 'text-sas-blue', bg: 'bg-blue-50' },
        { title: 'طلبات RFQ نشطة', value: stats.activeRFQs, icon: Gavel, color: 'text-amber-600', bg: 'bg-amber-50' },
        { title: 'شحنات في الطريق', value: stats.shipments, icon: Truck, color: 'text-green-600', bg: 'bg-green-50' },
        { title: 'إجمالي المشتريات', value: stats.totalOrders, icon: ShoppingBag, color: 'text-purple-600', bg: 'bg-purple-50' },
      ].map((stat, i) => (
        <motion.div 
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4"
        >
          <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center`}>
            <stat.icon size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold">{stat.title}</p>
            <p className="text-2xl font-black text-gray-900">{stat.value}</p>
          </div>
        </motion.div>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Recent RFQs */}
      <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <Gavel size={24} className="text-sas-blue" /> آخر طلبات التسعير (RFQs)
          </h3>
          <Link to="/rfq" className="text-sas-blue text-sm font-bold flex items-center gap-1 hover:underline">
            عرض الكل <ChevronLeft size={16} />
          </Link>
        </div>
        <div className="space-y-4">
          {rfqs.length > 0 ? (
            rfqs.slice(0, 3).map((rfq) => (
              <div key={rfq.id} className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-50 hover:border-blue-100 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm text-sas-blue font-bold">
                    {rfq.bids?.length || 0}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{rfq.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">تاريخ الطلب: {new Date(rfq.created_at).toLocaleDateString('ar-EG')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-3 py-1 rounded-full font-bold ${rfq.status === 'OPEN' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {rfq.status === 'OPEN' ? 'مفتوح' : 'مغلق'}
                  </span>
                  <button 
                    onClick={() => { setActiveRecipient(rfq.supplier_id || rfq.bids?.[0]?.supplier_id); setIsChatOpen(true); }}
                    className="p-2 bg-white rounded-lg border border-gray-100 text-gray-400 hover:text-sas-blue hover:border-blue-100 transition-colors"
                  >
                    <MessageCircle size={20} />
                  </button>
                  <Link to={`/buyer/rfq/${rfq.id}`} className="p-2 bg-white rounded-lg border border-gray-100 text-gray-400 hover:text-sas-blue hover:border-blue-100 transition-colors">
                    <ChevronLeft size={20} />
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
               <Package size={48} className="mx-auto text-gray-200 mb-2" />
               <p className="text-gray-400">لم تقم بإنشاء أي طلبات RFQ بعد</p>
            </div>
          )}
        </div>
      </div>

      {/* Recommended Suppliers */}
      <div className="bg-gradient-to-br from-sas-blue to-blue-800 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <h3 className="text-xl font-black mb-6 flex items-center gap-2">
          <Sparkles size={24} className="text-yellow-400" /> موردون مرشحون
        </h3>
        <div className="space-y-6">
          {[1, 2, 3].map((_, i) => (
            <div key={i} className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-sas-blue font-bold">M</div>
              <div className="flex-1">
                <h4 className="text-sm font-bold truncate">شركة توريدات مياه الوفاء</h4>
                <div className="flex items-center gap-1 text-xs text-yellow-400 font-bold mt-1">
                  4.9 <Star size={12} className="fill-yellow-400" /> <span className="text-white/60 font-normal mr-2">مورد ذهبي</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button className="w-full mt-8 py-3 bg-white text-sas-blue font-bold rounded-xl hover:bg-blue-50 transition-colors">
          تصفح السوق المفتوح
        </button>
      </div>
    </div>
  </div>
);

const WalletView = () => (
  <div className="space-y-8 animate-in fade-in duration-500">
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <h3 className="text-xl font-black mb-8">المحفظة المالية والضمان</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="p-6 bg-sas-blue rounded-3xl text-white shadow-xl shadow-blue-100 relative overflow-hidden">
            <div className="absolute right-0 bottom-0 opacity-10"><CreditCard size={120} /></div>
            <p className="text-sm opacity-80 mb-1">الرصيد الكلي</p>
            <p className="text-4xl font-black">$24,500.00</p>
            <div className="mt-8 flex gap-3">
              <button className="flex-1 bg-white text-sas-blue py-2 rounded-xl text-sm font-bold">شحن الرصيد</button>
              <button className="flex-1 bg-blue-700/50 text-white py-2 rounded-xl text-sm font-bold border border-white/20">سحب</button>
            </div>
          </div>
          <div className="p-6 bg-amber-50 border border-amber-100 rounded-3xl text-amber-900">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-white rounded-2xl shadow-sm text-amber-600"><ShieldCheck size={24} /></div>
              <span className="text-xs bg-amber-200/50 px-2 py-1 rounded-full font-bold">في حساب الضمان</span>
            </div>
            <p className="text-sm font-bold opacity-70">أموال محتجزة للطلبات</p>
            <p className="text-3xl font-black mt-1">$12,800.00</p>
            <p className="text-xs mt-4">سيتم تحويل المبالغ للمورد فور تأكيد الاستلام</p>
          </div>
        </div>

        <h4 className="font-bold mb-4 text-gray-700">آخر المعاملات</h4>
        <div className="space-y-3">
          {[
            { type: 'out', label: 'تأمين طلب RFQ #542', amount: '-$5,000', date: '24 أبريل 2026', status: 'محجوز' },
            { type: 'in', label: 'شحن محفظة عبر فيزا', amount: '+$10,000', date: '20 أبريل 2026', status: 'مكتمل' },
            { type: 'out', label: 'دفع مباشر - منتج مضخة توربينية', amount: '-$1,200', date: '18 أبريل 2026', status: 'مكتمل' },
          ].map((tx, i) => (
            <div key={i} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'in' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                  {tx.type === 'in' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{tx.label}</p>
                  <p className="text-xs text-gray-400">{tx.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-black ${tx.type === 'in' ? 'text-green-600' : 'text-gray-900'}`}>{tx.amount}</p>
                <p className="text-[10px] font-bold text-gray-400">{tx.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-8">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h4 className="font-bold mb-4">نصيحة الأمان</h4>
          <p className="text-sm text-gray-500 leading-relaxed">
            لا تقم بتحويل الأموال خارج نظام الضمان الخاص بالمنصة. نحن نضمن حقك في استرجاع المال إذا لم يتطابق المنتج مع المواصفات.
          </p>
          <button className="mt-4 text-sas-blue font-bold text-sm hover:underline">كيف يعمل حساب الضمان؟</button>
        </div>
        <div className="bg-blue-900 p-8 rounded-3xl shadow-xl text-white">
          <h4 className="font-bold mb-4">بطاقتك النشطة</h4>
          <div className="h-40 bg-gradient-to-r from-blue-700 to-blue-600 rounded-2xl p-6 relative">
            <div className="flex justify-between items-start">
               <span className="font-bold tracking-widest italic opacity-50">VISA</span>
               <div className="w-10 h-10 bg-white/20 rounded-lg backdrop-blur-sm"></div>
            </div>
            <div className="mt-8">
               <p className="text-lg tracking-widest font-mono">**** **** **** 8842</p>
               <p className="text-xs mt-2 opacity-50 uppercase">Company Name SAS</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// --- Main Buyer Dashboard Component ---

export default function BuyerDashboard() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [rfqs, setRfqs] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeRecipient, setActiveRecipient] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const fetchMyRFQs = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('rfqs')
        .select('*, bids:quotations(id)') 
        .eq('buyer_id', currentUser.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setRfqs(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRFQs();
  }, [currentUser]);

  const stats = {
    escrow: 12800,
    activeRFQs: rfqs.filter(r => r.status === 'OPEN').length,
    shipments: 2,
    totalOrders: 15
  };

  const navItems = [
    { id: 'overview', label: 'لوحة التحكم', icon: LayoutDashboard },
    { id: 'orders', label: 'مشترياتي', icon: ShoppingBag },
    { id: 'rfqs', label: 'طلبات الـ RFQ', icon: Gavel },
    { id: 'wallet', label: 'المحفظة المالية', icon: Wallet },
    { id: 'tracking', label: 'تتبع الشحنات', icon: Truck },
    { id: 'settings', label: 'الإعدادات', icon: Settings },
  ];

  if (!currentUser) return <div className="h-screen flex items-center justify-center">يرجى تسجيل الدخول أولاً</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row font-inter" dir="rtl">
      
      {/* Sidebar */}
      <aside className={`bg-white border-l border-gray-100 flex flex-col sticky top-0 h-auto md:h-screen z-30 transition-all duration-300 ${isSidebarOpen ? 'w-full md:w-80' : 'w-24'}`}>
        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
          {(isSidebarOpen || window.innerWidth < 768) && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-sas-blue rounded-xl flex items-center justify-center text-white font-black text-xs">SAS</div>
              <h1 className="font-black text-xl text-gray-900">مركز المشتري</h1>
            </div>
          )}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-50 rounded-lg text-gray-400 hidden md:block">
            {isSidebarOpen ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        <nav className="flex-1 p-6 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group ${
                activeTab === item.id 
                  ? 'bg-sas-blue text-white shadow-2xl shadow-blue-100 font-bold' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-sas-blue'
              }`}
            >
              <item.icon size={22} className={`${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'} transition-transform`} />
              {isSidebarOpen && <span className="text-sm tracking-wide">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-gray-50">
          <div className={`bg-gray-50 p-4 rounded-2xl flex items-center gap-3 ${!isSidebarOpen && 'justify-center'}`}>
            <div className="w-10 h-10 rounded-full bg-sas-blue/10 flex items-center justify-center text-sas-blue font-bold text-xs shrink-0">
              {currentUser.first_name?.[0]}{currentUser.last_name?.[0]}
            </div>
            {isSidebarOpen && (
              <div className="flex-1 truncate">
                <p className="text-xs font-bold text-gray-900 truncate">{currentUser.company_name}</p>
                <p className="text-[10px] text-gray-400 truncate">{currentUser.email}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="text-4xl font-black text-gray-900 tracking-tight">{navItems.find(i => i.id === activeTab)?.label}</h2>
            <p className="text-gray-500 mt-2 text-lg">مرحباً {currentUser.first_name}، إليك تفاصيل حسابك لهذا اليوم.</p>
          </motion.div>
          <div className="flex gap-3">
            <Link to="/rfq" className="bg-sas-blue text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center gap-2 scale-100 hover:scale-105">
              <Plus size={20} /> إنشاء طلب RFQ جديد
            </Link>
            <Link to="/" className="bg-white border border-gray-200 text-gray-700 px-6 py-4 rounded-2xl font-bold hover:bg-gray-50 transition-all">
              تصفح السوق
            </Link>
          </div>
        </header>

        {loading ? (
          <div className="h-96 flex items-center justify-center">
            <Loader2 className="animate-spin text-sas-blue w-16 h-16" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && <BuyerOverview key="overview" stats={stats} rfqs={rfqs} setActiveRecipient={setActiveRecipient} setIsChatOpen={setIsChatOpen} />}
            {activeTab === 'wallet' && <WalletView key="wallet" />}
            {activeTab === 'tracking' && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <LogisticsTimeline status="IN_TRANSIT" trackingNumber="SAS-9921-XQ" destination="ميناء الإسكندرية، مصر" />
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                   <h3 className="font-bold mb-4">تاريخ الشحنات السابقة</h3>
                   <div className="text-center py-10 text-gray-400">
                      <Truck size={48} className="mx-auto opacity-20 mb-2" />
                      <p>لا توجد شحنات مكتملة حتى الآن.</p>
                   </div>
                </div>
              </div>
            )}
            {['orders', 'rfqs', 'settings'].includes(activeTab) && (
              <motion.div 
                key="placeholder"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="h-[500px] flex flex-col items-center justify-center bg-white rounded-[40px] border border-gray-100 shadow-sm border-dashed p-10 text-center"
              >
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 mb-6">
                   <Sparkles size={48} />
                </div>
                <h3 className="text-2xl font-black text-gray-400 mb-3">هذا القسم يكتمل الآن</h3>
                <p className="text-gray-400 max-w-sm leading-relaxed">نحن نعمل على توفير تجربة شراء احترافية تضاهي المنصات العالمية. التحديث القادم سيتضمن إدارة الشحنات بالكامل.</p>
                <button onClick={() => setActiveTab('overview')} className="mt-8 px-8 py-3 bg-sas-blue/10 text-sas-blue rounded-xl font-bold hover:bg-sas-blue/20 transition-colors">العودة للرئيسية</button>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      {/* Live Chat Component */}
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
