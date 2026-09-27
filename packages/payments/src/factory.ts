import type { PaymentOperator } from "@kangan/shared";
import { AggregatorAdapter } from "./aggregator";
import { MoovMoneyAdapter } from "./moov-money";
import { SimulatorAdapter } from "./simulator";
import type { PaymentAdapter } from "./types";

export type PaymentMode = "simulator" | "live";

export interface PaymentEnv {
  mode: PaymentMode;
  moovMoney: { baseUrl: string; merchantId: string; apiKey: string; apiSecret: string; webhookSecret: string };
  aggregator: { provider: "cinetpay" | "paydunya"; baseUrl: string; apiKey: string; apiSecret: string; webhookSecret: string };
}

export function readPaymentEnvFromProcess(): PaymentEnv {
  return {
    mode: (process.env.PAYMENT_MODE as PaymentMode) === "live" ? "live" : "simulator",
    moovMoney: {
      baseUrl: process.env.MOOV_MONEY_BASE_URL ?? "https://api.moov-africa.ci",
      merchantId: process.env.MOOV_MONEY_MERCHANT_ID ?? "",
      apiKey: process.env.MOOV_MONEY_API_KEY ?? "",
      apiSecret: process.env.MOOV_MONEY_API_SECRET ?? "",
      webhookSecret: process.env.MOOV_MONEY_WEBHOOK_SECRET ?? "",
    },
    aggregator: {
      provider: (process.env.AGGREGATOR_PROVIDER as "cinetpay" | "paydunya") ?? "cinetpay",
      baseUrl: process.env.AGGREGATOR_BASE_URL ?? "https://api.cinetpay.com",
      apiKey: process.env.AGGREGATOR_API_KEY ?? "",
      apiSecret: process.env.AGGREGATOR_API_SECRET ?? "",
      webhookSecret: process.env.AGGREGATOR_WEBHOOK_SECRET ?? "",
    },
  };
}

/**
 * Fabrique d'adaptateur — sélectionne l'implémentation réelle ou le
 * simulateur selon PAYMENT_MODE, pour un opérateur donné.
 */
export function getPaymentAdapter(operator: PaymentOperator, env: PaymentEnv = readPaymentEnvFromProcess()): PaymentAdapter {
  if (env.mode === "simulator") {
    return new SimulatorAdapter(operator);
  }

  if (operator === "moov_money") {
    return new MoovMoneyAdapter(env.moovMoney);
  }

  return new AggregatorAdapter(operator, env.aggregator);
}
