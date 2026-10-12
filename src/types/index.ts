export interface Service {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
  description: string;
  category: string;
}

export type AppointmentStatus = 'konfirmuar' | 'ne_pritje' | 'perfunduar' | 'anuluar' | 'nuk_erdhi';

export interface Appointment {
  id: string;
  bookingCode: string;
  serviceId: string;
  serviceName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  durationMinutes: number;
  price: number;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  clientNotes?: string;
  status: AppointmentStatus;
  createdAt: string;
}

export interface BlockedSlot {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  reason?: string;
}

export interface BusinessSettings {
  name: string;
  tagline: string;
  category: string;
  city: string;
  address: string;
  phone: string;
  whatsappNumber: string;
  instagram: string;
  currency: string;
  workDays: number[]; // 0 = E Diel, 1 = E Hënë, ..., 6 = E Shtunë
  startHour: string; // "09:00"
  endHour: string; // "20:00"
  slotIntervalMinutes: number; // 30, 45, 60
  breakStart?: string; // "13:30"
  breakEnd?: string; // "14:30"
  adminPin: string;
  blockedDates: string[]; // YYYY-MM-DD for holidays
}

export type ActiveView = 'client' | 'admin';
export type AdminTab = 'today' | 'calendar' | 'all' | 'settings';
export type Language = 'sq' | 'de';


