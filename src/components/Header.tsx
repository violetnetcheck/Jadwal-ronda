/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  ShieldAlert,
  Calendar,
  ClipboardCheck,
  Wallet,
  BookOpen,
  MessageSquare,
  User,
  LogOut,
  Volume2,
  VolumeX,
  SlidersHorizontal,
  Shield,
  Wifi,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    user,
    state,
    onlineUsers,
    activeTab,
    setActiveTab,
    setIsPanicModalOpen,
    setIsLoginModalOpen,
    setIsAdminPanelOpen,
    setIsOnlineModalOpen,
    openIntroPage,
    isSirenMuted,
    toggleSirenMute,
    logout,
  } = useApp();

  const isPanicActive = Boolean(state?.panicAlarm?.active);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      {/* Emergency Active Alert Bar if panic is running */}
      {isPanicActive && state?.panicAlarm && (
        <div className="bg-red-600 text-white px-4 py-2.5 flex items-center justify-between text-xs sm:text-sm font-medium animate-pulse">
          <div className="flex items-center gap-2 max-w-3xl truncate">
            <span className="font-bold flex items-center gap-1.5 shrink-0 bg-red-800 px-2 py-0.5 rounded text-white">
              <ShieldAlert className="w-4 h-4 animate-bounce" />
              ALARM DARURAT AKTIF
            </span>
            <span className="truncate">
              {state.panicAlarm.type} di {state.panicAlarm.locationDescription} (Pelapor: {state.panicAlarm.reportedBy})
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={toggleSirenMute}
              className="flex items-center gap-1 bg-white/20 hover:bg-white/30 px-2.5 py-1 rounded transition-colors"
              title={isSirenMuted ? 'Nyalakan Sirene' : 'Senyapkan Sirene'}
            >
              {isSirenMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-300" />}
              <span className="hidden sm:inline">{isSirenMuted ? 'Suara Senyap' : 'Sirene Bunyi'}</span>
            </button>
            <button
              onClick={() => setIsPanicModalOpen(true)}
              className="bg-white text-red-700 hover:bg-slate-100 font-semibold px-3 py-1 rounded transition-colors shadow-sm cursor-pointer"
            >
              Buka Alarm
            </button>
          </div>
        </div>
      )}

      {/* Main Top Bar Contract: Brand — 5 Nav Links — Primary Action */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark with Logo & Sponsor Trust Mark */}
        <div className="flex items-center gap-3 shrink-0">
          <img
            src="/assets/aistudio/IMG-20261107-WA0006_2005fda4.jpg"
            alt="Logo RW 02 Babakan Pandan"
            className="w-10 h-10 object-contain rounded-full border border-amber-400 shadow-xs bg-white"
          />
          <div className="flex flex-col">
            <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 leading-tight">
              RT.01 RW.02
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
                Babakan Pandan
              </span>
              <span className="hidden sm:inline text-slate-300">·</span>
              <button
                onClick={() => openIntroPage(2)}
                className="hidden sm:inline text-[10px] font-medium text-cyan-900 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 px-1.5 py-0.2 rounded transition-colors cursor-pointer"
                title="Buka info sponsor Cakra Siber Nusantara"
              >
                Sponsor: Cakra Siber Nusantara
              </button>
            </div>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 text-sm font-medium text-slate-600">
          <button
            onClick={() => setActiveTab('jadwal')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'jadwal'
                ? 'bg-emerald-50 text-emerald-800 font-semibold'
                : 'hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Jadwal Ronda (30 Slot)
          </button>

          <button
            onClick={() => setActiveTab('patroli')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'patroli'
                ? 'bg-emerald-50 text-emerald-800 font-semibold'
                : 'hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <ClipboardCheck className="w-4 h-4" />
            Patroli & Presensi
          </button>

          <button
            onClick={() => setActiveTab('kas')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'kas'
                ? 'bg-emerald-50 text-emerald-800 font-semibold'
                : 'hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Wallet className="w-4 h-4" />
            Kas Keuangan
          </button>

          <button
            onClick={() => setActiveTab('papan')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'papan'
                ? 'bg-emerald-50 text-emerald-800 font-semibold'
                : 'hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Papan & Tamu
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-emerald-50 text-emerald-800 font-semibold'
                : 'hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Chat Warga
            {state && state.chatMessages.length > 0 && (
              <span className="text-[10px] bg-emerald-600 text-white rounded-full px-1.5 py-0.2">
                {state.chatMessages.length}
              </span>
            )}
          </button>

          <button
            onClick={() => openIntroPage(1)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-emerald-800 hover:bg-emerald-50 transition-colors ml-1 cursor-pointer"
            title="Buka Halaman Tentang Aplikasi & Sponsor"
          >
            <Shield className="w-3.5 h-3.5 text-emerald-700" />
            <span>Tentang & Sponsor</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action & Real Online Status & Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Real Online Presence Badge */}
          <button
            onClick={() => setIsOnlineModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg text-emerald-900 text-xs font-bold transition-all shadow-2xs cursor-pointer"
            title="Klik untuk melihat daftar nama warga yang sedang online saat ini"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
            </span>
            <span>{onlineUsers.length} Online</span>
          </button>

          {/* Quick Emergency Button */}
          <button
            onClick={() => setIsPanicModalOpen(true)}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold text-white rounded-lg transition-all shadow-sm cursor-pointer ${
              isPanicActive
                ? 'bg-red-600 hover:bg-red-700 animate-pulse ring-2 ring-red-400'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span className="whitespace-nowrap">Darurat 🚨</span>
          </button>

          {/* RT/RW Exclusive Dashboard Button */}
          {user.role === 'rt_rw' && (
            <button
              onClick={() => setIsAdminPanelOpen(true)}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors border border-emerald-300 cursor-pointer"
              title="Dashboard Pengaturan RT/RW"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-700" />
              <span>Panel RT/RW</span>
            </button>
          )}

          {/* User Account / Role Button */}
          {user.isLoggedIn ? (
            <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 rounded-lg px-2 sm:px-2.5 py-1.5">
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="flex items-center gap-1.5 text-left text-xs text-slate-800 hover:text-emerald-700 transition-colors cursor-pointer"
                title="Buka profil atau ganti akun"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-[10px]">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden sm:block max-w-[140px] truncate">
                  <div className="font-semibold truncate text-[11px]">
                    {user.name} {user.age ? `(${user.age} Thn)` : ''}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium truncate">
                    {user.role === 'rt_rw' ? 'Pengurus RT/RW' : 'Warga RT.01'}
                  </div>
                </div>
              </button>
              <button
                onClick={logout}
                className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors cursor-pointer"
                title="Keluar"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => openIntroPage(3)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200 cursor-pointer"
            >
              <User className="w-3.5 h-3.5" />
              <span>Masuk Akun</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Nav Bar */}
      <div className="lg:hidden border-t border-slate-200 bg-slate-50 px-2 py-1.5 flex items-center justify-between text-xs overflow-x-auto gap-1">
        <button
          onClick={() => setActiveTab('jadwal')}
          className={`px-2.5 py-1.5 rounded font-medium whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'jadwal' ? 'bg-emerald-700 text-white' : 'text-slate-700 hover:bg-slate-200'
          }`}
        >
          Jadwal (30 Slot)
        </button>
        <button
          onClick={() => setActiveTab('patroli')}
          className={`px-2.5 py-1.5 rounded font-medium whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'patroli' ? 'bg-emerald-700 text-white' : 'text-slate-700 hover:bg-slate-200'
          }`}
        >
          Presensi & Patroli
        </button>
        <button
          onClick={() => setActiveTab('kas')}
          className={`px-2.5 py-1.5 rounded font-medium whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'kas' ? 'bg-emerald-700 text-white' : 'text-slate-700 hover:bg-slate-200'
          }`}
        >
          Kas
        </button>
        <button
          onClick={() => setActiveTab('papan')}
          className={`px-2.5 py-1.5 rounded font-medium whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'papan' ? 'bg-emerald-700 text-white' : 'text-slate-700 hover:bg-slate-200'
          }`}
        >
          Papan
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`px-2.5 py-1.5 rounded font-medium whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'chat' ? 'bg-emerald-700 text-white' : 'text-slate-700 hover:bg-slate-200'
          }`}
        >
          Chat
        </button>
        <button
          onClick={() => openIntroPage(1)}
          className="px-2 py-1.5 rounded font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 whitespace-nowrap shrink-0 cursor-pointer"
        >
          Sponsor
        </button>
        {user.role === 'rt_rw' && (
          <button
            onClick={() => setIsAdminPanelOpen(true)}
            className="px-2.5 py-1.5 rounded font-semibold text-emerald-800 bg-emerald-100 whitespace-nowrap shrink-0 cursor-pointer"
          >
            Panel RT
          </button>
        )}
      </div>
    </header>
  );
};
