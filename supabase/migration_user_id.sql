-- ============================================================
-- MIGRARE: Adăugare user_id pe tabela clienti
-- Rulează acest script în Supabase SQL Editor
-- ============================================================

-- 1. Adaugă coloana user_id pe tabela clienti
ALTER TABLE clienti ADD COLUMN IF NOT EXISTS user_id UUID;

-- 2. Setează user_id-ul curent pe toate înregistrările existente
-- IMPORTANT: Înlocuiește 'YOUR-USER-UUID' cu UUID-ul tău din auth.users
-- Poți găsi UUID-ul în Supabase Dashboard → Authentication → Users
-- UPDATE clienti SET user_id = 'YOUR-USER-UUID' WHERE user_id IS NULL;

-- 3. Face coloana obligatorie cu default auth.uid()
ALTER TABLE clienti ALTER COLUMN user_id SET DEFAULT auth.uid();
-- Dacă vrei să faci coloana NOT NULL (recomandat):
-- ALTER TABLE clienti ALTER COLUMN user_id SET NOT NULL;

-- 4. Creează index pentru performanță
CREATE INDEX IF NOT EXISTS idx_clienti_user ON clienti(user_id);

-- 5. Șterge politicile RLS vechi (USING true)
DROP POLICY IF EXISTS "Allow all for authenticated users" ON clienti;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON masini;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON programari;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON interventii;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON devize;

-- 6. Creează politici RLS noi — per utilizator

-- CLIENȚI: acces direct prin user_id
CREATE POLICY "Users can manage own clients" ON clienti
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- MAȘINI: acces prin clientul proprietar
CREATE POLICY "Users can manage own cars" ON masini
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM clienti WHERE clienti.id = masini.client_id AND clienti.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM clienti WHERE clienti.id = masini.client_id AND clienti.user_id = auth.uid()
  ));

-- PROGRAMĂRI: acces prin clientul proprietar
CREATE POLICY "Users can manage own appointments" ON programari
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM clienti WHERE clienti.id = programari.client_id AND clienti.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM clienti WHERE clienti.id = programari.client_id AND clienti.user_id = auth.uid()
  ));

-- INTERVENȚII: acces prin programare → client
CREATE POLICY "Users can manage own interventions" ON interventii
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM programari
    JOIN clienti ON clienti.id = programari.client_id
    WHERE programari.id = interventii.programare_id AND clienti.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM programari
    JOIN clienti ON clienti.id = programari.client_id
    WHERE programari.id = interventii.programare_id AND clienti.user_id = auth.uid()
  ));

-- DEVIZE: acces prin programare → client
CREATE POLICY "Users can manage own estimates" ON devize
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM programari
    JOIN clienti ON clienti.id = programari.client_id
    WHERE programari.id = devize.programare_id AND clienti.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM programari
    JOIN clienti ON clienti.id = programari.client_id
    WHERE programari.id = devize.programare_id AND clienti.user_id = auth.uid()
  ));
