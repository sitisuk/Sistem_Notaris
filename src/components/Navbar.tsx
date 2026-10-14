import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  Scale,
  FileText,
  Search,
  Calculator,
  ShieldCheck,
  LogIn,
  LogOut,
  Menu,
  X,
  PhoneCall,
  UserCheck,
  Building2,
  Bookmark,
} from 'lucide-react';
import { SaveAppModal } from './SaveAppModal.tsx';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openAdminMode: boolean;
  setOpenAdminMode: (val: boolean) => void;
  onOpenAdminLogin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  openAdminMode,
  setOpenAdminMode,
  onOpenAdminLogin,
}) => {
  const { currentUser, loginWithGoogle, logout, isAdmin, userRole } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const navItems = [
    { id: 'home', label: 'Beranda', icon: Building2 },
    { id: 'services', label: 'Layanan & Akta', icon: Scale },
    { id: 'register', label: 'Pendaftaran Akta', icon: FileText, highlight: true },
    { id: 'track', label: 'Lacak Berkas', icon: Search },
    { id: 'calculator', label: 'Simulasi Biaya', icon: Calculator },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100 shadow-lg">
      {/* Top Banner - Legal credential status */}
      <div className="bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 py-1 px-4 text-xs font-medium text-amber-50 text-center tracking-wide flex items-center justify-center gap-3">
        <span className="flex items-center gap-1.5 font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-200" />
          Kemenkumham RI: AHU-00382.AH.02.01
        </span>
        <span className="hidden md:inline text-amber-300">•</span>
        <span className="hidden md:inline">SK Kepala ATR/BPN RI: No. 9-XVII-PPAT-2008 Tgl 01-09-2008</span>
        <span className="hidden lg:inline text-amber-300">•</span>
        <span className="hidden lg:inline">Wilayah Kerja: Kab. Bekasi & Jawa Barat</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo and Brand */}
          <div
            onClick={() => {
              setActiveTab('home');
              setOpenAdminMode(false);
            }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-md shadow-amber-900/40 text-slate-950 font-bold group-hover:scale-105 transition-transform">
              <Scale className="w-7 h-7 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg font-bold tracking-tight text-white group-hover:text-amber-400 transition-colors">
                  TRI AKHSANUL IMAN, S.H., M.Kn.
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold uppercase tracking-wider">
                  Notaris & PPAT
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Kabupaten Bekasi • Sistem Pendaftaran Akta Terpadu
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id && !openAdminMode;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setOpenAdminMode(false);
                  }}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    item.highlight
                      ? 'bg-amber-600 hover:bg-amber-500 text-slate-950 font-semibold shadow-sm shadow-amber-600/30'
                      : isActive
                      ? 'bg-slate-800 text-amber-400 border border-slate-700 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${item.highlight ? 'text-slate-950' : isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}

            {/* Admin Portal Toggle Button */}
            <button
              onClick={() => {
                if (isAdmin) {
                  setOpenAdminMode(!openAdminMode);
                } else {
                  onOpenAdminLogin();
                }
              }}
              className={`flex items-center gap-2 ml-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all border ${
                openAdminMode
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-900/30 ring-2 ring-indigo-400/30'
                  : isAdmin
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/50 hover:bg-emerald-900/60'
                  : 'bg-slate-800/80 text-amber-300 border-amber-500/40 hover:bg-slate-800'
              }`}
              title={isAdmin ? 'Buka Panel Administrator' : 'Login Administrator'}
            >
              <ShieldCheck className={`w-4 h-4 ${isAdmin ? 'text-emerald-400' : 'text-amber-400'}`} />
              <span>{isAdmin ? 'Panel Admin' : 'Login Admin'}</span>
              {isAdmin && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>
          </nav>

          {/* User Auth & Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-1.5">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User'}
                    className="w-7 h-7 rounded-full border border-amber-500/50 object-cover"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-amber-600 text-slate-950 flex items-center justify-center font-bold text-xs">
                    {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div className="text-left max-w-[130px]">
                  <p className="text-xs font-semibold text-white truncate">
                    {currentUser.displayName || currentUser.email?.split('@')[0]}
                  </p>
                  <p className="text-[10px] text-amber-400 flex items-center gap-1 font-medium">
                    <UserCheck className="w-2.5 h-2.5" />
                    {userRole === 'admin' ? 'Administrator' : 'Klien'}
                  </p>
                </div>
                <button
                  onClick={logout}
                  title="Keluar dari akun"
                  className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-700/50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogin}
                disabled={isLoggingIn}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-medium transition-colors"
              >
                <LogIn className="w-4 h-4 text-amber-400" />
                <span>{isLoggingIn ? 'Memproses...' : 'Masuk Google'}</span>
              </button>
            )}

            <button
              onClick={() => setSaveModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 text-xs font-semibold transition-colors"
              title="Cara menyimpan dan membuka aplikasi kapan saja"
            >
              <Bookmark className="w-3.5 h-3.5 text-amber-400" />
              <span>Simpan / Buka App</span>
            </button>

            <a
              href="https://wa.me/6281223456789?text=Halo%20Kantor%20Notaris%20TRI%20AKHSANUL%20IMAN,%20saya%20ingin%20konsultasi%20akta"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 text-xs font-semibold transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
              <span>Hotline Notaris</span>
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={() => {
                if (isAdmin) {
                  setOpenAdminMode(!openAdminMode);
                } else {
                  onOpenAdminLogin();
                }
              }}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1 border ${
                openAdminMode
                  ? 'bg-indigo-600 text-white border-indigo-400'
                  : isAdmin
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/50'
                  : 'bg-slate-800 text-amber-300 border-amber-500/40'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isAdmin ? 'Admin' : 'Login'}</span>
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id && !openAdminMode;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setOpenAdminMode(false);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
                  item.highlight
                    ? 'bg-amber-600 text-slate-950 font-bold'
                    : isActive
                    ? 'bg-slate-800 text-amber-400'
                    : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}

          <div className="pt-4 border-t border-slate-800 flex flex-col gap-2">
            {currentUser ? (
              <div className="flex items-center justify-between bg-slate-800 p-3 rounded-xl">
                <div>
                  <p className="text-sm font-semibold text-white">{currentUser.displayName || currentUser.email}</p>
                  <p className="text-xs text-amber-400 font-medium">{userRole === 'admin' ? 'Administrator' : 'Klien'}</p>
                </div>
                <button
                  onClick={logout}
                  className="px-3 py-1.5 rounded-lg bg-rose-600/20 text-rose-300 text-xs font-semibold hover:bg-rose-600/30"
                >
                  Keluar
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogin}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm border border-slate-700"
              >
                <LogIn className="w-4 h-4 text-amber-400" />
                Masuk dengan Google
              </button>
            )}
          </div>
        </div>
      )}

      {/* Save & Access Application Guide Modal */}
      <SaveAppModal isOpen={saveModalOpen} onClose={() => setSaveModalOpen(false)} />
    </header>
  );
};
