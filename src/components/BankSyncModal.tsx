import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { BankMetadata, SUPPORTED_BANKS } from '../services/bankSyncService';
import { X, ShieldCheck, CheckCircle2, Lock, ArrowRight, Loader2 } from 'lucide-react';

interface BankSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BankSyncModal: React.FC<BankSyncModalProps> = ({ isOpen, onClose }) => {
  const { connectAccount } = useFinance();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedBank, setSelectedBank] = useState<BankMetadata>(SUPPORTED_BANKS[0]);
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [accountHolder, setAccountHolder] = useState<string>('Ahmad Fadillah');
  const [initialBalance, setInitialBalance] = useState<number>(5000000);
  const [otpCode, setOtpCode] = useState<string>('829104');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSelectBank = (bank: BankMetadata) => {
    setSelectedBank(bank);
    setStep(2);
  };

  const handleProceedToOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountNumber) return;
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setStep(3);
    }, 900);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      connectAccount({
        name: `${selectedBank.name} ${accountNumber.slice(-4) ? `(..${accountNumber.slice(-4)})` : 'Utama'}`,
        bankCode: selectedBank.code,
        accountNumber,
        accountHolder,
        type: selectedBank.type,
        balance: initialBalance,
        isAutoSync: true,
        color: selectedBank.color,
      });
      setStep(4);
    }, 1200);
  };

  const handleDone = () => {
    setStep(1);
    setAccountNumber('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Hubungkan Rekening Bank</h2>
              <p className="text-2xs text-slate-500">Koneksi Aman Terenkripsi AES-256 Open Banking</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="px-6 pt-4 pb-2">
          <div className="flex items-center justify-between text-2xs font-semibold text-slate-500 mb-2">
            <span className={step >= 1 ? 'text-emerald-700 font-bold' : ''}>1. Pilih Bank</span>
            <span className={step >= 2 ? 'text-emerald-700 font-bold' : ''}>2. Autentikasi</span>
            <span className={step >= 3 ? 'text-emerald-700 font-bold' : ''}>3. Verifikasi OTP</span>
            <span className={step >= 4 ? 'text-emerald-700 font-bold' : ''}>4. Terhubung</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-600 h-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Select Bank */}
        {step === 1 && (
          <div className="p-6">
            <p className="text-xs text-slate-600 mb-4 font-medium">
              Pilih bank mitra atau dompet digital untuk sinkronisasi mutasi transaksi harian otomatis:
            </p>
            <div className="grid grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
              {SUPPORTED_BANKS.map((bank) => (
                <button
                  key={bank.code}
                  type="button"
                  onClick={() => handleSelectBank(bank)}
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all text-left group"
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-white text-xs shrink-0"
                    style={{ backgroundColor: bank.color }}
                  >
                    {bank.name.slice(0, 3)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-800 transition-colors truncate">
                      {bank.name}
                    </p>
                    <p className="text-2xs text-slate-500 capitalize">{bank.type}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-5 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2 text-2xs text-slate-600">
              <Lock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                Data login Anda tidak pernah disimpan dalam server kami. Kami menggunakan protokol API read-only resmi standar SNAP BI (Standar Nasional Open API Pembayaran).
              </span>
            </div>
          </div>
        )}

        {/* Step 2: Credentials & Account details */}
        {step === 2 && (
          <form onSubmit={handleProceedToOtp} className="p-6 space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-xs shrink-0"
                style={{ backgroundColor: selectedBank.color }}
              >
                {selectedBank.name.slice(0, 3)}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">{selectedBank.fullName}</p>
                <p className="text-2xs text-slate-500">Metode: {selectedBank.authMethod}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nomor Rekening / No. HP Terdaftar
              </label>
              <input
                type="text"
                required
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder={selectedBank.accountFormatPlaceholder}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Pemilik Rekening
              </label>
              <input
                type="text"
                required
                value={accountHolder}
                onChange={(e) => setAccountHolder(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Perkiraan Saldo Awal Saat Ini (Rp)
              </label>
              <input
                type="number"
                min="0"
                step="50000"
                required
                value={initialBalance}
                onChange={(e) => setInitialBalance(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Kembali
              </button>
              <button
                type="submit"
                disabled={isVerifying}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl disabled:opacity-50"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Menghubungi Bank...</span>
                  </>
                ) : (
                  <>
                    <span>Kirim Kode OTP</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Step 3: OTP Verification */}
        {step === 3 && (
          <form onSubmit={handleVerifyOtp} className="p-6 space-y-4">
            <div className="text-center py-2">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Verifikasi Keamanan Perbankan</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Kode OTP 6-digit telah dikirimkan ke perangkat mobile terdaftar Anda untuk otorisasi sinkronisasi data mutasi {selectedBank.name}.
              </p>
            </div>

            <div>
              <label className="block text-center text-xs font-semibold text-slate-600 mb-2">
                Masukkan Kode OTP
              </label>
              <input
                type="text"
                maxLength={6}
                required
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="w-48 mx-auto block text-center tracking-widest text-2xl font-bold font-mono py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-center text-2xs text-slate-400 mt-1.5">
                Simulasi OTP otomatis terisi: 829104
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Kembali
              </button>
              <button
                type="submit"
                disabled={isVerifying}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl disabled:opacity-50"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifikasi Otorisasi...</span>
                  </>
                ) : (
                  <>
                    <span>Verifikasi & Hubungkan</span>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Step 4: Success Handshake */}
        {step === 4 && (
          <div className="p-6 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Rekening Berhasil Dihubungkan!</h3>
              <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                Sinkronisasi otomatis aktif untuk <strong>{selectedBank.name}</strong>. Anda dapat menarik mutasi kapan saja dengan sekali klik.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleDone}
                className="w-full py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-sm"
              >
                Selesai & Buka Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
