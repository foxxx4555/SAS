import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Trash2, Loader2, Scissors } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { Button } from '@/components/ui/button';

const VendorCouponsPage = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newCoupon, setNewCoupon] = useState({ code: '', discount_percentage: '', start_date: '', end_date: '' });

  const fetchCoupons = async () => {
    if (!currentUser) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('vendor_id', currentUser.id)
      .order('id', { ascending: false });
    
    if (error) console.error(error);
    else setCoupons(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchCoupons();
  }, [currentUser]);

  const handleAdd = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('coupons')
      .insert([{
        vendor_id: currentUser.id,
        code: newCoupon.code.toUpperCase(),
        discount_percentage: parseFloat(newCoupon.discount_percentage),
        start_date: newCoupon.start_date || null,
        end_date: newCoupon.end_date || null
      }]);
    
    if (error) {
      toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'تم!' });
      setNewCoupon({ code: '', discount_percentage: '', start_date: '', end_date: '' });
      setShowAdd(false);
      fetchCoupons();
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('هل تريد حذف الكوبون؟')) return;
    const { error } = await supabase.from('coupons').delete().eq('id', id);
    if (!error) fetchCoupons();
  };

  if (loading) return <div className="flex justify-center mt-10"><Loader2 className="animate-spin text-primary w-8 h-8"/></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">قسائم الخصم (الكوبونات)</h2>
        <Button onClick={() => setShowAdd(!showAdd)} className="flex gap-2">
          <Plus size={18} /> إصدار كوبون جديد
        </Button>
      </div>

      {showAdd && (
         <div className="bg-white p-6 rounded-xl border shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="text-sm text-gray-600 block mb-1">كود الخصم (مثال: SAS10)</label>
              <input type="text" className="w-full border p-2 rounded-lg" value={newCoupon.code} onChange={e => setNewCoupon({...newCoupon, code: e.target.value})} dir="ltr"/>
            </div>
            <div>
              <label className="text-sm text-gray-600 block mb-1">نسبة الخصم (%)</label>
              <input type="number" className="w-full border p-2 rounded-lg" value={newCoupon.discount_percentage} onChange={e => setNewCoupon({...newCoupon, discount_percentage: e.target.value})} />
            </div>
            <div>
              <label className="text-sm text-gray-600 block mb-1">تاريخ الانتهاء (اختياري)</label>
              <input type="date" className="w-full border p-2 rounded-lg" value={newCoupon.end_date} onChange={e => setNewCoupon({...newCoupon, end_date: e.target.value})}/>
            </div>
            <div>
              <Button onClick={handleAdd} disabled={saving} className="w-full">
                {saving ? <Loader2 className="animate-spin h-5 w-5"/> : 'حفظ الكوبون'}
              </Button>
            </div>
         </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-right bg-white text-sm">
          <thead className="bg-gray-50 border-b text-gray-600">
            <tr>
              <th className="p-4 font-semibold">الكود</th>
              <th className="p-4 font-semibold">النسبة</th>
              <th className="p-4 font-semibold">تاريخ الانتهاء</th>
              <th className="p-4 font-semibold">الإجراء</th>
            </tr>
          </thead>
          <tbody>
            {coupons.length === 0 ? (
              <tr><td colSpan="4" className="p-8 text-center text-gray-500">لا يوجد كوبونات حالية.</td></tr>
            ) : (
              coupons.map((c) => (
                <tr key={c.id} className="border-b">
                  <td className="p-4 font-bold text-primary font-mono bg-blue-50/50">{c.code}</td>
                  <td className="p-4 text-green-600 font-bold">{c.discount_percentage}% خصم</td>
                  <td className="p-4">{c.end_date || 'مفتوح'}</td>
                  <td className="p-4">
                    <button onClick={() => handleDelete(c.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
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
export default VendorCouponsPage;
