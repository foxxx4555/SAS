import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { ShieldCheck, Truck, PackageCheck, CreditCard, Loader2, ArrowRight, CheckCircle2, MessageSquare, Send, Check } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const steps = [
  { id: 'CREATED', label: 'تم الإنشاء' },
  { id: 'FUNDED_HELD', label: 'دفع بالضمان' },
  { id: 'PRODUCTION', label: 'قيد التجهيز' },
  { id: 'SHIPPED', label: 'تم الشحن' },
  { id: 'DELIVERED', label: 'مكتمل' }
];

export default function OrderDetails() {
  const { id } = useParams();
  const { toast } = useToast();
  const { currentUser, isVendor } = useAuth();
  
  const [order, setOrder] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchOrder();
    fetchMessages();
    
    // 🔴 Realtime subscriptions
    const orderChannel = supabase.channel('order-updates')
      .on('postgres', { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${id}` }, (payload) => {
        setOrder((prev) => ({ ...prev, ...payload.new }));
      })
      .subscribe();

    const messagesChannel = supabase.channel('message-inserts')
      .on('postgres', { event: 'INSERT', schema: 'public', table: 'messages', filter: `order_id=eq.${id}` }, (payload) => {
        // Fetch the new messages to get the joined sender name
        fetchMessages();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(orderChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchOrder = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          rfq:rfqs(title, quantity, unit, shipping_destination),
          supplier:users!supplier_id(company_name),
          buyer:users!buyer_id(company_name)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setOrder(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*, sender:users(company_name)')
        .eq('order_id', id)
        .order('created_at', { ascending: true });
        
      if (!error && data) setMessages(data);
    } catch (err) {
      console.error("Error fetching messages", err);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser) return;
    
    try {
      const { error } = await supabase.from('messages').insert([{
        order_id: id,
        sender_id: currentUser.id,
        text: newMessage.trim()
      }]);
      
      if (error) throw error;
      setNewMessage('');
      fetchMessages(); // refresh
    } catch (err) {
      toast({ title: 'خطأ', description: 'لم يتم إرسال الرسالة', variant: 'destructive' });
    }
  };

  const handlePayToEscrow = async () => {
    try {
      setActionLoading(true);
      const { error } = await supabase
        .from('orders')
        .update({ escrow_status: 'FUNDED_HELD', order_status: 'PRODUCTION' })
        .eq('id', id);

      if (error) throw error;
      setOrder(prev => ({ ...prev, escrow_status: 'FUNDED_HELD', order_status: 'PRODUCTION' }));
      toast({ title: '✅ تم الدفع للضمان', className: 'bg-green-50 text-green-900 border-green-200' });
    } catch (err) {
      toast({ title: 'فشل العملية', description: err.message, variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkAsShipped = async () => {
    try {
      setActionLoading(true);
      const { error } = await supabase
        .from('orders')
        .update({ order_status: 'SHIPPED' })
        .eq('id', id);

      if (error) throw error;
      setOrder(prev => ({ ...prev, order_status: 'SHIPPED' }));
      toast({ title: '✅ تم التحديث إلى "تم الشحن"', className: 'bg-green-50 text-green-900 border-green-200' });
    } catch (err) {
      toast({ title: 'فشل العملية', description: err.message, variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReleaseFunds = async () => {
    try {
      setActionLoading(true);
      const { error } = await supabase
        .from('orders')
        .update({ escrow_status: 'RELEASED', order_status: 'COMPLETED' })
        .eq('id', id);

      if (error) throw error;
      // 2. Update Supplier's Trust Score (Logic: +0.1 for every successful order)
      const { data: supplierData } = await supabase.from('users').select('trust_score').eq('id', order.supplier_id).single();
      const currentScore = supplierData?.trust_score || 4.0;
      const newScore = Math.min(5.0, currentScore + 0.1);
      
      await supabase.from('users').update({ trust_score: newScore }).eq('id', order.supplier_id);

      setOrder(prev => ({ ...prev, escrow_status: 'RELEASED', order_status: 'COMPLETED' }));
      toast({ title: '🎉 تم إكمال الطلب بنجاح!', description: order.payment_method === 'COD' ? 'تم تأكيد الاستلام والدفع للمورد نقداً.' : 'اكتمل الطلب وتم تحويل الأموال للمورد.', className: 'bg-green-50 text-green-900 border-green-200' });
    } catch (err) {
      toast({ title: 'فشل العملية', description: err.message, variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const handlePrintInvoice = () => {
    const printWindow = window.open('', '_blank');
    const invoiceHTML = `
      <html dir="rtl">
        <head>
          <title>Invoice - SAS Platform</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #333; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #1E40AF; padding-bottom: 20px; margin-bottom: 40px; }
            .logo { font-size: 24px; font-weight: 900; color: #1E40AF; }
            .invoice-info { text-align: left; }
            .details-grid { display: grid; grid-template-cols: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
            .section-title { font-weight: bold; color: #666; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background: #f8fafc; text-align: right; padding: 12px; border-bottom: 2px solid #eee; }
            td { padding: 12px; border-bottom: 1px solid #eee; }
            .total-row { font-weight: 900; font-size: 18px; color: #1E40AF; }
            .footer { margin-top: 60px; text-align: center; font-size: 12px; color: #999; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">SAS B2B PLATFORM</div>
            <div class="invoice-info">
              <div>رقم الفاتورة: #INV-${order.id.split('-')[0].toUpperCase()}</div>
              <div>التاريخ: ${new Date().toLocaleDateString('ar-EG')}</div>
            </div>
          </div>
          
          <div class="details-grid">
            <div>
              <div class="section-title">إلى (المشتري)</div>
              <div><strong>${order.buyer?.company_name}</strong></div>
              <div>وجهة الشحن: ${order.rfq?.shipping_destination}</div>
            </div>
            <div>
              <div class="section-title">من (المورد)</div>
              <div><strong>${order.supplier?.company_name}</strong></div>
              <div>طريقة الدفع: ${order.payment_method === 'COD' ? 'الدفع عند الاستلام' : 'نظام الضمان'}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>الوصف</th>
                <th>الكمية</th>
                <th>سعر الوحدة</th>
                <th>الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${order.rfq?.title}</td>
                <td>${order.rfq?.quantity} ${order.rfq?.unit}</td>
                <td>$${(order.total_amount / order.rfq?.quantity).toFixed(2)}</td>
                <td>$${order.total_amount.toLocaleString()}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="total-row">
                <td colspan="3" style="text-align: left;">المجموع الكلي:</td>
                <td>$${order.total_amount.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>

          <div class="footer">
            تم إنشاء هذه الفاتورة إلكترونياً عبر منصة SAS B2B. جميع الحقوق محفوظة 2026.
          </div>
          <script>window.onload = () => { window.print(); window.close(); }</script>
        </body>
      </html>
    `;
    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
  };

  if (loading) return <div className="min-h-screen flex justify-center items-center"><Loader2 className="animate-spin text-sas-blue w-12 h-12" /></div>;
  if (!order) return <div className="text-center py-20 text-red-500">الطلب غير موجود.</div>;

  // Determine current step index
  const getCurrentStepIndex = () => {
    if (order.order_status === 'COMPLETED') return 4;
    if (order.order_status === 'SHIPPED') return 3;
    if (order.order_status === 'PRODUCTION') return 2;
    if (order.payment_method === 'COD' || order.escrow_status === 'FUNDED_HELD') return 1;
    return 0; // CREATED or AWAITING_FUNDS
  };
  
  const currentStepIndex = getCurrentStepIndex();

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12" dir="rtl">
      <div className="max-w-6xl mx-auto">
        
        <Link to={isVendor ? "/supplier/rfqs" : "/buyer/dashboard"} className="flex items-center gap-2 text-gray-500 hover:text-sas-blue mb-6 transition-colors w-fit">
          <ArrowRight size={20} /> العودة للوحة التحكم
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Order Details & Timeline */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-[#1E40AF] p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 opacity-10"><ShieldCheck size={150} /></div>
                <h1 className="text-3xl font-black mb-2 relative z-10 text-white">الطلب #{order.id.split('-')[0]}</h1>
                <div className="flex justify-between items-end relative z-10">
                  <p className="text-blue-200 text-lg">{order.rfq?.title}</p>
                  <button 
                    onClick={handlePrintInvoice}
                    className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-sm font-bold backdrop-blur-sm transition-all flex items-center gap-2 border border-white/10"
                  >
                    <PackageCheck size={18} /> تحميل الفاتورة (PDF)
                  </button>
                </div>
              </div>

              <div className="p-8">
                {/* Logistics Timeline */}
                <h3 className="font-bold text-gray-900 mb-8 text-xl flex items-center gap-2"><Truck className="text-sas-blue"/> تتبع الشحنة</h3>
                <div className="flex justify-between relative mb-12 px-4">
                  <div className="absolute top-5 left-8 right-8 h-1 bg-gray-100 -z-10 rounded-full"></div>
                  <div 
                    className="absolute top-5 right-8 h-1 bg-sas-blue -z-10 rounded-full transition-all duration-1000"
                    style={{ width: `calc(${(currentStepIndex / 4) * 100}% - 2rem)` }}
                  ></div>
                  
                  {steps.map((step, idx) => {
                    const isActive = idx <= currentStepIndex;
                    return (
                      <div key={idx} className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all border-4 border-white ${isActive ? 'bg-sas-blue text-white shadow-lg scale-110' : 'bg-gray-200 text-gray-400'}`}>
                          {isActive ? <Check size={18} strokeWidth={3} /> : idx + 1}
                        </div>
                        <span className={`mt-3 text-xs md:text-sm font-bold text-center ${isActive ? 'text-sas-blue' : 'text-gray-400'}`}>{step.label}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-2xl">
                  <div>
                    <span className="text-gray-500 text-sm block mb-1">المشتري</span>
                    <strong className="text-gray-900">{order.buyer?.company_name}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm block mb-1">المورد</span>
                    <strong className="text-gray-900">{order.supplier?.company_name}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm block mb-1">الكمية</span>
                    <strong className="text-gray-900">{order.rfq?.quantity} {order.rfq?.unit}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm block mb-1">وجهة التسليم</span>
                    <strong className="text-gray-900">{order.rfq?.shipping_destination}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm block mb-1">طريقة الدفع</span>
                    <strong className="text-sas-blue">{order.payment_method === 'COD' ? 'الدفع عند الاستلام (COD)' : 'الدفع عبر الضمان (Escrow)'}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Escrow Actions */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-6 text-xl flex items-center gap-2">
                <CreditCard className="text-sas-blue"/> حساب الضمان والإجراءات
              </h3>
              
              <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-blue-50 border border-blue-100 rounded-2xl gap-6">
                <div>
                  <p className="text-sm text-sas-blue font-bold mb-1">المبلغ الإجمالي</p>
                  <p className="text-4xl font-black text-gray-900">${order.total_amount.toLocaleString()}</p>
                </div>
                
                <div className="flex-1 w-full flex flex-col gap-3">
                  {order.payment_method === 'COD' ? (
                    <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                      <p className="text-amber-800 font-bold text-sm flex items-center gap-2">
                        <DollarSign size={18} /> نظام الدفع عند الاستلام نشط
                      </p>
                      <p className="text-xs text-amber-600 mt-1">يرجى تجهيز المبلغ نقداً أو عبر وسيلة الدفع المتفق عليها عند وصول المندوب.</p>
                      {isVendor && order.order_status === 'PRODUCTION' && (
                        <button onClick={handleMarkAsShipped} disabled={actionLoading} className="w-full mt-4 bg-sas-blue hover:bg-blue-700 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2">
                          {actionLoading ? <Loader2 className="animate-spin" /> : 'تأكيد شحن البضاعة'}
                        </button>
                      )}
                      {!isVendor && order.order_status === 'SHIPPED' && (
                        <button onClick={handleReleaseFunds} disabled={actionLoading} className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2">
                          {actionLoading ? <Loader2 className="animate-spin" /> : 'تأكيد الاستلام والدفع'}
                        </button>
                      )}
                    </div>
                  ) : (
                    <>
                      {!isVendor && order.escrow_status === 'AWAITING_FUNDS' && (
                        <button onClick={handlePayToEscrow} disabled={actionLoading} className="w-full bg-[#1E40AF] hover:bg-blue-800 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2">
                          {actionLoading ? <Loader2 className="animate-spin" /> : 'إيداع المبلغ في حساب الضمان'}
                        </button>
                      )}

                      {isVendor && order.escrow_status === 'FUNDED_HELD' && order.order_status === 'PRODUCTION' && (
                        <button onClick={handleMarkAsShipped} disabled={actionLoading} className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2">
                          {actionLoading ? <Loader2 className="animate-spin" /> : 'تأكيد شحن البضاعة (Mark as Shipped)'}
                        </button>
                      )}

                      {!isVendor && order.order_status === 'SHIPPED' && order.escrow_status === 'FUNDED_HELD' && (
                        <button onClick={handleReleaseFunds} disabled={actionLoading} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2">
                          {actionLoading ? <Loader2 className="animate-spin" /> : 'تأكيد الاستلام وتحرير الأموال للمورد'}
                        </button>
                      )}
                    </>
                  )}

                  {order.order_status === 'COMPLETED' && (
                    <div className="w-full bg-green-100 text-green-800 font-bold py-3 rounded-xl flex justify-center items-center gap-2">
                      <CheckCircle2 size={20} /> العملية مكتملة
                    </div>
                  )}

                  {order.payment_method !== 'COD' && order.escrow_status === 'FUNDED_HELD' && order.order_status !== 'SHIPPED' && !isVendor && (
                     <div className="text-center text-sm font-semibold text-gray-500">ننتظر المورد لشحن البضاعة...</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Chat System */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col h-[600px] lg:h-auto">
            <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-3xl flex items-center gap-2">
              <MessageSquare className="text-sas-blue" />
              <h3 className="font-bold text-gray-900">محادثة الطلب</h3>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#F8FAFC]">
              {messages.length === 0 ? (
                <p className="text-center text-gray-400 text-sm mt-10">لا توجد رسائل بعد. ابدأ المحادثة الآن.</p>
              ) : (
                messages.map(msg => {
                  const isMe = msg.sender_id === currentUser?.id;
                  return (
                    <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <span className="text-xs text-gray-400 mb-1 px-1">{msg.sender?.company_name || 'مستخدم'}</span>
                      <div className={`px-4 py-2 rounded-2xl max-w-[85%] ${isMe ? 'bg-sas-blue text-white rounded-tr-none' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'}`}>
                        {msg.text}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} className="p-4 border-t border-gray-100 bg-white rounded-b-3xl flex gap-2">
              <input 
                type="text" 
                placeholder="اكتب رسالتك هنا..." 
                className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sas-blue outline-none text-sm"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button type="submit" disabled={!newMessage.trim()} className="bg-sas-blue hover:bg-blue-800 text-white w-10 h-10 rounded-xl flex items-center justify-center disabled:opacity-50 transition-colors">
                <Send size={18} className="transform rotate-180" />
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
