-- Row Level Security — cahier des charges section 4 (Acteurs, rôles et
-- permissions) et section 15 (Sécurité) :
-- "Un parent ne voit que ses caisses ; un établissement ne voit que les
-- caisses qui lui sont rattachées." "Seules les fonctions serveur écrivent
-- dans transactions et ledger_entries."
--
-- Toutes les écritures financières (transactions, ledger_entries) et les
-- opérations d'arrière-guichet (Back-office Kangan, section 8) passent par
-- les routes serveur Next.js authentifiées via SUPABASE_SERVICE_ROLE_KEY,
-- qui contourne RLS après vérification applicative du rôle. RLS protège
-- ici l'accès direct des clients (web/mobile) via la clé anonyme.

alter table profiles enable row level security;
alter table schools enable row level security;
alter table school_members enable row level security;
alter table school_years enable row level security;
alter table fee_schedules enable row level security;
alter table students enable row level security;
alter table savings_boxes enable row level security;
alter table transactions enable row level security;
alter table ledger_entries enable row level security;
alter table payouts enable row level security;
alter table contribution_links enable row level security;
alter table statements enable row level security;
alter table notifications enable row level security;
alter table audit_logs enable row level security;

-- ---------------------------------------------------------------------------
-- Fonctions utilitaires (SECURITY DEFINER, stables) pour éviter de dupliquer
-- des sous-requêtes coûteuses dans chaque politique.
-- ---------------------------------------------------------------------------

create or replace function is_member_of_school(target_school_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from school_members sm
    where sm.school_id = target_school_id and sm.profile_id = auth.uid()
  );
$$;

create or replace function owns_box(target_box_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from savings_boxes sb
    join students st on st.id = sb.student_id
    where sb.id = target_box_id and st.parent_id = auth.uid()
  );
$$;

create or replace function school_of_box(target_box_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from savings_boxes sb
    where sb.id = target_box_id and is_member_of_school(sb.school_id)
  );
$$;

-- SECURITY DEFINER (bypasse RLS en interne) : évite la récursion infinie
-- qui se produirait si cette vérification interrogeait savings_boxes via
-- une sous-requête directe depuis une politique de la table students,
-- pendant qu'une politique de savings_boxes interroge symétriquement students.
create or replace function student_has_box_at_school(target_student_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from savings_boxes sb
    where sb.student_id = target_student_id and is_member_of_school(sb.school_id)
  );
$$;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create policy "profiles_select_own" on profiles for select using (id = auth.uid());
create policy "profiles_update_own" on profiles for update using (id = auth.uid());
create policy "profiles_insert_own" on profiles for insert with check (id = auth.uid());

-- ---------------------------------------------------------------------------
-- schools — annuaire public (P2 : recherche par nom, commune, cycle)
-- ---------------------------------------------------------------------------
create policy "schools_select_public" on schools for select using (true);
create policy "schools_update_by_admin_member" on schools for update
  using (exists (
    select 1 from school_members sm
    where sm.school_id = schools.id and sm.profile_id = auth.uid() and sm.role = 'admin'
  ));

-- ---------------------------------------------------------------------------
-- school_members
-- ---------------------------------------------------------------------------
create policy "school_members_select_self" on school_members for select using (profile_id = auth.uid());
create policy "school_members_select_peers" on school_members for select
  using (is_member_of_school(school_id));
create policy "school_members_manage_by_admin" on school_members for all
  using (exists (
    select 1 from school_members sm
    where sm.school_id = school_members.school_id and sm.profile_id = auth.uid() and sm.role = 'admin'
  ));

-- ---------------------------------------------------------------------------
-- school_years, fee_schedules — grilles tarifaires publiques (P2)
-- ---------------------------------------------------------------------------
create policy "school_years_select_public" on school_years for select using (true);
create policy "fee_schedules_select_public" on fee_schedules for select using (true);
create policy "fee_schedules_write_by_admin_member" on fee_schedules for all
  using (exists (
    select 1 from school_members sm
    where sm.school_id = fee_schedules.school_id and sm.profile_id = auth.uid() and sm.role = 'admin'
  ));

