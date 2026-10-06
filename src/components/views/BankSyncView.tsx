import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatRupiah } from '../../services/analyticsService';
import { autoCategorizeDescription } from '../../services/bankSyncService';
import { CategoryIcon } from '../CategoryIcon';
import {
  Wallet,
  RefreshCw,
  Plus,
  ShieldCheck,
  UploadCloud,
  CheckCircle2,
  Trash2,
  Lock,
  Cpu,
  Info,
} from 'lucide-react';

interface BankSyncViewProps {
  onOpenSyncModal: () => void;
  onOpenImportModal: () => void;
}

export const BankSyncView: React.FC<BankSyncViewProps> = ({
  onOpenSyncModal,
  onOpenImportModal,
}) => {
  const {
    accounts,
    rules,
    categories,
    syncAccount,
    disconnectAccount,
    toggleAutoSync,
    addRule,
    deleteRule,
  } = useFinance();

  const [syncingId, setSyncingId] = useState<string | null>(null);

  // New rule form
  const [newKeyword, setNewKeyword] = useState('');
  const [newRuleCatId, setNewRuleCatId] = useState(categories[0]?.id || 'cat_food_grocery');

  // Rule test input
  const [testDesc, setTestDesc] = useState('QRIS KOPI KENANGAN JAKARTA');

  const handleSyncSingle = async (accountId: string) => {
    setSyncingId(accountId);
    await syncAccount(accountId);
    setSyncingId(null);
  };

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyword.trim()) return;
    addRule(newKeyword.trim(), newRuleCatId);
    setNewKeyword('');
  };

  const detectedTestCategory = autoCategorizeDescription(testDesc, rules);
  const matchedTestCategory = categories.find((c) => c.id === detectedTestCategory);

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Pusat Sinkronisasi Bank & E-Wallet
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola koneksi perbankan otomatis, impor berkas mutasi rekening, dan aturan kategorisasi pintar
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenImportModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-sky-800 bg-sky-50 border border-sky-200 rounded-xl hover:bg-sky-100 transition-colors"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Berkas Mutasi</span>
          </button>

          <button
            onClick={onOpenSyncModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>+ Hubungkan Bank Baru</span>
          </button>
        </div>
      </div>

      {/* Security Certification Banner */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-slate-900">Protokol Keamanan Open Banking Terenkripsi</p>
            <p className="text-2xs text-slate-500 mt-0.5">
              Standar Nasional Open API Pembayaran (SNAP BI) · Enkripsi End-to-End AES-256 · Akses Hanya Baca (Read-Only)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-2xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 shrink-0">
          <Lock className="w-3.5 h-3.5" />
          <span>Koneksi Aman Terjamin</span>
        </div>
      </div>

      {/* Grid of Bank Cards */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 mb-3">
          Rekening & Dompet Digital Aktif ({accounts.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((acc) => {
            const isSyncing = syncingId === acc.id || acc.syncStatus === 'syncing';

            return (
              <div
                key={acc.id}
                className="relative rounded-2xl p-5 border border-slate-200/80 bg-white shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between overflow-hidden group"
              >
                {/* Accent Top Bar */}
                <div
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{ backgroundColor: acc.color }}
                />

                {/* Top Details */}
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-2xs font-bold uppercase tracking-wider text-slate-400">
                        {acc.type === 'ewallet' ? 'Dompet Digital' : acc.type === 'cash' ? 'Kas Fisik' : 'Rekening Tabungan'}
                      </span>
                      <h4 className="text-base font-bold text-slate-900 mt-0.5">{acc.name}</h4>
                    </div>

                    <div
                      className="w-10 h-8 rounded-lg flex items-center justify-center font-bold text-white text-xs shadow-2xs shrink-0"
                      style={{ backgroundColor: acc.color }}
                    >
                      {acc.name.slice(0, 3)}
                    </div>
                  </div>

                  <p className="font-mono text-xs text-slate-500 mt-2">
                    {acc.accountNumber}
                  </p>

                  <div className="mt-4">
                    <p className="text-2xs text-slate-400">Saldo Terakhir</p>
                    <p className="text-xl font-bold font-mono text-slate-900 tabular-nums">
                      {formatRupiah(acc.balance)}
                    </p>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-5 pt-4 border-t border-slate-100 space-y-2.5">
                  <div className="flex items-center justify-between text-2xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>{acc.syncStatus === 'connected' ? 'Terhubung' : 'Siap'}</span>
                    </div>

                    {acc.type !== 'cash' && (
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <span>Auto-Sync</span>
                        <input
                          type="checkbox"
                          checked={acc.isAutoSync}
                          onChange={() => toggleAutoSync(acc.id)}
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                      </label>
                    )}
                  </div>

                  {acc.type !== 'cash' ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSyncSingle(acc.id)}
                        disabled={isSyncing}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 disabled:opacity-50 transition-colors"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-emerald-600' : ''}`} />
                        <span>{isSyncing ? 'Menarik...' : 'Tarik Mutasi'}</span>
                      </button>

                      <button
                        onClick={() => disconnectAccount(acc.id)}
                        title="Putuskan Rekening"
                        className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-2xs text-slate-400 py-1.5 text-center bg-slate-50 rounded-xl">
                      Pencatatan Tunai Manual
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2-Column Section: Auto-Categorization Rule Engine & Testing Tool */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2 cols): Rule Engine List & Add Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-5">
          <div>
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900">
                Aturan Kategorisasi Mutasi Otomatis (Rule Engine)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Saat mutasi ditarik dari bank, sistem mencocokkan kata kunci pada keterangan mutasi dengan kategori yang Anda tetapkan.
            </p>
          </div>

          {/* Add Rule Form */}
          <form
            onSubmit={handleCreateRule}
            className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-stretch sm:items-end gap-3"
          >
            <div className="flex-1">
              <label className="block text-2xs font-semibold uppercase text-slate-500 mb-1">
                Jika Keterangan Mengandung Kata
              </label>
              <input
                type="text"
                required
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                placeholder="Contoh: MCDONALD, KRL, SPOTIFY, TOKOPEDIA..."
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-mono uppercase"
              />
            </div>

            <div className="flex-1">
              <label className="block text-2xs font-semibold uppercase text-slate-500 mb-1">
                Kategorikan Sebagai
              </label>
              <select
                value={newRuleCatId}
                onChange={(e) => setNewRuleCatId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-2xs shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Aturan</span>
            </button>
          </form>

          {/* Rules List */}
          <div>
            <p className="text-xs font-bold text-slate-700 mb-2">
              Daftar Aturan Aktif ({rules.length})
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
              {rules.map((rule) => {
                const cat = categories.find((c) => c.id === rule.categoryId);

                return (
                  <div
                    key={rule.id}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-white hover:border-slate-200 transition-colors text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-2xs truncate">
                        "{rule.keyword}"
                      </span>
                      <span className="text-slate-400">→</span>
                      <div className="flex items-center gap-1.5 truncate">
                        {cat && (
                          <CategoryIcon iconName={cat.iconName} color={cat.color} size={12} />
                        )}
                        <span className="truncate text-slate-700 font-medium text-2xs">
                          {cat?.name || 'Kategori'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => deleteRule(rule.id)}
                      title="Hapus aturan"
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right (1 col): Rule Testing Simulator */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-sky-600" />
            <h3 className="text-sm font-bold text-slate-900">Uji Coba Deteksi Mutasi</h3>
          </div>
          <p className="text-xs text-slate-500">
            Ketik contoh teks mutasi bank untuk melihat bagaimana sistem mengkategorikannya secara instan:
          </p>

          <div>
            <label className="block text-2xs font-semibold text-slate-500 mb-1">
              Teks Keterangan Mutasi Bank
            </label>
            <input
              type="text"
              value={testDesc}
              onChange={(e) => setTestDesc(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 font-mono"
            />
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <p className="text-2xs uppercase tracking-wider font-semibold text-slate-400">
              Hasil Deteksi Sistem
            </p>
            {matchedTestCategory ? (
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${matchedTestCategory.color}20` }}
                >
                  <CategoryIcon
                    iconName={matchedTestCategory.iconName}
                    color={matchedTestCategory.color}
                    size={16}
                  />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">{matchedTestCategory.name}</p>
                  <p className="text-2xs text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Kategori Terhubung Otomatis</span>
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">Tidak ada kecocokan khusus (Default)</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
