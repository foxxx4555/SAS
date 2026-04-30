import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, ShoppingCart, PackageOpen, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

const VendorDashboardPage = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    
    const fetchVendorStats = async () => {
      setLoading(true);
      try {
        // Fetch Orders for this vendor
        const { data: orders, error: ordersErr } = await supabase
          .from('orders')
          .select('id, total_amount')
          .eq('vendor_id', currentUser.id)
          .neq('status', 'rejected');
        
        if (ordersErr) throw ordersErr;

        const totalOrdersCount = orders ? orders.length : 0;
        const totalSalesSum = orders ? orders.reduce((sum, order) => sum + Number(order.total_amount), 0) : 0;

        // Fetch Products for this vendor
        const { count: productsCount, error: productsErr } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('vendor_id', currentUser.id);

        if (productsErr) throw productsErr;

        setStats({
          totalSales: totalSalesSum,
          totalOrders: totalOrdersCount,
          totalProducts: productsCount || 0
        });

      } catch (error) {
        console.error("Error fetching vendor stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVendorStats();
  }, [currentUser]);

  if (loading) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-primary w-12 h-12" /></div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">نظرة عامة على أداء المتجر</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">إجمالي المبيعات المؤكدة</CardTitle>
            <DollarSign className="h-5 w-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalSales.toLocaleString('ar-SA')} ﷼</div>
            <p className="text-xs text-green-500 mt-1">+12% عن الشهر الماضي</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">إجمالي الطلبات الواردة</CardTitle>
            <ShoppingCart className="h-5 w-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">طلبات بإنتظار الشحن أو تم الشحن</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">المنتجات المعروضة</CardTitle>
            <PackageOpen className="h-5 w-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground mt-1">عنصر نشط في مستودعك الجملة</p>
          </CardContent>
        </Card>
      </div>
      
      {/* يمكن لاحقاً إضافة رسوم بيانية (Charts) هنا */}
      <div className="mt-8 bg-white p-6 rounded-xl border">
         <h3 className="text-lg font-semibold mb-4">تنويهات ساس اللوجستية</h3>
         <div className="p-4 bg-blue-50 text-blue-800 rounded-lg text-sm">
            مرحباً بك في منصة ساس اللوجستية. يمكنك الآن استقبال الطلبات، وبمجرد قبولك لأي طلب سيتم تعيين مندوب ساس فوراً لنقل بضاعتك من مستودعك للمشتري.
         </div>
      </div>
    </div>
  );
};

export default VendorDashboardPage;
