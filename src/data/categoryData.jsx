import React from 'react';
import { 
  Package, 
  Archive, 
  Truck, 
  Wrench, 
  Home, 
  Thermometer, 
  Menu
} from 'lucide-react';

export const productCategories = [
  {
    id: 'packaging-materials',
    title: 'مواد تغليف وتعبئة',
    icon: <Package className="h-5 w-5" />,
  },
  {
    id: 'warehouse-supplies',
    title: 'مستلزمات مستودعات',
    icon: <Archive className="h-5 w-5" />,
  },
  {
    id: 'shipping-equipment',
    title: 'معدات شحن ونقل',
    icon: <Truck className="h-5 w-5" />,
  },
  {
    id: 'industrial-parts',
    title: 'قطع غيار صناعية',
    icon: <Wrench className="h-5 w-5" />,
  },
  {
    id: 'cooling-systems',
    title: 'أنظمة تبريد',
    icon: <Thermometer className="h-5 w-5" />,
  },
  {
    id: 'safety-supplies',
    title: 'أدوات أمن وسلامة',
    icon: <Home className="h-5 w-5" />,
  }
];
