import { describe, expect, it } from "vitest";
import {
  canTransitionStatus,
  computeTransferableAmount,
  isWithinKycLimit,
  requiresAccountForContribution,
  violatesOneActiveBoxPerYear,
} from "./rules";

describe("canTransitionStatus — statuts d'une caisse (section 9)", () => {
  it("autorise brouillon -> en_attente -> active -> completee -> reversee", () => {
    expect(canTransitionStatus("brouillon", "en_attente")).toBe(true);
    expect(canTransitionStatus("en_attente", "active")).toBe(true);
    expect(canTransitionStatus("active", "completee")).toBe(true);
    expect(canTransitionStatus("completee", "reversee")).toBe(true);
  });

  it("refuse de sauter des étapes ou de revenir en arrière depuis un état terminal", () => {
    expect(canTransitionStatus("brouillon", "active")).toBe(false);
    expect(canTransitionStatus("reversee", "active")).toBe(false);
  });

  it("autorise la suspension (litige) puis remboursement ou réactivation", () => {
    expect(canTransitionStatus("active", "suspendue")).toBe(true);
    expect(canTransitionStatus("suspendue", "remboursee")).toBe(true);
    expect(canTransitionStatus("suspendue", "active")).toBe(true);
  });
});

describe("requiresAccountForContribution (RG12)", () => {
  it("pas de compte requis jusqu'à 200 000 F CFA", () => {
    expect(requiresAccountForContribution(200_000)).toBe(false);
    expect(requiresAccountForContribution(200_001)).toBe(true);
  });
});

describe("isWithinKycLimit", () => {
  it("niveau 1 plafonné à 500 000 F CFA cumulés", () => {
    expect(isWithinKycLimit(100_000, 1, 450_000)).toBe(false);
    expect(isWithinKycLimit(50_000, 1, 450_000)).toBe(true);
  });

  it("niveau 3 n'a pas de plafond automatique", () => {
    expect(isWithinKycLimit(10_000_000, 3, 0)).toBe(true);
  });
});

describe("computeTransferableAmount (RG11)", () => {
  it("le solde hors acompte est transférable, l'acompte reste acquis", () => {
    expect(computeTransferableAmount(150_000, 60_000)).toBe(90_000);
    expect(computeTransferableAmount(30_000, 60_000)).toBe(0);
  });
});

describe("violatesOneActiveBoxPerYear (RG15)", () => {
  const existing = [{ studentId: "s1", schoolYearId: "y1", status: "active" as const }];

  it("refuse une deuxième caisse active pour le même élève et la même année", () => {
    expect(violatesOneActiveBoxPerYear(existing, { studentId: "s1", schoolYearId: "y1" })).toBe(true);
  });

  it("autorise une caisse pour une autre année scolaire", () => {
    expect(violatesOneActiveBoxPerYear(existing, { studentId: "s1", schoolYearId: "y2" })).toBe(false);
  });
});
