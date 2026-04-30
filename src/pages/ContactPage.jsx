import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Send, Building, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const contactInfo = [
    { 
      icon: <Building className="h-8 w-8 text-primary" />, 
      title: "المقر الرئيسي", 
      details: ["مدينة أجا - محافظة الدقهلية"] 
    },
    { 
      icon: <Phone className="h-8 w-8 text-primary" />, 
      title: "الهاتف (الخط الساخن)", 
      details: ["01117767717"] 
    },
    { 
      icon: <Mail className="h-8 w-8 text-primary" />, 
      title: "البريد الإلكتروني", 
      details: ["rightwater156@gmail.com", "بريد الدعم"] 
    },
    { 
      icon: <Clock className="h-8 w-8 text-primary" />, 
      title: "ساعات العمل", 
      details: ["السبت - الخميس: 9 صباحًا - 5 مساءً", "الجمعة: مغلق"] 
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.section
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center mb-16"
      >
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
          تواصل معنا
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          نحن هنا لمساعدتك! سواء كان لديك استفسار عن منتجاتنا، أو تحتاج إلى دعم فني، أو ترغب في مناقشة حلول مخصصة، فريقنا جاهز لخدمتك.
        </p>
      </motion.section>

      <div className="grid md:grid-cols-2 gap-12 items-start">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="space-y-8"
        >
          <h2 className="text-3xl font-bold text-primary mb-6">معلومات الاتصال</h2>
          {contactInfo.map((item, index) => (
            <Card key={index} className="glassmorphism-card overflow-hidden">
              <CardContent className="p-6 flex items-start space-x-4 space-x-reverse">
                <div className="flex-shrink-0 mt-1">{item.icon}</div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-1">{item.title}</h3>
                  {item.details.map((detail, i) => (
                    <p key={i} className="text-muted-foreground">{detail}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          <Card className="glassmorphism-card p-6 md:p-8 shadow-xl">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-3xl font-bold text-primary text-center">أرسل لنا رسالة</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <form 
                action="https://formspree.io/f/xvgpydyg" 
                method="POST" 
                className="space-y-6"
              >
                <div>
                  <Label htmlFor="name" className="text-foreground font-medium">الاسم الكامل</Label>
                  <Input 
                    type="text" 
                    name="name"
                    id="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    required 
                    className="mt-1 bg-background/70 border-primary/30 focus:border-primary"
                    placeholder="مثال: محمد أحمد"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-foreground font-medium">البريد الإلكتروني</Label>
                  <Input 
                    type="email" 
                    name="email"
                    id="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    required 
                    className="mt-1 bg-background/70 border-primary/30 focus:border-primary"
                    placeholder="example@domain.com"
                  />
                </div>
                <div>
                  <Label htmlFor="subject" className="text-foreground font-medium">الموضوع</Label>
                  <Input 
                    type="text" 
                    name="subject"
                    id="subject" 
                    value={formData.subject} 
                    onChange={handleChange} 
                    required 
                    className="mt-1 bg-background/70 border-primary/30 focus:border-primary"
                    placeholder="استفسار عن منتج..."
                  />
                </div>
                <div>
                  <Label htmlFor="message" className="text-foreground font-medium">رسالتك</Label>
                  <Textarea 
                    name="message"
                    id="message" 
                    rows="5" 
                    value={formData.message} 
                    onChange={handleChange} 
                    required 
                    className="mt-1 bg-background/70 border-primary/30 focus:border-primary"
                    placeholder="اكتب رسالتك هنا..."
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity text-lg py-3"
                >
                  <Send className="ml-2 h-5 w-5" /> إرسال الرسالة
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.6 }}
        className="mt-16"
      >
        <h2 className="text-3xl font-bold text-primary text-center mb-8">موقعنا على الخريطة</h2>
        <div className="aspect-w-16 aspect-h-9 rounded-xl overflow-hidden shadow-2xl border-4 border-primary/30">
          <iframe
            src="https://www.openstreetmap.org/export/embed.html?bbox=31.198167800903324%2C30.03986893231807%2C31.20899200439453%2C30.04569608970079&layer=mapnik&marker=30.04278251960827%2C31.203579902648926"
            width="100%"
            height="450"
            style={{ border:0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="موقع شركة رايت واتر"
          ></iframe>
        </div>
         <div className="text-center mt-4">
            <a 
                href="https://www.openstreetmap.org/?mlat=30.04278&mlon=31.20358#map=17/30.04278/31.20358" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
            >
                عرض خريطة أكبر
            </a>
        </div>
      {/* ===== هذا هو السطر الذي تم تصحيحه ===== */}
      </motion.section>
    </div>
  );
};

export default ContactPage;
