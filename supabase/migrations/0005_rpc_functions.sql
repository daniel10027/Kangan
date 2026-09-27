-- Fonctions RPC appelées exclusivement par les routes serveur (service role) —
-- section 12 : "Grand livre en double écriture : le solde d'une caisse est
-- toujours calculé à partir des écritures, jamais stocké seul." et
-- "Idempotence : chaque demande de paiement porte une clé unique pour éviter
-- les doubles débits en cas de réseau instable."

-- Séquence pour les références de caisse lisibles (KG-2026-000123).
create sequence if not exists box_reference_seq;
create sequence if not exists statement_number_seq;

create or replace function next_box_reference(p_year int) returns text
language sql as $$
  select 'KG-' || p_year || '-' || lpad(nextval('box_reference_seq')::text, 6, '0');
$$;

create or replace function next_statement_number(p_year int) returns text
language sql as $$
  select 'KG-REL-' || p_year || '-' || lpad(nextval('statement_number_seq')::text, 6, '0');
$$;

-- Crée (ou retrouve, si la clé d'idempotence existe déjà — rejeu réseau)
-- une transaction au statut initiée. Idempotence : section 12.
create or replace function create_pending_transaction(
  p_box_id uuid,
  p_type transaction_type,
  p_amount bigint,
  p_operator payment_operator,
  p_idempotency_key text,
  p_payer_phone text
) returns transactions
language plpgsql security definer set search_path = public as $$
declare
  v_tx transactions;
begin
  insert into transactions (box_id, type, amount, operator, idempotency_key, status, payer_phone)
  values (p_box_id, p_type, p_amount, p_operator, p_idempotency_key, 'initiee', p_payer_phone)
  on conflict (idempotency_key) do update set idempotency_key = excluded.idempotency_key
  returning * into v_tx;

  return v_tx;
end;
$$;

-- Règle une transaction (webhook opérateur reçu et vérifié) : passe le
-- statut à 'reussie' ou 'echouee' et, si succès, ajoute l'écriture au grand
-- livre. Opération atomique (une seule transaction SQL).
create or replace function settle_transaction(
  p_idempotency_key text,
  p_operator_ref text,
  p_new_status transaction_status
) returns transactions
language plpgsql security definer set search_path = public as $$
declare
  v_tx transactions;
begin
  select * into v_tx from transactions where idempotency_key = p_idempotency_key for update;

  if not found then
    raise exception 'Transaction inconnue pour la clé d''idempotence %', p_idempotency_key;
  end if;

  if v_tx.status <> 'initiee' then
    -- Déjà réglée (rejeu de webhook) : on renvoie l'état actuel sans rien refaire (idempotence).
    return v_tx;
  end if;

  update transactions
    set status = p_new_status, operator_ref = coalesce(p_operator_ref, operator_ref)
    where id = v_tx.id
    returning * into v_tx;

  if p_new_status = 'reussie' then
    if v_tx.type in ('deposit', 'payment', 'contribution') then
      insert into ledger_entries (transaction_id, account, debit, credit) values (v_tx.id, 'caisse', 0, v_tx.amount);
    elsif v_tx.type in ('payout', 'refund') then
      insert into ledger_entries (transaction_id, account, debit, credit) values (v_tx.id, 'caisse', v_tx.amount, 0);
    end if;

    -- RG03 : la caisse passe en statut actif uniquement après confirmation de l'acompte.
    if v_tx.type = 'deposit' then
      update savings_boxes set status = 'active' where id = v_tx.box_id and status = 'en_attente';
    end if;

    -- Recalcule le statut "completee" si l'objectif est atteint (jalon 100%).
    update savings_boxes sb
      set status = 'completee'
      from box_balances bb
      where sb.id = bb.box_id and sb.id = v_tx.box_id and sb.status = 'active' and bb.percent_reached >= 100;
  end if;

  return v_tx;
end;
$$;

-- Contre-écriture motivée (RG13) : insère une nouvelle transaction de type
-- 'reversal' qui neutralise l'effet comptable de la transaction d'origine,
-- sans jamais la modifier ni la supprimer.
create or replace function reverse_transaction(
  p_original_transaction_id uuid,
  p_reason text,
  p_actor_id uuid
) returns transactions
language plpgsql security definer set search_path = public as $$
declare
  v_original transactions;
  v_reversal transactions;
begin
  if p_reason is null or length(trim(p_reason)) < 10 then
    raise exception 'Une contre-écriture doit être motivée (10 caractères minimum).';
  end if;

  select * into v_original from transactions where id = p_original_transaction_id;
  if not found or v_original.status <> 'reussie' then
    raise exception 'Seule une transaction réussie peut faire l''objet d''une contre-écriture.';
  end if;

  insert into transactions (box_id, type, amount, operator, idempotency_key, status, payer_phone, reversal_of, metadata)
  values (
    v_original.box_id, 'reversal', v_original.amount, v_original.operator,
    'reversal-' || v_original.id::text, 'reussie', v_original.payer_phone, v_original.id,
    jsonb_build_object('reason', p_reason, 'actor_id', p_actor_id)
  )
  returning * into v_reversal;

  -- Écriture inverse de l'originale.
  insert into ledger_entries (transaction_id, account, debit, credit)
  select v_reversal.id, le.account, le.credit, le.debit -- inversion débit/crédit
  from ledger_entries le
  where le.transaction_id = v_original.id;

  insert into audit_logs (actor_id, action, entity, entity_id, before, after)
  values (p_actor_id, 'reverse_transaction', 'transactions', v_original.id,
          to_jsonb(v_original), jsonb_build_object('reversal_id', v_reversal.id, 'reason', p_reason));

  return v_reversal;
end;
$$;
