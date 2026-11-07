/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import type {
  AppState,
  UserProfile,
  PanicAlarm,
  ShiftSwapRequest,
  AttendanceRecord,
  PatrolLog,
  ChatMessage,
  RondaSchedule,
  CitizenStory,
  OnlineUser,
} from '../types/index.ts';
import { startEmergencySiren, stopEmergencySiren, playNotificationChime } from '../utils/audio.ts';
import {
  auth,
  db,
  googleProvider,
  signInWithPopup,
  signInAnonymously,
  onAuthStateChanged,
  signOut,
  doc,
  setDoc,
  serverTimestamp,
} from '../firebase.ts';

interface AppContextType {
  user: UserProfile;
  state: AppState | null;
  isLoading: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isPanicModalOpen: boolean;
  setIsPanicModalOpen: (open: boolean) => void;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
  isAdminPanelOpen: boolean;
  setIsAdminPanelOpen: (open: boolean) => void;
  showIntro: boolean;
  setShowIntro: (show: boolean) => void;
  introPage: 1 | 2 | 3;
  setIntroPage: (page: 1 | 2 | 3) => void;
  openIntroPage: (page: 1 | 2 | 3) => void;
  isOnlineModalOpen: boolean;
  setIsOnlineModalOpen: (open: boolean) => void;
  onlineUsers: OnlineUser[];
  isSirenMuted: boolean;
  toggleSirenMute: () => void;
  login: (profile: Omit<UserProfile, 'isLoggedIn'>, pin?: string) => boolean;
  loginReal: (data: {
    name: string;
    age: number;
    email: string;
    role: 'warga' | 'rt_rw';
    whatsapp?: string;
    pin?: string;
  }) => Promise<{ success: boolean; message?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; message?: string }>;
  enrollInSchedule: (
    target: 'tonight' | 'tomorrow',
    citizenName: string,
    phone: string,
    block: string,
    assignedPoint: string
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  triggerPanic: (
    type: PanicAlarm['type'],
    locationDescription: string,
    notes: string,
    coordinates?: { lat: number; lng: number }
  ) => Promise<boolean>;
  resolvePanic: () => Promise<boolean>;
  testPanicAudio: () => void;
  sendChatMessage: (
    text?: string,
    imageUrl?: string,
    videoUrl?: string,
    audioUrl?: string,
    audioDuration?: number,
    isUrgent?: boolean
  ) => Promise<boolean>;
  setTyping: (isTyping: boolean) => void;
  createStory: (data: {
    type: 'text' | 'image' | 'video';
    content?: string;
    mediaUrl?: string;
    bgGradient?: string;
  }) => Promise<boolean>;
  likeStory: (storyId: string) => Promise<boolean>;
  deleteStory: (storyId: string) => Promise<boolean>;
  updateSchedule: (target: 'tonight' | 'tomorrow', schedule: Partial<RondaSchedule>) => Promise<boolean>;
  requestShiftSwap: (data: {
    shiftTitle: string;
    targetCitizenName: string;
    reason: string;
  }) => Promise<boolean>;
  respondShiftSwap: (swapId: string, status: 'approved' | 'rejected') => Promise<boolean>;
  submitAttendance: (data: {
    checkpointName: string;
    method: 'QR_CODE' | 'GPS_CHECKIN';
    coordinates?: { lat: number; lng: number };
  }) => Promise<boolean>;
  submitPatrol: (data: {
    checkpointName: string;
    condition: PatrolLog['condition'];
    notes: string;
    photoUrl?: string;
    coordinates?: { lat: number; lng: number };
  }) => Promise<boolean>;
  recordFee: (name: string, block: string, amount: number, month: string, status: string) => Promise<boolean>;
  updateFeeStatus: (feeId: string, status: 'LUNAS' | 'BELUM LUNAS') => Promise<boolean>;
  addExpense: (data: { category: string; amount: number; description: string }) => Promise<boolean>;
  addAnnouncement: (data: {
    title: string;
    category: 'Keamanan' | 'Kerja Bakti' | 'Rapat Warga' | 'Info Penting' | 'Darurat';
    content: string;
    isPinned: boolean;
  }) => Promise<boolean>;
  deleteAnnouncement: (id: string) => Promise<boolean>;
  registerGuest: (data: {
    guestName: string;
    guestNik: string;
    guestPhone: string;
    hostName: string;
    hostAddress: string;
    originCity: string;
    purpose: string;
    stayDurationDays: number;
    photoUrl?: string;
  }) => Promise<boolean>;
  checkoutGuest: (id: string) => Promise<boolean>;
}

const AppContext = createContext<AppContextType | null>(null);

const USER_STORAGE_KEY = 'siskamling_user_profile_real_v2';
const BROADCAST_CHANNEL_NAME = 'siskamling_rt01_rw02_channel';

// Unique session identifier for online presence
const getOrCreateSessionId = () => {
  let sid = sessionStorage.getItem('siskamling_session_id');
  if (!sid) {
    sid = `sess_${Math.random().toString(36).slice(2, 9)}_${Date.now()}`;
    sessionStorage.setItem('siskamling_session_id', sid);
  }
  return sid;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const sessionIdRef = useRef<string>(getOrCreateSessionId());

  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(USER_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.isLoggedIn && parsed.name) {
          return parsed;
        }
      }
    } catch {
      // Ignored
    }
    return {
      name: '',
      age: 0,
      email: '',
      whatsapp: '',
      address: 'RT 01 RW 02 Babakan Pandan',
      role: 'warga',
      isLoggedIn: false,
    };
  });

  // Show intro onboarding if not logged in
  const [showIntro, setShowIntro] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(USER_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.isLoggedIn && parsed.name) {
          return false;
        }
      }
    } catch {
      // Ignored
    }
    return true; // Must show intro if unauthenticated
  });

  const [introPage, setIntroPage] = useState<1 | 2 | 3>(1);

  const [state, setState] = useState<AppState | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [isOnlineModalOpen, setIsOnlineModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('jadwal');
  const [isPanicModalOpen, setIsPanicModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isSirenMuted, setIsSirenMuted] = useState(false);

  const [broadcastChannel] = useState<BroadcastChannel | null>(() => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      return new BroadcastChannel(BROADCAST_CHANNEL_NAME);
    }
    return null;
  });

  const openIntroPage = (page: 1 | 2 | 3) => {
    setIntroPage(page);
    setShowIntro(true);
  };

  // Real Presence Ping Function
  const sendPresencePing = useCallback(async () => {
    if (!user.isLoggedIn || !user.name) return;
    try {
      const sid = sessionIdRef.current;
      const res = await fetch('/api/presence/ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sid,
          name: user.name,
          role: user.role,
          email: user.email,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.onlineUsers) {
          setOnlineUsers(data.onlineUsers);
        }
      }

      // Sync into Firestore presence
      try {
        await setDoc(doc(db, 'presence', sid), {
          sessionId: sid,
          name: user.name,
          role: user.role,
          email: user.email,
          lastPing: Date.now(),
        });
      } catch {
        // Firestore sync
      }
    } catch {
      // Offline fallback
    }
  }, [user.isLoggedIn, user.name, user.role, user.email]);

  // Periodic heartbeat every 15 seconds
  useEffect(() => {
    if (!user.isLoggedIn) {
      setOnlineUsers([]);
      return;
    }

    sendPresencePing();
    const interval = setInterval(sendPresencePing, 15000);

    const handleBeforeUnload = () => {
      const sid = sessionIdRef.current;
      navigator.sendBeacon('/api/presence/leave', JSON.stringify({ sessionId: sid }));
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user.isLoggedIn, sendPresencePing]);

  // Fetch initial state
  const fetchState = useCallback(async () => {
    try {
      const res = await fetch('/api/state');
      if (res.ok) {
        const data: AppState = await res.json();
        setState(data);
        if (data.onlineUsers) {
          setOnlineUsers(data.onlineUsers);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch state from server:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Listen to Server-Sent Events (SSE)
  useEffect(() => {
    fetchState();

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/events');

      eventSource.addEventListener('init', (e: MessageEvent) => {
        try {
          const fullState: AppState = JSON.parse(e.data);
          setState(fullState);
          if (fullState.onlineUsers) {
            setOnlineUsers(fullState.onlineUsers);
          }
        } catch {
          // Ignored
        }
      });

      eventSource.addEventListener('state_update', (e: MessageEvent) => {
        try {
          const updated: AppState = JSON.parse(e.data);
          setState(updated);
          if (updated.onlineUsers) {
            setOnlineUsers(updated.onlineUsers);
          }
        } catch {
          // Ignored
        }
      });

      eventSource.addEventListener('presence_update', (e: MessageEvent) => {
        try {
          const list: OnlineUser[] = JSON.parse(e.data);
          setOnlineUsers(list);
          setState((prev) => (prev ? { ...prev, onlineUsers: list } : prev));
        } catch {
          // Ignored
        }
      });

      eventSource.addEventListener('panic_triggered', (e: MessageEvent) => {
        try {
          const alarm: PanicAlarm = JSON.parse(e.data);
          setState((prev) => (prev ? { ...prev, panicAlarm: alarm } : prev));
          setIsPanicModalOpen(true);
          playNotificationChime();
        } catch {
          // Ignored
        }
      });

      eventSource.addEventListener('panic_resolved', (e: MessageEvent) => {
        try {
          const payload = JSON.parse(e.data);
          setState((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              panicAlarm: null,
              alarmHistory: payload.closedAlarm ? [payload.closedAlarm, ...prev.alarmHistory] : prev.alarmHistory,
            };
          });
          stopEmergencySiren();
          playNotificationChime();
        } catch {
          // Ignored
        }
      });

      eventSource.addEventListener('new_chat_message', (e: MessageEvent) => {
        try {
          const msg: ChatMessage = JSON.parse(e.data);
          setState((prev) => {
            if (!prev) return prev;
            if (prev.chatMessages.some((m) => m.id === msg.id)) return prev;
            return {
              ...prev,
              chatMessages: [...prev.chatMessages, msg],
            };
          });
          playNotificationChime();
        } catch {
          // Ignored
        }
      });

      eventSource.addEventListener('typing_update', (e: MessageEvent) => {
        try {
          const typers = JSON.parse(e.data);
          setState((prev) => (prev ? { ...prev, typingUsers: typers } : prev));
        } catch {
          // Ignored
        }
      });
    } catch (err) {
      console.warn('SSE connection error:', err);
    }

    return () => {
      eventSource?.close();
    };
  }, [fetchState]);

  // Audio Siren Synchronization
  useEffect(() => {
    if (state?.panicAlarm?.active && !isSirenMuted) {
      startEmergencySiren();
    } else {
      stopEmergencySiren();
    }
  }, [state?.panicAlarm?.active, isSirenMuted]);

  // Multi-tab BroadcastChannel listener
  useEffect(() => {
    if (!broadcastChannel) return;
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'PANIC_TRIGGERED') {
        fetchState();
      } else if (e.data?.type === 'PANIC_RESOLVED') {
        fetchState();
        stopEmergencySiren();
      }
    };
    broadcastChannel.addEventListener('message', handleMessage);
    return () => {
      broadcastChannel.removeEventListener('message', handleMessage);
    };
  }, [broadcastChannel, fetchState]);

  const toggleSirenMute = () => {
    setIsSirenMuted((prev) => {
      const next = !prev;
      if (next) {
        stopEmergencySiren();
      } else if (state?.panicAlarm?.active) {
        startEmergencySiren();
      }
      return next;
    });
  };

  // Real Login with Firebase Integration
  const loginReal = async (data: {
    name: string;
    age: number;
    email: string;
    role: 'warga' | 'rt_rw';
    whatsapp?: string;
    pin?: string;
  }): Promise<{ success: boolean; message?: string }> => {
    try {
      // 1. Authenticate with Firebase Auth
      let fbUid = auth.currentUser?.uid;
      if (!fbUid) {
        try {
          const userCredential = await signInAnonymously(auth);
          fbUid = userCredential.user.uid;
        } catch (fbErr) {
          console.warn('[Firebase Auth fallback]:', fbErr);
          fbUid = `user_${Date.now()}`;
        }
      }

      // 2. Persist in Firestore
      try {
        if (fbUid && auth.currentUser) {
          await setDoc(doc(db, 'users', fbUid), {
            uid: fbUid,
            name: data.name.trim(),
            age: Number(data.age),
            email: data.email.trim().toLowerCase(),
            whatsapp: data.whatsapp ? data.whatsapp.trim() : null,
            role: data.role,
            updatedAt: serverTimestamp(),
          });

          if (data.role === 'rt_rw') {
            await setDoc(doc(db, 'admins', fbUid), {
              adminEmail: data.email.trim().toLowerCase(),
              role: 'rt_rw',
              grantedAt: serverTimestamp(),
            });
          }
        }
      } catch (fsErr) {
        console.warn('[Firestore save error]:', fsErr);
      }

      // 3. Sync with backend session
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        const loggedUser: UserProfile = {
          name: result.user.name,
          age: result.user.age,
          email: result.user.email,
          whatsapp: result.user.whatsapp || '',
          address: result.user.address || 'RT.01 RW.02 Babakan Pandan',
          role: result.user.role,
          isLoggedIn: true,
        };
        setUser(loggedUser);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedUser));
        setShowIntro(false);

        // Send presence ping immediately
        const sid = sessionIdRef.current;
        await fetch('/api/presence/ping', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: sid,
            name: loggedUser.name,
            role: loggedUser.role,
            email: loggedUser.email,
          }),
        });

        return { success: true };
      } else {
        return { success: false, message: result.message || 'Gagal masuk akun' };
      }
    } catch {
      return { success: false, message: 'Koneksi ke server gagal' };
    }
  };

  // Google Sign-In with Firebase Auth
  const loginWithGoogle = async (): Promise<{ success: boolean; message?: string }> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const displayName = fbUser.displayName || 'Warga Babakan Pandan';
      const email = fbUser.email || '';

      const userData = {
        name: displayName,
        age: 30,
        email: email,
        role: 'warga' as const,
      };

      return await loginReal(userData);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google sign-in gagal';
      return { success: false, message: msg };
    }
  };

  const login = (profile: Omit<UserProfile, 'isLoggedIn'>, pin?: string): boolean => {
    if (profile.role === 'rt_rw') {
      const validPins = ['1234', '0102', '1945', '2026'];
      if (!pin || !validPins.includes(pin.trim())) {
        return false;
      }
    }

    const newProfile: UserProfile = {
      ...profile,
      isLoggedIn: true,
    };
    setUser(newProfile);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newProfile));
    setShowIntro(false);
    return true;
  };

  const logout = () => {
    const sid = sessionIdRef.current;
    fetch('/api/presence/leave', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: sid }),
    }).catch(() => {});

    try {
      signOut(auth).catch(() => {});
    } catch {
      // Ignored
    }

    const loggedOutProfile: UserProfile = {
      name: '',
      age: 0,
      email: '',
      whatsapp: '',
      address: 'RT 01 RW 02 Babakan Pandan',
      role: 'warga',
      isLoggedIn: false,
    };
    setUser(loggedOutProfile);
    localStorage.removeItem(USER_STORAGE_KEY);
    setIntroPage(3);
    setShowIntro(true);
  };

  // Enroll into Ronda Schedule
  const enrollInSchedule = async (
    target: 'tonight' | 'tomorrow',
    citizenName: string,
    phone: string,
    block: string,
    assignedPoint: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await fetch('/api/schedule/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target,
          citizenName,
          phone,
          block,
          assignedPoint,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchState();
        return { success: true };
      }
      return { success: false, message: data.message || 'Gagal mendaftar jadwal' };
    } catch {
      return { success: false, message: 'Koneksi ke server gagal' };
    }
  };

  const triggerPanic = async (
    type: PanicAlarm['type'],
    locationDescription: string,
    notes: string,
    coordinates?: { lat: number; lng: number }
  ): Promise<boolean> => {
    try {
      const res = await fetch('/api/panic/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          reportedBy: user.name,
          reporterPhone: user.whatsapp || user.email,
          reporterAddress: user.address || 'RT.01 RW.02 Babakan Pandan',
          locationDescription,
          coordinates,
          notes,
        }),
      });
      if (res.ok) {
        broadcastChannel?.postMessage({ type: 'PANIC_TRIGGERED' });
        fetchState();
        return true;
      }
    } catch (err) {
      console.warn('Error triggering panic:', err);
    }
    return false;
  };

  const resolvePanic = async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/panic/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resolvedBy: `${user.name} (${user.role === 'rt_rw' ? 'Pengurus RT/RW' : 'Pelapor'})`,
        }),
      });
      if (res.ok) {
        stopEmergencySiren();
        broadcastChannel?.postMessage({ type: 'PANIC_RESOLVED' });
        fetchState();
        return true;
      }
    } catch (err) {
      console.warn('Error resolving panic:', err);
    }
    return false;
  };

  const testPanicAudio = () => {
    startEmergencySiren();
    setTimeout(() => {
      if (!state?.panicAlarm?.active) {
        stopEmergencySiren();
      }
    }, 4000);
  };

  const sendChatMessage = async (
    text?: string,
    imageUrl?: string,
    videoUrl?: string,
    audioUrl?: string,
    audioDuration?: number,
    isUrgent?: boolean
  ): Promise<boolean> => {
    try {
      const res = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderName: user.name,
          senderPhone: user.whatsapp || '-',
          senderEmail: user.email,
          senderAddress: user.address || 'RT 01 RW 02',
          senderRole: user.role,
          text,
          imageUrl,
          videoUrl,
          audioUrl,
          audioDuration,
          isUrgent,
        }),
      });
      if (res.ok) {
        fetchState();
        return true;
      }
    } catch (err) {
      console.warn('Error sending chat message:', err);
    }
    return false;
  };

  const setTyping = async (isTyping: boolean) => {
    if (!user.name) return;
    try {
      await fetch('/api/chat/typing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: user.name, isTyping }),
      });
    } catch {
      // Ignored
    }
  };

  const createStory = async (data: {
    type: 'text' | 'image' | 'video';
    content?: string;
    mediaUrl?: string;
    bgGradient?: string;
  }): Promise<boolean> => {
    try {
      const res = await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorName: user.name,
          authorRole: user.role,
          authorAge: user.age,
          authorEmail: user.email,
          ...data,
        }),
      });
      if (res.ok) {
        fetchState();
        return true;
      }
    } catch (err) {
      console.warn('Error creating story:', err);
    }
    return false;
  };

  const likeStory = async (storyId: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/stories/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storyId }),
      });
      if (res.ok) {
        fetchState();
        return true;
      }
    } catch (err) {
      console.warn('Error liking story:', err);
    }
    return false;
  };

  const deleteStory = async (storyId: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/stories/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storyId }),
      });
      if (res.ok) {
        fetchState();
        return true;
      }
    } catch (err) {
      console.warn('Error deleting story:', err);
    }
    return false;
  };

  const updateSchedule = async (target: 'tonight' | 'tomorrow', sched: Partial<RondaSchedule>): Promise<boolean> => {
    try {
      const res = await fetch('/api/schedule/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, schedule: sched }),
      });
      if (res.ok) {
        fetchState();
        return true;
      }
    } catch (err) {
      console.warn('Error updating schedule:', err);
    }
    return false;
  };

  const requestShiftSwap = async (data: {
    shiftTitle: string;
    targetCitizenName: string;
    reason: string;
  }): Promise<boolean> => {
    try {
      const res = await fetch('/api/shifts/swap-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requesterName: user.name,
          requesterPhone: user.whatsapp || user.email,
          requesterAddress: user.address || 'RT.01 RW.02 Babakan Pandan',
          ...data,
        }),
      });
      if (res.ok) {
        fetchState();
        return true;
      }
    } catch (err) {
      console.warn('Error requesting shift swap:', err);
    }
    return false;
  };

  const respondShiftSwap = async (swapId: string, status: 'approved' | 'rejected'): Promise<boolean> => {
    try {
      const res = await fetch('/api/shifts/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          swapId,
          status,
          responderName: user.name,
        }),
      });
      if (res.ok) {
        fetchState();
        return true;
      }
    } catch (err) {
      console.warn('Error responding shift swap:', err);
    }
    return false;
  };

  const submitAttendance = async (data: {
    checkpointName: string;
    method: 'QR_CODE' | 'GPS_CHECKIN';
    coordinates?: { lat: number; lng: number };
  }): Promise<boolean> => {
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantName: user.name,
          phone: user.whatsapp || user.email,
          address: user.address || 'RT.01 RW.02',
          ...data,
        }),
      });
      if (res.ok) {
        fetchState();
        return true;
      }
    } catch (err) {
      console.warn('Error submitting attendance:', err);
    }
    return false;
  };

  const submitPatrol = async (data: {
    checkpointName: string;
    condition: PatrolLog['condition'];
    notes: string;
    photoUrl?: string;
    coordinates?: { lat: number; lng: number };
  }): Promise<boolean> => {
    try {
      const res = await fetch('/api/patrol', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          officerName: user.name,
          officerPhone: user.whatsapp || user.email,
          ...data,
        }),
      });
      if (res.ok) {
        fetchState();
        return true;
      }
    } catch (err) {
      console.warn('Error submitting patrol log:', err);
    }
    return false;
  };

  const recordFee = async (name: string, block: string, amount: number, month: string, status: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/ledger/record-fee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, block, amount, month, status }),
      });
      if (res.ok) {
        fetchState();
        return true;
      }
    } catch (err) {
      console.warn('Error recording fee:', err);
    }
    return false;
  };

  const updateFeeStatus = async (feeId: string, status: 'LUNAS' | 'BELUM LUNAS'): Promise<boolean> => {
    try {
      const res = await fetch('/api/ledger/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feeId, status }),
      });
      if (res.ok) {
        fetchState();
        return true;
      }
    } catch (err) {
      console.warn('Error updating fee status:', err);
    }
    return false;
  };

  const addExpense = async (data: { category: string; amount: number; description: string }): Promise<boolean> => {
    try {
      const res = await fetch('/api/ledger/expense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          recordedBy: user.name,
        }),
      });
      if (res.ok) {
        fetchState();
        return true;
      }
    } catch (err) {
      console.warn('Error adding expense:', err);
    }
    return false;
  };

  const addAnnouncement = async (data: {
    title: string;
    category: 'Keamanan' | 'Kerja Bakti' | 'Rapat Warga' | 'Info Penting' | 'Darurat';
    content: string;
    isPinned: boolean;
  }): Promise<boolean> => {
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          author: user.name,
          authorRole: user.role === 'rt_rw' ? 'Pengurus RT/RW' : 'Warga RT.01',
        }),
      });
      if (res.ok) {
        fetchState();
        return true;
      }
    } catch (err) {
      console.warn('Error adding announcement:', err);
    }
    return false;
  };

  const deleteAnnouncement = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/announcements/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        fetchState();
        return true;
      }
    } catch (err) {
      console.warn('Error deleting announcement:', err);
    }
    return false;
  };

  const registerGuest = async (data: {
    guestName: string;
    guestNik: string;
    guestPhone: string;
    hostName: string;
    hostAddress: string;
    originCity: string;
    purpose: string;
    stayDurationDays: number;
    photoUrl?: string;
  }): Promise<boolean> => {
    try {
      const res = await fetch('/api/guests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          verifiedBy: user.name,
        }),
      });
      if (res.ok) {
        fetchState();
        return true;
      }
    } catch (err) {
      console.warn('Error registering guest:', err);
    }
    return false;
  };

  const checkoutGuest = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/guests/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        fetchState();
        return true;
      }
    } catch (err) {
      console.warn('Error checking out guest:', err);
    }
    return false;
  };

  return (
    <AppContext.Provider
      value={{
        user,
        state,
        isLoading,
        activeTab,
        setActiveTab,
        isPanicModalOpen,
        setIsPanicModalOpen,
        isLoginModalOpen,
        setIsLoginModalOpen,
        isAdminPanelOpen,
        setIsAdminPanelOpen,
        showIntro,
        setShowIntro,
        introPage,
        setIntroPage,
        openIntroPage,
        isOnlineModalOpen,
        setIsOnlineModalOpen,
        onlineUsers,
        isSirenMuted,
        toggleSirenMute,
        login,
        loginReal,
        loginWithGoogle,
        enrollInSchedule,
        logout,
        triggerPanic,
        resolvePanic,
        testPanicAudio,
        sendChatMessage,
        setTyping,
        createStory,
        likeStory,
        deleteStory,
        updateSchedule,
        requestShiftSwap,
        respondShiftSwap,
        submitAttendance,
        submitPatrol,
        recordFee,
        updateFeeStatus,
        addExpense,
        addAnnouncement,
        deleteAnnouncement,
        registerGuest,
        checkoutGuest,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
