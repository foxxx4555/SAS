import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Check, X, Package, ShieldCheck, Clock, Loader2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

export default function ProductModeration() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPendingProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, vendor:users!vendor_id(company_name)')
        .eq('is_approved', false)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingProducts();
  }, []);

  const handleApprove = async (id) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_approved: true })
        .eq('id', id);
      
      if (error) throw error;
      toast({ title: '✅ تم اعتماد المنتج بنجاح' });
      fetchPendingProducts();
    } catch (err) {
      toast({ title: '❌ خطأ', description: err.message, variant: 'destructive' });
    }
  };

  const handleReject = async (id) => {
    // In a real app, maybe add a reason modal
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast({ title: '🚫 تم رفض وحذف المنتج' });
      fetchPendingProducts();
    } catch (err) {
      toast({ title: '❌ خطأ', description: err.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-gray-900">مراجعة المنتجات المعلقة</h2>
          <p className="text-gray-500 mt-2">قم بمراجعة المواصفات والصور قبل السماح بنشر المنتج في السوق المفتوح.</p>
        </div>
        <div className="bg-amber-50 text-amber-600 px-4 py-2 rounded-xl border border-amber-100 flex items-center gap-2 font-bold">
           <Clock size={20} /> {products.length} منتجات بانتظار القرار
        </div>
      </div>

      {loading ? (
        <div className="h-96 flex items-center justify-center">
          <Loader2 className="animate-spin text-sas-blue w-12 h-12" />
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white p-20 rounded-[40px] border border-dashed border-gray-200 text-center">
           <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check size={40} />
           </div>
           <h3 className="text-2xl font-black text-gray-900 mb-2">لا توجد منتجات معلقة</h3>
           <p className="text-gray-500">لقد انتهيت من مراجعة كافة المنتجات المرفوعة حديثاً.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {products.map((p) => (
            <motion.div 
              key={p.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6 items-center"
            >
              <div className="w-40 h-40 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shrink-0">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300"><Package size={48} /></div>
                )}
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                   <span className="text-[10px] font-black bg-blue-50 text-sas-blue px-2 py-0.5 rounded uppercase tracking-wider">{p.category}</span>
                   <span className="text-xs text-gray-400">بواسطة: <span className="font-bold text-gray-700">{p.vendor?.company_name}</span></span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">{p.name}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{p.description}</p>
                
                <div className="flex flex-wrap gap-4 pt-4">
                  <div className="text-sm">
                     <span className="text-gray-400">السعر المقترح:</span> <span className="font-black text-sas-blue">${p.price}</span>
                  </div>
                  <div className="text-sm">
                     <span className="text-gray-400">الكمية الدنيا (MOQ):</span> <span className="font-black">{p.minimum_quantity} {p.unit}</span>
                  </div>
                </div>
              </div>

              <div className="flex md:flex-col gap-3 shrink-0">
                <Button 
                  onClick={() => handleApprove(p.id)}
                  className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-8 flex gap-2 h-12"
                >
                  <Check size={20} /> اعتماد
                </Button>
                <Button 
                  onClick={() => handleReject(p.id)}
                  variant="outline"
                  className="border-red-100 text-red-600 hover:bg-red-50 rounded-xl px-8 flex gap-2 h-12"
                >
                  <X size={20} /> رفض المنتج
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
