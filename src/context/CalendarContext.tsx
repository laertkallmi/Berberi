import React, { createContext, useContext, useEffect, useState } from 'react';
import { Appointment, BlockedSlot, BusinessSettings, Service } from '../types';
import { generateBookingCode, getTodayDateStr, addDays } from '../utils/dateUtils';

const STORAGE_KEYS = {
  APPOINTMENTS: 'takimet_solo_barber_v4_appointments',
  BLOCKED_SLOTS: 'takimet_solo_barber_v4_blocked',
  SERVICES: 'takimet_solo_barber_v4_services',
  SETTINGS: 'takimet_solo_barber_v4_settings',
  ADMIN_AUTH: 'takimet_solo_barber_v4_auth',
};

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

    setAppointments((prev) => [newAppointment, ...prev]);
    return newAppointment;
  };

  const cancelAppointment = (id: string, reason?: string) => {
    setAppointments((prev) =>
      prev.map((apt) =>
        apt.id === id
          ? {
              ...apt,
              status: 'anuluar',
              clientNotes: reason
                ? `${apt.clientNotes ? apt.clientNotes + ' | ' : ''}Anuluar: ${reason}`
                : apt.clientNotes,
            }
          : apt
      )
    );
  };

  const updateAppointmentStatus = (id: string, status: Appointment['status']) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, status } : apt))
    );
  };

  const toggleSlotBlock = (date: string, time: string, reason?: string) => {
    setBlockedSlots((prev) => {
      const exists = prev.some((b) => b.date === date && b.time === time);
      if (exists) {
        // Free the slot
        return prev.filter((b) => !(b.date === date && b.time === time));
      } else {
        // Block the slot
        const newBlock: BlockedSlot = {
          id: `blk-${Date.now()}`,
          date,
          time,
          reason: reason || 'Pushim / Bllokuar nga berberi',
        };
        return [...prev, newBlock];
      }
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
    setSettings((prev) => ({ ...prev, ...newSettings }));
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
    setAppointments(getInitialAppointments());
    setBlockedSlots(getInitialBlockedSlots());
    setServices(DEFAULT_SERVICES);
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.APPOINTMENTS);
    localStorage.removeItem(STORAGE_KEYS.BLOCKED_SLOTS);
    localStorage.removeItem(STORAGE_KEYS.SERVICES);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
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
