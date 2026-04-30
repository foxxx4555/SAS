import React from 'react';
import { Truck, Package, CheckCircle2, Clock, MapPin, ShieldCheck } from 'lucide-react';

export default function LogisticsTimeline({ status, trackingNumber, destination }) {
  const steps = [
    { id: 'PENDING', label: 'تجهيز الطلب', icon: Package },
    { id: 'SHIPPED', label: 'تم الشحن', icon: Truck },
    { id: 'IN_TRANSIT', label: 'في الطريق', icon: MapPin },
    { id: 'DELIVERED', label: 'تم الاستلام', icon: CheckCircle2 },
  ];

  const getCurrentStepIndex = () => {
    return steps.findIndex(s => s.id === status);
  };

  const currentIndex = getCurrentStepIndex();

  return (
    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h3 className="text-xl font-black text-gray-900">تتبع الشحنة</h3>
           <p className="text-gray-500 text-sm mt-1">رقم التتبع: <span className="font-mono font-bold text-sas-blue">{trackingNumber || 'SAS-8842-TRK'}</span></p>
        </div>
        <div className="bg-blue-50 text-sas-blue px-4 py-2 rounded-xl border border-blue-100 flex items-center gap-2 font-bold text-sm">
           <ShieldCheck size={18} /> شحنة مؤمنة بالضمان
        </div>
      </div>

      <div className="relative">
        {/* Connection Line */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 z-0"></div>
        <div 
          className="absolute top-1/2 left-0 h-1 bg-sas-blue -translate-y-1/2 z-0 transition-all duration-1000"
          style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
        ></div>

        <div className="relative z-10 flex justify-between">
          {steps.map((step, i) => {
            const isCompleted = i <= currentIndex;
            const isActive = i === currentIndex;
            
            return (
              <div key={step.id} className="flex flex-col items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${
                  isCompleted 
                    ? 'bg-sas-blue border-blue-100 text-white shadow-lg shadow-blue-200 scale-110' 
                    : 'bg-white border-gray-100 text-gray-300'
                }`}>
                  <step.icon size={20} />
                </div>
                <div className="text-center">
                  <p className={`text-xs font-bold ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</p>
                  {isActive && <p className="text-[10px] text-sas-blue animate-pulse mt-1 font-black">جاري الآن</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-10 p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-4">
         <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 shadow-sm">
            <MapPin size={20} />
         </div>
         <div>
            <p className="text-xs text-gray-400">وجهة الشحن النهائية:</p>
            <p className="text-sm font-bold text-gray-900">{destination || 'ميناء جبل علي، دبي، الإمارات'}</p>
         </div>
      </div>
    </div>
  );
}
