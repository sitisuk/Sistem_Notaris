import React, { useState } from 'react';
import {
  Scale,
  FileCheck2,
  Search,
  ShieldCheck,
  Building,
  Award,
  ChevronRight,
  Clock,
  Sparkles,
} from 'lucide-react';

interface HeroSectionProps {
  onNavigate: (tab: string) => void;
  onQuickTrack: (code: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate, onQuickTrack }) => {
  const [trackCode, setTrackCode] = useState('');

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackCode.trim()) {
      onQuickTrack(trackCode.trim());
    }
  };

  return (
    <div className="relative overflow-hidden bg-slate-950 text-white pt-10 pb-20">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-amber-600/10 via-amber-900/5 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Heading and CTAs */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-amber-500/30 text-amber-300 text-xs font-semibold tracking-wide shadow-sm">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Pejabat Pembuat Akta Otentik Berlisensi Resmi Kemenkumham & BPN RI</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Kepastian Hukum Otentik untuk{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500">
                Setiap Langkah Bisnis & Properti Anda
              </span>
            </h1>

            <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl font-normal">
              Pelayanan akta Notaris dan PPAT yang profesional, transparan, dan terintegrasi
              secara digital. Pendaftaran online, pengecekan berkas, hingga pelacakan progres
              minuta akta secara real-time.
            </p>

            {/* Quick Track Input Bar */}
            <form
              onSubmit={handleTrackSubmit}
              className="bg-slate-900/90 p-2 sm:p-2.5 rounded-2xl border border-slate-700/80 shadow-2xl flex flex-col sm:flex-row items-center gap-2 max-w-xl"
            >
              <div className="flex items-center gap-2.5 px-3 py-2 w-full">
                <Search className="w-5 h-5 text-amber-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Masukkan Nomor Registrasi (cth: NOT-2026-0001)"
                  value={trackCode}
                  onChange={(e) => setTrackCode(e.target.value)}
                  className="bg-transparent border-none text-white placeholder-slate-400 text-sm focus:outline-none w-full font-mono uppercase"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm tracking-wide shrink-0 transition-colors flex items-center justify-center gap-2"
              >
                <span>Lacak Status</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => onNavigate('register')}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-amber-950/50 flex items-center gap-2.5 transition-all transform hover:-translate-y-0.5"
              >
                <FileCheck2 className="w-5 h-5" />
                <span>Daftar Permohonan Akta Baru</span>
              </button>

              <button
                onClick={() => onNavigate('services')}
                className="px-5 py-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-slate-200 border border-slate-700 text-sm font-semibold flex items-center gap-2 transition-colors"
              >
                <Scale className="w-4 h-4 text-amber-400" />
                <span>Lihat Syarat & Tarif Layanan</span>
              </button>
            </div>
          </div>

          {/* Right Column: Office Credentials & Visual Card */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl bg-gradient-to-b from-slate-800/90 to-slate-900/90 border border-slate-700/80 p-6 sm:p-8 shadow-2xl backdrop-blur-sm">
              <div className="flex items-center justify-between pb-6 border-b border-slate-700/80">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Scale className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-white">Kantor Notaris & PPAT</h3>
                    <p className="text-xs text-amber-400 font-medium">TRI AKHSANUL IMAN, S.H., M.Kn.</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Kab. Bekasi • Buka
                  </span>
                </div>
              </div>

              {/* Legal Credential Rows */}
              <div className="py-5 space-y-3.5 text-xs text-slate-300">
                <div className="flex items-start gap-3 bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                  <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">SK Menteri Hukum & HAM RI</p>
                    <p className="text-slate-400">Nomor: AHU-00382.AH.02.01.Tahun 2008</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                  <Building className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">SK Kepala ATR/BPN RI (PPAT)</p>
                    <p className="text-slate-400">No. 9-XVII-PPAT-2008 Tanggal 01-09-2008</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                  <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">Jam Layanan Kantor</p>
                    <p className="text-slate-400">Senin – Jumat: 08.30 – 17.00 WIB | Sabtu (Jadwal Khusus)</p>
                  </div>
                </div>
              </div>

              {/* Database Badge */}
              <div className="pt-4 border-t border-slate-700/80 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>PostgreSQL Cloud Engine</span>
                </div>
                <span className="font-mono text-[11px] text-amber-400/90 font-medium">
                  Enkripsi & Sertifikasi Otentik
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Pillars of Service */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 pt-10 border-t border-slate-800">
          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl text-left">
            <p className="text-2xl sm:text-3xl font-serif font-bold text-amber-400">12,400+</p>
            <p className="text-xs font-semibold text-white mt-1">Akta Otentik Diterbitkan</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Notaris & PPAT berkuatan hukum</p>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl text-left">
            <p className="text-2xl sm:text-3xl font-serif font-bold text-amber-400">15+ Thn</p>
            <p className="text-xs font-semibold text-white mt-1">Pengalaman Profesional</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Integritas dan kepastian hukum</p>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl text-left">
            <p className="text-2xl sm:text-3xl font-serif font-bold text-amber-400">AHU & BPN</p>
            <p className="text-xs font-semibold text-white mt-1">Integrasi Sistem Nasional</p>
            <p className="text-[11px] text-slate-400 mt-0.5">SABU Kemenkumham & Kantor BPN</p>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl text-left">
            <p className="text-2xl sm:text-3xl font-serif font-bold text-amber-400">100%</p>
            <p className="text-xs font-semibold text-white mt-1">Transparansi Biaya</p>
            <p className="text-[11px] text-slate-400 mt-0.5">PNBP, BPHTB & estimasi terukur</p>
          </div>
        </div>
      </div>
    </div>
  );
};
