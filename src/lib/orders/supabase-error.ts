import type { PostgrestError } from "@supabase/supabase-js";

export interface SupabaseErrorDebug {
  table: string;
  payload: Record<string, unknown>;
  code: string | null;
  message: string | null;
  details: string | null;
  hint: string | null;
}

export function buildSupabaseErrorDebug(
  table: string,
  payload: Record<string, unknown>,
  error: PostgrestError
): SupabaseErrorDebug {
  return {
    table,
    payload,
    code: error.code ?? null,
    message: error.message ?? null,
    details: error.details ?? null,
    hint: error.hint ?? null,
  };
}

export function formatSupabaseErrorMessage(error: PostgrestError): string {
  const parts: string[] = [];

  if (error.message) {
    parts.push(error.message);
  }

  if (error.details) {
    parts.push(error.details);
  }

  if (error.hint) {
    parts.push(`Hint: ${error.hint}`);
  }

  if (error.code) {
    parts.push(`(code: ${error.code})`);
  }

  return parts.join(" — ") || "Order submission failed.";
}

export function logSupabaseError(
  context: string,
  debug: SupabaseErrorDebug
): void {
  console.error(`[${context}] Supabase error`, {
    table: debug.table,
    payload: debug.payload,
    code: debug.code,
    message: debug.message,
    details: debug.details,
    hint: debug.hint,
  });
}
