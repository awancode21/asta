import React from 'react';
import { useFinance } from '../context/FinanceContext';
import {
  Plus,
  RefreshCw,
  Wallet,
  Calendar,
  Layers,
  PieChart,
  Target,
  Camera,
  Smartphone,
  Monitor,
  FileSpreadsheet,
} from 'lucide-react';

export type ActiveTab = 'dashboard' | 'transactions' | 'banks' | 'reports' | 'budget';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAddModal: () => void;
  onOpenSyncModal: () => void;
  onOpenScanModal: () => void;
  onOpenSheetsModal: () => void;
  isMobilePreviewMode: boolean;
  onToggleMobilePreview: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddModal,
  onOpenSyncModal: _onOpenSyncModal,
  onOpenScanModal,
  onOpenSheetsModal,
  isMobilePreviewMode,
  onToggleMobilePreview,
}) => {
  const { isSyncingAll, syncAllAccounts } = useFinance();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Zone 1: Single text wordmark */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-md"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-2xs group-hover:bg-emerald-700 transition-colors">
                Rp
              </div>
              <span className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors">
                ArthaKu
              </span>
            </button>
          </div>

          {/* Zone 2: Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-50 text-emerald-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Ringkasan</span>
            </button>

            <button
              onClick={() => setActiveTab('transactions')}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'transactions'
                  ? 'bg-emerald-50 text-emerald-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Transaksi Harian</span>
            </button>

            <button
              onClick={() => setActiveTab('banks')}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'banks'
                  ? 'bg-emerald-50 text-emerald-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span>Sinkronisasi Bank</span>
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'reports'
                  ? 'bg-emerald-50 text-emerald-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <PieChart className="w-4 h-4" />
              <span>Laporan Analisis</span>
            </button>

            <button
              onClick={() => setActiveTab('budget')}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'budget'
                  ? 'bg-emerald-50 text-emerald-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Target className="w-4 h-4" />
              <span>Anggaran</span>
            </button>
          </nav>

          {/* Zone 3: Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Mobile / Desktop Simulator Toggle */}
            <button
              onClick={onToggleMobilePreview}
              title={isMobilePreviewMode ? 'Kembali ke Layar Penuh' : 'Lihat Mode Smartphone'}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:py-2 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap ${
                isMobilePreviewMode
                  ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {isMobilePreviewMode ? (
                <>
                  <Monitor className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Layar Penuh</span>
                </>
              ) : (
                <>
                  <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline">Mode Smartphone</span>
                </>
              )}
            </button>

            {/* Google Sheets Sync Button */}
            <button
              onClick={onOpenSheetsModal}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:py-2 text-xs font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors whitespace-nowrap shadow-2xs"
              title="Kelola Google Sheets & Sinkronisasi"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              <span className="hidden sm:inline">Google Sheets</span>
            </button>

            {/* Receipt Scan Quick Action */}
            <button
              onClick={onOpenScanModal}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 sm:py-2 text-xs font-semibold text-slate-750 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shadow-2xs"
              title="Pindai nota struk belanjaan"
            >
              <Camera className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Scan Struk</span>
            </button>

            {/* Sync All button (Desktop only) */}
            <button
              onClick={() => syncAllAccounts()}
              disabled={isSyncingAll}
              title="Tarik mutasi dari seluruh bank terhubung"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 transition-colors whitespace-nowrap shadow-2xs"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-slate-500 ${isSyncingAll ? 'animate-spin text-emerald-600' : ''}`}
              />
              <span>{isSyncingAll ? 'Sync...' : 'Sync Bank'}</span>
            </button>

            {/* Add Transaction Button */}
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 active:bg-emerald-800 transition-colors whitespace-nowrap shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Catat Transaksi</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
