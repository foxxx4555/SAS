// uploadProducts.js - سكربت خارجي لرفع المنتجات (النسخة النهائية)

import { collection, writeBatch, doc } from 'firebase/firestore';
import { db } from './src/firebase.js'; // ✅ يستورد db من ملفك مباشرة
import { productCategories } from './src/data/productsData.js'; // تأكد من صحة مسار ملف بياناتك

// الدالة الرئيسية لرفع البيانات
async function uploadData() {
  console.log("🚀 بدء عملية رفع المنتجات إلى Firestore...");

  const productsCollectionRef = collection(db, 'products');
  const batch = writeBatch(db);
  let productsCount = 0;

  productCategories.forEach(category => {
    // نتأكد إن الفئة فيها منتجات أصلاً
    if (category.products && category.products.length > 0) {
      category.products.forEach(product => {
        const newProductRef = doc(productsCollectionRef); // ID عشوائي من Firestore

        // بناء هيكل المنتج النهائي بناءً على طلبك
        const productData = {
          name: product.name || "اسم غير متوفر",
          description: product.description || "وصف غير متوفر",
          image: product.image || "https://via.placeholder.com/300",
          altText: product.altText || product.name,
          
          // الحقول الإضافية مع قيم افتراضية آمنة
          price: product.price || 0,
          originalPrice: product.originalPrice || null,
          stock: product.stock || 50,
          rating: product.rating || 5,
          reviews: product.reviews || 0,
          
          // ربط المنتج بالفئة
          categoryId: category.id,
          categoryTitle: category.title,

          // إضافة التواريخ
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        batch.set(newProductRef, productData);
        productsCount++;
      });
    }
  });

  if (productsCount === 0) {
    console.log("⚠️ لم يتم العثور على منتجات لرفعها. تأكد من أن ملف البيانات ليس فارغًا.");
    return;
  }

  try {
    await batch.commit();
    console.log(`✅ نجاح! تم رفع ${productsCount} منتجًا بنجاح إلى قاعدة البيانات.`);
    console.log("👍 العملية تمت بنجاح.");
  } catch (error) {
    console.error("❌ فشل في رفع البيانات:", error);
  }
}

// تشغيل الدالة
uploadData();