-- ---------------------------------------------------------------------------
-- students — un parent gère ses enfants ; l'école ne voit que ceux ayant
-- une caisse ouverte chez elle.
-- ---------------------------------------------------------------------------
create policy "students_select_own" on students for select using (parent_id = auth.uid());
create policy "students_manage_own" on students for insert with check (parent_id = auth.uid());
create policy "students_update_own" on students for update using (parent_id = auth.uid());
create policy "students_select_by_school" on students for select
  using (student_has_box_at_school(students.id));

-- ---------------------------------------------------------------------------
-- savings_boxes — cœur du contrôle d'accès (section 4)
-- ---------------------------------------------------------------------------
create policy "boxes_select_own" on savings_boxes for select
  using (exists (select 1 from students st where st.id = savings_boxes.student_id and st.parent_id = auth.uid()));
create policy "boxes_insert_own" on savings_boxes for insert
  with check (exists (select 1 from students st where st.id = savings_boxes.student_id and st.parent_id = auth.uid()));
create policy "boxes_update_own_draft" on savings_boxes for update
  using (
    exists (select 1 from students st where st.id = savings_boxes.student_id and st.parent_id = auth.uid())
    and status in ('brouillon', 'en_attente')
  );
create policy "boxes_select_by_school" on savings_boxes for select using (is_member_of_school(school_id));

-- ---------------------------------------------------------------------------
-- transactions / ledger_entries — lecture seule côté client, écriture
-- réservée aux fonctions serveur (clé service_role, hors RLS).
-- ---------------------------------------------------------------------------
create policy "transactions_select_own_box" on transactions for select using (owns_box(box_id));
create policy "transactions_select_by_school" on transactions for select using (school_of_box(box_id));

create policy "ledger_select_own_box" on ledger_entries for select
  using (exists (select 1 from transactions t where t.id = ledger_entries.transaction_id and owns_box(t.box_id)));
create policy "ledger_select_by_school" on ledger_entries for select
  using (exists (select 1 from transactions t where t.id = ledger_entries.transaction_id and school_of_box(t.box_id)));

-- ---------------------------------------------------------------------------
-- payouts — l'école peut demander, seule l'exécution (service role) écrit le statut final.
-- ---------------------------------------------------------------------------
create policy "payouts_select_by_school" on payouts for select using (is_member_of_school(school_id));
create policy "payouts_insert_by_admin_member" on payouts for insert
  with check (exists (
    select 1 from school_members sm
    where sm.school_id = payouts.school_id and sm.profile_id = auth.uid() and sm.role in ('admin', 'comptable')
  ));

-- ---------------------------------------------------------------------------
-- contribution_links — créés par le parent propriétaire de la caisse uniquement.
-- La résolution d'un code par un tiers non authentifié passe par une route
-- serveur dédiée (service role), jamais par une lecture directe de la table.
-- ---------------------------------------------------------------------------
create policy "contribution_links_select_own" on contribution_links for select using (owns_box(box_id));
create policy "contribution_links_insert_own" on contribution_links for insert with check (owns_box(box_id));

-- ---------------------------------------------------------------------------
-- statements — la vérification publique (/verify/{number}) passe par une
-- route serveur dédiée, pas par une lecture directe de la table.
-- ---------------------------------------------------------------------------
create policy "statements_select_own_box" on statements for select using (owns_box(box_id));
create policy "statements_select_by_school" on statements for select using (school_of_box(box_id));

-- ---------------------------------------------------------------------------
-- notifications — chacun ne voit que les siennes.
-- ---------------------------------------------------------------------------
create policy "notifications_select_own" on notifications for select using (profile_id = auth.uid());
create policy "notifications_update_own_read" on notifications for update using (profile_id = auth.uid());

-- ---------------------------------------------------------------------------
-- audit_logs — aucun accès client direct ; consultation via back-office
-- (route serveur avec vérification du rôle kangan_super_admin/kangan_agent).
-- ---------------------------------------------------------------------------
-- (pas de politique select/insert pour "authenticated" : accès service_role uniquement)
