/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext.tsx';
import type { PatrolLog } from '../types/index.ts';
import {
  QrCode,
  MapPin,
  Camera,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UploadCloud,
  Send,
  Eye,
  Scan,
  ShieldCheck,
  X,
} from 'lucide-react';

const defaultCheckpoints = [
  'Pos Ronda Utama Balai RW 02 (RT.01)',
  'Pos Pantau Blok A (Gang Melati & Lapangan)',
  'Pos Pantau Blok B (Pertigaan Mesjid & Gang Pandan)',
  'Pos Pantau Blok C (Jembatan & Batas Barat)',
  'Pos Pantau Blok D (Portal Gerbang Timur Babakan)',
];

export const PatrolAttendanceSection: React.FC = () => {
  const { user, state, submitAttendance, submitPatrol } = useApp();

  // Attendance Check-in State
  const [selectedCheckpoint, setSelectedCheckpoint] = useState(defaultCheckpoints[0]);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [checkInSuccess, setCheckInSuccess] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [activeQrTarget, setActiveQrTarget] = useState(defaultCheckpoints[0]);
  const [qrModalTab, setQrModalTab] = useState<'camera' | 'barcode'>('camera');
  const [cameraStreamActive, setCameraStreamActive] = useState(false);
  const [liveGpsInfo, setLiveGpsInfo] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const videoScannerRef = useRef<HTMLVideoElement | null>(null);

  // Patrol Report Form State
  const [patrolPoint, setPatrolPoint] = useState(defaultCheckpoints[0]);
  const [patrolCondition, setPatrolCondition] = useState<PatrolLog['condition']>('Aman & Kondusif');
  const [patrolNotes, setPatrolNotes] = useState('');
  const [patrolPhoto, setPatrolPhoto] = useState<string | undefined>(undefined);
  const [isSubmittingPatrol, setIsSubmittingPatrol] = useState(false);
  const [patrolSuccess, setPatrolSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Live Camera Scanner Lifecycle
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (isQrModalOpen && qrModalTab === 'camera') {
      navigator.mediaDevices
        ?.getUserMedia({ video: { facingMode: 'environment' } })
        .then((s) => {
          stream = s;
          if (videoScannerRef.current) {
            videoScannerRef.current.srcObject = s;
            videoScannerRef.current.play().catch(() => {});
          }
          setCameraStreamActive(true);
        })
        .catch(() => {
          setCameraStreamActive(false);
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      setCameraStreamActive(false);
    };
  }, [isQrModalOpen, qrModalTab]);

  // Handle Real Check-in with Camera QR or GPS
  const handlePerformCheckin = async (method: 'QR_CODE' | 'GPS_CHECKIN') => {
    setIsCheckingIn(true);
    let coords = { lat: -6.914744, lng: 107.60981 };

    if (navigator.geolocation) {
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 6000,
          });
        });
        coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLiveGpsInfo({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy || 15),
        });
      } catch {
        // use default
      }
    }

    const success = await submitAttendance({
      checkpointName: selectedCheckpoint,
      method,
      coordinates: coords,
    });

    setIsCheckingIn(false);
    if (success) {
      setCheckInSuccess(true);
      setTimeout(() => setCheckInSuccess(false), 3000);
      setIsQrModalOpen(false);
    }
  };

  // Handle Photo selection/capture
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPatrolPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Patrol Log
  const handlePatrolSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patrolNotes.trim()) {
      alert('Mohon cantumkan catatan hasil patroli');
      return;
    }

    setIsSubmittingPatrol(true);
    let coords: { lat: number; lng: number } | undefined = undefined;
    if (navigator.geolocation) {
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 4000 });
        });
        coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      } catch {
        // ignore
      }
    }

    const success = await submitPatrol({
      checkpointName: patrolPoint,
      condition: patrolCondition,
      notes: patrolNotes.trim(),
      photoUrl: patrolPhoto,
      coordinates: coords,
    });

    setIsSubmittingPatrol(false);
    if (success) {
      setPatrolSuccess(true);
      setPatrolNotes('');
      setPatrolPhoto(undefined);
      setTimeout(() => setPatrolSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Absensi & Patroli Siskamling
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500 font-medium">Validasi QR Code & GPS Babakan Pandan</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
            Presensi Petugas & Laporan Patroli Keliling
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            Petugas ronda wajib check-in saat tiba di pos ronda dan mengirimkan laporan berkala kondisi setiap sudut gang untuk menjamin keamanan warga.
          </p>
        </div>

        {/* View QR Code button for all checkpoints */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveQrTarget(defaultCheckpoints[0]);
              setIsQrModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-emerald-950 bg-emerald-100 hover:bg-emerald-200 rounded-xl transition-colors border border-emerald-300"
          >
            <QrCode className="w-4 h-4 text-emerald-800" />
            <span>Lihat QR Code Pos Ronda</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 Cols): Check-in Presensi Ronda */}
        <div className="lg:col-span-5 space-y-6">
          {/* Check-in Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
              <div>
                <h2 className="text-sm font-bold text-slate-900">Check-in Kehadiran Petugas Ronda</h2>
                <p className="text-[11px] text-slate-500">Scan QR Pos Ronda atau Validasi GPS</p>
              </div>
            </div>

            {checkInSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-2 text-xs text-emerald-800 font-semibold animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Absensi berhasil disimpan! Status Anda tercatat hadir di Pos Ronda.</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Pilih Pos Ronda Kedatangan</label>
              <select
                value={selectedCheckpoint}
                onChange={(e) => setSelectedCheckpoint(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              >
                {defaultCheckpoints.map((cp) => (
                  <option key={cp} value={cp}>
                    {cp}
                  </option>
                ))}
              </select>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <p>
                <strong>Nama Petugas:</strong> {user.name}
              </p>
              <p>
                <strong>Alamat:</strong> {user.address}
              </p>
              <p>
                <strong>Waktu:</strong> {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setActiveQrTarget(selectedCheckpoint);
                  setIsQrModalOpen(true);
                }}
                disabled={isCheckingIn}
                className="py-2.5 px-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
              >
                <Scan className="w-4 h-4" />
                <span>Scan QR Pos</span>
              </button>

              <button
                type="button"
                onClick={() => handlePerformCheckin('GPS_CHECKIN')}
                disabled={isCheckingIn}
                className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
              >
                <MapPin className="w-4 h-4" />
                <span>{isCheckingIn ? 'Validasi GPS...' : 'Absen via GPS'}</span>
              </button>
            </div>
          </div>

          {/* Today's Attendances List */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Riwayat Presensi Malam Ini
              </h3>
              <span className="text-xs text-slate-500 font-mono tabular-nums">
                {state?.attendances.length || 0} Petugas
              </span>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {state?.attendances && state.attendances.length > 0 ? (
                state.attendances.map((att) => (
                  <div
                    key={att.id}
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{att.participantName}</span>
                      <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                        {att.timestamp}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-700 shrink-0" />
                      <span>{att.checkpointName}</span>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Metode: {att.method === 'QR_CODE' ? 'Scan QR Code Pos' : 'GPS Validasi'}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 text-center py-4">
                  Belum ada presensi yang tercatat malam ini.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (7 Cols): Form Pelaporan Patroli Keliling & Live Timeline */}
        <div className="lg:col-span-7 space-y-6">
          {/* Patrol Logging Form */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Camera className="w-5 h-5 text-emerald-700" />
              <div>
                <h2 className="text-sm font-bold text-slate-900">Form Laporan Patroli Keliling</h2>
                <p className="text-[11px] text-slate-500">
                  Kirim catatan dan foto kondisi terkini setiap kali selesai putaran ronda
                </p>
              </div>
            </div>

            {patrolSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-2 text-xs text-emerald-800 font-semibold animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Laporan patroli berhasil dikirim ke feed lingkungan!</span>
              </div>
            )}

            <form onSubmit={handlePatrolSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Titik / Area Patroli</label>
                  <select
                    value={patrolPoint}
                    onChange={(e) => setPatrolPoint(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  >
                    {defaultCheckpoints.map((cp) => (
                      <option key={cp} value={cp}>
                        {cp}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Kondisi Lingkungan</label>
                  <select
                    value={patrolCondition}
                    onChange={(e) =>
                      setPatrolCondition(e.target.value as PatrolLog['condition'])
                    }
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden font-medium"
                  >
                    <option value="Aman & Kondusif">🟢 Aman & Kondusif</option>
                    <option value="Pagar Rumah Terbuka">🟡 Pagar Rumah Terbuka</option>
                    <option value="Lampu PJU Padam">🟡 Lampu PJU Padam / Gelap</option>
                    <option value="Orang Mencurigakan">🔴 Orang Mencurigakan</option>
                    <option value="Hewan / Sampah Liar">⚪ Hewan / Sampah Liar</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Catatan Patroli (Kondisi Lapangan, Jam, & Tindakan Petugas)
                </label>
                <textarea
                  required
                  rows={3}
                  value={patrolNotes}
                  onChange={(e) => setPatrolNotes(e.target.value)}
                  placeholder="Contoh: Putaran jam 01.00 WIB di Blok C. Portal barat sudah terkunci. Lampu jalan tiang 3 normal. Tidak ada aktivitas mencurigakan..."
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              {/* Photo Upload & Preview */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                  <span>Foto Kondisi Lingkungan (Kamera / Galeri)</span>
                  {patrolPhoto && (
                    <button
                      type="button"
                      onClick={() => setPatrolPhoto(undefined)}
                      className="text-[11px] text-red-600 hover:underline"
                    >
                      Hapus Foto
                    </button>
                  )}
                </label>

                {patrolPhoto ? (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 max-h-48">
                    <img
                      src={patrolPhoto}
                      alt="Foto Patroli"
                      className="w-full h-44 object-cover"
                    />
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-4 text-center cursor-pointer transition-colors bg-slate-50 hover:bg-emerald-50/40"
                  >
                    <UploadCloud className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                    <p className="text-xs font-semibold text-slate-700">
                      Ambil Foto Kamera atau Upload File
                    </p>
                    <p className="text-[10px] text-slate-500">Mendukung format JPG, PNG (Maks 10MB)</p>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingPatrol}
                className="w-full py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmittingPatrol ? 'Mengirim Laporan...' : 'Kirim Laporan Patroli'}</span>
              </button>
            </form>
          </div>

          {/* Timeline of Patrol Reports */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Lini Masa Laporan Patroli Lingkungan (Real-time Feed)
              </h3>
              <span className="text-xs text-slate-500 font-mono tabular-nums">
                {state?.patrolLogs.length || 0} Laporan
              </span>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {state?.patrolLogs && state.patrolLogs.length > 0 ? (
                state.patrolLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-bold text-slate-900">{log.officerName}</span>
                        <div className="text-[11px] text-emerald-800 font-medium flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span>{log.checkpointName}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span
                          className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            log.condition === 'Aman & Kondusif'
                              ? 'bg-emerald-100 text-emerald-800'
                              : log.condition === 'Orang Mencurigakan'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {log.condition}
                        </span>
                        <div className="text-[10px] text-slate-500 mt-1">{log.timestamp}</div>
                      </div>
                    </div>

                    <p className="text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200 leading-relaxed">
                      {log.notes}
                    </p>

                    {log.photoUrl && (
                      <div className="rounded-lg overflow-hidden border border-slate-200 mt-2">
                        <img
                          src={log.photoUrl}
                          alt="Dokumentasi Patroli"
                          className="w-full max-h-52 object-cover"
                        />
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 text-center py-4">
                  Belum ada laporan patroli yang diinput malam ini.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Real QR Scanner & Pos Ronda Code Modal */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-center p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scan className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-base text-slate-900">Pemindaian QR Pos Ronda</h3>
              </div>
              <button
                onClick={() => setIsQrModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selector Tabs: Kamera Langsung vs Kode Pos */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setQrModalTab('camera')}
                className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  qrModalTab === 'camera'
                    ? 'bg-white text-emerald-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Camera className="w-4 h-4 text-emerald-700" />
                <span>Kamera Scanner Live</span>
              </button>

              <button
                type="button"
                onClick={() => setQrModalTab('barcode')}
                className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  qrModalTab === 'barcode'
                    ? 'bg-white text-emerald-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <QrCode className="w-4 h-4 text-emerald-700" />
                <span>Kode QR Pos Ronda</span>
              </button>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-bold text-emerald-900">{activeQrTarget}</p>
              <p className="text-[11px] text-slate-500">
                {qrModalTab === 'camera'
                  ? 'Arahkan kamera ke stiker QR di pos ronda atau klik verifikasi hadir'
                  : 'Stiker QR resmi pos ronda Babakan Pandan'}
              </p>
            </div>

            {/* TAB 1: Real Camera Viewfinder */}
            {qrModalTab === 'camera' && (
              <div className="relative w-full h-56 bg-slate-950 rounded-2xl overflow-hidden border-2 border-emerald-600 flex items-center justify-center">
                <video
                  ref={videoScannerRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />

                {/* Scanning reticle and laser line */}
                <div className="absolute inset-8 border-2 border-dashed border-emerald-400 rounded-xl pointer-events-none flex items-center justify-center">
                  <div className="w-full h-0.5 bg-emerald-400 shadow-[0_0_8px_#34d399] animate-[bounce_2s_infinite]" />
                </div>

                {!cameraStreamActive && (
                  <div className="absolute inset-0 bg-slate-900/90 text-white flex flex-col items-center justify-center p-4 text-xs space-y-2">
                    <Camera className="w-8 h-8 text-slate-400" />
                    <span>Kamera aktif atau klik tombol presensi di bawah untuk mencatat kehadiran langsung.</span>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Printable SVG QR Code */}
            {qrModalTab === 'barcode' && (
              <div className="space-y-2">
                <div className="p-3 bg-white border-2 border-emerald-700 rounded-2xl inline-block mx-auto shadow-inner">
                  <svg className="w-40 h-40 mx-auto" viewBox="0 0 100 100" fill="currentColor">
                    <rect width="100" height="100" fill="#ffffff" />
                    <rect x="5" y="5" width="30" height="30" fill="#064e3b" rx="4" />
                    <rect x="10" y="10" width="20" height="20" fill="#ffffff" rx="2" />
                    <rect x="14" y="14" width="12" height="12" fill="#064e3b" rx="2" />
                    <rect x="65" y="5" width="30" height="30" fill="#064e3b" rx="4" />
                    <rect x="70" y="10" width="20" height="20" fill="#ffffff" rx="2" />
                    <rect x="74" y="14" width="12" height="12" fill="#064e3b" rx="2" />
                    <rect x="5" y="65" width="30" height="30" fill="#064e3b" rx="4" />
                    <rect x="10" y="70" width="20" height="20" fill="#ffffff" rx="2" />
                    <rect x="14" y="74" width="12" height="12" fill="#064e3b" rx="2" />
                    <rect x="42" y="8" width="6" height="6" fill="#064e3b" />
                    <rect x="52" y="14" width="6" height="6" fill="#064e3b" />
                    <rect x="42" y="24" width="6" height="6" fill="#064e3b" />
                    <rect x="42" y="42" width="16" height="16" fill="#064e3b" rx="3" />
                    <rect x="8" y="42" width="6" height="6" fill="#064e3b" />
                    <rect x="24" y="48" width="6" height="6" fill="#064e3b" />
                    <rect x="68" y="44" width="6" height="6" fill="#064e3b" />
                    <rect x="82" y="48" width="8" height="6" fill="#064e3b" />
                    <rect x="44" y="68" width="8" height="8" fill="#064e3b" />
                    <rect x="58" y="78" width="6" height="6" fill="#064e3b" />
                    <rect x="72" y="72" width="8" height="8" fill="#064e3b" />
                    <rect x="84" y="84" width="8" height="8" fill="#064e3b" />
                  </svg>
                </div>
                <p className="text-[11px] text-slate-600 font-mono">
                  POS-RT01-{activeQrTarget.replace(/[^A-Za-z0-9]/g, '').slice(0, 8).toUpperCase()}
                </p>
              </div>
            )}

            {/* Check-in Trigger */}
            <button
              onClick={() => handlePerformCheckin('QR_CODE')}
              disabled={isCheckingIn}
              className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>
                {isCheckingIn
                  ? 'Menyimpan Presensi...'
                  : `Verifikasi Presensi (${user.name || 'Petugas Ronda'})`}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
