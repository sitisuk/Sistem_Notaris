import React, { useState } from 'react';
import {
  Bookmark,
  ExternalLink,
  Copy,
  Check,
  Smartphone,
  Laptop,
  Database,
  X,
  Share2,
  Sparkles,
} from 'lucide-react';

interface SaveAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SaveAppModal: React.FC<SaveAppModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const sharedUrl = 'https://ais-pre-fapby7zbo4ivgc2pqq5vv7-503155226787.asia-southeast1.run.app';

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(sharedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl text-left max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-white">
                Cara Menyimpan & Membuka Aplikasi
              </h3>
              <p className="text-xs text-slate-400">
                Akses permanen sistem Notaris & PPAT di laptop, komputer, atau HP
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Link URL Permanen */}
        <div className="my-5 p-4 rounded-2xl bg-slate-950 border border-amber-500/30">
          <p className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-1.5">
            Tautan Publik Permanen (Bisa Dibuka Langsung Tanpa AI Studio):
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="text"
              readOnly
              value={sharedUrl}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 select-all w-full focus:outline-none"
            />
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleCopy}
                className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin!' : 'Salin Link'}</span>
              </button>
              <a
                href={sharedUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 border border-slate-700"
              >
                <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                <span>Buka</span>
              </a>
            </div>
          </div>
        </div>

        {/* 3 Panduan Cara Buka & Pasang */}
        <div className="space-y-3.5 text-xs text-slate-300">
          {/* Opsi 1: Laptop / Komputer */}
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-slate-800 text-amber-400 shrink-0 mt-0.5">
              <Laptop className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">1. Simpan di Laptop / Komputer (Bookmark)</p>
              <p className="text-slate-400 mt-1 leading-relaxed">
                Saat membuka tautan di atas di browser (Chrome / Edge), tekan tombol{' '}
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-mono text-[10px] border border-slate-700">
                  Ctrl + D
                </kbd>{' '}
                (atau{' '}
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-mono text-[10px] border border-slate-700">
                  Cmd + D
                </kbd>{' '}
                di Mac) untuk menjadikannya Bookmark. Aplikasi akan selalu muncul di bilah atas browser Anda.
              </p>
            </div>
          </div>

          {/* Opsi 2: HP Android / iPhone */}
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-slate-800 text-emerald-400 shrink-0 mt-0.5">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">2. Pasang ke Layar Utama HP (Home Screen)</p>
              <p className="text-slate-400 mt-1 leading-relaxed">
                • <strong>Android (Chrome)</strong>: Buka tautan &rarr; Ketuk titik tiga (⋮) di pojok kanan atas &rarr; Pilih <strong>"Tambahkan ke Layar Utama"</strong>.<br />
                • <strong>iPhone (Safari)</strong>: Buka tautan &rarr; Ketuk ikon Bagikan (kotak panah ke atas) &rarr; Pilih <strong>"Tambah ke Layar Utama" (Add to Home Screen)</strong>.<br />
                Aplikasi akan muncul seperti aplikasi mandiri dengan ikon resmi Notaris di HP Anda.
              </p>
            </div>
          </div>

          {/* Opsi 3: Status Cloud Storage */}
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-slate-800 text-indigo-400 shrink-0 mt-0.5">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">3. Seluruh Data Tersimpan Aman di Cloud SQL</p>
              <p className="text-slate-400 mt-1 leading-relaxed">
                Anda tidak perlu khawatir data hilang. Seluruh permohonan pendaftaran, nomor akta, catatan buku repertorium, dan riwayat aktivitas tersimpan secara permanen di database PostgreSQL Google Cloud.
              </p>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
