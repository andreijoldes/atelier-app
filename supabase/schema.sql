-- ============================================================
-- Schema SQL pentru aplicația Atelier Auto
-- Baza de date Supabase (PostgreSQL)
-- ============================================================

-- 1. Tabela CLIENȚI
-- Stochează informațiile despre clienții atelierului
CREATE TABLE IF NOT EXISTS clienti (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nume VARCHAR(100) NOT NULL,
  telefon VARCHAR(20),
  email VARCHAR(100),
  adresa TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela MAȘINI
-- Fiecare mașină aparține unui client
CREATE TABLE IF NOT EXISTS masini (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES clienti(id) ON DELETE CASCADE,
  marca VARCHAR(50) NOT NULL,
  model VARCHAR(50) NOT NULL,
  an INTEGER,
  numar_inmatriculare VARCHAR(20),
  vin VARCHAR(17),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela PROGRAMĂRI
-- Programările clienților cu mașinile lor
CREATE TABLE IF NOT EXISTS programari (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES clienti(id) ON DELETE CASCADE,
  masina_id UUID NOT NULL REFERENCES masini(id) ON DELETE CASCADE,
  data_programare TIMESTAMP WITH TIME ZONE NOT NULL,
  descriere TEXT,
  status VARCHAR(20) DEFAULT 'asteptare'
    CHECK (status IN ('asteptare', 'in_lucru', 'finalizat')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabela INTERVENȚII
-- Lucrările efectuate în cadrul unei programări
CREATE TABLE IF NOT EXISTS interventii (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  programare_id UUID NOT NULL REFERENCES programari(id) ON DELETE CASCADE,
  descriere TEXT NOT NULL,
  durata_ore NUMERIC(5,2),
  mecanic VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabela DEVIZE
-- Piese și manoperă pentru fiecare programare
CREATE TABLE IF NOT EXISTS devize (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  programare_id UUID NOT NULL REFERENCES programari(id) ON DELETE CASCADE,
  tip VARCHAR(20) NOT NULL CHECK (tip IN ('piesa', 'manopera')),
  descriere TEXT NOT NULL,
  cantitate NUMERIC(10,2) DEFAULT 1,
  pret_unitar NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- Activare Row Level Security (RLS)
-- ============================================================
ALTER TABLE clienti ENABLE ROW LEVEL SECURITY;
ALTER TABLE masini ENABLE ROW LEVEL SECURITY;
ALTER TABLE programari ENABLE ROW LEVEL SECURITY;
ALTER TABLE interventii ENABLE ROW LEVEL SECURITY;
ALTER TABLE devize ENABLE ROW LEVEL SECURITY;

-- Politici RLS — permite acces complet utilizatorilor autentificați
CREATE POLICY "Allow all for authenticated users" ON clienti
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON masini
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON programari
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON interventii
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON devize
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- Indexuri pentru performanță
-- ============================================================
CREATE INDEX idx_masini_client ON masini(client_id);
CREATE INDEX idx_programari_data ON programari(data_programare);
CREATE INDEX idx_programari_status ON programari(status);
CREATE INDEX idx_devize_programare ON devize(programare_id);
CREATE INDEX idx_interventii_programare ON interventii(programare_id);
