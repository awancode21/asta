import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatRupiah, calculateMonthlyAnalysis } from '../../services/analyticsService';
import { CategoryIcon } from '../CategoryIcon';
import { Target, Edit2, Check, X, ShieldAlert, Sparkles } from 'lucide-react';

export const BudgetView: React.FC = () => {
  const { categories, transactions, selectedMonth, selectedYear, updateCategoryBudget } = useFinance();

  const report = calculateMonthlyAnalysis(transactions, categories, selectedMonth, selectedYear);

  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [budgetInput, setBudgetInput] = useState<number>(0);

  const handleStartEdit = (catId: string, currentBudget: number) => {
    setEditingCatId(catId);
    setBudgetInput(currentBudget);
  };

  const handleSaveBudget = (catId: string) => {
    updateCategoryBudget(catId, Math.max(0, budgetInput));
    setEditingCatId(null);
  };

  const totalPlannedBudget = categories
    .filter((c) => c.type === 'expense')
    .reduce((acc, c) => acc + (c.budgetMonthly || 0), 0);

  const totalActualSpent = report.totalExpense;
  const remainingBudget = totalPlannedBudget - totalActualSpent;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Perencanaan Anggaran Bulanan (Budgeting)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kendalikan batas pengeluaran per pos belanja agar tidak melampaui batas kemampuan finansial
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Batas Anggaran
          </span>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums mt-1">
            {formatRupiah(totalPlannedBudget)}
          </div>
          <p className="text-xs text-slate-500 mt-1">Plafon maksimal belanja</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Pengeluaran Berjalan
          </span>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums mt-1">
            {formatRupiah(totalActualSpent)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Terpakai {totalPlannedBudget > 0 ? Math.round((totalActualSpent / totalPlannedBudget) * 100) : 0}% dari batas
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Sisa Kuota Anggaran
          </span>
          <div
            className={`text-2xl font-bold font-mono tabular-nums mt-1 ${
              remainingBudget >= 0 ? 'text-emerald-700' : 'text-rose-600'
            }`}
          >
            {formatRupiah(remainingBudget)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {remainingBudget >= 0 ? 'Tersedia untuk sisa hari' : 'Plafon terlampaui'}
          </p>
        </div>
      </div>

      {/* Category Budgets Grid */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-6">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-emerald-600" />
          <h3 className="text-base font-bold text-slate-900">
            Daftar Batas Anggaran per Kategori
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {report.categoryBreakdown.map((cat) => {
            const isEditing = editingCatId === cat.categoryId;
            const pct = cat.budget > 0 ? Math.round((cat.amount / cat.budget) * 100) : 0;
            const isOver = cat.amount > cat.budget;
            const isWarning = pct >= 75 && !isOver;

            return (
              <div
                key={cat.categoryId}
                className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/40 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${cat.color}20` }}
                    >
                      <CategoryIcon iconName={cat.iconName} color={cat.color} size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{cat.categoryName}</h4>
                      <p className="text-2xs text-slate-500 capitalize">
                        {cat.group === 'needs' ? 'Kebutuhan' : cat.group === 'wants' ? 'Keinginan' : 'Tabungan'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          step="50000"
                          value={budgetInput}
                          onChange={(e) => setBudgetInput(parseInt(e.target.value, 10) || 0)}
                          className="w-24 px-2 py-1 text-xs font-mono font-bold bg-white border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500"
                        />
                        <button
                          onClick={() => handleSaveBudget(cat.categoryId)}
                          className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingCatId(null)}
                          className="p-1 text-slate-400 hover:bg-slate-100 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleStartEdit(cat.categoryId, cat.budget)}
                        className="inline-flex items-center gap-1 text-2xs font-semibold text-slate-500 hover:text-slate-800 p-1 rounded hover:bg-slate-100"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Ubah</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex items-center justify-between text-2xs mb-1 font-mono">
                    <span className="text-slate-600">
                      Terpakai: <strong>{formatRupiah(cat.amount)}</strong>
                    </span>
                    <span className="text-slate-500">
                      Batas: {cat.budget > 0 ? formatRupiah(cat.budget) : 'Belum diatur'}
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isOver ? 'bg-rose-600' : isWarning ? 'bg-amber-500' : 'bg-emerald-600'
                      }`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-2xs mt-1.5">
                    <span
                      className={`font-semibold ${
                        isOver ? 'text-rose-600' : isWarning ? 'text-amber-600' : 'text-emerald-700'
                      }`}
                    >
                      {pct}% terpakai {isOver ? '(Overbudget)' : isWarning ? '(Mendekati limit)' : '(Aman)'}
                    </span>
                    <span className="text-slate-500 font-mono">
                      {cat.budget >= cat.amount
                        ? `Sisa ${formatRupiah(cat.budget - cat.amount)}`
                        : `Lebih ${formatRupiah(cat.amount - cat.budget)}`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
