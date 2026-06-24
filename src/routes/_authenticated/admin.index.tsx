import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminHome,
});

function AdminHome() {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Dashboard</p>
        <h1 className="font-heading text-3xl text-foreground">Welcome to Errika Admin</h1>
      </div>
      <p className="max-w-2xl text-sm text-muted-foreground">
        The admin shell is ready. Content management (packages, portfolio, blog, testimonials),
        the CRM, and the dashboard analytics will be wired up in future sprints.
      </p>
    </div>
  );
}
