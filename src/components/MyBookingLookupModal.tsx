import React, { useState } from 'react';
import { useCalendar } from '../context/CalendarContext';
import { Appointment } from '../types';
import { formatAlbanianDate } from '../utils/dateUtils';
import { Search, X, Calendar, Clock, User, Phone, CheckCircle2, AlertCircle } from 'lucide-react';

interface MyBookingLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MyBookingLookupModal: React.FC<MyBookingLookupModalProps> = ({ isOpen, onClose }) => {
  const { findAppointmentsByQuery, cancelAppointment, settings } = useCalendar();
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState<Appointment[]>([]);

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const found = findAppointmentsByQuery(query);
    setResults(found);
    setSearched(true);
  };

  const getStatusBadge = (status: Appointment['status']) => {
    switch (status) {
      case 'konfirmuar':
        return <span className="text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded text-[10px]">I Konfirmuar</span>;
      case 'ne_pritje':
        return <span className="text-amber-400 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded text-[10px]">Në Pritje</span>;
      case 'perfunduar':
        return <span className="text-blue-400 bg-blue-950/40 border border-blue-800/40 px-2 py-0.5 rounded text-[10px]">Përfunduar</span>;
      case 'anuluar':
        return <span className="text-rose-400 bg-rose-950/40 border border-rose-800/40 px-2 py-0.5 rounded text-[10px]">Anuluar</span>;
      default:
        return <span className="text-slate-400 bg-slate-900 border border-slate-700 px-2 py-0.5 rounded text-[10px]">{status}</span>;
    }
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
            Verifiko Rezervimin Tuaj
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Vendosni numrin e telefonit ose kodin e rezervimit (p.sh. REZ-4819).
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Numri i telefonit ose Kodi REZ-..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#161922] border border-[#262c3a] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-xs transition-colors cursor-pointer"
          >
            Kërko
          </button>
        </form>

        {searched && (
          <div className="space-y-3">
            {results.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <AlertCircle className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <p className="text-sm">Nuk u gjet asnjë rezervim me këtë të dhënë.</p>
                <p className="text-xs text-slate-500 mt-1">
                  Kontrolloni numrin e telefonit ose kontaktoni direkt në WhatsApp.
                </p>
              </div>
            ) : (
              results.map((apt) => (
                <div
                  key={apt.id}
                  className="p-4 rounded-xl bg-[#161922] border border-[#242936] space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-amber-400">
                      {apt.bookingCode}
                    </span>
                    {getStatusBadge(apt.status)}
                  </div>

                  <div className="text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-white font-medium">
                      <span>{apt.serviceName}</span>
                      <span className="text-amber-400 tabular-nums">
                        {apt.price.toLocaleString()} {settings.currency}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>{formatAlbanianDate(apt.date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>Ora {apt.time} ({apt.durationMinutes} minuta)</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      <span>{apt.clientName} ({apt.clientPhone})</span>
                    </div>
                  </div>

                  {apt.status !== 'anuluar' && (
                    <div className="pt-2 border-t border-[#1e2330] flex justify-end">
                      <button
                        onClick={() => {
                          if (confirm('A jeni të sigurt që dëshironi të anuloni këtë takim?')) {
                            cancelAppointment(apt.id, 'Anuluar nga klienti në faqe');
                            setResults((prev) =>
                              prev.map((a) =>
                                a.id === apt.id ? { ...a, status: 'anuluar' } : a
                              )
                            );
                          }
                        }}
                        className="text-xs text-rose-400 hover:text-rose-300 underline cursor-pointer"
                      >
                        Anulo këtë takim
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
