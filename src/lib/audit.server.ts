/**
 * Audit logging helper. Server-only — `*.server.ts` blocks any client import.
 * Call from authenticated server functions after admin writes.
 */
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type AuditAction = "INSERT" | "UPDATE" | "DELETE" | "PUBLISH" | "ARCHIVE" | "LOGIN" | "LOGOUT";

export async function writeAuditLog(input: {
  actorId: string | null;
  tableName: string;
  rowId?: string | null;
  action: AuditAction;
  diff?: Record<string, unknown>;
}) {
  await supabaseAdmin.from("audit_logs").insert({
    actor_id: input.actorId,
    table_name: input.tableName,
    row_id: input.rowId ?? null,
    action: input.action,
    diff: (input.diff ?? null) as never,
  });
}
