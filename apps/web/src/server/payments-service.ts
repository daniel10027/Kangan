import { randomUUID } from "node:crypto";
import { getPaymentAdapter, type PaymentCallback } from "@kangan/payments";
import type { PaymentOperator, TransactionType } from "@kangan/shared";
import { getSupabaseAdmin } from "./supabase-admin";
import { writeAuditLog } from "./audit";

interface InitiateArgs {
  boxId: string;
  boxReference: string;
  type: TransactionType;
  amount: number;
  operator: PaymentOperator;
  payerPhone: string;
  /**
   * Clé fournie par le client (en-tête HTTP `Idempotency-Key`, obligatoire
   * sur POST /boxes/{id}/payments — section 14) pour dédupliquer les
   * doubles soumissions réseau. À défaut (appel interne), une clé est générée.
   */
  idempotencyKey?: string;
}

/**
 * Orchestration d'un versement — section 10, "Flux d'un versement" (01 à 04) :
 * crée la transaction en base au statut 'initiee' via RPC (idempotence),
 * puis appelle l'adaptateur opérateur choisi.
 */
export async function initiatePayment(args: InitiateArgs) {
  const admin = getSupabaseAdmin();
  const idempotencyKey = args.idempotencyKey ?? randomUUID();

  const { data: tx, error: txError } = await admin.rpc("create_pending_transaction", {
    p_box_id: args.boxId,
    p_type: args.type,
    p_amount: args.amount,
    p_operator: args.operator,
    p_idempotency_key: idempotencyKey,
    p_payer_phone: args.payerPhone,
  });
  if (txError) throw new Error(`Création de la transaction impossible : ${txError.message}`);

  const adapter = getPaymentAdapter(args.operator);
  const result = await adapter.initiate({
    idempotencyKey,
    amountFcfa: args.amount,
    payerPhone: args.payerPhone,
    boxReference: args.boxReference,
    narrative: `Versement caisse ${args.boxReference}`,
  });

  return { transaction: tx, idempotencyKey, initiation: result };
}

/**
 * Règlement d'une transaction après réception d'un webhook opérateur
 * (ou d'une confirmation simulée) — section 10, étapes 03/04.
 */
export async function settlePayment(callback: PaymentCallback) {
  const admin = getSupabaseAdmin();
  const { data: tx, error } = await admin.rpc("settle_transaction", {
    p_idempotency_key: callback.idempotencyKey,
    p_operator_ref: callback.operatorRef,
    p_new_status: callback.status === "reussie" ? "reussie" : "echouee",
  });
  if (error) throw new Error(`Règlement de la transaction impossible : ${error.message}`);

  await writeAuditLog({
    actorId: null,
    action: "settle_transaction",
    entity: "transactions",
    entityId: tx?.id ?? null,
    after: { status: callback.status, operator_ref: callback.operatorRef },
  });

  return tx;
}
