import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { DataService } from '../../../services/data.service';
import { AuthService } from '../../../services/auth.service';
import { TranslatePipe } from '../../../pipes/translate.pipe';

@Component({
  selector: 'app-maintenance-list',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './maintenance-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MaintenanceListComponent {
  private dataService = inject(DataService);
  authService = inject(AuthService);
  
  logs = toSignal(this.dataService.getMaintenanceLogs(), { initialValue: [] });
  filterType = signal<'all' | 'scheduled' | 'emergency'>('all');

  filteredLogs = computed(() => {
    const type = this.filterType();
    if (type === 'all') {
      return this.logs();
    }
    return this.logs().filter(log => log.type === type);
  });

  setFilter(type: 'all' | 'scheduled' | 'emergency') {
    this.filterType.set(type);
  }

  deleteLog(logId: string, deviceName: string) {
    if (!confirm(`Naozaj chcete vymazať záznam údržby pre zariadenie "${deviceName}"?`)) {
      return;
    }

    this.dataService.deleteMaintenanceLog(logId).subscribe({
      next: () => {
        console.log('✅ Maintenance log deleted:', logId);
        // Reload logs to reflect the deletion
        this.dataService.getMaintenanceLogs().subscribe();
      },
      error: (err) => {
        console.error('❌ Error deleting maintenance log:', err);
        alert('Chyba pri mazaní záznamu: ' + err.message);
      }
    });
  }
}
