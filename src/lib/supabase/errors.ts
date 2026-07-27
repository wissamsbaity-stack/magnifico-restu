/** True when PostgREST/Postgres reports a missing table or schema cache miss. */
export function isMissingRelationError(error: {
  code?: string;
  message?: string;
}): boolean {
  const code = error.code ?? "";
  const message = (error.message ?? "").toLowerCase();

  return (
    code === "PGRST205" ||
    code === "42P01" ||
    message.includes("could not find the table") ||
    message.includes("does not exist") ||
    (message.includes("relation") && message.includes("menu_banners"))
  );
}
