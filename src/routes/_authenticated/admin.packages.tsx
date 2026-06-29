import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { buildMeta } from "@/lib/seo/meta";
import {
  deletePackage, getAdminPackages, getPackageCategoriesAdmin,
  type AdminPackageStatus,
} from "@/lib/admin-packages.functions";

export const Route = createFileRoute("/_authenticated/admin/packages")({
  head: () => buildMeta({ title: "Packages — Admin", description: "Manage wedding packages.", noindex: true }),
  component: PackagesListPage,
});

const formatIDR = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

function StatusBadge({ status }: { status: AdminPackageStatus }) {
  const variants: Record<AdminPackageStatus, string> = {
    draft: "bg-muted text-muted-foreground",
    published: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
    archived: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  };
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${variants[status]}`}>{status}</span>;
}

function PackagesListPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [categoryId, setCategoryId] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [sort, setSort] = useState<"sort_order" | "title">("sort_order");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const cats = useQuery({ queryKey: ["admin", "pkg-categories"], queryFn: () => getPackageCategoriesAdmin() });
  const list = useQuery({
    queryKey: ["admin", "packages", categoryId, status, sort],
    queryFn: () =>
      getAdminPackages({
        data: {
          category_id: categoryId === "all" ? null : categoryId,
          status: status === "all" ? null : (status as AdminPackageStatus),
          sort,
        },
      }),
  });

  const deleteFn = useServerFn(deletePackage);
  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Package deleted");
      setDeletingId(null);
      qc.invalidateQueries({ queryKey: ["admin", "packages"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const target = useMemo(() => list.data?.find((p) => p.id === deletingId) ?? null, [list.data, deletingId]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Content</p>
          <h1 className="font-heading text-3xl text-foreground">Packages</h1>
          <p className="mt-1 text-sm text-muted-foreground">All wedding packages, including drafts.</p>
        </div>
        <Button onClick={() => navigate({ to: "/admin/packages/new" })}>
          <Plus className="mr-1 h-4 w-4" /> New Package
        </Button>
      </header>

      <section className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-3">
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger className="w-56"><SelectValue placeholder="All categories" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {cats.data?.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-40"><SelectValue placeholder="All statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(v) => setSort(v as "sort_order" | "title")}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="sort_order">Sort: order</SelectItem>
            <SelectItem value="title">Sort: title</SelectItem>
          </SelectContent>
        </Select>
      </section>

      <section className="rounded-lg border border-border bg-card">
        {list.isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading…</div>
        ) : list.data && list.data.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Thumb</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price From</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-16">Sort</TableHead>
                <TableHead className="w-32 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.data.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    {p.thumbnail_url ? (
                      <img src={p.thumbnail_url} alt="" className="h-10 w-14 rounded object-cover" loading="lazy" />
                    ) : (<div className="h-10 w-14 rounded bg-muted" />)}
                  </TableCell>
                  <TableCell>
                    <Link to="/admin/packages/$id/edit" params={{ id: p.id }} className="font-medium hover:text-primary">
                      {p.title}
                    </Link>
                    <div className="text-xs text-muted-foreground">/{p.slug}</div>
                  </TableCell>
                  <TableCell>{p.category ? <Badge variant="outline">{p.category.name}</Badge> : "—"}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {formatIDR(p.promo_price_idr ?? p.normal_price_idr)}
                    {p.promo_price_idr ? <span className="ml-1 text-muted-foreground line-through">{formatIDR(p.normal_price_idr)}</span> : null}
                  </TableCell>
                  <TableCell><StatusBadge status={p.status} /></TableCell>
                  <TableCell>{p.sort_order}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="ghost" asChild>
                        <Link to="/admin/packages/$id/edit" params={{ id: p.id }}><Pencil className="h-4 w-4" /></Link>
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setDeletingId(p.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="space-y-3 p-10 text-center">
            <p className="text-sm text-muted-foreground">No packages yet.</p>
            <Button onClick={() => navigate({ to: "/admin/packages/new" })}>
              <Plus className="mr-1 h-4 w-4" /> Create your first package
            </Button>
          </div>
        )}
      </section>

      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{target?.title}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the package, its media, videos, benefits, FAQs, rules, and tag mappings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deletingId && deleteMut.mutate(deletingId)}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
