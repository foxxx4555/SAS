import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { Button } from '@/components/ui/button';

const VendorOrdersPage = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    if (!currentUser) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        product:products(name, image_url),
        buyer:profiles(first_name, last_name, phone)
      `)
      .eq('vendor_id', currentUser.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error(error);
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [currentUser]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);
    
    if (error) {
      toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'تم التحديث!', description: `تم تغيير حالة الطلب إلى: ${newStatus}` });
      fetchOrders();
    }
  };

  if (loading) return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">الطلبات الواردة من المتاجر (مبيعات الجملة)</h2>
      
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-right bg-white text-sm">
          <thead className="bg-gray-50 border-b text-gray-600">
            <tr>
              <th className="p-4 font-semibold">رقم الطلب</th>
              <th className="p-4 font-semibold">المنتج</th>
              <th className="p-4 font-semibold">المشتري</th>
              <th className="p-4 font-semibold">الكمية</th>
              <th className="p-4 font-semibold">الإجمالي</th>
              <th className="p-4 font-semibold">الحالة</th>
              <th className="p-4 font-semibold text-center">إجراء (تنويه لمندوب ساس)</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-8 text-center text-gray-500">لا يوجد طلبات واردة حتى الآن.</td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 text-xs font-mono text-gray-500">{order.id.slice(0, 8)}...</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {order.product?.image_url && <img src={order.product.image_url} alt="" className="w-8 h-8 rounded object-cover" />}
                      <span className="font-medium">{order.product?.name || 'منتج محذوف'}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">
                     {order.buyer?.first_name} {order.buyer?.last_name}<br/>
                     <span className="text-xs">{order.buyer?.phone}</span>
                  </td>
                  <td className="p-4 font-medium">{order.quantity} كرتونة</td>
                  <td className="p-4 text-primary font-bold">{order.total_amount} ﷼</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs
                      ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        order.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        order.status === 'shipped_by_sas' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-red-100 text-red-800'}`}>
                      {order.status === 'pending' ? 'قيد الانتظار' : 
                       order.status === 'accepted' ? 'مقبول (بانتظار ساس)' :
                       order.status === 'shipped_by_sas' ? 'مع مندوب ساس' :
                       order.status === 'delivered' ? 'مكتمل' : 'مرفوض'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                       {order.status === 'pending' && (
                         <>
                           <Button size="sm" onClick={() => handleUpdateStatus(order.id, 'accepted')} className="bg-green-600 hover:bg-green-700 flex gap-1 h-8">
                             <CheckCircle size={14} /> قبول التجهيز
                           </Button>
                           <Button size="sm" onClick={() => handleUpdateStatus(order.id, 'rejected')} variant="destructive" className="flex gap-1 h-8">
                             <XCircle size={14} /> رفض
                           </Button>
                         </>
                       )}
                       {order.status === 'accepted' && (
                         <div className="text-xs text-blue-600 font-medium">✨ مندوب ساس في الطريق إليك لاستلامها</div>
                       )}
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
};

export default VendorOrdersPage;
