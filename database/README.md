# Database Migration Scripts

Tento adresár obsahuje všetky SQL migračné skripty pre Supabase databázu.

## 🚀 Spustenie skriptov

1. Otvorte [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql)
2. Skopírujte obsah skriptu
3. Vložte do SQL Editora
4. Kliknite na "Run"

## 📋 Poradie spustenia

Spúšťajte skripty v tomto poradí pre novú databázu:

### 1. Základná schéma

```bash
supabase-schema.sql
```

Vytvorí všetky základné tabuľky (devices, spare_parts, maintenance_logs, spare_parts_history)

### 2. Custom ID pre zariadenia

```bash
supabase-devices-custom-id.sql
```

Zmení ID zariadení na TEXT pre vlastné identifikátory (napr. "CNC-001")

### 3. Pridanie údržbovej periódy

```bash
supabase-add-maintenance-period.sql
```

Pridá stĺpec `maintenance_period` (monthly, quarterly, semi-annually, annually)

### 4. Pridanie špecifikácií

```bash
supabase-add-specifications.sql
```

Pridá stĺpec `specifications` (JSONB) pre technické parametre zariadení

### 5. Pridanie výrobcu

```bash
supabase-add-manufacturer.sql
```

Pridá stĺpec `manufacturer` a `image_url` pre výrobcu a fotky zariadení

### 6. Pridanie dĺžky údržby

```bash
supabase-add-duration.sql
```

Pridá stĺpec `duration_minutes` do maintenance_logs (minimum 15 minút)

### 7. Pridanie priradenia dielov k zariadeniam

```bash
supabase-add-device-to-parts.sql
```

Pridá stĺpce `device_id` a `device_name` do spare_parts

### 8. Pridanie histórie dielov

```bash
supabase-parts-history.sql
```

Vytvorí tabuľku `spare_parts_history` pre audit trail

### 9. Pridanie elektrickej revízie

```bash
supabase-add-electrical-inspection.sql
```

Pridá stĺpce pre sledovanie platnosti elektrických revízií

### 10. Storage pre PDF manuály

```bash
supabase-storage-manuals.sql
```

Vytvorí bucket `device-manuals` pre ukladanie PDF súborov

### 11. Pridanie minimálneho množstva

```bash
supabase-add-min-quantity.sql
```

Pridá stĺpec `min_quantity` pre dynamické upozornenia na nízky stav zásob

### 12. Test dáta (voliteľné)

```bash
supabase-test-data.sql
```

Vloží ukážkové zariadenia, diely a záznamy údržby

## 📊 Štruktúra databázy po migrácii

### devices

```sql
CREATE TABLE devices (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  manufacturer TEXT,
  location TEXT NOT NULL,
  status TEXT CHECK (status IN ('operational', 'maintenance', 'offline')),
  image_url TEXT,
  manual_url TEXT,
  last_maintenance DATE,
  next_maintenance DATE,
  maintenance_period VARCHAR(20),
  specifications JSONB,
  electrical_inspection_date DATE,
  electrical_inspection_period INTEGER,
  electrical_inspection_expiry DATE,
  downtime NUMERIC DEFAULT 0,
  last_status_change TIMESTAMP DEFAULT NOW()
);
```

### spare_parts

```sql
CREATE TABLE spare_parts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  quantity INTEGER NOT NULL,
  min_quantity INTEGER NOT NULL DEFAULT 10,
  location TEXT NOT NULL,
  device_id TEXT REFERENCES devices(id),
  device_name TEXT
);
```

### maintenance_logs

```sql
CREATE TABLE maintenance_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id TEXT REFERENCES devices(id) ON DELETE CASCADE,
  device_name TEXT NOT NULL,
  date DATE NOT NULL,
  technician TEXT NOT NULL,
  notes TEXT NOT NULL,
  type TEXT CHECK (type IN ('scheduled', 'emergency')),
  duration_minutes INTEGER CHECK (duration_minutes >= 15),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### spare_parts_history

```sql
CREATE TABLE spare_parts_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  part_id UUID REFERENCES spare_parts(id) ON DELETE CASCADE,
  part_name TEXT NOT NULL,
  quantity_before INTEGER NOT NULL,
  quantity_after INTEGER NOT NULL,
  change_type TEXT CHECK (change_type IN ('increase', 'decrease', 'set')),
  notes TEXT,
  changed_by TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🔄 Aktualizácia existujúcej databázy

Ak už máte databázu a chcete pridať novú funkcionalitu:

1. Identifikujte ktorý skript potrebujete (napr. pridanie špecifikácií)
2. Spustite len tento konkrétny skript
3. Overte že aplikácia funguje správne

## 🛡️ Row Level Security (RLS)

Aktuálne je RLS vypnuté pre jednoduchosť vývoja:

```sql
ALTER TABLE devices DISABLE ROW LEVEL SECURITY;
ALTER TABLE spare_parts DISABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE spare_parts_history DISABLE ROW LEVEL SECURITY;
```

Pre produkčné nasadenie odporúčame zapnúť RLS a vytvoriť politiky podľa rolí.

## 📝 Poznámky

- Všetky skripty používajú `IF NOT EXISTS` / `IF EXISTS` na bezpečné opakovanie
- ID zariadení sú TEXT pre vlastné identifikátory (QR kódy)
- JSONB stĺpce používajú GIN index pre rýchle vyhľadávanie
- Všetky tabuľky majú `created_at` TIMESTAMP pre audit trail

## 🔧 Rollback

Ak potrebujete vrátiť zmeny:

```sql
-- Príklad: Odstránenie stĺpca specifications
ALTER TABLE devices DROP COLUMN IF EXISTS specifications;
DROP INDEX IF EXISTS idx_devices_specifications_gin;
```

## 💡 Tipy

- Pred spustením skriptu si pozrite jeho obsah
- Test dáta sú voliteľné, použite len pre vývoj
- Backup databázy pred migráciou: Project Settings > Database > Backups
- SQL Editor ukladá históriu dotazov

## 📚 Ďalšie zdroje

- [Supabase SQL Editor](https://supabase.com/docs/guides/database/overview)
- [PostgreSQL Dokumentácia](https://www.postgresql.org/docs/)
- [JSONB v PostgreSQL](https://www.postgresql.org/docs/current/datatype-json.html)
