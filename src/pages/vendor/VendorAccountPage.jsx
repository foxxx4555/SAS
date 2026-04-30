import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Save, CreditCard, Building, MapPin, Briefcase } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { Button } from '@/components/ui/button';

const VendorAccountPage = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [vendorData, setVendorData] = useState({
    store_name: '',
    commercial_register: '',
    bank_account: '',
    location_text: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchVendorData = async () => {
      if (!currentUser) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('id', currentUser.id)
        .single();
      
      if (error) {
        console.error(error);
      } else if (data) {
        setVendorData(data);
      }
      setLoading(false);
    };

    fetchVendorData();
  }, [currentUser]);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('vendors')
      .update({
        store_name: vendorData.store_name,
        commercial_register: vendorData.commercial_register,
        bank_account: vendorData.bank_account,
        location_text: vendorData.location_text
      })
      .eq('id', currentUser.id);
    
    if (error) {
      toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'نجاح', description: 'تم تحديث بيانات المتجر بنجاح' });
    }
    setSaving(false);
  };

  if (loading) return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <h2 className="text-2xl font-bold text-gray-800">بيانات المتجر والحساب البنكي</h2>
      
      <div className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2"><Building size={16} className="text-gray-400"/> اسم المتجر (النشاط التجاري)</label>
            <input 
              type="text" 
              className="w-full border p-3 rounded-lg bg-gray-50 focus:ring-2 focus:ring-primary outline-none" 
              value={vendorData.store_name} 
              onChange={e => setVendorData({...vendorData, store_name: e.target.value})} 
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2"><Briefcase size={16} className="text-gray-400"/> رقم السجل التجاري / وثيقة العمل الحر</label>
            <input 
              type="text" 
              className="w-full border p-3 rounded-lg bg-gray-50 focus:ring-2 focus:ring-primary outline-none" 
              value={vendorData.commercial_register} 
              onChange={e => setVendorData({...vendorData, commercial_register: e.target.value})} 
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2"><CreditCard size={16} className="text-gray-400"/> رقم الحساب البنكي المعتمد (الآيبان IBAN)</label>
          <input 
            type="text" 
            dir="ltr"
            className="w-full border p-3 rounded-lg bg-gray-50 focus:ring-2 focus:ring-primary outline-none text-left" 
            value={vendorData.bank_account} 
            onChange={e => setVendorData({...vendorData, bank_account: e.target.value})} 
            placeholder="SA0000000000000000000000"
          />
          <p className="text-xs text-gray-500 mt-1">سيتم تحويل المبالغ المحصلة من المشترين إلى هذا الحساب بعد خصم عمولة أو رسوم شحن منصة ساس.</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2"><MapPin size={16} className="text-gray-400"/> رابط موقع المستودع (خرائط جوجل)</label>
          <input 
            type="text" 
            dir="ltr"
            className="w-full border p-3 rounded-lg bg-gray-50 focus:ring-2 focus:ring-primary outline-none text-left" 
            value={vendorData.location_text} 
            onChange={e => setVendorData({...vendorData, location_text: e.target.value})} 
            placeholder="https://maps.app.goo.gl/..."
          />
          <p className="text-xs text-gray-500 mt-1">يحتاج مندوب ساس لهذا الرابط للتوجه لمستودعك لتحميل البضاعة.</p>
        </div>

        <div className="pt-4 border-t flex justify-end">
          <Button onClick={handleSave} disabled={saving} className="flex gap-2 min-w-[150px]">
             {saving ? <Loader2 className="animate-spin" size={18}/> : <Save size={18} />} حفظ التعديلات
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VendorAccountPage;
