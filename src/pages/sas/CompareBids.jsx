import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Star, ShieldCheck, ArrowRight, Loader2, Award, Clock, DollarSign } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function CompareBids() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [rfq, setRfq] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [awardingBidId, setAwardingBidId] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedBid, setSelectedBid] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('ESCROW');

  useEffect(() => {
    const fetchBids = async () => {
      try {
        setLoading(true);
        // Fetch RFQ Details
        const { data: rfqData, error: rfqError } = await supabase
          .from('rfqs')
          .select('*')
          .eq('id', id)
          .single();
          
        if (rfqError) throw rfqError;
        setRfq(rfqData);

        // Fetch Bids (Quotations) with Supplier info
        const { data: bidsData, error: bidsError } = await supabase
          .from('quotations')
          .select('*, supplier:users!supplier_id(company_name, trust_score, tier)')
          .eq('rfq_id', id)
          .order('price', { ascending: true }); // Order by lowest price

        if (bidsError) throw bidsError;
        setBids(bidsData || []);
      } catch (err) {
        console.error(err);
        toast({ title: 'خطأ', description: 'حدث خطأ أثناء جلب العروض.', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };

    fetchBids();
  }, [id, toast]);

  const handleAwardOrder = async () => {
    if (!selectedBid) return;
    try {
      setAwardingBidId(selectedBid.id);
      
      // Since we are mocking backend logic, we do multiple sequential requests
      // 1. Update RFQ Status
      const { error: rfqErr } = await supabase
        .from('rfqs')
        .update({ status: 'AWARDED' })
        .eq('id', id);
        
      if (rfqErr) throw rfqErr;

      // 2. Update winning Quotation Status
      const { error: quoteErr } = await supabase
        .from('quotations')
        .update({ status: 'ACCEPTED' })
        .eq('id', selectedBid.id);
        
      if (quoteErr) throw quoteErr;

      // 3. Create Order
      const orderData = {
        rfq_id: id,
        quotation_id: selectedBid.id,
        buyer_id: rfq.buyer_id,
        supplier_id: selectedBid.supplier_id,
        total_amount: selectedBid.price,
        order_status: 'CREATED',
        escrow_status: paymentMethod === 'COD' ? 'NOT_APPLICABLE' : 'AWAITING_FUNDS',
        payment_method: paymentMethod
      };

      const { data: newOrder, error: orderErr } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

      if (orderErr) throw orderErr;

      toast({
        title: '🎉 تم إرساء العطاء بنجاح!',
        description: paymentMethod === 'COD' ? 'تم اختيار الدفع عند الاستلام. تابع مع المورد.' : 'تم إنشاء أمر الشراء وتحويلك لصفحة الدفع الآمن (Escrow).',
        className: 'bg-green-50 text-green-900 border-green-200'
      });

      // Navigate to order tracking/payment page
      navigate(`/buyer/order/${newOrder.id}`);
      
    } catch (err) {
      console.error(err);
      toast({ title: 'فشل إرساء العطاء', description: err.message, variant: 'destructive' });
      setAwardingBidId(null);
    } finally {
      setIsPaymentModalOpen(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex justify-center items-center"><Loader2 className="animate-spin text-sas-blue w-12 h-12" /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12" dir="rtl">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <button onClick={() => navigate('/buyer/dashboard')} className="flex items-center gap-2 text-gray-500 hover:text-sas-blue mb-6 transition-colors">
          <ArrowRight size={20} /> العودة للوحة التحكم
        </button>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-black text-gray-900 mb-2">{rfq?.title}</h1>
            <p className="text-gray-500 flex items-center gap-4">
              <span>الكمية: <strong>{rfq?.quantity} {rfq?.unit}</strong></span>
              <span>الوجهة: <strong>{rfq?.shipping_destination}</strong></span>
            </p>
          </div>
          <div className="mt-4 md:mt-0 text-center bg-blue-50 px-6 py-4 rounded-xl border border-blue-100">
            <p className="text-sm text-sas-blue font-bold mb-1">إجمالي العروض المستلمة</p>
            <p className="text-3xl font-black text-blue-900">{bids.length}</p>
          </div>
        </div>

        {/* Bids Matrix */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <ShieldCheck className="text-sas-blue" />
          مصفوفة القرار (Decision Matrix)
        </h2>

        {bids.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-gray-100 shadow-sm text-gray-500">
            لم يتم تقديم أي عروض لهذا الطلب بعد.
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead className="bg-gray-50 border-b border-gray-100 text-gray-600 font-semibold">
                  <tr>
                    <th className="p-5">المورد (Supplier)</th>
                    <th className="p-5">السعر الإجمالي (Price)</th>
                    <th className="p-5">مدة التسليم (Lead Time)</th>
                    <th className="p-5">ملاحظات</th>
                    <th className="p-5">الإجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {bids.map((bid, index) => (
                    <motion.tr 
                      key={bid.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="hover:bg-blue-50/30 transition-colors"
                    >
                      <td className="p-5">
                        <div className="font-bold text-gray-900 text-lg mb-1">{bid.supplier?.company_name || 'مورد مجهول'}</div>
                        <div className="flex items-center gap-2">
                          <span className="flex items-center text-amber-500 text-sm font-bold bg-amber-50 px-2 py-0.5 rounded">
                            {bid.supplier?.trust_score || 'N/A'} <Star size={12} className="fill-amber-500 mr-1" />
                          </span>
                          {bid.supplier?.tier === 'GOLD' && (
                            <span className="text-xs font-bold text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded">مورد ذهبي</span>
                          )}
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-1 text-xl font-black text-gray-900">
                          <DollarSign size={18} className="text-gray-400" />
                          {bid.price.toLocaleString()}
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Clock size={16} className="text-gray-400" />
                          {bid.lead_time_days} يوم
                        </div>
                      </td>
                      <td className="p-5 text-sm text-gray-600 max-w-xs truncate" title={bid.notes}>
                        {bid.notes || '-'}
                      </td>
                      <td className="p-5">
                        <button
                          disabled={awardingBidId === bid.id || rfq.status !== 'OPEN'}
                          onClick={() => { setSelectedBid(bid); setIsPaymentModalOpen(true); }}
                          className="bg-sas-blue hover:bg-blue-800 text-white font-bold py-2 px-6 rounded-lg transition-colors flex items-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed shadow-md shadow-blue-900/20"
                        >
                          {awardingBidId === bid.id ? <Loader2 className="animate-spin" size={18} /> : <Award size={18} />}
                          إرساء الطلب (Award)
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* Payment Selection Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[32px] max-w-lg w-full overflow-hidden shadow-2xl"
          >
            <div className="bg-sas-blue p-8 text-white">
              <h3 className="text-2xl font-black mb-2">اختر طريقة الدفع</h3>
              <p className="text-blue-100 opacity-80">كيف ترغب في تأمين هذه الصفقة؟</p>
            </div>
            <div className="p-8 space-y-4">
              <button 
                onClick={() => setPaymentMethod('ESCROW')}
                className={`w-full p-6 rounded-2xl border-2 transition-all flex items-center gap-4 text-right ${paymentMethod === 'ESCROW' ? 'border-sas-blue bg-blue-50' : 'border-gray-100 hover:border-blue-100'}`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${paymentMethod === 'ESCROW' ? 'bg-sas-blue text-white' : 'bg-gray-50 text-gray-400'}`}>
                  <ShieldCheck size={24} />
                </div>
                <div className="flex-1">
                   <p className="font-black text-gray-900">الدفع عبر الضمان (Escrow)</p>
                   <p className="text-xs text-gray-500 mt-1">يتم احتجاز المال في المنصة ولا يُسلم للمورد إلا بعد استلامك للبضاعة. (أكثر أماناً)</p>
                </div>
              </button>

              <button 
                onClick={() => setPaymentMethod('COD')}
                className={`w-full p-6 rounded-2xl border-2 transition-all flex items-center gap-4 text-right ${paymentMethod === 'COD' ? 'border-sas-blue bg-blue-50' : 'border-gray-100 hover:border-blue-100'}`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${paymentMethod === 'COD' ? 'bg-sas-blue text-white' : 'bg-gray-50 text-gray-400'}`}>
                   <DollarSign size={24} />
                </div>
                <div className="flex-1">
                   <p className="font-black text-gray-900">الدفع عند الاستلام (COD)</p>
                   <p className="text-xs text-gray-500 mt-1">تدفع مباشرة للمورد عند وصول البضاعة لمخازنك. (يخضع لسياسة المورد)</p>
                </div>
              </button>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="flex-1 py-4 text-gray-500 font-bold hover:bg-gray-50 rounded-xl transition-colors"
                >
                  إلغاء
                </button>
                <button 
                  onClick={handleAwardOrder}
                  disabled={awardingBidId}
                  className="flex-[2] py-4 bg-sas-blue text-white font-bold rounded-xl shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
                >
                  {awardingBidId ? <Loader2 className="animate-spin" /> : <Award size={20} />}
                  إتمام الإرساء والتعاقد
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
