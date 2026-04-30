import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingBag, PackageOpen, CreditCard, Ticket, Menu, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const VendorLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { signOut, currentUser } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navItems = [
    { name: 'الرئيسية (الاحصائيات)', path: '/vendor-dashboard', icon: <PackageOpen size={20} /> },
    { name: 'منتجاتي', path: '/vendor-dashboard/products', icon: <ShoppingBag size={20} /> },
    { name: 'الطلبات الواردة', path: '/vendor-dashboard/orders', icon: <ShoppingBag size={20} /> },
    { name: 'الحساب البنكي', path: '/vendor-dashboard/account', icon: <CreditCard size={20} /> },
    { name: 'الكوبونات', path: '/vendor-dashboard/coupons', icon: <Ticket size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden" dir="rtl">
      {/* Sidebar */}
      <aside className={`bg-white border-l shadow-sm transition-all duration-300 flex flex-col ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="p-4 border-b flex items-center justify-between">
          {isSidebarOpen && <span className="font-bold text-lg text-primary truncate pl-2">لوحة المورد</span>}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 rounded-md hover:bg-gray-100 text-gray-500">
            <Menu size={24} />
          </button>
        </div>

        <nav className="flex-1 py-4 flex flex-col gap-2 px-3 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/vendor-dashboard'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                  isActive ? 'bg-primary/10 text-primary font-semibold' : 'text-gray-600 hover:bg-gray-100 hover:text-primary'
                }`
              }
            >
              <div className="shrink-0">{item.icon}</div>
              {isSidebarOpen && <span className="truncate">{item.name}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t">
          <Button variant="ghost" className={`w-full flex items-center text-red-500 hover:text-red-700 hover:bg-red-50 ${isSidebarOpen ? 'justify-start gap-3 px-3' : 'justify-center px-0'}`} onClick={handleSignOut}>
            <LogOut size={20} />
            {isSidebarOpen && <span>خروج</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b py-4 px-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-800">متجر: {currentUser?.first_name || '...'}</h1>
          <Button variant="outline" size="sm" onClick={() => navigate('/')}>
             العودة للموقع <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 p-6 overflow-auto bg-slate-50">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default VendorLayout;
