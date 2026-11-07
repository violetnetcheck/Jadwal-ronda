/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import type { RondaSchedule, RondaParticipant } from '../types/index.ts';
import {
  Calendar,
  Clock,
  MapPin,
  ArrowRightLeft,
  Bell,
  CheckCircle,
  AlertCircle,
  Edit3,
  Phone,
  Search,
  Check,
  Send,
  Plus,
  Trash2,
  Save,
  X,
} from 'lucide-react';
import { playKentonganHit } from '../utils/audio.ts';

const defaultCheckpoints = [
  'Pos Ronda Utama Balai RW 02 (RT.01)',
  'Pos Pantau Blok A (Gang Melati & Lapangan)',
  'Pos Pantau Blok B (Pertigaan Mesjid & Gang Pandan)',
  'Pos Pantau Blok C (Jembatan & Batas Barat)',
  'Pos Pantau Blok D (Portal Gerbang Timur Babakan)',
];

export const ScheduleSection: React.FC = () => {
  const {
    user,
    state,
    updateSchedule,
    requestShiftSwap,
    respondShiftSwap,
  } = useApp();

  const [activeShift, setActiveShift] = useState<'tonight' | 'tomorrow'>('tonight');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPointFilter, setSelectedPointFilter] = useState<string>('all');
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [isEditScheduleModalOpen, setIsEditScheduleModalOpen] = useState(false);
  const [swapTargetCitizen, setSwapTargetCitizen] = useState('Siapa Saja yang Bersedia');
  const [swapReason, setSwapReason] = useState('');
  const [isSubmittingSwap, setIsSubmittingSwap] = useState(false);
  const [reminderActive, setReminderActive] = useState(false);

  // Edit Schedule Local State for RT/RW
  const [editableSchedule, setEditableSchedule] = useState<RondaSchedule | null>(null);

  const tonight = state?.scheduleTonight;
  const tomorrow = state?.scheduleTomorrow;
  const currentSchedule = activeShift === 'tonight' ? tonight : tomorrow;

  const participants = currentSchedule?.participants || [];

  // Filter participants
  const filteredParticipants = participants.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.block.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPoint =
      selectedPointFilter === 'all' || p.assignedPoint === selectedPointFilter;
    return matchesSearch && matchesPoint;
  });

  const handleOpenEditModal = () => {
    if (currentSchedule) {
      setEditableSchedule(JSON.parse(JSON.stringify(currentSchedule)));
      setIsEditScheduleModalOpen(true);
    }
  };

  const handleSaveSchedule = async () => {
    if (editableSchedule) {
      await updateSchedule(activeShift, editableSchedule);
      setIsEditScheduleModalOpen(false);
    }
  };

  const handleParticipantChange = (index: number, field: keyof RondaParticipant, value: string) => {
    if (!editableSchedule) return;
    const updated = [...editableSchedule.participants];
    updated[index] = { ...updated[index], [field]: value };
    setEditableSchedule({ ...editableSchedule, participants: updated });
  };

  const handleAddParticipant = () => {
    if (!editableSchedule) return;
    if (editableSchedule.participants.length >= 35) {
      alert('Maksimal daftar ronda 35 warga');
      return;
    }
    const newId = `${activeShift}-warga-${Date.now()}`;
    const newP: RondaParticipant = {
      id: newId,
      name: `Bpk. Warga Baru ${editableSchedule.participants.length + 1}`,
      phone: '0812' + Math.floor(10000000 + Math.random() * 90000000),
      block: `Blok A No. ${editableSchedule.participants.length + 1}`,
      assignedPoint: editableSchedule.checkpoints[0] || 'Pos Ronda Utama',
      attended: false,
    };
    setEditableSchedule({
      ...editableSchedule,
      participants: [...editableSchedule.participants, newP],
    });
  };

  const handleRemoveParticipant = (index: number) => {
    if (!editableSchedule) return;
    const updated = editableSchedule.participants.filter((_, i) => i !== index);
    setEditableSchedule({ ...editableSchedule, participants: updated });
  };

  const handleShiftSwapSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!swapReason.trim()) {
      alert('Mohon cantumkan alasan tukar jadwal');
      return;
    }
    setIsSubmittingSwap(true);
    await requestShiftSwap({
      shiftTitle: activeShift === 'tonight' ? 'Malam Ini' : 'Malam Besok',
      targetCitizenName: swapTargetCitizen,
      reason: swapReason.trim(),
    });
    setIsSubmittingSwap(false);
    setIsSwapModalOpen(false);
    setSwapReason('');
  };

  const handleToggleReminder = () => {
    setReminderActive(!reminderActive);
    playKentonganHit(580, 0.2);
    if (!reminderActive) {
      alert('Pengingat Ronda Diaktifkan! Suara kentongan pengingat akan berbunyi saat mendekati jam tugas ronda pukul 22:00 WIB.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <img
              src="/assets/aistudio/IMG-20261107-WA0006_2005fda4.jpg"
              alt="Logo Babakan Pandan"
              className="w-16 h-16 object-contain rounded-xl border border-amber-300 p-1 shrink-0 bg-white"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  Siskamling RT.01 RW.02 Babakan Pandan
                </span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs text-slate-500 font-medium">Periode 2025-2030</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
                Jadwal Ronda & Tukar Shift (30 Petugas)
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
                Pengaturan siskamling lingkungan Babakan Pandan. Wajib patroli keliling, koordinasi pos kamling, serta pelaporan digital berkala.
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleToggleReminder}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border transition-colors ${
                reminderActive
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              <Bell className={`w-4 h-4 ${reminderActive ? 'text-emerald-700 animate-bounce' : 'text-slate-500'}`} />
              <span>{reminderActive ? 'Pengingat Aktif' : 'Aktifkan Pengingat Ronda'}</span>
            </button>

            {/* Real Citizen Self-Roster Button */}
            {user.name && !participants.some((p) => p.name.includes(user.name) || user.name.includes(p.name)) ? (
              <button
                onClick={async () => {
                  if (!currentSchedule) return;
                  const newP: RondaParticipant = {
                    id: `${activeShift}-warga-${Date.now()}`,
                    name: user.name,
                    phone: user.whatsapp || '081200000000',
                    block: user.address || 'RT 01 RW 02 Babakan Pandan',
                    assignedPoint: defaultCheckpoints[currentSchedule.participants.length % defaultCheckpoints.length],
                    attended: false,
                  };
                  await updateSchedule(activeShift, {
                    participants: [newP, ...currentSchedule.participants],
                  });
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-xl transition-colors shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Daftarkan Diri ke Ronda {activeShift === 'tonight' ? 'Malam Ini' : 'Malam Besok'}</span>
              </button>
            ) : user.name ? (
              <span className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-800 bg-emerald-100 rounded-xl border border-emerald-300">
                <Check className="w-4 h-4" />
                <span>Nama Anda Terdaftar</span>
              </span>
            ) : null}

            <button
              onClick={() => setIsSwapModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-950 bg-amber-400 hover:bg-amber-500 rounded-xl transition-colors shadow-xs cursor-pointer"
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>Tukar Jadwal (Shift-Swap)</span>
            </button>

            {user.role === 'rt_rw' && (
              <button
                onClick={handleOpenEditModal}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl transition-colors shadow-xs cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
                <span>Ubah Jadwal (RT/RW)</span>
              </button>
            )}
          </div>
        </div>

        {/* Shift Tabs: Malam Ini vs Malam Besok */}
        <div className="mt-6 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveShift('tonight')}
              className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                activeShift === 'tonight'
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-4 h-4 text-emerald-700" />
              <span>Jadwal Malam Ini ({tonight?.participants.length || 30} Warga)</span>
            </button>

            <button
              onClick={() => setActiveShift('tomorrow')}
              className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                activeShift === 'tomorrow'
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-4 h-4 text-emerald-700" />
              <span>Jadwal Malam Besok ({tomorrow?.participants.length || 30} Warga)</span>
            </button>
          </div>

          {/* Schedule Info strip */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 font-medium">
            <span className="flex items-center gap-1 text-slate-800 font-semibold bg-slate-100 px-2.5 py-1 rounded-md">
              <Clock className="w-3.5 h-3.5 text-emerald-700" />
              {currentSchedule?.hours}
            </span>
            <span>·</span>
            <span>Koordinator: <strong>{currentSchedule?.coordinator}</strong></span>
            <span>·</span>
            <span className="text-slate-500">{currentSchedule?.date}</span>
          </div>
        </div>
      </div>

      {/* Titik Ronda / Checkpoints Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-emerald-700" />
          <span>5 Titik Ronda & Pos Pantau Babakan Pandan</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {defaultCheckpoints.map((cp, idx) => (
            <button
              key={cp}
              onClick={() => setSelectedPointFilter(selectedPointFilter === cp ? 'all' : cp)}
              className={`p-3 rounded-xl border text-left transition-all ${
                selectedPointFilter === cp
                  ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-bold text-emerald-800">
                <span>Pos {idx + 1}</span>
                <span className="tabular-nums font-mono">
                  {participants.filter((p) => p.assignedPoint === cp).length} Petugas
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-900 mt-1 line-clamp-2">
                {cp}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Active Shift Swaps Requests List */}
      {state && state.shiftSwaps.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-amber-700" />
              <h3 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                Pengajuan Tukar Shift Ronda (Shift-Swap Warga)
              </h3>
            </div>
            <span className="text-xs text-amber-800 font-medium">
              {state.shiftSwaps.filter((s) => s.status === 'pending').length} Menunggu Persetujuan
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {state.shiftSwaps.map((swap) => (
              <div
                key={swap.id}
                className="bg-white border border-amber-200 rounded-xl p-3.5 text-xs space-y-2 shadow-2xs"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-bold text-slate-900">{swap.requesterName}</span>
                    <span className="text-slate-500 text-[11px]"> ({swap.requesterAddress})</span>
                    <div className="text-[11px] text-slate-600 mt-0.5">
                      Shift: <strong>{swap.shiftTitle}</strong> ({swap.shiftDate})
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      swap.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : swap.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {swap.status === 'approved'
                      ? 'Disetujui'
                      : swap.status === 'rejected'
                      ? 'Ditolak'
                      : 'Menunggu'}
                  </span>
                </div>

                <p className="text-slate-700 bg-slate-50 p-2 rounded-lg italic">
                  "{swap.reason}"
                </p>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-500">
                    Pengganti yang dituju: <strong>{swap.targetCitizenName}</strong>
                  </span>

                  {swap.status === 'pending' && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => respondShiftSwap(swap.id, 'approved')}
                        className="px-2.5 py-1 text-[11px] font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors"
                      >
                        Setujui
                      </button>
                      <button
                        onClick={() => respondShiftSwap(swap.id, 'rejected')}
                        className="px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        Tolak
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Participants Table Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Daftar Petugas Ronda ({filteredParticipants.length} dari {participants.length} Warga)
            </h3>
            {selectedPointFilter !== 'all' && (
              <button
                onClick={() => setSelectedPointFilter('all')}
                className="text-[11px] font-semibold text-emerald-700 hover:underline"
              >
                (Reset Filter)
              </button>
            )}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama atau blok rumah..."
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
            />
          </div>
        </div>

        {/* 30 Warga Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4 font-semibold w-12 text-center">No</th>
                <th className="py-3 px-4 font-semibold">Nama Warga Petugas</th>
                <th className="py-3 px-4 font-semibold">Alamat / Blok</th>
                <th className="py-3 px-4 font-semibold">Penugasan Titik Pos Ronda</th>
                <th className="py-3 px-4 font-semibold">Status Kehadiran</th>
                <th className="py-3 px-4 font-semibold text-right">Kontak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {participants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 px-4 text-center">
                    <div className="max-w-md mx-auto space-y-2">
                      <p className="text-slate-800 font-bold text-sm">
                        Belum Ada Warga yang Terdaftar di Jadwal {activeShift === 'tonight' ? 'Malam Ini' : 'Malam Besok'}
                      </p>
                      <p className="text-slate-500 text-xs">
                        Tersedia 30 slot tugas ronda terbuka untuk seluruh warga RT.01 RW.02 Babakan Pandan. Ambil salah satu slot di bawah untuk mendaftarkan nama Anda secara resmi.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredParticipants.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono tabular-nums text-slate-400 text-center font-medium">
                      Slot #{idx + 1}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs shrink-0">
                          {p.name.replace('Bpk. ', '').replace('Kang ', '').charAt(0)}
                        </div>
                        <span className="font-bold">{p.name}</span>
                        {user.name && (p.name.includes(user.name) || user.name.includes(p.name)) && (
                          <span className="text-[10px] font-extrabold bg-emerald-600 text-white px-2 py-0.2 rounded-full">
                            Anda
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {p.block}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-900 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                        <MapPin className="w-3 h-3 text-emerald-700 shrink-0" />
                        {p.assignedPoint}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {p.attended ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Hadir ({p.attendedAt || 'Tepat Waktu'})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          Belum Absen
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {p.phone && p.phone !== '-' ? (
                        <a
                          href={`https://wa.me/${p.phone.replace(/^0/, '62')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
                          title="Kirim pesan WhatsApp"
                        >
                          <Phone className="w-3 h-3 text-emerald-700" />
                          <span className="hidden sm:inline">WhatsApp</span>
                        </a>
                      ) : (
                        <span className="text-slate-400 text-xs">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}

              {/* Render Available Slots up to 30 */}
              {Array.from({ length: Math.max(0, 30 - participants.length) }).map((_, slotIdx) => {
                const slotNum = participants.length + slotIdx + 1;
                return (
                  <tr key={`empty-slot-${slotNum}`} className="bg-slate-50/40 text-slate-400 hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-4 font-mono tabular-nums text-center text-xs text-slate-300">
                      Slot #{slotNum}
                    </td>
                    <td className="py-2.5 px-4 italic text-xs">
                      (Slot Kosong - Terbuka untuk Warga RT.01)
                    </td>
                    <td className="py-2.5 px-4 text-xs text-slate-300">-</td>
                    <td className="py-2.5 px-4 text-xs">
                      <span className="text-slate-400 text-[11px]">
                        {defaultCheckpoints[(slotNum - 1) % defaultCheckpoints.length]}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-xs text-slate-300">Slot Terbuka</td>
                    <td className="py-2.5 px-4 text-right">
                      {user.name && !participants.some((p) => p.name.includes(user.name) || user.name.includes(p.name)) ? (
                        <button
                          onClick={async () => {
                            if (!currentSchedule) return;
                            const newP: RondaParticipant = {
                              id: `${activeShift}-warga-${Date.now()}`,
                              name: user.name,
                              phone: user.whatsapp || '081200000000',
                              block: user.address || 'RT.01 RW.02',
                              assignedPoint: defaultCheckpoints[(slotNum - 1) % defaultCheckpoints.length],
                              attended: false,
                            };
                            await updateSchedule(activeShift, {
                              participants: [...currentSchedule.participants, newP],
                            });
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors shadow-2xs cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Ambil Slot #{slotNum}</span>
                        </button>
                      ) : (
                        <span className="text-slate-300 text-xs">Tersedia</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shift Swap Modal */}
      {isSwapModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="bg-emerald-800 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-base">Ajukan Tukar Jadwal Ronda</h3>
              </div>
              <button
                onClick={() => setIsSwapModalOpen(false)}
                className="text-emerald-200 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleShiftSwapSubmit} className="p-5 space-y-4 text-xs sm:text-sm">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <p>
                  <strong>Pemohon:</strong> {user.name} ({user.address})
                </p>
                <p>
                  <strong>Shift:</strong> {activeShift === 'tonight' ? 'Malam Ini' : 'Malam Besok'} ({currentSchedule?.date})
                </p>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Warga Pengganti yang Dituju</label>
                <select
                  value={swapTargetCitizen}
                  onChange={(e) => setSwapTargetCitizen(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                >
                  <option value="Siapa Saja yang Bersedia">Siapa Saja yang Bersedia (Open Swap)</option>
                  {participants.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name} ({p.block})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Alasan Berhalangan Hadir</label>
                <textarea
                  required
                  rows={3}
                  value={swapReason}
                  onChange={(e) => setSwapReason(e.target.value)}
                  placeholder="Contoh: Ada dinas luar kota / lembur kerja / anggota keluarga sakit..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingSwap}
                className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmittingSwap ? 'Mengirim...' : 'Kirim Pengajuan Tukar Shift'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Schedule Modal for RT/RW */}
      {isEditScheduleModalOpen && editableSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-6">
            <div className="bg-emerald-800 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">
                  Pengaturan Jadwal Ronda (RT/RW) - {activeShift === 'tonight' ? 'Malam Ini' : 'Malam Besok'}
                </h3>
                <p className="text-xs text-emerald-200">
                  Kelola s/d 30 daftar nama warga, titik penugasan pos, dan koordinator ronda
                </p>
              </div>
              <button
                onClick={() => setIsEditScheduleModalOpen(false)}
                className="text-emerald-200 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Coordinator & Hours Header Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Nama Koordinator Ronda</label>
                  <input
                    type="text"
                    value={editableSchedule.coordinator}
                    onChange={(e) =>
                      setEditableSchedule({ ...editableSchedule, coordinator: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">No HP Koordinator</label>
                  <input
                    type="text"
                    value={editableSchedule.coordinatorPhone}
                    onChange={(e) =>
                      setEditableSchedule({ ...editableSchedule, coordinatorPhone: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Jam Tugas Ronda</label>
                  <input
                    type="text"
                    value={editableSchedule.hours}
                    onChange={(e) =>
                      setEditableSchedule({ ...editableSchedule, hours: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Catatan Khusus Patroli RT/RW</label>
                <input
                  type="text"
                  value={editableSchedule.notes}
                  onChange={(e) =>
                    setEditableSchedule({ ...editableSchedule, notes: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              {/* 30 Warga Edit Rows */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase">
                    Daftar Nama Warga ({editableSchedule.participants.length} Orang)
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddParticipant}
                    className="flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-3 py-1 rounded-lg hover:bg-emerald-100"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Tambah Warga
                  </button>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {editableSchedule.participants.map((p, idx) => (
                    <div
                      key={p.id}
                      className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    >
                      <span className="font-mono tabular-nums text-slate-400 w-6 text-center font-bold">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={p.name}
                        onChange={(e) => handleParticipantChange(idx, 'name', e.target.value)}
                        placeholder="Nama Warga"
                        className="flex-1 px-2.5 py-1.5 border border-slate-300 rounded-md bg-white font-medium"
                      />
                      <input
                        type="text"
                        value={p.block}
                        onChange={(e) => handleParticipantChange(idx, 'block', e.target.value)}
                        placeholder="Blok Rumah"
                        className="w-28 sm:w-36 px-2.5 py-1.5 border border-slate-300 rounded-md bg-white"
                      />
                      <select
                        value={p.assignedPoint}
                        onChange={(e) =>
                          handleParticipantChange(idx, 'assignedPoint', e.target.value)
                        }
                        className="w-40 sm:w-48 px-2 py-1.5 border border-slate-300 rounded-md bg-white truncate"
                      >
                        {defaultCheckpoints.map((cp) => (
                          <option key={cp} value={cp}>
                            {cp}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => handleRemoveParticipant(idx)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-md"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditScheduleModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-lg"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveSchedule}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-xs"
              >
                <Save className="w-4 h-4" />
                Simpan Perubahan Jadwal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
