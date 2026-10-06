/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Header, ActiveTab } from './components/Header';
import { DashboardView } from './components/views/DashboardView';
import { MobileSimpleDashboard } from './components/views/MobileSimpleDashboard';
import { DailyTransactionsView } from './components/views/DailyTransactionsView';
import { BankSyncView } from './components/views/BankSyncView';
import { MonthlyReportView } from './components/views/MonthlyReportView';
import { BudgetView } from './components/views/BudgetView';
import { AddTransactionModal } from './components/AddTransactionModal';
import { BankSyncModal } from './components/BankSyncModal';
import { MutasiImportModal } from './components/MutasiImportModal';
import { ReceiptScanModal } from './components/ReceiptScanModal';
import { GoogleSheetsModal } from './components/GoogleSheetsModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { MobileSmartphoneFrame } from './components/MobileSmartphoneFrame';
import { ToastContainer } from './components/ToastContainer';
import { ShieldCheck, RotateCcw } from 'lucide-react';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState(false);
  const [isMobilePreviewMode, setIsMobilePreviewMode] = useState(false);

  const [isMobileScreen, setIsMobileScreen] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { resetToDemoData } = useFinance();

  const isSimplifiedMobile = isMobilePreviewMode || isMobileScreen;

  // Render the current active tab content
  const renderCurrentView = (isInsideFrame = false) => (
    <div className={isInsideFrame ? 'p-3 space-y-4' : 'space-y-5'}>
      {activeTab === 'dashboard' && (
        isSimplifiedMobile ? (
          /* Simple, clean mobile smartphone dashboard */
          <MobileSimpleDashboard
            setActiveTab={setActiveTab}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onOpenScanModal={() => setIsScanModalOpen(true)}
            onOpenSyncModal={() => setIsSyncModalOpen(true)}
            onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
          />
        ) : (
          /* Rich desktop dashboard */
          <DashboardView
            setActiveTab={setActiveTab}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onOpenSyncModal={() => setIsSyncModalOpen(true)}
            onOpenScanModal={() => setIsScanModalOpen(true)}
          />
        )
      )}

      {activeTab === 'transactions' && (
        <DailyTransactionsView
          onOpenAddModal={() => setIsAddModalOpen(true)}
          onOpenImportModal={() => setIsImportModalOpen(true)}
          onOpenScanModal={() => setIsScanModalOpen(true)}
          onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
        />
      )}

      {activeTab === 'banks' && (
        <BankSyncView
          onOpenSyncModal={() => setIsSyncModalOpen(true)}
          onOpenImportModal={() => setIsImportModalOpen(true)}
        />
      )}

      {activeTab === 'reports' && <MonthlyReportView />}

      {activeTab === 'budget' && <BudgetView />}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Bar Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
        onOpenScanModal={() => setIsScanModalOpen(true)}
        onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
        isMobilePreviewMode={isMobilePreviewMode}
        onToggleMobilePreview={() => setIsMobilePreviewMode(!isMobilePreviewMode)}
      />

      {/* Main Workspace */}
      {isMobilePreviewMode ? (
        /* Smartphone Chassis Simulator Mode */
        <MobileSmartphoneFrame onExitPreview={() => setIsMobilePreviewMode(false)}>
          {renderCurrentView(true)}
        </MobileSmartphoneFrame>
      ) : (
        /* Standard Responsive Viewport (Clean & Streamlined) */
        <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 md:pb-8">
          {renderCurrentView(false)}
        </main>
      )}

      {/* Fixed Bottom Tab Navigation (Pattern 1 for mobile screens & simulator) */}
      <div className={isMobilePreviewMode ? 'block' : 'md:hidden'}>
        <MobileBottomNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenScanModal={() => setIsScanModalOpen(true)}
        />
      </div>

      {/* Modals */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onOpenScanModal={() => setIsScanModalOpen(true)}
      />

      <ReceiptScanModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
      />

      <GoogleSheetsModal
        isOpen={isSheetsModalOpen}
        onClose={() => setIsSheetsModalOpen(false)}
      />

      <BankSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
      />

      <MutasiImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />

      {/* Toast Notifications */}
      <ToastContainer />

      {/* Quiet Footer (Hidden on mobile or in preview mode for clean ergonomics) */}
      {!isSimplifiedMobile && (
        <footer className="border-t border-slate-200 bg-white py-6 no-print hidden md:block">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800">ArthaKu</span>
              <span>·</span>
              <span>Manajemen Keuangan, Scan Struk, Bank Sync & Google Sheets</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-2xs text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Google Sheets & SNAP BI Compliant</span>
              </div>

              <button
                onClick={resetToDemoData}
                className="inline-flex items-center gap-1 text-2xs text-slate-500 hover:text-slate-800 p-1 hover:bg-slate-100 rounded transition-colors"
                title="Reset ke data awal"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Data Demo</span>
              </button>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default function App() {
  return (
    <FinanceProvider>
      <AppContent />
    </FinanceProvider>
  );
}
