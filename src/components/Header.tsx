import React, { useState } from 'react';
import { useCalendar } from '../context/CalendarContext';
import { ActiveView } from '../types';
import { Link2, Check, Lock, Calendar, Scissors, Globe } from 'lucide-react';

interface HeaderProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  onOpenPinModal: () => void;
  onOpenMyBookingModal: () => void;
  onScrollToServices: () => void;
  onScrollToBooking: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  setActiveView,
  onOpenPinModal,
  onOpenMyBookingModal,
  onScrollToServices,
  onScrollToBooking,
}) => {
  const { settings, isAdminAuthenticated, logoutAdmin, language, setLanguage, t } = useCalendar();
  const [copied, setCopied] = useState(false);

  const handleCopyBioLink = () => {
    const url = window.location.origin;
    navigator.clipboard.writeText(url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleAdminToggle = () => {
    if (activeView === 'admin') {
      setActiveView('client');
    } else {
      if (isAdminAuthenticated) {
        setActiveView('admin');
      } else {
        onOpenPinModal();
      }
    }
  };

  const displayName = language === 'de' && settings.name === 'Sallon Berberi'
    ? 'Barbershop'
    : (settings.name || (language === 'de' ? 'Barbershop' : 'Sallon Berberi'));

  return (
    <header className="sticky top-0 z-40 bg-[#090a0d]/90 backdrop-blur-md border-b border-[#1e222b]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 sm:gap-8">
        {/* Zone 1: Brand title, single line */}
        <button
          onClick={() => setActiveView('client')}
          className="text-left group cursor-pointer focus:outline-none shrink-0"
        >
          <span className="text-base sm:text-lg font-cinzel font-semibold tracking-wider text-slate-100 group-hover:text-amber-400 transition-colors whitespace-nowrap flex items-center gap-2">
            <Scissors className="w-4 h-4 text-amber-400 -rotate-45" />
            <span>{displayName}</span>
          </span>
        </button>

        {/* Zone 2: Clean single-line text nav links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          <button
            onClick={() => {
              setActiveView('client');
              onScrollToBooking();
            }}
            className="hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {t('navBook')}
          </button>
          <button
            onClick={() => {
              setActiveView('client');
              onScrollToServices();
            }}
            className="hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {t('navServices')}
          </button>
          <button
            onClick={onOpenMyBookingModal}
            className="hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {t('navVerify')}
          </button>
          <button
            onClick={handleAdminToggle}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeView === 'admin'
                ? 'text-amber-400 font-semibold'
                : 'hover:text-slate-100'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{t('navAdmin')}</span>
          </button>
        </nav>

        {/* Zone 3: Actions + Top Right Language Switcher */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Lart Djathtas Language Selector (SQ / DE) */}
          <div className="flex items-center p-0.5 rounded-xl bg-[#141720] border border-[#232733] text-xs shadow-inner">
            <button
              onClick={() => setLanguage('sq')}
              className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                language === 'sq'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Shqip (LEK)"
            >
              <span>🇦🇱</span>
              <span className="font-mono text-[11px]">SQ</span>
            </button>
            <button
              onClick={() => setLanguage('de')}
              className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                language === 'de'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Deutsch (€)"
            >
              <span>🇩🇪</span>
              <span className="font-mono text-[11px]">DE</span>
            </button>
          </div>

          {activeView === 'admin' ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyBioLink}
                className="hidden sm:flex px-3 py-1.5 text-xs font-medium text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap shrink-0 items-center gap-1.5 cursor-pointer shadow-sm shadow-amber-400/20"
                title="Kopjo linkun e faqes"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-slate-950" />
                    <span>{t('bioLinkCopied')}</span>
                  </>
                ) : (
                  <>
                    <Link2 className="w-3.5 h-3.5 text-slate-950" />
                    <span>{t('copyBioLink')}</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setActiveView('client')}
                className="px-2.5 sm:px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-[#141720] border border-[#232733] rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">{t('navClientView')}</span>
              </button>
              <button
                onClick={logoutAdmin}
                className="hidden md:inline-block px-2.5 py-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {t('logout')}
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setActiveView('client');
                onScrollToBooking();
              }}
              className="px-3 sm:px-4 py-2 text-xs font-semibold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 active:scale-95 rounded-lg transition-all shadow-sm shadow-amber-500/10 flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Scissors className="w-3.5 h-3.5 text-slate-950 -rotate-45" />
              <span>{t('bookNow')}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
