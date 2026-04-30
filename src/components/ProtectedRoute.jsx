// src/components/ProtectedRoute.jsx (النسخة المعدلة والمحسنة)

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext'; // تأكد أن هذا هو المسار الصحيح
import { Loader2 } from 'lucide-react';

// 🔥🔥 التعديل هنا: إضافة دعم لـ vendorOnly وإزالة رابط /login القديم 🔥🔥
const ProtectedRoute = ({ adminOnly = false, vendorOnly = false }) => {
  const { currentUser, isAdmin, isVendor, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // إذا كان المستخدم غير مسجل، وجهه للصفحة الرئيسية ليفتح المودال
  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  // إذا كان المسار يتطلب صلاحية أدمن والمستخدم ليس أدمن
  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // إذا كان المسار يتطلب صلاحية مورد (Vendor) والمستخدم ليس مورداً
  if (vendorOnly && !isVendor) {
    return <Navigate to="/" replace />;
  }

  // إذا كان كل شيء على ما يرام، اعرض المحتوى
  return <Outlet />;
};

export default ProtectedRoute;
