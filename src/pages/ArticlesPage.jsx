// src/pages/ArticlesPage.jsx (النسخة النهائية مع مسارات الصور المحلية)

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Droplets, ShieldOff, HeartPulse, Sparkles, ShoppingCart, Layers3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// ✅ تم تعديل مسارات الصور لتقرأ من مجلد "assets" المحلي
const articles = [
  {
    icon: <Sparkles className="h-10 w-10 text-primary" />,
    title: "لماذا منصة ساس؟ لأننا لا نساوم على دقة المواعيد",
    image: "/assets/png3.jpg", // <--- المسار الجديد
    content: (
      <>
        <p className="mb-4">في سوق مليء بالخيارات، تبرز "ساس" لأننا نضع عملك أولاً. نحن لا نوفر مجرد مساحة إلكترونية للبيع والشراء، بل نقدم شبكة نقل متكاملة وآمنة.</p>
        <p className="font-semibold text-primary">استثمارك في شبكة ساس هو استثمار مباشر في توسيع تجارتك.</p>
      </>
    ),
  }
];


const ArticleCard = ({ article, index }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="lg:[&:last-child:nth-child(odd)]:col-span-2"
    >
        <Card className="flex flex-col h-full glassmorphism-card hover:shadow-2xl transition-shadow duration-300 w-full overflow-hidden">
            <div className="aspect-video overflow-hidden bg-muted">
                <img 
                    src={article.image} 
                    alt={article.title} 
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" 
                    loading="lazy"
                />
            </div>
            <CardHeader className="p-6">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-background/50 rounded-full w-fit">
                      {article.icon}
                    </div>
                    <CardTitle className="text-xl md:text-2xl text-foreground">{article.title}</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="flex-grow p-6 pt-0">
                <div className="text-muted-foreground leading-relaxed">{article.content}</div>
            </CardContent>
        </Card>
    </motion.div>
);

const ArticlesPage = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <motion.section
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center mb-16"
      >
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
          دليلك لعالم اللوجستيات
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          اقرأ مقالاتنا لتفهم وتتابع أحدث الأخبار في عالم النقل والتجارة بين الشركات (B2B).
        </p>
      </motion.section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {articles.map((article, index) => (
          <ArticleCard key={index} article={article} index={index} />
        ))}
      </div>

       <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7 }}
        className="mt-20 text-center bg-gradient-to-r from-sky-500 to-green-500 text-white p-8 md:p-12 rounded-2xl shadow-2xl"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-4">هل أنت جاهز لتوسيع تجارتك؟</h2>
        <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
          سجل معنا اليوم وابدأ بتوزيع بضائعك وطلباتك بأمان.
        </p>
        <Link to="/products">
          <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-slate-100 text-lg px-10 py-6 rounded-full shadow-lg transform hover:scale-105 transition-transform duration-300">
            <ShoppingCart className="ml-3 h-6 w-6" />
            تصفح منتجاتنا
          </Button>
        </Link>
      </motion.section>

    </div>
  );
};

export default ArticlesPage;
