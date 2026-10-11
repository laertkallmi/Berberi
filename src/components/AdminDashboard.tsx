import React, { useState, useMemo } from 'react';
import { useCalendar } from '../context/CalendarContext';
import { AdminTab, Appointment, AppointmentStatus, Service } from '../types';
import {
  getTodayDateStr,
  getUpcomingDates,
  generateTimeSlots,
  formatAlbanianDate,
  formatAlbanianShort,
} from '../utils/dateUtils';
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
    const raw = generateTimeSlots(
      settings.startHour,
      settings.endHour,
      settings.slotIntervalMinutes,
      settings.breakStart,
      settings.breakEnd
    );

    return raw.map((time) => {
      const status = getSlotStatus(selectedCalendarDate, time);
      const appointment = getAppointmentForSlot(selectedCalendarDate, time);
      const blockedItem = blockedSlots.find(
        (b) => b.date === selectedCalendarDate && b.time === time
      );
      return {
        time,
        status, // 'lire' | 'bllokuar' | 'zene'
        appointment,
        blockedItem,
      };
    });
  }, [selectedCalendarDate, settings, blockedSlots, getSlotStatus, getAppointmentForSlot]);

  // Upcoming 21 days for the calendar date picker
  const upcomingDates = useMemo(() => {
    return getUpcomingDates(todayStr, 21);
  }, [todayStr]);

  // Filtered appointments for "All" tab
  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      // Query check
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        apt.clientName.toLowerCase().includes(q) ||
        apt.clientPhone.toLowerCase().includes(q) ||
        apt.bookingCode.toLowerCase().includes(q) ||
        apt.serviceName.toLowerCase().includes(q);

      // Status check
      const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;

      // Date check
      let matchesDate = true;
      if (dateFilter === 'today') {
        matchesDate = apt.date === todayStr;
      } else if (dateFilter === 'upcoming') {
        matchesDate = apt.date >= todayStr;
      } else if (dateFilter === 'past') {
        matchesDate = apt.date < todayStr;
      }

      return matchesQuery && matchesStatus && matchesDate;
    });
  }, [appointments, searchQuery, statusFilter, dateFilter, todayStr]);

  const handleExportCSV = () => {
    const headers = [
      'Kodi',
      'Data',
      'Ora',
      'Klienti',
      'Telefoni',
      'Shërbimi',
      'Çmimi',
      'Statusi',
      'Shënime',
    ];
    const rows = filteredAppointments.map((a) => [
      a.bookingCode,
      a.date,
      a.time,
      `"${a.clientName.replace(/"/g, '""')}"`,
      `"${a.clientPhone}"`,
      `"${a.serviceName.replace(/"/g, '""')}"`,
      a.price,
      a.status,
      `"${(a.clientNotes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `takimet-sallon-berberi-${todayStr}.csv`);
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
      description: newServiceDesc.trim() || 'Prerje dhe stilim profesional berberi.',
      category: 'Flokët & Mjekra',
    });
    setNewServiceName('');
    setNewServiceDesc('');
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
                <span>Paneli i Menaxhimit të Sallonit të Berberit</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-cinzel font-semibold text-white mt-1">
                Kalendari & Agjenda e Berberit
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Sot është {formatAlbanianDate(todayStr)}
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={handleCopyBioLink}
                className="px-3.5 py-2 rounded-xl bg-[#171a23] hover:bg-[#202532] border border-amber-400/30 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                title="Kopjo linkun e faqes për ta vendosur në bio të Instagramit ose TikTok-ut"
              >
                {copiedBio ? (
                  <>
                    <Check className="w-4 h-4 text-amber-400" />
                    <span>U Kopjua Linku!</span>
                  </>
                ) : (
                  <>
                    <Link2 className="w-4 h-4 text-amber-400" />
                    <span>Kopjo Linkun e Bio</span>
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
                <span>Shto Takim me Dorë</span>
              </button>
              <button
                onClick={onBackToClient}
                className="px-3.5 py-2 rounded-xl bg-[#171a23] hover:bg-[#202532] border border-[#262c3b] text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Pamja e Klientit</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>

          {/* KPI Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4">
            <div className="p-3.5 rounded-xl bg-[#141720] border border-[#202532]">
              <span className="text-[11px] text-slate-400">Prerje & Takime Sot</span>
              <div className="text-xl font-bold font-mono text-white mt-0.5 tabular-nums">
                {todayAppointments.length}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#141720] border border-[#202532]">
              <span className="text-[11px] text-slate-400">Në Pritje Sot</span>
              <div className="text-xl font-bold font-mono text-amber-400 mt-0.5 tabular-nums">
                {todayAppointments.filter((a) => a.status === 'ne_pritje').length}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#141720] border border-[#202532]">
              <span className="text-[11px] text-slate-400">Xhiro e Parashikuar Sot</span>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5 tabular-nums">
                {todayRevenue.toLocaleString()} {settings.currency}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#141720] border border-[#202532]">
              <span className="text-[11px] text-slate-400">Orare të Bllokuara</span>
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
            <span>Takimet e Sotme ({todayAppointments.length})</span>
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
            <span>Kalendari & Liro/Blloko Orare</span>
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
            <span>Të Gjitha Rezervimet ({appointments.length})</span>
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
            <span>Cilësimet & Shërbimet</span>
          </button>
        </div>

        {/* TAB 1: TAKIMET E SOTME */}
        {activeTab === 'today' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-cinzel font-semibold text-white">
                  Klientët e Ditës së Sotme
                </h2>
                <p className="text-xs text-slate-400">
                  Lista kronologjike e klientëve që vijnë për prerje sot.
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
                <span>Shto prerje sot</span>
              </button>
            </div>

            {todayAppointments.length === 0 ? (
              <div className="p-12 rounded-2xl bg-[#11131a] border border-[#1e2330] text-center">
                <Scissors className="w-10 h-10 text-slate-600 mx-auto mb-3 -rotate-45" />
                <h3 className="text-sm font-semibold text-white">Nuk ka takime të rezervuara për sot</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Të gjitha oraret janë të lira për klientët që vijnë nga linku në bio.
                </p>
                <button
                  onClick={() => {
                    setManualSlot({ date: todayStr, time: '11:00' });
                    setIsManualModalOpen(true);
                  }}
                  className="mt-4 px-4 py-2 rounded-xl bg-amber-400 text-slate-950 text-xs font-semibold cursor-pointer"
                >
                  Shto një prerje manualisht
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {todayAppointments.map((apt) => {
                  const whatsappMsg = encodeURIComponent(
                    `Përshëndetje ${apt.clientName}! Ju kujtojmë takimin tuaj të prerjes sot në orën ${apt.time} pranë ${settings.name} për ${apt.serviceName}. Ju mirëpresim!`
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
                              {apt.serviceName}
                            </span>
                            <span aria-hidden="true" className="text-slate-600">·</span>
                            <span className="tabular-nums font-mono text-slate-300 font-semibold">
                              {apt.price.toLocaleString()} {settings.currency}
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
                              <span>Njofto me WhatsApp</span>
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
                          <option value="konfirmuar">I Konfirmuar</option>
                          <option value="ne_pritje">Në Pritje</option>
                          <option value="perfunduar">Përfunduar</option>
                          <option value="anuluar">Anuluar</option>
                          <option value="nuk_erdhi">Nuk u Paraqit</option>
                        </select>

                        {apt.status !== 'perfunduar' && (
                          <button
                            onClick={() => updateAppointmentStatus(apt.id, 'perfunduar')}
                            className="p-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-700/40 text-emerald-300 text-xs flex items-center gap-1 transition-colors cursor-pointer"
                            title="Shëno si të përfunduar"
                          >
                            <Check className="w-4 h-4 text-emerald-400" />
                          </button>
                        )}

                        <button
                          onClick={() => {
                            if (confirm(`A dëshironi ta anuloni takimin e ${apt.clientName}?`)) {
                              updateAppointmentStatus(apt.id, 'anuluar');
                            }
                          }}
                          className="p-1.5 rounded-lg bg-rose-950/30 hover:bg-rose-900/50 border border-rose-800/30 text-rose-300 text-xs flex items-center gap-1 transition-colors cursor-pointer"
                          title="Anulo takimin"
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
                  Menaxhimi i Orareve të Berberit (Liro ose Blloko)
                </h2>
                <p className="text-xs text-slate-400">
                  Klikoni mbi çdo orar për ta bllokuar (pushim, orar dreke) ose për ta liruar për klientët.
                </p>
              </div>

              {/* Date Input */}
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-400">Data:</label>
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
                        {isTodayDate ? 'Sot' : d.monthName.slice(0, 3)}
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
                    {formatAlbanianDate(selectedCalendarDate)}
                  </h3>
                  <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-3">
                    <span>Orare gjithsej: {calendarSlots.length}</span>
                    <span>·</span>
                    <span className="text-emerald-400">
                      Të lira: {calendarSlots.filter((s) => s.status === 'lire').length}
                    </span>
                    <span>·</span>
                    <span className="text-rose-400">
                      Të bllokuara: {calendarSlots.filter((s) => s.status === 'bllokuar').length}
                    </span>
                    <span>·</span>
                    <span className="text-amber-400">
                      Të rezervuara: {calendarSlots.filter((s) => s.status === 'zene').length}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setManualSlot({ date: selectedCalendarDate, time: '10:00' });
                      setIsManualModalOpen(true);
                    }}
                    className="px-3 py-1.5 text-xs bg-[#161922] hover:bg-[#1e2330] border border-[#262c3b] rounded-lg text-slate-200 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-400" />
                    <span>Shto takim manual</span>
                  </button>
                </div>
              </div>

              {/* Slot Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {calendarSlots.map(({ time, status, appointment, blockedItem }) => {
                  if (status === 'zene' && appointment) {
                    return (
                      <div
                        key={time}
                        className="p-3.5 rounded-xl bg-[#161822] border border-amber-500/30 flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-amber-400 tabular-nums">
                            {time} ({appointment.durationMinutes}m)
                          </span>
                          <span className="text-[10px] bg-amber-400/10 text-amber-400 border border-amber-400/30 px-2 py-0.5 rounded">
                            I Rezervuar
                          </span>
                        </div>

                        <div className="my-2 text-xs">
                          <div className="font-semibold text-white">
                            {appointment.clientName}
                          </div>
                          <div className="text-slate-400 text-[11px]">
                            {appointment.serviceName}
                          </div>
                          <div className="text-slate-400 text-[11px] font-mono mt-0.5">
                            {appointment.clientPhone}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-[#232838] flex items-center justify-between text-xs">
                          <a
                            href={`tel:${appointment.clientPhone}`}
                            className="text-amber-400 hover:underline text-[11px]"
                          >
                            Telefono
                          </a>
                          <button
                            onClick={() => {
                              if (confirm(`Anulo takimin e ${appointment.clientName}?`)) {
                                updateAppointmentStatus(appointment.id, 'anuluar');
                              }
                            }}
                            className="text-rose-400 hover:underline text-[11px] cursor-pointer"
                          >
                            Anulo & Liro Orarin
                          </button>
                        </div>
                      </div>
                    );
                  }

                  if (status === 'bllokuar') {
                    return (
                      <div
                        key={time}
                        className="p-3.5 rounded-xl bg-[#151214] border border-[#301c22] flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-medium text-slate-400 line-through tabular-nums">
                            {time}
                          </span>
                          <span className="text-[10px] bg-rose-950/40 text-rose-400 border border-rose-800/40 px-2 py-0.5 rounded">
                            I Bllokuar
                          </span>
                        </div>

                        <div className="my-2 text-xs text-slate-400">
                          <p className="text-[11px]">
                            {blockedItem?.reason || 'Pushim nga berberi'}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-[#261b20] flex items-center justify-end">
                          <button
                            onClick={() => toggleSlotBlock(selectedCalendarDate, time)}
                            className="px-2.5 py-1 text-xs rounded bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800/40 text-emerald-300 font-medium flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Unlock className="w-3 h-3 text-emerald-400" />
                            <span>Liro Orarin</span>
                          </button>
                        </div>
                      </div>
                    );
                  }

                  // Free Slot
                  return (
                    <div
                      key={time}
                      className="p-3.5 rounded-xl bg-[#13151d] border border-[#202532] hover:border-slate-600 flex flex-col justify-between transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-semibold text-white tabular-nums">
                          {time}
                        </span>
                        <span className="text-[10px] text-emerald-400 bg-emerald-950/30 border border-emerald-800/30 px-2 py-0.5 rounded">
                          I Lirë
                        </span>
                      </div>

                      <div className="my-2 text-[11px] text-slate-500">
                        Disponueshëm për rezervim në bio
                      </div>

                      <div className="pt-2 border-t border-[#1c202a] flex items-center justify-between text-xs">
                        <button
                          onClick={() => {
                            setManualSlot({ date: selectedCalendarDate, time });
                            setIsManualModalOpen(true);
                          }}
                          className="text-amber-400 hover:underline text-[11px] cursor-pointer"
                        >
                          + Shto Takim
                        </button>
                        <button
                          onClick={() => toggleSlotBlock(selectedCalendarDate, time, 'Pushim')}
                          className="px-2 py-1 rounded bg-[#1a1d27] hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-[#262c3b] text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Lock className="w-3 h-3 text-slate-400" />
                          <span>Blloko Orarin</span>
                        </button>
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
                  Të Gjitha Rezervimet e Sallonit
                </h2>
                <p className="text-xs text-slate-400">
                  Kërkoni, filtroni dhe eksportoni historikun e plotë të prerjeve.
                </p>
              </div>

              <button
                onClick={handleExportCSV}
                className="px-3.5 py-2 rounded-xl bg-[#141720] hover:bg-[#1a1e2b] border border-[#242936] text-slate-200 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>Eksporto në CSV</span>
              </button>
            </div>

            {/* Filter Bar */}
            <div className="p-3.5 rounded-xl bg-[#11131a] border border-[#1f2430] flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Kërko me emër, telefon, kod REZ-..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#161922] border border-[#242936] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-[#161922] border border-[#242936] text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="all">Të gjitha statuset</option>
                <option value="konfirmuar">I Konfirmuar</option>
                <option value="ne_pritje">Në Pritje</option>
                <option value="perfunduar">Përfunduar</option>
                <option value="anuluar">Anuluar</option>
                <option value="nuk_erdhi">Nuk u Paraqit</option>
              </select>

              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-[#161922] border border-[#242936] text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="all">Të gjitha datat</option>
                <option value="today">Vetëm sot</option>
                <option value="upcoming">Takimet në vijim</option>
                <option value="past">Takimet e kaluara</option>
              </select>
            </div>

            {/* Appointments Table */}
            <div className="bg-[#11131a] border border-[#1f2430] rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#1c202a] bg-[#141720] text-slate-400 font-medium">
                      <th className="py-3 px-4">Kodi</th>
                      <th className="py-3 px-4">Data & Ora</th>
                      <th className="py-3 px-4">Klienti</th>
                      <th className="py-3 px-4">Shërbimi</th>
                      <th className="py-3 px-4 text-right">Çmimi</th>
                      <th className="py-3 px-4">Statusi</th>
                      <th className="py-3 px-4 text-right">Veprime</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#181c25]">
                    {filteredAppointments.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-500">
                          Nuk u gjet asnjë rezervim me këto filtra.
                        </td>
                      </tr>
                    ) : (
                      filteredAppointments.map((apt) => (
                        <tr key={apt.id} className="hover:bg-[#151822] transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-amber-400">
                            {apt.bookingCode}
                          </td>
                          <td className="py-3 px-4 text-slate-300">
                            <div className="font-medium">{formatAlbanianShort(apt.date)}</div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              {apt.time} ({apt.durationMinutes}m)
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-white">{apt.clientName}</div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              {apt.clientPhone}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-300">
                            {apt.serviceName}
                          </td>
                          <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-200">
                            {apt.price.toLocaleString()} {settings.currency}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                                apt.status === 'konfirmuar'
                                  ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40'
                                  : apt.status === 'ne_pritje'
                                  ? 'bg-amber-950/40 text-amber-400 border border-amber-800/40'
                                  : apt.status === 'perfunduar'
                                  ? 'bg-blue-950/40 text-blue-400 border border-blue-800/40'
                                  : 'bg-rose-950/40 text-rose-400 border border-rose-800/40'
                              }`}
                            >
                              {apt.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {apt.status !== 'perfunduar' && (
                                <button
                                  onClick={() => updateAppointmentStatus(apt.id, 'perfunduar')}
                                  className="p-1 hover:text-emerald-400 text-slate-400 cursor-pointer"
                                  title="Shëno si të kryer"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {apt.status !== 'anuluar' && (
                                <button
                                  onClick={() => {
                                    if (confirm('A jeni të sigurt që doni ta anuloni këtë takim?')) {
                                      updateAppointmentStatus(apt.id, 'anuluar');
                                    }
                                  }}
                                  className="p-1 hover:text-rose-400 text-slate-400 cursor-pointer"
                                  title="Anulo"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                </button>
                              )}
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

        {/* TAB 4: CILËSIMET & SHËRBIMET */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Business Settings Form */}
            <div className="p-6 rounded-2xl bg-[#11131a] border border-[#1f2430] space-y-4">
              <div>
                <h3 className="text-base font-cinzel font-semibold text-white">
                  Profili i Sallonit & Orari i Punës
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Të dhënat e biznesit tuaj që shfaqen në linkun e bio-s për klientët.
                </p>
              </div>

              {settingsSaved && (
                <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Cilësimet u ruajtën me sukses!</span>
                </div>
              )}

              <form onSubmit={handleSaveSettings} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-300 mb-1">
                    Emri i Sallonit
                  </label>
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
                  <label className="block text-slate-300 mb-1">Përshkrimi / Bio Tagline</label>
                  <textarea
                    rows={2}
                    value={settingsForm.tagline}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, tagline: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#161922] border border-[#242936] text-white focus:outline-none focus:border-amber-400 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1">Qyteti</label>
                    <input
                      type="text"
                      value={settingsForm.city}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, city: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-[#161922] border border-[#242936] text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">Monedha</label>
                    <input
                      type="text"
                      value={settingsForm.currency}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, currency: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-[#161922] border border-[#242936] text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Adresa e Sallonit</label>
                  <input
                    type="text"
                    value={settingsForm.address}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, address: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#161922] border border-[#242936] text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1">Telefoni</label>
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
                    <label className="block text-slate-300 mb-1">WhatsApp Numri (pa +)</label>
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
                    Orari i Punës & Kohëzgjatja e Takimit
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">Ora e Fillimit</label>
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
                      <label className="block text-slate-400 mb-1">Ora e Mbarimit</label>
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
                      <label className="block text-slate-400 mb-1">Intervali (min)</label>
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
                  <label className="block text-slate-400 mb-1">PIN Kodi i Sigurisë së Panelit</label>
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
                    Ruaj Cilësimet
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
                      Shërbimet & Çmimet e Prerjes
                    </h3>
                  </div>
                  <span className="text-xs text-slate-500">{services.length} shërbime</span>
                </div>

                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1 scrollbar-thin">
                  {services.map((srv) => (
                    <div
                      key={srv.id}
                      className="p-3 rounded-xl bg-[#161922] border border-[#242936] flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-white">{srv.name}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span className="tabular-nums">{srv.durationMinutes} minuta</span>
                          <span>·</span>
                          <span className="text-amber-400 font-mono tabular-nums">
                            {srv.price.toLocaleString()} {settings.currency}
                          </span>
                        </div>
                      </div>

                      {services.length > 1 && (
                        <button
                          onClick={() => {
                            if (confirm(`A dëshironi ta fshini shërbimin "${srv.name}"?`)) {
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
                  <h4 className="font-semibold text-white">Shto Shërbim të Ri</h4>
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Emri i shërbimit (p.sh. Prerje Klasike)"
                      value={newServiceName}
                      onChange={(e) => setNewServiceName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#161922] border border-[#242936] text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">Kohëzgjatja (min)</label>
                      <input
                        type="number"
                        step={5}
                        min={10}
                        value={newServiceDuration}
                        onChange={(e) => setNewServiceDuration(Number(e.target.value))}
                        className="w-full px-3 py-1.5 rounded-lg bg-[#161922] border border-[#242936] text-white font-mono focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Çmimi ({settings.currency})</label>
                      <input
                        type="number"
                        step={50}
                        min={0}
                        value={newServicePrice}
                        onChange={(e) => setNewServicePrice(Number(e.target.value))}
                        className="w-full px-3 py-1.5 rounded-lg bg-[#161922] border border-[#242936] text-white font-mono focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Përshkrim i shkurtër..."
                      value={newServiceDesc}
                      onChange={(e) => setNewServiceDesc(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#161922] border border-[#242936] text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 rounded-lg bg-[#1a1e2b] hover:bg-[#23283a] border border-[#2d3446] text-slate-200 font-semibold cursor-pointer transition-colors"
                  >
                    + Shto këtë shërbim
                  </button>
                </form>
              </div>

              {/* Reset Data Warning Box */}
              <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-900/30 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-rose-300">
                    Rivendos të Dhënat Fillestare
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Kthen shërbimet dhe konfigurimin fillestar të sallonit.
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (confirm('A jeni të sigurt që dëshironi të ktheni të dhënat fillestare?')) {
                      resetAllData();
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-rose-900/40 hover:bg-rose-900/70 text-rose-200 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Rivendos</span>
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
        initialDate={manualSlot?.date || selectedCalendarDate}
        initialTime={manualSlot?.time || '10:00'}
      />
    </div>
  );
};
