import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import {
  googleSignIn,
  googleLogout,
  initAuth,
  getAccessToken,
} from '../services/googleAuthService';
import {
  createFinanceSpreadsheet,
  syncAllTransactionsToSheet,
  listDriveSpreadsheets,
  DriveSpreadsheetFile,
} from '../services/googleSheetsService';
import { User } from 'firebase/auth';
import {
  FileSpreadsheet,
  X,
  ExternalLink,
  CheckCircle2,
  RefreshCw,
  Plus,
  Loader2,
  AlertTriangle,
  FolderOpen,
  LogOut,
  ShieldCheck,
} from 'lucide-react';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface LinkedSheet {
  id: string;
  name: string;
  url: string;
  lastSyncedAt: string;
  autoSync: boolean;
}

const STORAGE_KEY_LINKED_SHEET = 'arthaku_linked_spreadsheet_v1';

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({ isOpen, onClose }) => {
  const { transactions, categories, accounts, showToast } = useFinance();

  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [linkedSheet, setLinkedSheet] = useState<LinkedSheet | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_LINKED_SHEET);
    return saved ? JSON.parse(saved) : null;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [driveFiles, setDriveFiles] = useState<DriveSpreadsheetFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [newSheetTitle, setNewSheetTitle] = useState('ArthaKu - Pembukuan Keuangan 2026');

  // Confirmation dialog state for mutating / overwriting Google Sheet
  const [showConfirmSync, setShowConfirmSync] = useState(false);

  // Initialize auth state
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, currentToken) => {
        setUser(currentUser);
        setToken(currentToken);
      },
      () => {
        setUser(null);
        setToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Save linked sheet changes
  useEffect(() => {
    if (linkedSheet) {
      localStorage.setItem(STORAGE_KEY_LINKED_SHEET, JSON.stringify(linkedSheet));
    } else {
      localStorage.removeItem(STORAGE_KEY_LINKED_SHEET);
    }
  }, [linkedSheet]);

  // Load drive spreadsheets when tab opens and token is present
  useEffect(() => {
    if (isOpen && token) {
      loadDriveFiles(token);
    }
  }, [isOpen, token]);

  if (!isOpen) return null;

  const handleSignIn = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        showToast('Berhasil terhubung dengan Google Workspace & Sheets!');
        loadDriveFiles(result.accessToken);
      }
    } catch (err: any) {
      console.error('Sign in failed:', err);
      showToast(err.message || 'Gagal masuk dengan Google', 'error');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await googleLogout();
    setUser(null);
    setToken(null);
    showToast('Telah keluar dari akun Google', 'info');
  };

  const loadDriveFiles = async (activeToken: string) => {
    setIsLoadingFiles(true);
    try {
      const files = await listDriveSpreadsheets(activeToken);
      setDriveFiles(files);
    } catch (err: any) {
      console.error('Failed to load drive files:', err);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleCreateNewSheet = async (e: React.FormEvent) => {
    e.preventDefault();
    const activeToken = token || (await getAccessToken());
    if (!activeToken) {
      showToast('Silakan masuk dengan akun Google terlebih dahulu', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const result = await createFinanceSpreadsheet(
        activeToken,
        newSheetTitle.trim() || 'ArthaKu - Pembukuan Keuangan',
        transactions,
        categories,
        accounts
      );

      const newLinked: LinkedSheet = {
        id: result.spreadsheetId,
        name: result.title,
        url: result.spreadsheetUrl,
        lastSyncedAt: new Date().toISOString(),
        autoSync: true,
      };

      setLinkedSheet(newLinked);
      showToast('Google Spreadsheet baru berhasil dibuat dan disinkronkan!');
    } catch (err: any) {
      console.error('Failed to create sheet:', err);
      showToast(err.message || 'Gagal membuat Google Spreadsheet', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkExistingSheet = (file: DriveSpreadsheetFile) => {
    const newLinked: LinkedSheet = {
      id: file.id,
      name: file.name,
      url: file.webViewLink || `https://docs.google.com/spreadsheets/d/${file.id}/edit`,
      lastSyncedAt: new Date().toISOString(),
      autoSync: true,
    };
    setLinkedSheet(newLinked);
    showToast(`Spreadsheet "${file.name}" berhasil ditautkan.`);
  };

  const handleExecuteFullSync = async () => {
    setShowConfirmSync(false);
    if (!linkedSheet) return;

    const activeToken = token || (await getAccessToken());
    if (!activeToken) {
      showToast('Sesi Google kedaluwarsa, silakan hubungkan ulang akun Google', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await syncAllTransactionsToSheet(
        activeToken,
        linkedSheet.id,
        transactions,
        categories,
        accounts
      );

      setLinkedSheet({
        ...linkedSheet,
        lastSyncedAt: new Date().toISOString(),
      });
      showToast(`Berhasil menyinkronkan ${transactions.length} transaksi ke Google Sheets!`);
    } catch (err: any) {
      console.error('Sync failed:', err);
      showToast(err.message || 'Gagal menyinkronkan data ke Google Sheets', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Integrasi Google Sheets</h2>
              <p className="text-2xs text-slate-500">Sinkronisasi pembukuan & laporan otomatis ke spreadsheet Google</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Step 1: Authentication State */}
          {!user ? (
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-white shadow-2xs flex items-center justify-center mx-auto border border-slate-200">
                <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Hubungkan Akun Google Anda</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Masuk dengan akun Google untuk mengekspor data transaksi harian langsung ke Google Sheets secara aman.
                </p>
              </div>

              {/* Official Google GSI Material Button */}
              <div className="pt-2 flex justify-center">
                <button
                  type="button"
                  onClick={handleSignIn}
                  disabled={isLoggingIn}
                  className="flex items-center justify-center gap-3 px-5 py-2.5 bg-white border border-slate-300 rounded-xl shadow-xs hover:shadow-sm hover:bg-slate-50 transition-all text-xs font-semibold text-slate-700 disabled:opacity-50"
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                      <span>Menghubungkan Akun...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" viewBox="0 0 48 48">
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                      </svg>
                      <span>Masuk dengan Google (Sign in with Google)</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-3xs text-slate-500 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Izin resmi: Google Drive & Google Sheets API</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-3">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'User'} className="w-9 h-9 rounded-full border border-slate-300" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                    {(user.displayName || user.email || 'A')[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-xs font-bold text-slate-900">{user.displayName || 'Akun Google'}</p>
                  <p className="text-2xs text-slate-500 font-mono">{user.email}</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-2xs font-semibold text-slate-600 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                title="Keluar akun"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar</span>
              </button>
            </div>
          )}

          {/* Step 2: Linked Sheet Card */}
          {user && linkedSheet && (
            <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-3xs uppercase font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    Spreadsheet Aktif Ditautkan
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mt-1">{linkedSheet.name}</h3>
                  <p className="text-2xs text-slate-500 mt-0.5">
                    Terakhir sinkronisasi: {new Date(linkedSheet.lastSyncedAt).toLocaleTimeString('id-ID')}
                  </p>
                </div>

                <a
                  href={linkedSheet.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-white border border-emerald-300 rounded-xl hover:bg-emerald-50 transition-colors shadow-2xs"
                >
                  <span>Buka Sheet</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-emerald-100">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={linkedSheet.autoSync}
                    onChange={(e) => setLinkedSheet({ ...linkedSheet, autoSync: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Auto-Sync Transaksi Baru</span>
                </label>

                <button
                  type="button"
                  onClick={() => setShowConfirmSync(true)}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-50 shadow-2xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Sinkronkan Sekarang</span>
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Create New Google Sheet */}
          {user && (
            <form onSubmit={handleCreateNewSheet} className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-bold text-slate-900">Buat Google Spreadsheet Baru</h4>
              </div>

              <div>
                <label className="block text-2xs font-semibold text-slate-500 mb-1">
                  Nama Dokumen Spreadsheet
                </label>
                <input
                  type="text"
                  required
                  value={newSheetTitle}
                  onChange={(e) => setNewSheetTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-xs"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Membuat Spreadsheet di Google Drive...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Buat Spreadsheet & Ekspor Semua Transaksi</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Step 4: Pick Existing from Google Drive */}
          {user && driveFiles.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <FolderOpen className="w-4 h-4 text-slate-500" />
                  <span>Atau Pilih Dokumen dari Google Drive:</span>
                </div>
                {isLoadingFiles && <Loader2 className="w-3 h-3 animate-spin text-slate-400" />}
              </div>

              <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-40 overflow-y-auto">
                {driveFiles.map((file) => (
                  <div
                    key={file.id}
                    className="p-2.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-xs"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="font-semibold text-slate-900 truncate">{file.name}</p>
                      <p className="text-3xs text-slate-400">
                        Diubah: {new Date(file.modifiedTime).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleLinkExistingSheet(file)}
                      className="px-2.5 py-1 text-2xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg shrink-0 transition-colors"
                    >
                      Tautkan
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 bg-slate-50/50 shrink-0">
          <span className="text-2xs text-slate-400">Format kompatibel dengan Google Sheets API v4</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            Tutup
          </button>
        </div>
      </div>

      {/* Mandatory User Confirmation Dialog before mutating/overwriting Google Sheet data */}
      {showConfirmSync && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl border border-slate-100">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Konfirmasi Sinkronisasi Data</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Tindakan ini akan memperbarui dan menyinkronkan <strong>{transactions.length} baris transaksi</strong> ke spreadsheet <strong>"{linkedSheet?.name}"</strong>. Apakah Anda ingin melanjutkan?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowConfirmSync(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteFullSync}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs"
              >
                Ya, Sinkronkan Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
