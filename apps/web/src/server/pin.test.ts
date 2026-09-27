import { describe, expect, it } from "vitest";
import { hashPin, verifyPin } from "./pin";

describe("hashPin / verifyPin (section 15 — le PIN n'est jamais stocké en clair)", () => {
  it("vérifie un PIN correct", () => {
    const hash = hashPin("4821");
    expect(verifyPin("4821", hash)).toBe(true);
  });

  it("rejette un PIN incorrect", () => {
    const hash = hashPin("4821");
    expect(verifyPin("0000", hash)).toBe(false);
  });

  it("produit un sel différent à chaque hachage (même PIN)", () => {
    const hash1 = hashPin("1234");
    const hash2 = hashPin("1234");
    expect(hash1).not.toBe(hash2);
    expect(verifyPin("1234", hash1)).toBe(true);
    expect(verifyPin("1234", hash2)).toBe(true);
  });
});
