// src/components/Footer.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Droplets } from 'lucide-react';
import { motion } from 'framer-motion';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  // 🔥🔥 الخطوة 1: تعريف روابط السوشيال ميديا هنا 🔥🔥
  const socialLinks = {
    facebook: "https://www.facebook.com/share/1AMT8hGZMM/", // <-- الرابط بتاعك
    twitter: "https://twitter.com/your_username",     // <-- غيّر ده للرابط بتاعك
    instagram: "https://instagram.com/your_username", // <-- غيّر ده للرابط بتاعك
    linkedin: "https://linkedin.com/company/your_company" // <-- غيّر ده للرابط بتاعك
  };

  return (
    <motion.footer 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="bg-gradient-to-r from-water-blue-dark to-water-blue text-primary-foreground py-12 px-4"
    >
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-right">
        <div className="md:col-span-2">
          <div className="flex items-center justify-center md:justify-start mb-4">
            <Droplets size={32} className="mr-2" />
            <span className="text-2xl font-bold">ساس للنقل اللوجستي</span>
          </div>
          <p className="text-sm text-blue-100 max-w-md">
            نلتزم بتوفير أنظمة معالجة مياه وحلول شرب صحية عالية الجودة لضمان حياة أفضل.
          </p>
        </div>
        
        <div>
          <p className="text-xl font-semibold mb-4">روابط سريعة</p>
          <ul className="space-y-2">
            <li><Link to="/" className="hover:text-water-blue-light transition-colors">الرئيسية</Link></li>
            <li><Link to="/products" className="hover:text-water-blue-light transition-colors">المنتجات</Link></li>
            <li><Link to="/about" className="hover:text-water-blue-light transition-colors">عن الشركة</Link></li>
            <li><Link to="/contact" className="hover:text-water-blue-light transition-colors">اتصل بنا</Link></li>
            <li><Link to="/terms-conditions" className="hover:text-water-blue-light transition-colors">الشروط والأحكام</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-xl font-semibold mb-4">تابعنا</p>
          {/* 🔥🔥 الخطوة 2: استخدام الروابط اللي عرفناها فوق 🔥🔥 */}
          <div className="flex justify-center md:justify-start space-x-4 space-x-reverse mb-4">
            <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-water-blue-light transition-colors"><Facebook size={24} /></a>
            <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="hover:text-water-blue-light transition-colors"><Twitter size={24} /></a>
            <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-water-blue-light transition-colors"><Instagram size={24} /></a>
            <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="hover:text-water-blue-light transition-colors"><Linkedin size={24} /></a>
          </div>
        </div>
      </div>
      <div className="mt-8 pt-8 border-t border-water-blue-light/30 text-center text-sm text-blue-100">
        <p>© {currentYear} منصة ساس للنقل اللوجستي. جميع الحقوق محفوظة.</p>
      </div>
    </motion.footer>
  );
};

export default Footer;
