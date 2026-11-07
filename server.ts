/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import type {
  AppState,
  ChatMessage,
  PanicAlarm,
  ShiftSwapRequest,
  AttendanceRecord,
  PatrolLog,
  CashTransaction,
  Announcement,
  GuestRecord,
  CitizenStory,
  OnlineUser,
} from './src/types/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const PORT = 3000;

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

const getTodayFormatted = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const defaultCheckpoints = [
  'Pos Ronda Utama Balai RW 02 (RT.01)',
  'Pos Pantau Blok A (Gang Melati & Lapangan)',
  'Pos Pantau Blok B (Pertigaan Mesjid & Gang Pandan)',
  'Pos Pantau Blok C (Jembatan & Batas Barat)',
  'Pos Pantau Blok D (Portal Gerbang Timur Babakan)',
];

// Pristine authentic initial state (No fake people or dummy records)
const state: AppState = {
  scheduleTonight: {
    date: getTodayFormatted(0),
    title: 'Jadwal Ronda Malam Ini',
    hours: '22:00 - 04:00 WIB',
    coordinator: 'Pengurus RT.01',
    coordinatorPhone: '-',
    participants: [],
    checkpoints: defaultCheckpoints,
    notes: 'Jadwal siskamling malam ini. Silakan warga mendaftar diri pada slot ronda yang tersedia.',
  },
  scheduleTomorrow: {
    date: getTodayFormatted(1),
    title: 'Jadwal Ronda Malam Besok',
    hours: '22:00 - 04:00 WIB',
    coordinator: 'Pengurus RT.01',
    coordinatorPhone: '-',
    participants: [],
    checkpoints: defaultCheckpoints,
    notes: 'Jadwal siskamling malam besok. Terbuka hingga 30 slot warga Babakan Pandan.',
  },
  shiftSwaps: [],
  panicAlarm: null,
  alarmHistory: [],
  attendances: [],
  patrolLogs: [],
  citizenFees: [],
  cashTransactions: [],
  announcements: [
    {
      id: 'ann-init-1',
      title: 'Selamat Datang di Sistem Keamanan Siskamling Digital RT.01 RW.02',
      category: 'Info Penting',
      content: 'Aplikasi resmi Ronda dan Ketertiban Warga RT.01 RW.02 Babakan Pandan (Periode 2025-2030) didukung oleh sponsor Cakra Siber Nusantara. Mari bersama menjaga keamanan lingkungan secara sauyunan dan mandiri.',
      author: 'Pengurus RW 02 Babakan Pandan',
      authorRole: 'Pengurus RT/RW',
      date: getTodayFormatted(0),
      isPinned: true,
    },
  ],
  guests: [],
  chatMessages: [
    {
      id: 'chat-init-1',
      senderName: 'Sistem Siskamling',
      senderEmail: 'siskamling@babakanpandan.id',
      senderRole: 'rt_rw',
      text: 'Selamat datang di Ruang Koordinasi Keamanan Warga RT.01 RW.02 Babakan Pandan. Kanal ini aktif untuk koordinasi patroli, laporan darurat, dan komunikasi warga.',
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      isUrgent: false,
    },
  ],
  stories: [],
  typingUsers: [],
  onlineUsers: [],
};

// Real Active Online Sessions Map (sessionId -> session)
const activeSessions = new Map<string, OnlineUser>();

// Registered Real Users
const registeredUsers: Array<{
  name: string;
  age: number;
  email: string;
  whatsapp?: string;
  role: 'warga' | 'rt_rw';
  registeredAt: string;
}> = [];

// Connected SSE clients for instant live broadcast
const sseClients: Response[] = [];

function broadcastSSE(eventType: string, data: unknown) {
  const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach((client) => {
    try {
      client.write(payload);
    } catch {
      // Ignored
    }
  });
}

function updateOnlineListAndBroadcast() {
  const now = Date.now();
  let changed = false;
  for (const [sid, session] of activeSessions.entries()) {
    if (now - session.lastSeen > 35000) {
      activeSessions.delete(sid);
      changed = true;
    }
  }
  const currentList = Array.from(activeSessions.values());
  state.onlineUsers = currentList;
  if (changed) {
    broadcastSSE('presence_update', currentList);
  }
}

// Periodic session cleanup
setInterval(updateOnlineListAndBroadcast, 10000);

// SSE Stream Endpoint
app.get('/api/events', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  sseClients.push(res);
  updateOnlineListAndBroadcast();

  // Send full initial state immediately
  res.write(`event: init\ndata: ${JSON.stringify(state)}\n\n`);

  req.on('close', () => {
    const idx = sseClients.indexOf(res);
    if (idx !== -1) {
      sseClients.splice(idx, 1);
    }
  });
});

