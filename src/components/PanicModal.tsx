/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import type { PanicAlarm } from '../types/index.ts';
import {
  ShieldAlert,
  Flame,
  Ambulance,
  AlertTriangle,
  MapPin,
  Volume2,
  VolumeX,
  X,
  Play,
  Square,
  CheckCircle2,
  ExternalLink,
  Radio,
} from 'lucide-react';

export const PanicModal: React.FC = () => {
  const {
    user,
    state,
    isPanicModalOpen,
    setIsPanicModalOpen,
    triggerPanic,
    resolvePanic,
    testPanicAudio,
    isSirenMuted,
    toggleSirenMute,
  } = useApp();

  const [selectedType, setSelectedType] = useState<PanicAlarm['type']>('Maling / Pencurian');
  const [locationDesc, setLocationDesc] = useState('');
  const [emergencyNotes, setEmergencyNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  if (!isPanicModalOpen) return null;

  const currentAlarm = state?.panicAlarm;
  const isAlarmActive = Boolean(currentAlarm?.active);

  const fetchCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Perangkat Anda tidak mendukung fitur GPS.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        // Default Babakan Pandan coordinates
        setGpsCoords({ lat: -6.914744, lng: 107.60981 });
        setIsLocating(false);
      },
      { timeout: 7000 }
    );
  };

  const handleTriggerEmergency = async () => {
    setIsSubmitting(true);
    const finalLocation = locationDesc.trim() || `Dekat rumah ${user.address || 'RT.01 RW.02 Babakan Pandan'}`;
    const coords = gpsCoords || { lat: -6.914744, lng: 107.60981 };

    await triggerPanic(selectedType, finalLocation, emergencyNotes, coords);
    setIsSubmitting(false);
  };

  const handleResolveEmergency = async () => {
    setIsResolving(true);
    await resolvePanic();
    setIsResolving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Top Header */}
        <div
          className={`px-6 py-4 flex items-center justify-between text-white ${
            isAlarmActive ? 'bg-red-700 animate-pulse' : 'bg-red-600'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-6 h-6 text-white" />
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                {isAlarmActive ? 'ALARM DARURAT SEDANG AKTIF' : 'Pusat Tombol Darurat Siskamling'}
              </h2>
              <p className="text-xs text-red-100">RT.01 RW.02 Babakan Pandan</p>
            </div>
          </div>
          <button
            onClick={() => setIsPanicModalOpen(false)}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Active Emergency Card */}
          {isAlarmActive && currentAlarm ? (
            <div className="bg-red-50 border-2 border-red-500 rounded-xl p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-red-800 bg-red-200 px-2 py-0.5 rounded">
                      {currentAlarm.type}
                    </span>
                    <span className="text-xs text-red-600 font-medium">
                      Pukul {currentAlarm.timestamp}
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold text-red-950 mt-1">
                    {currentAlarm.locationDescription}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 bg-white border border-red-200 px-2.5 py-1 rounded-md">
                    <Radio className="w-3.5 h-3.5 text-red-600 animate-ping" />
                    SIRENE AKTIF
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-700 space-y-1 bg-white p-3 rounded-lg border border-red-200">
                <p>
                  <strong>Pelapor:</strong> {currentAlarm.reportedBy} ({currentAlarm.reporterPhone})
                </p>
                <p>
                  <strong>Alamat Pelapor:</strong> {currentAlarm.reporterAddress}
                </p>
                {currentAlarm.notes && (
                  <p>
                    <strong>Keterangan:</strong> {currentAlarm.notes}
                  </p>
                )}
                <div className="pt-1 flex items-center gap-2">
                  <a
                    href={`https://maps.google.com/?q=${currentAlarm.coordinates.lat},${currentAlarm.coordinates.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-red-700 hover:text-red-900 font-semibold underline"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    Buka Titik Lokasi ({currentAlarm.coordinates.lat.toFixed(5)}, {currentAlarm.coordinates.lng.toFixed(5)})
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Siren Audio Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  onClick={toggleSirenMute}
                  className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                    isSirenMuted
                      ? 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200'
                      : 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                  }`}
                >
                  {isSirenMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-600 animate-pulse" />}
                  <span>{isSirenMuted ? 'Nyalakan Bunyi Sirene' : 'Senyapkan Bunyi di HP Ini'}</span>
                </button>

                {/* Stop Emergency Button (Only RT/RW or reporter) */}
                <button
                  onClick={handleResolveEmergency}
                  disabled={isResolving}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                >
                  <Square className="w-3.5 h-3.5 fill-white" />
                  <span>{isResolving ? 'Mematikan...' : 'Matikan & Selesaikan Alarm'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Normal Panic Trigger Form */
            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                Pilih jenis keadaan darurat untuk membunyikan sirene alarm siskamling ke HP petugas ronda dan seluruh warga RT.01 RW.02 secara real-time.
              </p>

              {/* Emergency Types Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  {
                    type: 'Maling / Pencurian' as const,
                    icon: ShieldAlert,
                    color: 'text-red-600 bg-red-50 border-red-200 hover:border-red-500',
                  },
                  {
                    type: 'Kebakaran' as const,
                    icon: Flame,
                    color: 'text-orange-600 bg-orange-50 border-orange-200 hover:border-orange-500',
                  },
                  {
                    type: 'Darurat Medis' as const,
                    icon: Ambulance,
                    color: 'text-blue-600 bg-blue-50 border-blue-200 hover:border-blue-500',
                  },
                  {
                    type: 'Keributan / Gangguan' as const,
                    icon: AlertTriangle,
                    color: 'text-amber-600 bg-amber-50 border-amber-200 hover:border-amber-500',
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = selectedType === item.type;
                  return (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => setSelectedType(item.type)}
                      className={`flex items-center gap-2 p-3 text-left rounded-xl border transition-all ${
                        isSelected
                          ? 'border-red-600 bg-red-100/60 ring-2 ring-red-500 font-bold'
                          : 'border-slate-200 hover:bg-slate-50 font-medium'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${item.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs sm:text-sm text-slate-900 leading-snug">
                        {item.type}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Location Input */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                  <span>Lokasi Kejadian di Babakan Pandan</span>
                  <button
                    type="button"
                    onClick={fetchCurrentLocation}
                    disabled={isLocating}
                    className="text-[11px] text-emerald-700 hover:text-emerald-900 font-medium flex items-center gap-1"
                  >
                    <MapPin className="w-3 h-3" />
                    {isLocating ? 'Mencari GPS...' : gpsCoords ? 'GPS Terhubung' : 'Ambil Koordinat GPS'}
                  </button>
                </label>
                <input
                  type="text"
                  value={locationDesc}
                  onChange={(e) => setLocationDesc(e.target.value)}
                  placeholder={`Contoh: Gang Dahlia Blok A No. 04 / Dekat Pos Ronda Utama`}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                />
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Keterangan Kejadian (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={emergencyNotes}
                  onChange={(e) => setEmergencyNotes(e.target.value)}
                  placeholder="Misal: Terlihat 2 orang asing mencurigakan mencoba bobol gembok gerbang..."
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                />
              </div>

              {/* Big Panic Trigger CTA */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleTriggerEmergency}
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-extrabold text-sm sm:text-base rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50"
                >
                  <ShieldAlert className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>{isSubmitting ? 'MENYALAKAN ALARM...' : 'BUNYIKAN SIRENE & KIRIM BROADCAST'}</span>
                </button>
              </div>

              {/* Siren Tester Button */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                <span>Ingin mencoba suara sirene tanpa membuat panik?</span>
                <button
                  type="button"
                  onClick={testPanicAudio}
                  className="flex items-center gap-1 font-semibold text-emerald-800 hover:text-emerald-950 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  <Play className="w-3.5 h-3.5" />
                  Test Suara Sirene (4 Detik)
                </button>
              </div>
            </div>
          )}

          {/* Historical Alarms */}
          {state && state.alarmHistory.length > 0 && (
            <div className="border-t border-slate-200 pt-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Riwayat Kejadian Sebelumnya
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {state.alarmHistory.map((hist) => (
                  <div
                    key={hist.id}
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        {hist.type} · {hist.locationDescription}
                      </span>
                      <span className="text-slate-500 text-[10px]">{hist.timestamp}</span>
                    </div>
                    {hist.notes && <p className="text-slate-600 text-[11px]">{hist.notes}</p>}
                    <div className="text-[10px] text-slate-500">
                      Diselesaikan oleh: {hist.resolvedBy}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
