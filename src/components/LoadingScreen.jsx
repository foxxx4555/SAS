// src/components/LoadingScreen.jsx (النسخة النهائية مع تأثير واضح)

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplets } from 'lucide-react';

const LoadingScreen = () => {
  const [progress, setProgress] = useState(0);
  const [showSplash, setShowSplash] = useState(false);

  // تأثير لزيادة شريط التحميل بشكل تدريجي
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(oldProgress => {
        if (oldProgress >= 100) {
          clearInterval(timer);
          // انتظر قليلاً بعد اكتمال الشريط ثم اعرض الطرطشة
          setTimeout(() => setShowSplash(true), 300);
          return 100;
        }
        const diff = Math.random() * 10;
        return Math.min(oldProgress + diff, 100);
      });
    }, 150); // أبطأنا قليلاً ليكون التحميل مرئيًا

    return () => clearInterval(timer);
  }, []);

  const text = "SAS Logistics";
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const letterVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };
  
  const splashVariants = {
    initial: { scale: 0, opacity: 0, rotate: -90 },
    animate: { 
      scale: [1, 1.5, 1.2, 2.5, 0], 
      rotate: [0, 15, -15, 0, 0],
      opacity: [1, 0.8, 0.6, 0.2, 0],
      transition: { duration: 0.7, ease: "easeOut" }
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-background">
        <AnimatePresence>
            {!showSplash ? (
                <motion.div
                    key="loader"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.3 } }}
                    className="flex flex-col items-center justify-center"
                >
                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="flex items-center mb-6"
                        dir="ltr"
                    >
                        {text.split("").map((char, index) => (
                            <motion.span
                                key={`${char}-${index}`}
                                variants={letterVariants}
                                className={`text-4xl md:text-5xl font-bold text-primary ${char === ' ' ? 'mx-2' : ''}`}
                            >
                                {char}
                            </motion.span>
                        ))}
                    </motion.div>

                    <div className="w-64 h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-primary"
                            style={{ originX: 0 }}
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: progress / 100 }}
                            transition={{ duration: 0.2, ease: "linear" }}
                        />
                    </div>
                </motion.div>
            ) : (
                <motion.div
                    key="splash"
                    variants={splashVariants}
                    initial="initial"
                    animate="animate"
                >
                    <Droplets size={150} className="text-primary" />
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
};

export default LoadingScreen;
