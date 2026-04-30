// src/components/AIFloatingButton.jsx

import React from 'react';
import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';

const AIFloatingButton = ({ onClick }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-6 right-6 z-50"
    >
      <motion.button
        onClick={onClick}
        className="w-16 h-16 bg-gradient-to-br from-primary to-secondary text-white rounded-full flex items-center justify-center shadow-lg focus:outline-none focus:ring-4 focus:ring-primary/50"
        aria-label="افتح مساعد الذكاء الاصطناعي"
        // إضافة حركة النبض الخفيفة
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 2,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "loop",
        }}
      >
        <Bot size={32} />
      </motion.button>
    </motion.div>
  );
};

export default AIFloatingButton;
