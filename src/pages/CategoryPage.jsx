import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Loader2, AlertTriangle } from 'lucide-react';
import { productCategories } from '@/data/categoryData.jsx';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

// مكون عرض المنتج الواحد بتصميم جذاب
const ProductCard = ({ product, index }) => (
    <motion.div 
        className="bg-card border rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.05 }}
    >
        <Link to={`/product/${product.id}`} className="block aspect-w-16 aspect-h-9 overflow-hidden">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" loading="lazy" />
        </Link>
        <div className="p-6 flex flex-col flex-grow text-right">
            <h3 className="text-xl font-bold text-foreground mb-3">{product.name}</h3>
            <p className="text-muted-foreground flex-grow mb-4 text-sm line-clamp-2">{product.description}</p>
            <div className="flex items-center justify-between mt-auto">
                <p className="font-bold text-primary">{product.price?.toLocaleString('ar-EG')} ج.م</p>
                <Link to={`/product/${product.id}`}>
                    <Button size="sm">التفاصيل</Button>
                </Link>
            </div>
        </div>
    </motion.div>
);

const CategoryPage = () => {
    const { categoryId } = useParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const category = productCategories.find(cat => cat.id === categoryId);

    useEffect(() => {
        const fetchProducts = async () => {
            if (!category) return;
            setLoading(true);
            setError(null);
            
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .eq('category', category.id) // نستخدم الـ id الخاص بالفئة كما هو مخزن في الداتابيز
                    .order('name');

                if (error) throw error;
                setProducts(data || []);
            } catch (err) {
                console.error("Error fetching category products:", err);
                setError("حدث خطأ أثناء تحميل منتجات هذه الفئة.");
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [categoryId, category]);

    if (!category) {
        return (
            <div className="container mx-auto px-4 py-12 text-center flex flex-col items-center justify-center min-h-[60vh]">
                <h1 className="text-5xl font-bold mb-4">الفئة غير موجودة</h1>
                <p className="text-xl text-muted-foreground mb-8">عذرًا، لم نتمكن من العثور على صفحة المنتجات التي تبحث عنها.</p>
                <Link to="/">
                    <Button size="lg">
                        <Home className="ml-2 h-5 w-5" />
                        العودة للرئيسية
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-gray-50/50 dark:bg-background min-h-screen">
            <div className="container mx-auto px-4 py-16">
                <motion.div 
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    className="text-center mb-16"
                >
                    <div className="inline-block bg-primary/10 text-primary p-4 rounded-full mb-4">
                        {category.icon}
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                        {category.title}
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
                        تصفح مجموعتنا الكاملة من منتجات "{category.title}" عالية الجودة والمصممة لضمان أفضل أداء وموثوقية.
                    </p>
                </motion.div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                        <p className="text-muted-foreground">جاري تحميل المنتجات...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-20">
                        <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
                        <p className="text-xl text-destructive font-semibold">{error}</p>
                    </div>
                ) : products.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {products.map((product, index) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                index={index}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-xl text-muted-foreground font-semibold">لا توجد منتجات حالياً في هذه الفئة.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoryPage;
