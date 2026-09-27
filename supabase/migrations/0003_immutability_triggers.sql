-- RG13 — Immuabilité : "Aucune transaction n'est modifiée ni supprimée ;
-- toute correction passe par une contre-écriture motivée."
--
-- Nuance opérationnelle (section 10, Flux d'un versement) : une transaction
-- est créée au statut 'initiee', puis le webhook opérateur la fait passer
-- une seule fois à 'reussie' ou 'echouee'. Ce n'est pas une "correction"
-- mais le règlement normal du cycle de vie — on l'autorise donc, et rien
-- d'autre : ni changement de montant/opérateur/référence, ni second
-- changement de statut une fois un état terminal atteint. Toute suppression
-- reste interdite en toutes circonstances.

create or replace function forbid_update_delete() returns trigger as $$
begin
  raise exception 'Opération interdite sur %: écritures en ajout seul (RG13). Utilisez une contre-écriture.', tg_table_name;
end;
$$ language plpgsql;

create or replace function guard_transaction_settlement() returns trigger as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'Suppression interdite sur transactions (RG13).';
  end if;

  if old.status not in ('initiee') then
    raise exception 'Transaction déjà réglée (statut %) : aucune modification possible (RG13).', old.status;
  end if;

  if new.status not in ('reussie', 'echouee', 'annulee') then
    raise exception 'Transition de statut invalide : % -> %.', old.status, new.status;
  end if;

  if new.box_id <> old.box_id
     or new.type <> old.type
     or new.amount <> old.amount
     or new.operator <> old.operator
     or new.idempotency_key <> old.idempotency_key
     or new.payer_phone <> old.payer_phone
     or new.created_at <> old.created_at then
    raise exception 'Seul le champ statut (et operator_ref) peut être réglé sur une transaction (RG13).';
  end if;

  return new;
end;
$$ language plpgsql;

create trigger transactions_guard_settlement
  before update or delete on transactions
  for each row execute function guard_transaction_settlement();

create trigger ledger_entries_no_update
  before update or delete on ledger_entries
  for each row execute function forbid_update_delete();

create trigger audit_logs_no_update
  before update or delete on audit_logs
  for each row execute function forbid_update_delete();

-- updated_at automatique sur savings_boxes
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger savings_boxes_set_updated_at
  before update on savings_boxes
  for each row execute function set_updated_at();
