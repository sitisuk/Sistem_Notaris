export type ClientType = 'INDIVIDUAL' | 'COMPANY';

export type ServiceCategory = 'NOTARIS' | 'PPAT';

export type RegistrationStatus =
  | 'MENUNGGU_VERIFIKASI'
  | 'VERIFIKASI_BERKAS'
  | 'PENYUSUNAN_DRAFT'
  | 'JADWAL_TANDATANGAN'
  | 'PROSES_PENGESAHAN'
  | 'SELESAI'
  | 'DITOLAK';

export interface Service {
  id: number;
  code: string;
  category: ServiceCategory;
  name: string;
  description: string;
  requirements: string; // JSON string array
  estimatedDays: number;
  baseFee: number;
  isActive: boolean;
  createdAt?: string;
}

export interface Registration {
  id: number;
  registrationNumber: string;
  clientType: ClientType;
  fullName: string;
  nik: string;
  npwp?: string | null;
  companyName?: string | null;
  email: string;
  phone: string;
  address: string;
  serviceId?: number | null;
  serviceName: string;
  serviceCategory: ServiceCategory;
  consultationDate: string;
  consultationTime: string;
  notes?: string | null;
  documentsSubmitted?: string | null;
  status: RegistrationStatus;
  notaryDeedNumber?: string | null;
  repertoriumNumber?: string | null;
  estimatedCompletionDate?: string | null;
  officialFee: number;
  adminNotes?: string | null;
  assignedStaff?: string | null;
  userUid?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: number;
  registrationId: number;
  status: RegistrationStatus;
  title: string;
  description: string;
  actor: string;
  createdAt: string;
}

export interface DashboardStats {
  total: number;
  pending: number;
  inVerification: number;
  inDrafting: number;
  scheduledSigning: number;
  inLegalization: number;
  completed: number;
  rejected: number;
  inProgress: number;
  totalFee: number;
  countNotaris: number;
  countPPAT: number;
}

export const STATUS_CONFIG: Record<
  RegistrationStatus,
  { label: string; bg: string; text: string; border: string; stepIndex: number; desc: string }
> = {
  MENUNGGU_VERIFIKASI: {
    label: 'Menunggu Verifikasi',
    bg: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
    text: 'text-amber-700',
    border: 'border-amber-500/30',
    stepIndex: 1,
    desc: 'Permohonan telah terkirim dan sedang menunggu verifikasi awal petugas kantor notaris.',
  },
  VERIFIKASI_BERKAS: {
    label: 'Pemeriksaan Berkas',
    bg: 'bg-sky-500/10 text-sky-700 dark:text-sky-300',
    text: 'text-sky-700',
    border: 'border-sky-500/30',
    stepIndex: 2,
    desc: 'Pengecekan kelengkapan data yuridis, sertifikat, identitas, dan validasi perpajakan/BPN.',
  },
  PENYUSUNAN_DRAFT: {
    label: 'Penyusunan Minuta Akta',
    bg: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300',
    text: 'text-indigo-700',
    border: 'border-indigo-500/30',
    stepIndex: 3,
    desc: 'Asisten Notaris & PPAT sedang menyusun naskah minuta akta otentik.',
  },
  JADWAL_TANDATANGAN: {
    label: 'Jadwal Tanda Tangan Akta',
    bg: 'bg-teal-500/10 text-teal-700 dark:text-teal-300',
    text: 'text-teal-700',
    border: 'border-teal-500/30',
    stepIndex: 4,
    desc: 'Jadwal pembacaan akta dan penandatanganan para pihak di hadapan Notaris / PPAT.',
  },
  PROSES_PENGESAHAN: {
    label: 'Pengesahan / Pendaftaran',
    bg: 'bg-purple-500/10 text-purple-700 dark:text-purple-300',
    text: 'text-purple-700',
    border: 'border-purple-500/30',
    stepIndex: 5,
    desc: 'Proses pelaporan dan pendaftaran ke Kementerian Hukum & HAM (AHU Online) atau Kantor Pertanahan ATR/BPN.',
  },
  SELESAI: {
    label: 'Selesai & Diserahkan',
    bg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    text: 'text-emerald-700',
    border: 'border-emerald-500/30',
    stepIndex: 6,
    desc: 'Salinan resmi akta telah selesai, dicatat dalam Buku Repertorium, dan siap diambil oleh pihak terkait.',
  },
  DITOLAK: {
    label: 'Ditolak / Perlu Perbaikan',
    bg: 'bg-rose-500/10 text-rose-700 dark:text-rose-300',
    text: 'text-rose-700',
    border: 'border-rose-500/30',
    stepIndex: 0,
    desc: 'Berkas belum memenuhi kualifikasi yuridis atau terdapat dokumen wajib yang belum dilengkapi.',
  },
};
