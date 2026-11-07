/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  ShieldAlert,
  Calendar,
  Wallet,
  Megaphone,
  CheckCircle,
  Clock,
  ArrowRightLeft,
  X,
  Volume2,
  FileSpreadsheet,
} from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const {
    user,
    state,
    isAdminPanelOpen,
    setIsAdminPanelOpen,
    setActiveTab,
    setIsPanicModalOpen,
    testPanicAudio,
  } = useApp();

  if (!isAdminPanelOpen || user.role !== 'rt_rw') return null;

  const pendingSwaps = state?.shiftSwaps.filter((s) => s.status === 'pending') || [];
  const totalBalance =
    (state?.cashTransactions
      .filter((t) => t.type === 'PEMASUKAN')
      .reduce((a, b) => a + b.amount, 0) || 0) -
    (state?.cashTransactions
      .filter((t) => t.type === 'PENGELUARAN')
      .reduce((a, b) => a + b.amount, 0) || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-emerald-900 text-white p-6 relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/assets/aistudio/IMG-20261107-WA0006_2005fda4.jpg"
              alt="Logo"
              className="w-12 h-12 rounded-full border-2 border-amber-400 bg-white p-0.5 object-contain"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300 bg-emerald-950/80 px-2 py-0.5 rounded">
                  Dashboard Khusus RT/RW
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold mt-1">
                Pusat Kendali Pengurus RT.01 RW.02
              </h2>
              <p className="text-xs text-emerald-200">
                Akses Eksklusif Ketua RT/RW & Seksi Keamanan Babakan Pandan
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAdminPanelOpen(false)}
            className="text-emerald-200 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">
                Petugas Ronda Terjadwal
              </span>
              <div className="text-xl font-extrabold text-slate-900 mt-0.5">
                30 Warga / Shift
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Malam Ini & Malam Besok</p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">
                Permohonan Tukar Shift
              </span>
              <div className="text-xl font-extrabold text-amber-700 mt-0.5">
                {pendingSwaps.length} Menunggu
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Butuh verifikasi RT</p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">
                Sisa Saldo Kas RT
              </span>
              <div className="text-xl font-extrabold text-emerald-800 mt-0.5 font-mono">
                Rp {totalBalance.toLocaleString('id-ID')}
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Iuran & kas siskamling</p>
            </div>
          </div>

          {/* Action Hub */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Aksi Utama Pengurus RT/RW
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* 1. Kelola Jadwal 30 Warga */}
              <button
                onClick={() => {
                  setIsAdminPanelOpen(false);
                  setActiveTab('jadwal');
                }}
                className="p-3.5 bg-white border border-slate-200 hover:border-emerald-600 hover:bg-emerald-50/50 rounded-xl text-left transition-all space-y-1 group"
              >
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>Ubah Jadwal Ronda (Malam Ini & Besok)</span>
                </div>
                <p className="text-xs text-slate-600">
                  Edit 30 nama warga, atur titik pos ronda (5 titik pantau), dan tentukan koordinator shift.
                </p>
              </button>

              {/* 2. Broadcast Pengumuman Resmi */}
              <button
                onClick={() => {
                  setIsAdminPanelOpen(false);
                  setActiveTab('papan');
                }}
                className="p-3.5 bg-white border border-slate-200 hover:border-emerald-600 hover:bg-emerald-50/50 rounded-xl text-left transition-all space-y-1 group"
              >
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                  <Megaphone className="w-4 h-4" />
                  <span>Terbitkan Pengumuman Resmi RT/RW</span>
                </div>
                <p className="text-xs text-slate-600">
                  Siarkan instruksi kerja bakti, aturan portal malam, atau rapat warga dengan badge resmi RT.
                </p>
              </button>

              {/* 3. Kas Keuangan & Rekap Iuran */}
              <button
                onClick={() => {
                  setIsAdminPanelOpen(false);
                  setActiveTab('kas');
                }}
                className="p-3.5 bg-white border border-slate-200 hover:border-emerald-600 hover:bg-emerald-50/50 rounded-xl text-left transition-all space-y-1 group"
              >
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                  <Wallet className="w-4 h-4" />
                  <span>Buku Kas & Iuran Keamanan Bulanan</span>
                </div>
                <p className="text-xs text-slate-600">
                  Catat pengeluaran pos ronda, tandai iuran lunas per KK, dan cetak laporan pertanggungjawaban.
                </p>
              </button>

              {/* 4. Test & Kendali Alarm Darurat */}
              <button
                onClick={() => {
                  setIsAdminPanelOpen(false);
                  setIsPanicModalOpen(true);
                }}
                className="p-3.5 bg-white border border-red-200 hover:border-red-600 hover:bg-red-50/50 rounded-xl text-left transition-all space-y-1 group"
              >
                <div className="flex items-center gap-2 text-red-700 font-bold text-sm">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Kendali Sirene Darurat Real-time</span>
                </div>
                <p className="text-xs text-slate-600">
                  Nyalakan sirene broadcast seketika saat darurat, atau matikan alarm jika situasi sudah aman terkendali.
                </p>
              </button>
            </div>
          </div>

          {/* Sound Test Bar */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <Volume2 className="w-4 h-4 text-emerald-700" />
              <span>Cek fungsionalitas speaker sirene digital:</span>
            </div>
            <button
              onClick={testPanicAudio}
              className="px-3 py-1.5 font-bold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors"
            >
              Uji Sirene (4 Detik)
            </button>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 text-right">
          <button
            onClick={() => setIsAdminPanelOpen(false)}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Tutup Panel
          </button>
        </div>
      </div>
    </div>
  );
};