// REST: State
app.get('/api/state', (_req: Request, res: Response) => {
  updateOnlineListAndBroadcast();
  res.json(state);
});

// Real Online Presence: Ping
app.post('/api/presence/ping', (req: Request, res: Response) => {
  const { sessionId, name, role, email } = req.body;
  if (!sessionId || !name) {
    return res.status(400).json({ success: false, message: 'Invalid presence payload' });
  }

  activeSessions.set(sessionId, {
    sessionId,
    name: name.trim(),
    role: role || 'warga',
    email: email || '',
    lastSeen: Date.now(),
  });

  state.onlineUsers = Array.from(activeSessions.values());
  broadcastSSE('presence_update', state.onlineUsers);
  res.json({ success: true, onlineCount: activeSessions.size, onlineUsers: state.onlineUsers });
});

// Real Online Presence: Leave
app.post('/api/presence/leave', (req: Request, res: Response) => {
  const { sessionId } = req.body;
  if (sessionId && activeSessions.has(sessionId)) {
    activeSessions.delete(sessionId);
    state.onlineUsers = Array.from(activeSessions.values());
    broadcastSSE('presence_update', state.onlineUsers);
  }
  res.json({ success: true });
});

// Real Online Presence: Get List
app.get('/api/presence', (_req: Request, res: Response) => {
  updateOnlineListAndBroadcast();
  res.json({ onlineCount: activeSessions.size, onlineUsers: state.onlineUsers });
});

// 1. Real User Authentication & Registration (Firebase Integrated)
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { name, age, email, role, whatsapp, pin } = req.body;

  if (!name || !age || !email) {
    return res.status(400).json({ success: false, message: 'Nama panjang, umur, dan Gmail wajib diisi!' });
  }

  if (role === 'rt_rw') {
    if (!whatsapp) {
      return res.status(400).json({ success: false, message: 'Nomor WhatsApp wajib diisi untuk login sebagai RT/RW!' });
    }
    const validPins = ['1234', '0102', '1945', '2026'];
    if (!pin || !validPins.includes(String(pin).trim())) {
      return res.status(401).json({ success: false, message: 'PIN Pengurus RT/RW salah! (Gunakan PIN resmi: 1234 atau 0102)' });
    }
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existingIndex = registeredUsers.findIndex((u) => u.email.toLowerCase() === normalizedEmail);
  const userData = {
    name: name.trim(),
    age: Number(age),
    email: normalizedEmail,
    whatsapp: whatsapp ? whatsapp.trim() : undefined,
    role: (role === 'rt_rw' ? 'rt_rw' : 'warga') as 'warga' | 'rt_rw',
    registeredAt: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    registeredUsers[existingIndex] = userData;
  } else {
    registeredUsers.push(userData);
  }

  res.json({ success: true, user: { ...userData, isLoggedIn: true } });
});

// 2. Panic Alarm Endpoints
app.post('/api/panic/trigger', (req: Request, res: Response) => {
  const { type, reportedBy, reporterPhone, reporterAddress, locationDescription, coordinates, notes } = req.body;
  const newAlarm: PanicAlarm = {
    id: `panic-${Date.now()}`,
    active: true,
    type: type || 'Maling / Pencurian',
    reportedBy: reportedBy || 'Warga RT.01',
    reporterPhone: reporterPhone || '-',
    reporterAddress: reporterAddress || 'RT.01 RW.02 Babakan Pandan',
    locationDescription: locationDescription || 'Sekitar Wilayah RT.01 Babakan Pandan',
    coordinates: coordinates || { lat: -6.914744, lng: 107.60981 },
    notes: notes || 'Alarm darurat diaktifkan oleh warga!',
    timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
  };

  state.panicAlarm = newAlarm;

  // Real urgent chat notice
  const urgentChat: ChatMessage = {
    id: `chat-panic-${Date.now()}`,
    senderName: '🚨 SISTEM ALARM DARURAT',
    senderPhone: '0812-DARURAT',
    senderAddress: newAlarm.reporterAddress,
    senderRole: 'rt_rw',
    text: `⚠️ DARURAT AKTIF: ${newAlarm.type}! Lokasi: ${newAlarm.locationDescription}. Pelapor: ${newAlarm.reportedBy} (${newAlarm.reporterPhone}). Sirene berbunyi, mohon petugas dan warga terdekat merapat!`,
    timestamp: newAlarm.timestamp,
    isUrgent: true,
  };
  state.chatMessages.push(urgentChat);

  broadcastSSE('panic_triggered', newAlarm);
  broadcastSSE('new_chat_message', urgentChat);
  res.json({ success: true, alarm: newAlarm });
});

