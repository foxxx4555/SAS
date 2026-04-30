// src/components/ProductCard.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Star, PackageX } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { useCart, MIN_B2B_QTY } from '@/contexts/CartContext';

const ProductCard = ({ product }) => {
  const { toast } = useToast();
  const { addItemToCart } = useCart();

  if (!product) {
    return null; 
  }

  const isOutOfStock = product.stock <= 0;
  const isBelowB2BMQ = product.stock > 0 && product.stock < MIN_B2B_QTY;

  const handleAddToCartClick = () => {
    if (isOutOfStock) {
      toast({
        title: "نفذ المخزون",
        description: `عفواً، منتج "${product.name}" غير متوفر حالياً.`,
        variant: "destructive",
      });
      return;
    }
    if (isBelowB2BMQ) {
         toast({
          title: "لا يمكن الإضافة",
          description: `المخزون المتوفر (${product.stock}) أقل من الحد الأدنى للجملة (${MIN_B2B_QTY}).`,
          variant: "destructive",
        });
        return;
    }
    addItemToCart(product, MIN_B2B_QTY);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(price || 0);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full h-full"
    >
      <Card className={`overflow-hidden h-full flex flex-col group bg-white dark:bg-slate-800 border dark:border-slate-700 hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1 ${isOutOfStock ? 'opacity-70 bg-slate-50 dark:bg-slate-800/50' : ''}`}>
        <CardHeader className="p-0 relative">
          <Link to={`/products/${product.id}`} className={isOutOfStock ? 'pointer-events-none cursor-not-allowed' : ''}>
            {/* إطار الصورة */}
            <div className="aspect-square w-full overflow-hidden">
                <img  
                  alt={product.name || "صورة منتج"}
                  className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                  src={product.image || "https://via.placeholder.com/400?text=No+Image"} 
                />
            </div>
          </Link>

          {/* شارات الخصم ونفاذ المخزون */}
          {product.originalPrice && !isOutOfStock && (
            <Badge variant="destructive" className="absolute top-3 right-3 shadow-lg">
              خصم
            </Badge>
          )}
          {isOutOfStock && (
             <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/60 text-white text-sm font-bold px-4 py-2 rounded-md shadow-lg flex items-center backdrop-blur-sm">
              <PackageX className="mr-2 h-5 w-5" /> نفد المخزون
            </div>
          )}
        </CardHeader>
        
        <CardContent className="p-4 flex-grow flex flex-col">
          <div className="flex-grow">
            <span className="text-xs text-muted-foreground">{product.category || 'غير مصنف'}</span>
            <Link to={`/products/${product.id}`} className={isOutOfStock ? 'pointer-events-none' : ''}>
              <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-200 hover:text-primary transition-colors mt-1 mb-2 h-12 overflow-hidden">
                {product.name || 'اسم المنتج غير متوفر'}
              </CardTitle>
            </Link>
            
            <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-3">
              <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
              <span>{product.rating || 0} ({product.reviews || 0} مراجعات)</span>
            </div>
          </div>

          <div>
            <div className="flex items-baseline space-x-2 space-x-reverse mb-2">
              <p className="text-xl font-extrabold text-primary">
                {formatPrice(product.price)}
              </p>
              {product.originalPrice && (
                <p className="text-sm text-muted-foreground line-through">
                  {formatPrice(product.originalPrice)}
                </p>
              )}
            </div>
             <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-muted-foreground">المتاح: {product.stock || 0}</p>
                <div className="bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 px-2 py-0.5 rounded text-[10px] font-bold">جملة فقط</div>
              </div>
          </div>
        </CardContent>

        <CardFooter className="p-3 border-t dark:border-slate-700/50 mt-auto flex flex-col gap-2">
          {(!isOutOfStock && !isBelowB2BMQ) && (
             <p className="text-[11px] text-center w-full text-muted-foreground">أقل كمية للطلب: {MIN_B2B_QTY} قطع</p>
          )}
          <Button 
            onClick={handleAddToCartClick} 
            className="w-full"
            disabled={isOutOfStock || isBelowB2BMQ}
          >
            <ShoppingCart className="mr-2 h-4 w-4" /> 
            {isOutOfStock ? 'غير متوفر' : isBelowB2BMQ ? 'لا يكفي لطلب جملة' : `أضف للسلة (${MIN_B2B_QTY})`}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default ProductCard;
