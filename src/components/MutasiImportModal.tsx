import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatRupiah } from '../services/analyticsService';
import { ParsedCsvResult } from '../services/bankSyncService';
import { CategoryIcon } from './CategoryIcon';
import { X, UploadCloud, CheckCircle2, FileText, AlertCircle, Sparkles } from 'lucide-react';

interface MutasiImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SAMPLE_BCA_CSV = `"TANGGAL","KETERANGAN","MUTASI","SALDO"
"06/10/2026","QRIS FORE COFFEE KUNINGAN","38000,00 DB","14712000,00"
"06/10/2026","TRSF CR TRANSFER DARI AHMAD KELUARGA","250000,00 CR","14750000,00"
"05/10/2026","SPBU SHELL GATOT SUBROTO","200000,00 DB","14500000,00"
"05/10/2026","QRIS INDOMARET POINT TEBET","54200,00 DB","14700000,00"
"04/10/2026","AUTO DEBET SPOTIFY ABONEMEN","65000,00 DB","14754200,00"`;

export const MutasiImportModal: React.FC<MutasiImportModalProps> = ({ isOpen, onClose }) => {
  const { accounts, categories, importMutasiText, batchAddTransactions } = useFinance();

  const [targetAccountId, setTargetAccountId] = useState<string>(accounts[0]?.id || 'acc_bca');
  const [csvContent, setCsvContent] = useState<string>('');
  const [parsedResult, setParsedResult] = useState<ParsedCsvResult | null>(null);

  if (!isOpen) return null;

  const handleParse = (textToParse: string) => {
    setCsvContent(textToParse);
    if (!textToParse.trim()) {
      setParsedResult(null);
      return;
    }
    const result = importMutasiText(textToParse, targetAccountId);
    setParsedResult(result);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        handleParse(text);
      }
    };
    reader.readAsText(file);
  };

  const handleLoadSample = () => {
    handleParse(SAMPLE_BCA_CSV);
  };

  const handleImportSubmit = () => {
    if (!parsedResult || parsedResult.transactions.length === 0) return;

    const balanceAdjustment = parsedResult.totalIncome - parsedResult.totalExpense;
    batchAddTransactions(parsedResult.transactions, balanceAdjustment, targetAccountId);
    onClose();
    setCsvContent('');
    setParsedResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center text-sky-700">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Import Mutasi Rekening (CSV / Text)</h2>
              <p className="text-2xs text-slate-500">Mendukung format KlikBCA, Livin Mandiri, BRImo & CSV umum</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Target Account Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Masukkan ke Rekening Tujuan
            </label>
            <select
              value={targetAccountId}
              onChange={(e) => setTargetAccountId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} - ({acc.accountNumber})
                </option>
              ))}
            </select>
          </div>

          {/* Upload or Sample button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1">
            <div className="relative">
              <input
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                id="file-upload-input"
                className="hidden"
              />
              <label
                htmlFor="file-upload-input"
                className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors shadow-2xs"
              >
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>Pilih File CSV Mutasi</span>
              </label>
            </div>

            <button
              type="button"
              onClick={handleLoadSample}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-sky-700 bg-sky-50 border border-sky-200 rounded-lg hover:bg-sky-100 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gunakan Contoh Format Mutasi BCA</span>
            </button>
          </div>

          {/* Text Area */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Atau Tempel (Paste) Isi Mutasi Rekening:
            </label>
            <textarea
              rows={4}
              value={csvContent}
              onChange={(e) => handleParse(e.target.value)}
              placeholder="Tempel baris mutasi bank Anda di sini (misal: 06/10/2026, QRIS INDOMARET, 54000 DB)..."
              className="w-full p-3 font-mono text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 leading-relaxed"
            />
          </div>

          {/* Parsed Preview Table */}
          {parsedResult && parsedResult.transactions.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between p-3 rounded-xl bg-sky-50/70 border border-sky-100 text-xs">
                <div>
                  <span className="font-semibold text-slate-900">{parsedResult.totalParsed} transaksi terdeteksi</span>
                  <span className="text-slate-500 ml-2">
                    (Pengeluaran: {formatRupiah(parsedResult.totalExpense)} · Pemasukan: {formatRupiah(parsedResult.totalIncome)})
                  </span>
                </div>
                <span className="font-medium text-sky-700 bg-sky-100 px-2 py-0.5 rounded text-2xs">
                  Auto-Categorized
                </span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-semibold sticky top-0">
                    <tr>
                      <th className="p-2.5">Tanggal</th>
                      <th className="p-2.5">Deskripsi</th>
                      <th className="p-2.5">Kategori Otomatis</th>
                      <th className="p-2.5 text-right">Nominal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {parsedResult.transactions.map((tx, idx) => {
                      const cat = categories.find((c) => c.id === tx.categoryId);
                      return (
                        <tr key={idx} className="hover:bg-slate-50/70">
                          <td className="p-2.5 font-mono text-slate-500 text-2xs whitespace-nowrap">
                            {tx.date}
                          </td>
                          <td className="p-2.5 text-slate-900 font-medium max-w-xs truncate">
                            {tx.description}
                          </td>
                          <td className="p-2.5">
                            {cat ? (
                              <div className="flex items-center gap-1.5 text-2xs text-slate-700">
                                <CategoryIcon iconName={cat.iconName} color={cat.color} size={12} />
                                <span className="truncate">{cat.name}</span>
                              </div>
                            ) : (
                              <span className="text-2xs text-slate-400">Lainnya</span>
                            )}
                          </td>
                          <td
                            className={`p-2.5 text-right font-mono font-semibold tabular-nums text-2xs ${
                              tx.type === 'expense' ? 'text-rose-600' : 'text-emerald-600'
                            }`}
                          >
                            {tx.type === 'expense' ? '-' : '+'}
                            {formatRupiah(tx.amount)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {parsedResult && parsedResult.transactions.length === 0 && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-800">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Format tidak dikenali. Pastikan teks mutasi mengandung tanggal, keterangan, dan nominal debit/kredit.
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={!parsedResult || parsedResult.transactions.length === 0}
            onClick={handleImportSubmit}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl disabled:opacity-40 transition-colors shadow-xs"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Impor {parsedResult?.totalParsed || 0} Transaksi ke Rekening</span>
          </button>
        </div>
      </div>
    </div>
  );
};
