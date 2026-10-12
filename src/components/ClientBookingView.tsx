import React, { useState, useMemo } from 'react';
import { useCalendar } from '../context/CalendarContext';
import { Service, Appointment } from '../types';
import {
  getTodayDateStr,
  getUpcomingDates,
  generateTimeSlots,
  formatDateByLang,
  formatAlbanianShort,
} from '../utils/dateUtils';
import {
  getLocalizedServiceName,
  getLocalizedServiceDesc,
} from '../utils/translations';
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  Phone,
  User,
  Mail,
  FileText,
  MapPin,
  CalendarPlus,
  MessageSquare,
  ArrowRight,
  ArrowLeft,
  Check,
  Scissors,
} from 'lucide-react';

interface ClientBookingViewProps {
  onGoToAdmin: () => void;
  bookingRef: React.RefObject<HTMLDivElement | null>;
  servicesRef: React.RefObject<HTMLDivElement | null>;
}

export const ClientBookingView: React.FC<ClientBookingViewProps> = ({
  onGoToAdmin,
  bookingRef,
  servicesRef,
}) => {
  const {
    settings,
    services,
    bookAppointment,
    getSlotStatus,
    language,
    t,
    formatPrice,
  } = useCalendar();

  // Booking Flow Steps: 1: Service, 2: Date & Time, 3: Personal Info, 4: Confirmed
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State
  const [selectedService, setSelectedService] = useState<Service | null>(services[0] || null);
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateStr());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const [clientName, setClientName] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [clientEmail, setClientEmail] = useState<string>('');
  const [clientNotes, setClientNotes] = useState<string>('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Result of successful booking
  const [confirmedBooking, setConfirmedBooking] = useState<Appointment | null>(null);

  // Dates for horizontal picker (next 14 days)
  const availableDates = useMemo(() => {
    return getUpcomingDates(getTodayDateStr(), 14, language);
  }, [language]);

  // Time slots for the selected date
  const timeSlots = useMemo(() => {
    const rawSlots = generateTimeSlots(
      settings.startHour,
      settings.endHour,
      selectedService ? selectedService.durationMinutes : settings.slotIntervalMinutes,
      settings.breakStart,
      settings.breakEnd
    );

    return rawSlots.map((time) => {
      const status = getSlotStatus(selectedDate, time);
      return {
        time,
        status, // 'lire' | 'bllokuar' | 'zene'
      };
    });
  }, [selectedDate, selectedService, settings, getSlotStatus]);

  const validateStep3 = () => {
    const errors: Record<string, string> = {};
    if (!clientName.trim()) {
      errors.name = t('nameRequiredError');
    }
    if (!clientPhone.trim()) {
      errors.phone = t('phoneRequiredError');
    } else if (clientPhone.trim().length < 7) {
      errors.phone = t('phoneInvalidError');
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep3()) return;
    if (!selectedService || !selectedDate || !selectedTime) return;

    const apt = bookAppointment({
      serviceId: selectedService.id,
      date: selectedDate,
      time: selectedTime,
      clientName,
      clientPhone,
      clientEmail,
      clientNotes,
    });

    setConfirmedBooking(apt);
    setCurrentStep(4);
  };

  const handleDownloadICS = (apt: Appointment) => {
    const title = `${getLocalizedServiceName(selectedService || services[0], language)} - ${displayName}`;
    const desc = `${language === 'de' ? 'Terminbuchung' : 'Rezervim takimi'} (${apt.bookingCode})`;
    const [startH, startM] = apt.time.split(':').map(Number);
    const startDate = new Date(`${apt.date}T00:00:00`);
    startDate.setHours(startH, startM, 0, 0);

    const endDate = new Date(startDate.getTime() + (apt.durationMinutes || 30) * 60000);

    const formatICSDate = (d: Date) =>
      d.toISOString().replace(/-|:|\.\d+/g, '');

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Takimet Barber//SQ',
      'BEGIN:VEVENT',
      `UID:${apt.id}@barbershop`,
      `DTSTAMP:${formatICSDate(new Date())}`,
      `DTSTART:${formatICSDate(startDate)}`,
      `DTEND:${formatICSDate(endDate)}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${desc}`,
      `LOCATION:${settings.address}, ${settings.city}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `takim-${apt.bookingCode}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetFlow = () => {
    setSelectedTime(null);
    setClientName('');
    setClientPhone('');
    setClientEmail('');
    setClientNotes('');
    setConfirmedBooking(null);
    setCurrentStep(1);
  };

  const displayName = language === 'de' && settings.name === 'Sallon Berberi'
    ? 'Barbershop'
    : (settings.name || (language === 'de' ? 'Barbershop' : 'Sallon Berberi'));

  const displayTagline = language === 'de' && settings.tagline.includes('prerjes online')
    ? t('heroTagline')
    : (settings.tagline || t('heroTagline'));

  return (
    <div className="min-h-screen bg-[#090a0d] pb-24 text-slate-200">
      {/* Cinematic Barber Bio Header */}
      <section className="relative border-b border-[#1b1f27] bg-gradient-to-b from-[#11131a] via-[#0d0f14] to-[#090a0d] pt-8 pb-10 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          {/* Barber Insignia Emblem */}
          <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#232733] to-[#12141a] border border-[#2e3442] shadow-2xl shadow-black/80 mb-4 ring-1 ring-amber-500/20">
            <Scissors className="w-9 h-9 text-amber-400 -rotate-45" />
            <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-[#181b22] border border-[#2e3442] flex items-center justify-center text-amber-400">
              <span className="text-[10px] font-bold">1</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-cinzel font-semibold tracking-wide text-white">
            {displayName}
          </h1>
          <p className="mt-2 text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
            {displayTagline}
          </p>

          {/* Quick Bio Info Tags */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-y-2 gap-x-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{settings.address}, {settings.city}</span>
            </span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{settings.startHour} - {settings.endHour}</span>
            </span>
            {settings.phone && (
              <>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <a
                  href={`tel:${settings.phone}`}
                  className="flex items-center gap-1 text-slate-300 hover:text-amber-400 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{settings.phone}</span>
                </a>
              </>
            )}
          </div>

          {/* Action Row for Clients */}
          <div className="mt-6 flex items-center justify-center">
            <a
              href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(
                language === 'de'
                  ? `Hallo! Ich möchte nach einem Termin bei ${displayName} fragen.`
                  : `Përshëndetje! Dëshiroj të pyes për rezervim prerjeje flokësh pranë ${settings.name}.`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 text-xs text-emerald-300 bg-emerald-950/30 hover:bg-emerald-950/50 border border-emerald-800/40 rounded-xl transition-colors flex items-center gap-2 shadow-sm"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t('contactWhatsApp')}</span>
            </a>
          </div>
        </div>
      </section>

      {/* Main Reservation Section */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-8">
        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-md mx-auto">
            {[
              { num: 1, title: t('step1Tab') },
              { num: 2, title: t('step2Tab') },
              { num: 3, title: t('step3Tab') },
              { num: 4, title: t('step4Tab') },
            ].map((step) => {
              const isActive = currentStep === step.num;
              const isPast = currentStep > step.num;
              return (
                <div key={step.num} className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-amber-400 text-slate-950 ring-4 ring-amber-400/20'
                        : isPast
                        ? 'bg-slate-800 text-amber-400 border border-amber-400/30'
                        : 'bg-[#141720] text-slate-500 border border-[#232733]'
                    }`}
                  >
                    {isPast ? <Check className="w-4 h-4" /> : step.num}
                  </div>
                  <span
                    className={`mt-1.5 text-[11px] font-medium tracking-tight ${
                      isActive ? 'text-amber-400' : isPast ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* STEP 1: SERVICE SELECTION */}
        {currentStep === 1 && (
          <div ref={servicesRef} className="space-y-6">
            <div className="text-center sm:text-left">
              <h2 className="text-xl font-cinzel font-semibold text-white">
                {t('step1Title')}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {t('step1Subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {services.map((service) => {
                const isSelected = selectedService?.id === service.id;
                const localizedName = getLocalizedServiceName(service, language);
                const localizedDesc = getLocalizedServiceDesc(service, language);
                const priceFormatted = formatPrice(service.price, service.id);

                return (
                  <button
                    key={service.id}
                    onClick={() => setSelectedService(service)}
                    className={`text-left p-4 rounded-xl border transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-[#181b24] border-amber-400/80 ring-1 ring-amber-400/40 shadow-lg shadow-black/40'
                        : 'bg-[#11131a] border-[#202530] hover:border-slate-600 hover:bg-[#141720]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold text-white tracking-wide">
                          {localizedName}
                        </h3>
                        <p className="mt-1 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {localizedDesc}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-sm font-bold text-amber-400 tabular-nums">
                          {priceFormatted}
                        </span>
                        <div className="text-[11px] text-slate-400 flex items-center justify-end gap-1 mt-0.5 tabular-nums">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{service.durationMinutes} min</span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-4 flex justify-end">
              <button
                disabled={!selectedService}
                onClick={() => {
                  setCurrentStep(2);
                  if (bookingRef.current) {
                    bookingRef.current.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <span>{language === 'de' ? 'Weiter zur Terminauswahl' : 'Vazhdo te Zgjedhja e Orarit'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: DATE & TIME SELECTION */}
        {currentStep === 2 && (
          <div ref={bookingRef} className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-cinzel font-semibold text-white">
                  {t('step2Title')}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  {t('serviceSummaryLabel')}{' '}
                  <span className="text-slate-200 font-medium">
                    {selectedService ? getLocalizedServiceName(selectedService, language) : ''}
                  </span>{' '}
                  ({selectedService?.durationMinutes} min)
                </p>
              </div>
              <button
                onClick={() => setCurrentStep(1)}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{language === 'de' ? 'Leistung ändern' : 'Ndrysho Shërbimin'}</span>
              </button>
            </div>

            {/* Horizontal Day Scroller */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">
                {t('dateLabel')}
              </label>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                {availableDates.map((d) => {
                  const isSelected = selectedDate === d.dateStr;
                  const isTodayDate = d.dateStr === getTodayDateStr();
                  return (
                    <button
                      key={d.dateStr}
                      onClick={() => {
                        setSelectedDate(d.dateStr);
                        setSelectedTime(null);
                      }}
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

            {/* Selected Date Summary & Time Grid */}
            <div className="bg-[#11131a] border border-[#202530] rounded-2xl p-5">
              <div className="flex items-center justify-between border-b border-[#1d212b] pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-medium text-white">
                    {formatDateByLang(selectedDate, language)}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#161a23] border border-[#2f3544] inline-block" />
                    <span>{t('free')}</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#221c1f] border border-[#3e272a] inline-block" />
                    <span>{t('booked')}</span>
                  </span>
                </div>
              </div>

              {/* Slots Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                {timeSlots.map(({ time, status }) => {
                  const isSelected = selectedTime === time;
                  const isAvailable = status === 'lire';

                  if (!isAvailable) {
                    return (
                      <div
                        key={time}
                        className="py-2.5 px-2 rounded-lg bg-[#141215] border border-[#271d22] text-center text-slate-600 cursor-not-allowed select-none"
                        title={status === 'bllokuar' ? t('blocked') : t('booked')}
                      >
                        <span className="text-xs font-mono tabular-nums line-through opacity-70">
                          {time}
                        </span>
                        <div className="text-[9px] uppercase tracking-wider text-rose-500/60 mt-0.5">
                          {status === 'bllokuar' ? t('blocked') : t('booked')}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`py-2.5 px-2 rounded-lg border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-400 border-amber-400 text-slate-950 font-bold shadow-md shadow-amber-500/20 ring-2 ring-amber-400/40'
                          : 'bg-[#151822] border-[#242936] text-slate-200 hover:border-amber-400/50 hover:bg-[#1a1e2b]'
                      }`}
                    >
                      <span className="text-xs font-mono font-medium tabular-nums">
                        {time}
                      </span>
                      <div
                        className={`text-[9px] uppercase tracking-wider mt-0.5 ${
                          isSelected ? 'text-slate-900 font-semibold' : 'text-emerald-400'
                        }`}
                      >
                        {t('free')}
                      </div>
                    </button>
                  );
                })}
              </div>

              {timeSlots.filter((t) => t.status === 'lire').length === 0 && (
                <div className="py-8 text-center text-slate-400">
                  <p className="text-sm">{t('noSlotsAvailable')}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {t('chooseOtherDate')}
                  </p>
                </div>
              )}
            </div>

            {/* Navigation buttons */}
            <div className="pt-2 flex items-center justify-between">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{language === 'de' ? 'Zurück' : 'Kthehu mbrapa'}</span>
              </button>
              <button
                disabled={!selectedTime}
                onClick={() => setCurrentStep(3)}
                className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <span>{language === 'de' ? 'Weiter zu den Angaben' : 'Vazhdo te Të Dhënat'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: PERSONAL INFORMATION FORM */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-cinzel font-semibold text-white">
                  {t('step3Title')}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  {t('step3Subtitle')}
                </p>
              </div>
              <button
                onClick={() => setCurrentStep(2)}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{language === 'de' ? 'Zeit ändern' : 'Ndrysho Orën'}</span>
              </button>
            </div>

            {/* Booking Summary Pill */}
            <div className="p-4 rounded-xl bg-[#13161f] border border-[#222733] flex flex-wrap items-center justify-between gap-4 text-xs">
              <div>
                <span className="text-slate-400">{t('serviceSummaryLabel')} </span>
                <strong className="text-white ml-1">
                  {selectedService ? getLocalizedServiceName(selectedService, language) : ''}
                </strong>
              </div>
              <div>
                <span className="text-slate-400">{t('dateTimeSummaryLabel')} </span>
                <strong className="text-amber-400 ml-1">
                  {formatAlbanianShort(selectedDate, language)}, {language === 'de' ? `${selectedTime} Uhr` : `ora ${selectedTime}`}
                </strong>
              </div>
              <div>
                <span className="text-slate-400">{language === 'de' ? 'Preis:' : 'Çmimi:'} </span>
                <strong className="text-white ml-1 tabular-nums">
                  {selectedService ? formatPrice(selectedService.price, selectedService.id) : ''}
                </strong>
              </div>
            </div>

            {/* The Form */}
            <form onSubmit={handleConfirmBooking} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t('fullNameLabel')}</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={t('fullNamePlaceholder')}
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl bg-[#11131a] border text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/40 ${
                    formErrors.name ? 'border-rose-500' : 'border-[#242936] focus:border-amber-400'
                  }`}
                />
                {formErrors.name && (
                  <p className="text-[11px] text-rose-400 mt-1">{formErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t('phoneLabel')}</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder={t('phonePlaceholder')}
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl bg-[#11131a] border text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/40 ${
                    formErrors.phone ? 'border-rose-500' : 'border-[#242936] focus:border-amber-400'
                  }`}
                />
                {formErrors.phone && (
                  <p className="text-[11px] text-rose-400 mt-1">{formErrors.phone}</p>
                )}
                <p className="text-[10px] text-slate-500 mt-1">
                  {t('phoneNote')}
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t('emailLabel')}</span>
                </label>
                <input
                  type="email"
                  placeholder={t('emailPlaceholder')}
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#11131a] border border-[#242936] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/40"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t('notesLabel')}</span>
                </label>
                <textarea
                  rows={2}
                  placeholder={t('notesPlaceholder')}
                  value={clientNotes}
                  onChange={(e) => setClientNotes(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-[#11131a] border border-[#242936] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/40 resize-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{t('backToStep2')}</span>
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer transition-all active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4 text-slate-950" />
                  <span>{t('confirmBookingBtn')}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 4: CONFIRMATION RECEIPT */}
        {currentStep === 4 && confirmedBooking && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-950/50 border border-emerald-600/40 text-emerald-400 mb-3 shadow-lg shadow-emerald-950/40">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-cinzel font-bold text-white">
                {t('step4SuccessTitle')}
              </h2>
              <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-700/50 text-emerald-300 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{t('step4CloudBadge')}</span>
              </div>
              <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto">
                {t('step4Note')}
              </p>
            </div>

            {/* Cinematic Booking Card / Ticket */}
            <div className="bg-[#11131a] border border-[#262c3a] rounded-2xl p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/5 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between border-b border-[#1f2430] pb-4 mb-4">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                    {t('bookingCodeLabel')}
                  </span>
                  <div className="text-xl font-mono font-bold text-amber-400 tracking-wider">
                    {confirmedBooking.bookingCode}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-medium text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-800/40">
                    {t('statusConfirmedBadge')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400">{t('serviceSummaryLabel')}</span>
                  <p className="text-sm font-semibold text-white mt-0.5">
                    {selectedService ? getLocalizedServiceName(selectedService, language) : confirmedBooking.serviceName}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">{t('dateTimeSummaryLabel')}</span>
                  <p className="text-sm font-semibold text-amber-400 mt-0.5">
                    {formatDateByLang(confirmedBooking.date, language)}, {language === 'de' ? `${confirmedBooking.time} Uhr` : `ora ${confirmedBooking.time}`}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">{t('clientSummaryLabel')}</span>
                  <p className="text-sm font-semibold text-white mt-0.5">
                    {confirmedBooking.clientName}
                  </p>
                  <p className="text-xs text-slate-400">{confirmedBooking.clientPhone}</p>
                </div>
                <div>
                  <span className="text-slate-400">{language === 'de' ? 'Preis:' : 'Çmimi:'}</span>
                  <p className="text-sm font-semibold text-emerald-400 mt-0.5 tabular-nums">
                    {formatPrice(confirmedBooking.price, confirmedBooking.serviceId)}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">{t('locationSummaryLabel')}</span>
                  <p className="text-sm font-semibold text-white mt-0.5">
                    {displayName}
                  </p>
                  <p className="text-xs text-slate-400">{settings.address}, {settings.city}</p>
                </div>
              </div>

              {confirmedBooking.clientNotes && (
                <div className="mt-4 pt-4 border-t border-[#1f2430] text-xs">
                  <span className="text-slate-400">{t('notesSummaryLabel')}</span>
                  <p className="text-slate-300 mt-0.5">{confirmedBooking.clientNotes}</p>
                </div>
              )}
            </div>

            {/* Next Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <a
                href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(
                  language === 'de'
                    ? `Hallo! Ich habe einen Termin um ${confirmedBooking.time} Uhr am ${formatDateByLang(confirmedBooking.date, language)} bei ${displayName} gebucht.\nCode: ${confirmedBooking.bookingCode}\nLeistung: ${selectedService ? getLocalizedServiceName(selectedService, language) : confirmedBooking.serviceName}\nPreis: ${formatPrice(confirmedBooking.price, confirmedBooking.serviceId)}\nKunde: ${confirmedBooking.clientName}\nTelefon: ${confirmedBooking.clientPhone}`
                    : `Përshëndetje! Rezervova orarin e prerjes në orën ${confirmedBooking.time} më datë ${confirmedBooking.date} pranë ${settings.name}.\nKodi: ${confirmedBooking.bookingCode}\nShërbimi: ${confirmedBooking.serviceName}\nEmri: ${confirmedBooking.clientName}\nTelefoni: ${confirmedBooking.clientPhone}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="p-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all active:scale-95"
              >
                <MessageSquare className="w-4 h-4 text-white" />
                <span>{t('sendWhatsAppBtn')}</span>
              </a>

              <button
                onClick={() => handleDownloadICS(confirmedBooking)}
                className="p-3 rounded-xl bg-[#141720] hover:bg-[#1a1e2b] border border-[#242936] text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <CalendarPlus className="w-4 h-4 text-amber-400" />
                <span>{t('addToCalendarBtn')}</span>
              </button>
            </div>

            <div className="text-center pt-4">
              <button
                onClick={resetFlow}
                className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
              >
                {t('bookAnotherBtn')}
              </button>
            </div>
          </div>
        )}

        {/* Footer for Client view */}
        <div className="mt-16 pt-8 border-t border-[#161922] text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {displayName}. {t('allRightsReserved')}</p>
          <div className="mt-2 flex items-center justify-center gap-4">
            <button
              onClick={onGoToAdmin}
              className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              {t('navAdmin')}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
