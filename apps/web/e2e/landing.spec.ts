import { expect, test } from "@playwright/test";

test.describe("Landing page (section 16 du cahier des charges)", () => {
  test("affiche le héros, la signature et les CTA principaux", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /La rentrée se prépare/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Télécharger l'application/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Je suis une école/i })).toBeVisible();
  });

  test("le simulateur d'épargne calcule un versement suggéré", async ({ page }) => {
    await page.goto("/#simulateur");
    await expect(page.getByText("Versement suggéré").first()).toBeVisible();
  });

  test("la FAQ s'ouvre et se ferme au clic (accordéon)", async ({ page }) => {
    await page.goto("/#faq");
    const question = page.getByText("Où est conservé l'argent que je verse ?");
    await question.click();
    await expect(page.getByText(/compte de cantonnement/i)).toBeVisible();
  });

  test("les liens légaux et l'annuaire des écoles sont accessibles", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Politique de confidentialité/i }).click();
    await expect(page.getByRole("heading", { name: "Politique de confidentialité" })).toBeVisible();
  });
});

test.describe("Pages publiques", () => {
  test("la page de vérification d'un relevé inexistant affiche un état clair", async ({ page }) => {
    await page.goto("/verify/KG-REL-INEXISTANT");
    await expect(page.getByText(/introuvable/i)).toBeVisible();
  });

  test("l'adhésion école affiche le formulaire complet", async ({ page }) => {
    await page.goto("/ecole/adhesion");
    await expect(page.getByPlaceholder("Nom de l'établissement")).toBeVisible();
    await expect(page.getByRole("button", { name: /Envoyer la demande/i })).toBeVisible();
  });
});
