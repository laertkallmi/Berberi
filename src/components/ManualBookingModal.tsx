import React, { useState } from 'react';
import { useCalendar } from '../context/CalendarContext';
import { getTodayDateStr } from '../utils/dateUtils';
import { getLocalizedServiceName } from '../utils/translations';
import { X, Calendar, Clock, User, Phone, CheckCircle2 } from 'lucide-react';

interface ManualBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: string;
  initialTime?: string;
}

export const ManualBookingModal: React.FC<ManualBookingModalProps> = ({
  isOpen,
  onClose,
  initialDate,
  initialTime,
}) => {
  const { services, bookAppointment, language, t, formatPrice } = useCalendar();

  const [serviceId, setServiceId] = useState(services[0]?.id || '');
  const [date, setDate] = useState(initialDate || getTodayDateStr());
  const [time, setTime] = useState(initialTime || '10:00');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientNotes, setClientNotes] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientPhone.trim()) {
      setError(language === 'de' ? 'Name und Telefonnummer sind Pflichtfelder' : 'Emri dhe numri i telefonit janë të detyrueshme');
      return;
    }

    const notePrefix = language === 'de' ? '[Manuell eingetragen]' : '[Regjistruar me dorë]';

    bookAppointment({
      serviceId,
      date,
      time,
      clientName,
      clientPhone,
      clientEmail,
      clientNotes: clientNotes ? `${notePrefix}: ${clientNotes}` : notePrefix,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#11131a] border border-[#232733] rounded-2xl p-6 shadow-2xl relative text-slate-100 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <h3 className="text-lg font-cinzel font-semibold text-white">
            {t('manualModalTitle')}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {t('manualModalSubtitle')}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-2.5 rounded-lg bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              {t('manualServiceSelect')}
            </label>
            <select
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#161922] border border-[#262c3a] text-sm text-white focus:outline-none focus:border-amber-400"
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {getLocalizedServiceName(s, language)} ({s.durationMinutes} min - {formatPrice(s.price, s.id)})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('manualDateSelect')}</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#161922] border border-[#262c3a] text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('manualTimeSelect')}</span>
              </label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#161922] border border-[#262c3a] text-sm text-white focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('manualClientName')}</span>
            </label>
            <input
              type="text"
              required
              placeholder={language === 'de' ? 'z.B. Max Mustermann' : 'p.sh. Besnik M.'}
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#161922] border border-[#262c3a] text-sm text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('manualClientPhone')}</span>
            </label>
            <input
              type="tel"
              required
              placeholder={language === 'de' ? 'z.B. +49 178 6922244' : 'p.sh. +49 178 6922244'}
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#161922] border border-[#262c3a] text-sm text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              {t('emailLabel')}
            </label>
            <input
              type="email"
              placeholder={t('emailPlaceholder')}
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#161922] border border-[#262c3a] text-sm text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              {t('manualNotes')}
            </label>
            <textarea
              rows={2}
              placeholder={language === 'de' ? 'Interne Notizen oder Wünsche des Kunden...' : 'Shënim për stilin e prerjes ose preferencë e klientit...'}
              value={clientNotes}
              onChange={(e) => setClientNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#161922] border border-[#262c3a] text-sm text-white focus:outline-none focus:border-amber-400 resize-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-[#161922] hover:bg-[#1f2430] text-slate-300 text-xs font-medium cursor-pointer"
            >
              {language === 'de' ? 'Abbrechen' : 'Anulo'}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/10"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{t('manualSaveBtn')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
