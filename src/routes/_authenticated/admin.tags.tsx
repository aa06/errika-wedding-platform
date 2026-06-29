import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { buildMeta } from "@/lib/seo/meta";
import { SlugInput, slugify } from "@/components/admin/SlugInput";
import {
  createPackageTag, deletePackageTag, getPackageTagsAdmin, updatePackageTag,
  type AdminPackageTag,
} from "@/lib/admin-packages.functions";

export const Route = createFileRoute("/_authenticated/admin/tags")({
  head: () => buildMeta({ title: "Package Tags — Admin", description: "Manage package tags.", noindex: true }),
  component: TagsPage,
});

function TagBadge({ color, name }: { color: string | null; name: string }) {
  return (
    <span
      className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium"
      style={{ borderColor: color ?? undefined, color: color ?? undefined, background: color ? `${color}14` : undefined }}
    >
      {name}
    </span>
  );
}

function TagsPage() {
  const qc = useQueryClient();
  const list = useQuery({ queryKey: ["admin", "pkg-tags"], queryFn: () => getPackageTagsAdmin() });
  const createFn = useServerFn(createPackageTag);
  const updateFn = useServerFn(updatePackageTag);
  const deleteFn = useServerFn(deletePackageTag);
  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin", "pkg-tags"] });

  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newSlugLocked, setNewSlugLocked] = useState(true);
  const [newColor, setNewColor] = useState("#C6A46A");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<AdminPackageTag>>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const createMut = useMutation({
    mutationFn: () =>
      createFn({ data: { name: newName.trim(), slug: newSlug || slugify(newName), color: newColor, is_active: true } }),
    onSuccess: () => {
      toast.success("Tag created");
      setNewName(""); setNewSlug(""); setNewColor("#C6A46A"); setNewSlugLocked(true);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const updateMut = useMutation({
    mutationFn: (patch: { id: string } & Partial<AdminPackageTag>) => updateFn({ data: patch }),
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
        <h1 className="font-heading text-3xl text-foreground">Package Tags</h1>
        <p className="mt-1 text-sm text-muted-foreground">Color-coded tags (e.g. Best Seller, Promo).</p>
      </header>

      <section className="rounded-lg border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-medium">Add new tag</h2>
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_140px_auto]">
          <Input placeholder="Name (e.g. Best Seller)" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <SlugInput value={newSlug} onChange={setNewSlug} sourceValue={newName} locked={newSlugLocked} onLockChange={setNewSlugLocked} />
          <div className="flex items-center gap-2">
            <input type="color" value={newColor} onChange={(e) => setNewColor(e.target.value)} className="h-9 w-12 cursor-pointer rounded border border-border bg-background" />
            <Input value={newColor} onChange={(e) => setNewColor(e.target.value)} className="font-mono text-xs" />
          </div>
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
                <TableHead>Preview</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead className="w-32">Color</TableHead>
                <TableHead className="w-24">Active</TableHead>
                <TableHead className="w-32 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.data.map((t) => {
                const editing = editingId === t.id;
                const v = editing ? { ...t, ...editDraft } : t;
                return (
                  <TableRow key={t.id}>
                    <TableCell><TagBadge color={v.color ?? null} name={v.name ?? t.name} /></TableCell>
                    <TableCell>
                      {editing ? (
                        <Input value={v.name ?? ""} onChange={(e) => setEditDraft((d) => ({ ...d, name: e.target.value }))} />
                      ) : (<span className="font-medium">{t.name}</span>)}
                    </TableCell>
                    <TableCell>
                      {editing ? (
                        <Input className="font-mono text-xs" value={v.slug ?? ""} onChange={(e) => setEditDraft((d) => ({ ...d, slug: slugify(e.target.value) }))} />
                      ) : (<code className="text-xs text-muted-foreground">{t.slug}</code>)}
                    </TableCell>
                    <TableCell>
                      {editing ? (
                        <div className="flex items-center gap-2">
                          <input type="color" value={v.color ?? "#C6A46A"} onChange={(e) => setEditDraft((d) => ({ ...d, color: e.target.value }))} className="h-8 w-10 cursor-pointer rounded border border-border bg-background" />
                          <Input value={v.color ?? ""} onChange={(e) => setEditDraft((d) => ({ ...d, color: e.target.value }))} className="font-mono text-xs" />
                        </div>
                      ) : (
                        <code className="text-xs text-muted-foreground">{t.color ?? "—"}</code>
                      )}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={v.is_active ?? true}
                        onCheckedChange={(checked) => {
                          if (editing) setEditDraft((d) => ({ ...d, is_active: checked }));
                          else updateMut.mutate({ id: t.id, is_active: checked });
                        }}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      {editing ? (
                        <div className="flex justify-end gap-1">
                          <Button size="sm" variant="ghost" onClick={() => { setEditingId(null); setEditDraft({}); }}>
                            <X className="h-4 w-4" />
                          </Button>
                          <Button size="sm" onClick={() => updateMut.mutate({ id: t.id, ...editDraft })} disabled={updateMut.isPending}>
                            <Save className="mr-1 h-4 w-4" /> Save
                          </Button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-1">
                          <Button size="sm" variant="ghost" onClick={() => { setEditingId(t.id); setEditDraft({}); }}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setDeletingId(t.id)}>
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
          <div className="p-8 text-center text-sm text-muted-foreground">No tags yet.</div>
        )}
      </section>

      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete tag?</AlertDialogTitle>
            <AlertDialogDescription>This will remove the tag from all packages it's assigned to.</AlertDialogDescription>
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
