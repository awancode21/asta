import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatRupiah, calculateMonthlyAnalysis } from '../../services/analyticsService';
import { CategoryIcon } from '../CategoryIcon';
import { ActiveTab } from '../Header';
import { Transaction } from '../../types/finance';
import {
  Eye,
  EyeOff,
  Plus,
  Camera,
  RefreshCw,
  PieChart,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  FileSpreadsheet,
  Sparkles,
  CheckCircle2,
  Receipt,
  X,
  Trash2,
  Edit2,
  ShieldCheck,
  ChevronRight,
  Clock,
} from 'lucide-react';

interface MobileSimpleDashboardProps {
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAddModal: () => void;
  onOpenScanModal: () => void;
  onOpenSyncModal: () => void;
  onOpenSheetsModal?: () => void;
}

export const MobileSimpleDashboard: React.FC<MobileSimpleDashboardProps> = ({
  setActiveTab,
  onOpenAddModal,
  onOpenScanModal,
  onOpenSyncModal: _onOpenSyncModal,
  onOpenSheetsModal,
}) => {
  const {
    accounts,
    transactions,
    categories,
    selectedMonth,
    selectedYear,
    isSyncingAll,
    syncAllAccounts,
    deleteTransaction,
  } = useFinance();

  const [hideBalance, setHideBalance] = useState(false);
  const [selectedTxDetail, setSelectedTxDetail] = useState<Transaction | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');

  // Friendly dynamic greeting based on hour
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 11) return 'Selamat Pagi ☀️';
    if (hour >= 11 && hour < 15) return 'Selamat Siang 🌤️';
    if (hour >= 15 && hour < 18) return 'Selamat Sore 🌇';
    return 'Selamat Malam 🌙';
  }, []);

  // Total consolidated balance
  const totalBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);

  // Monthly stats
  const monthlyData = calculateMonthlyAnalysis(
    transactions,
    categories,
    selectedMonth,
    selectedYear
  );

  // Today's total spending
  const todayStr = new Date().toISOString().split('T')[0];
  const todayTransactions = transactions.filter((t) => t.date === todayStr);
  const todayExpense = todayTransactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  // Filtered transactions for quick chips
  const filteredRecentTransactions = useMemo(() => {
    let list = [...transactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    if (activeCategoryFilter !== 'all') {
      list = list.filter((t) => t.categoryId === activeCategoryFilter);
    }

    return list.slice(0, 6);
  }, [transactions, activeCategoryFilter]);

  // Relative friendly date formatter
  const formatFriendlyDate = (dateStr: string, timeStr?: string) => {
    if (dateStr === todayStr) {
      return `Hari ini${timeStr ? `, ${timeStr}` : ''}`;
    }
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    if (dateStr === yesterdayStr) {
      return `Kemarin${timeStr ? `, ${timeStr}` : ''}`;
    }
    // E.g., "05 Okt"
    const [, m, d] = dateStr.split('-');
    const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${parseInt(d, 10)} ${monthNames[parseInt(m, 10)]}${timeStr ? `, ${timeStr}` : ''}`;
  };

  return (
    <div className="space-y-4 pb-4">
      {/* Friendly Top Header with Avatar & Status */}
      <div className="flex items-center justify-between px-1 pt-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-xs flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-emerald-800 font-bold text-xs shadow-inner">
              AF
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-2xs font-semibold text-emerald-700">{greeting}</span>
              <span className="text-3xs">·</span>
              <span className="text-3xs text-slate-400">Ahmad</span>
            </div>
            <h2 className="text-sm font-bold text-slate-900 leading-tight">
              Kondisi Keuangan Prima ✨
            </h2>
          </div>
        </div>

        <button
          onClick={() => setHideBalance(!hideBalance)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 text-2xs font-semibold shadow-2xs hover:bg-slate-50 transition-colors"
          title={hideBalance ? 'Tampilkan saldo' : 'Sembunyikan saldo'}
        >
          {hideBalance ? <EyeOff className="w-3.5 h-3.5 text-slate-500" /> : <Eye className="w-3.5 h-3.5 text-emerald-600" />}
          <span>{hideBalance ? 'Buka' : 'Privasi'}</span>
        </button>
      </div>

      {/* Warm & Friendly Hero Balance Card */}
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-800 text-white p-5 shadow-lg shadow-emerald-950/10 space-y-4">
        {/* Subtle decorative circles for cheerful friendly feel */}
        <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-white/10 blur-xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-emerald-400/10 blur-lg pointer-events-none" />

        {/* Balance Title & Amount */}
        <div className="relative z-10">
          <div className="flex items-center justify-between text-emerald-100 text-xs">
            <span className="font-medium flex items-center gap-1.5">
              <span>Total Saldo Dompet & Bank</span>
            </span>
            <span className="text-3xs bg-white/20 text-white px-2 py-0.5 rounded-full font-semibold backdrop-blur-xs">
              {accounts.length} Akun Terhubung
            </span>
          </div>

          <div className="text-3xl font-bold font-mono tracking-tight text-white mt-1 tabular-nums drop-shadow-2xs">
            {hideBalance ? 'Rp ••••••••' : formatRupiah(totalBalance)}
          </div>
        </div>

        {/* Friendly Financial Health Pill */}
        <div className="relative z-10 flex items-center justify-between bg-black/15 backdrop-blur-xs rounded-2xl px-3.5 py-2 text-2xs text-emerald-50">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
            <span className="font-semibold">
              Rasio Tabungan: {monthlyData.savingsRate}%
            </span>
          </div>
          <span className="text-3xs text-emerald-200 font-medium">
            {monthlyData.savingsRate >= 20 ? 'Sangat Sehat 🎯' : 'Tingkatkan Yuk 💡'}
          </span>
        </div>

        {/* Sub-metrics: Pemasukan & Pengeluaran Bulanan */}
        <div className="relative z-10 grid grid-cols-2 gap-2 pt-1 border-t border-white/15 text-xs">
          <div className="flex items-center gap-2 bg-white/10 rounded-2xl p-2.5 backdrop-blur-2xs">
            <div className="w-7 h-7 rounded-xl bg-emerald-400/25 text-emerald-200 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-3xs text-emerald-100/80 font-medium">Pemasukan</p>
              <p className="font-mono font-bold text-white text-xs tabular-nums truncate">
                {hideBalance ? '••••' : formatRupiah(monthlyData.totalIncome)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/10 rounded-2xl p-2.5 backdrop-blur-2xs">
            <div className="w-7 h-7 rounded-xl bg-rose-400/25 text-rose-200 flex items-center justify-center shrink-0">
              <TrendingDown className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-3xs text-rose-100/80 font-medium">Pengeluaran</p>
              <p className="font-mono font-bold text-white text-xs tabular-nums truncate">
                {hideBalance ? '••••' : formatRupiah(monthlyData.totalExpense)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cheerful 5 Quick Action Thumb Hub */}
      <div className="grid grid-cols-5 gap-1.5 text-center py-0.5">
        {/* Action 1: Catat */}
        <button
          onClick={onOpenAddModal}
          className="flex flex-col items-center justify-center p-2 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:bg-emerald-50/50 active:scale-95 transition-all group"
        >
          <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform mb-1">
            <Plus className="w-5 h-5" />
          </div>
          <span className="text-2xs font-bold text-slate-800">Catat</span>
        </button>

        {/* Action 2: Scan Struk */}
        <button
          onClick={onOpenScanModal}
          className="flex flex-col items-center justify-center p-2 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:bg-sky-50/50 active:scale-95 transition-all group"
        >
          <div className="w-10 h-10 rounded-2xl bg-sky-500 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform mb-1">
            <Camera className="w-5 h-5" />
          </div>
          <span className="text-2xs font-bold text-slate-800">Scan</span>
        </button>

        {/* Action 3: Sync Bank */}
        <button
          onClick={() => syncAllAccounts()}
          disabled={isSyncingAll}
          className="flex flex-col items-center justify-center p-2 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:bg-violet-50/50 active:scale-95 transition-all disabled:opacity-50 group"
        >
          <div className="w-10 h-10 rounded-2xl bg-violet-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform mb-1">
            <RefreshCw className={`w-4 h-4 ${isSyncingAll ? 'animate-spin text-white' : ''}`} />
          </div>
          <span className="text-2xs font-bold text-slate-800">
            {isSyncingAll ? 'Sync...' : 'Sync'}
          </span>
        </button>

        {/* Action 4: Laporan */}
        <button
          onClick={() => setActiveTab('reports')}
          className="flex flex-col items-center justify-center p-2 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:bg-amber-50/50 active:scale-95 transition-all group"
        >
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform mb-1">
            <PieChart className="w-4 h-4" />
          </div>
          <span className="text-2xs font-bold text-slate-800">Laporan</span>
        </button>

        {/* Action 5: Google Sheets */}
        <button
          onClick={onOpenSheetsModal}
          className="flex flex-col items-center justify-center p-2 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:bg-teal-50/50 active:scale-95 transition-all group"
        >
          <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform mb-1">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <span className="text-2xs font-bold text-slate-800">Sheets</span>
        </button>
      </div>

      {/* Friendly Daily Spending Glance ("Belanja Hari Ini") */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs shrink-0">
            ☕
          </div>
          <div>
            <p className="text-2xs font-semibold text-slate-500">Pengeluaran Hari Ini</p>
            <p className="text-sm font-bold font-mono text-slate-900 tabular-nums">
              {todayExpense > 0 ? formatRupiah(todayExpense) : 'Belum Ada (Hemat! 🎉)'}
            </p>
          </div>
        </div>

        <button
          onClick={onOpenScanModal}
          className="inline-flex items-center gap-1 text-2xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1.5 rounded-xl transition-colors"
        >
          <Camera className="w-3.5 h-3.5 text-emerald-600" />
          <span>+ Scan Nota</span>
        </button>
      </div>

      {/* Friendly Bank Pockets / Wallets Carousel */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-800">Kantong & Rekening</span>
            <span className="text-3xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
              {accounts.length}
            </span>
          </div>
          <button
            onClick={() => setActiveTab('banks')}
            className="text-2xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center"
          >
            <span>Kelola Bank</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex gap-2.5 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              onClick={() => setActiveTab('banks')}
              className="min-w-[145px] p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs shrink-0 cursor-pointer hover:border-emerald-500 transition-all active:scale-[0.98]"
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-white text-3xs shadow-2xs"
                  style={{ backgroundColor: acc.color }}
                >
                  {acc.name.slice(0, 3)}
                </div>
                <span className="text-3xs font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                  Aktif
                </span>
              </div>
              <p className="text-2xs font-bold text-slate-900 truncate">{acc.name}</p>
              <p className="text-xs font-mono font-bold text-slate-800 tabular-nums mt-0.5">
                {hideBalance ? '••••' : formatRupiah(acc.balance)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Friendly Smart Financial Insight Card */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50/50 to-white border border-emerald-200/80 space-y-1.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <h4 className="text-xs font-bold text-slate-900">Catatan Cerdas Finansialmu</h4>
        </div>
        <p className="text-2xs text-slate-600 leading-relaxed pl-8">
          {monthlyData.savingsRate >= 20
            ? `Pola belanjamu sangat baik! Kamu berhasil menyisihkan ${monthlyData.savingsRate}% penghasilan ke tabungan & investasi. Pertahankan ya! 🎯`
            : `Pengeluaran bulan ini mencapai ${formatRupiah(monthlyData.totalExpense)}. Cek pos makan luar untuk berhemat santai minggu ini. ✨`}
        </p>
      </div>

      {/* Friendly Recent Transactions with Category Filter Chips */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900">Transaksi Terbaru</h3>
          <button
            onClick={() => setActiveTab('transactions')}
            className="text-2xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5"
          >
            <span>Buku Kas</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Quick Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-2xs">
          <button
            onClick={() => setActiveCategoryFilter('all')}
            className={`px-2.5 py-1 rounded-full font-semibold whitespace-nowrap transition-colors ${
              activeCategoryFilter === 'all'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setActiveCategoryFilter('cat_food_grocery')}
            className={`px-2.5 py-1 rounded-full font-semibold whitespace-nowrap transition-colors ${
              activeCategoryFilter === 'cat_food_grocery'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Belanja Dapur 🛒
          </button>
          <button
            onClick={() => setActiveCategoryFilter('cat_dining_out')}
            className={`px-2.5 py-1 rounded-full font-semibold whitespace-nowrap transition-colors ${
              activeCategoryFilter === 'cat_dining_out'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Makan & Kopi ☕
          </button>
          <button
            onClick={() => setActiveCategoryFilter('cat_transport')}
            className={`px-2.5 py-1 rounded-full font-semibold whitespace-nowrap transition-colors ${
              activeCategoryFilter === 'cat_transport'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Transport 🚗
          </button>
        </div>

        {/* Transaction List Rows */}
        <div className="divide-y divide-slate-100">
          {filteredRecentTransactions.length > 0 ? (
            filteredRecentTransactions.map((tx) => {
              const cat = categories.find((c) => c.id === tx.categoryId);

              return (
                <div
                  key={tx.id}
                  onClick={() => setSelectedTxDetail(tx)}
                  className="py-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-50/70 active:bg-slate-100/70 rounded-2xl px-1.5 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div
                      className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs"
                      style={{ backgroundColor: `${cat?.color || '#059669'}18` }}
                    >
                      <CategoryIcon
                        iconName={cat?.iconName || 'HelpCircle'}
                        color={cat?.color}
                        size={16}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 truncate leading-snug group-hover:text-emerald-800 transition-colors">
                        {tx.description}
                      </p>
                      <p className="text-3xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                        <span>{formatFriendlyDate(tx.date, tx.time)}</span>
                        <span>·</span>
                        <span className="truncate">{cat?.name}</span>
                        {tx.source === 'bank_sync' && (
                          <>
                            <span>·</span>
                            <span className="text-sky-600 font-medium">⚡ Sync</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p
                      className={`text-xs font-mono font-bold tabular-nums ${
                        tx.type === 'expense' ? 'text-slate-900' : 'text-emerald-600'
                      }`}
                    >
                      {tx.type === 'expense' ? '-' : '+'}
                      {formatRupiah(tx.amount)}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-6 text-center text-slate-400 text-xs">
              Belum ada transaksi di kategori ini.
            </div>
          )}
        </div>
      </div>

      {/* Friendly Bottom Sheet Detail Drawer */}
      {selectedTxDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end justify-center animate-in fade-in duration-150">
          <div className="bg-white rounded-t-[32px] w-full max-w-lg p-5 space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-200">
            {/* Sheet Handle */}
            <div className="w-10 h-1.5 bg-slate-300 rounded-full mx-auto" />

            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-3xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Detail Transaksi
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {selectedTxDetail.description}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTxDetail(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nominal Big Display */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-1">
              <p className="text-2xs text-slate-500">Nominal Transaksi</p>
              <p
                className={`text-2xl font-bold font-mono tabular-nums ${
                  selectedTxDetail.type === 'expense' ? 'text-slate-900' : 'text-emerald-600'
                }`}
              >
                {selectedTxDetail.type === 'expense' ? '- ' : '+ '}
                {formatRupiah(selectedTxDetail.amount)}
              </p>
            </div>

            {/* Transaction Metadata Grid */}
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Tanggal & Waktu</span>
                <span className="font-semibold text-slate-900 font-mono">
                  {selectedTxDetail.date} {selectedTxDetail.time ? `· ${selectedTxDetail.time}` : ''}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span>Kategori</span>
                <span className="font-semibold text-slate-900">
                  {categories.find((c) => c.id === selectedTxDetail.categoryId)?.name || 'Lainnya'}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span>Rekening Pembayaran</span>
                <span className="font-semibold text-slate-900">
                  {accounts.find((a) => a.id === selectedTxDetail.accountId)?.name || 'Rekening'}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span>Sumber Pencatatan</span>
                <span className="font-semibold text-slate-900">
                  {selectedTxDetail.source === 'bank_sync'
                    ? '⚡ Sinkronisasi Bank Otomatis'
                    : selectedTxDetail.source === 'import_csv'
                    ? '📁 Berkas CSV Mutasi'
                    : 'Pencatatan Manual / Struk'}
                </span>
              </div>

              {selectedTxDetail.notes && (
                <div className="pt-1.5 border-t border-slate-100">
                  <p className="text-3xs text-slate-400 font-medium">Catatan / Rincian Struk:</p>
                  <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl mt-1 leading-relaxed">
                    {selectedTxDetail.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  deleteTransaction(selectedTxDetail.id);
                  setSelectedTxDetail(null);
                }}
                className="flex-1 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors flex items-center justify-center gap-1.5 border border-rose-200"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Transaksi</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTxDetail(null)}
                className="flex-1 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors text-center"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
