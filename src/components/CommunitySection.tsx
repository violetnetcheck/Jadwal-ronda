/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext.tsx';
import type { Announcement } from '../types/index.ts';
import {
  BookOpen,
  Pin,
  Megaphone,
  UserCheck,
  Calendar,
  Clock,
  Plus,
  Trash2,
  Camera,
  CheckCircle,
  Home,
  Phone,
  Search,
  UploadCloud,
  X,
  FileText,
} from 'lucide-react';

export const CommunitySection: React.FC = () => {
  const {
    user,
    state,
    addAnnouncement,
    deleteAnnouncement,
    registerGuest,
    checkoutGuest,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'papan' | 'tamu'>('papan');

  // Announcement Form State
  const [isAnnModalOpen, setIsAnnModalOpen] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annCategory, setAnnCategory] = useState<Announcement['category']>('Info Penting');
  const [annContent, setAnnContent] = useState('');
  const [annPinned, setAnnPinned] = useState(false);
  const [isSubmittingAnn, setIsSubmittingAnn] = useState(false);

  // Guest Registration Form State
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestNik, setGuestNik] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [hostName, setHostName] = useState('');
  const [hostAddress, setHostAddress] = useState('');
  const [originCity, setOriginCity] = useState('');
  const [purpose, setPurpose] = useState('');
  const [stayDuration, setStayDuration] = useState(1);
  const [guestPhoto, setGuestPhoto] = useState<string | undefined>(undefined);
  const [isSubmittingGuest, setIsSubmittingGuest] = useState(false);
  const [guestSearch, setGuestSearch] = useState('');
  const guestPhotoRef = useRef<HTMLInputElement | null>(null);

  const announcements = state?.announcements || [];
  const guests = state?.guests || [];

  const handleAnnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) {
      alert('Judul dan isi pengumuman wajib diisi');
      return;
    }
    setIsSubmittingAnn(true);
    await addAnnouncement({
      title: annTitle.trim(),
      category: annCategory,
      content: annContent.trim(),
      isPinned: annPinned,
    });
    setIsSubmittingAnn(false);
    setIsAnnModalOpen(false);
    setAnnTitle('');
    setAnnContent('');
    setAnnPinned(false);
  };

  const handleGuestPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setGuestPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !hostName.trim() || !hostAddress.trim()) {
      alert('Nama tamu, nama tuan rumah, dan alamat wajib diisi');
      return;
    }
    setIsSubmittingGuest(true);
    await registerGuest({
      guestName: guestName.trim(),
      guestNik: guestNik.trim() || '3204' + Math.floor(100000000000 + Math.random() * 900000000000),
      guestPhone: guestPhone.trim() || '-',
      hostName: hostName.trim(),
      hostAddress: hostAddress.trim(),
      originCity: originCity.trim() || 'Luar Kota',
      purpose: purpose.trim() || 'Silaturahmi / Menginap',
      stayDurationDays: Number(stayDuration) || 1,
      photoUrl: guestPhoto,
    });
    setIsSubmittingGuest(false);
    setIsGuestModalOpen(false);
    setGuestName('');
    setGuestNik('');
    setGuestPhone('');
    setHostName('');
    setHostAddress('');
    setOriginCity('');
    setPurpose('');
    setGuestPhoto(undefined);
  };

  const filteredGuests = guests.filter((g) => {
    return (
      g.guestName.toLowerCase().includes(guestSearch.toLowerCase()) ||
      g.hostName.toLowerCase().includes(guestSearch.toLowerCase()) ||
      g.originCity.toLowerCase().includes(guestSearch.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Papan Informasi & Buku Tamu
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500 font-medium">RT.01 RW.02 Babakan Pandan</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
            Pengumuman Resmi & Registrasi Tamu 1x24 Jam
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            Informasi kegiatan lingkungan resmi dari Ketua RT/RW serta pencatatan digital tamu menginap sesuai aturan ketertiban lingkungan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {activeTab === 'papan' && user.role === 'rt_rw' && (
            <button
              onClick={() => setIsAnnModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Pengumuman RT/RW</span>
            </button>
          )}

          {activeTab === 'tamu' && (
            <button
              onClick={() => setIsGuestModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl transition-colors shadow-xs"
            >
              <UserCheck className="w-4 h-4" />
              <span>Daftarkan Tamu (Wajib 1x24 Jam)</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 w-fit">
        <button
          onClick={() => setActiveTab('papan')}
          className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
            activeTab === 'papan'
              ? 'bg-white text-emerald-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Megaphone className="w-4 h-4 text-emerald-700" />
          <span>Papan Pengumuman Resmi ({announcements.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('tamu')}
          className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
            activeTab === 'tamu'
              ? 'bg-white text-emerald-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4 text-emerald-700" />
          <span>Buku Tamu 1x24 Jam ({guests.length})</span>
        </button>
      </div>

      {/* TAB 1: Papan Pengumuman */}
      {activeTab === 'papan' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className={`bg-white rounded-2xl border p-5 shadow-xs space-y-3 relative overflow-hidden transition-all ${
                  ann.isPinned
                    ? 'border-emerald-300 ring-2 ring-emerald-500/30'
                    : 'border-slate-200'
                }`}
              >
                {/* Official RT/RW Seal Ribbon */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        ann.category === 'Keamanan'
                          ? 'bg-red-100 text-red-800'
                          : ann.category === 'Kerja Bakti'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {ann.category}
                    </span>
                    {ann.isPinned && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                        <Pin className="w-3 h-3" />
                        Disematkan
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">{ann.date}</span>
                </div>

                <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                  {ann.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {ann.content}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-2">
                    <img
                      src="/assets/aistudio/IMG-20261107-WA0006_2005fda4.jpg"
                      alt="Logo"
                      className="w-6 h-6 rounded-full object-contain border border-amber-300"
                    />
                    <div>
                      <span className="font-bold text-slate-900">{ann.author}</span>
                      <span className="text-slate-500 text-[11px]"> · {ann.authorRole}</span>
                    </div>
                  </div>

                  {user.role === 'rt_rw' && (
                    <button
                      onClick={() => deleteAnnouncement(ann.id)}
                      className="text-slate-400 hover:text-red-600 p-1"
                      title="Hapus Pengumuman"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Buku Tamu 1x24 Jam */}
      {activeTab === 'tamu' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Data Tamu Menginap di Babakan Pandan
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs font-semibold text-emerald-800">
                {guests.filter((g) => g.status === 'SEDANG_MENGINAP').length} Tamu Aktif
              </span>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={guestSearch}
                onChange={(e) => setGuestSearch(e.target.value)}
                placeholder="Cari tamu / tuan rumah..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              />
            </div>
          </div>

            {filteredGuests.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
                Belum ada data tamu menginap yang terdaftar di Babakan Pandan. Warga dapat menggunakan tombol &quot;Registrasi Tamu&quot; di atas untuk mencatat tamu atau kerabat yang berkunjung 1x24 jam.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredGuests.map((g) => (
              <div
                key={g.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{g.guestName}</h3>
                    <p className="text-[11px] text-slate-500 font-mono">NIK: {g.guestNik}</p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      g.status === 'SEDANG_MENGINAP'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {g.status === 'SEDANG_MENGINAP' ? 'Sedang Menginap' : 'Sudah Pulang'}
                  </span>
                </div>

                <div className="text-xs text-slate-700 space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <p>
                    <strong>Tuan Rumah:</strong> {g.hostName} ({g.hostAddress})
                  </p>
                  <p>
                    <strong>Asal Kota:</strong> {g.originCity}
                  </p>
                  <p>
                    <strong>Keperluan:</strong> {g.purpose}
                  </p>
                  <p>
                    <strong>Durasi:</strong> {g.stayDurationDays} Hari (Tiba {g.arrivalDate})
                  </p>
                  {g.guestPhone && g.guestPhone !== '-' && (
                    <p>
                      <strong>Kontak:</strong> {g.guestPhone}
                    </p>
                  )}
                </div>

                {g.photoUrl && (
                  <div className="rounded-xl overflow-hidden border border-slate-200 max-h-36">
                    <img
                      src={g.photoUrl}
                      alt="Foto Tamu"
                      className="w-full h-32 object-cover"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <span className="text-[10px] text-slate-500">
                    Divalidasi: {g.verifiedBy || 'Petugas'}
                  </span>

                  {g.status === 'SEDANG_MENGINAP' && (
                    <button
                      onClick={() => checkoutGuest(g.id)}
                      className="px-2.5 py-1 text-[11px] font-semibold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-300 transition-colors"
                    >
                      Selesai / Pulang
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )}

      {/* Modal Buat Pengumuman (RT/RW) */}
      {isAnnModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="bg-emerald-800 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-base">Buat Pengumuman Resmi RT/RW</h3>
              </div>
              <button
                onClick={() => setIsAnnModalOpen(false)}
                className="text-emerald-200 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAnnSubmit} className="p-5 space-y-4 text-xs sm:text-sm">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Kategori</label>
                <select
                  value={annCategory}
                  onChange={(e) =>
                    setAnnCategory(e.target.value as Announcement['category'])
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                >
                  <option value="Keamanan">Keamanan & Siskamling</option>
                  <option value="Kerja Bakti">Kerja Bakti Lingkungan</option>
                  <option value="Rapat Warga">Rapat Warga / Musyawarah</option>
                  <option value="Info Penting">Info Penting Lingkungan</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Judul Pengumuman</label>
                <input
                  type="text"
                  required
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="Contoh: Kerja Bakti Pembersihan Selokan Menjelang Musim Hujan"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Isi Pengumuman</label>
                <textarea
                  required
                  rows={4}
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  placeholder="Tuliskan detail pengumuman resmi untuk warga..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pinCheck"
                  checked={annPinned}
                  onChange={(e) => setAnnPinned(e.target.checked)}
                  className="w-4 h-4 text-emerald-800 rounded focus:ring-emerald-600"
                />
                <label htmlFor="pinCheck" className="text-xs font-semibold text-slate-700">
                  Sematkan di bagian atas papan (Pinned)
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmittingAnn}
                className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl transition-colors shadow-xs"
              >
                {isSubmittingAnn ? 'Menerbitkan...' : 'Terbitkan Pengumuman Resmi'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Pendaftaran Tamu 1x24 Jam */}
      {isGuestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-6">
            <div className="bg-emerald-800 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-base">Form Wajib Lapor Tamu 1x24 Jam</h3>
              </div>
              <button
                onClick={() => setIsGuestModalOpen(false)}
                className="text-emerald-200 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGuestSubmit} className="p-5 space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Nama Tamu</label>
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Nama lengkap sesuai KTP"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">NIK / Nomor KTP</label>
                  <input
                    type="text"
                    value={guestNik}
                    onChange={(e) => setGuestNik(e.target.value)}
                    placeholder="16 Digit NIK"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Nomor WhatsApp Tamu</label>
                  <input
                    type="tel"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="Contoh: 08123456789"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Asal Kota / Daerah</label>
                  <input
                    type="text"
                    value={originCity}
                    onChange={(e) => setOriginCity(e.target.value)}
                    placeholder="Contoh: Tasikmalaya / Garut"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Nama Tuan Rumah (Warga RT.01)</label>
                  <input
                    type="text"
                    required
                    value={hostName}
                    onChange={(e) => setHostName(e.target.value)}
                    placeholder="Contoh: Bpk. Hendra Gunawan"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Alamat Rumah yang Dituju</label>
                  <input
                    type="text"
                    required
                    value={hostAddress}
                    onChange={(e) => setHostAddress(e.target.value)}
                    placeholder="Contoh: Blok A No. 12"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Keperluan Kunjungan</label>
                  <input
                    type="text"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="Contoh: Silaturahmi keluarga / urusan kerja"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Perkiraan Lama Menginap</label>
                  <select
                    value={stayDuration}
                    onChange={(e) => setStayDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  >
                    <option value={1}>1 Hari</option>
                    <option value={2}>2 Hari</option>
                    <option value={3}>3 Hari</option>
                    <option value={7}>1 Minggu</option>
                    <option value={14}>2 Minggu</option>
                  </select>
                </div>
              </div>

              {/* Photo Upload */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Foto KTP / Tamu (Opsional)</label>
                {guestPhoto ? (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 max-h-36">
                    <img src={guestPhoto} alt="Foto" className="w-full h-32 object-cover" />
                    <button
                      type="button"
                      onClick={() => setGuestPhoto(undefined)}
                      className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded"
                    >
                      Ganti
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => guestPhotoRef.current?.click()}
                    className="border border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-3 text-center cursor-pointer bg-slate-50 text-slate-600"
                  >
                    <Camera className="w-5 h-5 mx-auto mb-1 text-slate-400" />
                    <span>Upload atau Ambil Foto KTP</span>
                  </div>
                )}
                <input
                  ref={guestPhotoRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleGuestPhotoChange}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingGuest}
                className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl transition-colors shadow-xs"
              >
                {isSubmittingGuest ? 'Menyimpan...' : 'Simpan Data Tamu 1x24 Jam'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
