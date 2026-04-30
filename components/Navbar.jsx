import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { User, LogIn, LogOut, ShieldCheck, Briefcase, FileText, Menu, X, Globe, Package, Bell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import AuthModal from './AuthModal';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const { currentUser, isAdmin, isVendor, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'لديك عرض سعر جديد لطلب RFQ #542', time: 'منذ 5 دقائق', unread: true },
    { id: 2, text: 'تم قبول طلب التوثيق الخاص بك', time: 'منذ ساعة', unread: false }
  ]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "تم تسجيل الخروج بنجاح!",
      });
      navigate('/');
    } catch (error) {
      toast({
        title: "خطأ في تسجيل الخروج",
        variant: "destructive",
      });
    }
  };
  
  const mobileNavLinks = (
    <>
      <Link to="/" className="flex items-center gap-4 py-2 text-foreground/80 hover:text-sas-blue">
          <FileText size={20} />
          <span>إنشاء طلب RFQ</span>
      </Link>
      <Link to="/supplier/rfqs" className="flex items-center gap-4 py-2 text-foreground/80 hover:text-sas-blue">
          <Briefcase size={20} />
          <span>لوحة الموردين</span>
      </Link>
      {currentUser ? (
        <>
          <button onClick={handleSignOut} className="flex items-center gap-4 py-2 text-foreground/80 hover:text-destructive w-full text-right">
            <LogOut size={20} />
            <span>تسجيل الخروج</span>
          </button>
        </>
      ) : (
        <button onClick={() => setIsAuthModalOpen(true)} className="flex items-center gap-4 py-2 text-foreground/80 hover:text-sas-blue">
          <LogIn size={20} />
          <span>تسجيل الدخول</span>
        </button>
      )}
    </>
  );

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50"
    >
      <div className="container mx-auto flex items-center justify-between h-20 px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 text-sas-blue hover:opacity-90 transition-opacity" aria-label="الصفحة الرئيسية">
          <Globe size={32} />
          <h1 className="text-2xl font-black tracking-tight ml-2">SAS <span className="text-gray-800">B2B</span></h1>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-6 space-x-reverse flex-1 justify-center">
            <NavLink to="/marketplace" className={({isActive}) => `flex items-center gap-2 font-black transition-colors ${isActive ? 'text-sas-blue' : 'text-gray-600 hover:text-sas-blue'}`}>
                <Package className="h-5 w-5" />
                سوق الجملة
            </NavLink>
            <NavLink to="/rfq" className={({isActive}) => `flex items-center gap-2 font-medium transition-colors ${isActive ? 'text-sas-blue' : 'text-gray-600 hover:text-sas-blue'}`}>
                <FileText className="h-4 w-4" />
                طلب تسعيرة (RFQ)
            </NavLink>
            <NavLink to="/supplier/rfqs" className={({isActive}) => `flex items-center gap-2 font-medium transition-colors ${isActive ? 'text-sas-blue' : 'text-gray-600 hover:text-sas-blue'}`}>
                <Briefcase className="h-4 w-4" />
                الفرص للموردين
            </NavLink>
        </div>

        <div className="hidden lg:flex items-center">
            {currentUser ? (
              <div className="flex items-center gap-4">
                {/* Notifications Bell */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="relative p-2 text-gray-500 hover:text-sas-blue transition-colors">
                      <Bell size={22} />
                      {notifications.some(n => n.unread) && (
                        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80 p-0 rounded-2xl overflow-hidden border-gray-100 shadow-xl" dir="rtl">
                    <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                      <span className="font-bold text-gray-900">التنبيهات</span>
                      <button className="text-[10px] text-sas-blue hover:underline">علامة كقروء</button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((n) => (
                        <div key={n.id} className={`p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer ${n.unread ? 'bg-blue-50/30' : ''}`}>
                          <p className="text-sm text-gray-800 leading-snug">{n.text}</p>
                          <span className="text-[10px] text-gray-400 mt-1 block">{n.time}</span>
                        </div>
                      ))}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2 border shadow-sm rounded-xl">
                      <User size={18} />
                      <span>حسابي</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56" dir="rtl">
                    <DropdownMenuLabel className="font-normal text-slate-500 text-xs">
                      {currentUser.displayName || currentUser.email}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    {isVendor && (
                      <DropdownMenuItem asChild>
                        <Link to="/supplier/rfqs" className="flex w-full cursor-pointer items-center text-right py-2 hover:bg-gray-50">
                          <Briefcase className="ml-2 h-4 w-4" />
                          <span>لوحة تحكم المورد</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    
                    {!isVendor && (
                      <DropdownMenuItem asChild>
                        <Link to="/buyer/dashboard" className="flex w-full cursor-pointer items-center text-right py-2 hover:bg-gray-50">
                          <FileText className="ml-2 h-4 w-4" />
                          <span>لوحة تحكم المشتري</span>
                        </Link>
                      </DropdownMenuItem>
                    )}

                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link to="/AdminDashboard" className="flex w-full cursor-pointer items-center text-right py-2 hover:bg-sas-blue hover:text-white font-bold">
                          <ShieldCheck className="ml-2 h-4 w-4" />
                          <span>لوحة الإدارة العليا</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem 
                      onClick={handleSignOut} 
                      className="flex w-full cursor-pointer items-center text-destructive focus:bg-destructive/10 focus:text-destructive py-2"
                    >
                      <LogOut className="ml-2 h-4 w-4" />
                      <span>تسجيل الخروج</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Button onClick={() => setIsAuthModalOpen(true)} className="bg-sas-blue hover:bg-blue-700 text-white flex items-center gap-2">
                <LogIn size={18} />
                <span>تسجيل الدخول</span>
              </Button>
            )}
        </div>

        {/* Mobile Menu Button */}
        <div className="lg:hidden">
          <Button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} variant="ghost" size="icon">
            {isMobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden overflow-hidden bg-white"
          >
            <div className="flex flex-col px-4 pt-2 pb-4 border-t">
              {mobileNavLinks}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </motion.nav>
  );
};

export default Navbar;
