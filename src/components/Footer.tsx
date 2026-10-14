import React from 'react';
import { Scale, ShieldCheck, MapPin, Phone, Mail, Clock, Database } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: string) => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenAdmin }) => {
  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Col 1: Identity */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-sm font-bold text-white leading-tight">
                  TRI AKHSANUL IMAN, S.H., M.Kn.
                </h3>
                <p className="text-[10px] text-amber-400 font-medium">Notaris & PPAT Kabupaten Bekasi</p>
              </div>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Pelayanan akta otentik kenotariatan dan pertanahan (PPAT) dengan kepastian hukum,
              transparansi proses, dan integritas tinggi berlandaskan peraturan perundang-undangan.
            </p>
            <div className="pt-2 flex items-center gap-2 text-[10px] text-slate-500 font-mono">
              <Database className="w-3.5 h-3.5 text-amber-400/80" />
              <span>PostgreSQL Engine (asia-southeast1)</span>
            </div>
          </div>

          {/* Col 2: Fast Navigation */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">
              Layanan & Informasi
            </h4>
            <ul className="space-y-2 text-[11px]">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Beranda Profil Notaris
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('services')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Katalog Akta Notaris & PPAT
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('register')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Pendaftaran Permohonan Online
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('track')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Pelacakan Berkas Real-Time
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('calculator')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Simulasi Biaya AJB & Pajak
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Legal Credentials */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">
              Legalitas & Lisensi
            </h4>
            <div className="space-y-2 text-[11px] text-slate-400">
              <p>
                <strong className="text-slate-300">SK Menkumham RI:</strong>
                <br />
                AHU-00382.AH.02.01.Tahun 2008
              </p>
              <p>
                <strong className="text-slate-300">SK Kepala ATR/BPN RI:</strong>
                <br />
                No. 9-XVII-PPAT-2008 Tanggal 01-09-2008
              </p>
              <p>
                <strong className="text-slate-300">Anggota Organisasi:</strong>
                <br />
                Ikatan Notaris Indonesia (I.N.I) & IPPAT
              </p>
            </div>
          </div>

          {/* Col 4: Office Address & Contact */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">
              Kontak Kantor Notaris
            </h4>
            <div className="space-y-2 text-[11px]">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Jl. Raya Teuku Umar No. 137 J, Telaga Asih, Kec. Cikarang Barat, Kabupaten Bekasi, Jawa Barat 17510</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Telp / WA: 0812-2345-6789</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <span>kantor@notaristriakhsanul.id</span>
              </div>
              <div className="flex items-start gap-2 pt-1">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Senin – Jumat: 08.30 – 17.00 WIB</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <p>
            © {new Date().getFullYear()} Kantor Notaris & PPAT TRI AKHSANUL IMAN, S.H., M.Kn. Dilindungi
            Undang-Undang Republik Indonesia.
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={onOpenAdmin}
              className="hover:text-amber-400 transition-colors text-slate-400 font-semibold"
            >
              Akses Admin Kantor
            </button>
            <span>•</span>
            <span>UU Jabatan Notaris No. 2/2014</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
