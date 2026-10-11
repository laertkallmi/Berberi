import React, { useState } from 'react';
import { useCalendar } from '../context/CalendarContext';
import { ActiveView } from '../types';
import { Link2, Check, Lock, Calendar, Scissors } from 'lucide-react';

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
  const { settings, isAdminAuthenticated, logoutAdmin } = useCalendar();
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

  return (
    <header className="sticky top-0 z-40 bg-[#090a0d]/90 backdrop-blur-md border-b border-[#1e222b]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand title, single line */}
        <button
          onClick={() => setActiveView('client')}
          className="text-left group cursor-pointer focus:outline-none"
        >
          <span className="text-base sm:text-lg font-cinzel font-semibold tracking-wider text-slate-100 group-hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-2">
            <Scissors className="w-4 h-4 text-amber-400 -rotate-45" />
            <span>{settings.name || 'Sallon Berberi'}</span>
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
            Rezervo Takim
          </button>
          <button
            onClick={() => {
              setActiveView('client');
              onScrollToServices();
            }}
            className="hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Shërbimet
          </button>
          <button
            onClick={onOpenMyBookingModal}
            className="hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Verifiko Takimin
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
            <span>Paneli Admin</span>
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action button */}
        <div className="flex items-center gap-2.5 shrink-0">
          {activeView === 'admin' ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyBioLink}
                className="px-3 py-1.5 text-xs font-medium text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer shadow-sm shadow-amber-400/20"
                title="Kopjo linkun e faqes për ta vendosur në bio të Instagramit"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-slate-950" />
                    <span>U Kopjua Linku!</span>
                  </>
                ) : (
                  <>
                    <Link2 className="w-3.5 h-3.5 text-slate-950" />
                    <span>Kopjo Linkun e Bio</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setActiveView('client')}
                className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-[#141720] border border-[#232733] rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>Pamja e Klientit</span>
              </button>
              <button
                onClick={logoutAdmin}
                className="hidden sm:inline-block px-3 py-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Dil
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setActiveView('client');
                onScrollToBooking();
              }}
              className="px-4 py-2 text-xs font-semibold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 active:scale-95 rounded-lg transition-all shadow-sm shadow-amber-500/10 flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Scissors className="w-3.5 h-3.5 text-slate-950 -rotate-45" />
              <span>Rezervo Tani</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

