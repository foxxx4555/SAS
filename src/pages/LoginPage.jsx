import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { useToast } from '@/components/ui/use-toast';
import { LogIn, Mail, KeyRound, Chrome, Facebook as FacebookIcon, Twitter as TwitterIcon } from 'lucide-react';
import { motion } from 'framer-motion';

import { useAuth } from '@/contexts/AuthContext';
import webFoxLogo from '@/assets/web-fox-logo.png'; 

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, signInWithSocial, isAdmin } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userResult = await signIn(email, password);
      
      toast({
        title: "تم تسجيل الدخول بنجاح!",
        description: "مرحباً بعودتك.",
      });

      // التحقق مما إذا كان المستخدم مديراً (في حالة الـ Bypass)
      if (userResult?.id === 'admin-bypass') {
        navigate('/AdminDashboard');
      } else {
        navigate('/'); // توجيه للمستخدم العادي
      }

    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "فشل تسجيل الدخول",
        description: error.message.includes('Invalid login credentials') 
          ? "البريد الإلكتروني أو كلمة المرور غير صحيحة." 
          : error.message,
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const handleSocialLogin = async (provider) => {
    setLoading(true);
    try {
      await signInWithSocial(provider);
      // في Supabase، التوجيه يتم تلقائياً بعد نجاح الـ OAuth إذا تم ضبط redirectTo
      toast({ title: "جاري تحويلك لتسجيل الدخول..." });
    } catch (error) {
      toast({
        title: "فشل تسجيل الدخول الاجتماعي",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
    }
  };


  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-4"
    >
      <Card className="w-full max-w-md shadow-2xl glassmorphism-card">
        <CardHeader className="text-center">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 260, damping: 20 }}
            className="mx-auto bg-gradient-to-r from-primary to-secondary text-white rounded-full p-3 w-fit mb-4"
          >
            <LogIn size={32} />
          </motion.div>
          <CardTitle className="text-3xl font-bold text-primary">تسجيل الدخول</CardTitle>
          <CardDescription>مرحباً بعودتك! يرجى إدخال بياناتك.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="email" type="email" placeholder="example@mail.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="pl-10"/>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
               <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="password" type="password" placeholder="********" value={password} onChange={(e) => setPassword(e.target.value)} required className="pl-10"/>
              </div>
            </div>
            <Button type="submit" className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-lg" disabled={loading}>
              {loading ? 'جاري الدخول...' : 'تسجيل الدخول'}
            </Button>
          </form>
          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">أو سجل الدخول باستخدام</span></div>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-3">
            <Button variant="outline" onClick={() => handleSocialLogin('google')} disabled={loading}><Chrome className="mr-2 h-4 w-4" /> Google</Button>
            <Button variant="outline" onClick={() => handleSocialLogin('facebook')} disabled={loading}><FacebookIcon className="mr-2 h-4 w-4" /> Facebook</Button>
            <Button variant="outline" onClick={() => handleSocialLogin('twitter')} disabled={loading}><TwitterIcon className="mr-2 h-4 w-4" /> Twitter</Button>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2">
          <Link to="/forgot-password"><Button variant="link" className="text-sm text-primary">هل نسيت كلمة المرور؟</Button></Link>
          <p className="text-sm text-muted-foreground">ليس لديك حساب؟{' '}<Link to="/signup" className="font-medium text-primary hover:underline">أنشئ حساباً جديداً</Link></p>
        </CardFooter>
      </Card>
      
      <div className="mt-8 text-center">
        <img src={webFoxLogo} alt="Web Fox Logo" className="w-20 h-20 opacity-80 mx-auto" />
        <p className="text-sm text-muted-foreground font-medium mt-2">
          تم تصميم الموقع تحت إشراف
        </p>
        <p className="text-lg text-foreground font-semibold">
          Mohammed Nasser
        </p>
      </div>

    </motion.div>
  );
};

export default LoginPage;
