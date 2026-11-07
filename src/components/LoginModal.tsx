/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import type { UserRole } from '../types/index.ts';
import { Lock, User, Phone, Mail, Shield, AlertCircle, X, CheckCircle2 } from 'lucide-react';

export const LoginModal: React.FC = () => {
  const { user, isLoginModalOpen, setIsLoginModalOpen, loginReal } = useApp();

  const [fullName, setFullName] = useState(user.name || '');
  const [age, setAge] = useState<string>(user.age ? String(user.age) : '35');
  const [email, setEmail] = useState(user.email || '');
  const [whatsapp, setWhatsapp] = useState(user.whatsapp || '');
  const [role, setRole] = useState<UserRole>(user.role || 'warga');
  const [pin, setPin] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isLoginModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName.trim()) {
      setErrorMessage('Wajib mengisi Nama Panjang!');
      return;
    }
    const ageNum = parseInt(age, 10);
    if (!ageNum || ageNum < 15 || ageNum > 100) {
      setErrorMessage('Umur harus diisi angka yang valid (minimal 15 tahun)!');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Wajib mengisi Gmail / Email aktif!');
      return;
    }
    if (role === 'rt_rw' && !whatsapp.trim()) {
      setErrorMessage('Nomor WhatsApp wajib diisi untuk login sebagai RT/RW!');
      return;
    }

    setIsSubmitting(true);
    const result = await loginReal({
      name: fullName.trim(),
      age: ageNum,
      email: email.trim(),
      role,
      whatsapp: role === 'rt_rw' ? whatsapp.trim() : undefined,
      pin: role === 'rt_rw' ? pin.trim() : undefined,
    });
    setIsSubmitting(false);

    if (!result.success) {
      setErrorMessage(result.message || 'Gagal masuk akun');
      return;
    }

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setIsLoginModalOpen(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-emerald-900 text-white p-6 relative">
          <button
            onClick={() => setIsLoginModalOpen(false)}
            className="absolute top-4 right-4 text-emerald-200 hover:text-white p-1 rounded-lg hover:bg-emerald-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <img
              src="/assets/aistudio/IMG-20261107-WA0006_2005fda4.jpg"
              alt="Logo RW 02"
              className="w-12 h-12 rounded-full border-2 border-amber-400 bg-white p-0.5 object-contain"
            />
            <div>
              <h2 className="text-lg font-bold">Autentikasi Akun Warga</h2>
              <p className="text-xs text-emerald-200">RT.01 RW.02 Babakan Pandan (2025-2030)</p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 text-xs text-red-800 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Role Choice */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Masuk Sebagai</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('warga')}
                className={`flex items-center justify-center gap-2 p-2.5 text-xs font-bold rounded-xl border transition-all ${
                  role === 'warga'
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-900 ring-1 ring-emerald-500'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Warga Biasa</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('rt_rw')}
                className={`flex items-center justify-center gap-2 p-2.5 text-xs font-bold rounded-xl border transition-all ${
                  role === 'rt_rw'
                    ? 'bg-emerald-800 text-white shadow-sm ring-1 ring-emerald-600'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Shield className="w-4 h-4 text-amber-300" />
                <span>Pengurus RT / RW</span>
              </button>
            </div>
          </div>

          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-emerald-700" />
              <span>Nama Panjang (Wajib)</span>
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nama Lengkap Anda"
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Age */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Umur (Wajib)</label>
              <input
                type="number"
                required
                min={15}
                max={100}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Umur"
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-hidden font-mono"
              />
            </div>

            {/* Gmail */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-emerald-700" />
                <span>Gmail (Wajib)</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@gmail.com"
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              />
            </div>
          </div>

          {/* RT/RW WhatsApp + PIN */}
          {role === 'rt_rw' && (
            <div className="space-y-3 bg-amber-50/80 p-3.5 rounded-2xl border border-amber-300">
              <div className="space-y-1">
                <label className="text-xs font-bold text-amber-950 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Nomor WhatsApp RT/RW (Wajib)</span>
                </label>
                <input
                  type="tel"
                  required
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="0812xxxxxxxx"
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-amber-600 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-amber-950 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-amber-700" />
                  <span>PIN Keamanan RT/RW (Default: 1234 atau 0102)</span>
                </label>
                <input
                  type="password"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="PIN RT/RW"
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-amber-300 rounded-xl bg-white focus:ring-2 focus:ring-amber-600 focus:outline-hidden font-mono"
                />
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 text-white font-bold text-xs sm:text-sm rounded-2xl transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>Berhasil Masuk!</span>
              </>
            ) : (
              <span>{isSubmitting ? 'Menghubungkan...' : 'Simpan & Masuk Akun'}</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
