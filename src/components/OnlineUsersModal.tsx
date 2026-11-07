/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext.tsx';
import { X, Wifi, Shield, User, Clock, CheckCircle2 } from 'lucide-react';

export const OnlineUsersModal: React.FC = () => {
  const { user, onlineUsers, isOnlineModalOpen, setIsOnlineModalOpen } = useApp();

  if (!isOnlineModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Wifi className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg leading-tight">
                Warga Online Saat Ini
              </h3>
              <p className="text-xs text-emerald-300 font-mono mt-0.5">
                {onlineUsers.length} Perangkat Terhubung (Real-Time)
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOnlineModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <p>
              Sistem memantau sesi aktif warga secara langsung tanpa simulasi. Jumlah dan nama yang muncul di bawah adalah orang yang sungguh-sungguh membuka aplikasi ini saat ini.
            </p>
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {onlineUsers.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                Tidak ada pengguna lain yang sedang online.
              </div>
            ) : (
              onlineUsers.map((u, i) => {
                const isMe = u.name === user.name || u.email === user.email;
                return (
                  <div
                    key={u.sessionId || i}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      isMe
                        ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-300'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-sm">
                          {u.name.charAt(0)}
                        </div>
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white ring-1 ring-emerald-600" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900 truncate">
                            {u.name}
                          </span>
                          {isMe && (
                            <span className="text-[10px] font-extrabold bg-emerald-600 text-white px-2 py-0.2 rounded-full">
                              Anda
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                          {u.role === 'rt_rw' ? (
                            <span className="text-emerald-800 font-semibold flex items-center gap-1">
                              <Shield className="w-3 h-3" />
                              Pengurus RT/RW
                            </span>
                          ) : (
                            <span className="text-slate-600 flex items-center gap-1">
                              <User className="w-3 h-3" />
                              Warga RT.01
                            </span>
                          )}
                          {u.email && (
                            <>
                              <span>·</span>
                              <span className="truncate">{u.email}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                        Aktif
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Detak jantung (heartbeat) aktif per 15 detik</span>
          </div>
          <button
            onClick={() => setIsOnlineModalOpen(false)}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
