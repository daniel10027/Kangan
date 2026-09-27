-- Vues calculées et index de performance (section 13 : "Contraintes et index clés").

-- box_balances : solde, pourcentage atteint et dernier versement, calculés
-- depuis ledger_entries — jamais stockés directement sur savings_boxes.
create or replace view box_balances
with (security_invoker = true) as
select
  sb.id as box_id,
  coalesce(sum(le.credit) - sum(le.debit), 0)::bigint as balance,
  least(
    100,
    round(
      (coalesce(sum(le.credit) - sum(le.debit), 0)::numeric / nullif(sb.target_amount, 0)) * 100
    )
  )::int as percent_reached,
  max(t.created_at) filter (where t.status = 'reussie') as last_payment_at
from savings_boxes sb
left join transactions t on t.box_id = sb.id
left join ledger_entries le on le.transaction_id = t.id and le.account = 'caisse'
group by sb.id, sb.target_amount;

comment on view box_balances is 'Solde et progression d''une caisse, calculés depuis le grand livre (ledger_entries), jamais stockés.';

-- Index (section 13)
create index idx_transactions_box_created on transactions (box_id, created_at desc);
create index idx_savings_boxes_school_status on savings_boxes (school_id, status);
create index idx_schools_commune on schools (commune);
create index idx_ledger_entries_transaction on ledger_entries (transaction_id);
create index idx_school_members_profile on school_members (profile_id);
create index idx_students_parent on students (parent_id);
create index idx_notifications_profile_unread on notifications (profile_id) where read_at is null;
create index idx_audit_logs_entity on audit_logs (entity, entity_id, created_at desc);
create index idx_fee_schedules_school_year on fee_schedules (school_id, school_year_id);
