import React from 'react';
import RFQWizard from '@/components/sas/RFQWizard.jsx';
import { motion } from 'framer-motion';

export default function RFQPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
            منصة <span className="text-sas-blue">SAS B2B</span>
          </h1>
          <p className="mt-4 text-xl text-gray-500">
            أسرع طريقة لطلب عروض الأسعار من الموردين المعتمدين عالمياً
          </p>
        </div>
        
        <RFQWizard />
      </motion.div>
    </div>
  );
}
