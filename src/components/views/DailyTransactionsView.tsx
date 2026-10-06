import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatRupiah } from '../../services/analyticsService';
import { CategoryIcon } from '../CategoryIcon';
import { Transaction } from '../../types/finance';
import {
  Search,
  Plus,
  UploadCloud,
  Download,
  Trash2,
  Edit2,
  Check,
  X,
  Filter,
  Camera,
  FileSpreadsheet,
} from 'lucide-react';

interface DailyTransactionsViewProps {
  onOpenAddModal: () => void;
  onOpenImportModal: () => void;
  onOpenScanModal?: () => void;
  onOpenSheetsModal?: () => void;
}

export const DailyTransactionsView: React.FC<DailyTransactionsViewProps> = ({
  onOpenAddModal,
  onOpenImportModal,
  onOpenScanModal,
  onOpenSheetsModal,
}) => {
  const {
    transactions,
    categories,
    accounts,
    deleteTransaction,
    updateTransaction,
  } = useFinance();

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'expense' | 'income'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'october' | 'september' | 'today'>('all');

  // Edit State
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [editDesc, setEditDesc] = useState('');
  const [editAmount, setEditAmount] = useState<number>(0);
  const [editCatId, setEditCatId] = useState('');

  // Delete Confirm State
  const [deletingTxId, setDeletingTxId] = useState<string | null>(null);

  // Filtered list
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Search
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchesDesc = tx.description.toLowerCase().includes(query);
        const matchesMerchant = tx.merchant?.toLowerCase().includes(query);
        const matchesRaw = tx.originalBankRawText?.toLowerCase().includes(query);
        if (!matchesDesc && !matchesMerchant && !matchesRaw) return false;
      }

      // Category
      if (selectedCategory !== 'all' && tx.categoryId !== selectedCategory) {
        return false;
      }

      // Account
      if (selectedAccount !== 'all' && tx.accountId !== selectedAccount) {
        return false;
      }

      // Type
      if (selectedType !== 'all' && tx.type !== selectedType) {
        return false;
      }

      // Date quick filter
      if (dateFilter === 'october' && !tx.date.startsWith('2026-10')) return false;
      if (dateFilter === 'september' && !tx.date.startsWith('2026-09')) return false;
      if (dateFilter === 'today') {
        const todayStr = new Date().toISOString().split('T')[0];
        if (tx.date !== todayStr) return false;
      }

      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, searchTerm, selectedCategory, selectedAccount, selectedType, dateFilter]);

  // Totals for current filtered result
  const totalFilteredExpense = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalFilteredIncome = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const startEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setEditDesc(tx.description);
    setEditAmount(tx.amount);
    setEditCatId(tx.categoryId);
  };

  const saveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx) return;

    updateTransaction(editingTx.id, {
      description: editDesc,
      amount: editAmount,
      categoryId: editCatId,
    });
    setEditingTx(null);
  };

  const handleExportCsv = () => {
    const header = ['ID,Tanggal,Jam,Deskripsi,Kategori,Rekening,Tipe,Nominal,Sumber\n'];
    const rows = filteredTransactions.map((tx) => {
      const cat = categories.find((c) => c.id === tx.categoryId)?.name || '';
      const acc = accounts.find((a) => a.id === tx.accountId)?.name || '';
      return `"${tx.id}","${tx.date}","${tx.time || ''}","${tx.description.replace(/"/g, '""')}","${cat}","${acc}","${tx.type}","${tx.amount}","${tx.source}"\n`;
    });

    const blob = new Blob([...header, ...rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `transaksi_arthaku_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* Header bar & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Pencatatan Transaksi Harian
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar lengkap arus kas, mutasi otomatis perbankan, dan pengeluaran manual
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onOpenScanModal && (
            <button
              onClick={onOpenScanModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-850 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors shadow-2xs"
            >
              <Camera className="w-3.5 h-3.5 text-emerald-600" />
              <span>Scan Struk</span>
            </button>
          )}
          {onOpenSheetsModal && (
            <button
              onClick={onOpenSheetsModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-900 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors shadow-2xs"
              title="Sinkronkan dengan Google Sheets"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              <span>Google Sheets</span>
            </button>
          )}
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
            title="Download file CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Ekspor CSV</span>
          </button>
          <button
            onClick={onOpenImportModal}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-sky-800 bg-sky-50 border border-sky-200 rounded-lg hover:bg-sky-100 transition-colors"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Import Mutasi</span>
          </button>
          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>+ Catat Transaksi</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari transaksi, toko, merchant, atau mutasi..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Category filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Account filter */}
          <div>
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Semua Rekening</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          {/* Period quick filter */}
          <div>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Semua Periode</option>
              <option value="october">Bulan Oktober 2026</option>
              <option value="september">Bulan September 2026</option>
              <option value="today">Hari Ini Saja</option>
            </select>
          </div>
        </div>

        {/* Filter Type Segmented Buttons */}
        <div className="flex items-center justify-between pt-1 text-xs">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-3 py-1 font-semibold rounded-md transition-colors ${
                selectedType === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua Tipe
            </button>
            <button
              onClick={() => setSelectedType('expense')}
              className={`px-3 py-1 font-semibold rounded-md transition-colors ${
                selectedType === 'expense'
                  ? 'bg-white text-rose-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pengeluaran Saja
            </button>
            <button
              onClick={() => setSelectedType('income')}
              className={`px-3 py-1 font-semibold rounded-md transition-colors ${
                selectedType === 'income'
                  ? 'bg-white text-emerald-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pemasukan Saja
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-2xs text-slate-500 font-mono">
            <span>
              Pengeluaran:{' '}
              <strong className="text-slate-900 font-bold tabular-nums">
                {formatRupiah(totalFilteredExpense)}
              </strong>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Pemasukan:{' '}
              <strong className="text-emerald-700 font-bold tabular-nums">
                {formatRupiah(totalFilteredIncome)}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-4">Tanggal & Jam</th>
                <th className="py-3 px-4">Deskripsi / Mutasi</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">Rekening / Sumber</th>
                <th className="py-3 px-4 text-right">Nominal (Rp)</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx) => {
                  const cat = categories.find((c) => c.id === tx.categoryId);
                  const acc = accounts.find((a) => a.id === tx.accountId);

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* Tanggal */}
                      <td className="py-3.5 px-4 font-mono text-slate-600 tabular-nums whitespace-nowrap">
                        <div className="font-semibold text-slate-900">{tx.date}</div>
                        {tx.time && <div className="text-2xs text-slate-400">{tx.time}</div>}
                      </td>

                      {/* Deskripsi */}
                      <td className="py-3.5 px-4 max-w-sm">
                        <p className="font-semibold text-slate-900 leading-snug">
                          {tx.description}
                        </p>
                        {tx.originalBankRawText && (
                          <p className="text-2xs font-mono text-slate-400 truncate mt-0.5" title={tx.originalBankRawText}>
                            {tx.originalBankRawText}
                          </p>
                        )}
                        {tx.notes && (
                          <p className="text-2xs text-slate-500 italic mt-0.5">
                            Catatan: {tx.notes}
                          </p>
                        )}
                      </td>

                      {/* Kategori */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {cat ? (
                          <div className="flex items-center gap-2">
                            <div
                              className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                              style={{ backgroundColor: `${cat.color}18` }}
                            >
                              <CategoryIcon iconName={cat.iconName} color={cat.color} size={14} />
                            </div>
                            <span className="font-medium text-slate-800">{cat.name}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">Tanpa Kategori</span>
                        )}
                      </td>

                      {/* Rekening & Tag Sumber */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-medium text-slate-800">{acc?.name || 'Rekening'}</div>
                        <div className="text-2xs mt-0.5">
                          {tx.source === 'bank_sync' && (
                            <span className="text-sky-700 font-semibold">⚡ Auto Bank Sync</span>
                          )}
                          {tx.source === 'import_csv' && (
                            <span className="text-indigo-700 font-semibold">📁 File CSV</span>
                          )}
                          {tx.source === 'manual' && (
                            <span className="text-slate-500">Manual Entry</span>
                          )}
                        </div>
                      </td>

                      {/* Nominal */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold tabular-nums whitespace-nowrap">
                        <span
                          className={`text-sm ${
                            tx.type === 'expense' ? 'text-slate-900' : 'text-emerald-600'
                          }`}
                        >
                          {tx.type === 'expense' ? '-' : '+'}
                          {formatRupiah(tx.amount)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100">
                          <button
                            onClick={() => startEdit(tx)}
                            title="Edit Transaksi"
                            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingTxId(tx.id)}
                            title="Hapus Transaksi"
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <Filter className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-700">Tidak ada transaksi yang cocok</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Coba ubah kata kunci pencarian atau sesuaikan opsi filter di atas.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500">
          <span>Menampilkan {filteredTransactions.length} dari {transactions.length} total transaksi</span>
          <span className="font-mono">Tersimpan lokal & aman</span>
        </div>
      </div>

      {/* Edit Modal */}
      {editingTx && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Ubah Transaksi</h3>
              <button
                onClick={() => setEditingTx(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={saveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Deskripsi
                </label>
                <input
                  type="text"
                  required
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Nominal (Rp)
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={editAmount}
                  onChange={(e) => setEditAmount(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 text-sm font-mono font-bold bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Kategori
                </label>
                <select
                  value={editCatId}
                  onChange={(e) => setEditCatId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingTx(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingTxId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-100 p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Hapus Transaksi Ini?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Saldo rekening akan disesuaikan kembali secara otomatis. Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingTxId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteTransaction(deletingTxId);
                  setDeletingTxId(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
