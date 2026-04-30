// src/pages/UserOrdersPage.jsx (النسخة النهائية والمُصححة)

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
import { Loader2 } from 'lucide-react';

// --- دوال مساعدة ---
const formatPrice = (price) => {
    if (typeof price !== 'number') return 'N/A';
    return new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(price);
};

const formatDate = (dateString) => {
    if (!dateString) return 'تاريخ غير معروف';
    return new Intl.DateTimeFormat('ar-EG', {
        day: 'numeric', month: 'long', year: 'numeric'
    }).format(new Date(dateString));
};

const getStatusInfo = (status) => {
    const statuses = {
        pending: { label: "قيد المراجعة", color: "bg-yellow-100", textColor: "text-yellow-800" },
        accepted: { label: "تم القبول - التجهيز", color: "bg-sky-100", textColor: "text-sky-800" },
        shipped_by_sas: { label: "مع مندوب ساس", color: "bg-blue-100", textColor: "text-blue-800" },
        delivered: { label: "تم التوصيل", color: "bg-green-100", textColor: "text-green-800" }, 
        rejected: { label: "مرفوض", color: "bg-red-100", textColor: "text-red-800" },
    };
    return statuses[status] || { label: status, color: "bg-slate-100 dark:bg-slate-700", textColor: "text-slate-800 dark:text-slate-300" };
};

const UserOrdersPage = () => {
    const { currentUser } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) {
            setLoading(false);
            return;
        }
        setLoading(true);

        const fetchOrders = async () => {
            const { data, error } = await supabase
                .from('orders')
                .select(`
                  *,
                  product:products(name, image_url),
                  vendor:vendors(store_name)
                `)
                .eq('buyer_id', currentUser.id)
                .order('created_at', { ascending: false });
            
            if (error) {
                console.error("Error fetching user orders: ", error);
            } else {
                setOrders(data || []);
            }
            setLoading(false);
        };

        fetchOrders();

        // الاستماع للتغييرات في الوقت الفعلي
        const subscription = supabase
            .channel(`user_orders_${currentUser.id}`)
            .on('postgres_changes', { 
                event: '*', 
                schema: 'public', 
                table: 'orders',
                filter: `buyer_id=eq.${currentUser.id}`
            }, (payload) => {
                fetchOrders();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, [currentUser]);

    if (loading) return <Loader2 className="h-8 w-8 animate-spin mx-auto mt-8" />;

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <CardHeader className="p-0 mb-6">
                <CardTitle className="text-2xl font-bold">طلباتي السابقة</CardTitle>
                <CardDescription>هنا يمكنك تتبع جميع طلباتك.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                {orders.length > 0 ? (
                    <div className="space-y-4">
                        {orders.map(order => {
                            const statusInfo = getStatusInfo(order.status);
                            return (
                                <div key={order.id} className="border p-4 rounded-lg flex justify-between items-center bg-white hover:bg-muted/50 transition-colors">
                                    <div className="flex gap-4 items-center">
                                       {order.product?.image_url && <img src={order.product.image_url} className="w-16 h-16 rounded object-cover border" alt=""/>}
                                        <div>
                                            <p className="font-semibold">{order.product?.name || 'منتج محذوف'}</p>
                                            <p className="text-sm text-muted-foreground">البائع: {order.vendor?.store_name} | الكمية: {order.quantity}</p>
                                            <p className="text-sm text-gray-400 mt-1">{formatDate(order.created_at)}</p>
                                        </div>
                                    </div>
                                    <div className="text-left flex flex-col items-end">
                                        <Badge variant="outline" className={`${statusInfo.color} ${statusInfo.textColor} mb-2`}>{statusInfo.label}</Badge>
                                        <p className="font-bold text-lg">{formatPrice(order.total_amount)}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-muted-foreground text-center py-8">لا توجد طلبات سابقة.</p>
                )}
            </CardContent>
        </motion.div>
    );
};

export default UserOrdersPage;
