import React, { useState, useMemo } from 'react';
import { useCalendar } from '../context/CalendarContext';
import { AdminTab, Appointment, AppointmentStatus, Service } from '../types';
import {
  getTodayDateStr,
  getUpcomingDates,
  generateTimeSlots,
  formatDateByLang,
  formatAlbanianShort,
} from '../utils/dateUtils';
import {
  getLocalizedServiceName,
  getLocalizedStatus,
} from '../utils/translations';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  CheckCircle2,
  XCircle,
  Plus,
  Search,
  Download,
  Settings,
  Lock,
  Unlock,
  MessageSquare,
  CalendarDays,
  FileSpreadsheet,
  Trash2,
  RotateCcw,
  Check,
  Scissors,
  ExternalLink,
  Link2,
  RefreshCw,
} from 'lucide-react';
import { ManualBookingModal } from './ManualBookingModal';

interface AdminDashboardProps {
  onBackToClient: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToClient }) => {
  const {
    appointments,
    blockedSlots,
    services,
    settings,
    updateAppointmentStatus,
    toggleSlotBlock,
    getSlotStatus,
    getAppointmentForSlot,
    updateSettings,
    addService,
    deleteService,
    resetAllData,
    isSyncing,
    syncWithCloud,
    language,
    t,
    formatPrice,
  } = useCalendar();

  const [activeTab, setActiveTab] = useState<AdminTab>('today');
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>(getTodayDateStr());
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualSlot, setManualSlot] = useState<{ date: string; time: string } | undefined>();

  // Filter & Search states for "all" tab
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  // New service form state
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceDuration, setNewServiceDuration] = useState(30);
  const [newServicePrice, setNewServicePrice] = useState(1000);
  const [newServiceDesc, setNewServiceDesc] = useState('');

  // Settings form states
  const [settingsForm, setSettingsForm] = useState(settings);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [copiedBio, setCopiedBio] = useState(false);

  const handleCopyBioLink = () => {
    navigator.clipboard.writeText(window.location.origin).catch(() => {});
    setCopiedBio(true);
    setTimeout(() => setCopiedBio(false), 2500);
  };

  // Today's appointments calculations
  const todayStr = getTodayDateStr();
  const todayAppointments = useMemo(() => {
    return appointments
      .filter((a) => a.date === todayStr && a.status !== 'anuluar')
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [appointments, todayStr]);

  const todayRevenue = useMemo(() => {
    return todayAppointments
      .filter((a) => a.status === 'konfirmuar' || a.status === 'perfunduar')
      .reduce((sum, a) => sum + a.price, 0);
  }, [todayAppointments]);

  // Calendar time slots for selectedCalendarDate
  const calendarSlots = useMemo(() => {
    const rawSlots = generateTimeSlots(
      settings.startHour,
      settings.endHour,
      settings.slotIntervalMinutes,
      settings.breakStart,
      settings.breakEnd
    );

    return rawSlots.map((time) => {
      const status = getSlotStatus(selectedCalendarDate, time);
      const apt = getAppointmentForSlot(selectedCalendarDate, time);
      return {
        time,
        status, // 'lire' | 'bllokuar' | 'zene'
        appointment: apt,
      };
    });
  }, [selectedCalendarDate, settings, getSlotStatus, getAppointmentForSlot]);

  // Upcoming 14 days for date picker
  const upcomingDates = useMemo(() => {
    return getUpcomingDates(todayStr, 14, language);
  }, [todayStr, language]);

  // Filtered appointments for "all" tab
  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const matchesQuery =
        !searchQuery ||
        apt.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.clientPhone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.bookingCode.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;

      let matchesDate = true;
      if (dateFilter === 'today') {
        matchesDate = apt.date === todayStr;
      } else if (dateFilter === 'future') {
        matchesDate = apt.date >= todayStr;
      } else if (dateFilter === 'past') {
        matchesDate = apt.date < todayStr;
      }

      return matchesQuery && matchesStatus && matchesDate;
    });
  }, [appointments, searchQuery, statusFilter, dateFilter, todayStr]);

  const handleExportCSV = () => {
    const isDe = language === 'de';
    const headers = isDe
      ? ['Buchungscode', 'Datum', 'Uhrzeit', 'Kunde', 'Telefon', 'Leistung', 'Preis', 'Status', 'Notizen']
      : ['Kodi', 'Data', 'Ora', 'Klienti', 'Telefoni', 'Shërbimi', 'Çmimi', 'Statusi', 'Shënime'];

    const rows = filteredAppointments.map((a) => [
      a.bookingCode,
      a.date,
      a.time,
      `"${a.clientName.replace(/"/g, '""')}"`,
      `"${a.clientPhone}"`,
      `"${a.serviceName.replace(/"/g, '""')}"`,
      formatPrice(a.price, a.serviceId),
      getLocalizedStatus(a.status, language),
      `"${(a.clientNotes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `termin-buchungen-${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(settingsForm);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
  };

  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName.trim()) return;
    addService({
      name: newServiceName.trim(),
      durationMinutes: Number(newServiceDuration),
      price: Number(newServicePrice),
      description: newServiceDesc.trim() || (language === 'de' ? 'Professioneller Haarschnitt und Styling.' : 'Prerje dhe stilim profesional berberi.'),
      category: language === 'de' ? 'Haare & Bart' : 'Flokët & Mjekra',
    });
    setNewServiceName('');
    setNewServiceDesc('');
  };

  const getStatusBadgeElement = (status: Appointment['status']) => {
    const label = getLocalizedStatus(status, language);
    switch (status) {
      case 'konfirmuar':
        return <span className="text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded text-[10px]">{label}</span>;
      case 'ne_pritje':
        return <span className="text-amber-400 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded text-[10px]">{label}</span>;
      case 'perfunduar':
        return <span className="text-blue-400 bg-blue-950/40 border border-blue-800/40 px-2 py-0.5 rounded text-[10px]">{label}</span>;
      case 'anuluar':
        return <span className="text-rose-400 bg-rose-950/40 border border-rose-800/40 px-2 py-0.5 rounded text-[10px]">{label}</span>;
      case 'nuk_erdhi':
        return <span className="text-slate-400 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-[10px]">{label}</span>;
      default:
        return <span className="text-slate-400 bg-slate-900 border border-slate-700 px-2 py-0.5 rounded text-[10px]">{label}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#090a0d] pb-24 text-slate-100">
      {/* Admin Subheader & KPIs */}
      <section className="bg-[#0f1117] border-b border-[#1c202a] px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-[#1c202a]">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
                <Scissors className="w-4 h-4 -rotate-45" />
                <span>{t('adminBadge')}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-cinzel font-semibold text-white mt-1">
                {t('adminTitle')}
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                {t('todayIs')} {formatDateByLang(todayStr, language)}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => syncWithCloud()}
                disabled={isSyncing}
                className="px-3.5 py-2 rounded-xl bg-[#131b17] hover:bg-[#1a2520] border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                title="Sinkronizuar me Cloud. Klikoni për të marrë rezervimet e reja menjëherë."
              >
                <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? t('syncingStatus') : t('liveSyncBtn')}</span>
              </button>
              <button
                onClick={handleCopyBioLink}
                className="px-3.5 py-2 rounded-xl bg-[#171a23] hover:bg-[#202532] border border-amber-400/30 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                title="Kopjo linkun e faqes"
              >
                {copiedBio ? (
                  <>
                    <Check className="w-4 h-4 text-amber-400" />
                    <span>{t('bioLinkCopied')}</span>
                  </>
                ) : (
                  <>
                    <Link2 className="w-4 h-4 text-amber-400" />
                    <span>{t('copyBioLink')}</span>
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setManualSlot(undefined);
                  setIsManualModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/10 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t('addManualBookingBtn')}</span>
              </button>
              <button
                onClick={onBackToClient}
                className="px-3.5 py-2 rounded-xl bg-[#171a23] hover:bg-[#202532] border border-[#262c3b] text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>{t('navClientView')}</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>

          {/* KPI Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4">
            <div className="p-3.5 rounded-xl bg-[#141720] border border-[#202532]">
              <span className="text-[11px] text-slate-400">{t('kpiAppointmentsToday')}</span>
              <div className="text-xl font-bold font-mono text-white mt-0.5 tabular-nums">
                {todayAppointments.length}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#141720] border border-[#202532]">
              <span className="text-[11px] text-slate-400">{t('kpiPending')}</span>
              <div className="text-xl font-bold font-mono text-amber-400 mt-0.5 tabular-nums">
                {todayAppointments.filter((a) => a.status === 'ne_pritje').length}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#141720] border border-[#202532]">
              <span className="text-[11px] text-slate-400">{t('kpiRevenue')}</span>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5 tabular-nums">
                {formatPrice(todayRevenue)}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#141720] border border-[#202532]">
              <span className="text-[11px] text-slate-400">{t('blockedSlotsLabel')}</span>
              <div className="text-xl font-bold font-mono text-slate-300 mt-0.5 tabular-nums">
                {blockedSlots.length}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-[#1c202a] pb-4 mb-6 overflow-x-auto scrollbar-thin">
          <button
            onClick={() => setActiveTab('today')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'today'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'bg-[#12141a] text-slate-400 hover:text-white hover:bg-[#181b24] border border-[#1f2430]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{t('tabToday')} ({todayAppointments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'calendar'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'bg-[#12141a] text-slate-400 hover:text-white hover:bg-[#181b24] border border-[#1f2430]'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>{t('tabCalendar')}</span>
          </button>

          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'all'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'bg-[#12141a] text-slate-400 hover:text-white hover:bg-[#181b24] border border-[#1f2430]'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>{t('tabAll')} ({appointments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'settings'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'bg-[#12141a] text-slate-400 hover:text-white hover:bg-[#181b24] border border-[#1f2430]'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>{t('tabSettings')}</span>
          </button>
        </div>

        {/* TAB 1: TAKIMET E SOTME */}
        {activeTab === 'today' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-cinzel font-semibold text-white">
                  {t('tabTodayTitle')}
                </h2>
                <p className="text-xs text-slate-400">
                  {t('tabTodaySubtitle')}
                </p>
              </div>
              <button
                onClick={() => {
                  setManualSlot({ date: todayStr, time: '12:00' });
                  setIsManualModalOpen(true);
                }}
                className="text-xs text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{language === 'de' ? 'Termin heute anlegen' : 'Shto prerje sot'}</span>
              </button>
            </div>

            {todayAppointments.length === 0 ? (
              <div className="p-12 rounded-2xl bg-[#11131a] border border-[#1e2330] text-center">
                <Scissors className="w-10 h-10 text-slate-600 mx-auto mb-3 -rotate-45" />
                <h3 className="text-sm font-semibold text-white">{t('noAppointmentsToday')}</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  {language === 'de' ? 'Alle Zeitfenster sind frei für Online-Buchungen.' : 'Të gjitha oraret janë të lira për klientët që vijnë nga linku në bio.'}
                </p>
                <button
                  onClick={() => {
                    setManualSlot({ date: todayStr, time: '11:00' });
                    setIsManualModalOpen(true);
                  }}
                  className="mt-4 px-4 py-2 rounded-xl bg-amber-400 text-slate-950 text-xs font-semibold cursor-pointer"
                >
                  {t('addManualBookingBtn')}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {todayAppointments.map((apt) => {
                  const serviceObj = services.find((s) => s.id === apt.serviceId);
                  const localizedServiceName = serviceObj ? getLocalizedServiceName(serviceObj, language) : apt.serviceName;
                  const priceFormatted = formatPrice(apt.price, apt.serviceId);

                  const whatsappMsg = encodeURIComponent(
                    language === 'de'
                      ? `Hallo ${apt.clientName}! Zur Erinnerung: Ihr Termin für ${localizedServiceName} bei ${settings.name} ist heute um ${apt.time} Uhr. Wir freuen uns auf Sie!`
                      : `Përshëndetje ${apt.clientName}! Ju kujtojmë takimin tuaj të prerjes sot në orën ${apt.time} pranë ${settings.name} për ${apt.serviceName}. Ju mirëpresim!`
                  );

                  return (
                    <div
                      key={apt.id}
                      className="p-4 sm:p-5 rounded-2xl bg-[#11131a] border border-[#1f2430] hover:border-[#2e3444] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      {/* Left: Time & Client */}
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-xl bg-[#171a24] border border-[#242936] flex flex-col items-center justify-center shrink-0">
                          <span className="text-base font-mono font-bold text-amber-400 tabular-nums">
                            {apt.time}
                          </span>
                          <span className="text-[10px] text-slate-500 tabular-nums">
                            {apt.durationMinutes} min
                          </span>
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-semibold text-white">
                              {apt.clientName}
                            </h3>
                            <span className="text-[10px] font-mono text-slate-500">
                              #{apt.bookingCode}
                            </span>
                          </div>

                          <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-y-1 gap-x-3">
                            <span className="text-amber-300 font-medium">
                              {localizedServiceName}
                            </span>
                            <span aria-hidden="true" className="text-slate-600">·</span>
                            <span className="tabular-nums font-mono text-slate-300 font-semibold">
                              {priceFormatted}
                            </span>
                            {apt.clientNotes && (
                              <>
                                <span aria-hidden="true" className="text-slate-600">·</span>
                                <span className="text-slate-400 italic">"{apt.clientNotes}"</span>
                              </>
                            )}
                          </div>

                          <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                            <a
                              href={`tel:${apt.clientPhone}`}
                              className="hover:text-amber-400 flex items-center gap-1 transition-colors"
                            >
                              <Phone className="w-3.5 h-3.5 text-amber-400" />
                              <span>{apt.clientPhone}</span>
                            </a>
                            <a
                              href={`https://wa.me/${apt.clientPhone.replace(/\D/g, '')}?text=${whatsappMsg}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>{language === 'de' ? 'WhatsApp senden' : 'Njofto me WhatsApp'}</span>
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* Right: Status & Actions */}
                      <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-[#1c202a]">
                        <select
                          value={apt.status}
                          onChange={(e) =>
                            updateAppointmentStatus(
                              apt.id,
                              e.target.value as AppointmentStatus
                            )
                          }
                          className="px-3 py-1.5 rounded-lg bg-[#161922] border border-[#242936] text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                        >
                          <option value="konfirmuar">{getLocalizedStatus('konfirmuar', language)}</option>
                          <option value="ne_pritje">{getLocalizedStatus('ne_pritje', language)}</option>
                          <option value="perfunduar">{getLocalizedStatus('perfunduar', language)}</option>
                          <option value="anuluar">{getLocalizedStatus('anuluar', language)}</option>
                          <option value="nuk_erdhi">{getLocalizedStatus('nuk_erdhi', language)}</option>
                        </select>

                        {apt.status !== 'perfunduar' && (
                          <button
                            onClick={() => updateAppointmentStatus(apt.id, 'perfunduar')}
                            className="p-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-700/40 text-emerald-300 text-xs flex items-center gap-1 transition-colors cursor-pointer"
                            title={t('actionComplete')}
                          >
                            <Check className="w-4 h-4 text-emerald-400" />
                          </button>
                        )}

                        <button
                          onClick={() => {
                            if (confirm(`${language === 'de' ? 'Termin stornieren für' : 'A dëshironi ta anuloni takimin e'} ${apt.clientName}?`)) {
                              updateAppointmentStatus(apt.id, 'anuluar');
                            }
                          }}
                          className="p-1.5 rounded-lg bg-rose-950/30 hover:bg-rose-900/50 border border-rose-800/30 text-rose-300 text-xs flex items-center gap-1 transition-colors cursor-pointer"
                          title={t('actionCancel')}
                        >
                          <XCircle className="w-4 h-4 text-rose-400" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: KALENDARI & MENAXHIMI I ORAREVE (LIRO / BLLOKO) */}
        {activeTab === 'calendar' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-cinzel font-semibold text-white">
                  {t('calendarManagementTitle')}
                </h2>
                <p className="text-xs text-slate-400">
                  {t('calendarManagementSubtitle')}
                </p>
              </div>

              {/* Date Input */}
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-400">{t('dateLabel')}</label>
                <input
                  type="date"
                  value={selectedCalendarDate}
                  onChange={(e) => setSelectedCalendarDate(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-[#141720] border border-[#232733] text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Horizontal Day Scroller for Quick Selection */}
            <div>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                {upcomingDates.map((d) => {
                  const isSelected = selectedCalendarDate === d.dateStr;
                  const isTodayDate = d.dateStr === todayStr;
                  return (
                    <button
                      key={d.dateStr}
                      onClick={() => setSelectedCalendarDate(d.dateStr)}
                      className={`min-w-[68px] sm:min-w-[74px] p-2.5 rounded-xl border text-center transition-all cursor-pointer shrink-0 ${
                        isSelected
                          ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-md shadow-amber-400/20'
                          : 'bg-[#11131a] border-[#202530] text-slate-300 hover:border-slate-600 hover:bg-[#151821]'
                      }`}
                    >
                      <div
                        className={`text-[10px] uppercase font-semibold ${
                          isSelected ? 'text-slate-900' : 'text-slate-400'
                        }`}
                      >
                        {d.dayName}
                      </div>
                      <div className="text-base font-bold tabular-nums my-0.5">
                        {d.dayNum}
                      </div>
                      <div
                        className={`text-[10px] ${
                          isSelected ? 'text-slate-800' : 'text-slate-400'
                        }`}
                      >
                        {isTodayDate ? t('today') : d.monthName.slice(0, 3)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Slot Grid for selected day */}
            <div className="bg-[#11131a] border border-[#202532] rounded-2xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#1f2430] gap-3 mb-6">
                <div>
                  <h3 className="text-base font-semibold text-white">
                    {formatDateByLang(selectedCalendarDate, language)}
                  </h3>
                  <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-3">
                    <span>{t('totalSlotsLabel')} {calendarSlots.length}</span>
                    <span>·</span>
                    <span className="text-emerald-400">
                      {t('freeSlotsLabel')} {calendarSlots.filter((s) => s.status === 'lire').length}
                    </span>
                    <span>·</span>
                    <span className="text-rose-400">
                      {t('blockedSlotsLabel')} {calendarSlots.filter((s) => s.status === 'bllokuar').length}
                    </span>
                    <span>·</span>
                    <span className="text-amber-400">
                      {t('bookedSlotsLabel')} {calendarSlots.filter((s) => s.status === 'zene').length}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setManualSlot({ date: selectedCalendarDate, time: '14:00' });
                      setIsManualModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#161a24] hover:bg-[#1e2330] border border-[#272d3d] text-xs text-slate-200 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-400" />
                    <span>{t('addManualBookingBtn')}</span>
                  </button>
                </div>
              </div>

              {/* Grid of Slots */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {calendarSlots.map(({ time, status, appointment }) => {
                  const isBlocked = status === 'bllokuar';
                  const isBooked = status === 'zene';
                  const isFree = status === 'lire';

                  return (
                    <div
                      key={time}
                      className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                        isBooked
                          ? 'bg-[#181318] border-amber-900/40 text-slate-200'
                          : isBlocked
                          ? 'bg-[#181114] border-rose-900/40 text-slate-300'
                          : 'bg-[#141720] border-[#222736] text-white hover:border-[#353c52]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm font-bold tabular-nums">
                          {time}
                        </span>
                        {isBooked && (
                          <span className="text-[9px] uppercase font-bold text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded">
                            {t('booked')}
                          </span>
                        )}
                        {isBlocked && (
                          <span className="text-[9px] uppercase font-bold text-rose-400 bg-rose-950/60 px-1.5 py-0.5 rounded">
                            {t('blocked')}
                          </span>
                        )}
                        {isFree && (
                          <span className="text-[9px] uppercase font-bold text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded">
                            {t('free')}
                          </span>
                        )}
                      </div>

                      <div className="my-2 min-h-[32px]">
                        {isBooked && appointment ? (
                          <div>
                            <div className="text-xs font-semibold text-white truncate">
                              {appointment.clientName}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate">
                              {appointment.serviceName}
                            </div>
                          </div>
                        ) : isBlocked ? (
                          <div className="text-[11px] text-rose-300/80 italic">
                            {language === 'de' ? 'Pause / Gesperrt' : 'Pushim / I Bllokuar'}
                          </div>
                        ) : (
                          <div className="text-[11px] text-slate-400">
                            {language === 'de' ? 'Bereit für Buchungen' : 'I hapur për klientët'}
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-1">
                        {isBooked && appointment ? (
                          <span className="text-[10px] font-mono text-amber-400">
                            #{appointment.bookingCode}
                          </span>
                        ) : isBlocked ? (
                          <button
                            onClick={() => toggleSlotBlock(selectedCalendarDate, time)}
                            className="w-full py-1 text-[11px] rounded bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800/40 text-emerald-300 font-medium flex items-center justify-center gap-1 cursor-pointer transition-colors"
                          >
                            <Unlock className="w-3 h-3" />
                            <span>{language === 'de' ? 'Freigeben' : 'Liro Orarin'}</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => toggleSlotBlock(selectedCalendarDate, time)}
                            className="w-full py-1 text-[11px] rounded bg-rose-950/30 hover:bg-rose-900/50 border border-rose-800/30 text-rose-300 font-medium flex items-center justify-center gap-1 cursor-pointer transition-colors"
                          >
                            <Lock className="w-3 h-3" />
                            <span>{language === 'de' ? 'Blockieren' : 'Blloko Orarin'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: TË GJITHA REZERVIMET */}
        {activeTab === 'all' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-cinzel font-semibold text-white">
                  {t('allBookingsTitle')}
                </h2>
                <p className="text-xs text-slate-400">
                  {t('allBookingsSubtitle')}
                </p>
              </div>

              <button
                onClick={handleExportCSV}
                className="px-3.5 py-2 rounded-xl bg-[#161a24] hover:bg-[#202534] border border-[#2c3344] text-xs font-semibold text-slate-200 flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('exportCsvBtn')}</span>
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="p-4 rounded-2xl bg-[#11131a] border border-[#1f2430] flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#161922] border border-[#242936] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-[#161922] border border-[#242936] text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  <option value="all">{t('allStatusesOption')}</option>
                  <option value="konfirmuar">{getLocalizedStatus('konfirmuar', language)}</option>
                  <option value="ne_pritje">{getLocalizedStatus('ne_pritje', language)}</option>
                  <option value="perfunduar">{getLocalizedStatus('perfunduar', language)}</option>
                  <option value="anuluar">{getLocalizedStatus('anuluar', language)}</option>
                </select>

                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-[#161922] border border-[#242936] text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  <option value="all">{language === 'de' ? 'Alle Tage' : 'Të gjitha ditët'}</option>
                  <option value="today">{language === 'de' ? 'Nur heute' : 'Vetëm sot'}</option>
                  <option value="future">{language === 'de' ? 'Zukünftige' : 'Takimet e ardhshme'}</option>
                  <option value="past">{language === 'de' ? 'Vergangene' : 'Takimet e kaluara'}</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="rounded-2xl bg-[#11131a] border border-[#1f2430] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#141720] border-b border-[#1f2430] text-slate-400">
                    <tr>
                      <th className="py-3 px-4">{t('tableColClient')}</th>
                      <th className="py-3 px-4">{t('tableColService')}</th>
                      <th className="py-3 px-4">{t('tableColDateTime')}</th>
                      <th className="py-3 px-4">{t('tableColPrice')}</th>
                      <th className="py-3 px-4">{t('tableColStatus')}</th>
                      <th className="py-3 px-4 text-right">{t('tableColActions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#181b24]">
                    {filteredAppointments.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-500">
                          {t('noFilteredBookings')}
                        </td>
                      </tr>
                    ) : (
                      filteredAppointments.map((apt) => (
                        <tr key={apt.id} className="hover:bg-[#151822] transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-white">{apt.clientName}</div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                              <span>{apt.clientPhone}</span>
                              <span>·</span>
                              <span className="font-mono text-amber-400/80">#{apt.bookingCode}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-200">
                            <div>{apt.serviceName}</div>
                            <div className="text-[10px] text-slate-500">{apt.durationMinutes} min</div>
                          </td>
                          <td className="py-3 px-4 text-slate-300">
                            <div>{formatDateByLang(apt.date, language)}</div>
                            <div className="font-mono text-amber-400 font-semibold">{apt.time}</div>
                          </td>
                          <td className="py-3 px-4 font-mono font-semibold text-white">
                            {formatPrice(apt.price, apt.serviceId)}
                          </td>
                          <td className="py-3 px-4">
                            {getStatusBadgeElement(apt.status)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <a
                                href={`https://wa.me/${apt.clientPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                                  language === 'de'
                                    ? `Hallo ${apt.clientName}! Ihr Termin bei ${settings.name} ist am ${apt.date} um ${apt.time} Uhr.`
                                    : `Përshëndetje ${apt.clientName}! Takimi juaj pranë ${settings.name} është më datë ${apt.date} në orën ${apt.time}.`
                                )}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-lg bg-[#181c26] hover:bg-emerald-950/50 text-emerald-400 transition-colors"
                                title="WhatsApp"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </a>
                              <button
                                onClick={() => {
                                  if (confirm(`${language === 'de' ? 'Termin stornieren für' : 'A dëshironi ta anuloni takimin e'} ${apt.clientName}?`)) {
                                    updateAppointmentStatus(apt.id, 'anuluar');
                                  }
                                }}
                                className="p-1.5 rounded-lg bg-[#181c26] hover:bg-rose-950/50 text-rose-400 transition-colors cursor-pointer"
                                title={t('actionCancel')}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CILËSIMET */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Business Profile Settings */}
            <div className="lg:col-span-2 p-6 rounded-2xl bg-[#11131a] border border-[#1f2430] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#1c202a]">
                <h3 className="text-base font-cinzel font-semibold text-white">
                  {t('settingsHeading')}
                </h3>
                {settingsSaved && (
                  <span className="text-xs text-emerald-400 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>{language === 'de' ? 'Erfolgreich gespeichert!' : 'U ruajtën me sukses!'}</span>
                  </span>
                )}
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1">{t('salonNameField')}</label>
                    <input
                      type="text"
                      value={settingsForm.name}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, name: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-[#161922] border border-[#242936] text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">{t('cityField')}</label>
                    <input
                      type="text"
                      value={settingsForm.city}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, city: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-[#161922] border border-[#242936] text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">{t('taglineField')}</label>
                  <input
                    type="text"
                    value={settingsForm.tagline}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, tagline: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#161922] border border-[#242936] text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">{t('addressField')}</label>
                  <input
                    type="text"
                    value={settingsForm.address}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, address: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#161922] border border-[#242936] text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1">{t('phoneField')}</label>
                    <input
                      type="text"
                      value={settingsForm.phone}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, phone: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-[#161922] border border-[#242936] text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">{t('whatsappField')}</label>
                    <input
                      type="text"
                      value={settingsForm.whatsappNumber}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-[#161922] border border-[#242936] text-white focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                </div>

                {/* Hours & intervals */}
                <div className="pt-2 border-t border-[#1c202a]">
                  <h4 className="text-xs font-semibold text-white mb-2">
                    {t('workHoursTitle')}
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">{t('startHourField')}</label>
                      <input
                        type="time"
                        value={settingsForm.startHour}
                        onChange={(e) =>
                          setSettingsForm({ ...settingsForm, startHour: e.target.value })
                        }
                        className="w-full px-2 py-1.5 rounded-lg bg-[#161922] border border-[#242936] text-white font-mono focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">{t('endHourField')}</label>
                      <input
                        type="time"
                        value={settingsForm.endHour}
                        onChange={(e) =>
                          setSettingsForm({ ...settingsForm, endHour: e.target.value })
                        }
                        className="w-full px-2 py-1.5 rounded-lg bg-[#161922] border border-[#242936] text-white font-mono focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">{t('intervalField')}</label>
                      <input
                        type="number"
                        step={5}
                        min={15}
                        max={120}
                        value={settingsForm.slotIntervalMinutes}
                        onChange={(e) =>
                          setSettingsForm({
                            ...settingsForm,
                            slotIntervalMinutes: Number(e.target.value),
                          })
                        }
                        className="w-full px-2 py-1.5 rounded-lg bg-[#161922] border border-[#242936] text-white font-mono focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#1c202a]">
                  <label className="block text-slate-400 mb-1">{t('pinSecurityField')}</label>
                  <input
                    type="password"
                    maxLength={6}
                    value={settingsForm.adminPin}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, adminPin: e.target.value })
                    }
                    className="w-32 px-3 py-1.5 rounded-lg bg-[#161922] border border-[#242936] text-white font-mono tracking-widest focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="pt-3 flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold cursor-pointer transition-all shadow-md shadow-amber-500/10"
                  >
                    {t('saveSettingsBtn')}
                  </button>
                </div>
              </form>
            </div>

            {/* Services Management */}
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-[#11131a] border border-[#1f2430] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Scissors className="w-4 h-4 text-amber-400 -rotate-45" />
                    <h3 className="text-base font-cinzel font-semibold text-white">
                      {t('servicesTitle')}
                    </h3>
                  </div>
                  <span className="text-xs text-slate-500">{services.length}</span>
                </div>

                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1 scrollbar-thin">
                  {services.map((srv) => (
                    <div
                      key={srv.id}
                      className="p-3 rounded-xl bg-[#161922] border border-[#242936] flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-white">{getLocalizedServiceName(srv, language)}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span className="tabular-nums">{srv.durationMinutes} min</span>
                          <span>·</span>
                          <span className="text-amber-400 font-mono tabular-nums">
                            {formatPrice(srv.price, srv.id)}
                          </span>
                        </div>
                      </div>

                      {services.length > 1 && (
                        <button
                          onClick={() => {
                            if (confirm(`${language === 'de' ? 'Dienst löschen' : 'A dëshironi ta fshini shërbimin'} "${srv.name}"?`)) {
                              deleteService(srv.id);
                            }
                          }}
                          className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Form to add service */}
                <form
                  onSubmit={handleCreateService}
                  className="pt-4 border-t border-[#1c202a] space-y-3 text-xs"
                >
                  <h4 className="font-semibold text-white">{t('addNewServiceTitle')}</h4>
                  <div>
                    <input
                      type="text"
                      required
                      placeholder={t('serviceNamePlaceholder')}
                      value={newServiceName}
                      onChange={(e) => setNewServiceName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#161922] border border-[#242936] text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-400 mb-1">{t('durationMinutesField')}</label>
                      <input
                        type="number"
                        min={10}
                        step={5}
                        required
                        value={newServiceDuration}
                        onChange={(e) => setNewServiceDuration(Number(e.target.value))}
                        className="w-full px-3 py-1.5 rounded-lg bg-[#161922] border border-[#242936] text-white font-mono focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">{t('priceField')}</label>
                      <input
                        type="number"
                        min={100}
                        step={50}
                        required
                        value={newServicePrice}
                        onChange={(e) => setNewServicePrice(Number(e.target.value))}
                        className="w-full px-3 py-1.5 rounded-lg bg-[#161922] border border-[#242936] text-white font-mono focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                  <div>
                    <textarea
                      rows={2}
                      placeholder={language === 'de' ? 'Kurzbeschreibung der Leistung...' : 'Përshkrim i shkurtër i shërbimit...'}
                      value={newServiceDesc}
                      onChange={(e) => setNewServiceDesc(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#161922] border border-[#242936] text-white focus:outline-none focus:border-amber-400 resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 rounded-xl bg-amber-400/90 hover:bg-amber-400 text-slate-950 font-semibold cursor-pointer transition-colors"
                  >
                    {t('addServiceBtn')}
                  </button>
                </form>
              </div>

              {/* Danger Zone */}
              <div className="p-5 rounded-2xl bg-[#140f12] border border-rose-900/30 text-xs space-y-3">
                <h4 className="font-semibold text-rose-400 flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{t('dangerZoneTitle')}</span>
                </h4>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  {language === 'de' ? 'Setzt alle Termine, Blockierungen und Einstellungen auf die Werkseinstellungen zurück.' : 'Kjo fshin të gjitha takimet, oraret e bllokuara dhe rikthen shërbimet e paracaktuara.'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(language === 'de' ? 'Sind Sie sicher, dass Sie alle Daten zurücksetzen möchten?' : 'A jeni plotësisht të sigurt që dëshironi të fshini të gjitha të dhënat dhe të rivendosni gjendjen fillestare?')) {
                      resetAllData();
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-rose-300 font-medium cursor-pointer transition-colors"
                >
                  {t('resetDataBtn')}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Manual Booking Modal */}
      <ManualBookingModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        initialDate={manualSlot?.date}
        initialTime={manualSlot?.time}
      />
    </div>
  );
};
