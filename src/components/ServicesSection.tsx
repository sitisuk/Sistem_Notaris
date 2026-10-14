import React, { useState, useEffect } from 'react';
import { Service, ServiceCategory } from '../types/notary.ts';
import {
  Scale,
  Building2,
  Clock,
  Coins,
  CheckCircle2,
  ArrowRight,
  FileText,
  Search,
  Sparkles,
} from 'lucide-react';

interface ServicesSectionProps {
  onSelectService: (service: Service) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ onSelectService }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | ServiceCategory>('ALL');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/services');
      if (res.ok) {
        const data = await res.json();
        setServices(data);
      }
    } catch (err) {
      console.error('Failed to load services:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = services.filter((s) => {
    const matchCat = filter === 'ALL' || s.category === filter;
    const matchSearch =
      search === '' ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const parseRequirements = (reqStr: string): string[] => {
    try {
      return JSON.parse(reqStr);
    } catch {
      return [reqStr];
    }
  };

  return (
    <section className="py-16 bg-slate-900 text-slate-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Katalog Resmi Pelayanan Hukum</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Layanan Akta Notaris & PPAT
          </h2>
          <p className="mt-3 text-slate-400 text-sm sm:text-base">
            Pelajari persyaratan yuridis, estimasi waktu penyelesaian, dan estimasi biaya resmi
            untuk setiap jenis akta otentik.
          </p>
        </div>

        {/* Filter Controls & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10 pb-6 border-b border-slate-800">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 p-1 bg-slate-800/80 rounded-xl border border-slate-700 w-full sm:w-auto">
            <button
              onClick={() => setFilter('ALL')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                filter === 'ALL'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-950/20'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Semua Layanan ({services.length})
            </button>
            <button
              onClick={() => setFilter('NOTARIS')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                filter === 'NOTARIS'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-950/20'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Layanan Notaris
            </button>
            <button
              onClick={() => setFilter('PPAT')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                filter === 'PPAT'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-950/20'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Layanan PPAT (Tanah)
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari akta (cth: AJB, PT, Hibah...)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-500/60 transition-colors"
            />
          </div>
        </div>

        {/* Content Cards */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <p className="mt-3 text-slate-400 text-sm">Memuat katalog layanan dari database Cloud SQL...</p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-16 bg-slate-800/40 rounded-2xl border border-slate-800">
            <Scale className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-base font-semibold text-slate-300">Layanan tidak ditemukan</p>
            <p className="text-xs text-slate-500 mt-1">Coba gunakan kata kunci pencarian yang lain.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => {
              const reqs = parseRequirements(service.requirements);
              const isExpanded = expandedId === service.id;

              return (
                <div
                  key={service.id}
                  className="bg-slate-800/60 hover:bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 transition-all duration-200 flex flex-col justify-between group hover:border-amber-500/40 hover:shadow-xl hover:shadow-slate-950/40"
                >
                  <div>
                    {/* Header: Category Badge & Code */}
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${
                          service.category === 'PPAT'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                        }`}
                      >
                        {service.category === 'PPAT' ? 'PPAT (Pertanahan)' : 'Kenotariatan'}
                      </span>
                      <span className="font-mono text-xs text-slate-400 font-semibold">
                        Kode: {service.code}
                      </span>
                    </div>

                    {/* Service Name */}
                    <h3 className="font-serif text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                      {service.name}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-slate-300 mt-2 line-clamp-3 leading-relaxed">
                      {service.description}
                    </p>

                    {/* Key Attributes */}
                    <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-700/60 text-xs">
                      <div className="flex items-center gap-2 bg-slate-900/60 p-2 rounded-lg">
                        <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                        <div>
                          <p className="text-[10px] text-slate-400">Estimasi</p>
                          <p className="font-semibold text-white">~{service.estimatedDays} Hari Kerja</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 bg-slate-900/60 p-2 rounded-lg">
                        <Coins className="w-4 h-4 text-amber-400 shrink-0" />
                        <div>
                          <p className="text-[10px] text-slate-400">Estimasi Biaya</p>
                          <p className="font-semibold text-white">{formatCurrency(service.baseFee)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Requirements Checklist */}
                    <div className="mt-4">
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : service.id)}
                        className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>
                          {isExpanded ? 'Sembunyikan Syarat' : `Lihat ${reqs.length} Syarat Dokumen`}
                        </span>
                      </button>

                      {isExpanded && (
                        <div className="mt-2.5 p-3 rounded-xl bg-slate-900/90 border border-slate-700/80 space-y-1.5 text-xs text-slate-300">
                          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                            Dokumen yang wajib disiapkan:
                          </p>
                          {reqs.map((req, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                              <span className="leading-tight">{req}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="mt-6 pt-4 border-t border-slate-700/60">
                    <button
                      onClick={() => onSelectService(service)}
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-700/80 hover:bg-amber-500 text-slate-200 hover:text-slate-950 font-bold text-xs tracking-wide transition-all flex items-center justify-center gap-2 group/btn"
                    >
                      <span>Daftar Permohonan Akta</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
