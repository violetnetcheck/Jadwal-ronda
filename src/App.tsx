/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext.tsx';
import { Header } from './components/Header.tsx';
import { StorySection } from './components/StorySection.tsx';
import { ScheduleSection } from './components/ScheduleSection.tsx';
import { PatrolAttendanceSection } from './components/PatrolAttendanceSection.tsx';
import { FinanceSection } from './components/FinanceSection.tsx';
import { CommunitySection } from './components/CommunitySection.tsx';
import { SiskamlingChat } from './components/SiskamlingChat.tsx';
import { PanicModal } from './components/PanicModal.tsx';
import { LoginModal } from './components/LoginModal.tsx';
import { AdminPanel } from './components/AdminPanel.tsx';
import { IntroOnboarding } from './components/IntroOnboarding.tsx';
import { OnlineUsersModal } from './components/OnlineUsersModal.tsx';
import { ShieldAlert, Shield, ShieldCheck } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { activeTab, setIsPanicModalOpen, setShowIntro } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70 text-slate-900 selection:bg-emerald-800 selection:text-white">
      {/* Header */}
      <Header />

      {/* Main Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-5 sm:py-7 space-y-6">
        {/* Story Warga Lingkungan Strip (Teks, Gambar, Video) */}
        <StorySection />

        {/* Tabbed Content */}
        {activeTab === 'jadwal' && <ScheduleSection />}
        {activeTab === 'patroli' && <PatrolAttendanceSection />}
        {activeTab === 'kas' && <FinanceSection />}
        {activeTab === 'papan' && <CommunitySection />}
        {activeTab === 'chat' && <SiskamlingChat />}
      </main>

      {/* Floating Emergency Panic Button (Mobile/Desktop quick-tap) */}
      <div className="fixed bottom-5 right-5 z-30">
        <button
          onClick={() => setIsPanicModalOpen(true)}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-extrabold text-xs sm:text-sm px-4 py-3 rounded-full shadow-2xl transition-all hover:scale-105 ring-4 ring-red-300/60 cursor-pointer"
          title="Tombol Darurat & Sirene Siskamling"
        >
          <ShieldAlert className="w-5 h-5 animate-pulse" />
          <span className="tracking-wide">DARURAT</span>
        </button>
      </div>

      {/* 3-Page Animated Onboarding & Real Login */}
      <IntroOnboarding />

      {/* Modals */}
      <PanicModal />
      <LoginModal />
      <AdminPanel />
      <OnlineUsersModal />

      {/* Footer conforming to domain-native aesthetic */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-8 px-4 sm:px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img
              src="/assets/aistudio/IMG-20261107-WA0006_2005fda4.jpg"
              alt="Logo Babakan Pandan"
              className="w-12 h-12 object-contain rounded-full border-2 border-amber-300 shrink-0"
            />
            <div>
              <div className="font-extrabold text-slate-900 text-sm">
                Ronda & Keamanan Warga RT.01 RW.02 Babakan Pandan
              </div>
              <div className="text-[11px] text-emerald-800 font-semibold mt-0.5">
                SANTUN: Sauyunan · Agamis · Nyunda · Toleran · UNggul (Periode 2025-2030)
              </div>
            </div>
          </div>

          {/* Sponsor Card in Footer */}
          <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-cyan-400 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-800">
                Didukung oleh Cakra Siber Nusantara
              </div>
              <div className="text-[10px] text-slate-500">
                Sponsor Resmi Keamanan & Kedaulatan Siber Komunitas Warga
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-slate-600 font-medium">
            <button
              onClick={() => setShowIntro(true)}
              className="text-emerald-800 hover:underline font-semibold"
            >
              Tentang & Sponsor
            </button>
            <span>·</span>
            <span>Pos Ronda: Balai RW.02</span>
            <span>·</span>
            <span>Kontak: 0812-8829-1021</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
