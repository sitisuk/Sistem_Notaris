import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { HeroSection } from './components/HeroSection.tsx';
import { ServicesSection } from './components/ServicesSection.tsx';
import { RegistrationForm } from './components/RegistrationForm.tsx';
import { TrackingSection } from './components/TrackingSection.tsx';
import { CalculatorSection } from './components/CalculatorSection.tsx';
import { AdminPortal } from './components/AdminPortal.tsx';
import { ReceiptModal } from './components/ReceiptModal.tsx';
import { AdminLoginModal } from './components/AdminLoginModal.tsx';
import { Footer } from './components/Footer.tsx';
import { Service, Registration } from './types/notary.ts';
import {
  FileText,
  Search,
  Scale,
  Building,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';

function MainApp() {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('home');
  const [openAdminMode, setOpenAdminMode] = useState<boolean>(false);
  const [adminLoginModalOpen, setAdminLoginModalOpen] = useState<boolean>(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [trackCode, setTrackCode] = useState<string>('');
  const [receiptRegistration, setReceiptRegistration] = useState<Registration | null>(null);

  const handleSelectService = (service: Service) => {
    setSelectedService(service);
    setActiveTab('register');
    setOpenAdminMode(false);
  };

  const handleQuickTrack = (code: string) => {
    setTrackCode(code);
    setActiveTab('track');
    setOpenAdminMode(false);
  };

  const handleSuccessTrack = (regNumber: string) => {
    setTrackCode(regNumber);
    setActiveTab('track');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openAdminMode={openAdminMode}
        setOpenAdminMode={setOpenAdminMode}
        onOpenAdminLogin={() => setAdminLoginModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {openAdminMode ? (
          <AdminPortal
            onOpenReceipt={(reg) => setReceiptRegistration(reg)}
            onCloseAdmin={() => setOpenAdminMode(false)}
          />
        ) : (
          <>
            {activeTab === 'home' && (
              <>
                <HeroSection
                  onNavigate={(tab) => setActiveTab(tab)}
                  onQuickTrack={handleQuickTrack}
                />

                {/* Quick Services Overview on Home */}
                <section className="py-16 bg-slate-900 border-t border-slate-800">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                          Kewenangan Hukum
                        </span>
                        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-2">
                          Layanan Populer Notaris & PPAT
                        </h2>
                      </div>
                      <button
                        onClick={() => setActiveTab('services')}
                        className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 transition-colors self-start sm:self-auto"
                      >
                        <span>Lihat Seluruh Layanan</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Card 1: AJB */}
                      <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6 hover:border-amber-500/40 transition-all flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                            PPAT (Pertanahan)
                          </span>
                          <h3 className="font-serif text-lg font-bold text-white mt-2">
                            Akta Jual Beli (AJB) Tanah & Bangunan
                          </h3>
                          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                            Peralihan hak atas tanah dan bangunan yang sah, validasi sertifikat di BPN,
                            serta pelunasan pajak PPh dan BPHTB.
                          </p>
                        </div>
                        <div className="mt-6 pt-4 border-t border-slate-700/60 flex items-center justify-between">
                          <span className="text-xs text-slate-400">Proses: ~5 Hari</span>
                          <button
                            onClick={() => {
                              setActiveTab('register');
                            }}
                            className="text-xs font-bold text-amber-400 hover:text-amber-300"
                          >
                            Daftar Sekarang →
                          </button>
                        </div>
                      </div>

                      {/* Card 2: Pendirian PT */}
                      <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6 hover:border-amber-500/40 transition-all flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase">
                            Kenotariatan
                          </span>
                          <h3 className="font-serif text-lg font-bold text-white mt-2">
                            Pendirian Perseroan Terbatas (PT)
                          </h3>
                          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                            Pembuatan akta pendirian, pemesanan nama, dan pengesahan SK Kemenkumham RI
                            terintegrasi sistem SABU & OSS RBA.
                          </p>
                        </div>
                        <div className="mt-6 pt-4 border-t border-slate-700/60 flex items-center justify-between">
                          <span className="text-xs text-slate-400">Proses: ~7 Hari</span>
                          <button
                            onClick={() => {
                              setActiveTab('register');
                            }}
                            className="text-xs font-bold text-amber-400 hover:text-amber-300"
                          >
                            Daftar Sekarang →
                          </button>
                        </div>
                      </div>

                      {/* Card 3: Waris & Hibah */}
                      <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6 hover:border-amber-500/40 transition-all flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase">
                            Notaris & PPAT
                          </span>
                          <h3 className="font-serif text-lg font-bold text-white mt-2">
                            Keterangan Waris & Akta Hibah
                          </h3>
                          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                            Penetapan ahli waris sah, akta pembagian hak bersama (APHB), serta akta hibah
                            tanah/bangunan antar keluarga.
                          </p>
                        </div>
                        <div className="mt-6 pt-4 border-t border-slate-700/60 flex items-center justify-between">
                          <span className="text-xs text-slate-400">Proses: ~6 Hari</span>
                          <button
                            onClick={() => {
                              setActiveTab('register');
                            }}
                            className="text-xs font-bold text-amber-400 hover:text-amber-300"
                          >
                            Daftar Sekarang →
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 5-Step Process Explainer */}
                <section className="py-16 bg-slate-950">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                      Alur Pelayanan Digital
                    </span>
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-2 mb-12">
                      Tahapan Mudah Pengurusan Akta di Kantor Kami
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-left">
                      <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
                        <span className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm mb-4">
                          1
                        </span>
                        <h4 className="font-bold text-sm text-white">Pendaftaran Online</h4>
                        <p className="text-xs text-slate-400 mt-1">
                          Pilih layanan akta, lengkapi identitas pemohon, dan tentukan jadwal konsultasi.
                        </p>
                      </div>

                      <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
                        <span className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm mb-4">
                          2
                        </span>
                        <h4 className="font-bold text-sm text-white">Verifikasi Yuridis</h4>
                        <p className="text-xs text-slate-400 mt-1">
                          Pemeriksaan berkas fisik, legalitas subjek hukum, dan pengecekan sertifikat BPN.
                        </p>
                      </div>

                      <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
                        <span className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm mb-4">
                          3
                        </span>
                        <h4 className="font-bold text-sm text-white">Pembacaan & Tanda Tangan</h4>
                        <p className="text-xs text-slate-400 mt-1">
                          Para pihak menghadap langsung Notaris/PPAT untuk pembacaan minuta dan penandatanganan akta.
                        </p>
                      </div>

                      <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
                        <span className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm mb-4">
                          4
                        </span>
                        <h4 className="font-bold text-sm text-white">Pengesahan & Pengambilan</h4>
                        <p className="text-xs text-slate-400 mt-1">
                          Pendaftaran AHU/BPN, pencatatan di Buku Repertorium, dan penyerahan salinan resmi akta.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>
              </>
            )}

            {activeTab === 'services' && (
              <ServicesSection onSelectService={handleSelectService} />
            )}

            {activeTab === 'register' && (
              <RegistrationForm
                preSelectedService={selectedService}
                onSuccessTrack={handleSuccessTrack}
                onOpenReceipt={(reg) => setReceiptRegistration(reg)}
              />
            )}

            {activeTab === 'track' && (
              <TrackingSection
                initialCode={trackCode}
                onOpenReceipt={(reg) => setReceiptRegistration(reg)}
              />
            )}

            {activeTab === 'calculator' && (
              <CalculatorSection onGoToRegister={() => setActiveTab('register')} />
            )}
          </>
        )}
      </main>

      {/* Official Printable Receipt Modal */}
      <ReceiptModal
        registration={receiptRegistration}
        onClose={() => setReceiptRegistration(null)}
      />

      {/* Admin Authentication Gate Modal */}
      <AdminLoginModal
        isOpen={adminLoginModalOpen}
        onClose={() => setAdminLoginModalOpen(false)}
        onSuccess={() => {
          setOpenAdminMode(true);
          setAdminLoginModalOpen(false);
        }}
      />

      {/* Footer */}
      <Footer
        onNavigate={(tab) => {
          setActiveTab(tab);
          setOpenAdminMode(false);
        }}
        onOpenAdmin={() => {
          if (isAdmin) {
            setOpenAdminMode(true);
          } else {
            setAdminLoginModalOpen(true);
          }
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
