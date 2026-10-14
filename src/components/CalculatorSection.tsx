import React, { useState } from 'react';
import { Calculator, Coins, ShieldCheck, ArrowRight, HelpCircle, FileText } from 'lucide-react';

interface CalculatorSectionProps {
  onGoToRegister: () => void;
}

export const CalculatorSection: React.FC<CalculatorSectionProps> = ({ onGoToRegister }) => {
  const [calcType, setCalcType] = useState<'PPAT_AJB' | 'PT_CORP'>('PPAT_AJB');

  // PPAT AJB inputs
  const [propertyPrice, setPropertyPrice] = useState<number>(500000000); // 500 Juta
  const [npoptkp, setNpoptkp] = useState<number>(80000000); // 80 Juta NPOPTKP default Kota Bandung
  const [notaryRate, setNotaryRate] = useState<number>(1.0); // 1.0%

  // PT Corp inputs
  const [modalDasar, setModalDasar] = useState<number>(500000000);
  const [includeSKKemenkumham, setIncludeSKKemenkumham] = useState(true);
  const [includeNIB, setIncludeNIB] = useState(true);

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Calculations for PPAT AJB:
  // 1. BPHTB Pembeli = 5% * max(0, Nilai Transaksi - NPOPTKP)
  const bphtb = Math.max(0, (propertyPrice - npoptkp) * 0.05);

  // 2. PPh Final Penjual = 2.5% * Nilai Transaksi
  const pphPenjual = propertyPrice * 0.025;

  // 3. Jasa PPAT (AJB) = (rate / 100) * Nilai Transaksi (dibatasi max 1% sesuai Permen ATR/BPN)
  const jasaPpat = propertyPrice * (notaryRate / 100);

  // 4. PNBP Pengecekan Sertifikat & Validasi BPN
  const pnbpCekSertifikat = 100000;

  // 5. PNBP Balik Nama Sertifikat BPN = (Nilai Transaksi / 1000) + 50.000
  const pnbpBalikNama = propertyPrice / 1000 + 50000;

  // Total biaya pembeli: BPHTB + Jasa PPAT + PNBP Cek & Balik Nama
  const totalBiayaPembeli = bphtb + jasaPpat + pnbpCekSertifikat + pnbpBalikNama;

  return (
    <section className="py-16 bg-slate-900 text-slate-100 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            Transparansi Estimasi Biaya
          </span>
          <h2 className="font-serif text-3xl font-bold text-white mt-3">
            Kalkulator Simulasi Biaya Akta & Pajak
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Hitung perkiraan estimasi BPHTB, PPh Final, PNBP Kantor Pertanahan (BPN), dan honorarium
            resmi akta secara cepat dan akurat.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex justify-center mb-8">
          <div className="p-1 bg-slate-800 rounded-2xl border border-slate-700 flex gap-2">
            <button
              onClick={() => setCalcType('PPAT_AJB')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                calcType === 'PPAT_AJB'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Simulasi AJB & Balik Nama Tanah (PPAT)
            </button>
            <button
              onClick={() => setCalcType('PT_CORP')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                calcType === 'PT_CORP'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Simulasi Pendirian PT / Badan Usaha
            </button>
          </div>
        </div>

        {calcType === 'PPAT_AJB' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Input Form Column */}
            <div className="lg:col-span-6 bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-xl">
              <h3 className="font-serif text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-amber-400" />
                <span>Parameter Transaksi Properti</span>
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nilai Transaksi Jual Beli / NJOP (Rp):
                  </label>
                  <input
                    type="number"
                    step="10000000"
                    value={propertyPrice}
                    onChange={(e) => setPropertyPrice(Math.max(0, Number(e.target.value)))}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-amber-400"
                  />
                  <p className="text-[11px] text-amber-400 font-medium mt-1">
                    Terbilang: {formatCurrency(propertyPrice)}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    NPOPTKP (Nilai Perolehan Objek Pajak Tidak Kena Pajak):
                  </label>
                  <select
                    value={npoptkp}
                    onChange={(e) => setNpoptkp(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400"
                  >
                    <option value={80000000}>Rp 80.000.000 (Kabupaten Bekasi & Jabar)</option>
                    <option value={60000000}>Rp 60.000.000 (DKI Jakarta / Standar Nasional)</option>
                    <option value={300000000}>Rp 300.000.000 (Khusus Hibah Wasiat / Hak Waris)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tarif Jasa PPAT (Maks. 1% Permen ATR/BPN No. 33/2021):
                  </label>
                  <select
                    value={notaryRate}
                    onChange={(e) => setNotaryRate(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400"
                  >
                    <option value={0.75}>0.75% (Promo Transaksi Besar)</option>
                    <option value={1.0}>1.0% (Standar PPAT)</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-700 text-xs text-slate-400 flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p>
                  Perhitungan ini merupakan simulasi estimasi sesuai regulasi UU Perpajakan dan BPN.
                  Biaya riil dapat disesuaikan saat pemeriksaan fisik sertifikat dan lokasi tanah.
                </p>
              </div>
            </div>

            {/* Results Column */}
            <div className="lg:col-span-6 bg-slate-800/90 border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-slate-700">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Rincian Estimasi Biaya
                </span>
                <span className="text-xs text-slate-400">AJB & Balik Nama</span>
              </div>

              {/* Breakdown */}
              <div className="py-4 space-y-3 text-xs">
                {/* 1. Pajak Penjual */}
                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-white">PPh Final Penjual (2.5%)</p>
                    <p className="text-[10px] text-slate-400">Ditanggung oleh pihak Penjual</p>
                  </div>
                  <span className="font-mono font-bold text-amber-300 text-sm">
                    {formatCurrency(pphPenjual)}
                  </span>
                </div>

                {/* 2. BPHTB Pembeli */}
                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-white">BPHTB Pembeli (5%)</p>
                    <p className="text-[10px] text-slate-400">
                      5% x ({formatCurrency(propertyPrice)} - {formatCurrency(npoptkp)})
                    </p>
                  </div>
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    {formatCurrency(bphtb)}
                  </span>
                </div>

                {/* 3. Jasa PPAT */}
                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-white">Honorarium Akta PPAT ({notaryRate}%)</p>
                    <p className="text-[10px] text-slate-400">Penyusunan Minuta & Saksi Akta</p>
                  </div>
                  <span className="font-mono font-bold text-white text-sm">
                    {formatCurrency(jasaPpat)}
                  </span>
                </div>

                {/* 4. PNBP BPN */}
                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-white">PNBP Cek Sertifikat & Balik Nama BPN</p>
                    <p className="text-[10px] text-slate-400">Validasi sertifikat & pendaftaran Kantor Pertanahan</p>
                  </div>
                  <span className="font-mono font-bold text-white text-sm">
                    {formatCurrency(pnbpCekSertifikat + pnbpBalikNama)}
                  </span>
                </div>
              </div>

              {/* Total Card */}
              <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 mt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      Total Estimasi Biaya Pembeli
                    </p>
                    <p className="text-[10px] text-slate-400">
                      (BPHTB + Honorarium PPAT + PNBP BPN)
                    </p>
                  </div>
                  <span className="font-mono text-xl sm:text-2xl font-extrabold text-amber-300">
                    {formatCurrency(totalBiayaPembeli)}
                  </span>
                </div>
              </div>

              <button
                onClick={onGoToRegister}
                className="w-full mt-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-lg shadow-amber-950/40"
              >
                <span>Daftar Permohonan AJB Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* PT CORP CALCULATOR */
          <div className="max-w-2xl mx-auto bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-xl">
            <h3 className="font-serif text-lg font-bold text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" />
              <span>Paket Lengkap Pendirian PT (Perseroan Terbatas)</span>
            </h3>

            <div className="space-y-4 text-xs">
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm text-white">Akta Notaris & SK Kemenkumham RI</p>
                    <p className="text-slate-400 mt-0.5">
                      Pemesanan nama PT, minuta akta pendirian, dan pengesahan SK Menkumham (SABU).
                    </p>
                  </div>
                  <span className="font-mono text-base font-bold text-amber-400">Rp 4.500.000</span>
                </div>
              </div>

              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm text-white">NPWP Badan & NIB OSS RBA</p>
                    <p className="text-slate-400 mt-0.5">
                      Penerbitan Nomor Induk Berusaha (NIB), Sertifikat Standar, dan NPWP Perusahaan.
                    </p>
                  </div>
                  <span className="font-mono text-base font-bold text-emerald-400">Termasuk Paket</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    Total Biaya Paket PT All-In
                  </p>
                  <p className="text-[10px] text-slate-400">Estimasi pengerjaan: 5 - 7 hari kerja</p>
                </div>
                <span className="font-mono text-2xl font-extrabold text-amber-300">
                  Rp 4.500.000
                </span>
              </div>

              <button
                onClick={onGoToRegister}
                className="w-full mt-4 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-lg"
              >
                <span>Daftar Pendirian PT Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
