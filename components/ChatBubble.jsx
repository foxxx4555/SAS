// src/components/ChatBubble.jsx

import React from 'react';
import { motion } from 'framer-motion';
import { Bot, User } from 'lucide-react';

const ChatBubble = ({ message, sender }) => {
  const isUser = sender === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex items-start gap-3 my-4 ${isUser ? 'justify-end' : ''}`}
    >
      {!isUser && (
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-green-400 text-white flex items-center justify-center flex-shrink-0 shadow-md">
          <Bot size={24} />
        </div>
      )}

      <div
        className={`max-w-xs md:max-w-md p-4 rounded-2xl shadow-sm ${
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-lg'
            : 'bg-white dark:bg-slate-700/50 text-foreground rounded-bl-lg'
        }`}
      >
        <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{message}</p>
      </div>
      
      {isUser && (
         <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-200 flex items-center justify-center flex-shrink-0 shadow-md">
          <User size={24} />
        </div>
      )}
    </motion.div>
  );
};

export default ChatBubble;
