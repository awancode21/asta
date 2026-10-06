import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  calculateMonthlyAnalysis,
  formatRupiah,
  getMonthName,
} from '../../services/analyticsService';
import { CategoryIcon } from '../CategoryIcon';
import {
  Printer,
  Download,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Calendar,
  Sparkles,
} from 'lucide-react';

export const MonthlyReportView: React.FC = () => {
  const {
    transactions,
    categories,
    selectedMonth,
    selectedYear,
    setSelectedMonth,
    setSelectedYear,
  } = useFinance();

  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string | null>(null);

  // Compute monthly analysis
  const report = calculateMonthlyAnalysis(
    transactions,
    categories,
    selectedMonth,
    selectedYear
  );

  // Available months to select
  const availableMonths = [
    { month: 10, year: 2026, label: 'Oktober 2026' },
    { month: 9, year: 2026, label: 'September 2026' },
    { month: 8, year: 2026, label: 'Agustus 2026' },
  ];

  // SVG Donut calculation
  const totalExpense = report.totalExpense;
  let cumulativeAngle = 0;
  const donutSegments = report.categoryBreakdown
    .filter((c) => c.amount > 0)
    .map((c) => {
      const sliceAngle = totalExpense > 0 ? (c.amount / totalExpense) * 360 : 0;
      const startAngle = cumulativeAngle;
      cumulativeAngle += sliceAngle;
      return {
        ...c,
        startAngle,
        endAngle: cumulativeAngle,
      };
    });

  // Calculate SVG path for donut slice
  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  // Daily trend chart max value
  const maxDaySpend = Math.max(...report.dailyTrends.map((d) => d.expense), 100000);

  // Handle Print / PDF export
  const handlePrint = () => {
    window.print();
  };

  // Handle CSV Download
  const handleDownloadCsv = () => {
    const header = ['Bulan,Kategori,Tipe_50_30_20,Total_Pengeluaran,Persentase,Anggaran_Bulanan\n'];
    const rows = report.categoryBreakdown.map((c) => {
      return `"${getMonthName(selectedMonth)} ${selectedYear}","${c.categoryName}","${c.group}","${c.amount}","${c.percentage}%","${c.budget}"\n`;
    });
    const blob = new Blob([...header, ...rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `laporan_keuangan_${selectedMonth}_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Title & Month Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Laporan Analisis Pengeluaran Bulanan
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluasi menyeluruh arus kas, pola belanja, dan kesehatan rasio anggaran
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Month Selector Buttons */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            {availableMonths.map((m) => (
              <button
                key={`${m.year}-${m.month}`}
                onClick={() => {
                  setSelectedMonth(m.month);
                  setSelectedYear(m.year);
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  selectedMonth === m.month && selectedYear === m.year
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleDownloadCsv}
            className="p-2 text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            title="Unduh Data CSV"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-2xs"
            title="Cetak atau Simpan PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cetak / Simpan PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Header (Visible when printed) */}
      <div className="hidden print-only mb-6 border-b pb-4">
        <h1 className="text-2xl font-bold text-slate-900">ArthaKu - Laporan Keuangan Pribadi</h1>
        <p className="text-sm text-slate-600">
          Periode: {getMonthName(selectedMonth)} {selectedYear} · Dicetak pada: {new Date().toLocaleDateString('id-ID')}
        </p>
      </div>

      {/* 4 Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Pengeluaran */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Pengeluaran
          </span>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums mt-1">
            {formatRupiah(report.totalExpense)}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Periode {getMonthName(selectedMonth)} {selectedYear}
          </div>
        </div>

        {/* KPI 2: Rata-rata Harian */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Rata-rata Harian
          </span>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums mt-1">
            {formatRupiah(report.avgDailyExpense)}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Per hari dalam bulan ini
          </div>
        </div>

        {/* KPI 3: Rasio Tabungan */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Tingkat Tabungan
          </span>
          <div
            className={`text-2xl font-bold font-mono tabular-nums mt-1 ${
              report.savingsRate >= 20 ? 'text-emerald-700' : 'text-amber-600'
            }`}
          >
            {report.savingsRate}%
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Target ideal minimal 20%
          </div>
        </div>

        {/* KPI 4: Hari Pengeluaran Tertinggi */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Hari Paling Boros
          </span>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums mt-1">
            {report.highestExpenseDay ? formatRupiah(report.highestExpenseDay.amount) : 'Rp 0'}
          </div>
          <div className="mt-2 text-xs text-slate-500 truncate" title={report.highestExpenseDay?.description}>
            {report.highestExpenseDay ? `Tgl ${report.highestExpenseDay.date.slice(-2)} · ${report.highestExpenseDay.description}` : '-'}
          </div>
        </div>
      </div>

      {/* 50/30/20 Financial Health Rule Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Evaluasi Kesehatan Finansial: Kaidah 50 / 30 / 20
            </h3>
            <p className="text-xs text-slate-500">
              Standar ideal alokasi: 50% Kebutuhan Pokok · 30% Keinginan & Gaya Hidup · 20% Tabungan/Investasi
            </p>
          </div>
          <div className="flex items-center gap-2 text-2xs font-semibold">
            {report.budget503020.wants.percentage <= 35 && report.budget503020.savings.percentage >= 15 ? (
              <span className="text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Kondisi Finansial Sehat</span>
              </span>
            ) : (
              <span className="text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Perlu Penyesuaian Anggaran</span>
              </span>
            )}
          </div>
        </div>

        {/* 3 Proportional Bars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {/* Needs */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold text-slate-800">1. Kebutuhan Pokok (Needs)</span>
              <span className="font-mono font-bold text-slate-900">{report.budget503020.needs.percentage}%</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-2">
              <div
                className="bg-sky-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, report.budget503020.needs.percentage)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-2xs text-slate-500">
              <span>Target: 50%</span>
              <span className="font-mono font-medium">{formatRupiah(report.budget503020.needs.amount)}</span>
            </div>
          </div>

          {/* Wants */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold text-slate-800">2. Keinginan (Wants)</span>
              <span className={`font-mono font-bold ${report.budget503020.wants.percentage > 35 ? 'text-amber-600' : 'text-slate-900'}`}>
                {report.budget503020.wants.percentage}%
              </span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-2">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  report.budget503020.wants.percentage > 35 ? 'bg-amber-500' : 'bg-orange-500'
                }`}
                style={{ width: `${Math.min(100, report.budget503020.wants.percentage)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-2xs text-slate-500">
              <span>Target: 30%</span>
              <span className="font-mono font-medium">{formatRupiah(report.budget503020.wants.amount)}</span>
            </div>
          </div>

          {/* Savings */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold text-slate-800">3. Tabungan & Investasi</span>
              <span className="font-mono font-bold text-emerald-700">{report.budget503020.savings.percentage}%</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-2">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, report.budget503020.savings.percentage)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-2xs text-slate-500">
              <span>Target: 20%</span>
              <span className="font-mono font-medium">{formatRupiah(report.budget503020.savings.amount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Section: Category Breakdown Donut & Daily Trend Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown (Donut Chart & List) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">
              Komposisi Pengeluaran per Kategori
            </h3>
            <span className="text-2xs text-slate-400 font-mono">
              Total: {formatRupiah(report.totalExpense)}
            </span>
          </div>

          {/* Interactive Donut Graphic & Legend */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
            {/* SVG Donut */}
            <div className="relative w-48 h-48 shrink-0 flex items-center justify-center">
              <svg viewBox="-1.2 -1.2 2.4 2.4" className="w-full h-full -rotate-90">
                {donutSegments.map((segment) => {
                  const startPct = segment.startAngle / 360;
                  const endPct = segment.endAngle / 360;
                  const [startX, startY] = getCoordinatesForPercent(startPct);
                  const [endX, endY] = getCoordinatesForPercent(endPct);
                  const largeArcFlag = endPct - startPct > 0.5 ? 1 : 0;
                  const pathData = `M ${startX} ${startY} A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY} L 0 0`;

                  return (
                    <path
                      key={segment.categoryId}
                      d={pathData}
                      fill={segment.color}
                      className="cursor-pointer hover:opacity-85 transition-opacity"
                      onClick={() =>
                        setActiveCategoryFilter(
                          activeCategoryFilter === segment.categoryId ? null : segment.categoryId
                        )
                      }
                    />
                  );
                })}
                {/* Center circle cut for donut */}
                <circle cx="0" cy="0" r="0.65" fill="white" />
              </svg>
              <div className="absolute text-center pointer-events-none">
                <span className="text-2xs text-slate-400 font-medium">Bulan Ini</span>
                <p className="text-xs font-bold font-mono text-slate-900">
                  {donutSegments.length} Pos
                </p>
              </div>
            </div>

            {/* Category Bars List */}
            <div className="flex-1 space-y-2 max-h-56 overflow-y-auto w-full pr-1">
              {report.categoryBreakdown.map((cat) => {
                if (cat.amount === 0) return null;
                const isSelected = activeCategoryFilter === cat.categoryId;

                return (
                  <div
                    key={cat.categoryId}
                    onClick={() =>
                      setActiveCategoryFilter(isSelected ? null : cat.categoryId)
                    }
                    className={`p-2 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-slate-800 bg-slate-50 ring-1 ring-slate-800'
                        : 'border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${cat.color}20` }}
                        >
                          <CategoryIcon iconName={cat.iconName} color={cat.color} size={12} />
                        </div>
                        <span className="font-medium text-slate-800 truncate">{cat.categoryName}</span>
                      </div>
                      <div className="text-right shrink-0 font-mono">
                        <span className="font-bold text-slate-900 tabular-nums">
                          {formatRupiah(cat.amount)}
                        </span>
                        <span className="text-2xs text-slate-400 ml-1.5">
                          ({cat.percentage}%)
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Daily Expense Pulse (Bar Chart sepanjang bulan) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">
              Tren Pengeluaran Harian (Kalender)
            </h3>
            <span className="text-2xs text-slate-400 font-mono">
              Puncak: {formatRupiah(maxDaySpend)}
            </span>
          </div>

          <div className="h-56 flex items-end justify-between gap-1 pt-6 pb-2 px-1 border-b border-slate-100">
            {report.dailyTrends.map((d) => {
              const heightPct = maxDaySpend > 0 ? Math.max(6, Math.round((d.expense / maxDaySpend) * 100)) : 6;
              const hasExpense = d.expense > 0;

              return (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1 group relative">
                  {/* Tooltip on hover */}
                  <div className="absolute -top-8 bg-slate-900 text-white text-2xs px-1.5 py-0.5 rounded font-mono tabular-nums opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-xs">
                    {formatRupiah(d.expense)}
                  </div>
                  <div className="w-full bg-slate-50 hover:bg-slate-100 rounded-t h-40 flex items-end">
                    <div
                      className={`w-full rounded-t transition-all duration-300 ${
                        hasExpense ? 'bg-emerald-600 group-hover:bg-emerald-500' : 'bg-transparent'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="text-3xs font-mono text-slate-400">
                    {d.day % 5 === 0 || d.day === 1 ? d.day : ''}
                  </span>
                </div>
              );
            })}
          </div>

          <p className="text-2xs text-slate-500 italic">
            Grafik di atas memetakan fluktuasi harian Anda. Pengeluaran cenderung terpusat di tanggal muda (pembayaran sewa & tagihan rutin) serta akhir pekan.
          </p>
        </div>
      </div>

      {/* Top 5 Categories & Comparison to Last Month */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-900">
          5 Pos Pengeluaran Terbesar & Perbandingan dengan Bulan Lalu
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                <th className="py-2.5 px-3">Kategori</th>
                <th className="py-2.5 px-3">Kelompok</th>
                <th className="py-2.5 px-3 text-right">Nominal Bulan Ini</th>
                <th className="py-2.5 px-3 text-right">Porsi Pengeluaran</th>
                <th className="py-2.5 px-3 text-right">Perubahan vs Bulan Lalu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {report.categoryBreakdown.slice(0, 5).map((cat) => (
                <tr key={cat.categoryId} className="hover:bg-slate-50/50">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${cat.color}20` }}
                      >
                        <CategoryIcon iconName={cat.iconName} color={cat.color} size={13} />
                      </div>
                      <span className="font-semibold text-slate-900">{cat.categoryName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 capitalize text-slate-600">
                    {cat.group === 'needs' ? 'Kebutuhan' : cat.group === 'wants' ? 'Keinginan' : 'Tabungan'}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                    {formatRupiah(cat.amount)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-700 tabular-nums">
                    {cat.percentage}%
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-semibold tabular-nums">
                    {cat.diffFromLastMonthPercent !== undefined ? (
                      <span
                        className={`inline-flex items-center gap-1 ${
                          cat.diffFromLastMonthPercent > 0 ? 'text-rose-600' : 'text-emerald-600'
                        }`}
                      >
                        {cat.diffFromLastMonthPercent > 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        <span>
                          {cat.diffFromLastMonthPercent > 0 ? '+' : ''}
                          {cat.diffFromLastMonthPercent}%
                        </span>
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Smart Financial Insights & Recommendations */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-600" />
          <h3 className="text-base font-bold text-slate-900">
            Temuan Cerdas & Rekomendasi Finansial
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {report.insights.map((ins) => (
            <div
              key={ins.id}
              className={`p-4 rounded-xl border flex items-start gap-3.5 transition-colors ${
                ins.type === 'positive'
                  ? 'bg-emerald-50/50 border-emerald-200/70'
                  : ins.type === 'warning'
                  ? 'bg-amber-50/50 border-amber-200/70'
                  : 'bg-sky-50/50 border-sky-200/70'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  ins.type === 'positive'
                    ? 'bg-emerald-100 text-emerald-700'
                    : ins.type === 'warning'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-sky-100 text-sky-700'
                }`}
              >
                {ins.type === 'positive' && <CheckCircle2 className="w-4 h-4" />}
                {ins.type === 'warning' && <AlertTriangle className="w-4 h-4" />}
                {ins.type === 'tip' && <Lightbulb className="w-4 h-4" />}
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-slate-900">{ins.title}</h4>
                  <span className="text-2xs font-semibold px-2 py-0.5 rounded bg-white/80 border border-slate-200/60 text-slate-700">
                    {ins.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{ins.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
