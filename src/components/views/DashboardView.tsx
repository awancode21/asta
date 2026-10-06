import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatRupiah, calculateMonthlyAnalysis } from '../../services/analyticsService';
import { CategoryIcon } from '../CategoryIcon';
import {
  Wallet,
  TrendingDown,
  TrendingUp,
  PiggyBank,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  Plus,
  Camera,
} from 'lucide-react';
import { ActiveTab } from '../Header';

interface DashboardViewProps {
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAddModal: () => void;
  onOpenSyncModal: () => void;
  onOpenScanModal?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  setActiveTab,
  onOpenAddModal,
  onOpenSyncModal,
  onOpenScanModal,
}) => {
  const {
    accounts,
    transactions,
    categories,
    selectedMonth,
    selectedYear,
    isSyncingAll,
    syncAllAccounts,
  } = useFinance();

  // Calculate monthly stats for current selected month
  const monthlyData = calculateMonthlyAnalysis(
    transactions,
    categories,
    selectedMonth,
    selectedYear
  );

  // Total balance across all accounts
  const totalNetBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);

  // Recent 6 transactions
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  // Budget warnings (categories spent > 75%)
  const budgetAlerts = monthlyData.categoryBreakdown
    .filter((cat) => cat.budget > 0 && cat.amount / cat.budget >= 0.75)
    .slice(0, 3);

  // Past 7 days data for mini trend chart
  const last7DaysTrends = monthlyData.dailyTrends.slice(-7);
  const maxDaySpend = Math.max(...last7DaysTrends.map((d) => d.expense), 50000);

  return (
    <div className="space-y-6">
      {/* Top Banner: Quick Summary & Bank Sync Status */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-300 mb-1">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Sinkronisasi Rekening Bank Aktif</span>
              <span>·</span>
              <span>{accounts.length} Akun Terdaftar</span>
            </div>
            <p className="text-2xs font-medium text-slate-400">Total Saldo Likuid Terkonsolidasi</p>
            <h1 className="text-3xl font-bold font-mono tracking-tight text-white tabular-nums mt-0.5">
              {formatRupiah(totalNetBalance)}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {onOpenScanModal && (
              <button
                onClick={onOpenScanModal}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold transition-colors shadow-sm"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Scan Nota Struk</span>
              </button>
            )}
            <button
              onClick={() => syncAllAccounts()}
              disabled={isSyncingAll}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs transition-colors border border-white/10 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingAll ? 'animate-spin text-emerald-400' : ''}`} />
              <span>{isSyncingAll ? 'Menarik Mutasi...' : 'Tarik Mutasi Semua'}</span>
            </button>
            <button
              onClick={onOpenSyncModal}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors border border-white/10"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>+ Hubungkan Bank</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Primary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Pengeluaran Bulan Ini */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Pengeluaran (Okt)
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {formatRupiah(monthlyData.totalExpense)}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
            <span>Rata-rata:</span>
            <span className="font-mono font-medium text-slate-700 tabular-nums">
              {formatRupiah(monthlyData.avgDailyExpense)}/hari
            </span>
          </div>
        </div>

        {/* Card 2: Pemasukan Bulan Ini */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Pemasukan (Okt)
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {formatRupiah(monthlyData.totalIncome)}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
            <span>Gaji & Proyek</span>
            <span>·</span>
            <span className="text-emerald-600 font-medium">Terverifikasi</span>
          </div>
        </div>

        {/* Card 3: Arus Kas Bersih (Net Savings) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Sisa Arus Kas
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div
            className={`text-2xl font-bold font-mono tabular-nums ${
              monthlyData.netSavings >= 0 ? 'text-emerald-700' : 'text-rose-600'
            }`}
          >
            {formatRupiah(monthlyData.netSavings)}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
            <span>Rasio Tabungan:</span>
            <span className="font-mono font-bold text-slate-800">
              {monthlyData.savingsRate}%
            </span>
          </div>
        </div>

        {/* Card 4: Status 50/30/20 Rule */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Rasio Kebutuhan (50%)
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {monthlyData.budget503020.needs.percentage}%
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
            <span>Keinginan: {monthlyData.budget503020.wants.percentage}%</span>
            <span>·</span>
            <span>Tabungan: {monthlyData.budget503020.savings.percentage}%</span>
          </div>
        </div>
      </div>

      {/* 2-Column Section: Pulse 7 Hari & Bank Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2 cols): 7-Day Expense Sparkline & Recent Transactions */}
        <div className="lg:col-span-2 space-y-6">
          {/* 7-Day Trend Chart */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Tren Pengeluaran 7 Hari Terakhir
                </h3>
                <p className="text-2xs text-slate-500">
                  Pantau ritme harian untuk menghindari lonjakan pengeluaran mendadak
                </p>
              </div>
              <button
                onClick={() => setActiveTab('reports')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition-colors"
              >
                <span>Lihat Laporan Lengkap</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Custom SVG Bar Chart */}
            <div className="h-44 flex items-end justify-between gap-3 pt-6 pb-2 px-2">
              {last7DaysTrends.map((item) => {
                const heightPct = maxDaySpend > 0 ? Math.max(10, Math.round((item.expense / maxDaySpend) * 100)) : 10;
                return (
                  <div key={item.day} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="text-2xs font-mono text-slate-400 group-hover:text-slate-800 opacity-0 group-hover:opacity-100 transition-opacity tabular-nums whitespace-nowrap">
                      {formatRupiah(item.expense)}
                    </div>
                    <div className="w-full bg-slate-100 rounded-t-lg h-28 flex items-end p-1">
                      <div
                        className="w-full bg-emerald-600 group-hover:bg-emerald-500 rounded-t-md transition-all duration-300"
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                    <span className="text-2xs font-mono text-slate-500 font-medium">
                      Tgl {item.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Daily Transactions */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Transaksi Harian Terbaru</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenAddModal}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 p-1 rounded-md"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah</span>
                </button>
                <span className="text-slate-300">|</span>
                <button
                  onClick={() => setActiveTab('transactions')}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Lihat Semua ({transactions.length})
                </button>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {recentTransactions.map((tx) => {
                const cat = categories.find((c) => c.id === tx.categoryId);
                const acc = accounts.find((a) => a.id === tx.accountId);

                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-4 hover:bg-slate-50/70 transition-colors"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${cat?.color || '#059669'}18` }}
                      >
                        <CategoryIcon
                          iconName={cat?.iconName || 'HelpCircle'}
                          color={cat?.color}
                          size={18}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {tx.description}
                        </p>
                        <div className="flex items-center gap-1.5 text-2xs text-slate-500 mt-0.5">
                          <span>{tx.date}</span>
                          <span aria-hidden="true">·</span>
                          <span>{acc?.name || 'Rekening'}</span>
                          <span aria-hidden="true">·</span>
                          <span className={tx.source === 'bank_sync' ? 'text-sky-600 font-medium' : 'text-slate-500'}>
                            {tx.source === 'bank_sync' ? '⚡ Bank Sync' : 'Manual'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0 pl-3">
                      <div
                        className={`text-xs font-mono font-bold tabular-nums ${
                          tx.type === 'expense' ? 'text-slate-900' : 'text-emerald-600'
                        }`}
                      >
                        {tx.type === 'expense' ? '-' : '+'}
                        {formatRupiah(tx.amount)}
                      </div>
                      <div className="text-2xs text-slate-400 capitalize">{cat?.name}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right (1 col): Bank Accounts list & Budget Health Warning */}
        <div className="space-y-6">
          {/* Connected Banks Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">Rekening Terhubung</h3>
              <button
                onClick={() => setActiveTab('banks')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
              >
                Kelola
              </button>
            </div>

            <div className="space-y-3">
              {accounts.map((acc) => (
                <div
                  key={acc.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-2xs shrink-0"
                      style={{ backgroundColor: acc.color }}
                    >
                      {acc.name.slice(0, 3)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{acc.name}</p>
                      <p className="text-2xs font-mono text-slate-500">
                        {acc.accountNumber}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold font-mono text-slate-900 tabular-nums">
                      {formatRupiah(acc.balance)}
                    </p>
                    <p className="text-2xs text-emerald-600 font-medium">Tersinkron</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={onOpenSyncModal}
              className="w-full mt-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors text-center"
            >
              + Tambah Bank atau E-Wallet Baru
            </button>
          </div>

          {/* Budget Watch Alerts */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900">Peringatan Anggaran</h3>
              </div>
              <button
                onClick={() => setActiveTab('budget')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
              >
                Atur
              </button>
            </div>

            {budgetAlerts.length > 0 ? (
              <div className="space-y-3.5">
                {budgetAlerts.map((cat) => {
                  const pct = Math.min(100, Math.round((cat.amount / cat.budget) * 100));
                  const isOver = cat.amount > cat.budget;

                  return (
                    <div key={cat.categoryId} className="text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800">{cat.categoryName}</span>
                        <span
                          className={`font-mono font-bold tabular-nums text-2xs ${
                            isOver ? 'text-rose-600' : 'text-amber-600'
                          }`}
                        >
                          {pct}% ({formatRupiah(cat.amount)} / {formatRupiah(cat.budget)})
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isOver ? 'bg-rose-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                Semua kategori masih dalam batas aman anggaran bulanan.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
