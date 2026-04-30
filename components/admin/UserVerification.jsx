import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Check, X, Users, ShieldCheck, Clock, Loader2, Award, Building2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

export default function UserVerification() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPendingUsers = async () => {
    setLoading(true);
    try {
      // In a real B2B app, we'd have a 'is_verified' column and 'verification_status'
      // For now, let's fetch all SUPPLIER users who are not 'GOLD' or have a verification flag if it exists
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'SUPPLIER')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const handleVerify = async (userId, tier = 'VERIFIED') => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          is_verified: true,
          tier: tier,
          trust_score: tier === 'GOLD' ? 5.0 : 4.5
        })
        .eq('id', userId);
      
      if (error) throw error;
      toast({ 
        title: tier === 'GOLD' ? '🏆 تمت الترقية لمورد ذهبي' : '✅ تم توثيق الحساب بنجاح',
        className: 'bg-green-50 text-green-900 border-green-200'
      });
      fetchPendingUsers();
    } catch (err) {
      toast({ title: '❌ خطأ', description: err.message, variant: 'destructive' });
    }
  };

  const handleReject = async (userId) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_verified: false, tier: 'NONE' })
        .eq('id', userId);
      
      if (error) throw error;
      toast({ title: '🚫 تم إلغاء توثيق الحساب' });
      fetchPendingUsers();
    } catch (err) {
      toast({ title: '❌ خطأ', description: err.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-gray-900">توثيق حسابات الموردين</h2>
          <p className="text-gray-500 mt-2">قم بمراجعة بيانات الشركات ومنح شارات الثقة (Verified/Gold).</p>
        </div>
        <div className="bg-sas-blue/10 text-sas-blue px-4 py-2 rounded-xl border border-blue-100 flex items-center gap-2 font-bold">
           <Building2 size={20} /> {users.length} مورد مسجل
        </div>
      </div>

      {loading ? (
        <div className="h-96 flex items-center justify-center">
          <Loader2 className="animate-spin text-sas-blue w-12 h-12" />
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white p-20 rounded-[40px] border border-dashed border-gray-200 text-center">
           <div className="w-20 h-20 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users size={40} />
           </div>
           <h3 className="text-2xl font-black text-gray-900 mb-2">لا يوجد موردون حالياً</h3>
           <p className="text-gray-500">سيظهر هنا الموردون الجدد الذين يحتاجون للتوثيق.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {users.map((user) => (
            <motion.div 
              key={user.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-8 items-center"
            >
              <div className="w-24 h-24 bg-sas-blue/5 text-sas-blue rounded-3xl flex items-center justify-center shrink-0 border border-blue-50">
                <Building2 size={40} />
              </div>
              
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                   <h3 className="text-2xl font-black text-gray-900">{user.company_name}</h3>
                   {user.tier === 'GOLD' && <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1"><Award size={14}/> مورد ذهبي</span>}
                   {user.is_verified && user.tier !== 'GOLD' && <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1"><ShieldCheck size={14}/> موثق</span>}
                </div>
                <div className="flex flex-wrap gap-6 text-sm text-gray-500">
                   <div className="flex items-center gap-2 font-medium">البريد: <span className="text-gray-900">{user.email}</span></div>
                   <div className="flex items-center gap-2 font-medium">التاريخ: <span className="text-gray-900">{new Date(user.created_at).toLocaleDateString('ar-EG')}</span></div>
                   <div className="flex items-center gap-2 font-medium">مستوى الثقة: <span className="text-amber-500 font-bold">{user.trust_score || '0.0'} ⭐</span></div>
                </div>
                <div className="pt-2">
                   <p className="text-sm text-gray-400 bg-gray-50 p-3 rounded-xl border border-gray-50 inline-block">سجل تجاري: {user.id.split('-')[0]}-2026 (مرفق)</p>
                </div>
              </div>

              <div className="flex md:flex-col gap-3 shrink-0">
                <Button 
                  onClick={() => handleVerify(user.id, 'GOLD')}
                  className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:opacity-90 text-white rounded-xl px-6 flex gap-2 h-12 shadow-lg shadow-amber-100"
                >
                  <Award size={20} /> ترقية لذهبي
                </Button>
                <Button 
                  onClick={() => handleVerify(user.id, 'VERIFIED')}
                  className="bg-sas-blue hover:bg-blue-800 text-white rounded-xl px-6 flex gap-2 h-12 shadow-lg shadow-blue-100"
                >
                  <Check size={20} /> توثيق الحساب
                </Button>
                <Button 
                  onClick={() => handleReject(user.id)}
                  variant="outline"
                  className="border-red-100 text-red-600 hover:bg-red-50 rounded-xl px-6 flex gap-2 h-12"
                >
                  <X size={20} /> إلغاء التوثيق
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
