import React, { useState, useEffect } from 'react';
import {
  Registration,
  RegistrationStatus,
  DashboardStats,
  STATUS_CONFIG,
} from '../types/notary.ts';
import { useAuth } from '../context/AuthContext.tsx';
import {
  ShieldCheck,
  Search,
  Filter,
  RefreshCw,
  Edit3,
  Trash2,
  Printer,
  FileText,
  Download,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Coins,
  Scale,
  Building2,
  X,
  Save,
  Database,
  LogOut,
} from 'lucide-react';

interface AdminPortalProps {
  onOpenReceipt: (reg: Registration) => void;
  onCloseAdmin: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ onOpenReceipt, onCloseAdmin }) => {
  const { idToken, currentUser, isAdmin, logout } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [currentView, setCurrentView] = useState<'LIST' | 'REPERTORIUM' | 'DATABASE'>('LIST');

  // Database Explorer state
  const [selectedTable, setSelectedTable] = useState<'registrations' | 'services' | 'activity_logs' | 'users'>('registrations');
  const [tableData, setTableData] = useState<any[]>([]);
  const [loadingTable, setLoadingTable] = useState(false);
  const [dbSummary, setDbSummary] = useState<any>(null);
  const [viewJsonId, setViewJsonId] = useState<number | null>(null);

  // Edit / Update Modal state
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  const [newStatus, setNewStatus] = useState<RegistrationStatus>('MENUNGGU_VERIFIKASI');
  const [notaryDeedNumber, setNotaryDeedNumber] = useState('');
  const [repertoriumNumber, setRepertoriumNumber] = useState('');
  const [officialFee, setOfficialFee] = useState<number>(0);
  const [adminNotes, setAdminNotes] = useState('');
  const [assignedStaff, setAssignedStaff] = useState('');
  const [logTitle, setLogTitle] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [modalError, setModalError] = useState('');

  // Delete confirm modal
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, [statusFilter, categoryFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch dashboard stats
      const statsRes = await fetch('/api/dashboard/stats');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // 2. Fetch registrations with filters
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (categoryFilter !== 'ALL') params.set('category', categoryFilter);
      if (search.trim()) params.set('search', search.trim());

      const regRes = await fetch(`/api/registrations?${params.toString()}`);
      if (regRes.ok) {
        const regData = await regRes.json();
        setRegistrations(regData);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTableData = async (table: string) => {
    setLoadingTable(true);
    try {
      const res = await fetch(`/api/database/tables?table=${table}`);
      if (res.ok) {
        const json = await res.json();
        setTableData(json.rows || []);
      }
      const sumRes = await fetch('/api/database/summary');
      if (sumRes.ok) {
        const sumJson = await sumRes.json();
        setDbSummary(sumJson);
      }
    } catch (err) {
      console.error('Failed to load table data:', err);
    } finally {
      setLoadingTable(false);
    }
  };

  useEffect(() => {
    if (currentView === 'DATABASE') {
      loadTableData(selectedTable);
    }
  }, [currentView, selectedTable]);

  const openEditModal = (reg: Registration) => {
    setSelectedReg(reg);
    setNewStatus(reg.status);
    setNotaryDeedNumber(reg.notaryDeedNumber || '');
    setRepertoriumNumber(reg.repertoriumNumber || '');
    setOfficialFee(reg.officialFee || 0);
    setAdminNotes(reg.adminNotes || '');
    setAssignedStaff(reg.assignedStaff || 'TRI AKHSANUL IMAN, S.H., M.Kn.');
    setLogTitle('');
    setModalError('');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReg) return;

    setSavingEdit(true);
    setModalError('');

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (idToken) headers['Authorization'] = `Bearer ${idToken}`;

      const res = await fetch(`/api/registrations/${selectedReg.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          status: newStatus,
          notaryDeedNumber: notaryDeedNumber.trim() || undefined,
          repertoriumNumber: repertoriumNumber.trim() || undefined,
          officialFee: Number(officialFee),
          adminNotes: adminNotes.trim() || undefined,
          assignedStaff: assignedStaff.trim() || undefined,
          logTitle: logTitle.trim() || undefined,
          logDescription: adminNotes.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal memperbarui status');
      }

      setSelectedReg(null);
      await loadData();
    } catch (err: any) {
      console.error(err);
      setModalError(err.message || 'Gagal menyimpan perubahan ke database');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/registrations/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Gagal menghapus berkas');
      setDeleteTargetId(null);
      await loadData();
    } catch (err) {
      console.error(err);
      alert('Gagal menghapus berkas');
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (registrations.length === 0) return;

    const headers = [
      'No. Registrasi',
      'Tanggal Daftar',
      'Nama Pemohon',
      'NIK',
      'Perusahaan',
      'Email',
      'Telepon',
      'Kategori',
      'Layanan Akta',
      'Status',
      'No. Akta',
      'No. Repertorium',
      'Biaya Resmi (Rp)',
      'Petugas',
    ];

    const rows = registrations.map((r) => [
      r.registrationNumber,
      new Date(r.createdAt).toLocaleDateString('id-ID'),
      `"${r.fullName}"`,
      `'${r.nik}`,
      `"${r.companyName || '-'}"`,
      r.email,
      `'${r.phone}`,
      r.serviceCategory,
      `"${r.serviceName}"`,
      r.status,
      `"${r.notaryDeedNumber || '-'}"`,
      `"${r.repertoriumNumber || '-'}"`,
      r.officialFee || 0,
      `"${r.assignedStaff || '-'}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Laporan_Kantor_Notaris_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="py-10 bg-slate-950 text-slate-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <ShieldCheck className="w-6 h-6" />
              </span>
              <div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                  Panel Administrator & Manajemen Kantor Notaris
                </h1>
                <p className="text-xs text-slate-400">
                  Pengelolaan berkas permohonan akta, validasi yuridis, dan Buku Repertorium
                  (Database Cloud SQL PostgreSQL)
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Ekspor CSV</span>
            </button>

            <button
              onClick={loadData}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              title="Segarkan Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={async () => {
                await logout();
                onCloseAdmin();
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-rose-900/40 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-semibold transition-colors flex items-center gap-1.5"
              title="Kunci sesi admin dan kembali ke beranda"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Kunci & Keluar</span>
            </button>

            <button
              onClick={onCloseAdmin}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <X className="w-4 h-4" />
              <span>Tutup Panel</span>
            </button>
          </div>
        </div>

        {/* STATS OVERVIEW CARDS */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 my-8">
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Total Berkas
              </p>
              <p className="text-2xl font-serif font-bold text-white mt-1">{stats.total}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Semua permohonan</p>
            </div>

            <div className="bg-slate-900/90 border border-amber-500/30 p-4 rounded-2xl">
              <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                Menunggu Verifikasi
              </p>
              <p className="text-2xl font-serif font-bold text-amber-300 mt-1">{stats.pending}</p>
              <p className="text-[10px] text-amber-400/80 mt-0.5">Perlu diperiksa</p>
            </div>

            <div className="bg-slate-900/90 border border-sky-500/30 p-4 rounded-2xl">
              <p className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">
                Sedang Diproses
              </p>
              <p className="text-2xl font-serif font-bold text-sky-300 mt-1">{stats.inProgress}</p>
              <p className="text-[10px] text-sky-400/80 mt-0.5">Minuta / Pengesahan</p>
            </div>

            <div className="bg-slate-900/90 border border-teal-500/30 p-4 rounded-2xl">
              <p className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">
                Jadwal Tanda Tangan
              </p>
              <p className="text-2xl font-serif font-bold text-teal-300 mt-1">
                {stats.scheduledSigning}
              </p>
              <p className="text-[10px] text-teal-400/80 mt-0.5">Siap di hadapan Notaris</p>
            </div>

            <div className="bg-slate-900/90 border border-emerald-500/30 p-4 rounded-2xl">
              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                Selesai / Terbit
              </p>
              <p className="text-2xl font-serif font-bold text-emerald-300 mt-1">{stats.completed}</p>
              <p className="text-[10px] text-emerald-400/80 mt-0.5">Telah diserahkan</p>
            </div>

            <div className="bg-slate-900/90 border border-indigo-500/30 p-4 rounded-2xl">
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                Rekapitulasi Biaya
              </p>
              <p className="text-base font-serif font-bold text-indigo-300 mt-1 truncate">
                {formatCurrency(stats.totalFee)}
              </p>
              <p className="text-[10px] text-indigo-400/80 mt-0.5">Honorarium & PNBP</p>
            </div>
          </div>
        )}

        {/* View Toggle Tabs */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800">
            <button
              onClick={() => setCurrentView('LIST')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                currentView === 'LIST'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Daftar Berkas Pendaftaran</span>
            </button>
            <button
              onClick={() => setCurrentView('REPERTORIUM')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                currentView === 'REPERTORIUM'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Buku Repertorium Notaris</span>
            </button>
            <button
              onClick={() => setCurrentView('DATABASE')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                currentView === 'DATABASE'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Database PostgreSQL (Tabel Masuk)</span>
            </button>
          </div>

          <span className="text-xs text-slate-400 font-mono hidden sm:inline">
            Menampilkan: {registrations.length} Berkas
          </span>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl mb-6 flex flex-col md:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative w-full md:flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama pemohon, NIK, No. Registrasi, atau No. Akta..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadData()}
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Category Filter */}
          <div className="w-full md:w-auto">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full md:w-44 px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
            >
              <option value="ALL">Semua Kategori</option>
              <option value="NOTARIS">Kenotariatan</option>
              <option value="PPAT">PPAT (Tanah)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full md:w-52 px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
            >
              <option value="ALL">Semua Status</option>
              <option value="MENUNGGU_VERIFIKASI">Menunggu Verifikasi</option>
              <option value="VERIFIKASI_BERKAS">Pemeriksaan Berkas</option>
              <option value="PENYUSUNAN_DRAFT">Penyusunan Minuta</option>
              <option value="JADWAL_TANDATANGAN">Jadwal Tanda Tangan</option>
              <option value="PROSES_PENGESAHAN">Pengesahan / Pendaftaran</option>
              <option value="SELESAI">Selesai & Diserahkan</option>
              <option value="DITOLAK">Ditolak</option>
            </select>
          </div>
        </div>

        {/* DATA TABLE VIEW */}
        {currentView === 'LIST' && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">No. Registrasi</th>
                    <th className="py-3.5 px-4">Pemohon & NIK</th>
                    <th className="py-3.5 px-4">Layanan Akta</th>
                    <th className="py-3.5 px-4">Jadwal Temu</th>
                    <th className="py-3.5 px-4">Status Berkas</th>
                    <th className="py-3.5 px-4">No. Akta / Repertorium</th>
                    <th className="py-3.5 px-4">Biaya Resmi</th>
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        <div className="inline-block w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                        <p className="mt-2 text-xs">Mengambil data dari PostgreSQL...</p>
                      </td>
                    </tr>
                  ) : registrations.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500">
                        Tidak ada berkas yang sesuai dengan kriteria filter.
                      </td>
                    </tr>
                  ) : (
                    registrations.map((reg) => {
                      const st = STATUS_CONFIG[reg.status] || STATUS_CONFIG.MENUNGGU_VERIFIKASI;
                      return (
                        <tr key={reg.id} className="hover:bg-slate-800/50 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                            {reg.registrationNumber}
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="font-bold text-white leading-tight">{reg.fullName}</p>
                            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                              NIK: {reg.nik}
                            </p>
                            {reg.companyName && (
                              <p className="text-[10px] text-amber-300">{reg.companyName}</p>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                                reg.serviceCategory === 'PPAT'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                              }`}
                            >
                              {reg.serviceCategory}
                            </span>
                            <p className="text-white font-medium mt-1 leading-tight line-clamp-1">
                              {reg.serviceName}
                            </p>
                          </td>
                          <td className="py-3.5 px-4 font-medium">
                            <p className="text-white">{reg.consultationDate}</p>
                            <p className="text-[11px] text-slate-400">{reg.consultationTime} WIB</p>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold border ${st.bg} ${st.border}`}
                            >
                              {st.label}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[11px]">
                            {reg.notaryDeedNumber ? (
                              <div>
                                <p className="text-amber-300 font-semibold">{reg.notaryDeedNumber}</p>
                                <p className="text-slate-400 text-[10px]">{reg.repertoriumNumber || '-'}</p>
                              </div>
                            ) : (
                              <span className="text-slate-500 italic">Belum terbit</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-semibold text-white">
                            {formatCurrency(reg.officialFee || 0)}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openEditModal(reg)}
                                title="Update Status & Akta"
                                className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-slate-950 border border-amber-500/20 transition-colors"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onOpenReceipt(reg)}
                                title="Cetak Tanda Terima"
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteTargetId(reg.id)}
                                title="Hapus Berkas"
                                className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* BUKU REPERTORIUM NOTARIS VIEW */}
        {currentView === 'REPERTORIUM' && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-white">
                  Buku Daftar Akta (Repertorium) Notaris & PPAT
                </h3>
                <p className="text-xs text-slate-400">
                  Format pencatatan yuridis sesuai Pasal 58 Undang-Undang Nomor 2 Tahun 2014 tentang
                  Jabatan Notaris.
                </p>
              </div>
              <span className="text-xs font-mono text-amber-400 font-bold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                Tahun Buku: {new Date().getFullYear()}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-800">
                <thead className="bg-slate-950 text-slate-300 text-[11px] font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3 border-r border-slate-800">No. Urut</th>
                    <th className="py-2.5 px-3 border-r border-slate-800">No. Akta</th>
                    <th className="py-2.5 px-3 border-r border-slate-800">Tanggal Akta</th>
                    <th className="py-2.5 px-3 border-r border-slate-800">Sifat / Judul Akta</th>
                    <th className="py-2.5 px-3 border-r border-slate-800">Para Pihak / Penghadap</th>
                    <th className="py-2.5 px-3 border-r border-slate-800">Buku Repertorium</th>
                    <th className="py-2.5 px-3">Status Yuridis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300 font-mono text-[11px]">
                  {registrations.map((reg, idx) => (
                    <tr key={reg.id} className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 border-r border-slate-800 text-center">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-800 font-bold text-amber-300">
                        {reg.notaryDeedNumber || '-'}
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-800 font-sans">
                        {reg.consultationDate}
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-800 font-sans font-semibold text-white">
                        {reg.serviceName}
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-800 font-sans">
                        <p className="font-semibold">{reg.fullName}</p>
                        {reg.companyName && <p className="text-amber-400 text-[10px]">{reg.companyName}</p>}
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-800 font-bold text-slate-300">
                        {reg.repertoriumNumber || '-'}
                      </td>
                      <td className="py-2.5 px-3 font-sans">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            STATUS_CONFIG[reg.status]?.bg || 'bg-slate-800'
                          }`}
                        >
                          {STATUS_CONFIG[reg.status]?.label || reg.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* DATABASE POSTGRESQL EXPLORER VIEW */}
        {currentView === 'DATABASE' && (
          <div className="space-y-6">
            {/* Database Engine Status Banner */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-bold text-white flex items-center gap-2">
                      <span>PostgreSQL Database Explorer</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                        Connected (Port 5432)
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      Database: {dbSummary?.database || 'Cloud SQL'} • Region: asia-southeast1
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => loadTableData(selectedTable)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto border border-slate-700"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingTable ? 'animate-spin' : ''}`} />
                  <span>Segarkan Tabel</span>
                </button>
              </div>

              {/* Table Selectors */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                {[
                  { id: 'registrations', label: 'registrations', desc: 'Berkas Pendaftaran' },
                  { id: 'services', label: 'services', desc: 'Katalog Layanan' },
                  { id: 'activity_logs', label: 'activity_logs', desc: 'Riwayat Audit Trail' },
                  { id: 'users', label: 'users', desc: 'Akun Pengguna' },
                ].map((tbl) => {
                  const isSelected = selectedTable === tbl.id;
                  const rowCount = dbSummary?.tables?.find((t: any) => t.name === tbl.id)?.rowCount ?? tableData.length;
                  return (
                    <button
                      key={tbl.id}
                      onClick={() => setSelectedTable(tbl.id as any)}
                      className={`p-3.5 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-400 text-white shadow-md'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-950 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-amber-300">
                          {tbl.label}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                          {isSelected ? tableData.length : rowCount} baris
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">{tbl.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Table Raw Data View */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                <div>
                  <h4 className="font-mono text-sm font-bold text-white flex items-center gap-2">
                    <span>SELECT * FROM {selectedTable};</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    Total {tableData.length} baris data ditemukan di basis data PostgreSQL.
                  </p>
                </div>
              </div>

              {loadingTable ? (
                <div className="py-16 text-center text-slate-400">
                  <div className="inline-block w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                  <p className="mt-2 text-xs">Mengambil data dari PostgreSQL...</p>
                </div>
              ) : tableData.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  Tabel ini belum memiliki data.
                </div>
              ) : (
                <div className="overflow-x-auto max-h-96 overflow-y-auto">
                  <table className="w-full text-left text-[11px] border border-slate-800 font-mono">
                    <thead className="bg-slate-950 text-amber-400 uppercase tracking-wider sticky top-0 border-b border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3 border-r border-slate-800">#</th>
                        {Object.keys(tableData[0]).map((col) => (
                          <th key={col} className="py-2.5 px-3 border-r border-slate-800 whitespace-nowrap">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {tableData.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/40">
                          <td className="py-2 px-3 border-r border-slate-800 text-slate-500">
                            {idx + 1}
                          </td>
                          {Object.keys(tableData[0]).map((col) => {
                            const val = row[col];
                            const display =
                              val === null || val === undefined
                                ? 'NULL'
                                : typeof val === 'object'
                                ? JSON.stringify(val)
                                : String(val);
                            return (
                              <td
                                key={col}
                                className="py-2 px-3 border-r border-slate-800 max-w-xs truncate"
                                title={display}
                              >
                                {val === null ? (
                                  <span className="text-slate-600 italic">null</span>
                                ) : (
                                  display
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODAL EDIT STATUS & AKTA */}
        {selectedReg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl text-left max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h3 className="font-serif text-lg font-bold text-white">
                    Perbarui Status & Data Berkas Akta
                  </h3>
                  <p className="text-xs text-amber-400 font-mono">
                    {selectedReg.registrationNumber} • {selectedReg.fullName}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedReg(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {modalError && (
                <div className="my-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  {modalError}
                </div>
              )}

              <form onSubmit={handleSaveEdit} className="mt-5 space-y-4 text-xs">
                {/* Status Selector */}
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Tahapan / Status Berkas Saat Ini *
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as RegistrationStatus)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-semibold focus:outline-none focus:border-amber-400"
                  >
                    <option value="MENUNGGU_VERIFIKASI">1. Menunggu Verifikasi</option>
                    <option value="VERIFIKASI_BERKAS">2. Pemeriksaan Berkas & Pajak</option>
                    <option value="PENYUSUNAN_DRAFT">3. Penyusunan Minuta Akta</option>
                    <option value="JADWAL_TANDATANGAN">4. Jadwal Pembacaan & Tanda Tangan</option>
                    <option value="PROSES_PENGESAHAN">5. Pengesahan Kemenkumham / BPN</option>
                    <option value="SELESAI">6. Selesai & Diserahkan</option>
                    <option value="DITOLAK">Ditolak / Perlu Perbaikan</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Nomor Akta Notaris Resmi
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Akta No. 12/AJB/X/2026"
                      value={notaryDeedNumber}
                      onChange={(e) => setNotaryDeedNumber(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Nomor Buku Repertorium
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: REP-2026-0150"
                      value={repertoriumNumber}
                      onChange={(e) => setRepertoriumNumber(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Biaya / Honorarium Resmi (Rp)
                    </label>
                    <input
                      type="number"
                      value={officialFee}
                      onChange={(e) => setOfficialFee(Number(e.target.value))}
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Petugas Penanggung Jawab
                    </label>
                    <input
                      type="text"
                      value={assignedStaff}
                      onChange={(e) => setAssignedStaff(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Judul Catatan Riwayat Baru (Activity Log)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Minuta Akta Siap Dibacakan"
                    value={logTitle}
                    onChange={(e) => setLogTitle(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Uraian Catatan Petugas / Penjelasan Status
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Contoh: Berkas asli telah diterima dan diverifikasi. Penandatanganan dijadwalkan tanggal 18 Oktober pukul 14:00."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setSelectedReg(null)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={savingEdit}
                    className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{savingEdit ? 'Menyimpan...' : 'Simpan Pembaruan'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL KONFIRMASI HAPUS */}
        {deleteTargetId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
            <div className="bg-slate-900 border border-rose-500/30 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl">
              <div className="w-12 h-12 bg-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-500/30">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-white">Hapus Berkas Pendaftaran?</h3>
              <p className="text-xs text-slate-400 mt-2">
                Tindakan ini akan menghapus data pendaftaran dan riwayat log aktivitas secara permanen
                dari database.
              </p>
              <div className="flex items-center justify-center gap-3 mt-6">
                <button
                  onClick={() => setDeleteTargetId(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  onClick={() => handleDelete(deleteTargetId)}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
                >
                  Ya, Hapus Permanen
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
