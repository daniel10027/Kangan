import { describe, expect, it } from "vitest";
import { SimulatorAdapter } from "./simulator";
import { verifyHmacSignature } from "./webhook-signature";

describe("SimulatorAdapter", () => {
  it("met une transaction en attente de validation à l'initiation", async () => {
    const adapter = new SimulatorAdapter("moov_money");
    const result = await adapter.initiate({
      idempotencyKey: "idem-123456789",
      amountFcfa: 30_000,
      payerPhone: "+2250700000000",
      boxReference: "KG-2026-000001",
      narrative: "Versement caisse KG-2026-000001",
    });
    expect(result.status).toBe("en_attente_validation");
    expect(result.operatorRef).toContain("SIM-");
  });

  it("rejoue un faux webhook et le vérifie avec le secret du simulateur", () => {
    const adapter = new SimulatorAdapter("moov_money");
    const { rawBody, signatureHeader } = SimulatorAdapter.buildFakeWebhook({
      idempotencyKey: "idem-123456789",
      operatorRef: "SIM-idem-1234",
      status: "reussie",
      amountFcfa: 30_000,
      payerPhone: "+2250700000000",
      rawPayload: {},
    });
    const callback = adapter.verifyWebhook({ rawBody, signatureHeader });
    expect(callback?.status).toBe("reussie");
    expect(callback?.amountFcfa).toBe(30_000);
  });

  it("refuse un webhook sans la bonne signature", () => {
    const adapter = new SimulatorAdapter("moov_money");
    const callback = adapter.verifyWebhook({ rawBody: "{}", signatureHeader: "wrong" });
    expect(callback).toBeNull();
  });
});

describe("verifyHmacSignature", () => {
  it("accepte une signature valide et rejette une signature invalide", () => {
    const secret = "s3cret";
    const body = JSON.stringify({ a: 1 });
    const { createHmac } = require("node:crypto");
    const good = createHmac("sha256", secret).update(body).digest("hex");
    expect(verifyHmacSignature(body, good, secret)).toBe(true);
    expect(verifyHmacSignature(body, "deadbeef", secret)).toBe(false);
    expect(verifyHmacSignature(body, null, secret)).toBe(false);
  });
});
