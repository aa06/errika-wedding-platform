export const APP_ROLES = ["super_admin", "content_admin", "sales_admin", "wedding_planner"] as const;
export type AppRole = (typeof APP_ROLES)[number];

export const ROLE_LABELS: Record<AppRole, string> = {
  super_admin: "Super Admin",
  content_admin: "Content Admin",
  sales_admin: "Sales Admin",
  wedding_planner: "Wedding Planner",
};

export function isAdminRole(role: AppRole): boolean {
  return role === "super_admin" || role === "content_admin";
}
