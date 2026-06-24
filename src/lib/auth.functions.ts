import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { AppRole } from "@/lib/roles";

/**
 * Returns the current signed-in user, their profile, and their assigned roles.
 * Used by the admin shell to drive permission-aware UI.
 */
export const getCurrentUserWithRoles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId, claims } = context;
    const [{ data: profile }, { data: rolesRows }] = await Promise.all([
      supabase.from("profiles").select("id, full_name, avatar_url, phone").eq("id", userId).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
    ]);
    const roles: AppRole[] = (rolesRows ?? []).map((r) => r.role as AppRole);
    return {
      userId,
      email: (claims.email as string | undefined) ?? null,
      profile: profile ?? null,
      roles,
    };
  });
