-- SQL skript na zmenu prihlasovacích údajov používateľov
-- Spusti tento skript v Supabase SQL editore: https://qqkcnogssccsekhemyua.supabase.co/project/_/sql

-- POZNÁMKA: Nahraď nasledujúce hodnoty svojimi požadovanými údajmi:
-- - NOVY_ADMIN_EMAIL@example.com -> tvoj nový admin email
-- - NOVY_TECHNICIAN_EMAIL@example.com -> tvoj nový technician email
-- - NOVE_HESLO -> tvoje nové heslo (musí byť min. 6 znakov)

-- 1. Najprv si zobraz existujúcich používateľov
SELECT id, email, raw_user_meta_data->>'role' as role 
FROM auth.users;

-- 2. Aktualizuj admin používateľa
-- Poznámka: UUID musíš získať z výsledku vyššie uvedeného SELECT príkazu
UPDATE auth.users 
SET 
  email = 'NOVY_ADMIN_EMAIL@example.com',
  raw_user_meta_data = jsonb_set(raw_user_meta_data, '{role}', '"admin"'),
  encrypted_password = crypt('NOVE_HESLO', gen_salt('bf'))
WHERE raw_user_meta_data->>'role' = 'admin';

-- 3. Aktualizuj technician používateľa
UPDATE auth.users 
SET 
  email = 'NOVY_TECHNICIAN_EMAIL@example.com',
  raw_user_meta_data = jsonb_set(raw_user_meta_data, '{role}', '"technician"'),
  encrypted_password = crypt('NOVE_HESLO', gen_salt('bf'))
WHERE raw_user_meta_data->>'role' = 'technician';

-- 4. Overiť zmeny
SELECT id, email, raw_user_meta_data->>'role' as role 
FROM auth.users;

-- ALTERNATÍVA: Vymazať starých používateľov a vytvoriť nových
-- Ak vyššie uvedený UPDATE nefunguje, použi tento prístup:

-- 1. Vymaž existujúcich používateľov (POZOR: toto vymaže všetkých používateľov!)
-- DELETE FROM auth.users;

-- 2. Vytvor nových používateľov pomocou Supabase Dashboard:
--    - Choď do Authentication > Users
--    - Klikni "Add user" > "Create new user"
--    - Vyplň email a heslo
--    - V "User Metadata" pridaj: {"role": "admin"} alebo {"role": "technician"}
--    - Potvrď vytvorenie

-- Alebo použi tento INSERT príkaz (vyžaduje UUID extension):
-- INSERT INTO auth.users (
--   instance_id,
--   id,
--   aud,
--   role,
--   email,
--   encrypted_password,
--   email_confirmed_at,
--   raw_user_meta_data,
--   created_at,
--   updated_at,
--   confirmation_token,
--   recovery_token
-- ) VALUES (
--   '00000000-0000-0000-0000-000000000000',
--   gen_random_uuid(),
--   'authenticated',
--   'authenticated',
--   'NOVY_EMAIL@example.com',
--   crypt('NOVE_HESLO', gen_salt('bf')),
--   now(),
--   '{"role": "admin"}'::jsonb,
--   now(),
--   now(),
--   '',
--   ''
-- );
