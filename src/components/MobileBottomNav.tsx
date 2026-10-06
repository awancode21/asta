import React from 'react';
import { ActiveTab } from './Header';
import { Layers, Calendar, Camera, Wallet, PieChart } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenScanModal: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenScanModal,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-lg pb-safe">
      <div className="max-w-md mx-auto grid grid-cols-5 items-center h-16 px-1">
        {/* Tab 1: Ringkasan */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center justify-center min-h-[46px] py-1 transition-all ${
            activeTab === 'dashboard'
              ? 'text-emerald-700 font-bold scale-105'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-5 h-5" />
          <span className="text-[10px] mt-1 tracking-tight">Ringkasan</span>
          {activeTab === 'dashboard' && (
            <span className="w-1 h-1 rounded-full bg-emerald-600 mt-0.5" />
          )}
        </button>

        {/* Tab 2: Transaksi */}
        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex flex-col items-center justify-center min-h-[46px] py-1 transition-all ${
            activeTab === 'transactions'
              ? 'text-emerald-700 font-bold scale-105'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px] mt-1 tracking-tight">Buku Kas</span>
          {activeTab === 'transactions' && (
            <span className="w-1 h-1 rounded-full bg-emerald-600 mt-0.5" />
          )}
        </button>

        {/* Tab 3 (Center Friendly Hero Action): Scan Struk */}
        <div className="flex flex-col items-center justify-center">
          <button
            onClick={onOpenScanModal}
            title="Scan Nota Struk Belanja"
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 active:scale-90 text-white shadow-md shadow-emerald-900/20 flex items-center justify-center -translate-y-3 transition-all border-2 border-white ring-4 ring-emerald-500/15"
          >
            <Camera className="w-5 h-5 drop-shadow-xs" />
          </button>
          <span className="text-[9px] font-bold text-emerald-800 -mt-2 tracking-tight">Scan</span>
        </div>

        {/* Tab 4: Bank Sync */}
        <button
          onClick={() => setActiveTab('banks')}
          className={`flex flex-col items-center justify-center min-h-[46px] py-1 transition-all ${
            activeTab === 'banks'
              ? 'text-emerald-700 font-bold scale-105'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Wallet className="w-5 h-5" />
          <span className="text-[10px] mt-1 tracking-tight">Bank Sync</span>
          {activeTab === 'banks' && (
            <span className="w-1 h-1 rounded-full bg-emerald-600 mt-0.5" />
          )}
        </button>

        {/* Tab 5: Laporan */}
        <button
          onClick={() => setActiveTab('reports')}
          className={`flex flex-col items-center justify-center min-h-[46px] py-1 transition-all ${
            activeTab === 'reports'
              ? 'text-emerald-700 font-bold scale-105'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <PieChart className="w-5 h-5" />
          <span className="text-[10px] mt-1 tracking-tight">Laporan</span>
          {activeTab === 'reports' && (
            <span className="w-1 h-1 rounded-full bg-emerald-600 mt-0.5" />
          )}
        </button>
      </div>
    </div>
  );
};
