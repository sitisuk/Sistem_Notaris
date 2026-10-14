import React, { useState, useEffect } from 'react';
import { Registration, ActivityLog, STATUS_CONFIG, RegistrationStatus } from '../types/notary.ts';
import {
  Search,
  CheckCircle2,
  Clock,
  FileText,
  AlertCircle,
  Building2,
  Calendar,
  User,
  Printer,
  ChevronRight,
  Shield,
  Sparkles,
} from 'lucide-react';

interface TrackingSectionProps {
  initialCode?: string;
  onOpenReceipt: (reg: Registration) => void;
}

export const TrackingSection: React.FC<TrackingSectionProps> = ({
  initialCode = '',
  onOpenReceipt,
}) => {
  const [searchCode, setSearchCode] = useState(initialCode);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{ registration: Registration; logs: ActivityLog[] } | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (initialCode) {
      setSearchCode(initialCode);
      handleSearch(initialCode);
    }
  }, [initialCode]);

  const handleSearch = async (codeToSearch?: string) => {
    const code = (codeToSearch || searchCode).trim();
    if (!code) {
      setErrorMessage('Silakan ketik nomor registrasi permohonan akta.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setData(null);

    try {
      const res = await fetch(`/api/registrations/track/${encodeURIComponent(code)}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Nomor pendaftaran tidak ditemukan');
      }
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(
        err.message || 'Data pendaftaran tidak ditemukan. Pastikan nomor registrasi benar.'
      );
    } finally {
      setLoading(false);
    }
  };

  const stepsList: { key: RegistrationStatus; title: string; subtitle: string }[] = [
    {
      key: 'MENUNGGU_VERIFIKASI',
      title: 'Pendaftaran Diterima',
      subtitle: 'Permohonan masuk sistem notaris',
    },
    {
      key: 'VERIFIKASI_BERKAS',
      title: 'Verifikasi Yuridis',
      subtitle: 'Pengecekan sertifikat & pajak',
    },
    {
      key: 'PENYUSUNAN_DRAFT',
      title: 'Minuta Akta',
      subtitle: 'Penyusunan naskah otentik',
    },
    {
      key: 'JADWAL_TANDATANGAN',
      title: 'Tanda Tangan',
      subtitle: 'Pembacaan di hadapan Notaris',
    },
    {
      key: 'PROSES_PENGESAHAN',
      title: 'Pengesahan Resmi',
      subtitle: 'Pendaftaran AHU / BPN',
    },
    {
      key: 'SELESAI',
      title: 'Selesai & Diserahkan',
      subtitle: 'Salinan akta diserahkan',
    },
  ];

  const getStepStatus = (stepKey: RegistrationStatus, currentStatus: RegistrationStatus) => {
    if (currentStatus === 'DITOLAK') {
      return 'rejected';
    }
    const currentOrder = STATUS_CONFIG[currentStatus]?.stepIndex || 1;
    const stepOrder = STATUS_CONFIG[stepKey]?.stepIndex || 1;

    if (currentOrder > stepOrder) return 'completed';
    if (currentOrder === stepOrder) return 'current';
    return 'upcoming';
  };

  return (
    <section className="py-16 bg-slate-900 text-slate-100 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            Pelacakan Berkas Terpadu
          </span>
          <h2 className="font-serif text-3xl font-bold text-white mt-3">
            Lacak Progres Akta & Layanan Notaris
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Pantau secara transparan tahapan minuta akta, verifikasi perpajakan, hingga jadwal tanda
            tangan langsung dari database PostgreSQL.
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3 sm:p-4 shadow-xl max-w-2xl mx-auto mb-10">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="flex flex-col sm:flex-row items-center gap-2"
          >
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-900 rounded-xl border border-slate-700/80 w-full">
              <Search className="w-5 h-5 text-amber-400 shrink-0" />
              <input
                type="text"
                placeholder="Masukkan Nomor Registrasi (contoh: NOT-2026-0001)"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                className="bg-transparent border-none text-white text-sm focus:outline-none w-full font-mono uppercase placeholder-slate-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider shrink-0 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Mencari...</span>
                </>
              ) : (
                <>
                  <span>Lacak Berkas</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Sample shortcut pills */}
          <div className="flex items-center justify-center gap-2 mt-3 pt-3 border-t border-slate-700/60 text-xs text-slate-400">
            <span>Contoh pencarian:</span>
            <button
              type="button"
              onClick={() => {
                setSearchCode('NOT-2026-0001');
                handleSearch('NOT-2026-0001');
              }}
              className="text-amber-400 hover:underline font-mono"
            >
              NOT-2026-0001
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => {
                setSearchCode('NOT-2026-0002');
                handleSearch('NOT-2026-0002');
              }}
              className="text-amber-400 hover:underline font-mono"
            >
              NOT-2026-0002
            </button>
          </div>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-3 max-w-2xl mx-auto mb-8">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Pencarian Tidak Ditemukan</p>
              <p className="text-xs text-rose-300/90 mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Tracking Details Result */}
        {data && (
          <div className="space-y-8 animate-fadeIn">
            {/* Top Overview Card */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-700/80">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xl sm:text-2xl font-extrabold text-amber-400 tracking-wider">
                      {data.registration.registrationNumber}
                    </span>
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full border ${
                        STATUS_CONFIG[data.registration.status]?.bg || 'bg-slate-700'
                      } ${STATUS_CONFIG[data.registration.status]?.border || 'border-slate-600'}`}
                    >
                      {STATUS_CONFIG[data.registration.status]?.label || data.registration.status}
                    </span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-white mt-1">
                    {data.registration.serviceName}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Kategori: {data.registration.serviceCategory === 'PPAT' ? 'Pejabat Pembuat Akta Tanah (PPAT)' : 'Kenotariatan'}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onOpenReceipt(data.registration)}
                    className="px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-semibold text-xs flex items-center gap-2 border border-slate-600 transition-colors"
                  >
                    <Printer className="w-4 h-4 text-amber-400" />
                    <span>Cetak Tanda Terima</span>
                  </button>
                </div>
              </div>

              {/* Progress Stepper */}
              <div className="py-8">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">
                  Tahapan Penyelesaian Akta Otentik:
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {stepsList.map((st, idx) => {
                    const statusState = getStepStatus(st.key, data.registration.status);
                    return (
                      <div
                        key={st.key}
                        className={`p-3 rounded-2xl border flex flex-col justify-between transition-all ${
                          statusState === 'completed'
                            ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                            : statusState === 'current'
                            ? 'bg-amber-950/40 border-amber-500 text-amber-300 shadow-md ring-2 ring-amber-500/20'
                            : 'bg-slate-900/40 border-slate-800 text-slate-500'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-slate-800/80">
                            0{idx + 1}
                          </span>
                          {statusState === 'completed' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : statusState === 'current' ? (
                            <Clock className="w-4 h-4 text-amber-400 animate-spin" />
                          ) : null}
                        </div>
                        <div>
                          <p className="font-bold text-xs leading-tight text-white">{st.title}</p>
                          <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                            {st.subtitle}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Key Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-slate-700/80 text-xs">
                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  <p className="text-slate-400 text-[10px] uppercase font-semibold">Nama Pemohon</p>
                  <p className="font-bold text-white mt-0.5">{data.registration.fullName}</p>
                  {data.registration.companyName && (
                    <p className="text-[10px] text-amber-400">{data.registration.companyName}</p>
                  )}
                </div>

                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  <p className="text-slate-400 text-[10px] uppercase font-semibold">Jadwal Temu Konsultasi</p>
                  <p className="font-bold text-white mt-0.5">
                    {data.registration.consultationDate}
                  </p>
                  <p className="text-[10px] text-slate-400">Pukul {data.registration.consultationTime} WIB</p>
                </div>

                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  <p className="text-slate-400 text-[10px] uppercase font-semibold">Nomor Akta Resmi</p>
                  <p className="font-bold text-amber-300 mt-0.5 font-mono">
                    {data.registration.notaryDeedNumber || 'Dalam Proses'}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Repertorium: {data.registration.repertoriumNumber || '-'}
                  </p>
                </div>

                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  <p className="text-slate-400 text-[10px] uppercase font-semibold">Petugas Penanggung Jawab</p>
                  <p className="font-bold text-white mt-0.5">
                    {data.registration.assignedStaff || 'TRI AKHSANUL IMAN, S.H., M.Kn.'}
                  </p>
                  <p className="text-[10px] text-slate-400">Notaris & PPAT Kab. Bekasi</p>
                </div>
              </div>

              {/* Official Admin Note (if any) */}
              {data.registration.adminNotes && (
                <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs">
                  <p className="font-bold text-amber-400 mb-0.5">Catatan Resmi Kantor Notaris:</p>
                  <p className="text-slate-200">{data.registration.adminNotes}</p>
                </div>
              )}
            </div>

            {/* Activity History Logs (Timeline) */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-xl">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-700/80">
                <h4 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-400" />
                  <span>Riwayat & Catatan Mutasi Berkas</span>
                </h4>
                <span className="text-xs text-slate-400 font-mono">
                  {data.logs.length} Catatan Aktivitas
                </span>
              </div>

              <div className="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-700">
                {data.logs.map((log) => (
                  <div key={log.id} className="relative flex items-start gap-4 pl-8 group">
                    <div className="absolute left-1.5 top-1.5 w-4 h-4 rounded-full bg-amber-500 border-4 border-slate-900 group-hover:scale-125 transition-transform" />
                    <div className="bg-slate-900/80 border border-slate-700/70 p-4 rounded-2xl w-full">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                        <span className="font-bold text-xs text-amber-400">{log.title}</span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {new Date(log.createdAt).toLocaleString('id-ID', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1">{log.description}</p>
                      <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
                        <span>Pencatat: {log.actor}</span>
                        <span className="font-mono text-slate-500 uppercase">
                          Status: {log.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
