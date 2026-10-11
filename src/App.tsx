/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { CalendarProvider, useCalendar } from './context/CalendarContext';
import { Header } from './components/Header';
import { ClientBookingView } from './components/ClientBookingView';
import { AdminDashboard } from './components/AdminDashboard';
import { PinModal } from './components/PinModal';
import { MyBookingLookupModal } from './components/MyBookingLookupModal';
import { ActiveView } from './types';

function MainApp() {
  const { isAdminAuthenticated } = useCalendar();
  const [activeView, setActiveView] = useState<ActiveView>('client');
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isLookupModalOpen, setIsLookupModalOpen] = useState(false);

  const bookingRef = useRef<HTMLDivElement | null>(null);
  const servicesRef = useRef<HTMLDivElement | null>(null);

  const handleOpenPinModal = () => {
    setIsPinModalOpen(true);
  };

  const handlePinSuccess = () => {
    setIsPinModalOpen(false);
    setActiveView('admin');
  };

  const handleScrollToBooking = () => {
    if (bookingRef.current) {
      bookingRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScrollToServices = () => {
    if (servicesRef.current) {
      servicesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#090a0d] text-slate-100 flex flex-col font-sans selection:bg-amber-400/20 selection:text-amber-300">
      <Header
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenPinModal={handleOpenPinModal}
        onOpenMyBookingModal={() => setIsLookupModalOpen(true)}
        onScrollToServices={handleScrollToServices}
        onScrollToBooking={handleScrollToBooking}
      />

      <div className="flex-1">
        {activeView === 'client' ? (
          <ClientBookingView
            onGoToAdmin={() => {
              if (isAdminAuthenticated) {
                setActiveView('admin');
              } else {
                setIsPinModalOpen(true);
              }
            }}
            bookingRef={bookingRef}
            servicesRef={servicesRef}
          />
        ) : (
          <AdminDashboard
            onBackToClient={() => setActiveView('client')}
          />
        )}
      </div>

      {/* Security PIN Modal */}
      <PinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onSuccess={handlePinSuccess}
      />

      {/* Client Booking Lookup Modal */}
      <MyBookingLookupModal
        isOpen={isLookupModalOpen}
        onClose={() => setIsLookupModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <CalendarProvider>
      <MainApp />
    </CalendarProvider>
  );
}
