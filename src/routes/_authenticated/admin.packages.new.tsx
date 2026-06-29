import { createFileRoute } from "@tanstack/react-router";
import { PackageForm } from "@/components/admin/PackageForm";
import { buildMeta } from "@/lib/seo/meta";

export const Route = createFileRoute("/_authenticated/admin/packages/new")({
  head: () => buildMeta({ title: "New Package — Admin", description: "Create a new wedding package.", noindex: true }),
  component: NewPackagePage,
});

function NewPackagePage() {
  return <PackageForm />;
}
