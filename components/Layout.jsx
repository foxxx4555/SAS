// src/components/Layout.jsx (النسخة النهائية المدمجة والجاهزة للعمل)

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Toaster } from '@/components/ui/toaster';
import { Outlet } from 'react-router-dom';

// 🔥 الخطوة 1: استيراد مكون الشات بوت الجديد
import AIAssistant from './AIAssistant'; 

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <Footer />
      <Toaster />
      
      {/* 🔥 الخطوة 2: إضافة مكون الشات بوت هنا في نهاية الـ Layout */}
      <AIAssistant />
    </div>
  );
};

export default Layout;
