export interface User {
  id: string;
  email: string;
  role: 'admin' | 'technician';
}

export interface Device {
  id: string;
  name: string;
  type: string;
  manufacturer?: string; // Výrobca zariadenia
  location: string;
  status: 'operational' | 'maintenance' | 'offline';
  imageUrl?: string; // URL fotky zariadenia
  manualUrl?: string;
  lastMaintenance: string;
  nextMaintenance: string;
  maintenancePeriod?: 'monthly' | 'quarterly' | 'semi-annually' | 'annually'; // Perioda pravidelnej údržby
  specifications?: Record<string, string | number>; // Špecifikácie zariadenia (rozmery, váha, pripojenia, atď.)
  downtime: number; // Total downtime in hours
  lastStatusChange: string; // ISO string for the last status change
  electricalInspectionDate?: string; // Dátum elektrickej revízie
  electricalInspectionPeriod?: 1 | 2 | 3 | 4 | 5 | 10; // Perioda platnosti v rokoch
  electricalInspectionExpiry?: string; // Automaticky vypočítaný dátum expirácie
}

export interface SparePart {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  minQuantity: number; // Minimálne požadované množstvo
  location: string;
  deviceId?: string; // Optional: ID zariadenia ku ktorému patrí
  deviceName?: string; // Optional: Názov zariadenia
  deviceType?: string; // Optional: Typ zariadenia
  lastChange?: {
    date: string;
    changedBy: string;
    notes?: string;
    changeType: 'increase' | 'decrease' | 'set';
    quantityBefore: number;
    quantityAfter: number;
  };
}

export interface MaintenanceLog {
  id: string;
  deviceId: string;
  deviceName: string;
  date: string;
  technician: string;
  notes: string;
  type: 'scheduled' | 'emergency';
  durationMinutes: number; // Dĺžka trvania údržby v minútach (minimálne 15)
}

export interface SparePartHistory {
  id: string;
  partId: string;
  partName: string;
  quantityBefore: number;
  quantityAfter: number;
  changeType: 'increase' | 'decrease' | 'set';
  notes?: string;
  changedBy: string;
  createdAt: string;
}
