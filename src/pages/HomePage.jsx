import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Globe, ShieldCheck, Zap, BarChart, ArrowLeft } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen font-sans" dir="rtl">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-sas-blue-900 to-sas-blue text-white py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="container mx-auto px-6 relative z-10 flex flex-col items-center text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-7xl font-black mb-6 leading-tight"
          >
            التجارة العالمية <br className="hidden md:block"/> أصبحت أسهل مع <span className="text-yellow-400">SAS B2B</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl text-blue-100 mb-10 max-w-3xl"
          >
            المنصة الأولى لربط المشترين بالموردين المعتمدين دولياً. اطلب عروض الأسعار، قارن، وادفع بأمان عبر حساب الضمان اللوجستي.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link to="/rfq" className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 text-lg font-bold py-4 px-8 rounded-full shadow-lg transition-transform transform hover:scale-105 flex items-center justify-center gap-2">
              اطلب تسعيرة الآن (RFQ)
              <ArrowLeft size={20} />
            </Link>
            <Link to="/supplier/rfqs" className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white text-lg font-bold py-4 px-8 rounded-full transition-colors flex items-center justify-center">
              تصفح الفرص كمورد
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">لماذا تختار منصة SAS؟</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">نحن نوفر لك بيئة تجارية متكاملة تضمن لك الأمان والسرعة والموثوقية.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Feature 1 */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center"
            >
              <div className="w-20 h-20 bg-blue-50 text-sas-blue rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap size={40} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">محرك الـ RFQ الذكي</h3>
              <p className="text-gray-600 leading-relaxed">
                أنشئ طلب تسعيرة في أقل من 60 ثانية، وسيقوم نظامنا بتوزيعه على أفضل الموردين المناسبين لمواصفاتك تلقائياً.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center"
            >
              <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheck size={40} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">محرك الثقة والضمان</h3>
              <p className="text-gray-600 leading-relaxed">
                جميع الموردين موثقون بنظام "نقاط الثقة". أموالك محفوظة في حساب ضمان (Escrow) حتى تستلم بضاعتك بأمان.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center"
            >
              <div className="w-20 h-20 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Globe size={40} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">خدمات لوجستية عالمية</h3>
              <p className="text-gray-600 leading-relaxed">
                تتبع شحنتك لحظة بلحظة. نحن نربطك بشركات شحن وتخليص جمركي موثوقة لضمان وصول بضاعتك لباب مستودعك.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-20 bg-sas-blue text-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl font-black mb-2">+10k</div>
              <div className="text-blue-100 text-lg">مورد معتمد</div>
            </div>
            <div>
              <div className="text-5xl font-black mb-2">$50M</div>
              <div className="text-blue-100 text-lg">حجم التعاملات</div>
            </div>
            <div>
              <div className="text-5xl font-black mb-2">99%</div>
              <div className="text-blue-100 text-lg">نسبة التوصيل الناجح</div>
            </div>
            <div>
              <div className="text-5xl font-black mb-2">24/7</div>
              <div className="text-blue-100 text-lg">دعم فني وتجاري</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