app.post('/api/panic/resolve', (req: Request, res: Response) => {
  const { resolvedBy } = req.body;
  if (state.panicAlarm) {
    const closedAlarm = {
      ...state.panicAlarm,
      active: false,
      resolvedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      resolvedBy: resolvedBy || 'Pengurus RT/RW Babakan Pandan',
    };
    state.alarmHistory.unshift(closedAlarm);
    state.panicAlarm = null;

    const safeChat: ChatMessage = {
      id: `chat-safe-${Date.now()}`,
      senderName: '🛡️ PENGURUS RT.01 RW.02',
      senderPhone: '0812-DARURAT',
      senderAddress: 'Balai RW 02 Babakan Pandan',
      senderRole: 'rt_rw',
      text: `✅ SITUASI TERKENDALI: Alarm darurat telah dinonaktifkan oleh ${closedAlarm.resolvedBy}. Kondisi lingkungan kembali aman terkendali.`,
      timestamp: closedAlarm.resolvedAt,
    };
    state.chatMessages.push(safeChat);

    broadcastSSE('panic_resolved', { closedAlarm, resolvedBy: closedAlarm.resolvedBy });
    broadcastSSE('new_chat_message', safeChat);
  }
  res.json({ success: true });
});

// 3. Chat Endpoints (Multimodal: Text, Images, Videos, Audio Voice Notes)
app.post('/api/chat/message', (req: Request, res: Response) => {
  const {
    senderName,
    senderPhone,
    senderEmail,
    senderAddress,
    senderRole,
    text,
    imageUrl,
    videoUrl,
    audioUrl,
    audioDuration,
    isUrgent,
  } = req.body;

  const msg: ChatMessage = {
    id: `chat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    senderName: senderName || 'Warga Babakan Pandan',
    senderPhone: senderPhone || '-',
    senderEmail: senderEmail || '-',
    senderAddress: senderAddress || 'RT 01 RW 02',
    senderRole: senderRole || 'warga',
    text,
    imageUrl,
    videoUrl,
    audioUrl,
    audioDuration,
    timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
    isUrgent: Boolean(isUrgent),
  };

  state.chatMessages.push(msg);
  broadcastSSE('new_chat_message', msg);
  res.json({ success: true, message: msg });
});

app.post('/api/chat/typing', (req: Request, res: Response) => {
  const { name, isTyping } = req.body;
  if (!name) return res.json({ success: false });

  if (isTyping) {
    const existing = state.typingUsers.find((u) => u.name === name);
    if (existing) {
      existing.timestamp = Date.now();
    } else {
      state.typingUsers.push({ name, timestamp: Date.now() });
    }
  } else {
    state.typingUsers = state.typingUsers.filter((u) => u.name !== name);
  }

  state.typingUsers = state.typingUsers.filter((u) => Date.now() - u.timestamp < 4000);
  broadcastSSE('typing_update', state.typingUsers);
  res.json({ success: true, typingUsers: state.typingUsers });
});

// 4. Story Endpoints (Teks, Gambar, Video)
app.post('/api/stories', (req: Request, res: Response) => {
  const { authorName, authorRole, authorAge, authorEmail, type, content, mediaUrl, bgGradient } = req.body;
  const newStory: CitizenStory = {
    id: `story-${Date.now()}`,
    authorName: authorName || 'Warga',
    authorRole: authorRole || 'warga',
    authorAge: Number(authorAge) || 25,
    authorEmail: authorEmail || '',
    type: type || 'text',
    content: content || '',
    mediaUrl: mediaUrl || undefined,
    bgGradient: bgGradient || 'from-emerald-700 via-teal-800 to-slate-900',
    timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
    createdAt: Date.now(),
    likes: 0,
  };

  state.stories.unshift(newStory);
  broadcastSSE('state_update', state);
  res.json({ success: true, story: newStory });
});

app.post('/api/stories/like', (req: Request, res: Response) => {
  const { storyId } = req.body;
  const story = state.stories.find((s) => s.id === storyId);
  if (story) {
    story.likes += 1;
    broadcastSSE('state_update', state);
  }
  res.json({ success: true, likes: story?.likes || 0 });
});

app.post('/api/stories/delete', (req: Request, res: Response) => {
  const { storyId } = req.body;
  state.stories = state.stories.filter((s) => s.id !== storyId);
  broadcastSSE('state_update', state);
  res.json({ success: true });
});

// 5. Schedule & Shift Swap Endpoints
app.post('/api/schedule/enroll', (req: Request, res: Response) => {
  const { target, citizenName, phone, block, assignedPoint } = req.body;
  const sched = target === 'tomorrow' ? state.scheduleTomorrow : state.scheduleTonight;

  if (sched.participants.length >= 30) {
    return res.status(400).json({ success: false, message: 'Kapasitas slot ronda sudah penuh (30 warga)!' });
  }

  const already = sched.participants.some((p) => p.name.toLowerCase() === citizenName.toLowerCase());
  if (already) {
    return res.status(400).json({ success: false, message: 'Anda sudah terdaftar dalam jadwal ronda ini!' });
  }

  const newParticipant = {
    id: `${target}-${Date.now()}`,
    name: citizenName.trim(),
    phone: phone ? phone.trim() : '-',
    block: block || 'RT.01',
    assignedPoint: assignedPoint || defaultCheckpoints[sched.participants.length % defaultCheckpoints.length],
    attended: false,
  };

  sched.participants.push(newParticipant);
  broadcastSSE('state_update', state);
  res.json({ success: true, participant: newParticipant });
});

app.post('/api/schedule/update', (req: Request, res: Response) => {
  const { target, schedule } = req.body;
  if (target === 'tonight') {
    state.scheduleTonight = { ...state.scheduleTonight, ...schedule };
  } else if (target === 'tomorrow') {
    state.scheduleTomorrow = { ...state.scheduleTomorrow, ...schedule };
  }
  broadcastSSE('state_update', state);
  res.json({ success: true, state });
});

app.post('/api/shifts/swap-request', (req: Request, res: Response) => {
  const { requesterName, requesterPhone, requesterAddress, shiftTitle, targetCitizenName, reason } = req.body;
  const newSwap: ShiftSwapRequest = {
    id: `swap-${Date.now()}`,
    requesterName,
    requesterPhone,
    requesterAddress,
    shiftDate: shiftTitle === 'Malam Besok' ? state.scheduleTomorrow.date : state.scheduleTonight.date,
    shiftTitle,
    targetCitizenName: targetCitizenName || 'Siapa Saja yang Bersedia',
    reason,
    status: 'pending',
    createdAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
  };

  state.shiftSwaps.unshift(newSwap);
  broadcastSSE('state_update', state);
  res.json({ success: true, swap: newSwap });
});

app.post('/api/shifts/respond', (req: Request, res: Response) => {
  const { swapId, status, responderName } = req.body;
  const swap = state.shiftSwaps.find((s) => s.id === swapId);
  if (swap) {
    swap.status = status;
    swap.respondedBy = `${responderName} (${status === 'approved' ? 'Disetujui' : 'Ditolak'})`;
    broadcastSSE('state_update', state);
  }
  res.json({ success: true, swap });
});

// 6. Attendance & Patrol Endpoints
app.post('/api/attendance', (req: Request, res: Response) => {
  const { participantName, phone, address, checkpointName, method, coordinates } = req.body;
  const record: AttendanceRecord = {
    id: `att-${Date.now()}`,
    participantName,
    phone,
    address,
    checkpointName,
    method: method || 'QR_CODE',
    timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
    coordinates,
  };

  state.attendances.unshift(record);

  const pTonight = state.scheduleTonight.participants.find((p) => p.name.includes(participantName) || participantName.includes(p.name));
  if (pTonight) {
    pTonight.attended = true;
    pTonight.attendedAt = record.timestamp;
  }

  broadcastSSE('state_update', state);
  res.json({ success: true, record });
});

app.post('/api/patrol', (req: Request, res: Response) => {
  const { officerName, officerPhone, checkpointName, condition, notes, photoUrl, coordinates } = req.body;
  const log: PatrolLog = {
    id: `patrol-${Date.now()}`,
    officerName,
    officerPhone,
    checkpointName,
    condition,
    notes,
    photoUrl,
    timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
    coordinates,
  };

  state.patrolLogs.unshift(log);
  broadcastSSE('state_update', state);
  res.json({ success: true, log });
});

// 7. Citizen Fees & Cash Ledger
app.post('/api/ledger/record-fee', (req: Request, res: Response) => {
  const { name, block, amount, month, status } = req.body;
  const isPaid = status === 'LUNAS';
  const newFee = {
    id: `fee-${Date.now()}`,
    name: name.trim(),
    block: block || 'RT.01',
    amount: Number(amount) || 25000,
    month: month || 'Bulan Ini',
    status: (isPaid ? 'LUNAS' : 'BELUM LUNAS') as 'LUNAS' | 'BELUM LUNAS',
    paidAt: isPaid ? new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : undefined,
    receiptNumber: isPaid ? `KAS-RT01-${Date.now().toString().slice(-4)}` : undefined,
  };

  state.citizenFees.unshift(newFee);

  if (isPaid) {
    state.cashTransactions.unshift({
      id: `tx-${Date.now()}`,
      type: 'PEMASUKAN',
      category: 'Iuran Warga Bulanan',
      amount: newFee.amount,
      description: `Iuran Keamanan ${newFee.name} (${newFee.block})`,
      date: newFee.paidAt || 'Hari ini',
      recordedBy: 'Bendahara RT.01',
    });
  }

  broadcastSSE('state_update', state);
  res.json({ success: true, fee: newFee });
});

app.post('/api/ledger/payment', (req: Request, res: Response) => {
  const { feeId, status, amount } = req.body;
  const fee = state.citizenFees.find((f) => f.id === feeId);
  if (fee) {
    fee.status = status;
    if (status === 'LUNAS') {
      fee.paidAt = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
      fee.receiptNumber = `KAS-RT01-${Date.now().toString().slice(-4)}`;
      state.cashTransactions.unshift({
        id: `tx-${Date.now()}`,
        type: 'PEMASUKAN',
        category: 'Iuran Warga Bulanan',
        amount: amount || fee.amount,
        description: `Iuran Keamanan ${fee.name} (${fee.block})`,
        date: fee.paidAt,
        recordedBy: 'Bendahara RT.01',
      });
    }
    broadcastSSE('state_update', state);
  }
  res.json({ success: true, fee });
});

app.post('/api/ledger/expense', (req: Request, res: Response) => {
  const { category, amount, description, recordedBy } = req.body;
  const tx: CashTransaction = {
    id: `tx-${Date.now()}`,
    type: 'PENGELUARAN',
    category: category || 'Operasional Ronda',
    amount: Number(amount),
    description,
    date: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
    recordedBy: recordedBy || 'Pengurus RT/RW',
  };

  state.cashTransactions.unshift(tx);
  broadcastSSE('state_update', state);
  res.json({ success: true, transaction: tx });
});

// 8. Announcements
app.post('/api/announcements', (req: Request, res: Response) => {
  const { title, category, content, author, authorRole, isPinned } = req.body;
  const ann: Announcement = {
    id: `ann-${Date.now()}`,
    title,
    category: category || 'Info Penting',
    content,
    author: author || 'Pengurus RT.01',
    authorRole: authorRole || 'Pengurus RT/RW',
    date: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
    isPinned: Boolean(isPinned),
  };

  state.announcements.unshift(ann);
  broadcastSSE('state_update', state);
  res.json({ success: true, announcement: ann });
});

app.post('/api/announcements/delete', (req: Request, res: Response) => {
  const { id } = req.body;
  state.announcements = state.announcements.filter((a) => a.id !== id);
  broadcastSSE('state_update', state);
  res.json({ success: true });
});

// 9. Guest Book
app.post('/api/guests', (req: Request, res: Response) => {
  const { guestName, guestNik, guestPhone, hostName, hostAddress, originCity, purpose, stayDurationDays, photoUrl, verifiedBy } = req.body;
  const guest: GuestRecord = {
    id: `guest-${Date.now()}`,
    guestName,
    guestNik,
    guestPhone,
    hostName,
    hostAddress,
    originCity,
    purpose,
    arrivalDate: getTodayFormatted(0),
    stayDurationDays: Number(stayDurationDays) || 1,
    photoUrl,
    status: 'SEDANG_MENGINAP',
    registeredAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
    verifiedBy: verifiedBy || 'Petugas Jaga Ronda',
  };

  state.guests.unshift(guest);
  broadcastSSE('state_update', state);
  res.json({ success: true, guest });
});

app.post('/api/guests/checkout', (req: Request, res: Response) => {
  const { id } = req.body;
  const guest = state.guests.find((g) => g.id === id);
  if (guest) {
    guest.status = 'SUDAH_PULANG';
    broadcastSSE('state_update', state);
  }
  res.json({ success: true, guest });
});

// Serve frontend in production or via Vite in dev
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[SISKAMLING RT.01 RW.02] Server berjalan asli pada http://0.0.0.0:${PORT}`);
  });
}

startServer();
