import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { PackageForm } from "@/components/admin/PackageForm";
import { getAdminPackageById } from "@/lib/admin-packages.functions";
import { buildMeta } from "@/lib/seo/meta";

export const Route = createFileRoute("/_authenticated/admin/packages/$id/edit")({
  head: () => buildMeta({ title: "Edit Package — Admin", description: "Edit wedding package.", noindex: true }),
  component: EditPackagePage,
});

function EditPackagePage() {
  const { id } = Route.useParams();
  const q = useQuery({
    queryKey: ["admin", "package", id],
    queryFn: () => getAdminPackageById({ data: { id } }),
  });

  if (q.isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading package…
      </div>
    );
  }
  if (q.error || !q.data) {
    return (
      <div className="p-10 text-center">
        <p className="text-sm text-destructive">
          {q.error instanceof Error ? q.error.message : "Package not found."}
        </p>
      </div>
    );
  }
  return <PackageForm initial={q.data} />;
}
