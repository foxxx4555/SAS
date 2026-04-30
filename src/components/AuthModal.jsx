import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Building, MapPin, Briefcase, CreditCard, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const AuthModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'register'
  const [registerType, setRegisterType] = useState('BUYER'); // 'BUYER' or 'SUPPLIER'
  
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    email: '', password: '', companyName: '', ownerName: '', commercialRegister: '', bankAccount: '', locationText: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      await signIn(formData.email, formData.password);
      toast({ title: "تم تسجيل الدخول بنجاح!" });
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'فشل تسجيل الدخول. تأكد من بياناتك.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      await signUp(registerType, formData);
      toast({ title: "تم إنشاء الحساب بنجاح!" });
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'حدث خطأ أثناء إنشاء الحساب.');
    } finally {
      setLoading(false);
    }
  };

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  if (!isOpen || !isMounted) return null;

  return ReactDOM.createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white w-full max-w-md md:max-w-xl rounded-2xl shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col"
          initial={{ scale: 0.9, y: 30, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 30, opacity: 0 }}
        >
          {/* Header Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors z-10"
          >
            <X size={20} />
          </button>

          {/* Logo / Header image */}
          <div className="bg-gradient-to-r from-primary to-secondary p-8 text-center flex-shrink-0">
            <h2 className="text-3xl font-bold text-white mb-2">منصة ساس للنقل</h2>
            <p className="text-white/80">وجهتك الأولى للخدمات اللوجستية</p>
          </div>

          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Main Tabs */}
            <div className="flex border-b text-center shrink-0">
              <button
                className={`flex-1 py-4 text-lg font-bold transition-colors ${activeTab === 'login' ? 'text-primary border-b-4 border-primary' : 'text-gray-400 hover:text-gray-600'}`}
                onClick={() => setActiveTab('login')}
              >
                تسجيل الدخول
              </button>
              <button
                className={`flex-1 py-4 text-lg font-bold transition-colors ${activeTab === 'register' ? 'text-primary border-b-4 border-primary' : 'text-gray-400 hover:text-gray-600'}`}
                onClick={() => setActiveTab('register')}
              >
                إنشاء حساب
              </button>
            </div>

            {/* Content Area (Scrollable) */}
            <div className="p-6 md:p-8 overflow-y-auto w-full">
              {errorMsg && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded-lg text-center">
                  {errorMsg}
                </div>
              )}

              {activeTab === 'login' ? (
                // --- Login Form ---
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <div className="relative">
                      <Mail className="absolute right-3 top-3 text-gray-400" size={20} />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="البريد الإلكتروني"
                        className="w-full pl-4 pr-10 py-3 border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-shadow bg-gray-50 disabled:opacity-50"
                      />
                    </div>
                    <div className="relative">
                      <Lock className="absolute right-3 top-3 text-gray-400" size={20} />
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="كلمة المرور"
                        className="w-full pl-4 pr-10 py-3 border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-shadow bg-gray-50"
                        onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 cursor-pointer text-gray-600">
                      <input type="checkbox" className="rounded text-primary focus:ring-primary" />
                      <span>تذكرني</span>
                    </label>
                    <a href="#" className="text-secondary hover:underline font-medium">نسيت كلمة المرور؟</a>
                  </div>

                  <Button onClick={handleLogin} disabled={loading} className="w-full py-6 text-lg rounded-xl text-white bg-primary hover:bg-primary/90 mt-4">
                    {loading ? <Loader2 className="animate-spin" /> : 'تسجيل الدخول'}
                  </Button>
                </motion.div>
              ) : (
                // --- Registration Form ---
                <motion.div
                  key="register"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  {/* Account Type Toggle */}
                  <div className="flex p-1 bg-gray-100 rounded-lg mb-6">
                    <button
                      className={`flex-1 py-2 flex items-center justify-center gap-2 rounded-md font-medium transition-all ${registerType === 'BUYER' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                      onClick={() => setRegisterType('BUYER')}
                    >
                      <User size={18} /> مشتري (Buyer)
                    </button>
                    <button
                      className={`flex-1 py-2 flex items-center justify-center gap-2 rounded-md font-medium transition-all ${registerType === 'SUPPLIER' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                      onClick={() => setRegisterType('SUPPLIER')}
                    >
                      <Building size={18} /> مورد (Supplier)
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="relative">
                      <Building className="absolute right-3 top-3 text-gray-400" size={20} />
                      <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} placeholder="اسم الشركة / المؤسسة" className="w-full pl-4 pr-10 py-3 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-primary outline-none" />
                    </div>
                    {registerType === 'SUPPLIER' && (
                      <div className="relative">
                        <Briefcase className="absolute right-3 top-3 text-gray-400" size={20} />
                        <input type="text" name="commercialRegister" value={formData.commercialRegister} onChange={handleChange} placeholder="رقم السجل التجاري (للموردين)" className="w-full pl-4 pr-10 py-3 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-primary outline-none" />
                      </div>
                    )}
                    <div className="relative">
                      <Mail className="absolute right-3 top-3 text-gray-400" size={20} />
                      <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="البريد الإلكتروني" className="w-full pl-4 pr-10 py-3 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-primary outline-none" />
                    </div>
                    <div className="relative">
                      <Lock className="absolute right-3 top-3 text-gray-400" size={20} />
                      <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="كلمة المرور" className="w-full pl-4 pr-10 py-3 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-primary outline-none" />
                    </div>
                  </div>

                  <label className="flex items-start gap-2 mt-4 cursor-pointer text-sm text-gray-500">
                    <input type="checkbox" className="mt-1 rounded text-primary focus:ring-primary" />
                    <span>أوافق على <a href="#" className="text-secondary hover:underline">الشروط والأحكام</a> الخاصة بمنصة ساس.</span>
                  </label>

                  <Button onClick={handleRegister} disabled={loading} className="w-full py-6 text-lg rounded-xl text-white bg-primary hover:bg-primary/90 mt-4">
                    {loading ? <Loader2 className="animate-spin" /> : 'إنشاء حساب'}
                  </Button>
                </motion.div>
              )}
             
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default AuthModal;
