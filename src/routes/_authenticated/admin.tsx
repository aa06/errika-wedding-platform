import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { getCurrentUserWithRoles } from "@/lib/auth.functions";
import { buildMeta } from "@/lib/seo/meta";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => buildMeta({ title: "Admin", description: "Errika admin console.", noindex: true }),
  component: AdminShell,
});

function AdminShell() {
  const navigate = useNavigate();
  const { data, isLoading, error } = useQuery({
    queryKey: ["current-user-with-roles"],
    queryFn: () => getCurrentUserWithRoles(),
  });

  useEffect(() => {
    if (!isLoading && data && data.roles.length === 0) {
      // Signed in but no role assigned — block from admin.
      // (Future: dedicated /unauthorized route.)
    }
  }, [data, isLoading]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading admin…
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-4 text-center">
        <h1 className="font-heading text-xl">Unable to load admin session</h1>
        <p className="text-sm text-muted-foreground">Please sign in again.</p>
        <button
          type="button"
          onClick={() => navigate({ to: "/auth", replace: true })}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Go to sign in
        </button>
      </div>
    );
  }

  if (data.roles.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-4 text-center">
        <p className="font-heading text-6xl text-primary">403</p>
        <h1 className="font-heading text-xl">No role assigned</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Your account doesn't have an admin role yet. Ask the Super Admin to grant access.
        </p>
      </div>
    );
  }

  return (
    <AdminLayout
      user={{
        fullName: data.profile?.full_name ?? null,
        email: data.email,
        roles: data.roles,
      }}
    >
      <Outlet />
    </AdminLayout>
  );
}
