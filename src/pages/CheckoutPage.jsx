// src/pages/CheckoutPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/contexts/CartContext';
import { Loader2, Lock, ArrowRight, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Combobox } from '@/components/ui/combobox.jsx';
import { countries } from '@/lib/countries.js';

const validateForm = (formData) => {
    const errors = {};
    if (!/^[a-zA-Z\u0600-\u06FF\s-']+$/.test(formData.firstName.trim())) errors.firstName = "الاسم الأول يجب أن يحتوي على حروف فقط.";
    if (!/^[a-zA-Z\u0600-\u06FF\s-']+$/.test(formData.lastName.trim())) errors.lastName = "الاسم الأخير يجب أن يحتوي على حروف فقط.";
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) errors.email = "صيغة البريد الإلكتروني غير صحيحة.";
    if (!/^\+?[0-9\s-()]{7,15}$/.test(formData.phone)) errors.phone = "صيغة رقم الهاتف غير صحيحة.";
    if (formData.address.trim().length < 10) errors.address = "العنوان يجب ألا يقل عن 10 أحرف.";
    if (formData.city.trim().length < 2) errors.city = "اسم المدينة يجب ألا يقل عن حرفين.";
    if (!formData.country) errors.country = "يرجى اختيار دولة.";
    if (formData.postalCode && !/^[a-zA-Z0-9\s-]{3,10}$/.test(formData.postalCode)) {
        errors.postalCode = "الرمز البريدي غير صالح.";
    }
    return errors;
};


const CheckoutPage = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const location = useLocation();
    const { cartItems, cartTotal, clearCart } = useCart();
    const { currentUser } = useAuth();
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
      firstName: '', lastName: '', email: '', phone: '',
      address: '', city: '', country: 'EG', 
      postalCode: '', paymentMethod: 'cod'
    });
    const [formErrors, setFormErrors] = useState({});
  
    useEffect(() => {
      if (cartItems.length === 0 && !location.state?.fromCart) {
        toast({
          title: "سلتك فارغة!",
          description: "يتم توجيهك لصفحة المنتجات.",
          variant: "destructive",
        });
        navigate('/products');
      }
    }, [cartItems, navigate, toast, location.state]);
    
    useEffect(() => {
      if (currentUser) {
          const nameParts = currentUser.displayName?.split(' ') || ['', ''];
          setFormData(prev => ({
              ...prev,
              email: currentUser.email || '',
              firstName: nameParts[0] || '',
              lastName: nameParts.slice(1).join(' ') || '',
              phone: currentUser.phoneNumber || '',
          }));
      }
    }, [currentUser]);
  
    const shippingCost = cartTotal > 0 ? 50 : 0; 
    const totalAmount = cartTotal + shippingCost;
    
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
      if (formErrors[name]) {
        setFormErrors(prev => ({ ...prev, [name]: null }));
      }
    };
  
    const handleCountryChange = (value) => {
      setFormData(prev => ({ ...prev, country: value, postalCode: '' }));
      if (formErrors.country) {
        setFormErrors(prev => ({ ...prev, country: null, postalCode: null }));
      }
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!cartItems || cartItems.length === 0) return;
  
      const errors = validateForm(formData);
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        toast({ title: "بيانات غير مكتملة", description: "يرجى مراجعة الحقول التي عليها علامة حمراء.", variant: "destructive" });
        return;
      }
      
      setIsSubmitting(true);
      try {
        const countryLabel = countries.find(c => c.value === formData.country)?.label || formData.country;
        const fullAddress = `${formData.address}, ${formData.city}, ${countryLabel}`;
        
        // استعلام واحد لجلب كل المنتجات بدلاً من استعلامات متفرقة لتجنب اختناق Supabase Lock
        const itemIds = cartItems.map(i => i.id);
        const { data: productsData, error: fetchError } = await supabase
            .from('products')
            .select('id, stock, vendor_id')
            .in('id', itemIds);
        
        if (fetchError) throw fetchError;

        // 1.5. ضمان وجود المستخدم في جدول Profiles لمنع خطأ Foreign Key Constraint (حدث بسبب حذفك لبيانات الجدول القديمة)
        if (currentUser && currentUser.id !== 'admin-bypass') {
           const { error: profileUpsertError } = await supabase.from('profiles').upsert({
               id: currentUser.id,
               email: formData.email,
               first_name: formData.firstName,
               last_name: formData.lastName
           }, { onConflict: 'id', ignoreDuplicates: false });
           
           if (profileUpsertError) console.error("Error upserting profile for ghost user:", profileUpsertError);
        }

        const arrayOfOrders = [];
        for (const item of cartItems) {
             const productInfo = productsData?.find(p => p.id === item.id);
             if (productInfo) {
                 // 2. تحديث المخزون
                 const newStock = Math.max(0, (productInfo.stock || 0) - item.quantity);
                 await supabase.from('products').update({ stock: newStock }).eq('id', item.id);
                 
                 // 3. تجهيز طلب المشتري التابع للمورد
                 arrayOfOrders.push({
                   buyer_id: currentUser ? currentUser.id : null,
                   vendor_id: productInfo.vendor_id,
                   product_id: item.id,
                   quantity: item.quantity,
                   total_amount: item.quantity * item.price,
                   status: 'pending',
                   shipping_address: fullAddress,
                   payment_method: formData.paymentMethod
                 });
             }
        }
        
        // 4. إرسال الطلبات للسيرفر دفعة واحدة (Bulk Insert) مع ميزة تأخير/إعادة المحاولة (Retry) لتفادي خطأ NavigatorLock
        let insertedOrders, orderError;
        let retries = 3;
        while (retries > 0) {
           const res = await supabase.from('orders').insert(arrayOfOrders).select();
           if (!res.error) {
              insertedOrders = res.data;
              orderError = null;
              break;
           } else if (res.error.message.includes('Lock')) {
              console.warn("Supabase Lock Error, retrying...", retries);
              await new Promise(r => setTimeout(r, 1000));
              retries -= 1;
              orderError = res.error;
           } else {
              orderError = res.error;
              break;
           }
        }
        
        if (orderError) throw orderError;

        const mainOrderId = insertedOrders?.[0]?.id || "SAS-ORDER-OK";

        const orderItemsHtml = cartItems.map(item => `
          <tr>
            <td style="padding:8px; border-bottom:1px solid #ddd;">${item.name}</td>
            <td style="padding:8px; border-bottom:1px solid #ddd; text-align:center;">${item.quantity}</td>
            <td style="padding:8px; border-bottom:1px solid #ddd; text-align:right;">${(item.price * item.quantity).toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' })}</td>
          </tr>
        `).join('');
  
        const baseEmailParams = {
          to_name: `${formData.firstName} ${formData.lastName}`,
          order_id: mainOrderId,
          order_total: totalAmount.toLocaleString('ar-SA') + ' ﷼',
          order_address: fullAddress,
          order_items_html: orderItemsHtml,
          customer_phone: formData.phone,
          payment_method: formData.paymentMethod === 'cod' ? "الدفع عند الاستلام" : "بطاقة ائتمانية",
          order_subtotal: cartTotal.toLocaleString('ar-SA') + ' ﷼',
          order_shipping_cost: "مجاني / مدفوع من ساس",
          from_name: "منصة ساس للنقل اللوجستي",
          support_email: "support@sas-logistics.com",
        };
  
        const SERVICE_ID = "service_uu3h5on";
        const CLIENT_TEMPLATE_ID = "template_12584ol";
        const MERCHANT_TEMPLATE_ID = "template_6dk4ib8";
        const PUBLIC_KEY = "Yv-DxRXZ5X9ZmSg3K";
  
        try {
          const clientParams = { ...baseEmailParams, to_email: formData.email, reply_to: "support@sas-logistics.com" };
          await emailjs.send(SERVICE_ID, CLIENT_TEMPLATE_ID, clientParams, PUBLIC_KEY);
          
          const merchantParams = { ...baseEmailParams, to_email: "support@sas-logistics.com", client_email: formData.email, reply_to: formData.email };
          await emailjs.send(SERVICE_ID, MERCHANT_TEMPLATE_ID, merchantParams, PUBLIC_KEY);
  
        } catch (emailError) {
          console.error("فشل إرسال الإيميل:", emailError);
        }
        
        clearCart();
        toast({ title: "🎉 تم إرسال الطلب للموردين بنجاح!", description: `شكراً لك. سيتم التجهيز بواسطة منصة ساس. رقم الطلب: ${mainOrderId}`, className: "bg-green-500 text-white", duration: 7000 });
        navigate(`/order-success/${mainOrderId}`, { state: { orderData: arrayOfOrders } });
  
      } catch (error) {
        console.error("Error placing order: ", error);
        toast({ title: "حدث خطأ", description: "لم نتمكن من إتمام طلبك. يرجى المحاولة لاحقاً.", variant: "destructive" });
      } finally {
        setIsSubmitting(false);
      }
    };
  
    if (!cartItems.length && !isSubmitting) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg text-muted-foreground">جاري التحقق من السلة...</p>
            </div>
        );
    }
  
    return (
      <div className="container mx-auto px-4 py-12">
        <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-extrabold text-center mb-8 text-primary">إتمام عملية الدفع</motion.h1>
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          <motion.form onSubmit={handleSubmit} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 space-y-4 bg-card p-6 rounded-xl shadow-xl">
             <h2 className="text-xl font-semibold border-b pb-2 mb-4">معلومات الشحن</h2>
             <div className="grid md:grid-cols-2 gap-4">
              <div><Label htmlFor="firstName">الاسم الأول</Label><Input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required className={formErrors.firstName ? 'border-destructive' : ''} />{formErrors.firstName && <p className="text-destructive text-xs mt-1">{formErrors.firstName}</p>}</div>
              <div><Label htmlFor="lastName">الاسم الأخير</Label><Input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required className={formErrors.lastName ? 'border-destructive' : ''} />{formErrors.lastName && <p className="text-destructive text-xs mt-1">{formErrors.lastName}</p>}</div>
              <div><Label htmlFor="email">البريد الإلكتروني</Label><Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required className={formErrors.email ? 'border-destructive' : ''} />{formErrors.email && <p className="text-destructive text-xs mt-1">{formErrors.email}</p>}</div>
              <div><Label htmlFor="phone">رقم الهاتف</Label><Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} required className={formErrors.phone ? 'border-destructive' : ''} />{formErrors.phone && <p className="text-destructive text-xs mt-1">{formErrors.phone}</p>}</div>
              <div className="md:col-span-2"><Label htmlFor="address">العنوان بالتفصيل</Label><Input id="address" name="address" value={formData.address} onChange={handleChange} required className={formErrors.address ? 'border-destructive' : ''} />{formErrors.address && <p className="text-destructive text-xs mt-1">{formErrors.address}</p>}</div>
               <div><Label htmlFor="country">الدولة</Label><Combobox options={countries} value={formData.country} onSelect={handleCountryChange} placeholder="اختر الدولة..." searchPlaceholder="ابحث..." emptyPlaceholder="لا توجد نتائج." triggerClassName={formErrors.country ? 'border-destructive' : ''} />{formErrors.country && <p className="text-destructive text-xs mt-1">{formErrors.country}</p>}</div>
              <div><Label htmlFor="city">المدينة / المحافظة</Label><Input id="city" name="city" value={formData.city} onChange={handleChange} required className={formErrors.city ? 'border-destructive' : ''} />{formErrors.city && <p className="text-destructive text-xs mt-1">{formErrors.city}</p>}</div>
              <div className="md:col-span-2"><Label htmlFor="postalCode">الرمز البريدي (اختياري)</Label><Input id="postalCode" name="postalCode" value={formData.postalCode} onChange={handleChange} className={formErrors.postalCode ? 'border-destructive' : ''} />{formErrors.postalCode && <p className="text-destructive text-xs mt-1">{formErrors.postalCode}</p>}</div>
            </div>
            <Button type="submit" className="w-full mt-6" size="lg" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Lock className="mr-2 h-4 w-4" />}{isSubmitting ? "جاري تنفيذ الطلب..." : "تأكيد الطلب والدفع عند الاستلام"}</Button>
          </motion.form>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="sticky top-24">
            <Card className="p-6 shadow-xl rounded-xl bg-card">
               <CardHeader className="p-0 mb-4"><CardTitle className="text-center text-lg font-semibold text-primary">ملخص طلبك</CardTitle></CardHeader>
                <CardContent className="p-0">
                    <div className="max-h-60 overflow-y-auto pr-2 custom-scrollbar space-y-3 mb-3">
                        {cartItems.map(item => (<div key={item.id} className="flex justify-between items-center border-b pb-2"><div className="flex items-center gap-3"><img src={item.image} alt={item.name} className="w-12 h-12 rounded-md object-cover" /><div className="text-sm"><p className="font-semibold">{item.name}</p><p className="text-muted-foreground">الكمية: {item.quantity}</p></div></div><p className="text-sm font-medium">{(item.price * item.quantity).toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' })}</p></div>))}
                    </div>
                    <div className="pt-3 border-t space-y-2">
                        <div className="flex justify-between text-muted-foreground"><span>المجموع الفرعي:</span><span>{cartTotal.toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' })}</span></div>
                        {shippingCost > 0 && (<div className="flex justify-between text-muted-foreground"><span>تكلفة الشحن:</span><span>{shippingCost.toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' })}</span></div>)}
                        <div className="flex justify-between pt-2 border-t font-semibold text-lg"><span>الإجمالي الكلي:</span><span>{totalAmount.toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' })}</span></div>
                    </div>
                </CardContent>
            </Card>
          </motion.div>
        </div>
    </div>
  );
};

export default CheckoutPage;
