import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Package, 
  ChevronLeft, 
  Star, 
  ShieldCheck, 
  Truck, 
  Loader2, 
  ArrowRight,
  ShoppingCart,
  MessageCircle,
  Tag,
  Scale
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import LiveChat from '@/components/sas/LiveChat';
import { useAuth } from '@/contexts/AuthContext';

export default function Marketplace() {
  const { currentUser } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeRecipient, setActiveRecipient] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, users(company_name)')
        .eq('is_approved', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      const formattedData = (data || []).map(p => ({
        ...p,
        vendor: p.users // Map users to vendor
      }));
      setProducts(formattedData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const categories = ['All', ...new Set(products.map(p => p.category).filter(Boolean))];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC]" dir="rtl">
      {/* Hero Section */}
      <section className="bg-sas-blue text-white py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-48 -mt-48"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl font-black mb-6 leading-tight"
            >
              سوق الجملة المفتوح (B2B Marketplace)
            </motion.h1>
            <p className="text-xl text-blue-100 mb-10 opacity-90 leading-relaxed">
              تصفح آلاف المنتجات الجاهزة للشحن من موردين موثوقين. اطلب مباشرة أو تفاوض على أفضل الأسعار للكميات الضخمة.
            </p>
            
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
                <input 
                  type="text" 
                  placeholder="ماذا تبحث عنه اليوم؟ (مثلاً: مضخات، فلاتر، صمامات...)"
                  className="w-full pr-14 pl-6 py-5 rounded-2xl text-gray-900 text-lg outline-none focus:ring-4 focus:ring-blue-400/50 transition-all shadow-2xl"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-black px-10 py-5 rounded-2xl text-lg shadow-xl h-auto">
                بحث في الكتالوج
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-72 space-y-8">
            <div>
              <h3 className="font-black text-xl mb-6 flex items-center gap-2">
                <Filter size={20} /> التصنيفات
              </h3>
              <div className="space-y-2">
                {categories.map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-right px-4 py-3 rounded-xl transition-all font-bold ${selectedCategory === cat ? 'bg-sas-blue text-white shadow-lg shadow-blue-100' : 'bg-white text-gray-500 hover:bg-gray-100'}`}
                  >
                    {cat === 'All' ? 'جميع المنتجات' : cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <h4 className="font-black mb-4 flex items-center gap-2">
                <ShieldCheck size={18} className="text-sas-blue" /> معايير الثقة
              </h4>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" className="w-5 h-5 rounded-md border-gray-300 text-sas-blue focus:ring-sas-blue" />
                  <span className="text-sm font-bold text-gray-600 group-hover:text-sas-blue">موردين موثقين فقط</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" className="w-5 h-5 rounded-md border-gray-300 text-sas-blue focus:ring-sas-blue" />
                  <span className="text-sm font-bold text-gray-600 group-hover:text-sas-blue">يدعم حساب الضمان</span>
                </label>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <main className="flex-1">
            <div className="flex justify-between items-center mb-8">
              <p className="text-gray-500 font-bold">تم العثور على <span className="text-sas-blue">{filteredProducts.length}</span> منتج متاح</p>
              <div className="flex gap-2">
                 <span className="text-sm text-gray-400">ترتيب حسب:</span>
                 <select className="bg-transparent font-bold text-sas-blue outline-none cursor-pointer">
                    <option>الأكثر صلة</option>
                    <option>الأحدث</option>
                    <option>السعر: من الأقل للأعلى</option>
                 </select>
              </div>
            </div>

            {loading ? (
              <div className="h-96 flex items-center justify-center">
                <Loader2 className="animate-spin text-sas-blue w-16 h-16" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredProducts.map((p, i) => (
                  <motion.div 
                    key={p.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (i % 6) * 0.1 }}
                    className="bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 group flex flex-col"
                  >
                    {/* Image Container */}
                    <div className="h-64 bg-gray-100 relative overflow-hidden">
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300"><Package size={64} /></div>
                      )}
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-black text-sas-blue flex items-center gap-1 shadow-sm">
                        <Truck size={12} /> شحن سريع
                      </div>
                      <div className="absolute bottom-4 right-4 bg-sas-blue text-white px-4 py-2 rounded-2xl font-black text-sm shadow-xl">
                        ${p.price} <span className="text-[10px] font-normal opacity-70">/ للقطعة</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-center gap-2 mb-2">
                         <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{p.category}</span>
                         <div className="flex-1 h-[1px] bg-gray-100"></div>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-sas-blue transition-colors line-clamp-1">{p.name}</h3>
                      
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">أقل كمية (MOQ):</span>
                          <span className="font-bold text-gray-900">{p.minimum_quantity} {p.unit || 'قطعة'}</span>
                        </div>
                        <div className="flex items-center gap-2 pt-3 border-t border-gray-50">
                           <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-sas-blue border border-gray-100 font-black text-[10px]">
                              {p.vendor?.company_name?.[0]}
                           </div>
                           <div className="flex-1 overflow-hidden">
                              <p className="text-xs font-bold text-gray-700 truncate">{p.vendor?.company_name}</p>
                              <div className="flex items-center gap-1 text-[10px] text-amber-500 font-bold">
                                 {p.vendor?.trust_score} <Star size={10} className="fill-amber-500" />
                                 <span className="text-gray-300 font-normal">| {p.vendor?.tier === 'GOLD' ? 'ذهبي' : 'فضي'}</span>
                              </div>
                           </div>
                        </div>
                      </div>

                      <div className="mt-auto flex gap-2">
                        <Link to={`/product/${p.id}`} className="flex-1 bg-sas-blue text-white py-3 rounded-2xl font-bold text-center text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100">
                          اطلب الآن
                        </Link>
                        <button 
                          onClick={() => { setActiveRecipient(p.vendor_id); setIsChatOpen(true); }}
                          className="w-12 h-12 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center hover:bg-sas-blue hover:text-white transition-all"
                        >
                          <MessageCircle size={20} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Trust Banner */}
      <section className="bg-white border-t border-gray-100 py-16 mt-20">
         <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex items-center gap-6">
               <div className="w-16 h-16 bg-blue-50 text-sas-blue rounded-3xl flex items-center justify-center shrink-0">
                  <ShieldCheck size={32} />
               </div>
               <div>
                  <h4 className="font-black text-lg mb-1">حماية المشتري</h4>
                  <p className="text-sm text-gray-500">نضمن وصول المنتج بالمواصفات المطلوبة أو استرداد أموالك بالكامل عبر نظام الضمان.</p>
               </div>
            </div>
            <div className="flex items-center gap-6">
               <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-3xl flex items-center justify-center shrink-0">
                  <Scale size={32} />
               </div>
               <div>
                  <h4 className="font-black text-lg mb-1">التفاوض المباشر</h4>
                  <p className="text-sm text-gray-500">تواصل مباشرة مع المصنعين للحصول على أسعار خاصة للكميات الضخمة والعقود السنوية.</p>
               </div>
            </div>
            <div className="flex items-center gap-6">
               <div className="w-16 h-16 bg-green-50 text-green-600 rounded-3xl flex items-center justify-center shrink-0">
                  <Truck size={32} />
               </div>
               <div>
                  <h4 className="font-black text-lg mb-1">لوجستيات متكاملة</h4>
                  <p className="text-sm text-gray-500">خدمات تتبع الشحن والتفتيش قبل الشحن لضمان جودة كل قطعة تطلبها من المنصة.</p>
               </div>
            </div>
         </div>
      </section>

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
