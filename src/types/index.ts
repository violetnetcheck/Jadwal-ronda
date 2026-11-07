/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'warga' | 'rt_rw';

export interface UserProfile {
  name: string;
  age: number;
  email: string;
  whatsapp?: string;
  address?: string;
  role: UserRole;
  isLoggedIn: boolean;
}

export interface RondaParticipant {
  id: string;
  name: string;
  phone: string;
  block: string;
  assignedPoint: string;
  attended: boolean;
  attendedAt?: string;
}

export interface RondaSchedule {
  date: string;
  title: string;
  hours: string;
  coordinator: string;
  coordinatorPhone: string;
  participants: RondaParticipant[];
  checkpoints: string[];
  notes: string;
}

export interface ShiftSwapRequest {
  id: string;
  requesterName: string;
  requesterPhone: string;
  requesterAddress: string;
  shiftDate: string;
  shiftTitle: string; // 'Malam Ini' | 'Malam Besok'
  targetCitizenName: string; // specific name or 'Siapa Saja yang Bersedia'
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  respondedBy?: string;
}

export interface PanicAlarm {
  id: string;
  active: boolean;
  type: 'Maling / Pencurian' | 'Kebakaran' | 'Darurat Medis' | 'Keributan / Gangguan' | 'Bencana Alam';
  reportedBy: string;
  reporterPhone: string;
  reporterAddress: string;
  locationDescription: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  notes: string;
  timestamp: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface AttendanceRecord {
  id: string;
  participantName: string;
  phone: string;
  address: string;
  checkpointName: string;
  timestamp: string;
  method: 'QR_CODE' | 'GPS_CHECKIN';
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface PatrolLog {
  id: string;
  officerName: string;
  officerPhone: string;
  checkpointName: string;
  condition: 'Aman & Kondusif' | 'Pagar Rumah Terbuka' | 'Lampu PJU Padam' | 'Orang Mencurigakan' | 'Hewan / Sampah Liar';
  notes: string;
  photoUrl?: string;
  timestamp: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface CitizenFee {
  id: string;
  name: string;
  block: string;
  amount: number;
  month: string;
  status: 'LUNAS' | 'BELUM LUNAS';
  paidAt?: string;
  receiptNumber?: string;
}

export interface CashTransaction {
  id: string;
  type: 'PEMASUKAN' | 'PENGELUARAN';
  category: string;
  amount: number;
  description: string;
  date: string;
  recordedBy: string;
}

export interface Announcement {
  id: string;
  title: string;
  category: 'Keamanan' | 'Kerja Bakti' | 'Rapat Warga' | 'Info Penting' | 'Darurat';
  content: string;
  author: string;
  authorRole: string;
  date: string;
  isPinned: boolean;
}

export interface GuestRecord {
  id: string;
  guestName: string;
  guestNik: string;
  guestPhone: string;
  hostName: string;
  hostAddress: string;
  originCity: string;
  purpose: string;
  arrivalDate: string;
  stayDurationDays: number;
  photoUrl?: string;
  status: 'SEDANG_MENGINAP' | 'SUDAH_PULANG';
  registeredAt: string;
  verifiedBy?: string;
}

export interface ChatMessage {
  id: string;
  senderName: string;
  senderPhone?: string;
  senderEmail?: string;
  senderAddress?: string;
  senderRole: UserRole;
  text?: string;
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  audioDuration?: number;
  timestamp: string;
  isUrgent?: boolean;
}

export interface CitizenStory {
  id: string;
  authorName: string;
  authorRole: UserRole;
  authorAge: number;
  authorEmail: string;
  type: 'text' | 'image' | 'video';
  content?: string; // caption or text body
  mediaUrl?: string;
  bgGradient?: string;
  timestamp: string;
  createdAt: number;
  likes: number;
}

export interface OnlineUser {
  sessionId: string;
  name: string;
  role: UserRole;
  email: string;
  lastSeen: number;
}

export interface AppState {
  scheduleTonight: RondaSchedule;
  scheduleTomorrow: RondaSchedule;
  shiftSwaps: ShiftSwapRequest[];
  panicAlarm: PanicAlarm | null;
  alarmHistory: PanicAlarm[];
  attendances: AttendanceRecord[];
  patrolLogs: PatrolLog[];
  citizenFees: CitizenFee[];
  cashTransactions: CashTransaction[];
  announcements: Announcement[];
  guests: GuestRecord[];
  chatMessages: ChatMessage[];
  stories: CitizenStory[];
  typingUsers: { name: string; timestamp: number }[];
  onlineUsers: OnlineUser[];
}
