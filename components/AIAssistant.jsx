// src/components/AIAssistant.jsx (النسخة النهائية مع تعديل اللون)

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X } from 'lucide-react';
import AIFloatingButton from './AIFloatingButton';
import ChatBubble from './ChatBubble';
import { Button } from '@/components/ui/button';

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'مرحباً! أنا مساعدك الذكي في منصة ساس. كيف يمكنني خدمتك اليوم؟' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const userMessage = inputValue.trim();
    if (!userMessage) return;

    setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    setInputValue('');
    setIsLoading(true);

    const functionUrl = 'https://us-central1-right-water.cloudfunctions.net/askGemini';

    try {
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: userMessage }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Server error');
      }

      const result = await response.json();
      const aiResponse = result.text;
      
      setMessages(prev => [...prev, { sender: 'ai', text: aiResponse }]);

    } catch (error) {
      console.error("Error calling Firebase Function:", error);
      setMessages(prev => [...prev, { sender: 'ai', text: "عفوًا، حدث خطأ فني. يرجى المحاولة مرة أخرى لاحقًا." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AIFloatingButton onClick={() => setIsOpen(true)} />

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-6 right-6 sm:bottom-24 sm:right-8 z-[60] w-[calc(100vw-3rem)] max-w-sm h-[75vh] max-h-[600px] flex flex-col glassmorphism-card border-primary/20"
          >
            {/* Header */}
            <header className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0">
              {/* ===== السطر الذي تم تعديله ===== */}
              <h3 className="font-bold text-lg text-black">مساعد ساس الذكي</h3>
              
              <button onClick={() => setIsOpen(false)} className="p-1 rounded-full text-black/70 hover:bg-black/10 hover:text-black transition-colors">
                <X size={20} />
              </button>
            </header>

            {/* Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto chat-scrollbar">
              {messages.map((msg, index) => (
                <ChatBubble key={index} sender={msg.sender} message={msg.text} />
              ))}
              {isLoading && (
                 <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-2"
                >
                    <span className="w-2 h-2 bg-primary rounded-full animate-pulse delay-0"></span>
                    <span className="w-2 h-2 bg-primary rounded-full animate-pulse delay-100"></span>
                    <span className="w-2 h-2 bg-primary rounded-full animate-pulse delay-200"></span>
                </motion.div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Form */}
            <footer className="p-4 border-t border-white/10 flex-shrink-0">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="اكتب سؤالك هنا..."
                  className="flex-1 p-3 border border-primary/30 bg-background/50 rounded-full focus:ring-2 focus:ring-primary focus:outline-none transition-all duration-300 text-sm"
                  disabled={isLoading}
                />
                <Button type="submit" size="icon" className="rounded-full w-12 h-12 bg-primary hover:bg-primary/90 transition-transform active:scale-90" disabled={isLoading || !inputValue}>
                  <Send size={20} />
                </Button>
              </form>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIAssistant;
