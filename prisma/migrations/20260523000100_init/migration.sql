CREATE TABLE scenarios (
  slug TEXT PRIMARY KEY,
  contract_mix JSONB NOT NULL,
  panel_size INTEGER NOT NULL,
  diagnosis_distribution JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  view_count INTEGER DEFAULT 0
);
