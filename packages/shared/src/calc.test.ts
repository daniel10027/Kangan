import { describe, expect, it } from "vitest";
import {
  clampPaymentToRemaining,
  computeDepositAmount,
  computeProgressPercent,
  computeSavingsPlan,
  computeTargetAmount,
  isValidPaymentAmount,
  reachedMilestone,
  roundUpToHundred,
} from "./calc";

describe("computeTargetAmount (RG01)", () => {
  const fees = { registrationFee: 60_000, tuitionFee: 240_000, extraFees: [{ label: "Cantine", amount: 30_000 }] };

  it("inscription seule = frais d'inscription", () => {
    expect(computeTargetAmount(fees, "inscription")).toBe(60_000);
  });

  it("totalite = inscription + scolarité + frais annexes", () => {
    expect(computeTargetAmount(fees, "totalite")).toBe(60_000 + 240_000 + 30_000);
  });
});

describe("computeDepositAmount (RG02) — exemple chiffré du cahier des charges", () => {
  it("inscription 60000 + scolarité 240000, acompte 20% => 60000 arrondi", () => {
    // Objectif 300 000 F CFA, acompte 20 % => 60 000 F CFA (exemple section 9).
    expect(computeDepositAmount(300_000, 20)).toBe(60_000);
  });

  it("arrondit à la centaine supérieure", () => {
    expect(roundUpToHundred(12345)).toBe(12400);
    expect(roundUpToHundred(12300)).toBe(12300);
  });

  it("ne descend jamais sous le versement minimum", () => {
    expect(computeDepositAmount(1000, 5)).toBe(500);
  });

  it("rejette un pourcentage hors bornes", () => {
    expect(() => computeDepositAmount(100_000, 150)).toThrow();
  });
});

describe("computeSavingsPlan — exemple chiffré du cahier des charges", () => {
  it("reste 240000 sur 8 périodes de 30 jours => 30000/mois", () => {
    const from = new Date("2026-01-23T00:00:00Z");
    const deadline = new Date(from.getTime() + 240 * 24 * 60 * 60 * 1000).toISOString();
    const plan = computeSavingsPlan(300_000, 60_000, deadline, "mois", from);
    expect(plan.remaining).toBe(240_000);
    expect(plan.numberOfPeriods).toBe(8);
    expect(plan.suggestedPayment).toBe(30_000);
  });
});

describe("clampPaymentToRemaining (RG05)", () => {
  it("laisse passer un montant inférieur au restant dû", () => {
    expect(clampPaymentToRemaining(10_000, 50_000)).toEqual({ amountToApply: 10_000, surplus: 0 });
  });

  it("plafonne un montant supérieur au restant dû et calcule l'excédent", () => {
    expect(clampPaymentToRemaining(60_000, 50_000)).toEqual({ amountToApply: 50_000, surplus: 10_000 });
  });
});

describe("isValidPaymentAmount (RG04)", () => {
  it("accepte 500 F CFA et plus", () => {
    expect(isValidPaymentAmount(500)).toBe(true);
    expect(isValidPaymentAmount(1_000_000)).toBe(true);
  });

  it("refuse en dessous de 500 F CFA ou les montants non entiers", () => {
    expect(isValidPaymentAmount(499)).toBe(false);
    expect(isValidPaymentAmount(500.5)).toBe(false);
  });
});

describe("computeProgressPercent", () => {
  it("plafonne à 100%", () => {
    expect(computeProgressPercent(400_000, 300_000)).toBe(100);
  });
  it("calcule un pourcentage intermédiaire", () => {
    expect(computeProgressPercent(150_000, 300_000)).toBe(50);
  });
});

describe("reachedMilestone", () => {
  it("détecte le franchissement d'un jalon 25/50/75/100", () => {
    expect(reachedMilestone(20, 30)).toBe(25);
    expect(reachedMilestone(48, 52)).toBe(50);
    expect(reachedMilestone(90, 100)).toBe(100); // seul le jalon 100 est franchi depuis 90
    expect(reachedMilestone(99, 99)).toBeNull();
  });
});
