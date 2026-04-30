import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, ChevronLeft, PackageSearch, Layers, Truck, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

const steps = [
  { id: 'details', title: 'تفاصيل المنتج', icon: PackageSearch },
  { id: 'quantity', title: 'الكمية والوحدات', icon: Layers },
  { id: 'logistics', title: 'اللوجستيات والموعد', icon: Truck },
  { id: 'review', title: 'المراجعة', icon: CheckCircle2 }
];

export default function RFQWizard() {
  const [currentStep, setCurrentStep] = useState(() => {
    const saved = localStorage.getItem('rfq_step');
    return saved !== null ? parseInt(saved, 10) : 0;
  });

  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('rfq_data');
    return saved ? JSON.parse(saved) : {
      title: '',
      category: '',
      specs: '',
      quantity: '',
      unit: 'قطعة',
      targetPrice: '',
      shippingDestination: '',
      deadline: ''
    };
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('rfq_step', currentStep);
    localStorage.setItem('rfq_data', JSON.stringify(formData));
  }, [currentStep, formData]);

  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleNext = () => {
    if (currentStep < steps.length - 1) setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast({ title: 'تنبيه', description: 'يجب تسجيل الدخول بحساب مشتري لإنشاء الطلب.', variant: 'destructive' });
      return;
    }

    if (!formData.title || !formData.shippingDestination) {
      toast({ title: 'بيانات ناقصة', description: 'يرجى ملء الحقول الأساسية (الاسم ووجهة التسليم).', variant: 'destructive' });
      return;
    }

    try {
      // 1. Prepare data for Supabase
      const rfqData = {
        buyer_id: currentUser.id, // Using real UUID from Auth
        title: formData.title,
        category: formData.category,
        description: formData.specs, // Mapping form's 'specs' to database's 'description'
        quantity: parseInt(formData.quantity, 10) || 0,
        unit: formData.unit,
        target_price: formData.targetPrice ? parseFloat(formData.targetPrice) : null,
        shipping_destination: formData.shippingDestination,
        deadline: formData.deadline 
          ? new Date(formData.deadline).toISOString() 
          : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'OPEN'
      };

      // 2. Insert into Supabase
      const { error } = await supabase
        .from('rfqs')
        .insert([rfqData]);

      if (error) throw error;

      // 3. Show Feedback and Navigate
      toast({
        title: '✅ تمت العملية بنجاح!',
        description: 'تم نشر طلب التسعيرة (RFQ) لجميع الموردين المعتمدين.',
        variant: 'default',
        className: 'bg-green-50 border-green-200 text-green-900',
      });
      // 4. Clear LocalStorage and Navigate
      localStorage.removeItem('rfq_step');
      localStorage.removeItem('rfq_data');
      navigate('/buyer/dashboard');

    } catch (err) {
      console.error('Error submitting RFQ:', err);
      toast({
        title: '❌ خطأ أثناء إرسال الطلب',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-5 text-right" dir="rtl">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">اسم المنتج</label>
              <input 
                type="text" 
                placeholder="مثال: أقمشة قطنية 100%"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1E40AF] focus:border-[#1E40AF] outline-none transition-all duration-300 shadow-sm"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">الفئة (Category)</label>
              <select 
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1E40AF] focus:border-[#1E40AF] outline-none transition-all duration-300 shadow-sm bg-white"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option value="">اختر التصنيف</option>
                <option value="textiles">منسوجات</option>
                <option value="electronics">إلكترونيات</option>
                <option value="raw_materials">مواد خام</option>
                <option value="machinery">معدات وآلات</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">المواصفات الفنية</label>
              <textarea 
                rows="4" 
                placeholder="اذكر المواصفات الدقيقة لتسهيل حصولك على عرض دقيق..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1E40AF] focus:border-[#1E40AF] outline-none transition-all duration-300 shadow-sm"
                value={formData.specs}
                onChange={(e) => setFormData({...formData, specs: e.target.value})}
              ></textarea>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-5 text-right" dir="rtl">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">الكمية</label>
                <input 
                  type="number" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1E40AF] focus:border-[#1E40AF] outline-none transition-all duration-300 shadow-sm"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                />
              </div>
              <div className="w-1/3">
                <label className="block text-sm font-semibold text-gray-700 mb-2">الوحدة</label>
                <select 
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1E40AF] focus:border-[#1E40AF] outline-none transition-all duration-300 shadow-sm bg-white"
                  value={formData.unit}
                  onChange={(e) => setFormData({...formData, unit: e.target.value})}
                >
                  <option value="قطعة">قطعة</option>
                  <option value="طن">طن</option>
                  <option value="حاوية">حاوية</option>
                  <option value="متر">متر</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">السعر المستهدف (اختياري)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                <input 
                  type="number" 
                  placeholder="الميزانية المتوقعة للوحدة"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1E40AF] focus:border-[#1E40AF] outline-none transition-all duration-300 shadow-sm text-left"
                  dir="ltr"
                  value={formData.targetPrice}
                  onChange={(e) => setFormData({...formData, targetPrice: e.target.value})}
                />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-5 text-right" dir="rtl">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">موقع التسليم (Shipping Destination)</label>
              <input 
                type="text" 
                placeholder="مثال: ميناء جبل علي، دبي"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1E40AF] focus:border-[#1E40AF] outline-none transition-all duration-300 shadow-sm"
                value={formData.shippingDestination}
                onChange={(e) => setFormData({...formData, shippingDestination: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">تاريخ انتهاء تلقي العروض (Deadline)</label>
              <input 
                type="date" 
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1E40AF] focus:border-[#1E40AF] outline-none transition-all duration-300 shadow-sm"
                value={formData.deadline}
                onChange={(e) => setFormData({...formData, deadline: e.target.value})}
              />
            </div>
            <div className="mt-4 p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <Truck size={18} className="text-[#1E40AF]"/>
                منصة SAS تضمن لك حلولاً لوجستية متكاملة لضمان وصول شحنتك بسلام.
              </p>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 text-right" dir="rtl">
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <h3 className="text-lg font-bold text-[#1E40AF] mb-4 flex items-center gap-2">
                <CheckCircle2 size={20} />
                مراجعة بيانات الطلب
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm">
                <div>
                  <span className="block text-gray-500 mb-1">المنتج</span>
                  <span className="font-semibold text-gray-900">{formData.title || 'لم يُحدد'}</span>
                </div>
                <div>
                  <span className="block text-gray-500 mb-1">الفئة</span>
                  <span className="font-semibold text-gray-900">{formData.category || 'لم يُحدد'}</span>
                </div>
                <div>
                  <span className="block text-gray-500 mb-1">الكمية</span>
                  <span className="font-semibold text-gray-900">
                    {formData.quantity ? `${formData.quantity} ${formData.unit}` : 'لم يُحدد'}
                  </span>
                </div>
                <div>
                  <span className="block text-gray-500 mb-1">السعر المستهدف</span>
                  <span className="font-semibold text-gray-900">{formData.targetPrice ? `$${formData.targetPrice}` : 'غير محدد'}</span>
                </div>
                <div>
                  <span className="block text-gray-500 mb-1">وجهة التسليم</span>
                  <span className="font-semibold text-gray-900">{formData.shippingDestination || 'لم يُحدد'}</span>
                </div>
                <div>
                  <span className="block text-gray-500 mb-1">الموعد النهائي</span>
                  <span className="font-semibold text-gray-900">{formData.deadline || 'لم يُحدد'}</span>
                </div>
                <div className="col-span-1 md:col-span-2 mt-2">
                  <span className="block text-gray-500 mb-1">المواصفات الفنية</span>
                  <p className="font-medium text-gray-700 bg-white p-3 rounded-lg border border-gray-100 mt-1 whitespace-pre-wrap">
                    {formData.specs || 'لا يوجد'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-8 bg-white rounded-3xl shadow-2xl shadow-[#1E40AF]/5 border border-gray-100">
      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="text-3xl font-black text-gray-900 mb-3">نموذج طلب عروض الأسعار (RFQ)</h2>
        <p className="text-gray-500">أكمل النموذج في أقل من 60 ثانية للوصول لشبكة الموردين المعتمدين.</p>
      </div>

      {/* Progress Bar (Stepper) */}
      <div className="mb-12 relative" dir="rtl">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1.5 bg-gray-100 -z-10 rounded-full"></div>
        <motion.div 
          className="absolute right-0 top-1/2 -translate-y-1/2 h-1.5 bg-[#1E40AF] -z-10 rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        />
        
        <div className="flex justify-between w-full">
          {steps.map((step, index) => {
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            const StepIcon = step.icon;
            
            return (
              <div key={step.id} className="flex flex-col items-center">
                <motion.div 
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${
                    isActive ? 'border-[#1E40AF] bg-[#1E40AF] text-white shadow-lg shadow-[#1E40AF]/30 scale-110' : 
                    isCompleted ? 'border-[#1E40AF] bg-white text-[#1E40AF]' : 
                    'border-gray-100 bg-white text-gray-400'
                  }`}
                  whileHover={{ scale: isActive ? 1.1 : 1.05 }}
                >
                  {isCompleted ? <Check size={22} strokeWidth={3} /> : <StepIcon size={20} />}
                </motion.div>
                <span className={`mt-3 text-sm font-bold transition-colors ${isActive ? 'text-[#1E40AF]' : isCompleted ? 'text-gray-700' : 'text-gray-400'}`}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Area with Framer Motion Transitions */}
      <div className="min-h-[350px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: -30, filter: 'blur(4px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: 30, filter: 'blur(4px)' }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Navigation Buttons */}
      <div className="mt-10 pt-6 border-t border-gray-100 flex justify-between items-center" dir="rtl">
        <button
          onClick={currentStep === steps.length - 1 ? handleSubmit : handleNext}
          className="bg-[#1E40AF] hover:bg-blue-800 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95 shadow-md shadow-[#1E40AF]/20"
        >
          {currentStep === steps.length - 1 ? 'تأكيد وإرسال' : 'التالي (Next)'}
          {currentStep !== steps.length - 1 && <ChevronLeft size={20} />}
        </button>
        
        <button
          onClick={handleBack}
          disabled={currentStep === 0}
          className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${
            currentStep === 0 
              ? 'text-gray-300 cursor-not-allowed' 
              : 'text-gray-600 hover:bg-gray-100 active:scale-95 border border-gray-200'
          }`}
        >
          <ChevronRight size={20} />
          السابق (Back)
        </button>
      </div>
    </div>
  );
}
