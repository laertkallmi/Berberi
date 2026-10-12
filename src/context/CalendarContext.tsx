import React, { createContext, useContext, useEffect, useState } from 'react';
import { Appointment, BlockedSlot, BusinessSettings, Service, Language } from '../types';
import { generateBookingCode, getTodayDateStr, addDays } from '../utils/dateUtils';
import { TRANSLATIONS, formatPriceByLang } from '../utils/translations';

const STORAGE_KEYS = {
  APPOINTMENTS: 'takimet_solo_barber_v5_appointments',
  BLOCKED_SLOTS: 'takimet_solo_barber_v5_blocked',
  SERVICES: 'takimet_solo_barber_v5_services',
  SETTINGS: 'takimet_solo_barber_v5_settings',
  ADMIN_AUTH: 'takimet_solo_barber_v5_auth',
};

// Cloud Database Bucket for Realtime Multi-Device Sync (works on Vercel & Mobile)
const CLOUD_API_BASE = 'https://kvdb.io/SHpeRU9bJhXYwBfsqsiujJ';

async function fetchCloudData<T>(endpoint: string): Promise<T | null> {
  try {
    const res = await fetch(`${CLOUD_API_BASE}/${endpoint}?_t=${Date.now()}`);
    if (!res.ok) return null;
    const text = await res.text();
    if (!text || text.trim() === '' || text.trim() === 'null') return null;
    return JSON.parse(text) as T;
  } catch (err) {
    console.warn(`[CloudDB] Error reading ${endpoint}:`, err);
    return null;
  }
}

