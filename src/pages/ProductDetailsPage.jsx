// src/pages/ProductDetailsPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useCart, MIN_B2B_QTY } from '@/contexts/CartContext';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, ShoppingCart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

// دالة مساعدة لتنسيق السعر
const formatPrice = (price) => {
  return new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(price || 0);
};

const ProductDetailsPage = () => {
  const { productId } = useParams(); 
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(MIN_B2B_QTY);

  const { addItemToCart } = useCart();
  const { toast } = useToast();

  // الخطوة 2: نجلب بيانات المنتج من Firestore
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single();

        if (error) {
          console.error("Error fetching product:", error);
          setProduct(null);
        } else {
          setProduct(data);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleAddToCart = () => {
    if (!product) return;
    addItemToCart({ ...product, quantity });
    toast({
      title: "✅ تمت الإضافة إلى السلة",
      description: `تمت إضافة "${product.name}" إلى سلة التسوق.`,
    });
  };

  // عرض شاشة تحميل أثناء جلب البيانات
  if (loading) {
    return <div className="flex justify-center items-center h-[calc(100vh-200px)]"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>;
  }

  // عرض رسالة إذا لم يتم العثور على المنتج
  if (!product) {
    return <div className="text-center py-20"><h1>عذراً، لم يتم العثور على هذا المنتج.</h1></div>;
  }

  // الخطوة 3: عرض البيانات التي تم جلبها
  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start"
      >
        {/* عمود الصورة */}
        <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
            <Card className="overflow-hidden shadow-lg">
                <img src={product.image} alt={product.name} className="w-full h-auto object-cover aspect-square" />
            </Card>
        </motion.div>

        {/* عمود التفاصيل */}
        <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="space-y-6">
            <Badge variant="secondary">{product.category || 'فئة عامة'}</Badge>
            <h1 className="text-4xl font-extrabold text-primary">{product.name}</h1>
            <p className="text-lg text-muted-foreground">{product.description || 'لا يتوفر وصف لهذا المنتج.'}</p>
            
            <div className="flex items-center gap-4">
                <p className="text-3xl font-bold text-foreground">{formatPrice(product.price)}</p>
                {product.oldPrice && <p className="text-xl text-muted-foreground line-through">{formatPrice(product.oldPrice)}</p>}
            </div>
            <p className="text-sm font-semibold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/30 p-2 rounded-md inline-block">عروض أسعار الجملة للشركات والتجار</p>

            <div className="flex items-center gap-2">
                <div className="flex items-center text-amber-500">
                    <Star className="h-5 w-5 fill-current" />
                    <Star className="h-5 w-5 fill-current" />
                    <Star className="h-5 w-5 fill-current" />
                    <Star className="h-5 w-5 fill-current" />
                    <Star className="h-5 w-5 fill-current" />
                </div>
                <span className="text-sm text-muted-foreground">(مراجعات)</span>
            </div>
            
            <div className="border-t pt-6 space-y-4">
                <div className="flex items-center gap-4">
                    <Label htmlFor="quantity" className="text-lg">الكمية:</Label>
                    <Input 
                        id="quantity"
                        type="number"
                        min={MIN_B2B_QTY}
                        max={product.stock}
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(MIN_B2B_QTY, parseInt(e.target.value) || MIN_B2B_QTY))}
                        className="w-20 text-center"
                    />
                    <span className="text-xs text-muted-foreground">(الحد الأدنى للجملة: {MIN_B2B_QTY})</span>
                </div>
                <Button onClick={handleAddToCart} size="lg" className="w-full" disabled={product.stock <= 0}>
                    <ShoppingCart className="ml-2 h-5 w-5" />
                    {product.stock > 0 ? 'أضف إلى السلة' : 'نفد المخزون'}
                </Button>
            </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ProductDetailsPage;
