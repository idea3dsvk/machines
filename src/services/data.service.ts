import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Device, SparePart, MaintenanceLog } from '../models';
import { Observable, of, delay, tap, catchError, map, from } from 'rxjs';
import { ApiService } from '../core/services/api.service';
import { SupabaseService } from '../core/services/supabase.service';
import { environment } from '../environments/environment';

const MOCK_DEVICES: Device[] = [
  { id: 'cnc-001', name: 'CNC Mill', type: 'Machining', location: 'Shop Floor A', status: 'operational', lastMaintenance: '2024-06-15', nextMaintenance: '2024-09-15', manualUrl: '#', downtime: 10.5, lastStatusChange: '2024-07-20T10:00:00Z' },
  { id: 'lathe-002', name: 'Industrial Lathe', type: 'Machining', location: 'Shop Floor A', status: 'maintenance', lastMaintenance: '2024-07-20', nextMaintenance: '2024-07-28', manualUrl: '#', downtime: 25.2, lastStatusChange: '2024-07-22T08:30:00Z' },
  { id: 'press-003', name: 'Hydraulic Press', type: 'Fabrication', location: 'Shop Floor B', status: 'operational', lastMaintenance: '2024-05-10', nextMaintenance: '2024-11-10', manualUrl: '#', downtime: 5.0, lastStatusChange: '2024-06-01T14:00:00Z' },
  { id: 'robot-004', name: 'Welding Robot Arm', type: 'Automation', location: 'Assembly Line 1', status: 'offline', lastMaintenance: '2024-01-05', nextMaintenance: '2025-01-05', manualUrl: '#', downtime: 120.7, lastStatusChange: '2024-07-15T16:45:00Z' },
];

const MOCK_PARTS: SparePart[] = [
  { id: 'sp-001', name: 'Spindle Bearing', sku: 'BRG-5021', quantity: 15, minQuantity: 10, location: 'Bin A-12' },
  { id: 'sp-002', name: 'Motor Coolant Pump', sku: 'PMP-C-34', quantity: 4, minQuantity: 5, location: 'Bin B-05' },
  { id: 'sp-003', name: 'Hydraulic Fluid Filter', sku: 'FIL-H-99', quantity: 45, minQuantity: 20, location: 'Bin A-15' },
  { id: 'sp-004', name: 'Servo Motor', sku: 'MOT-S-850', quantity: 8, minQuantity: 10, location: 'Bin C-01' },
];

