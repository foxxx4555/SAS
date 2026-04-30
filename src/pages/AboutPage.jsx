  import React from 'react';
import { motion } from 'framer-motion';
import { Users, Target, Droplets, ShieldCheck, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AboutPage = () => {
  const teamMembers = [
    { name: "المهندس/ مصطفي عبد العزيز", role: "المدير التنفيذي ومؤسس الشركة", image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8Y2VvfGVufDB8fDB8fHww&auto=format&fit=crop&w=300&q=60", description: "خبير في تقنيات معالجة المياه بخبرة تمتد لأكثر من 15 عامًا." },
    { name: "مساعد تيم ليدر المبيعات/ احمد حمدي ", role: " مساعد تيم ليدر", image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8Y2VvfGVufDB8fDB8fHww&auto=format&fit=Hww&auto=format&fit=crop&w=300&q=60", description: "يعمل على توسيع قاعدة عملاء الشركة وتقديم أفضل الخدمات." },
    { name: "الأستاذ/ فارس ", role: "مدير التسويق والمبيعات", image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8Y2VvfGVufDB8fDB8fHww&auto=format&fit=", description: "يعمل على توسيع قاعدة عملاء الشركة وتقديم أفضل الخدمات." },
  ];

  const values = [
    { icon: <Droplets className="h-10 w-10 text-primary" />, title: "سرعة ودقة", description: "نلتزم بتقديم أعلى معايير الجودة في التوصيل والنقل لضمان وصول بضائعك بأمان." },
    { icon: <ShieldCheck className="h-10 w-10 text-primary" />, title: "موثوقية وأمان", description: "حلولنا اللوجستية مصممة لتكون موثوقة وآمنة، مما يوفر راحة البال للتجار والموردين." },
    { icon: <Zap className="h-10 w-10 text-primary" />, title: "ابتكار مستمر", description: "نسعى دائمًا لابتكار تقنيات جديدة لتلبية الاحتياجات المتغيرة لسوق التجارة الإلكترونية." },
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
          عن منصة ساس
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          في منصة ساس اللوجستية، نؤمن بأهمية ربط الموردين وتجار التجزئة من خلال شبكة لوجستية متطورة. مهمتنا توفير حلول مبتكرة وسريعة للنقل والتجارة بين الشركات لدعم الاقتصاد وتسهيل الأعمال.
        </p>
      </motion.section>

      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mb-16 grid md:grid-cols-2 gap-12 items-center"
      >
        <div>
          <img
            src="https://images.unsplash.com/photo-1567427018141-0584cfcbf1b8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fHdhdGVyJTIwdHJlYXRtZW50JTIwcGxhbnR8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=600&q=80"
            alt="محطة معالجة مياه حديثة تابعة لشركة رايت ووتر"
            className="rounded-xl shadow-2xl w-full h-auto object-cover"
          />
        </div>
        <div className="space-y-6">
          <h2 className="text-4xl font-bold text-primary flex items-center">
            <Target className="mr-3 h-10 w-10" /> رؤيتنا ورسالتنا
          </h2>
          <p className="text-lg text-foreground leading-relaxed">
            <strong>رؤيتنا:</strong> أن نكون المنصة اللوجستية والتجارية الأولى في المملكة والشرق الأوسط لتلبية احتياجات التجارة بين الشركات (B2B) من خلال تقديم خدمات مبتكرة تلبي أعلى معايير الجودة العالمية.
          </p>
          <p className="text-lg text-foreground leading-relaxed">
            <strong>رسالتنا:</strong> تمكين التجار والموردين من توسيع أعمالهم وزيادة مبيعاتهم من خلال شبكة نقل آمنة وسريعة وحلول تقنية متطورة تسهل العمليات اللوجستية.
          </p>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mb-16"
      >
        <h2 className="text-4xl font-bold text-primary text-center mb-12 flex items-center justify-center">
          <Users className="mr-3 h-10 w-10" /> فريقنا المتميز
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamMembers.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 * index + 0.6 }}
            >
              <Card className="text-center glassmorphism-card h-full hover:shadow-xl transition-shadow">
                <CardHeader className="items-center">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-32 h-32 rounded-full object-cover mb-4 border-4 border-primary/50"
                  />
                  <CardTitle className="text-xl text-primary">{member.name}</CardTitle>
                  <p className="text-sm text-secondary font-medium">{member.role}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">{member.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.9 }}
      >
        <h2 className="text-4xl font-bold text-primary text-center mb-12">قيمنا الأساسية</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {values.map((value, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 * index + 0.9 }}
            >
              <Card className="text-center p-6 glassmorphism-card h-full hover:shadow-xl transition-shadow">
                <div className="flex justify-center mb-4">{value.icon}</div>
                <h3 className="text-2xl font-semibold text-primary mb-2">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.2 }}
        className="mt-16 text-center"
      >
        <p className="text-lg text-foreground">
          نحن في منصة ساس، لا نوفر مجرد مساحة مبيعات، بل نقدم حلولاً متكاملة تضمن لتجارتك النمو المستمر والموثوقية العالية.
        </p>
      </motion.section>
    </div>
  );
};

export default AboutPage;
