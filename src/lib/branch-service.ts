import { cache } from "react";
import { getD1Branches } from "@/lib/cloudflare/content-queries";
import { getContentBackend } from "@/lib/content-backend";
import { createServerClient } from "@/lib/supabase/server";
import { mapBranch } from "@/lib/supabase/branch-mappers";
import { isMissingRelationError } from "@/lib/supabase/errors";
import { staticBranches } from "@/data/branches";
import type { Branch } from "@/types/branch";
import type { BranchRow } from "@/lib/supabase/types";

/** Public: active branches only, ordered. Falls back to static data. */
export const getBranches = cache(async (): Promise<Branch[]> => {
  const backend = getContentBackend();
  if (backend === "static") return staticBranches;
  if (backend === "d1") {
    try {
      const rows = await getD1Branches({ activeOnly: true });
      return rows.length ? rows.map(mapBranch) : staticBranches;
    } catch (error) {
      console.error("[getBranches] D1 query failed", error);
      return staticBranches;
    }
  }

  const supabase = await createServerClient();
  if (!supabase) return staticBranches;

  const { data, error } = await supabase
    .from("branches")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    if (isMissingRelationError(error)) {
      console.error(
        "[getBranches] branches table missing — run migration 017_branches.sql"
      );
    } else {
      console.error("[getBranches]", error.message, error.code);
    }
    return staticBranches;
  }

  if (!data || data.length === 0) return staticBranches;
  return (data as BranchRow[]).map(mapBranch);
});

/** Admin: all branches including inactive, ordered. */
export async function getAllBranches(): Promise<Branch[]> {
  const backend = getContentBackend();
  if (backend === "static") return staticBranches;
  if (backend === "d1") {
    try {
      return (await getD1Branches()).map(mapBranch);
    } catch (error) {
      console.error("[getAllBranches] D1 query failed", error);
      return [];
    }
  }

  const supabase = await createServerClient();
  if (!supabase) return staticBranches;

  const { data, error } = await supabase
    .from("branches")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("[getAllBranches]", error.message, error.code);
    return [];
  }

  return (data as BranchRow[]).map(mapBranch);
}
