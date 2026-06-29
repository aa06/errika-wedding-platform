import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Tags,
  Images,
  MessageSquareQuote,
  Newspaper,
  Users,
  Settings,
  LogOut,
} from "lucide-react";
import { signOut } from "@/hooks/useAuth";
import { ROLE_LABELS, type AppRole } from "@/lib/roles";

type NavItem = { label: string; to: string; icon: typeof LayoutDashboard };
type NavGroup = { label?: string; items: NavItem[] };

const NAV: NavGroup[] = [
  { items: [{ label: "Dashboard", to: "/admin", icon: LayoutDashboard }] },
  {
    label: "Content",
    items: [
      { label: "Packages", to: "/admin/packages", icon: Package },
      { label: "Categories", to: "/admin/categories", icon: FolderTree },
      { label: "Tags", to: "/admin/tags", icon: Tags },
      { label: "Portfolio", to: "/admin/portfolio", icon: Images },
      { label: "Testimonials", to: "/admin/testimonials", icon: MessageSquareQuote },
      { label: "Blog", to: "/admin/blog", icon: Newspaper },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Leads", to: "/admin/leads", icon: Users },
      { label: "Settings", to: "/admin/settings", icon: Settings },
    ],
  },
];

export interface AdminUser {
  fullName: string | null;
  email: string | null;
  roles: AppRole[];
}

export function AdminLayout({ user, children }: { user: AdminUser; children: ReactNode }) {
  const primaryRole = user.roles[0];
  return (
    <div className="flex min-h-screen bg-sidebar text-sidebar-foreground">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
        <div className="px-5 py-5">
          <Link to="/admin" className="font-heading text-lg tracking-tight">
            Errika · Admin
          </Link>
        </div>
        <nav className="flex-1 space-y-4 px-3" aria-label="Admin">
          {NAV.map((group, gi) => (
            <div key={gi} className="space-y-0.5">
              {group.label ? (
                <div className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/45">
                  {group.label}
                </div>
              ) : null}
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground/85 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    activeProps={{ className: "bg-sidebar-accent text-sidebar-accent-foreground font-medium" }}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="border-t border-sidebar-border p-4">
          <div className="text-sm font-medium">{user.fullName ?? user.email ?? "—"}</div>
          {primaryRole ? (
            <div className="text-xs text-sidebar-foreground/65">{ROLE_LABELS[primaryRole]}</div>
          ) : (
            <div className="text-xs text-warning">No role assigned</div>
          )}
          <button
            type="button"
            onClick={() => void signOut()}
            className="mt-3 inline-flex items-center gap-2 text-xs text-sidebar-foreground/70 hover:text-primary"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col bg-background text-foreground">
        <header className="flex h-14 items-center justify-between border-b border-border bg-card px-5 md:hidden">
          <Link to="/admin" className="font-heading text-base">
            Errika · Admin
          </Link>
          <button type="button" onClick={() => void signOut()} className="text-sm text-muted-foreground">
            Sign out
          </button>
        </header>
        <main className="flex-1 p-5 md:p-8">{children}</main>
      </div>
    </div>
  );
}
