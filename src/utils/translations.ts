import { Language, Service } from '../types';

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  sq: {
    // Header
    navBook: 'Rezervo Takim',
    navServices: 'Shërbimet',
    navVerify: 'Verifiko Takimin',
    navAdmin: 'Paneli Admin',
    navClientView: 'Pamja e Klientit',
    copyBioLink: 'Kopjo Linkun e Bio',
    bioLinkCopied: 'U Kopjua Linku!',
    bookNow: 'Rezervo Tani',
    logout: 'Dil',

    // Hero & Booking View
    defaultSalonName: 'Sallon Berberi',
    heroTagline: 'Rezervoni orarin tuaj të prerjes online në pak sekonda. Pa pritje në radhë.',
    contactWhatsApp: 'Kontakto në WhatsApp',
    step1Tab: 'Shërbimi',
    step2Tab: 'Ora & Data',
    step3Tab: 'Të Dhënat',
    step4Tab: 'Konfirmimi',
    step1Title: '1. Zgjidhni Shërbimin e Prerjes',
    step1Subtitle: 'Zgjidhni shërbimin që dëshironi të rezervoni për të parë oraret e lira të berberit.',
    step2Title: '2. Zgjidhni Datën dhe Orarin e Lirë',
    step2Subtitle: 'Zgjidhni një datë dhe orar të përshtatshëm për ju.',
    dateLabel: 'Data:',
    timeSlotsLabel: 'Oraret e Lira për',
    noSlotsAvailable: 'Nuk ka orare të lira për këtë datë.',
    chooseOtherDate: 'Ju lutem zgjidhni një ditë tjetër më lart.',
    today: 'Sot',
    tomorrow: 'Nesër',
    free: 'I Lirë',
    blocked: 'I Bllokuar',
    booked: 'I Zënë',
    step3Title: '3. Plotësoni të Dhënat Tuaja',
    step3Subtitle: 'Jepni të dhënat tuaja për konfirmimin e rezervimit.',
    fullNameLabel: 'Emri dhe Mbiemri *',
    fullNamePlaceholder: 'p.sh. Alban D.',
    phoneLabel: 'Numri i Telefonit / WhatsApp *',
    phonePlaceholder: 'p.sh. +49 178 6922244',
    phoneNote: 'Do t\'ju dërgojmë konfirmimin e orarit të prerjes në këtë numër.',
    emailLabel: 'Email (Opsionale)',
    emailPlaceholder: 'klienti@email.com',
    notesLabel: 'Kërkesa ose Shënime Shtesë (Opsionale)',
    notesPlaceholder: 'p.sh. Preferoj low skin fade, rruajtje me brisk klasik...',
    backToStep2: 'Kthehu te orari',
    confirmBookingBtn: 'Konfirmo Rezervimin Tani',
    nameRequiredError: 'Ju lutem shkruani emrin dhe mbiemrin',
    phoneRequiredError: 'Numri i telefonit është i detyrueshëm për konfirmim',
    phoneInvalidError: 'Ju lutem jepni një numër të saktë telefoni',

    // Step 4
    step4SuccessTitle: 'Takimi u Rezervua me Sukses!',
    step4CloudBadge: 'U ruajt në sistemin e sallonit & në kalendarin e berberit',
    step4Note: 'Karrigia juaj është e rezervuar. Ju lutem paraqituni 5 minuta para orarit.',
    bookingCodeLabel: 'Kodi i Rezervimit',
    statusConfirmedBadge: 'I Konfirmuar',
    serviceSummaryLabel: 'Shërbimi:',
    dateTimeSummaryLabel: 'Data dhe Ora:',
    clientSummaryLabel: 'Klienti:',
    locationSummaryLabel: 'Vendi:',
    notesSummaryLabel: 'Shënime:',
    sendWhatsAppBtn: 'Dërgo Konfirmimin në WhatsApp',
    addToCalendarBtn: 'Shto në Kalendar (.ics)',
    bookAnotherBtn: 'Rezervo një takim tjetër',
    allRightsReserved: 'Të gjitha të drejtat të rezervuara.',

    // Admin Dashboard
    adminBadge: 'Paneli i Menaxhimit të Sallonit të Berberit',
    adminTitle: 'Kalendari & Agjenda e Berberit',
    todayIs: 'Sot është',
    liveSyncBtn: 'Sinkronizim Live',
    syncingStatus: 'Po përditësohet...',
    addManualBookingBtn: 'Shto Takim me Dorë',
    kpiAppointmentsToday: 'Prerje & Takime Sot',
    kpiPending: 'Në Pritje',
    kpiRevenue: 'Të Ardhura të Parashikuara',
    kpiFreeSlots: 'Orare të Lira Sot',
    tabToday: 'Sot',
    tabCalendar: 'Kalendari & Orare',
    tabAll: 'Të Gjitha Rezervimet',
    tabSettings: 'Cilësimet',
    tabTodayTitle: 'Axhenda e Ditës së Sotme',
    tabTodaySubtitle: 'Menaxhoni dhe ndiqni klientët e sotëm sipas orarit.',
    noAppointmentsToday: 'Nuk keni asnjë takim për ditën e sotme.',
    quickCall: 'Telefono',
    actionConfirm: 'Konfirmo',
    actionComplete: 'Përfundo',
    actionCancel: 'Anulo takimin',
    calendarManagementTitle: 'Menaxhimi i Orareve të Berberit (Liro ose Blloko)',
    calendarManagementSubtitle: 'Klikoni mbi çdo orar për ta bllokuar (pushim, orar dreke) ose për ta liruar për klientët.',
    totalSlotsLabel: 'Orare gjithsej:',
    freeSlotsLabel: 'Të lira:',
    blockedSlotsLabel: 'Të bllokuara:',
    bookedSlotsLabel: 'Të rezervuara:',
    allBookingsTitle: 'Të Gjitha Rezervimet e Regjistruara',
    allBookingsSubtitle: 'Lista e plotë e rezervimeve online dhe atyre manuale.',
    exportCsvBtn: 'Eksporto në Excel (CSV)',
    searchPlaceholder: 'Kërko sipas emrit, numrit të telefonit ose kodit...',
    allStatusesOption: 'Të gjitha statuset',
    filterByDateLabel: 'Filtro sipas datës:',
    tableColClient: 'Klienti',
    tableColService: 'Shërbimi',
    tableColDateTime: 'Data & Ora',
    tableColPrice: 'Çmimi',
    tableColStatus: 'Statusi',
    tableColActions: 'Veprime',
    noFilteredBookings: 'Nuk u gjet asnjë rezervim me këto filtra.',

    // Settings
    settingsHeading: 'Cilësimet e Sallonit & Orari i Punës',
    salonNameField: 'Emri i Sallonit',
    taglineField: 'Përshkrimi / Tagline',
    cityField: 'Qyteti',
    addressField: 'Adresa e Sallonit',
    phoneField: 'Numri i Telefonit',
    whatsappField: 'WhatsApp Numri (pa +)',
    instagramField: 'Instagram Handle',
    currencyField: 'Monedha',
    workHoursTitle: 'Orari i Punës & Kohëzgjatja e Takimit',
    startHourField: 'Ora e Fillimit',
    endHourField: 'Ora e Mbarimit',
    intervalField: 'Intervali (min)',
    pinSecurityField: 'PIN Kodi i Sigurisë së Panelit',
    saveSettingsBtn: 'Ruaj Cilësimet',
    servicesTitle: 'Shërbimet & Çmimet e Prerjes',
    addNewServiceTitle: 'Shto Shërbim të Ri',
    serviceNamePlaceholder: 'Emri i shërbimit (p.sh. Prerje Klasike)',
    durationMinutesField: 'Kohëzgjatja (minuta)',
    priceField: 'Çmimi',
    addServiceBtn: 'Shto Shërbimin',
    dangerZoneTitle: 'Zona e Rrezikut / Pastrim Të Dhënash',
    resetDataBtn: 'Rivendos të Dhënat Fillestare',

    // Pin Modal
    pinModalTitle: 'Paneli Administrativ',
    pinModalSubtitle: 'Vendosni kodin PIN për të hyrë në menaxhimin e orareve dhe takimeve.',
    pinClearBtn: 'Pastro',
    pinDeleteBtn: 'Fshi',
    pinEnterBtn: 'Hyr në Panel',
    pinError: 'PIN i pasaktë. Ju lutem provoni përsëri.',

    // My Booking Lookup Modal
    lookupModalTitle: 'Verifiko Rezervimin Tuaj',
    lookupModalSubtitle: 'Vendosni numrin e telefonit ose kodin e rezervimit (p.sh. REZ-4819).',
    lookupInputPlaceholder: 'Numri i telefonit ose kodi (REZ-...)',
    lookupSubmitBtn: 'Kërko Takimin',
    lookupNoResults: 'Nuk u gjet asnjë rezervim me këtë të dhënë.',
    lookupFoundCount: 'U gjetën rezervimet e mëposhtme:',
    cancelBookingBtn: 'Anulo Takimin',
    cancelConfirmPrompt: 'A jeni të sigurt që dëshironi të anuloni këtë rezervim?',

    // Manual Booking Modal
    manualModalTitle: 'Shto Takim me Dorë',
    manualModalSubtitle: 'Regjistroni një takim të ri për klientë që telefonojnë ose paraqiten fizikisht.',
    manualClientName: 'Emri i Klientit *',
    manualClientPhone: 'Numri i Telefonit *',
    manualServiceSelect: 'Shërbimi',
    manualDateSelect: 'Data',
    manualTimeSelect: 'Ora',
    manualNotes: 'Shënime Shtesë (Opsionale)',
    manualSaveBtn: 'Ruaj Takimin',
  },
  de: {
    // Header
    navBook: 'Termin buchen',
    navServices: 'Leistungen',
    navVerify: 'Termin prüfen',
    navAdmin: 'Admin-Bereich',
    navClientView: 'Kundenansicht',
    copyBioLink: 'Bio-Link kopieren',
    bioLinkCopied: 'Link kopiert!',
    bookNow: 'Jetzt buchen',
    logout: 'Abmelden',

    // Hero & Booking View
    defaultSalonName: 'Barbershop',
    heroTagline: 'Buchen Sie Ihren Haarschnitt online in wenigen Sekunden. Keine Wartezeiten.',
    contactWhatsApp: 'Über WhatsApp kontaktieren',
    step1Tab: 'Leistung',
    step2Tab: 'Datum & Zeit',
    step3Tab: 'Angaben',
    step4Tab: 'Bestätigung',
    step1Title: '1. Wählen Sie Ihre Dienstleistung',
    step1Subtitle: 'Wählen Sie eine Dienstleistung aus, um die freien Termine des Barbiers zu sehen.',
    step2Title: '2. Wählen Sie Datum und Uhrzeit',
    step2Subtitle: 'Wählen Sie einen passenden Tag und eine freie Uhrzeit für Ihren Besuch.',
    dateLabel: 'Datum:',
    timeSlotsLabel: 'Verfügbare Termine für',
    noSlotsAvailable: 'Keine freien Termine für dieses Datum verfügbar.',
    chooseOtherDate: 'Bitte wählen Sie ein anderes Datum oben aus.',
    today: 'Heute',
    tomorrow: 'Morgen',
    free: 'Frei',
    blocked: 'Blockiert',
    booked: 'Belegt',
    step3Title: '3. Ihre Kontaktdaten',
    step3Subtitle: 'Geben Sie Ihre Daten zur verbindlichen Reservierung ein.',
    fullNameLabel: 'Vor- und Nachname *',
    fullNamePlaceholder: 'z.B. Max Mustermann',
    phoneLabel: 'Telefonnummer / WhatsApp *',
    phonePlaceholder: 'z.B. +49 178 6922244',
    phoneNote: 'Wir senden Ihnen die Terminbestätigung an diese Rufnummer.',
    emailLabel: 'E-Mail (Optional)',
    emailPlaceholder: 'name@beispiel.de',
    notesLabel: 'Zusätzliche Wünsche oder Anmerkungen (Optional)',
    notesPlaceholder: 'z.B. Low Skin Fade, Bartkontur mit Klinge...',
    backToStep2: 'Zurück zur Zeitauswahl',
    confirmBookingBtn: 'Termin jetzt verbindlich buchen',
    nameRequiredError: 'Bitte geben Sie Ihren vollständigen Namen ein',
    phoneRequiredError: 'Die Telefonnummer ist für die Bestätigung erforderlich',
    phoneInvalidError: 'Bitte geben Sie eine gültige Telefonnummer ein',

    // Step 4
    step4SuccessTitle: 'Termin erfolgreich gebucht!',
    step4CloudBadge: 'Im Salon-System & Kalender gespeichert',
    step4Note: 'Ihr Platz ist reserviert. Bitte erscheinen Sie 5 Minuten vor dem Termin.',
    bookingCodeLabel: 'Buchungscode',
    statusConfirmedBadge: 'Bestätigt',
    serviceSummaryLabel: 'Leistung:',
    dateTimeSummaryLabel: 'Datum & Uhrzeit:',
    clientSummaryLabel: 'Kunde:',
    locationSummaryLabel: 'Ort:',
    notesSummaryLabel: 'Anmerkungen:',
    sendWhatsAppBtn: 'Bestätigung per WhatsApp senden',
    addToCalendarBtn: 'Zum Kalender hinzufügen (.ics)',
    bookAnotherBtn: 'Einen weiteren Termin buchen',
    allRightsReserved: 'Alle Rechte vorbehalten.',

    // Admin Dashboard
    adminBadge: 'Barbershop Verwaltungs-Dashboard',
    adminTitle: 'Kalender & Terminkalender',
    todayIs: 'Heute ist',
    liveSyncBtn: 'Live-Synchronisation',
    syncingStatus: 'Aktualisiere...',
    addManualBookingBtn: 'Termin manuell anlegen',
    kpiAppointmentsToday: 'Termine heute',
    kpiPending: 'Ausstehend',
    kpiRevenue: 'Voraussichtlicher Umsatz',
    kpiFreeSlots: 'Freie Zeitfenster heute',
    tabToday: 'Heute',
    tabCalendar: 'Kalender & Zeiten',
    tabAll: 'Alle Buchungen',
    tabSettings: 'Einstellungen',
    tabTodayTitle: 'Tagesagenda für heute',
    tabTodaySubtitle: 'Heutige Kunden und Zeitpläne übersichtlich verwalten.',
    noAppointmentsToday: 'Heute stehen keine gebuchten Termine an.',
    quickCall: 'Anrufen',
    actionConfirm: 'Bestätigen',
    actionComplete: 'Abschließen',
    actionCancel: 'Termin stornieren',
    calendarManagementTitle: 'Terminverwaltung des Barbiers (Freigeben oder Blockieren)',
    calendarManagementSubtitle: 'Klicken Sie auf ein Zeitfenster, um es zu blockieren (Pause, Mittag) oder für Kunden freizugeben.',
    totalSlotsLabel: 'Zeitfenster gesamt:',
    freeSlotsLabel: 'Frei:',
    blockedSlotsLabel: 'Blockiert:',
    bookedSlotsLabel: 'Gebucht:',
    allBookingsTitle: 'Alle registrierten Buchungen',
    allBookingsSubtitle: 'Vollständige Übersicht aller Online- und manuellen Buchungen.',
    exportCsvBtn: 'Als Excel (CSV) exportieren',
    searchPlaceholder: 'Nach Name, Telefonnummer oder Code suchen...',
    allStatusesOption: 'Alle Status',
    filterByDateLabel: 'Nach Datum filtern:',
    tableColClient: 'Kunde',
    tableColService: 'Leistung',
    tableColDateTime: 'Datum & Uhrzeit',
    tableColPrice: 'Preis',
    tableColStatus: 'Status',
    tableColActions: 'Aktionen',
    noFilteredBookings: 'Keine Buchungen mit diesen Filtern gefunden.',

    // Settings
    settingsHeading: 'Saloneinstellungen & Öffnungszeiten',
    salonNameField: 'Name des Salons',
    taglineField: 'Beschreibung / Slogan',
    cityField: 'Stadt',
    addressField: 'Adresse des Salons',
    phoneField: 'Telefonnummer',
    whatsappField: 'WhatsApp-Nummer (ohne +)',
    instagramField: 'Instagram-Profil',
    currencyField: 'Währung',
    workHoursTitle: 'Öffnungszeiten & Termindauer',
    startHourField: 'Öffnungszeit',
    endHourField: 'Schlusszeit',
    intervalField: 'Intervall (Min)',
    pinSecurityField: 'Sicherheits-PIN des Dashboards',
    saveSettingsBtn: 'Einstellungen speichern',
    servicesTitle: 'Dienstleistungen & Preise',
    addNewServiceTitle: 'Neuen Service hinzufügen',
    serviceNamePlaceholder: 'Name des Dienstes (z.B. Klassischer Schnitt)',
    durationMinutesField: 'Dauer (Minuten)',
    priceField: 'Preis',
    addServiceBtn: 'Dienstleistung hinzufügen',
    dangerZoneTitle: 'Gefahrenzone / Daten zurücksetzen',
    resetDataBtn: 'Auf Standarddaten zurücksetzen',

    // Pin Modal
    pinModalTitle: 'Administrationsbereich',
    pinModalSubtitle: 'Geben Sie die PIN ein, um Termine und Öffnungszeiten zu verwalten.',
    pinClearBtn: 'Löschen',
    pinDeleteBtn: 'Zurück',
    pinEnterBtn: 'Einloggen',
    pinError: 'Falsche PIN. Bitte versuchen Sie es erneut.',

    // My Booking Lookup Modal
    lookupModalTitle: 'Ihre Buchung überprüfen',
    lookupModalSubtitle: 'Geben Sie Ihre Telefonnummer oder Ihren Buchungscode (z.B. REZ-4819) ein.',
    lookupInputPlaceholder: 'Telefonnummer oder Code (REZ-...)',
    lookupSubmitBtn: 'Termin suchen',
    lookupNoResults: 'Keine Buchung mit diesen Angaben gefunden.',
    lookupFoundCount: 'Folgende Buchungen wurden gefunden:',
    cancelBookingBtn: 'Termin stornieren',
    cancelConfirmPrompt: 'Möchten Sie diese Buchung wirklich stornieren?',

    // Manual Booking Modal
    manualModalTitle: 'Manuellen Termin hinzufügen',
    manualModalSubtitle: 'Tragen Sie einen neuen Termin für Kunden ein, die anrufen oder vorbeikommen.',
    manualClientName: 'Kundenname *',
    manualClientPhone: 'Telefonnummer *',
    manualServiceSelect: 'Leistung',
    manualDateSelect: 'Datum',
    manualTimeSelect: 'Uhrzeit',
    manualNotes: 'Zusätzliche Anmerkungen (Optional)',
    manualSaveBtn: 'Termin speichern',
  },
};

