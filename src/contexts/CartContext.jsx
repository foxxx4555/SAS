
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';

export const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const MIN_B2B_QTY = 5;

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    const localCart = localStorage.getItem('cartItems');
    setCartItems(localCart ? JSON.parse(localCart) : []);
  }, []);

  const updateLocalStorageAndNotify = (items) => {
    localStorage.setItem('cartItems', JSON.stringify(items));
    setCartItems(items);
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  };

  const addItemToCart = useCallback((productToAdd, quantityToAdd = MIN_B2B_QTY) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === productToAdd.id);
      let updatedItems;

      if (existingItem) {
        const newQty = existingItem.quantity + quantityToAdd;
        if (newQty <= productToAdd.stock) {
          updatedItems = prevItems.map(item =>
            item.id === productToAdd.id ? { ...item, quantity: newQty } : item
          );
        } else {
          toast({
            title: "كمية المخزون غير كافية",
            description: `أقصى كمية يمكنك طلبها من هذا المنتج هي ${productToAdd.stock} قطعة.`,
            variant: "destructive",
          });
          return prevItems; 
        }
      } else {
        if (productToAdd.stock >= quantityToAdd) {
          updatedItems = [...prevItems, { ...productToAdd, quantity: quantityToAdd }];
        } else if (productToAdd.stock > 0 && productToAdd.stock < quantityToAdd) {
             toast({
              title: "المخزون أقل من حد الجملة",
              description: `الكمية المتوفرة حالياً (${productToAdd.stock}) وهي أقل من الحد الأدنى لطلبات الجملة (${MIN_B2B_QTY}).`,
              variant: "destructive",
            });
            return prevItems;
        } else {
          toast({
            title: "نفد المخزون",
            description: `عفواً، منتج "${productToAdd.name}" غير متوفر حالياً.`,
            variant: "destructive",
          });
          return prevItems;
        }
      }
      updateLocalStorageAndNotify(updatedItems);
      toast({
        title: "🛒 تمت الإضافة للطلبات",
        description: `تم إضافة ${quantityToAdd} قطع من "${productToAdd.name}". (طلبات جملة)`,
        className: "bg-green-500 text-white",
      });
      return updatedItems;
    });
  }, [toast]);

  const updateItemQuantity = useCallback((itemId, newQuantity) => {
    setCartItems(prevItems => {
      const updatedItems = prevItems.map(item => {
        if (item.id === itemId) {
          if (newQuantity < MIN_B2B_QTY) {
             toast({
              title: "غير مسموح",
              description: `الحد الأدنى لطلبات الجملة هو ${MIN_B2B_QTY} قطع. لحذف المنتج استخدم زر الحذف.`,
              variant: "destructive",
            });
            return item;
          }
          if (newQuantity > item.stock) {
            toast({
              title: "كمية غير متوفرة",
              description: `الكمية المطلوبة لـ ${item.name} تتجاوز المخزون المتاح (${item.stock}).`,
              variant: "destructive",
            });
            return item;
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      });
      updateLocalStorageAndNotify(updatedItems);
      return updatedItems;
    });
  }, [toast]);

  const removeItemFromCart = useCallback((itemId) => {
    setCartItems(prevItems => {
      const updatedItems = prevItems.filter(item => item.id !== itemId);
      updateLocalStorageAndNotify(updatedItems);
      toast({
        title: "🗑️ تم الحذف من السلة",
        description: "تمت إزالة المنتج من سلة التسوق الخاصة بك.",
        className: "bg-red-500 text-white",
      });
      return updatedItems;
    });
  }, [toast]);

  const clearCart = useCallback(() => {
    updateLocalStorageAndNotify([]);
    // No toast here, usually called after successful order or explicit clear button
  }, []);

  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);
  const cartCount = cartItems.reduce((count, item) => count + (item.quantity || 0), 0);

  return (
    <CartContext.Provider value={{ cartItems, addItemToCart, updateItemQuantity, removeItemFromCart, clearCart, cartTotal, cartCount }}>
      {children}
    </CartContext.Provider>
  );
};
