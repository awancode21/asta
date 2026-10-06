import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { CategoryIcon } from './CategoryIcon';
import { formatRupiah } from '../services/analyticsService';
import { X, Check, Camera } from 'lucide-react';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenScanModal?: () => void;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  onOpenScanModal,
}) => {
  const { categories, accounts, addTransaction } = useFinance();

  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState<number>(50000);
  const [categoryId, setCategoryId] = useState<string>('cat_dining_out');
  const [accountId, setAccountId] = useState<string>(accounts[0]?.id || 'acc_bca');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  const filteredCategories = categories.filter((c) => c.type === type);

  // Quick chips for amounts
  const quickAmounts = type === 'expense'
    ? [25000, 50000, 100000, 250000, 500000, 1000000]
    : [500000, 1000000, 2500000, 5000000, 10000000, 15000000];

  const quickDescriptions = type === 'expense'
    ? ['Kopi & Cemilan', 'Makan Siang', 'Bensin SPBU', 'Belanja Bulanan', 'Token Listrik PLN', 'Langganan Digital']
    : ['Gaji Bulanan', 'Proyek Freelance', 'Bonus Kinerja', 'Dividen Investasi', 'Cashback & Hadiah'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;

    addTransaction({
      date,
      time: new Date().toTimeString().slice(0, 5),
      amount,
      type,
      categoryId,
      accountId,
      description: description.trim() || (type === 'expense' ? 'Pengeluaran Pribadi' : 'Pemasukan Kas'),
      source: 'manual',
      isConfirmed: true,
      notes: notes.trim() || undefined,
    });

    onClose();
    // reset form
    setDescription('');
    setNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Catat Transaksi Harian</h2>
          <div className="flex items-center gap-2">
            {onOpenScanModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenScanModal();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                title="Pindai nota struk belanjaan otomatis"
              >
                <Camera className="w-3.5 h-3.5 text-emerald-600" />
                <span>Scan Nota Struk</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Segmented Type Control */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                setCategoryId('cat_dining_out');
              }}
              className={`py-2 text-sm font-semibold rounded-lg transition-all ${
                type === 'expense'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pengeluaran
            </button>
            <button
              type="button"
              onClick={() => {
                setType('income');
                setCategoryId('cat_salary');
              }}
              className={`py-2 text-sm font-semibold rounded-lg transition-all ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pemasukan
            </button>
          </div>

          {/* Nominal Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Nominal (Rp)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-lg">
                Rp
              </span>
              <input
                type="number"
                min="1000"
                step="1000"
                required
                value={amount || ''}
                onChange={(e) => setAmount(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-full pl-12 pr-4 py-3 text-2xl font-bold font-mono text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 tabular-nums"
                placeholder="0"
              />
            </div>
            <p className="mt-1 text-xs text-slate-500 font-medium font-mono">
              Terbaca: {formatRupiah(amount)}
            </p>

            {/* Quick Chips */}
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {quickAmounts.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setAmount(q)}
                  className={`text-xs px-2.5 py-1 rounded-md font-mono transition-colors ${
                    amount === q
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  +{q >= 1000000 ? `${q / 1000000}jt` : `${q / 1000}rb`}
                </button>
              ))}
            </div>
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Kategori
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-1">
              {filteredCategories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryId(cat.id)}
                  className={`flex items-center gap-2 p-2 rounded-lg text-left text-xs transition-all border ${
                    categoryId === cat.id
                      ? 'border-emerald-600 bg-emerald-50/50 text-emerald-950 font-semibold ring-1 ring-emerald-600'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div
                    className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${cat.color}18` }}
                  >
                    <CategoryIcon iconName={cat.iconName} color={cat.color} size={14} />
                  </div>
                  <span className="truncate flex-1">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Account & Date in 2 columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Rekening / Dompet
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.accountNumber.slice(0, 8)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Tanggal Transaksi
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Description & Quick Merchant suggestions */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Deskripsi / Toko
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contoh: Makan siang ayam bakar, Bensin Shell..."
              className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <div className="flex flex-wrap gap-1 mt-2">
              {quickDescriptions.map((desc) => (
                <button
                  key={desc}
                  type="button"
                  onClick={() => setDescription(desc)}
                  className="text-2xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800 transition-colors"
                >
                  {desc}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Catatan Tambahan (Opsional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan kecil, invoice ID, atau rekan patungan..."
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Footer Submit */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl transition-all shadow-sm"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Transaksi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