const MOCK_LOGS: MaintenanceLog[] = [
    { id: 'log-001', deviceId: 'cnc-001', deviceName: 'CNC Mill', date: '2024-06-15', technician: 'admin@example.com', notes: 'Replaced spindle bearing, checked coolant levels.', type: 'scheduled', durationMinutes: 120 },
    { id: 'log-002', deviceId: 'press-003', deviceName: 'Hydraulic Press', date: '2024-05-10', technician: 'technician@example.com', notes: 'Annual fluid change and filter replacement.', type: 'scheduled', durationMinutes: 90 },
    { id: 'log-003', deviceId: 'lathe-002', deviceName: 'Industrial Lathe', date: '2024-07-20', technician: 'admin@example.com', notes: 'Emergency repair on the drive belt.', type: 'emergency', durationMinutes: 45 }
];

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private apiService = inject(ApiService);
  private supabaseService = inject(SupabaseService);
  private router = inject(Router);
  
  private devices = signal<Device[]>(MOCK_DEVICES);
  private parts = signal<SparePart[]>(MOCK_PARTS);
  private logs = signal<MaintenanceLog[]>(MOCK_LOGS);

  /**
   * Získať validný token alebo null ak je expirovaný
   */
  private getValidToken(): string | null {
    const token = localStorage.getItem('supabase.auth.token');
    if (!token) {
      console.warn('⚠️ No auth token found');
      return null;
    }

    try {
      const tokenData = JSON.parse(token);
      const expiresAt = tokenData.expires_at;
      
      // Check if token is expired (with 1 minute buffer)
      if (expiresAt && expiresAt * 1000 < Date.now() + 60000) {
        console.warn('⚠️ Token expired, clearing and redirecting to login');
        localStorage.removeItem('supabase.auth.token');
        // Use setTimeout to avoid navigation during HTTP call
        setTimeout(() => {
          alert('Vaše prihlásenie vypršalo. Prosím prihláste sa znova.');
          // Use Angular Router for proper navigation
          this.router.navigate(['/login']);
        }, 100);
        return null;
      }
      
      return tokenData.access_token;
    } catch (e) {
      console.error('❌ Error parsing token:', e);
      return null;
    }
  }

  // ========== DEVICES ==========
  
  getDevicesSignal() {
    return this.devices.asReadonly();
  }

  /**
   * Načítať zariadenia z Supabase alebo použiť mock dáta
   */
  loadDevices(): Observable<Device[]> {
    console.log('🔍 DataService.loadDevices() called');
    console.log('enableMockData:', environment.enableMockData);
    
    if (environment.enableMockData) {
      return of(MOCK_DEVICES).pipe(
        delay(300),
        tap(devices => this.devices.set(devices))
      );
    }

    console.log('📡 Fetching devices from Supabase via direct fetch...');
    
    // Direct fetch workaround - Supabase JS client promises don't resolve
    const token = this.getValidToken();
    if (!token) {
      console.warn('⚠️ No valid auth token found, using mock data');
      this.devices.set(MOCK_DEVICES);
      return of(MOCK_DEVICES);
    }
    
    return from(
      fetch(`${environment.supabase.url}/rest/v1/devices?order=created_at.desc`, {
        headers: {
          'apikey': environment.supabase.anonKey,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      })
      .then(res => {
        console.log('📥 Fetch response status:', res.status);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
    ).pipe(
      tap(data => console.log('✅ Supabase returned data:', data)),
      map((data: any[]) => {
        const devices = data.map(this.mapDeviceFromDb);
        console.log('✅ Mapped devices:', devices);
        return devices;
      }),
      tap(devices => {
        console.log('📝 Setting devices signal with:', devices);
        this.devices.set(devices);
      }),
      catchError(error => {
        console.error('❌ Error loading devices:', error);
        // Fallback na mock dáta pri chybe
        this.devices.set(MOCK_DEVICES);
        return of(MOCK_DEVICES);
      })
    );
  }

  /**
   * Mapovať device z databázy na model
   */
  private mapDeviceFromDb(dbDevice: any): Device {
    return {
      id: dbDevice.id,
      name: dbDevice.name,
      type: dbDevice.type,
      manufacturer: dbDevice.manufacturer,
      location: dbDevice.location,
      status: dbDevice.status,
      imageUrl: dbDevice.image_url,
      manualUrl: dbDevice.manual_url,
      lastMaintenance: dbDevice.last_maintenance,
      nextMaintenance: dbDevice.next_maintenance,
      maintenancePeriod: dbDevice.maintenance_period,
      specifications: dbDevice.specifications,
      downtime: dbDevice.downtime,
      lastStatusChange: dbDevice.last_status_change,
      electricalInspectionDate: dbDevice.electrical_inspection_date,
      electricalInspectionPeriod: dbDevice.electrical_inspection_period,
      electricalInspectionExpiry: dbDevice.electrical_inspection_expiry,
    };
  }

  /**
   * Pridať nové zariadenie
   */
  addDevice(device: Device): Observable<Device> {
    if (environment.enableMockData) {
      const newDevice: Device = {
        ...device,
        id: device.id || `device-${Date.now()}`
      };
      this.devices.update(devices => [newDevice, ...devices]);
      return of(newDevice).pipe(delay(300));
    }

    console.log('📤 Adding new device via direct fetch:', device);
    const token = this.getValidToken();
    if (!token) {
      console.warn('⚠️ No valid auth token found');
      throw new Error('Vaše prihlásenie vypršalo. Prosím prihláste sa znova.');
    }

    return from(
      fetch(`${environment.supabase.url}/rest/v1/devices`, {
        method: 'POST',
        headers: {
          'apikey': environment.supabase.anonKey,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({
          id: device.id,
          name: device.name,
          type: device.type,
          manufacturer: device.manufacturer || null,
          location: device.location,
          status: device.status,
          image_url: device.imageUrl || null,
          manual_url: device.manualUrl || null,
          last_maintenance: device.lastMaintenance,
          next_maintenance: device.nextMaintenance,
          maintenance_period: device.maintenancePeriod || null,
          specifications: device.specifications || null,
          electrical_inspection_date: device.electricalInspectionDate || null,
          electrical_inspection_period: device.electricalInspectionPeriod || null,
          electrical_inspection_expiry: device.electricalInspectionExpiry || null,
          downtime: device.downtime,
          last_status_change: device.lastStatusChange,
        }),
      })
      .then(async res => {
        console.log('📥 Add device response status:', res.status);
        const responseText = await res.text();
        console.log('📥 Response body:', responseText);
        
        if (!res.ok) {
          console.error('❌ Server error response:', responseText);
          throw new Error(`HTTP ${res.status}: ${responseText}`);
        }
        
        return responseText ? JSON.parse(responseText) : null;
      })
    ).pipe(
      tap(data => console.log('✅ Device added:', data)),
      map((data: any[]) => {
        if (data && data.length > 0) {
          return this.mapDeviceFromDb(data[0]);
        }
        throw new Error('No data returned');
      }),
      tap(newDevice => {
        console.log('📝 Updating local devices signal');
        this.devices.update(devices => [newDevice, ...devices]);
      }),
      catchError(error => {
        console.error('❌ Error adding device:', error);
        throw error;
      })
    );
  }

  /**
   * Získať detail zariadenia podľa ID
   */
  getDeviceById(id: string): Observable<Device | undefined> {
    if (environment.enableMockData) {
      const device = this.devices().find(d => d.id === id);
      return of(device).pipe(delay(200));
    }

    return from(
      this.supabaseService.db
        .from('devices')
        .select('*')
        .eq('id', id)
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data ? this.mapDeviceFromDb(data) : undefined;
      }),
      catchError(error => {
        console.error('Error loading device:', error);
        const device = this.devices().find(d => d.id === id);
        return of(device);
      })
    );
  }

  /**
   * Aktualizovať stav zariadenia
   */
  updateDeviceStatus(deviceId: string, newStatus: Device['status']): Observable<Device> {
    const updateLocal = () => {
      this.devices.update(devices => {
        return devices.map(device => {
          if (device.id === deviceId && device.status !== newStatus) {
            const now = new Date();
            let newDowntime = device.downtime;

            if ((device.status === 'maintenance' || device.status === 'offline') && newStatus === 'operational') {
              const lastChangeDate = new Date(device.lastStatusChange);
              const diffMs = now.getTime() - lastChangeDate.getTime();
              const diffHours = diffMs / (1000 * 60 * 60);
              newDowntime += diffHours;
            }

            return {
              ...device,
              status: newStatus,
              downtime: parseFloat(newDowntime.toFixed(2)),
              lastStatusChange: now.toISOString(),
            };
          }
          return device;
        });
      });
    };

    if (environment.enableMockData) {
      updateLocal();
      const device = this.devices().find(d => d.id === deviceId);
      return of(device!).pipe(delay(300));
    }

    console.log('🔄 Updating device status via direct fetch...');
    const token = localStorage.getItem('supabase.auth.token');
    if (!token) {
      console.warn('⚠️ No auth token found');
      updateLocal();
      const device = this.devices().find(d => d.id === deviceId);
      return of(device!);
    }

    const tokenData = JSON.parse(token);
    const device = this.devices().find(d => d.id === deviceId);
    
    if (!device) {
      console.error('❌ Device not found:', deviceId);
      return of(null as any);
    }

    const now = new Date();
    let newDowntime = device.downtime;

    if ((device.status === 'maintenance' || device.status === 'offline') && newStatus === 'operational') {
      const lastChangeDate = new Date(device.lastStatusChange);
      const diffMs = now.getTime() - lastChangeDate.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      newDowntime += diffHours;
    }

    const updateData = {
      status: newStatus,
      downtime: parseFloat(newDowntime.toFixed(2)),
      last_status_change: now.toISOString(),
    };

    console.log('📤 Sending update:', updateData);

    return from(
      fetch(`${environment.supabase.url}/rest/v1/devices?id=eq.${deviceId}`, {
        method: 'PATCH',
        headers: {
          'apikey': environment.supabase.anonKey,
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(updateData),
      })
      .then(res => {
        console.log('📥 Update response status:', res.status);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
    ).pipe(
      tap(data => console.log('✅ Update response:', data)),
      map((data: any[]) => {
        if (data && data.length > 0) {
          return this.mapDeviceFromDb(data[0]);
        }
        // Fallback - vrátiť updatnutý device z lokálneho stavu
        return {
          ...device,
          status: newStatus,
          downtime: parseFloat(newDowntime.toFixed(2)),
          lastStatusChange: now.toISOString(),
        };
      }),
      tap(updatedDevice => {
        console.log('📝 Updating local devices signal');
        this.devices.update(devices =>
          devices.map(d => d.id === deviceId ? updatedDevice : d)
        );
      }),
            catchError(error => {
        console.error('❌ Error updating device status:', error);
        updateLocal();
        const device = this.devices().find(d => d.id === deviceId);
        return of(device!);
      })
    );
  }

  /**
   * Aktualizovať elektrickú revíziu zariadenia
   */
  updateElectricalInspection(
    deviceId: string, 
    inspectionDate: string, 
    period: 1 | 2 | 3 | 4 | 5 | 10
  ): Observable<Device> {
    // Vypočítať expiráciu (dátum + počet rokov)
    const inspectionDateObj = new Date(inspectionDate);
    const expiryDate = new Date(inspectionDateObj);
    expiryDate.setFullYear(expiryDate.getFullYear() + period);
    const expiryDateString = expiryDate.toISOString().split('T')[0];

    const updateLocal = () => {
      this.devices.update(devices => {
        return devices.map(device => {
          if (device.id === deviceId) {
            return {
              ...device,
              electricalInspectionDate: inspectionDate,
              electricalInspectionPeriod: period,
              electricalInspectionExpiry: expiryDateString,
            };
          }
          return device;
        });
      });
    };

    if (environment.enableMockData) {
      updateLocal();
      const device = this.devices().find(d => d.id === deviceId);
      return of(device!).pipe(delay(300));
    }

    console.log('🔄 Updating electrical inspection via direct fetch...');
    const token = localStorage.getItem('supabase.auth.token');
    if (!token) {
      console.warn('⚠️ No auth token found');
      updateLocal();
      const device = this.devices().find(d => d.id === deviceId);
      return of(device!);
    }

    const tokenData = JSON.parse(token);
    const updateData = {
      electrical_inspection_date: inspectionDate,
      electrical_inspection_period: period,
      electrical_inspection_expiry: expiryDateString,
    };

    console.log('📤 Sending inspection update:', updateData);

    return from(
      fetch(`${environment.supabase.url}/rest/v1/devices?id=eq.${deviceId}`, {
        method: 'PATCH',
        headers: {
          'apikey': environment.supabase.anonKey,
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(updateData),
      })
      .then(res => {
        console.log('📥 Inspection update response status:', res.status);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
    ).pipe(
      tap(data => console.log('✅ Inspection update response:', data)),
      map((data: any[]) => {
        if (data && data.length > 0) {
          return this.mapDeviceFromDb(data[0]);
        }
        // Fallback
        const device = this.devices().find(d => d.id === deviceId);
        return {
          ...device!,
          electricalInspectionDate: inspectionDate,
          electricalInspectionPeriod: period,
          electricalInspectionExpiry: expiryDateString,
        };
      }),
      tap(updatedDevice => {
        console.log('📝 Updating local devices signal with inspection data');
        this.devices.update(devices =>
          devices.map(d => d.id === deviceId ? updatedDevice : d)
        );
      }),
      catchError(error => {
        console.error('❌ Error updating electrical inspection:', error);
        updateLocal();
        const device = this.devices().find(d => d.id === deviceId);
        return of(device!);
      })
    );
  }

  /**
   * Vymazať zariadenie (vyradiť)
   */
  deleteDevice(deviceId: string): Observable<void> {
    if (environment.enableMockData) {
      this.devices.update(devices => devices.filter(d => d.id !== deviceId));
      return of(void 0).pipe(delay(300));
    }

    console.log('🗑️ Deleting device via direct fetch:', deviceId);
    const token = localStorage.getItem('supabase.auth.token');
    if (!token) {
      console.warn('⚠️ No auth token found');
      return of(void 0);
    }

    const tokenData = JSON.parse(token);

    return from(
      fetch(`${environment.supabase.url}/rest/v1/devices?id=eq.${deviceId}`, {
        method: 'DELETE',
        headers: {
          'apikey': environment.supabase.anonKey,
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json',
        },
      })
      .then(res => {
        console.log('📥 Delete response status:', res.status);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return;
      })
    ).pipe(
      tap(() => console.log('✅ Device deleted from database')),
      tap(() => {
        console.log('📝 Removing device from local signal');
        this.devices.update(devices => devices.filter(d => d.id !== deviceId));
      }),
      map(() => void 0),
      catchError(error => {
        console.error('❌ Error deleting device:', error);
        throw error;
      })
    );
  }

  /**
   * Vymazať náhradný diel
   */
  deletePart(partId: string): Observable<void> {
    if (environment.enableMockData) {
      this.parts.update(parts => parts.filter(p => p.id !== partId));
      return of(void 0).pipe(delay(300));
    }

    console.log('🗑️ Deleting spare part via direct fetch:', partId);
    const token = localStorage.getItem('supabase.auth.token');
    if (!token) {
      console.warn('⚠️ No auth token found');
      return of(void 0);
    }

    const tokenData = JSON.parse(token);

    return from(
      fetch(`${environment.supabase.url}/rest/v1/spare_parts?id=eq.${partId}`, {
        method: 'DELETE',
        headers: {
          'apikey': environment.supabase.anonKey,
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json',
        },
      })
      .then(res => {
        console.log('📥 Delete part response status:', res.status);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return;
      })
    ).pipe(
      tap(() => console.log('✅ Spare part deleted from database')),
      tap(() => {
        console.log('📝 Removing part from local signal');
        this.parts.update(parts => parts.filter(p => p.id !== partId));
      }),
      map(() => void 0),
      catchError(error => {
        console.error('❌ Error deleting spare part:', error);
        throw error;
      })
    );
  }

  /**
   * Nahrať PDF manuál pre zariadenie do Supabase Storage
   */
  uploadDeviceManual(deviceId: string, file: File): Observable<string> {
    if (environment.enableMockData) {
      return of('mock-manual-url').pipe(delay(500));
    }

    console.log('📤 Uploading manual for device:', deviceId, 'File:', file.name);
    const token = localStorage.getItem('supabase.auth.token');
    if (!token) {
      console.warn('⚠️ No auth token found');
      throw new Error('Authentication required');
    }

    const tokenData = JSON.parse(token);
    const fileName = `${deviceId}_${Date.now()}.pdf`;
    const filePath = `manuals/${fileName}`;

    // Upload súboru do Supabase Storage
    return from(
      fetch(`${environment.supabase.url}/storage/v1/object/device-manuals/${filePath}`, {
        method: 'POST',
        headers: {
          'apikey': environment.supabase.anonKey,
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Content-Type': file.type,
        },
        body: file,
      })
      .then(async res => {
        console.log('📥 Upload response status:', res.status);
        const responseText = await res.text();
        console.log('📥 Upload response:', responseText);
        
        if (!res.ok) {
          throw new Error(`Upload failed: ${res.status} - ${responseText}`);
        }
        
        // Získať verejnú URL
        const publicUrl = `${environment.supabase.url}/storage/v1/object/public/device-manuals/${filePath}`;
        console.log('✅ Manual uploaded, public URL:', publicUrl);
        
        // Aktualizovať zariadenie s novou URL
        return fetch(`${environment.supabase.url}/rest/v1/devices?id=eq.${deviceId}`, {
          method: 'PATCH',
          headers: {
            'apikey': environment.supabase.anonKey,
            'Authorization': `Bearer ${tokenData.access_token}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
          },
          body: JSON.stringify({ manual_url: publicUrl }),
        });
      })
      .then(async res => {
        if (!res.ok) throw new Error(`Failed to update device: ${res.status}`);
        const data = await res.json();
        console.log('✅ Device updated with manual URL');
        
        // Aktualizovať lokálny signal
        if (data && data.length > 0) {
          const updatedDevice = this.mapDeviceFromDb(data[0]);
          this.devices.update(devices =>
            devices.map(d => d.id === deviceId ? updatedDevice : d)
          );
        }
        
        return data[0].manual_url;
      })
    ).pipe(
      catchError(error => {
        console.error('❌ Error uploading manual:', error);
        throw error;
      })
    );
  }

  /**
   * Nahrať fotku zariadenia do Supabase Storage
   */
  uploadDeviceImage(deviceId: string, file: File): Observable<string> {
    if (environment.enableMockData) {
      return of('mock-image-url').pipe(delay(500));
    }

    console.log('📤 Uploading image for device:', deviceId, 'File:', file.name);
    const token = localStorage.getItem('supabase.auth.token');
    if (!token) {
      console.warn('⚠️ No auth token found');
      throw new Error('Authentication required');
    }

    const tokenData = JSON.parse(token);
    const fileExt = file.name.split('.').pop();
    const fileName = `${deviceId}_${Date.now()}.${fileExt}`;
    const filePath = `images/${fileName}`;

    // Upload súboru do Supabase Storage
    return from(
      fetch(`${environment.supabase.url}/storage/v1/object/device-manuals/${filePath}`, {
        method: 'POST',
        headers: {
          'apikey': environment.supabase.anonKey,
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Content-Type': file.type,
        },
        body: file,
      })
      .then(async res => {
        console.log('📥 Upload image response status:', res.status);
        const responseText = await res.text();
        console.log('📥 Upload image response:', responseText);
        
        if (!res.ok) {
          throw new Error(`Upload failed: ${res.status} - ${responseText}`);
        }
        
        // Získať verejnú URL
        const publicUrl = `${environment.supabase.url}/storage/v1/object/public/device-manuals/${filePath}`;
        console.log('✅ Image uploaded, public URL:', publicUrl);
        
        // Aktualizovať zariadenie s novou URL
        return fetch(`${environment.supabase.url}/rest/v1/devices?id=eq.${deviceId}`, {
          method: 'PATCH',
          headers: {
            'apikey': environment.supabase.anonKey,
            'Authorization': `Bearer ${tokenData.access_token}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
          },
          body: JSON.stringify({ image_url: publicUrl }),
        });
      })
      .then(async res => {
        if (!res.ok) throw new Error(`Failed to update device: ${res.status}`);
        const data = await res.json();
        console.log('✅ Device updated with image URL');
        
        // Aktualizovať lokálny signal
        if (data && data.length > 0) {
          const updatedDevice = this.mapDeviceFromDb(data[0]);
          this.devices.update(devices =>
            devices.map(d => d.id === deviceId ? updatedDevice : d)
          );
        }
        
        return data[0].image_url;
      })
    ).pipe(
      catchError(error => {
        console.error('❌ Error uploading image:', error);
        throw error;
      })
    );
  }

  // ========== SPARE PARTS ==========
  
  getPartsSignal() {
    return this.parts.asReadonly();
  }

  getParts(): Observable<SparePart[]> {
    if (environment.enableMockData) {
      return of(this.parts()).pipe(delay(300));
    }

    console.log('📡 Fetching spare parts from Supabase...');
    const token = localStorage.getItem('supabase.auth.token');
    if (!token) {
      console.warn('⚠️ No auth token found for parts');
      return of(this.parts());
    }

    const tokenData = JSON.parse(token);
    
    return from(
      fetch(`${environment.supabase.url}/rest/v1/spare_parts?select=*,devices:device_id(name,type)&order=created_at.desc`, {
        headers: {
          'apikey': environment.supabase.anonKey,
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json',
        }
      }).then(res => res.json())
    ).pipe(
      tap(data => console.log('✅ Parts data:', data)),
      map((data: any[]) => (data || []).map(part => this.mapPartFromDb(part))),
      tap(parts => this.parts.set(parts)),
      catchError(error => {
        console.error('❌ Error loading parts:', error);
        return of(this.parts());
      })
    );
  }

  /**
   * Mapovať spare part z databázy na model
   */
  private mapPartFromDb(dbPart: any): SparePart {
    return {
      id: dbPart.id,
      name: dbPart.name,
      sku: dbPart.sku,
      quantity: dbPart.quantity,
      minQuantity: dbPart.min_quantity || 10,
      location: dbPart.location,
      deviceId: dbPart.device_id || undefined,
      deviceName: dbPart.devices?.name || dbPart.device_name || undefined,
      deviceType: dbPart.devices?.type || undefined,
    };
  }

  /**
   * Aktualizovať množstvo náhradného dielu
   */
  updatePartQuantity(partId: string, newQuantity: number, notes?: string, changeType: 'increase' | 'decrease' | 'set' = 'set'): Observable<SparePart> {
    if (environment.enableMockData) {
      this.parts.update(parts =>
        parts.map(p => p.id === partId ? { ...p, quantity: newQuantity } : p)
      );
      const part = this.parts().find(p => p.id === partId);
      return of(part!).pipe(delay(300));
    }

    console.log('🔄 Updating part quantity via direct fetch:', { partId, newQuantity, notes, changeType });
    const token = localStorage.getItem('supabase.auth.token');
    if (!token) {
      console.warn('⚠️ No auth token found');
      return of(null as any);
    }

    const tokenData = JSON.parse(token);
    const currentPart = this.parts().find(p => p.id === partId);
    
    if (!currentPart) {
      console.error('❌ Part not found:', partId);
      return of(null as any);
    }

    const quantityBefore = currentPart.quantity;

    return from(
      fetch(`${environment.supabase.url}/rest/v1/spare_parts?id=eq.${partId}`, {
        method: 'PATCH',
        headers: {
          'apikey': environment.supabase.anonKey,
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({ quantity: newQuantity }),
      })
      .then(async res => {
        console.log('📥 Update part response status:', res.status);
        const responseText = await res.text();
        console.log('📥 Response body:', responseText);
        
        if (!res.ok) {
          console.error('❌ Server error response:', responseText);
          throw new Error(`HTTP ${res.status}: ${responseText}`);
        }
        
        return responseText ? JSON.parse(responseText) : null;
      })
    ).pipe(
      tap(data => console.log('✅ Part quantity updated:', data)),
      map((data: any[]) => {
        if (data && data.length > 0) {
          return this.mapPartFromDb(data[0]);
        }
        throw new Error('No data returned');
      }),
      tap(updatedPart => {
        console.log('📝 Updating local parts signal');
        this.parts.update(parts =>
          parts.map(p => p.id === partId ? updatedPart : p)
        );

        // Zaznamenať do histórie
        const currentUser = localStorage.getItem('currentUser');
        const userEmail = currentUser ? JSON.parse(currentUser).email : 'unknown';
        
        console.log('📝 Creating history record with user:', userEmail);
        
        fetch(`${environment.supabase.url}/rest/v1/spare_parts_history`, {
          method: 'POST',
          headers: {
            'apikey': environment.supabase.anonKey,
            'Authorization': `Bearer ${tokenData.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            part_id: partId,
            part_name: currentPart.name,
            quantity_before: quantityBefore,
            quantity_after: newQuantity,
            change_type: changeType,
            notes: notes || null,
            changed_by: userEmail,
          }),
        })
        .then(res => {
          if (res.ok) {
            console.log('✅ History record created');
          } else {
            console.warn('⚠️ Failed to create history record');
          }
        })
        .catch(err => console.warn('⚠️ History save error:', err));
      }),
      catchError(error => {
        console.error('❌ Error updating part quantity:', error);
        throw error;
      })
    );
  }

  /**
   * Získať poslednú zmenu pre náhradný diel
   */
  getPartLastChange(partId: string): Observable<any> {
    if (environment.enableMockData) {
      return of(null);
    }

    const token = localStorage.getItem('supabase.auth.token');
    if (!token) return of(null);

    const tokenData = JSON.parse(token);

    return from(
      fetch(`${environment.supabase.url}/rest/v1/spare_parts_history?part_id=eq.${partId}&order=created_at.desc&limit=1`, {
        headers: {
          'apikey': environment.supabase.anonKey,
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json',
        }
      }).then(res => res.json())
    ).pipe(
      map((data: any[]) => data && data.length > 0 ? data[0] : null),
      catchError(() => of(null))
    );
  }

  /**
   * Pridať nový náhradný diel
   */
  addPart(part: Omit<SparePart, 'id'>): Observable<SparePart> {
    if (environment.enableMockData) {
      const newPart: SparePart = {
        ...part,
        id: `sp-${Date.now()}`
      };
      this.parts.update(parts => [newPart, ...parts]);
      return of(newPart).pipe(delay(300));
    }

    console.log('📤 Adding new part via direct fetch:', part);
    const token = localStorage.getItem('supabase.auth.token');
    if (!token) {
      console.warn('⚠️ No auth token found');
      return of(null as any);
    }

    const tokenData = JSON.parse(token);

    return from(
      fetch(`${environment.supabase.url}/rest/v1/spare_parts`, {
        method: 'POST',
        headers: {
          'apikey': environment.supabase.anonKey,
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({
          name: part.name,
          sku: part.sku,
          quantity: part.quantity,
          min_quantity: part.minQuantity || 10,
          location: part.location,
          device_id: part.deviceId || null,
          device_name: part.deviceName || null,
        }),
      })
      .then(async res => {
        console.log('📥 Add part response status:', res.status);
        const responseText = await res.text();
        console.log('📥 Response body:', responseText);
        
        if (!res.ok) {
          console.error('❌ Server error response:', responseText);
          
          // Parse error for user-friendly message
          try {
            const errorData = JSON.parse(responseText);
            if (errorData.code === '23505' && errorData.message?.includes('spare_parts_sku_key')) {
              throw new Error('SKU už existuje. Použite iné SKU pre tento diel.');
            }
          } catch (parseError) {
            // If parsing fails, throw generic error
          }
          
          throw new Error(`HTTP ${res.status}: ${responseText}`);
        }
        
        return responseText ? JSON.parse(responseText) : null;
      })
    ).pipe(
      tap(data => console.log('✅ Part added:', data)),
      map((data: any[]) => {
        if (data && data.length > 0) {
          return this.mapPartFromDb(data[0]);
        }
        throw new Error('No data returned');
      }),
      tap(newPart => {
        console.log('📝 Updating local parts signal');
        this.parts.update(parts => [newPart, ...parts]);
      }),
      catchError(error => {
        console.error('❌ Error adding part:', error);
        throw error;
      })
    );
  }

  // ========== MAINTENANCE LOGS ==========

  getMaintenanceLogsSignal() {
    return this.logs.asReadonly();
  }

  getMaintenanceLogs(): Observable<MaintenanceLog[]> {
    if (environment.enableMockData) {
      return of(this.logs()).pipe(delay(300));
    }

    console.log('📡 Fetching maintenance logs from Supabase...');
    const token = localStorage.getItem('supabase.auth.token');
    if (!token) {
      console.warn('⚠️ No auth token found for logs');
      return of(this.logs());
    }

    const tokenData = JSON.parse(token);
    
    return from(
      fetch(`${environment.supabase.url}/rest/v1/maintenance_logs?order=created_at.desc`, {
        headers: {
          'apikey': environment.supabase.anonKey,
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json',
        }
      }).then(res => res.json())
    ).pipe(
      tap(data => console.log('✅ Logs data:', data)),
      map((data: any[]) => (data || []).map(this.mapLogFromDb)),
      tap(logs => this.logs.set(logs)),
      catchError(error => {
        console.error('❌ Error loading logs:', error);
        return of(this.logs());
      })
    );
  }

  /**
   * Mapovať maintenance log z databázy na model
   */
  private mapLogFromDb(dbLog: any): MaintenanceLog {
    return {
      id: dbLog.id,
      deviceId: dbLog.device_id,
      deviceName: dbLog.device_name,
      date: dbLog.date,
      technician: dbLog.technician,
      notes: dbLog.notes,
      type: dbLog.type,
      durationMinutes: dbLog.duration_minutes || 0,
    };
  }

  /**
   * Pridať nový maintenance log
   */
  addMaintenanceLog(log: Omit<MaintenanceLog, 'id'>): Observable<MaintenanceLog> {
    const createLocal = () => {
      const newLog: MaintenanceLog = {
        ...log,
        id: `log-${Date.now()}`
      };
      this.logs.update(logs => [newLog, ...logs]);
      this.devices.update(devices => 
        devices.map(d => d.id === log.deviceId ? {...d, lastMaintenance: new Date().toISOString().split('T')[0]} : d)
      );
      return newLog;
    };

    if (environment.enableMockData) {
      const newLog = createLocal();
      return of(newLog).pipe(delay(500));
    }

    return from(
      this.supabaseService.db
        .from('maintenance_logs')
        .insert({
          device_id: log.deviceId,
          device_name: log.deviceName,
          date: log.date,
          technician: log.technician,
          notes: log.notes,
          type: log.type,
          duration_minutes: log.durationMinutes,
        } as any)
        .select()
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return this.mapLogFromDb(data);
      }),
      tap(newLog => {
        this.logs.update(logs => [newLog, ...logs]);
        
        // Aktualizovať last_maintenance dátum v zariadení
        from(
          this.supabaseService.db
            .from('devices')
            // @ts-ignore - Supabase type issue
            .update({ last_maintenance: new Date().toISOString().split('T')[0] })
            .eq('id', log.deviceId)
        ).subscribe();

        this.devices.update(devices => 
          devices.map(d => d.id === log.deviceId ? {...d, lastMaintenance: new Date().toISOString().split('T')[0]} : d)
        );
      }),
      catchError(error => {
        console.error('Error adding maintenance log:', error);
        const newLog = createLocal();
        return of(newLog);
      })
    );
  }

  deleteMaintenanceLog(logId: string): Observable<void> {
    console.log('🗑️ DataService.deleteMaintenanceLog() called for:', logId);
    
    const deleteLocal = () => {
      this.logs.update(logs => logs.filter(log => log.id !== logId));
    };

    if (environment.enableMockData) {
      deleteLocal();
      return of(void 0).pipe(delay(300));
    }

    const token = localStorage.getItem('supabase.auth.token');
    if (!token) {
      console.warn('⚠️ No auth token found');
      return of(void 0);
    }

    const tokenData = JSON.parse(token);
    
    return from(
      fetch(`${environment.supabase.url}/rest/v1/maintenance_logs?id=eq.${logId}`, {
        method: 'DELETE',
        headers: {
          'apikey': environment.supabase.anonKey,
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json',
        }
      })
      .then(res => {
        console.log('📥 Delete response status:', res.status);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return;
      })
    ).pipe(
      tap(() => {
        console.log('✅ Maintenance log deleted from Supabase');
        deleteLocal();
      }),
      map(() => void 0),
      catchError(error => {
        console.error('❌ Error deleting maintenance log:', error);
        throw error;
      })
    );
  }
}

