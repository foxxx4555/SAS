import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Activity, Users, DollarSign, Package, ShieldCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductModeration from '@/components/admin/ProductModeration';
import UserVerification from '@/components/admin/UserVerification';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    escrowFunds: 0,
    newSuppliers: 0,
    totalRFQs: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('overview');

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        // Fetch Total RFQs
        const { count: rfqCount, error: rfqErr } = await supabase
          .from('rfqs')
          .select('*', { count: 'exact', head: true });

        // Fetch Orders and Escrow Funds
        const { data: orders, error: ordersErr } = await supabase
          .from('orders')
          .select('total_amount, escrow_status');
          
        let escrowTotal = 0;
        if (orders) {
          orders.forEach(order => {
            if (order.escrow_status !== 'REFUNDED') {
              escrowTotal += Number(order.total_amount);
            }
          });
        }

        // Fetch New Suppliers
        const { count: suppliersCount, error: supErr } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'SUPPLIER');

        setStats({
          totalOrders: orders?.length || 0,
          escrowFunds: escrowTotal,
          newSuppliers: suppliersCount || 0,
          totalRFQs: rfqCount || 0
        });

      } catch (error) {
        console.error("Error fetching admin stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <Link to="/" className="flex items-center gap-2 text-gray-500 hover:text-sas-blue mb-6 transition-colors w-fit">
          <ArrowRight size={20} /> العودة للرئيسية
        </Link>

        <div className="bg-[#1E40AF] rounded-3xl p-8 text-white mb-10 relative overflow-hidden shadow-lg shadow-blue-900/20">
          <div className="absolute top-0 right-0 opacity-10"><ShieldCheck size={200} /></div>
          <h1 className="text-3xl font-black mb-2 relative z-10 flex items-center gap-3">
            <Activity /> لوحة الإدارة العليا (SAS Admin)
          </h1>
          <p className="text-blue-200 relative z-10 text-lg">نظرة عامة على أداء المنصة المالي والتشغيلي.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white h-32 rounded-2xl animate-pulse border border-gray-100"></div>
            ))}
          </div>
        ) : (
          <>
            {activeView === 'overview' ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                    <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-50 rounded-full z-0 group-hover:scale-150 transition-transform"></div>
                    <div className="relative z-10">
                      <div className="w-12 h-12 bg-blue-100 text-[#1E40AF] rounded-xl flex items-center justify-center mb-4"><Package size={24} /></div>
                      <p className="text-sm font-bold text-gray-500 mb-1">إجمالي طلبات التسعير (RFQs)</p>
                      <h3 className="text-3xl font-black text-gray-900">{stats.totalRFQs}</h3>
                    </div>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                    <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-green-50 rounded-full z-0 group-hover:scale-150 transition-transform"></div>
                    <div className="relative z-10">
                      <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-4"><DollarSign size={24} /></div>
                      <p className="text-sm font-bold text-gray-500 mb-1">إجمالي الأموال بالضمان (Escrow)</p>
                      <h3 className="text-3xl font-black text-gray-900">${stats.escrowFunds.toLocaleString()}</h3>
                    </div>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                    <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-amber-50 rounded-full z-0 group-hover:scale-150 transition-transform"></div>
                    <div className="relative z-10">
                      <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-4"><ShieldCheck size={24} /></div>
                      <p className="text-sm font-bold text-gray-500 mb-1">إجمالي الأوامر (Orders)</p>
                      <h3 className="text-3xl font-black text-gray-900">{stats.totalOrders}</h3>
                    </div>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                    <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-purple-50 rounded-full z-0 group-hover:scale-150 transition-transform"></div>
                    <div className="relative z-10">
                      <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4"><Users size={24} /></div>
                      <p className="text-sm font-bold text-gray-500 mb-1">الموردين المعتمدين</p>
                      <h3 className="text-3xl font-black text-gray-900">{stats.newSuppliers}</h3>
                    </div>
                  </motion.div>
                </div>

                <div className="mt-12">
                  <h2 className="text-2xl font-black text-gray-900 mb-6">مركز التحكم والعمليات</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <button onClick={() => setActiveView('users')} className="text-right bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                        <div className="w-14 h-14 bg-blue-50 text-sas-blue rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><Users size={28} /></div>
                        <h3 className="text-xl font-bold mb-2">إدارة المستخدمين</h3>
                        <p className="text-gray-500 text-sm">توثيق حسابات الموردين والمشترين ومراجعة التراخيص.</p>
                     </button>
                     <button onClick={() => setActiveView('products')} className="text-right bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                        <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><Package size={28} /></div>
                        <h3 className="text-xl font-bold mb-2">مراجعة المنتجات</h3>
                        <p className="text-gray-500 text-sm">مراجعة وتعديل المنتجات المرفوعة في الكتالوج قبل النشر العام.</p>
                     </button>
                     <button onClick={() => setActiveView('orders')} className="text-right bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                        <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><DollarSign size={28} /></div>
                        <h3 className="text-xl font-bold mb-2">الإشراف المالي</h3>
                        <p className="text-gray-500 text-sm">مراقبة دفعات الضمان (Escrow) والعمولات وفض النزاعات.</p>
                     </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="animate-in slide-in-from-bottom duration-500">
                <button 
                  onClick={() => setActiveView('overview')}
                  className="mb-8 flex items-center gap-2 text-sas-blue font-bold hover:underline"
                >
                  <ArrowRight size={20} /> العودة لملخص الإدارة
                </button>
                {activeView === 'products' && <ProductModeration />}
                {activeView === 'users' && <UserVerification />}
                {activeView === 'orders' && (
                   <div className="bg-white p-20 rounded-[40px] text-center border border-gray-100 shadow-sm">
                      <h3 className="text-2xl font-black text-gray-400">هذه الواجهة قيد التطوير</h3>
                      <p className="text-gray-400 mt-2">نعمل على إضافة كافة أدوات التحكم المتقدمة.</p>
                   </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
