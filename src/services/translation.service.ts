import { Injectable, signal, computed } from '@angular/core';

export type Language = 'en' | 'sk' | 'de';

const translations = {
  en: {
    // General
    APP_TITLE: 'Equipment Maintenance Hub',
    DASHBOARD: 'Dashboard',
    DEVICES: 'Devices',
    SPARE_PARTS: 'Spare Parts',
    MAINTENANCE: 'Maintenance',
    LOGOUT: 'Logout',
    LOADING_DATA: 'Loading data...',
    PLEASE_WAIT: 'Please wait a moment.',
    DELETE: 'Delete',

    // Login
    LOGIN_TITLE: 'Equipment Maintenance Hub',
    LOGIN_SUBTITLE: 'Enter your credentials to sign in',
    SIGN_IN_ADMIN: 'Sign in as Admin',
    SIGN_IN_TECHNICIAN: 'Sign in as Technician',
    SIGN_IN: 'Sign In',
    EMAIL: 'Email',
    PASSWORD: 'Password',
    LOADING: 'Loading...',
    
    // Dashboard
    OPERATIONAL: 'Operational',
    MAINTENANCE_STATUS: 'Maintenance',
    OFFLINE: 'Offline',
    LOW_STOCK_PARTS: 'Low Stock Parts',
    TOTAL_DOWNTIME: 'Total Downtime',
    RECENT_MAINTENANCE_ACTIVITY: 'Recent Maintenance Activity',
    NO_MAINTENANCE_LOGS_YET: 'No maintenance logs yet',
    ADD_MAINTENANCE_LOG_FROM_DEVICE_DETAIL: 'Add maintenance logs from device detail page',
    DEVICE: 'Device',
    TECHNICIAN: 'Technician',
    DATE: 'Date',
    TYPE: 'Type',
    SCHEDULED: 'Scheduled',
    EMERGENCY: 'Emergency',

    // Device List
    ADD_NEW_DEVICE: 'Add New Device',
    EXPORT_DEVICES: 'Export Devices',
    SEARCH_DEVICES: 'Search devices...',
    DEVICE_NAME: 'Name',
    LOCATION: 'Location',
    STATUS: 'Status',
    NEXT_MAINTENANCE: 'Next Maintenance',
    DETAILS: 'Details',
    DOWNTIME: 'Downtime (h)',
    NO_DEVICES_FOUND: 'No devices found for your search.',
    LOADING_DEVICES: 'Loading devices...',

    // Device Detail
    BACK_TO_DEVICES: 'Back to Devices',
    DEVICE_DETAILS: 'Device Details',
    DEVICE_ID: 'Device ID',
    LAST_MAINTENANCE: 'Last Maintenance',
    LOG_MAINTENANCE: 'Log Maintenance',
    MAINTENANCE_NOTES_PLACEHOLDER: 'Enter maintenance notes...',
    COMPLETE_LOG_MAINTENANCE: 'Complete & Log Maintenance',
    DEVICE_IN_MAINTENANCE: 'This device is currently undergoing maintenance.',
    DEVICE_QR_CODE: 'Device QR Code',
    SCAN_QR_CODE_INFO: 'Scan to quickly identify this device.',
    ACTIONS: 'Actions',
    VIEW_MANUAL: 'View Manual (PDF)',
    DECOMMISSION_DEVICE: 'Decommission Device',
    LOADING_DEVICE_DETAILS: 'Loading device details...',
    SET_STATUS_MAINTENANCE: 'Set to Maintenance',
    SET_STATUS_OFFLINE: 'Set to Offline',
    SET_STATUS_OPERATIONAL: 'Bring Online',
    
    // Part List
    SPARE_PARTS_INVENTORY: 'Spare Parts Inventory',
    ADD_NEW_PART: 'Add New Part',
    SEARCH_PARTS: 'Search parts by name, SKU, or location...',
    PART_NAME: 'Name',
    SKU: 'SKU',
    QUANTITY: 'Quantity',
    MIN_QUANTITY: 'Min. Quantity',
    LOADING_PARTS: 'Loading parts...',
    NO_PARTS_FOUND: 'No parts found for your search.',
    FILTER_ALL_PARTS: 'All Parts',
    FILTER_BELOW_MIN: 'Below Minimum',
    FILTER_LOW_STOCK: 'Low Stock',
    FILTER_NORMAL_STOCK: 'Normal Stock',

    // Maintenance List
    MAINTENANCE_LOG: 'Maintenance Log',
    ALL: 'All',
    NOTES: 'Notes',
    LOADING_LOGS: 'Loading maintenance logs...',
    NO_LOGS_FOUND_FILTER: 'No logs found for this filter.',
    
    // Statuses
    STATUS_OPERATIONAL: 'Operational',
    STATUS_MAINTENANCE: 'Maintenance',
    STATUS_OFFLINE: 'Offline',

    // Downtime
    DOWNTIME_TRACKING: 'Downtime Tracking',
    MONTH: 'Month',
    TOTAL_DOWNTIME_HOURS: 'Total Downtime',
    AVERAGE_PERCENTAGE: 'Average %',
    DEVICES_IN_TARGET: 'Devices in Target',
    DEVICES_OVER_TARGET: 'Devices over Target',
    DEVICE_DOWNTIME_DETAILS: 'Device Downtime Details',
    DEVICE_TYPE: 'Type',
    MAINTENANCE_COUNT: 'Maintenance Count',
    TARGET: 'Target',
    PROGRESS: 'Progress',
    IN_TARGET: 'In target',
    OVER_TARGET: 'Over target',
    DOWNTIME_INFO_TITLE: 'ℹ️ Calculation Information',
    DOWNTIME_INFO_TEXT: 'Working time: 160 hours/month per device (20 working days × 8 hours). Target downtime: 2.5% = 4 hours/month. Only emergency maintenance counts towards downtime. Minimum maintenance duration: 15 minutes.',
    MONTHLY_DOWNTIME: 'Monthly Downtime',
    ACTIVE_DEVICES: 'active devices',

    // Electrical Inspection
    ELECTRICAL_INSPECTION: 'Electrical Inspection',
    INSPECTION_DATE: 'Inspection Date',
    VALIDITY: 'Validity',
    EXPIRATION: 'Expiration',
    YEAR: 'year',
    YEARS: 'years',
    SAVE_INSPECTION: 'Save Inspection',
    INSPECTION_UPDATED: 'Electrical inspection successfully updated',
    INSPECTION_DATE_REQUIRED: 'Please enter inspection date.',
    INSPECTION_PERIOD_INVALID: 'Please select a valid period.',

    // Maintenance Period
    MAINTENANCE_PERIOD: 'Maintenance Period',
    SELECT_PERIOD: '-- Select Period --',
    MONTHLY: 'Monthly (1 month)',
    QUARTERLY: 'Quarterly (3 months)',
    SEMI_ANNUALLY: 'Semi-annually (6 months)',
    ANNUALLY: 'Annually (12 months)',
    AUTO_CALCULATES_NEXT: 'Automatically calculates next maintenance date',
    CALCULATED_AUTOMATICALLY: 'Calculated automatically if you select a period',

    // Specifications
    SPECIFICATIONS: 'Specifications',
    ADD_FIELD: 'Add Field',
    SPECIFICATIONS_HELP: 'Add technical specifications such as dimensions, weight, power, connections, etc.',
    SPEC_KEY_PLACEHOLDER: 'e.g., Dimensions, Weight, Power',
    SPEC_VALUE_PLACEHOLDER: 'e.g., 100x50x30 cm, 250 kg, 5 kW',
    NO_SPECIFICATIONS: 'No specifications added yet',

  },
  sk: {
    // General
    APP_TITLE: 'Centrum Údržby Zariadení',
    DASHBOARD: 'Nástenka',
    DEVICES: 'Zariadenia',
    SPARE_PARTS: 'Náhradné diely',
    MAINTENANCE: 'Údržba',
    LOGOUT: 'Odhlásiť sa',
    LOADING_DATA: 'Načítavam dáta...',
    PLEASE_WAIT: 'Prosím čakajte chvíľu.',
    DELETE: 'Vymazať',

    // Login
    LOGIN_TITLE: 'Centrum Údržby Zariadení',
    LOGIN_SUBTITLE: 'Zadajte prihlasovacie údaje',
    SIGN_IN_ADMIN: 'Prihlásiť sa ako Admin',
    SIGN_IN_TECHNICIAN: 'Prihlásiť sa ako Technik',
    SIGN_IN: 'Prihlásiť sa',
    EMAIL: 'Email',
    PASSWORD: 'Heslo',
    LOADING: 'Načítavam...',
    
    // Dashboard
    OPERATIONAL: 'V prevádzke',
    MAINTENANCE_STATUS: 'V údržbe',
    OFFLINE: 'Mimo prevádzky',
    LOW_STOCK_PARTS: 'Nízke zásoby dielov',
    TOTAL_DOWNTIME: 'Celkový prestoj',
    RECENT_MAINTENANCE_ACTIVITY: 'Nedávna aktivita údržby',
    NO_MAINTENANCE_LOGS_YET: 'Zatiaľ žiadne záznamy o údržbe',
    ADD_MAINTENANCE_LOG_FROM_DEVICE_DETAIL: 'Záznamy o údržbe pridajte na stránke detailov zariadenia',
    DEVICE: 'Zariadenie',
    TECHNICIAN: 'Technik',
    DATE: 'Dátum',
    TYPE: 'Typ',
    SCHEDULED: 'Plánovaná',
    EMERGENCY: 'Neodkladná',

    // Device List
    ADD_NEW_DEVICE: 'Pridať nové zariadenie',
    EXPORT_DEVICES: 'Exportovať zariadenia',
    SEARCH_DEVICES: 'Hľadať zariadenia...',
    DEVICE_NAME: 'Názov',
    LOCATION: 'Umiestnenie',
    STATUS: 'Stav',
    NEXT_MAINTENANCE: 'Nasledujúca údržba',
    DETAILS: 'Detaily',
    DOWNTIME: 'Prestoj (h)',
    NO_DEVICES_FOUND: 'Pre vaše vyhľadávanie sa nenašli žiadne zariadenia.',
    LOADING_DEVICES: 'Načítavam zariadenia...',

    // Device Detail
    BACK_TO_DEVICES: 'Späť na zariadenia',
    DEVICE_DETAILS: 'Detaily zariadenia',
    DEVICE_ID: 'ID zariadenia',
    LAST_MAINTENANCE: 'Posledná údržba',
    LOG_MAINTENANCE: 'Zaznamenať údržbu',
    MAINTENANCE_NOTES_PLACEHOLDER: 'Zadajte poznámky k údržbe...',
    COMPLETE_LOG_MAINTENANCE: 'Dokončiť a zaznamenať údržbu',
    DEVICE_IN_MAINTENANCE: 'Toto zariadenie je momentálne v údržbe.',
    DEVICE_QR_CODE: 'QR kód zariadenia',
    SCAN_QR_CODE_INFO: 'Naskenujte pre rýchlu identifikáciu zariadenia.',
    ACTIONS: 'Akcie',
    VIEW_MANUAL: 'Zobraziť manuál (PDF)',
    DECOMMISSION_DEVICE: 'Vyradiť zariadenie',
    LOADING_DEVICE_DETAILS: 'Načítavam detaily zariadenia...',
    SET_STATUS_MAINTENANCE: 'Nastaviť na Údržbu',
    SET_STATUS_OFFLINE: 'Nastaviť Mimo prevádzky',
    SET_STATUS_OPERATIONAL: 'Spustiť do prevádzky',

    // Part List
    SPARE_PARTS_INVENTORY: 'Sklad náhradných dielov',
    ADD_NEW_PART: 'Pridať nový diel',
    SEARCH_PARTS: 'Hľadať diely podľa názvu, SKU, alebo umiestnenia...',
    PART_NAME: 'Názov',
    SKU: 'SKU',
    QUANTITY: 'Množstvo',
    MIN_QUANTITY: 'Min. množstvo',
    LOADING_PARTS: 'Načítavam diely...',
    NO_PARTS_FOUND: 'Pre vaše vyhľadávanie sa nenašli žiadne diely.',
    FILTER_ALL_PARTS: 'Všetky diely',
    FILTER_BELOW_MIN: 'Pod minimom',
    FILTER_LOW_STOCK: 'Nízke zásoby',
    FILTER_NORMAL_STOCK: 'Normálne zásoby',

    // Maintenance List
    MAINTENANCE_LOG: 'Záznamy o údržbe',
    ALL: 'Všetky',
    NOTES: 'Poznámky',
    LOADING_LOGS: 'Načítavam záznamy o údržbe...',
    NO_LOGS_FOUND_FILTER: 'Pre tento filter sa nenašli žiadne záznamy.',

    // Statuses
    STATUS_OPERATIONAL: 'V prevádzke',
    STATUS_MAINTENANCE: 'V údržbe',
    STATUS_OFFLINE: 'Mimo prevádzky',

    // Downtime
    DOWNTIME_TRACKING: 'Sledovanie Prestojov',
    MONTH: 'Mesiac',
    TOTAL_DOWNTIME_HOURS: 'Celkový prestoj',
    AVERAGE_PERCENTAGE: 'Priemerné %',
    DEVICES_IN_TARGET: 'Zariadenia v cieli',
    DEVICES_OVER_TARGET: 'Zariadenia nad cieľom',
    DEVICE_DOWNTIME_DETAILS: 'Detaily prestojov zariadení',
    DEVICE_TYPE: 'Typ',
    MAINTENANCE_COUNT: 'Počet údržieb',
    TARGET: 'Cieľ',
    PROGRESS: 'Priebeh',
    IN_TARGET: 'V cieli',
    OVER_TARGET: 'Nad cieľom',
    DOWNTIME_INFO_TITLE: 'ℹ️ Informácie o výpočte',
    DOWNTIME_INFO_TEXT: 'Pracovný čas: 160 hodín/mesiac na zariadenie (20 pracovných dní × 8 hodín). Cieľový prestoj: 2.5% = 4 hodiny/mesiac. Do prestojov sa počíta len neodkladná údržba. Minimálne trvanie údržby: 15 minút.',
    MONTHLY_DOWNTIME: 'Mesačný prestoj',
    ACTIVE_DEVICES: 'aktívne zariadenia',

    // Electrical Inspection
    ELECTRICAL_INSPECTION: 'Elektrická revízia',
    INSPECTION_DATE: 'Dátum revízie',
    VALIDITY: 'Platnosť',
    EXPIRATION: 'Expirácia',
    YEAR: 'rok',
    YEARS: 'roky',
    SAVE_INSPECTION: 'Uložiť revíziu',
    INSPECTION_UPDATED: 'Elektrická revízia bola úspešne aktualizovaná',
    INSPECTION_DATE_REQUIRED: 'Prosím zadajte dátum revízie.',
    INSPECTION_PERIOD_INVALID: 'Prosím vyberte platnú periódu.',

    // Maintenance Period
    MAINTENANCE_PERIOD: 'Perioda údržby',
    SELECT_PERIOD: '-- Vybrať periódu --',
    MONTHLY: 'Mesačne (1 mesiac)',
    QUARTERLY: 'Štvrťročne (3 mesiace)',
    SEMI_ANNUALLY: 'Polročne (6 mesiacov)',
    ANNUALLY: 'Ročne (12 mesiacov)',
    AUTO_CALCULATES_NEXT: 'Automaticky vypočíta dátum ďalšej údržby',
    CALCULATED_AUTOMATICALLY: 'Vypočíta sa automaticky ak vyberiete periódu',

    // Specifications
    SPECIFICATIONS: 'Špecifikácie',
    ADD_FIELD: 'Pridať pole',
    SPECIFICATIONS_HELP: 'Pridajte technické špecifikácie ako rozmery, váha, príkon, pripojenia, atď.',
    SPEC_KEY_PLACEHOLDER: 'napr. Rozmery, Váha, Príkon',
    SPEC_VALUE_PLACEHOLDER: 'napr. 100x50x30 cm, 250 kg, 5 kW',
    NO_SPECIFICATIONS: 'Zatiaľ neboli pridané žiadne špecifikácie',

  },
  de: {
    // General
    APP_TITLE: 'Gerätewartungs-Hub',
    DASHBOARD: 'Dashboard',
    DEVICES: 'Geräte',
    SPARE_PARTS: 'Ersatzteile',
    MAINTENANCE: 'Wartung',
    LOGOUT: 'Abmelden',
    LOADING_DATA: 'Daten werden geladen...',
    PLEASE_WAIT: 'Bitte warten Sie einen Moment.',
    DELETE: 'Löschen',

    // Login
    LOGIN_TITLE: 'Gerätewartungs-Hub',
    LOGIN_SUBTITLE: 'Geben Sie Ihre Anmeldedaten ein',
    SIGN_IN_ADMIN: 'Als Admin anmelden',
    SIGN_IN_TECHNICIAN: 'Als Techniker anmelden',
    SIGN_IN: 'Anmelden',
    EMAIL: 'E-Mail',
    PASSWORD: 'Passwort',
    LOADING: 'Lädt...',
    
    // Dashboard
    OPERATIONAL: 'Betriebsbereit',
    MAINTENANCE_STATUS: 'Wartung',
    OFFLINE: 'Offline',
    LOW_STOCK_PARTS: 'Niedriger Lagerbestand',
    TOTAL_DOWNTIME: 'Gesamtausfallzeit',
    RECENT_MAINTENANCE_ACTIVITY: 'Letzte Wartungsaktivitäten',
    NO_MAINTENANCE_LOGS_YET: 'Noch keine Wartungsprotokolle',
    ADD_MAINTENANCE_LOG_FROM_DEVICE_DETAIL: 'Fügen Sie Wartungsprotokolle von der Gerätedetailseite hinzu',
    DEVICE: 'Gerät',
    TECHNICIAN: 'Techniker',
    DATE: 'Datum',
    TYPE: 'Typ',
    SCHEDULED: 'Geplant',
    EMERGENCY: 'Notfall',

    // Device List
    ADD_NEW_DEVICE: 'Neues Gerät hinzufügen',
    EXPORT_DEVICES: 'Geräte exportieren',
    SEARCH_DEVICES: 'Geräte suchen...',
    DEVICE_NAME: 'Name',
    LOCATION: 'Standort',
    STATUS: 'Status',
    NEXT_MAINTENANCE: 'Nächste Wartung',
    DETAILS: 'Details',
    DOWNTIME: 'Ausfallzeit (h)',
    NO_DEVICES_FOUND: 'Für Ihre Suche wurden keine Geräte gefunden.',
    LOADING_DEVICES: 'Geräte werden geladen...',

    // Device Detail
    BACK_TO_DEVICES: 'Zurück zu den Geräten',
    DEVICE_DETAILS: 'Gerätedetails',
    DEVICE_ID: 'Geräte-ID',
    LAST_MAINTENANCE: 'Letzte Wartung',
    LOG_MAINTENANCE: 'Wartung protokollieren',
    MAINTENANCE_NOTES_PLACEHOLDER: 'Wartungsnotizen eingeben...',
    COMPLETE_LOG_MAINTENANCE: 'Wartung abschließen & protokollieren',
    DEVICE_IN_MAINTENANCE: 'Dieses Gerät wird derzeit gewartet.',
    DEVICE_QR_CODE: 'Geräte-QR-Code',
    SCAN_QR_CODE_INFO: 'Scannen, um dieses Gerät schnell zu identifizieren.',
    ACTIONS: 'Aktionen',
    VIEW_MANUAL: 'Anleitung ansehen (PDF)',
    DECOMMISSION_DEVICE: 'Gerät außer Betrieb nehmen',
    LOADING_DEVICE_DETAILS: 'Gerätedetails werden geladen...',
    SET_STATUS_MAINTENANCE: 'Auf Wartung setzen',
    SET_STATUS_OFFLINE: 'Offline setzen',
    SET_STATUS_OPERATIONAL: 'Online schalten',

    // Part List
    SPARE_PARTS_INVENTORY: 'Ersatzteilinventar',
    ADD_NEW_PART: 'Neues Teil hinzufügen',
    SEARCH_PARTS: 'Teile nach Name, SKU oder Standort suchen...',
    PART_NAME: 'Name',
    SKU: 'SKU',
    QUANTITY: 'Menge',
    MIN_QUANTITY: 'Min. Menge',
    LOADING_PARTS: 'Ersatzteile werden geladen...',
    NO_PARTS_FOUND: 'Für Ihre Suche wurden keine Teile gefunden.',
    FILTER_ALL_PARTS: 'Alle Teile',
    FILTER_BELOW_MIN: 'Unter Minimum',
    FILTER_LOW_STOCK: 'Niedriger Bestand',
    FILTER_NORMAL_STOCK: 'Normaler Bestand',

    // Maintenance List
    MAINTENANCE_LOG: 'Wartungsprotokoll',
    ALL: 'Alle',
    NOTES: 'Notizen',
    LOADING_LOGS: 'Wartungsprotokolle werden geladen...',
    NO_LOGS_FOUND_FILTER: 'Für diesen Filter wurden keine Protokolle gefunden.',
    
    // Statuses
    STATUS_OPERATIONAL: 'Betriebsbereit',
    STATUS_MAINTENANCE: 'Wartung',
    STATUS_OFFLINE: 'Offline',

    // Downtime
    DOWNTIME_TRACKING: 'Ausfallzeit-Verfolgung',
    MONTH: 'Monat',
    TOTAL_DOWNTIME_HOURS: 'Gesamtausfallzeit',
    AVERAGE_PERCENTAGE: 'Durchschnitt %',
    DEVICES_IN_TARGET: 'Geräte im Ziel',
    DEVICES_OVER_TARGET: 'Geräte über Ziel',
    DEVICE_DOWNTIME_DETAILS: 'Geräte-Ausfallzeit Details',
    DEVICE_TYPE: 'Typ',
    MAINTENANCE_COUNT: 'Wartungsanzahl',
    TARGET: 'Ziel',
    PROGRESS: 'Fortschritt',
    IN_TARGET: 'Im Ziel',
    OVER_TARGET: 'Über Ziel',
    DOWNTIME_INFO_TITLE: 'ℹ️ Berechnungsinformationen',
    DOWNTIME_INFO_TEXT: 'Arbeitszeit: 160 Stunden/Monat pro Gerät (20 Arbeitstage × 8 Stunden). Ziel-Ausfallzeit: 2,5% = 4 Stunden/Monat. Nur Notfallwartungen zählen zur Ausfallzeit. Minimale Wartungsdauer: 15 Minuten.',
    MONTHLY_DOWNTIME: 'Monatliche Ausfallzeit',
    ACTIVE_DEVICES: 'aktive Geräte',

    // Electrical Inspection
    ELECTRICAL_INSPECTION: 'Elektrische Inspektion',
    INSPECTION_DATE: 'Inspektionsdatum',
    VALIDITY: 'Gültigkeit',
    EXPIRATION: 'Ablaufdatum',
    YEAR: 'Jahr',
    YEARS: 'Jahre',
    SAVE_INSPECTION: 'Inspektion speichern',
    INSPECTION_UPDATED: 'Elektrische Inspektion erfolgreich aktualisiert',
    INSPECTION_DATE_REQUIRED: 'Bitte geben Sie das Inspektionsdatum ein.',
    INSPECTION_PERIOD_INVALID: 'Bitte wählen Sie einen gültigen Zeitraum.',

    // Maintenance Period
    MAINTENANCE_PERIOD: 'Wartungsperiode',
    SELECT_PERIOD: '-- Periode wählen --',
    MONTHLY: 'Monatlich (1 Monat)',
    QUARTERLY: 'Vierteljährlich (3 Monate)',
    SEMI_ANNUALLY: 'Halbjährlich (6 Monate)',
    ANNUALLY: 'Jährlich (12 Monate)',
    AUTO_CALCULATES_NEXT: 'Berechnet automatisch das nächste Wartungsdatum',
    CALCULATED_AUTOMATICALLY: 'Wird automatisch berechnet, wenn Sie eine Periode wählen',

    // Specifications
    SPECIFICATIONS: 'Spezifikationen',
    ADD_FIELD: 'Feld hinzufügen',
    SPECIFICATIONS_HELP: 'Fügen Sie technische Spezifikationen wie Abmessungen, Gewicht, Leistung, Anschlüsse usw. hinzu.',
    SPEC_KEY_PLACEHOLDER: 'z.B. Abmessungen, Gewicht, Leistung',
    SPEC_VALUE_PLACEHOLDER: 'z.B. 100x50x30 cm, 250 kg, 5 kW',
    NO_SPECIFICATIONS: 'Noch keine Spezifikationen hinzugefügt',

  },
};

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private languageSignal = signal<Language>(this.getInitialLanguage());
  
  currentLanguage = this.languageSignal.asReadonly();
  
  private currentTranslations = computed(() => translations[this.languageSignal()]);

  getTranslation(key: string): string {
    return this.currentTranslations()[key as keyof typeof translations.en] || key;
  }

  setLanguage(language: Language): void {
    this.languageSignal.set(language);
    localStorage.setItem('language', language);
  }

  private getInitialLanguage(): Language {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'sk' || savedLanguage === 'de')) {
      return savedLanguage as Language;
    }
    return 'en'; // Default language
  }
}
