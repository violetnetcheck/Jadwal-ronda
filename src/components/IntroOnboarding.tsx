/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext.tsx';
import type { UserRole } from '../types/index.ts';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  Lock,
  User,
  Mail,
  Phone,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  LogIn,
} from 'lucide-react';
import { playKentonganHit } from '../utils/audio.ts';

export const IntroOnboarding: React.FC = () => {
  const {
    user,
    showIntro,
    setShowIntro,
    introPage,
    setIntroPage,
    loginReal,
    loginWithGoogle,
  } = useApp();

  const [isOpeningAnimation, setIsOpeningAnimation] = useState(true);

  // Form State for Page 3 Login
  const [role, setRole] = useState<UserRole>('warga');
  const [name, setName] = useState('');
  const [age, setAge] = useState<string>('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Opening splash animation (2 seconds) on first visit
  useEffect(() => {
    if (!showIntro) return;
    const timer = setTimeout(() => {
      setIsOpeningAnimation(false);
      playKentonganHit(620, 0.15);
    }, 2200);

    return () => clearTimeout(timer);
  }, [showIntro]);

  if (!showIntro) return null;

  const handleNextPage = () => {
    if (introPage === 1) setIntroPage(2);
    else if (introPage === 2) setIntroPage(3);
  };

  const handlePrevPage = () => {
    if (introPage === 3) setIntroPage(2);
    else if (introPage === 2) setIntroPage(1);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Nama panjang wajib diisi!');
      return;
    }
    const ageNum = parseInt(age, 10);
    if (!ageNum || ageNum < 15 || ageNum > 100) {
      setErrorMsg('Umur harus valid (minimal 15 tahun)!');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Gmail / Email aktif wajib diisi dengan benar!');
      return;
    }

    if (role === 'rt_rw') {
      if (!whatsapp.trim()) {
        setErrorMsg('Nomor WhatsApp wajib diisi untuk login sebagai RT/RW!');
        return;
      }
      if (!pin.trim()) {
        setErrorMsg('PIN Keamanan RT/RW wajib diisi! (Gunakan 1234 atau 0102)');
        return;
      }
    }

    setIsSubmitting(true);
    const result = await loginReal({
      name: name.trim(),
      age: ageNum,
      email: email.trim(),
      role,
      whatsapp: role === 'rt_rw' ? whatsapp.trim() : undefined,
      pin: role === 'rt_rw' ? pin.trim() : undefined,
    });
    setIsSubmitting(false);

    if (!result.success) {
      setErrorMsg(result.message || 'Gagal masuk akun, mohon periksa kembali data Anda.');
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setIsSubmitting(true);
    const result = await loginWithGoogle();
    setIsSubmitting(false);
    if (!result.success) {
      setErrorMsg(result.message || 'Gagal masuk dengan Google.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-md overflow-y-auto">
      {/* 1. OPENING SPLASH ANIMATION OVERLAY */}
      <AnimatePresence>
        {isOpeningAnimation && (
          <motion.div
            key="splash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            onClick={() => setIsOpeningAnimation(false)}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-slate-950 via-emerald-950 to-slate-950 text-white cursor-pointer"
          >
            <motion.div
              initial={{ scale: 0.6, rotate: -15, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="relative mb-6"
            >
              <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-2xl animate-pulse" />
              <img
                src="/assets/aistudio/IMG-20261107-WA0006_2005fda4.jpg"
                alt="Logo RW 02 Babakan Pandan"
                className="w-32 h-32 sm:w-40 sm:h-40 object-contain rounded-full border-4 border-amber-400 p-1 shadow-2xl relative z-10 bg-white"
              />
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-center space-y-2 max-w-md"
            >
              <span className="text-xs font-mono font-bold tracking-widest uppercase text-cyan-400 bg-cyan-950/80 border border-cyan-800 px-3 py-1 rounded-full">
                Sistem Keamanan Terpadu Lingkungan
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                RT.01 RW.02 BABAKAN PANDAN
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-amber-300">
                SANTUN: Sauyunan · Agamis · Nyunda · Toleran · UNggul
              </p>
              <div className="pt-4 flex items-center justify-center gap-1.5 text-xs text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Memuat sistem keamanan resmi Firebase...</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. THE 3-PAGE ONBOARDING FLOW */}
      {!isOpeningAnimation && (
        <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-4">
          {/* Header Bar with Stepper Indicator */}
          <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/80 border border-amber-500/40 px-2.5 py-1 rounded-full">
                Halaman {introPage} dari 3
              </span>
              <span className="text-xs text-slate-300 font-medium hidden sm:inline">
                {introPage === 1
                  ? 'Tentang Aplikasi Siskamling'
                  : introPage === 2
                  ? 'Sponsor Resmi: Cakra Siber Nusantara'
                  : 'Masuk Akun Resmi (Firebase)'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                {[1, 2, 3].map((step) => (
                  <button
                    key={step}
                    type="button"
                    onClick={() => setIntroPage(step as 1 | 2 | 3)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      introPage === step
                        ? 'w-6 bg-emerald-500'
                        : introPage > step
                        ? 'w-2.5 bg-emerald-700'
                        : 'w-2 bg-slate-700'
                    }`}
                  />
                ))}
              </div>

              {/* Close only permitted if user is already logged in */}
              {user.isLoggedIn && (
                <button
                  type="button"
                  onClick={() => setShowIntro(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg"
                  title="Tutup"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <AnimatePresence mode="wait">
              {/* ================= PAGE 1: TENTANG APLIKASI ================= */}
              {introPage === 1 && (
                <motion.div
                  key="page1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="text-center space-y-3">
                    <div className="relative inline-block">
                      <img
                        src="/assets/aistudio/IMG-20261107-WA0006_2005fda4.jpg"
                        alt="Logo RW 02 Babakan Pandan"
                        className="w-20 h-20 sm:w-24 sm:h-24 object-contain rounded-full mx-auto border-4 border-amber-400 shadow-xl bg-white p-1"
                      />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                        Sistem Ronda Lingkungan Resmi
                      </span>
                      <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
                        RT.01 RW.02 Babakan Pandan
                      </h2>
                      <p className="text-xs sm:text-sm font-semibold text-emerald-900 mt-0.5">
                        SANTUN: Sauyunan · Agamis · Nyunda · Toleran · UNggul (Periode 2025-2030)
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
                    <p className="font-semibold text-slate-900">
                      Aplikasi ini merupakan sarana digital nyata tanpa simulasi untuk keamanan lingkungan RT.01 RW.02 Babakan Pandan dengan fasilitas:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-start gap-2">
                        <Calendar className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-900 block">Jadwal Ronda 30 Slot Warga</strong>
                          <span className="text-slate-600">Jadwal Malam Ini & Malam Besok, pendaftaran slot mandiri warga & tukar shift digital.</span>
                        </div>
                      </div>

                      <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-start gap-2">
                        <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-900 block">Sirene Darurat & GPS Nyata</strong>
                          <span className="text-slate-600">Panic button membunyikan alarm keras ke perangkat seluruh warga dengan titik koordinat kejadian.</span>
                        </div>
                      </div>

                      <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-start gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-900 block">Presensi Pos QR & Kamera</strong>
                          <span className="text-slate-600">Validasi scan QR pos ronda, geotagging GPS, dan pelaporan patroli keliling berkala.</span>
                        </div>
                      </div>

                      <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-900 block">Story Warga & Chat Multimoda</strong>
                          <span className="text-slate-600">Kirim teks status, video, gambar, serta pesan suara (audio recorder) real-time.</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleNextPage}
                      className="w-full py-3.5 bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 text-white font-bold rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Lanjut ke Halaman 2: Sponsor Resmi</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ================= PAGE 2: SPONSOR CAKRA SIBER NUSANTARA ================= */}
              {introPage === 2 && (
                <motion.div
                  key="page2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 rounded-3xl p-6 text-white text-center border-2 border-emerald-500/40 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl" />

                    <div className="relative z-10 space-y-3">
                      <div className="w-20 h-20 mx-auto rounded-2xl bg-slate-800/80 border-2 border-cyan-400 p-3 shadow-inner flex items-center justify-center">
                        <Shield className="w-12 h-12 text-cyan-400 fill-cyan-400/20 animate-pulse" />
                      </div>

                      <div>
                        <span className="text-[11px] font-mono tracking-widest text-cyan-300 uppercase bg-cyan-950/80 border border-cyan-800 px-3 py-1 rounded-full">
                          Sponsor Resmi Keamanan Siber & Teknologi
                        </span>
                        <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-2">
                          CAKRA SIBER NUSANTARA
                        </h3>
                        <p className="text-xs text-slate-300 font-mono mt-1">
                          Lembaga Ketahanan, Pertahanan & Kedaulatan Keamanan Siber Nasional
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-5 rounded-2xl border border-slate-200">
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-700" />
                      <span>Mendukung Penuh Kedaulatan Keamanan Warga Babakan Pandan</span>
                    </h4>
                    <p>
                      Aplikasi Siskamling RT.01 RW.02 Babakan Pandan didukung dan disponsori penuh oleh <strong>Cakra Siber Nusantara</strong> demi menjaga keamanan data warga serta kesiapsiagaan lingkungan:
                    </p>
                    <ul className="space-y-2 pt-1 text-slate-600">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span><strong>Proteksi Data Pribadi:</strong> Perlindungan identitas warga, nomor kontak, serta buku tamu 1x24 jam.</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span><strong>Deteksi Real-Time Aktif:</strong> Kecepatan transmisi sirene digital dan pemantauan online tanpa simulasi.</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span><strong>Dukungan Infrastruktur:</strong> Menjamin kesinambungan sistem ronda RT.01 RW.02 sepanjang periode 2025–2030.</span>
                      </li>
                    </ul>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handlePrevPage}
                      className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-2xl transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Halaman 1</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleNextPage}
                      className="flex-1 py-3.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Lanjut ke Halaman 3: Masuk Akun</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ================= PAGE 3: LOGIN RESMI (FIREBASE) ================= */}
              {introPage === 3 && (
                <motion.div
                  key="page3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Autentikasi Firebase Aktif
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1.5">
                      Masuk Akun Siskamling Resmi
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                      Pilih peran Anda: Warga Biasa atau Pengurus RT/RW
                    </p>
                  </div>

                  {/* Role Selector */}
                  <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => {
                        setRole('warga');
                        setErrorMsg('');
                      }}
                      className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        role === 'warga'
                          ? 'bg-white text-emerald-900 shadow-sm border border-slate-200'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <User className="w-4 h-4 text-emerald-700" />
                      <span>1. Warga Biasa</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setRole('rt_rw');
                        setErrorMsg('');
                      }}
                      className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        role === 'rt_rw'
                          ? 'bg-emerald-800 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Shield className="w-4 h-4 text-amber-300" />
                      <span>2. Pengurus RT / RW</span>
                    </button>
                  </div>

                  {errorMsg && (
                    <div className="flex items-center gap-2 p-3 text-xs text-red-800 bg-red-50 border border-red-200 rounded-xl">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* FORM LOGIN */}
                  <form onSubmit={handleLoginSubmit} className="space-y-3.5 text-xs sm:text-sm">
                    {/* Nama Panjang (Wajib) */}
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700 flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Nama Panjang (Wajib)</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Contoh: Nama Lengkap Anda"
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Umur (Wajib) */}
                      <div className="space-y-1">
                        <label className="font-semibold text-slate-700">Umur (Wajib)</label>
                        <input
                          type="number"
                          required
                          min={15}
                          max={100}
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          placeholder="Contoh: 32"
                          className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-hidden font-mono"
                        />
                      </div>

                      {/* Gmail (Wajib) */}
                      <div className="space-y-1">
                        <label className="font-semibold text-slate-700 flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Gmail (Wajib)</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="namaanda@gmail.com"
                          className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                        />
                      </div>
                    </div>

                    {/* KHUSUS RT/RW: WAJIB WHATSAPP + PIN KEAMANAN */}
                    {role === 'rt_rw' && (
                      <div className="p-4 bg-amber-50/90 rounded-2xl border border-amber-300 space-y-3">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                          <Shield className="w-4 h-4 text-amber-700" />
                          <span>Kredensial Khusus Pengurus RT/RW (Wajib)</span>
                        </div>

                        <div className="space-y-1">
                          <label className="font-semibold text-slate-800 flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Nomor WhatsApp Pengurus (Wajib)</span>
                          </label>
                          <input
                            type="tel"
                            required
                            value={whatsapp}
                            onChange={(e) => setWhatsapp(e.target.value)}
                            placeholder="Contoh: 081288291021"
                            className="w-full px-3.5 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-amber-600 focus:outline-hidden"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-semibold text-slate-800 flex items-center gap-1">
                            <Lock className="w-3.5 h-3.5 text-amber-700" />
                            <span>PIN Keamanan RT/RW (PIN Resmi: 1234 atau 0102)</span>
                          </label>
                          <input
                            type="password"
                            required
                            maxLength={6}
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            placeholder="Masukkan PIN RT/RW"
                            className="w-full px-3.5 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-amber-600 focus:outline-hidden font-mono"
                          />
                        </div>
                      </div>
                    )}

                    {/* Submit Actions */}
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={handlePrevPage}
                        className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-2xl transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Halaman 2</span>
                      </button>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 py-3.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        <LogIn className="w-4 h-4" />
                        <span>
                          {isSubmitting
                            ? 'Menyimpan Akun Asli...'
                            : `Masuk Sebagai ${role === 'rt_rw' ? 'Pengurus RT/RW' : 'Warga RT.01'}`}
                        </span>
                      </button>
                    </div>

                    {/* Google Firebase One-Click Option */}
                    <div className="pt-2 text-center">
                      <div className="relative my-3">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-slate-200" />
                        </div>
                        <div className="relative flex justify-center text-[11px] uppercase">
                          <span className="bg-white px-2 text-slate-400">Atau Autentikasi Google</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={isSubmitting}
                        className="w-full py-2.5 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 text-xs cursor-pointer shadow-xs"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                          />
                        </svg>
                        <span>Masuk Langsung dengan Akun Google (Firebase Auth)</span>
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
};
