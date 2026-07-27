import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import type { ProfileRow } from "@/lib/supabase/types";

export async function requireStaff() {
  const supabase = await createServerClient();
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/orders/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, email, full_name, role")
    .eq("id", user.id)
    .single();

  const typedProfile = profile as ProfileRow | null;

  if (
    profileError ||
    !typedProfile ||
    !["admin", "staff"].includes(typedProfile.role)
  ) {
    redirect("/orders/login?error=unauthorized");
  }

  return { supabase, user, profile: typedProfile };
}
