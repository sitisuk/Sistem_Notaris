import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  ShieldCheck,
  Lock,
  KeyRound,
  LogIn,
  AlertCircle,
  CheckCircle2,
  X,
  Scale,
  Eye,
  EyeOff,
  UserCheck,
} from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { isAdmin, currentUser, isStaffSession, loginWithPasscode, loginWithGoogle, logout } =
    useAuth();

  const [activeTab, setActiveTab] = useState<'PASSCODE' | 'GOOGLE'>('PASSCODE');
  const [passcode, setPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handlePasscodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!passcode.trim()) {
      setErrorMsg('Mohon masukkan kode sandi / PIN staf administrator.');
      return;
    }

    setLoading(true);
    try {
      const valid = await loginWithPasscode(passcode);
      if (valid) {
        onSuccess();
      } else {
        setErrorMsg('Kode sandi tidak sesuai. Silakan gunakan sandi master: notaris2026 atau admin123');
      }
    } catch {
      setErrorMsg('Terjadi kesalahan koneksi server.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSubmit = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      await loginWithGoogle();
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Gagal masuk dengan Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative text-left">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center pb-5 border-b border-slate-800">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-950/50 text-slate-950">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="font-serif text-xl font-bold text-white">
            Autentikasi Administrator
          </h2>
          <p className="text-xs text-amber-400 font-medium mt-0.5">
            Kantor Notaris & PPAT TRI AKHSANUL IMAN, S.H., M.Kn.
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Silakan masuk untuk mengelola berkas pendaftaran, menerbitkan akta, dan mencatat di Buku Repertorium.
          </p>
        </div>

        {/* If user is ALREADY logged in as Admin */}
        {isAdmin ? (
          <div className="py-6 text-center space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-left">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <p className="font-bold text-white text-xs">Sesi Administrator Aktif</p>
                <p className="text-[11px] text-emerald-300">
                  {currentUser ? currentUser.email : 'Sesi Petugas Kantor (Terotentikasi)'}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => {
                  onSuccess();
                  onClose();
                }}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-lg"
              >
                Buka Panel Admin Sekarang
              </button>
              <button
                onClick={async () => {
                  await logout();
                }}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-300 text-xs font-semibold transition-colors border border-slate-700"
              >
                Keluar / Kunci Akses Admin
              </button>
            </div>
          </div>
        ) : (
          /* Normal Login Tabs */
          <div className="py-5">
            {/* Tabs */}
            <div className="flex gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800 mb-5">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('PASSCODE');
                  setErrorMsg('');
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'PASSCODE'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Sandi / PIN Staf</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('GOOGLE');
                  setErrorMsg('');
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'GOOGLE'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Akun Google</span>
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {activeTab === 'PASSCODE' ? (
              <form onSubmit={handlePasscodeSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Masukkan Kode Sandi Akses Petugas Notaris:
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Masukkan kode sandi..."
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                      autoFocus
                      className="w-full px-4 py-2.5 pr-10 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="mt-2.5 p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
                    <KeyRound className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      Sandi Master Petugas Kantor:{' '}
                      <strong className="text-amber-300 font-mono">notaris2026</strong> atau{' '}
                      <strong className="text-amber-300 font-mono">admin123</strong>
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-lg shadow-amber-950/40"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{loading ? 'Memverifikasi...' : 'Masuk Panel Admin'}</span>
                </button>
              </form>
            ) : (
              <div className="space-y-4 text-center">
                <p className="text-xs text-slate-300 leading-relaxed">
                  Masuk menggunakan akun Google terdaftar. Akun email pembuat{' '}
                  <span className="text-amber-300 font-mono font-semibold">sitisukaesih906@gmail.com</span> otomatis memiliki hak akses penuh sebagai Super Administrator.
                </p>

                <button
                  type="button"
                  onClick={handleGoogleSubmit}
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-lg"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>{loading ? 'Menghubungkan...' : 'Masuk dengan Google'}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
