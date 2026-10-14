import React from 'react';
import { Registration, STATUS_CONFIG } from '../types/notary.ts';
import { Printer, X, Scale, ShieldCheck } from 'lucide-react';

interface ReceiptModalProps {
  registration: Registration | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ registration, onClose }) => {
  if (!registration) return null;

  const handlePrint = () => {
    window.print();
  };

  const parseDocs = (docsStr?: string | null): string[] => {
    if (!docsStr) return [];
    try {
      return JSON.parse(docsStr);
    } catch {
      return [docsStr];
    }
  };

  const docs = parseDocs(registration.documentsSubmitted);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white">
      {/* Outer wrapper */}
      <div className="relative w-full max-w-2xl bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden print:shadow-none print:w-full print:max-w-none print:rounded-none">
        {/* Modal Top Actions (Hidden when printing) */}
        <div className="bg-slate-900 text-white px-6 py-3 flex items-center justify-between print:hidden">
          <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
            <Printer className="w-4 h-4" />
            Tanda Terima Berkas Resmi Notaris & PPAT
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 sm:p-10 font-sans text-xs text-slate-800 space-y-6">
          {/* KOP SURAT RESMI NOTARIS & PPAT */}
          <div className="border-b-2 border-slate-900 pb-4 text-center relative">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Scale className="w-6 h-6 text-slate-900" />
              <h2 className="text-xs font-bold tracking-widest uppercase">
                Kantor Notaris & Pejabat Pembuat Akta Tanah (PPAT)
              </h2>
            </div>
            <h1 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-slate-950 uppercase">
              TRI AKHSANUL IMAN, S.H., M.Kn.
            </h1>
            <p className="text-[10px] text-slate-700 mt-0.5">
              SK Kemenkumham RI: AHU-00382.AH.02.01.Tahun 2008 • SK Kepala ATR/BPN RI: No. 9-XVII-PPAT-2008 Tgl 01-09-2008
            </p>
            <p className="text-[10px] text-slate-600">
              Jl. Raya Teuku Umar No. 137 J, Telaga Asih, Kec. Cikarang Barat, Kabupaten Bekasi, Jawa Barat 17510 | Telp/WA: 0812-2345-6789
            </p>
          </div>

          {/* Title */}
          <div className="text-center pt-1">
            <h3 className="text-sm font-bold uppercase tracking-wider underline">
              TANDA TERIMA PENDAFTARAN & BERKAS PERMOHONAN AKTA
            </h3>
            <p className="font-mono text-xs font-bold text-slate-900 mt-1">
              NOMOR REGISTRASI: {registration.registrationNumber}
            </p>
          </div>

          {/* Table Data */}
          <table className="w-full text-left text-[11px] border-collapse">
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="py-1.5 font-bold text-slate-700 w-44">Tanggal Registrasi</td>
                <td className="py-1.5">: {new Date(registration.createdAt).toLocaleString('id-ID')}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-1.5 font-bold text-slate-700">Nama Pemohon</td>
                <td className="py-1.5 font-semibold">: {registration.fullName}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-1.5 font-bold text-slate-700">NIK (Nomor Induk Kependudukan)</td>
                <td className="py-1.5 font-mono">: {registration.nik}</td>
              </tr>
              {registration.companyName && (
                <tr className="border-b border-slate-200">
                  <td className="py-1.5 font-bold text-slate-700">Badan Usaha / Perusahaan</td>
                  <td className="py-1.5 font-semibold">: {registration.companyName}</td>
                </tr>
              )}
              <tr className="border-b border-slate-200">
                <td className="py-1.5 font-bold text-slate-700">Kontak WhatsApp / Email</td>
                <td className="py-1.5">: {registration.phone} / {registration.email}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-1.5 font-bold text-slate-700">Alamat Pemohon</td>
                <td className="py-1.5">: {registration.address}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-1.5 font-bold text-slate-700">Jenis Layanan Akta</td>
                <td className="py-1.5 font-bold text-slate-950">
                  : {registration.serviceName} ({registration.serviceCategory})
                </td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-1.5 font-bold text-slate-700">Jadwal Temu Konsultasi</td>
                <td className="py-1.5">: {registration.consultationDate} pukul {registration.consultationTime} WIB</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-1.5 font-bold text-slate-700">Status Terkini</td>
                <td className="py-1.5 font-bold">: {STATUS_CONFIG[registration.status]?.label || registration.status}</td>
              </tr>
              {registration.notaryDeedNumber && (
                <tr className="border-b border-slate-200">
                  <td className="py-1.5 font-bold text-slate-700">Nomor Akta Otentik</td>
                  <td className="py-1.5 font-mono font-bold">: {registration.notaryDeedNumber}</td>
                </tr>
              )}
              {registration.repertoriumNumber && (
                <tr className="border-b border-slate-200">
                  <td className="py-1.5 font-bold text-slate-700">Buku Repertorium Notaris</td>
                  <td className="py-1.5 font-mono">: {registration.repertoriumNumber}</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Checklist Documents */}
          <div>
            <p className="font-bold text-[11px] uppercase tracking-wide text-slate-800 mb-1.5">
              Dokumen Persyaratan yang Telah Didaftarkan:
            </p>
            {docs.length > 0 ? (
              <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-700 pl-2">
                {docs.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            ) : (
              <p className="text-[11px] text-slate-500 italic">
                Dokumen fisik asli akan diperiksa dan diserahkan saat jadwal pertemuan.
              </p>
            )}
          </div>

          {/* Notice Note */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-[10px] text-slate-600 leading-relaxed">
            <p className="font-bold text-slate-800 mb-0.5">Ketentuan Pengambilan & Verifikasi:</p>
            <p>
              1. Harap membawa lembar bukti pendaftaran ini beserta dokumen asli dan identitas diri saat
              menghadap Notaris/PPAT.
            </p>
            <p>
              2. Progres berkas dapat dilacak mandiri kapan saja melalui portal resmi dengan kode registrasi di atas.
            </p>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-6 text-center text-[11px]">
            <div>
              <p className="text-slate-600">Pemohon / Penghadap,</p>
              <div className="h-16" />
              <p className="font-bold text-slate-900 border-t border-slate-300 pt-1 inline-block min-w-[150px]">
                ( {registration.fullName} )
              </p>
            </div>

            <div>
              <p className="text-slate-600">Bekasi, {new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}</p>
              <p className="text-slate-600">Notaris & PPAT Kab. Bekasi,</p>
              <div className="h-16 flex items-center justify-center">
                <span className="font-mono text-[9px] text-slate-400 border border-dashed border-slate-300 px-2 py-0.5 rounded">
                  Cap & Tanda Tangan
                </span>
              </div>
              <p className="font-bold text-slate-900 border-t border-slate-300 pt-1 inline-block min-w-[150px]">
                ( {registration.assignedStaff || 'TRI AKHSANUL IMAN, S.H., M.Kn.'} )
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
