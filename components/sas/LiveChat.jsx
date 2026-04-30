import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Send, Loader2, X, MessageSquare, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LiveChat({ recipientId, orderId, rfqId, isOpen, onClose }) {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [recipient, setRecipient] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && currentUser) {
      fetchRecipient();
      fetchMessages();
      
      const channel = supabase.channel(`chat-${recipientId || orderId || rfqId}`)
        .on('postgres', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
          // Verify if message belongs to this conversation
          const msg = payload.new;
          const isRelevant = orderId ? msg.order_id === orderId : 
                             rfqId ? msg.rfq_id === rfqId :
                             (msg.sender_id === recipientId && msg.receiver_id === currentUser.id) ||
                             (msg.sender_id === currentUser.id && msg.receiver_id === recipientId);
          
          if (isRelevant) {
             fetchMessages(); // Refresh to get sender names etc.
          }
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isOpen, recipientId, orderId, rfqId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchRecipient = async () => {
    if (!recipientId) return;
    const { data } = await supabase.from('users').select('company_name, first_name').eq('id', recipientId).single();
    setRecipient(data);
  };

  const fetchMessages = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      let query = supabase.from('messages').select('*, sender:users(company_name, first_name)');
      
      if (orderId) {
        query = query.eq('order_id', orderId);
      } else if (rfqId) {
        query = query.eq('rfq_id', rfqId);
      } else if (recipientId) {
        query = query.or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${recipientId}),and(sender_id.eq.${recipientId},receiver_id.eq.${currentUser.id})`);
      }

      const { data, error } = await query.order('created_at', { ascending: true });
      if (!error) setMessages(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser) return;

    const payload = {
      sender_id: currentUser.id,
      text: newMessage.trim(),
      order_id: orderId || null,
      rfq_id: rfqId || null,
      receiver_id: recipientId || null
    };

    try {
      const { error } = await supabase.from('messages').insert([payload]);
      if (error) throw error;
      setNewMessage('');
      fetchMessages();
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-end p-4 pointer-events-none">
      <motion.div 
        initial={{ opacity: 0, y: 100, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 100, scale: 0.9 }}
        className="bg-white w-full max-w-md h-[600px] rounded-3xl shadow-2xl border border-gray-100 flex flex-col pointer-events-auto overflow-hidden"
        dir="rtl"
      >
        {/* Header */}
        <div className="bg-sas-blue p-5 text-white flex justify-between items-center shadow-lg">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <MessageSquare size={20} />
             </div>
             <div>
                <h3 className="font-bold text-sm">
                   {orderId ? `دردشة الطلب #${orderId.split('-')[0]}` : 
                    recipient?.company_name || recipient?.first_name || 'محادثة مباشرة'}
                </h3>
                <p className="text-[10px] opacity-70 flex items-center gap-1">
                   <ShieldCheck size={10} /> محادثة مشفرة وآمنة
                </p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
             <X size={24} />
          </button>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50/50">
          {loading && messages.length === 0 ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-sas-blue" /></div>
          ) : messages.length === 0 ? (
            <div className="text-center py-20">
               <div className="w-16 h-16 bg-blue-50 text-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare size={32} />
               </div>
               <p className="text-gray-400 text-sm font-medium">ابدأ التفاوض الآن مع {recipient?.company_name || 'الطرف الآخر'}</p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isMe = msg.sender_id === currentUser?.id;
              return (
                <div key={msg.id || idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  {!isMe && <span className="text-[10px] text-gray-400 mb-1 px-1 font-bold">{msg.sender?.company_name || 'مستخدم'}</span>}
                  <div 
                    className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm shadow-sm ${
                      isMe 
                        ? 'bg-sas-blue text-white rounded-tr-none' 
                        : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[8px] text-gray-300 mt-1">{new Date(msg.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Footer Input */}
        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-50 flex gap-2">
          <input 
            type="text" 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="اكتب رسالتك وتفاوض على السعر..."
            className="flex-1 bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-sas-blue outline-none transition-all"
          />
          <button 
            type="submit" 
            disabled={!newMessage.trim()}
            className="w-14 h-14 bg-sas-blue text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all disabled:opacity-50 disabled:shadow-none"
          >
            <Send size={20} className="transform rotate-180" />
          </button>
        </form>
      </motion.div>
    </div>
  );
}