// German service localized details
export const GERMAN_SERVICE_NAMES: Record<string, { name: string; description: string; priceEur: number }> = {
  'srv-1': {
    name: 'Klassischer Haarschnitt / Fade',
    description: 'Präziser Haarschnitt mit Schere oder Maschine, Skin Fade, Haarwäsche und Pomade-Styling.',
    priceEur: 25,
  },
  'srv-2': {
    name: 'Bartpflege & Rasur mit heißem Handtuch',
    description: 'Scharfe Konturen mit klassischem Rasiermesser, Heißtuchbehandlung und pflegende Öle.',
    priceEur: 15,
  },
  'srv-3': {
    name: 'VIP-Kombo: Haarschnitt & Bartpflege',
    description: 'Das beliebteste Paket: Kompletter Fade-Schnitt, detaillierte Bartpflege, Dampf und Styling.',
    priceEur: 35,
  },
  'srv-4': {
    name: 'Gesichtsreinigung & Black Mask',
    description: 'Entspannender Ozondampf, schwarze Tiefenreinigungsmaske gegen Unreinheiten und Feuchtigkeitscreme.',
    priceEur: 20,
  },
  'srv-5': {
    name: 'Kinderhaarschnitt',
    description: 'Besondere Geduld und moderne Schnitte für kleine Jungen.',
    priceEur: 18,
  },
  'srv-6': {
    name: 'Bartfärbung & Camouflage',
    description: 'Natürliche Abdeckung grauer Barthaare und Betonung der Konturen für einen dichten Bart.',
    priceEur: 20,
  },
};

