import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Edit, Trash2, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

const VendorProductsPage = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Product Form State
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    category: '',
    price: '',
    minimum_quantity: 1,
    stock: 0,
    image_url: '',
    description: ''
  });

  const fetchProducts = async () => {
    if (!currentUser) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('vendor_id', currentUser.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error(error);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, [currentUser]);

  const handleOpenModal = (product = null) => {
    if (product) {
      setFormData(product);
    } else {
      setFormData({ id: null, name: '', category: '', price: '', minimum_quantity: 1, stock: 0, image_url: '', description: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // تنظيف القيم الفارغة لمنع فشل حفظ قاعدة البيانات
      const cleanPayload = {
        vendor_id: currentUser.id,
        name: formData.name || 'بدون اسم',
        category: formData.category || 'غير مصنف',
        price: formData.price ? parseFloat(formData.price) : 0,
        minimum_quantity: formData.minimum_quantity ? parseInt(formData.minimum_quantity) : 1,
        stock: formData.stock ? parseInt(formData.stock) : 0,
        image_url: formData.image_url || '',
        description: formData.description || ''
      };

      if (formData.id) {
        const { error } = await supabase.from('products').update(cleanPayload).eq('id', formData.id);
        if (error) throw error;
        toast({ title: "تم التحديث بنجاح" });
      } else {
        const { error } = await supabase.from('products').insert([cleanPayload]);
        if (error) throw error;
        toast({ title: "تم إضافة المنتج بنجاح" });
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      toast({ title: "حدث خطأ", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) {
      toast({ title: "تم الحذف بنجاح" });
      fetchProducts();
    }
  };

  if (loading) return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">إدارة المنتجات (الجملة)</h2>
        <Button onClick={() => handleOpenModal()} className="flex gap-2">
          <Plus size={18} /> منتج جديد
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-right bg-white text-sm">
          <thead className="bg-gray-50 border-b text-gray-600">
            <tr>
              <th className="p-4 font-semibold">الصورة</th>
              <th className="p-4 font-semibold">الاسم</th>
              <th className="p-4 font-semibold">السعر (للقطعة)</th>
              <th className="p-4 font-semibold">المخزون المتوفر</th>
              <th className="p-4 font-semibold">الحد الأدنى للطلب</th>
              <th className="p-4 font-semibold text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-gray-500">لا يوجد منتجات معروضة للبيع حالياً. أضف منتجك الأول!</td>
              </tr>
            ) : (
              products.map((item) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-12 h-12 object-cover rounded-md" />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center text-gray-400"><ImageIcon size={20} /></div>
                    )}
                  </td>
                  <td className="p-4 font-medium">{item.name}</td>
                  <td className="p-4">{item.price} ﷼</td>
                  <td className="p-4">{item.stock} قطعة</td>
                  <td className="p-4">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">{item.minimum_quantity}</span> قطعة
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => handleOpenModal(item)} className="p-2 text-gray-500 hover:text-blue-600 bg-gray-100 rounded-lg"><Edit size={16}/></button>
                      <button onClick={() => handleDelete(item.id)} className="p-2 text-gray-500 hover:text-red-600 bg-gray-100 rounded-lg"><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]" dir="rtl">
          <DialogHeader>
            <DialogTitle>{formData.id ? 'تعديل المنتج' : 'إضافة منتج جديد'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">اسم المنتج</label>
              <input type="text" className="border p-2 rounded-md" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">السعر (﷼)</label>
                <input type="number" className="border p-2 rounded-md" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">القسم</label>
                <input type="text" className="border p-2 rounded-md" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">المخزون (حبة)</label>
                <input type="number" className="border p-2 rounded-md" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-primary">الحد الأدنى للطلب بالجملة</label>
                <input type="number" className="border p-2 rounded-md border-primary" value={formData.minimum_quantity} onChange={e => setFormData({...formData, minimum_quantity: e.target.value})} />
              </div>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">رابط الصورة (URL)</label>
              <input type="text" className="border p-2 rounded-md text-left" dir="ltr" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">الوصف</label>
              <textarea className="border p-2 rounded-md" rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
            </div>
          </div>
          <div className="flex justify-end gap-2 shrink-0">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>إلغاء</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? <Loader2 className="animate-spin w-4 h-4 ml-2" /> : 'حفظ المنتج'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorProductsPage;
