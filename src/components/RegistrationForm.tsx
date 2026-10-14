import React, { useState, useEffect } from 'react';
import { Service, ServiceCategory, ClientType, Registration } from '../types/notary.ts';
import { useAuth } from '../context/AuthContext.tsx';
import {
  FileText,
  User,
  Calendar,
  CheckCircle,
  AlertCircle,
  Copy,
  Printer,
  Search,
  Scale,
  Building,
  ArrowRight,
  ArrowLeft,
  Check,
} from 'lucide-react';

interface RegistrationFormProps {
  preSelectedService?: Service | null;
  onSuccessTrack: (regNumber: string) => void;
  onOpenReceipt: (reg: Registration) => void;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  preSelectedService,
  onSuccessTrack,
  onOpenReceipt,
}) => {
  const { currentUser, idToken } = useAuth();
  const [step, setStep] = useState(1);
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);

  // Form State
  const [clientType, setClientType] = useState<ClientType>('INDIVIDUAL');
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(
    preSelectedService ? preSelectedService.id : null
  );
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory>(
    preSelectedService ? preSelectedService.category : 'NOTARIS'
  );

  // Applicant info
  const [fullName, setFullName] = useState(currentUser?.displayName || '');
  const [nik, setNik] = useState('');
  const [npwp, setNpwp] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // Schedule & Requirements
  const [consultationDate, setConsultationDate] = useState('');
  const [consultationTime, setConsultationTime] = useState('10:00');
  const [checkedDocs, setCheckedDocs] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  // Submission status
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successRegistration, setSuccessRegistration] = useState<Registration | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    if (preSelectedService) {
      setSelectedServiceId(preSelectedService.id);
      setSelectedCategory(preSelectedService.category);
    }
  }, [preSelectedService]);

  useEffect(() => {
    if (currentUser) {
      if (!fullName && currentUser.displayName) setFullName(currentUser.displayName);
      if (!email && currentUser.email) setEmail(currentUser.email);
    }
  }, [currentUser]);

  const fetchServices = async () => {
    try {
      setLoadingServices(true);
      const res = await fetch('/api/services');
      if (res.ok) {
        const data = await res.json();
        setServices(data);
        if (!selectedServiceId && data.length > 0) {
          setSelectedServiceId(data[0].id);
          setSelectedCategory(data[0].category);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingServices(false);
    }
  };

  const currentService = services.find((s) => s.id === selectedServiceId);

  const getRequirementsList = (): string[] => {
    if (!currentService) return [];
    try {
      return JSON.parse(currentService.requirements);
    } catch {
      return [currentService.requirements];
    }
  };

  const toggleDoc = (doc: string) => {
    if (checkedDocs.includes(doc)) {
      setCheckedDocs(checkedDocs.filter((d) => d !== doc));
    } else {
      setCheckedDocs([...checkedDocs, doc]);
    }
  };

  // Helper date: set tomorrow as min
  const getTomorrowString = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!selectedServiceId || !currentService) {
      setErrorMessage('Silakan pilih jenis layanan akta terlebih dahulu.');
      return;
    }
    if (!fullName.trim() || !nik.trim() || !email.trim() || !phone.trim()) {
      setErrorMessage('Mohon lengkapi data wajib: Nama Lengkap, NIK, Email, dan No. WhatsApp.');
      return;
    }
    if (nik.trim().length < 16) {
      setErrorMessage('Nomor Induk Kependudukan (NIK) harus terdiri dari 16 digit.');
      return;
    }
    if (!consultationDate) {
      setErrorMessage('Silakan tentukan tanggal rencana temu konsultasi.');
      return;
    }

    setSubmitting(true);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (idToken) {
        headers['Authorization'] = `Bearer ${idToken}`;
      }

      const payload = {
        clientType,
        fullName: fullName.trim(),
        nik: nik.trim(),
        npwp: npwp.trim() || undefined,
        companyName: clientType === 'COMPANY' ? companyName.trim() : undefined,
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim() || 'Kabupaten Bekasi',
        serviceId: currentService.id,
        serviceName: currentService.name,
        serviceCategory: currentService.category,
        consultationDate,
        consultationTime,
        notes: notes.trim() || undefined,
        documentsSubmitted: checkedDocs,
      };

      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Gagal mengirim pendaftaran');
      }

      const created: Registration = await res.json();
      setSuccessRegistration(created);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Terjadi kesalahan sistem saat menyimpan ke database.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // SUCCESS SCREEN
  if (successRegistration) {
    return (
      <div className="py-16 bg-slate-900 text-slate-100 min-h-screen">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-slate-800/90 border border-emerald-500/40 rounded-3xl p-8 sm:p-10 shadow-2xl text-center relative overflow-hidden">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-emerald-500/30">
              <CheckCircle className="w-9 h-9" />
            </div>

            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Pendaftaran Berhasil Disimpan di Database
            </span>

            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-4">
              Permohonan Akta Diterima
            </h2>

            <p className="text-sm text-slate-300 mt-2 max-w-md mx-auto">
              Berkas Anda telah tersimpan dalam sistem resmi Kantor Notaris & PPAT. Silakan simpan
              Kode Registrasi ini untuk pelacakan dan konfirmasi kedatangan.
            </p>

            {/* Registration Code Display Box */}
            <div className="my-6 p-5 bg-slate-950/80 rounded-2xl border border-amber-500/40 max-w-md mx-auto">
              <p className="text-xs text-amber-400 font-semibold uppercase tracking-wider">
                Nomor Registrasi Berkas
              </p>
              <div className="flex items-center justify-center gap-3 mt-1.5">
                <span className="font-mono text-2xl sm:text-3xl font-extrabold text-white tracking-wider">
                  {successRegistration.registrationNumber}
                </span>
                <button
                  onClick={() => handleCopyCode(successRegistration.registrationNumber)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 transition-colors"
                  title="Salin Kode"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Jadwal Konsultasi: {successRegistration.consultationDate} pukul{' '}
                {successRegistration.consultationTime} WIB
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => onOpenReceipt(successRegistration)}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-950/40 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Tanda Terima Berkas</span>
              </button>

              <button
                onClick={() => onSuccessTrack(successRegistration.registrationNumber)}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <Search className="w-4 h-4 text-amber-400" />
                <span>Lacak Status Berkas Ini</span>
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-700/60 text-xs text-slate-400">
              <p>
                Konfirmasi pendaftaran otomatis dikirimkan ke email{' '}
                <strong className="text-slate-200">{successRegistration.email}</strong> dan nomor
                WhatsApp pemohon.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="py-16 bg-slate-900 text-slate-100 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            Formulir Pendaftaran Online
          </span>
          <h2 className="font-serif text-3xl font-bold text-white mt-3">
            Permohonan Pembuatan Akta & Layanan PPAT
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Isi formulir pendaftaran di bawah ini untuk memulai proses yuridis, verifikasi berkas, dan
            penjadwalan temu Notaris.
          </p>
        </div>

        {/* Multi-Step Indicator */}
        <div className="flex items-center justify-center gap-3 sm:gap-6 mb-8">
          <div
            onClick={() => setStep(1)}
            className={`flex items-center gap-2 cursor-pointer pb-2 border-b-2 text-xs sm:text-sm font-semibold transition-colors ${
              step === 1 ? 'border-amber-400 text-amber-400' : 'border-slate-800 text-slate-400'
            }`}
          >
            <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-mono">
              1
            </span>
            <span>Pilih Layanan</span>
          </div>

          <div
            onClick={() => selectedServiceId && setStep(2)}
            className={`flex items-center gap-2 cursor-pointer pb-2 border-b-2 text-xs sm:text-sm font-semibold transition-colors ${
              step === 2 ? 'border-amber-400 text-amber-400' : 'border-slate-800 text-slate-400'
            }`}
          >
            <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-mono">
              2
            </span>
            <span>Data Pemohon</span>
          </div>

          <div
            onClick={() => selectedServiceId && fullName && setStep(3)}
            className={`flex items-center gap-2 cursor-pointer pb-2 border-b-2 text-xs sm:text-sm font-semibold transition-colors ${
              step === 3 ? 'border-amber-400 text-amber-400' : 'border-slate-800 text-slate-400'
            }`}
          >
            <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-mono">
              3
            </span>
            <span>Jadwal & Dokumen</span>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-sm">
          {/* STEP 1: PILIH LAYANAN */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Kategori Kewenangan Hukum:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory('NOTARIS');
                      const first = services.find((s) => s.category === 'NOTARIS');
                      if (first) setSelectedServiceId(first.id);
                    }}
                    className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                      selectedCategory === 'NOTARIS'
                        ? 'bg-amber-500/10 border-amber-500 text-white shadow-md'
                        : 'bg-slate-900/60 border-slate-700 text-slate-300 hover:bg-slate-900'
                    }`}
                  >
                    <Scale className={`w-5 h-5 mt-0.5 ${selectedCategory === 'NOTARIS' ? 'text-amber-400' : 'text-slate-400'}`} />
                    <div>
                      <p className="font-bold text-sm">Kenotariatan</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Pendirian PT/CV, Kontrak Bisnis, Waris, Legalisasi Dokumen.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory('PPAT');
                      const first = services.find((s) => s.category === 'PPAT');
                      if (first) setSelectedServiceId(first.id);
                    }}
                    className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                      selectedCategory === 'PPAT'
                        ? 'bg-amber-500/10 border-amber-500 text-white shadow-md'
                        : 'bg-slate-900/60 border-slate-700 text-slate-300 hover:bg-slate-900'
                    }`}
                  >
                    <Building className={`w-5 h-5 mt-0.5 ${selectedCategory === 'PPAT' ? 'text-amber-400' : 'text-slate-400'}`} />
                    <div>
                      <p className="font-bold text-sm">PPAT (Pertanahan)</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Jual Beli Tanah (AJB), Hibah, Hak Tanggungan (APHT), Balik Nama.
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Pilih Jenis Akta / Layanan:
                </label>
                {loadingServices ? (
                  <div className="py-8 text-center text-slate-400 text-xs">Memuat layanan...</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
                    {services
                      .filter((s) => s.category === selectedCategory)
                      .map((srv) => (
                        <div
                          key={srv.id}
                          onClick={() => setSelectedServiceId(srv.id)}
                          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                            selectedServiceId === srv.id
                              ? 'bg-amber-500/15 border-amber-400 shadow-sm'
                              : 'bg-slate-900/40 border-slate-700/80 hover:bg-slate-900/80'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <span className="font-semibold text-xs text-white leading-tight">
                              {srv.name}
                            </span>
                            <span className="text-[10px] font-mono text-amber-400 font-bold ml-2 shrink-0">
                              {srv.code}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                            {srv.description}
                          </p>
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800 text-[11px]">
                            <span className="text-slate-400">~{srv.estimatedDays} Hari</span>
                            <span className="font-bold text-amber-300">
                              {new Intl.NumberFormat('id-ID', {
                                style: 'currency',
                                currency: 'IDR',
                                maximumFractionDigits: 0,
                              }).format(srv.baseFee)}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Requirement highlights of current selected service */}
              {currentService && (
                <div className="bg-slate-900/70 p-4 rounded-2xl border border-slate-700/80">
                  <p className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                    Persyaratan Utama yang Perlu Disiapkan:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                    {getRequirementsList().map((req, i) => (
                      <div key={i} className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span>{req}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs tracking-wider uppercase flex items-center gap-2"
                >
                  <span>Lanjutkan: Data Pemohon</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: DATA PEMOHON */}
          {step === 2 && (
            <div className="space-y-5">
              {/* Client Type Toggle */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Kategori Pemohon / Pihak:
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setClientType('INDIVIDUAL')}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all border ${
                      clientType === 'INDIVIDUAL'
                        ? 'bg-amber-500 text-slate-950 border-amber-400'
                        : 'bg-slate-900/60 text-slate-300 border-slate-700'
                    }`}
                  >
                    Perorangan / Pribadi
                  </button>
                  <button
                    type="button"
                    onClick={() => setClientType('COMPANY')}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all border ${
                      clientType === 'COMPANY'
                        ? 'bg-amber-500 text-slate-950 border-amber-400'
                        : 'bg-slate-900/60 text-slate-300 border-slate-700'
                    }`}
                  >
                    Badan Hukum / Perusahaan (PT/CV/Yayasan)
                  </button>
                </div>
              </div>

              {clientType === 'COMPANY' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nama Badan Usaha / PT / CV *
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: PT Nusantara Digital Inovasi"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nama Lengkap Pemohon (Sesuai KTP) *
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Bambang Sudarmono, S.T."
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nomor Induk Kependudukan (NIK - 16 Digit) *
                  </label>
                  <input
                    type="text"
                    maxLength={16}
                    placeholder="327301xxxxxxxxxx"
                    value={nik}
                    onChange={(e) => setNik(e.target.value.replace(/\D/g, ''))}
                    required
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    NPWP (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="00.000.000.0-000.000"
                    value={npwp}
                    onChange={(e) => setNpwp(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    No. WhatsApp / Telepon *
                  </label>
                  <input
                    type="tel"
                    placeholder="0812xxxxxxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Alamat Email Pemohon *
                  </label>
                  <input
                    type="email"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Alamat Lengkap Domisili / Kantor *
                </label>
                <textarea
                  rows={2}
                  placeholder="Jl. Raya Teuku Umar No. 137 J, Telaga Asih, Kec. Cikarang Barat, Kabupaten Bekasi"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Kembali</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!fullName.trim() || !nik.trim() || !email.trim() || !phone.trim()) {
                      setErrorMessage('Mohon lengkapi seluruh field bertanda bintang (*).');
                      return;
                    }
                    setErrorMessage('');
                    setStep(3);
                  }}
                  className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs tracking-wider uppercase flex items-center gap-2"
                >
                  <span>Lanjutkan: Jadwal & Dokumen</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: JADWAL & PERSYARATAN */}
          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Schedule row */}
              <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-700/80">
                <p className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Rencana Jadwal Temu Konsultasi / Verifikasi Berkas:</span>
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Pilih Tanggal Kedatangan *
                    </label>
                    <input
                      type="date"
                      min={getTomorrowString()}
                      value={consultationDate}
                      onChange={(e) => setConsultationDate(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Pilihan Waktu / Jam Layanan *
                    </label>
                    <select
                      value={consultationTime}
                      onChange={(e) => setConsultationTime(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="09:00">09:00 WIB (Pagi)</option>
                      <option value="10:00">10:00 WIB (Pagi)</option>
                      <option value="11:00">11:00 WIB (Siang)</option>
                      <option value="13:30">13:30 WIB (Siang)</option>
                      <option value="14:30">14:30 WIB (Sore)</option>
                      <option value="15:30">15:30 WIB (Sore)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Checklist Documents */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Centang Dokumen Persyaratan yang Siap Anda Serahkan:
                </label>
                <p className="text-xs text-slate-400 mb-3">
                  Dokumen asli dan fotokopi dapat dibawa langsung pada saat jadwal temu konsultasi.
                </p>
                <div className="space-y-2 bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                  {getRequirementsList().map((req, idx) => {
                    const isChecked = checkedDocs.includes(req);
                    return (
                      <label
                        key={idx}
                        className={`flex items-start gap-3 p-2.5 rounded-xl cursor-pointer transition-colors ${
                          isChecked ? 'bg-amber-500/10 text-white' : 'hover:bg-slate-800/60 text-slate-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleDoc(req)}
                          className="mt-0.5 rounded border-slate-700 text-amber-500 focus:ring-amber-500 focus:ring-offset-slate-900"
                        />
                        <span className="text-xs leading-relaxed">{req}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Special Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Catatan Tambahan / Uraian Objek Akta (Opsional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Contoh: No. Sertifikat SHM 1234 Kab. Bekasi seluas 350 m2, kesepakatan harga Rp 850 Juta, pemohon minta klausul kuasa khusus."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              {/* Summary box before submit */}
              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-xs text-slate-300 space-y-1.5">
                <p className="font-semibold text-amber-400">Ringkasan Pengajuan:</p>
                <p>
                  • Akta: <strong className="text-white">{currentService?.name}</strong> ({currentService?.category})
                </p>
                <p>
                  • Pemohon: <strong className="text-white">{fullName}</strong> (NIK: {nik})
                </p>
                <p>
                  • Jadwal: <strong className="text-white">{consultationDate}</strong> jam {consultationTime} WIB
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Kembali</span>
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-amber-950/40 flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  <FileText className="w-4 h-4" />
                  <span>{submitting ? 'Menyimpan ke Database...' : 'Kirim Pendaftaran Resmi'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