export function getLocalizedServiceName(service: Service, lang: Language): string {
  if (lang === 'de') {
    if (GERMAN_SERVICE_NAMES[service.id]) {
      return GERMAN_SERVICE_NAMES[service.id].name;
    }
  }
  return service.name;
}

export function getLocalizedServiceDesc(service: Service, lang: Language): string {
  if (lang === 'de') {
    if (GERMAN_SERVICE_NAMES[service.id]) {
      return GERMAN_SERVICE_NAMES[service.id].description;
    }
  }
  return service.description;
}

/**
 * Returns formatted price according to selected language.
 * When in German ('de'), converts to Euros (€).
 */
export function formatPriceByLang(
  amount: number,
  lang: Language,
  serviceId?: string,
  currency = 'LEK'
): string {
  if (lang === 'de') {
    if (serviceId && GERMAN_SERVICE_NAMES[serviceId]) {
      return `${GERMAN_SERVICE_NAMES[serviceId].priceEur} €`;
    }
    // General conversion for custom prices: approx 1 EUR = 40-50 LEK or direct round
    const eurPrice = Math.max(5, Math.round(amount / 40));
    return `${eurPrice} €`;
  }
  return `${amount.toLocaleString()} ${currency}`;
}

export function getLocalizedStatus(status: string, lang: Language): string {
  if (lang === 'de') {
    switch (status) {
      case 'konfirmuar':
        return 'Bestätigt';
      case 'ne_pritje':
        return 'Ausstehend';
      case 'perfunduar':
        return 'Abgeschlossen';
      case 'anuluar':
        return 'Storniert';
      case 'nuk_erdhi':
        return 'Nicht erschienen';
      default:
        return status;
    }
  }
  switch (status) {
    case 'konfirmuar':
      return 'I Konfirmuar';
    case 'ne_pritje':
      return 'Në Pritje';
    case 'perfunduar':
      return 'Përfunduar';
    case 'anuluar':
      return 'Anuluar';
    case 'nuk_erdhi':
      return 'Nuk erdhi';
    default:
      return status;
  }
}