async function saveCloudData<T>(endpoint: string, data: T): Promise<boolean> {
  try {
    const res = await fetch(`${CLOUD_API_BASE}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch (err) {
    console.warn(`[CloudDB] Error saving ${endpoint}:`, err);
    return false;
  }
}

const DEFAULT_SERVICES: Service[] = [
  {
    id: 'srv-1',
    name: 'Prerje Flokësh Klasike / Fade',
    durationMinutes: 30,
    price: 1000,
    description: 'Prerje e saktë me gërshërë ose makinë, skin fade, larje relaksuese dhe stilim me pomadë profesionale.',
    category: 'Flokët',
  },
  {
    id: 'srv-2',
    name: 'Rregullim & Rruajtje Mjekre me Peshqir të Nxehtë',
    durationMinutes: 20,
    price: 600,
    description: 'Konturim i mprehtë me brisk klasik, trajtim me peshqir të nxehtë dhe vajra ushqyes për lëkurën.',
    category: 'Mjekra',
  },
  {
    id: 'srv-3',
    name: 'Kombo: Prerje + Mjekër VIP',
    durationMinutes: 45,
    price: 1500,
    description: 'Paketa më e zgjedhur: prerje e plotë fade, rregullim i detajuar mjekre, trajtim me avull dhe stilim.',
    category: 'Paketa Kombo',
  },
  {
    id: 'srv-4',
    name: 'Pastrim Fytyre & Black Mask',
    durationMinutes: 30,
    price: 1200,
    description: 'Avull ozonik relaksues, maskë e zezë pastruese për pikat e zeza dhe krem hidratues rigjenerues.',
    category: 'Kujdes Fytyre',
  },
  {
    id: 'srv-5',
    name: 'Prerje Flokësh për Fëmijë',
    durationMinutes: 25,
    price: 800,
    description: 'Kujdes dhe durim i veçantë për djem të vegjël me stil modern.',
    category: 'Fëmijë',
  },
  {
    id: 'srv-6',
    name: 'Ngjyrosje & Kamuflim Mjekre',
    durationMinutes: 25,
    price: 1000,
    description: 'Mbulim natyral i fijeve të bardha dhe theksim i linjave për mjekër uniforme dhe të dendur.',
    category: 'Mjekra',
  },
];

const DEFAULT_SETTINGS: BusinessSettings = {
  name: 'Sallon Berberi',
  tagline: 'Rezervoni orarin tuaj të prerjes online në pak sekonda. Pa pritje në radhë.',
  category: 'Sallon & Berberhane Profesionale',
  city: 'Tiranë',
  address: 'Rruga e Sallonit',
  phone: '+491786922244',
  whatsappNumber: '491786922244',
  instagram: '@sallon.berberi',
  currency: 'LEK',
  workDays: [1, 2, 3, 4, 5, 6], // E Hënë - E Shtunë
  startHour: '09:00',
  endHour: '20:00',
  slotIntervalMinutes: 30,
  breakStart: '13:30',
  breakEnd: '14:30',
  adminPin: '2303',
  blockedDates: [],
};

function getInitialAppointments(): Appointment[] {
  const today = getTodayDateStr();
  const tomorrow = addDays(today, 1);

  return [
    {
      id: 'apt-barber-1',
      bookingCode: 'REZ-1042',
      serviceId: 'srv-1',
      serviceName: 'Prerje Flokësh Klasike / Fade',
      date: today,
      time: '09:30',
      durationMinutes: 30,
      price: 1000,
      clientName: 'Alban D.',
      clientPhone: '+355 68 200 1122',
      clientNotes: 'Skin fade anash, pak më e gjatë lart.',
      status: 'konfirmuar',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'apt-barber-2',
      bookingCode: 'REZ-3891',
      serviceId: 'srv-3',
      serviceName: 'Kombo: Prerje + Mjekër VIP',
      date: today,
      time: '11:00',
      durationMinutes: 45,
      price: 1500,
      clientName: 'Erion K.',
      clientPhone: '+355 69 411 9900',
      clientNotes: 'Klient i rregullt i fundjavës.',
      status: 'konfirmuar',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'apt-barber-3',
      bookingCode: 'REZ-5520',
      serviceId: 'srv-2',
      serviceName: 'Rregullim & Rruajtje Mjekre me Peshqir të Nxehtë',
      date: today,
      time: '14:30',
      durationMinutes: 20,
      price: 600,
      clientName: 'Besnik M.',
      clientPhone: '+355 67 330 4455',
      clientNotes: '',
      status: 'ne_pritje',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'apt-barber-4',
      bookingCode: 'REZ-7801',
      serviceId: 'srv-4',
      serviceName: 'Pastrim Fytyre & Black Mask',
      date: today,
      time: '16:00',
      durationMinutes: 30,
      price: 1200,
      clientName: 'Ardit L.',
      clientPhone: '+355 69 500 7788',
      clientNotes: 'Rezervuar nga linku në bio.',
      status: 'konfirmuar',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'apt-barber-5',
      bookingCode: 'REZ-9014',
      serviceId: 'srv-1',
      serviceName: 'Prerje Flokësh Klasike / Fade',
      date: tomorrow,
      time: '10:00',
      durationMinutes: 30,
      price: 1000,
      clientName: 'Klevis S.',
      clientPhone: '+355 68 812 3344',
      clientNotes: '',
      status: 'konfirmuar',
      createdAt: new Date().toISOString(),
    },
  ];
}

function getInitialBlockedSlots(): BlockedSlot[] {
  const today = getTodayDateStr();
  return [
    {
      id: 'blk-barber-1',
      date: today,
      time: '15:30',
      reason: 'Pushim / Pastrim mjetesh',
    },
  ];
}

interface CalendarContextType {
  appointments: Appointment[];
  blockedSlots: BlockedSlot[];
  services: Service[];
  settings: BusinessSettings;
  isAdminAuthenticated: boolean;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  formatPrice: (amount: number, serviceId?: string) => string;
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  syncWithCloud: () => Promise<void>;
  loginAdmin: (pin: string) => boolean;
  logoutAdmin: () => void;
  bookAppointment: (data: {
    serviceId: string;
    date: string;
    time: string;
    clientName: string;
    clientPhone: string;
    clientEmail?: string;
    clientNotes?: string;
  }) => Appointment;
  cancelAppointment: (id: string, reason?: string) => void;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => void;
  toggleSlotBlock: (date: string, time: string, reason?: string) => void;
  isSlotBlocked: (date: string, time: string) => boolean;
  getSlotStatus: (date: string, time: string) => 'lire' | 'bllokuar' | 'zene';
  getAppointmentForSlot: (date: string, time: string) => Appointment | undefined;
  getAppointmentsForDate: (date: string) => Appointment[];
  getTodayAppointments: () => Appointment[];
  updateSettings: (newSettings: Partial<BusinessSettings>) => void;
  updateServices: (services: Service[]) => void;
  addService: (service: Omit<Service, 'id'>) => void;
  deleteService: (id: string) => void;
  resetAllData: () => void;
  findAppointmentsByQuery: (query: string) => Appointment[];
}

const CalendarContext = createContext<CalendarContextType | null>(null);

export const CalendarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
      return saved ? JSON.parse(saved) : getInitialAppointments();
    } catch {
      return getInitialAppointments();
    }
  });

  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BLOCKED_SLOTS);
      return saved ? JSON.parse(saved) : getInitialBlockedSlots();
    } catch {
      return getInitialBlockedSlots();
    }
  });

  const [services, setServices] = useState<Service[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SERVICES);
      return saved ? JSON.parse(saved) : DEFAULT_SERVICES;
    } catch {
      return DEFAULT_SERVICES;
    }
  });

  const [settings, setSettings] = useState<BusinessSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === 'true';
    } catch {
      return false;
    }
  });

  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('takimet_language_v1');
      if (saved === 'de' || saved === 'sq') return saved;
      return 'sq';
    } catch {
      return 'sq';
    }
  });

  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem('takimet_language_v1', newLang);
    } catch {
      // ignore
    }
  };

  const t = (key: string): string => {
    return TRANSLATIONS[language]?.[key] ?? TRANSLATIONS['sq']?.[key] ?? key;
  };

  const formatPrice = (amount: number, serviceId?: string): string => {
    return formatPriceByLang(amount, language, serviceId, settings.currency);
  };

  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BLOCKED_SLOTS, JSON.stringify(blockedSlots));
  }, [blockedSlots]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  // Cloud Synchronization function (Bidirectional)
  const syncWithCloud = async () => {
    setIsSyncing(true);
    try {
      const [cloudApts, cloudBlocked, cloudSettings] = await Promise.all([
        fetchCloudData<Appointment[]>('appointments'),
        fetchCloudData<BlockedSlot[]>('blocked_slots'),
        fetchCloudData<BusinessSettings>('settings'),
      ]);

      if (cloudApts && Array.isArray(cloudApts) && cloudApts.length > 0) {
        setAppointments((localPrev) => {
          const map = new Map<string, Appointment>();
          localPrev.forEach((a) => map.set(a.id, a));
          cloudApts.forEach((a) => map.set(a.id, a));
          const merged = Array.from(map.values()).sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          if (merged.length > cloudApts.length) {
            saveCloudData('appointments', merged);
          }
          return merged;
        });
      } else {
        // If cloud was empty, upload local appointments to seed it
        setAppointments((current) => {
          if (current.length > 0) {
            saveCloudData('appointments', current);
          }
          return current;
        });
      }

      if (cloudBlocked && Array.isArray(cloudBlocked)) {
        setBlockedSlots(cloudBlocked);
      }

      if (cloudSettings && typeof cloudSettings === 'object' && cloudSettings.adminPin) {
        setSettings((prev) => ({ ...prev, ...cloudSettings }));
      }

      setLastSyncedAt(new Date());
    } catch (e) {
      console.warn('[CloudDB] Sync notice:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  // Background Cloud Poller (every 4 seconds) & on window focus
  useEffect(() => {
    syncWithCloud();

    const interval = setInterval(() => {
      syncWithCloud();
    }, 4000);

    const handleFocus = () => {
      syncWithCloud();
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('visibilitychange', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('visibilitychange', handleFocus);
    };
  }, []);

  const loginAdmin = (pin: string): boolean => {
    if (pin === settings.adminPin) {
      setIsAdminAuthenticated(true);
      try {
        sessionStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
      } catch {
        // ignore
      }
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    try {
      sessionStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
    } catch {
      // ignore
    }
  };

  const isSlotBlocked = (date: string, time: string): boolean => {
    return blockedSlots.some((b) => b.date === date && b.time === time);
  };

  const getAppointmentForSlot = (date: string, time: string): Appointment | undefined => {
    return appointments.find(
      (a) => a.date === date && a.time === time && a.status !== 'anuluar'
    );
  };

  const getSlotStatus = (date: string, time: string): 'lire' | 'bllokuar' | 'zene' => {
    if (isSlotBlocked(date, time)) return 'bllokuar';
    if (getAppointmentForSlot(date, time)) return 'zene';
    return 'lire';
  };

  const bookAppointment = (data: {
    serviceId: string;
    date: string;
    time: string;
    clientName: string;
    clientPhone: string;
    clientEmail?: string;
    clientNotes?: string;
  }): Appointment => {
    const selectedService = services.find((s) => s.id === data.serviceId) || services[0];

    const newAppointment: Appointment = {
      id: `apt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      bookingCode: generateBookingCode(),
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      date: data.date,
      time: data.time,
      durationMinutes: selectedService.durationMinutes,
      price: selectedService.price,
      clientName: data.clientName.trim(),
      clientPhone: data.clientPhone.trim(),
      clientEmail: data.clientEmail?.trim() || '',
      clientNotes: data.clientNotes?.trim() || '',
      status: 'konfirmuar',
      createdAt: new Date().toISOString(),
    };

    setAppointments((prev) => {
      const updated = [newAppointment, ...prev.filter((a) => a.id !== newAppointment.id)];
      // Push immediately to cloud so Admin sees it in seconds
      fetchCloudData<Appointment[]>('appointments')
        .then((cloudApts) => {
          const list = Array.isArray(cloudApts) ? cloudApts : [];
          const merged = [newAppointment, ...list.filter((a) => a.id !== newAppointment.id)];
          saveCloudData('appointments', merged);
        })
        .catch(() => {
          saveCloudData('appointments', updated);
        });
      return updated;
    });

    return newAppointment;
  };

  const cancelAppointment = (id: string, reason?: string) => {
    setAppointments((prev) => {
      const updated = prev.map((apt) =>
        apt.id === id
          ? {
              ...apt,
              status: 'anuluar' as const,
              clientNotes: reason
                ? `${apt.clientNotes ? apt.clientNotes + ' | ' : ''}Anuluar: ${reason}`
                : apt.clientNotes,
            }
          : apt
      );
      saveCloudData('appointments', updated);
      return updated;
    });
  };

  const updateAppointmentStatus = (id: string, status: Appointment['status']) => {
    setAppointments((prev) => {
      const updated = prev.map((apt) => (apt.id === id ? { ...apt, status } : apt));
      saveCloudData('appointments', updated);
      return updated;
    });
  };

  const toggleSlotBlock = (date: string, time: string, reason?: string) => {
    setBlockedSlots((prev) => {
      const exists = prev.some((b) => b.date === date && b.time === time);
      let updated: BlockedSlot[];
      if (exists) {
        // Free the slot
        updated = prev.filter((b) => !(b.date === date && b.time === time));
      } else {
        // Block the slot
        const newBlock: BlockedSlot = {
          id: `blk-${Date.now()}`,
          date,
          time,
          reason: reason || 'Pushim / Bllokuar nga berberi',
        };
        updated = [...prev, newBlock];
      }
      saveCloudData('blocked_slots', updated);
      return updated;
    });
  };

  const getAppointmentsForDate = (date: string): Appointment[] => {
    return appointments
      .filter((a) => a.date === date)
      .sort((a, b) => a.time.localeCompare(b.time));
  };

  const getTodayAppointments = (): Appointment[] => {
    const today = getTodayDateStr();
    return getAppointmentsForDate(today);
  };

  const updateSettings = (newSettings: Partial<BusinessSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      saveCloudData('settings', updated);
      return updated;
    });
  };

  const updateServices = (newServices: Service[]) => {
    setServices(newServices);
  };

  const addService = (serviceData: Omit<Service, 'id'>) => {
    const newService: Service = {
      ...serviceData,
      id: `srv-${Date.now()}`,
    };
    setServices((prev) => [...prev, newService]);
  };

  const deleteService = (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
  };

  const resetAllData = () => {
    const defaultApts = getInitialAppointments();
    const defaultBlocked = getInitialBlockedSlots();
    setAppointments(defaultApts);
    setBlockedSlots(defaultBlocked);
    setServices(DEFAULT_SERVICES);
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.APPOINTMENTS);
    localStorage.removeItem(STORAGE_KEYS.BLOCKED_SLOTS);
    localStorage.removeItem(STORAGE_KEYS.SERVICES);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    saveCloudData('appointments', defaultApts);
    saveCloudData('blocked_slots', defaultBlocked);
    saveCloudData('settings', DEFAULT_SETTINGS);
  };

  const findAppointmentsByQuery = (query: string): Appointment[] => {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    return appointments.filter(
      (a) =>
        a.bookingCode.toLowerCase().includes(q) ||
        a.clientPhone.toLowerCase().includes(q) ||
        a.clientName.toLowerCase().includes(q) ||
        (a.clientEmail && a.clientEmail.toLowerCase().includes(q))
    );
  };

  return (
    <CalendarContext.Provider
      value={{
        appointments,
        blockedSlots,
        services,
        settings,
        isAdminAuthenticated,
        language,
        setLanguage,
        t,
        formatPrice,
        isSyncing,
        lastSyncedAt,
        syncWithCloud,
        loginAdmin,
        logoutAdmin,
        bookAppointment,
        cancelAppointment,
        updateAppointmentStatus,
        toggleSlotBlock,
        isSlotBlocked,
        getSlotStatus,
        getAppointmentForSlot,
        getAppointmentsForDate,
        getTodayAppointments,
        updateSettings,
        updateServices,
        addService,
        deleteService,
        resetAllData,
        findAppointmentsByQuery,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
};

export const useCalendar = () => {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
};
