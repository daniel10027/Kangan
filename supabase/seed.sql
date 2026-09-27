-- Données de démonstration — cahier des charges section 1 ("pilote visé
-- avec 5 établissements") et section 18 (zone de lancement : Abidjan —
-- Cocody, Yopougon, Abobo, Marcory).
--
-- Ce fichier ne seed que les données de référence publiques (écoles, année
-- scolaire, grilles tarifaires) : elles ne dépendent pas d'auth.users et
-- sont donc stables quelle que soit la version de Supabase Auth utilisée.
--
-- Les comptes de démonstration (parents, personnel d'école) et leurs
-- caisses/versements sont créés par `npm run seed:demo`
-- (scripts/seed-demo-data.ts), qui utilise l'API Admin Supabase — voir
-- docs/DEPLOYMENT.md, section "Comptes de démonstration".

insert into school_years (id, label, starts_on, ends_on, is_current) values
  ('00000000-0000-0000-0000-0000000000a1', '2026-2027', '2026-09-15', '2027-06-30', true)
on conflict (label) do nothing;

insert into schools (id, name, slug, type, cycles, commune, city, address, lat, lng, status, rccm, logo_url) values
  ('00000000-0000-0000-0000-0000000000b1', 'Groupe Scolaire Les Colombes', 'les-colombes-cocody', 'prive',
   '{maternelle,primaire}', 'Cocody', 'Abidjan', 'Rue des Jardins, Cocody', 5.3599, -3.9767, 'actif', 'CI-ABJ-2015-B-4821', null),
  ('00000000-0000-0000-0000-0000000000b2', 'Collège Moderne Excellence', 'college-excellence-yopougon', 'prive',
   '{secondaire}', 'Yopougon', 'Abidjan', 'Boulevard Latrille, Yopougon', 5.3450, -4.0850, 'actif', 'CI-ABJ-2012-B-2210', null),
  ('00000000-0000-0000-0000-0000000000b3', 'Institution Sainte-Marie', 'sainte-marie-abobo', 'confessionnel',
   '{primaire,secondaire}', 'Abobo', 'Abidjan', 'Avenue 8, Abobo', 5.4181, -4.0157, 'actif', 'CI-ABJ-2008-B-1190', null),
  ('00000000-0000-0000-0000-0000000000b4', 'École Primaire La Rentrée', 'la-rentree-marcory', 'prive',
   '{maternelle,primaire}', 'Marcory', 'Abidjan', 'Zone 4, Marcory', 5.2926, -3.9975, 'actif', 'CI-ABJ-2018-B-6634', null),
  ('00000000-0000-0000-0000-0000000000b5', 'Lycée Technique Avenir', 'lycee-avenir-cocody', 'prive',
   '{secondaire,formation_professionnelle}', 'Cocody', 'Abidjan', 'II Plateaux, Cocody', 5.3690, -3.9880, 'actif', 'CI-ABJ-2010-B-3305', null)
on conflict (slug) do nothing;

-- Grilles tarifaires par école et par niveau, avec pourcentages d'acompte
-- variés (5 % à 50 %, section 7).
insert into fee_schedules (school_id, school_year_id, level, registration_fee, tuition_fee, extra_fees, deposit_percent, min_payment, deadline) values
  ('00000000-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-0000000000a1', 'Grande Section', 60000, 240000,
   '[{"label":"Cantine","amount":30000},{"label":"Tenue","amount":15000}]', 20, 500, '2026-09-14'),
  ('00000000-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-0000000000a1', 'CP1', 55000, 220000,
   '[{"label":"Cantine","amount":30000}]', 20, 500, '2026-09-14'),
  ('00000000-0000-0000-0000-0000000000b2', '00000000-0000-0000-0000-0000000000a1', '6e', 90000, 350000,
   '[{"label":"Transport","amount":45000}]', 15, 500, '2026-09-10'),
  ('00000000-0000-0000-0000-0000000000b2', '00000000-0000-0000-0000-0000000000a1', '3e', 95000, 380000,
   '[]', 25, 500, '2026-09-10'),
  ('00000000-0000-0000-0000-0000000000b3', '00000000-0000-0000-0000-0000000000a1', 'CM2', 50000, 200000,
   '[{"label":"Tenue","amount":18000}]', 10, 500, '2026-09-20'),
  ('00000000-0000-0000-0000-0000000000b3', '00000000-0000-0000-0000-0000000000a1', '5e', 80000, 300000,
   '[]', 30, 500, '2026-09-20'),
  ('00000000-0000-0000-0000-0000000000b4', '00000000-0000-0000-0000-0000000000a1', 'Moyenne Section', 45000, 180000,
   '[{"label":"Cantine","amount":25000}]', 5, 500, '2026-09-05'),
  ('00000000-0000-0000-0000-0000000000b5', '00000000-0000-0000-0000-0000000000a1', 'Terminale D', 100000, 420000,
   '[{"label":"Kit examen","amount":20000}]', 50, 1000, '2026-09-25')
on conflict (school_id, school_year_id, level) do nothing;
