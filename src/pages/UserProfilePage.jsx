// src/pages/UserProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

const UserProfilePage = () => {
    const { currentUser, isVendor, updateProfile, updateUserProfileInDb, upgradeToVendor } = useAuth();
    const { toast } = useToast();
    const [isUpdating, setIsUpdating] = useState(false);
    const [formData, setFormData] = useState({
      name: '',
      phone: '',
    });

    useEffect(() => {
        if (currentUser) {
            setFormData({
                name: currentUser.displayName || '',
                phone: currentUser.phoneNumber || '',
            });
        }
    }, [currentUser]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        if (!formData.name) {
          toast({ title: "خطأ", description: "حقل الاسم لا يمكن أن يكون فارغاً.", variant: "destructive" });
          return;
        }
        setIsUpdating(true);
        try {
          // تحديث الاسم في Authentication
          if (currentUser.displayName !== formData.name) {
            await updateProfile(currentUser, { displayName: formData.name });
          }
    
          // تحديث البيانات في Firestore
          await updateUserProfileInDb(currentUser.uid, {
            displayName: formData.name,
            phone: formData.phone,
          });
    
          toast({ title: "تم التحديث", description: "تم حفظ معلوماتك بنجاح." });
        } catch (error) {
          console.error("Error updating profile: ", error);
          toast({ title: "خطأ", description: "فشل تحديث المعلومات.", variant: "destructive" });
        } finally {
          setIsUpdating(false);
        }
    };
    
    const handleUpgradeToVendor = async () => {
        try {
            await upgradeToVendor();
            toast({ title: "تهانينا!", description: "تم ترقية حسابك إلى تاجر بنجاح. يمكنك الآن إدارة متجرك." });
        } catch (error) {
            toast({ title: "خطأ", description: "حدث خطأ أثناء ترقية الحساب.", variant: "destructive" });
        }
    };
    
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <CardHeader className="p-0 mb-6">
                <CardTitle className="text-2xl font-bold">المعلومات الشخصية</CardTitle>
                <CardDescription>قم بتحديث اسمك وبيانات الاتصال الخاصة بك.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div>
                        <Label htmlFor="name">الاسم الكامل</Label>
                        <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                    </div>
                    <div>
                        <Label htmlFor="email">البريد الإلكتروني (لا يمكن تغييره)</Label>
                        <Input id="email" type="email" value={currentUser?.email || ''} disabled />
                    </div>
                    <div>
                        <Label htmlFor="phone">رقم الهاتف (اختياري)</Label>
                        <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} />
                    </div>
                    <Button type="submit" className="w-full sm:w-auto" disabled={isUpdating}>
                        {isUpdating ? <Loader2 className="animate-spin mr-2" /> : null}
                        {isUpdating ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                    </Button>
                </form>

                {/* 🔥 الزر السحري للترقية إلى تاجر في حال كان المستخدم عادياً 🔥 */}
                {!isVendor && (
                  <div className="mt-8 pt-6 border-t">
                      <div className="bg-sky-50 dark:bg-slate-800 p-6 rounded-xl border border-sky-100 dark:border-slate-700">
                          <h3 className="text-xl font-bold text-sky-900 dark:text-sky-400 mb-2">هل تملك بضاعة وتريد البيع؟</h3>
                          <p className="text-slate-600 dark:text-slate-300 mb-4 text-sm">
                             يمكنك الآن بضغطة زر تحويل حسابك العادي إلى حساب "تاجر شريك" للبدء في عرض منتجاتك على شبكة ساس اللوجستية وإدارة مبيعاتك بالكامل!
                          </p>
                          <Button 
                              onClick={handleUpgradeToVendor} 
                              type="button" 
                              variant="default"
                              className="bg-sky-600 hover:bg-sky-700 text-white w-full sm:w-auto"
                          >
                              ترقية حسابي إلى تاجر 🚀
                          </Button>
                      </div>
                  </div>
                )}
            </CardContent>
        </motion.div>
    );
};

export default UserProfilePage;
