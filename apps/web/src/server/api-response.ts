import { NextResponse } from "next/server";
import type { ZodError } from "zod";

/** Format d'erreur uniforme de l'API — section 14 : "Normes de l'API". */
export function apiError(code: string, message: string, status: number, details?: unknown) {
  return NextResponse.json({ code, message, details: details ?? null }, { status });
}

export function apiOk<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function apiValidationError(error: ZodError) {
  return apiError("VALIDATION_ERROR", "La requête ne respecte pas le schéma attendu.", 422, error.flatten());
}

export const apiErrors = {
  unauthorized: () => apiError("UNAUTHORIZED", "Authentification requise.", 401),
  forbidden: (message = "Accès refusé pour ce rôle.") => apiError("FORBIDDEN", message, 403),
  notFound: (entity: string) => apiError("NOT_FOUND", `${entity} introuvable.`, 404),
  conflict: (message: string) => apiError("CONFLICT", message, 409),
  rateLimited: () => apiError("RATE_LIMITED", "Trop de requêtes, réessayez plus tard.", 429),
  internal: (message = "Erreur interne.") => apiError("INTERNAL_ERROR", message, 500),
};
