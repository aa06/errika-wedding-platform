import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { buildMeta } from "@/lib/seo/meta";
import { SlugInput, slugify } from "@/components/admin/SlugInput";
import {
  createPackageCategory, deletePackageCategory, getPackageCategoriesAdmin, updatePackageCategory,
  type AdminPackageCategory,
} from "@/lib/admin-packages.functions";

export const Route = createFileRoute("/_authenticated/admin/categories")({
  head: () => buildMeta({ title: "Package Categories — Admin", description: "Manage package categories.", noindex: true }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const qc = useQueryClient();
  const list = useQuery({ queryKey: ["admin", "pkg-categories"], queryFn: () => getPackageCategoriesAdmin() });
  const createFn = useServerFn(createPackageCategory);
  const updateFn = useServerFn(updatePackageCategory);
  const deleteFn = useServerFn(deletePackageCategory);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin", "pkg-categories"] });

  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newSlugLocked, setNewSlugLocked] = useState(true);
  const [newSort, setNewSort] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<AdminPackageCategory>>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const createMut = useMutation({
    mutationFn: () =>
      createFn({ data: { name: newName.trim(), slug: newSlug || slugify(newName), sort_order: newSort, is_active: true } }),
    onSuccess: () => {
      toast.success("Category created");
      setNewName(""); setNewSlug(""); setNewSort(0); setNewSlugLocked(true);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMut = useMutation({
    mutationFn: (patch: { id: string } & Partial<AdminPackageCategory>) => updateFn({ data: patch }),
    onSuccess: () => { toast.success("Saved"); setEditingId(null); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => { toast.success("Deleted"); setDeletingId(null); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Content</p>
        <h1 className="font-heading text-3xl text-foreground">Package Categories</h1>
        <p className="mt-1 text-sm text-muted-foreground">Categories shown on the public packages page.</p>
      </header>

      <section className="rounded-lg border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-medium">Add new category</h2>
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_120px_auto]">
          <Input placeholder="Name (e.g. Wedding Gedung)" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <SlugInput value={newSlug} onChange={setNewSlug} sourceValue={newName} locked={newSlugLocked} onLockChange={setNewSlugLocked} />
          <Input type="number" placeholder="Sort" value={newSort} onChange={(e) => setNewSort(Number(e.target.value) || 0)} />
          <Button onClick={() => createMut.mutate()} disabled={!newName.trim() || createMut.isPending}>
            <Plus className="mr-1 h-4 w-4" /> Add
          </Button>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card">
        {list.isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading…</div>
        ) : list.data && list.data.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead className="w-24">Sort</TableHead>
                <TableHead className="w-24">Active</TableHead>
                <TableHead className="w-32 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.data.map((c) => {
                const editing = editingId === c.id;
                const v = editing ? { ...c, ...editDraft } : c;
                return (
                  <TableRow key={c.id}>
                    <TableCell>
                      {editing ? (
                        <Input value={v.name ?? ""} onChange={(e) => setEditDraft((d) => ({ ...d, name: e.target.value }))} />
                      ) : (<span className="font-medium">{c.name}</span>)}
                    </TableCell>
                    <TableCell>
                      {editing ? (
                        <Input className="font-mono text-xs" value={v.slug ?? ""} onChange={(e) => setEditDraft((d) => ({ ...d, slug: slugify(e.target.value) }))} />
                      ) : (<code className="text-xs text-muted-foreground">{c.slug}</code>)}
                    </TableCell>
                    <TableCell>
                      {editing ? (
                        <Input type="number" value={v.sort_order ?? 0} onChange={(e) => setEditDraft((d) => ({ ...d, sort_order: Number(e.target.value) || 0 }))} />
                      ) : c.sort_order}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={v.is_active ?? true}
                        onCheckedChange={(checked) => {
                          if (editing) setEditDraft((d) => ({ ...d, is_active: checked }));
                          else updateMut.mutate({ id: c.id, is_active: checked });
                        }}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      {editing ? (
                        <div className="flex justify-end gap-1">
                          <Button size="sm" variant="ghost" onClick={() => { setEditingId(null); setEditDraft({}); }}>
                            <X className="h-4 w-4" />
                          </Button>
                          <Button size="sm" onClick={() => updateMut.mutate({ id: c.id, ...editDraft })} disabled={updateMut.isPending}>
                            <Save className="mr-1 h-4 w-4" /> Save
                          </Button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-1">
                          <Button size="sm" variant="ghost" onClick={() => { setEditingId(c.id); setEditDraft({}); }}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setDeletingId(c.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="p-8 text-center text-sm text-muted-foreground">No categories yet.</div>
        )}
      </section>

      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete category?</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone. Packages assigned to this category will block the deletion.
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
