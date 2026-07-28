"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import {
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  reorderMenuItems,
} from "@/app/admin/(dashboard)/actions";
import { ImageCropField } from "@/components/admin/ImageCropField";
import { parseCrop } from "@/lib/image-crop";
import { compareMenuItemRows } from "@/lib/menu-order";
import { useFinePointer } from "@/hooks/useFinePointer";
import type { CategoryRow, MenuItemRow } from "@/lib/supabase/types";
import { cn, formatPrice } from "@/lib/utils";
import { ChevronDown, ChevronUp, GripVertical, Pencil, Search, Trash2, X } from "lucide-react";

export function MenuItemsManager({
  items: initialItems,
  categories,
}: {
  items: MenuItemRow[];
  categories: CategoryRow[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [editing, setEditing] = useState<MenuItemRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterQuery, setFilterQuery] = useState("");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();
  const formSectionRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const shouldScrollToFormRef = useRef(false);

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const canReorder = filterCategory !== "all" && !filterQuery.trim();
  const finePointer = useFinePointer();
  const canDragReorder = canReorder && finePointer;

  function resetForm() {
    setEditing(null);
    setError(null);
    shouldScrollToFormRef.current = false;
  }

  function startEdit(item: MenuItemRow) {
    setEditing(item);
    setError(null);
    shouldScrollToFormRef.current = true;
  }

  useEffect(() => {
    if (!editing || !shouldScrollToFormRef.current) return;
    shouldScrollToFormRef.current = false;

    formSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    const focusTimer = window.setTimeout(() => {
      nameInputRef.current?.focus({ preventScroll: true });
    }, 350);

    return () => window.clearTimeout(focusTimer);
  }, [editing]);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const action = editing ? updateMenuItem : createMenuItem;
      if (editing) formData.set("id", editing.id);
      const result = await action(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      resetForm();
      router.refresh();
    });
  }

  function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"?`)) return;
    startTransition(async () => {
      const result = await deleteMenuItem(id);
      if (!result.ok) setError(result.error);
      else router.refresh();
    });
  }

  const categoryMap = Object.fromEntries(
    categories.map((c) => [c.id, c.name])
  );

  const countByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of items) {
      counts[item.category_id] = (counts[item.category_id] ?? 0) + 1;
    }
    return counts;
  }, [items]);

  const filteredItems = useMemo(() => {
    const q = filterQuery.trim().toLowerCase();
    const filtered = items.filter((item) => {
      const matchesCategory =
        filterCategory === "all" || item.category_id === filterCategory;
      const matchesQuery = !q || item.name.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
    return [...filtered].sort(compareMenuItemRows);
  }, [items, filterCategory, filterQuery]);

  const commitReorder = useCallback(
    (reordered: MenuItemRow[]) => {
      setItems((prev) => {
        const ids = new Set(reordered.map((item) => item.id));
        const others = prev.filter((item) => !ids.has(item.id));
        const updated = reordered.map((item, index) => ({
          ...item,
          display_order: index,
        }));
        return [...others, ...updated];
      });

      startTransition(async () => {
        const result = await reorderMenuItems(
          filterCategory,
          reordered.map((item) => item.id)
        );
        if (!result.ok) {
          setError(result.error);
          router.refresh();
        }
      });
    },
    [filterCategory, router]
  );

  const handleDrop = useCallback(
    (dropIndex: number) => {
      if (!canReorder || dragIndex === null || dragIndex === dropIndex) return;

      const reordered = [...filteredItems];
      const [moved] = reordered.splice(dragIndex, 1);
      reordered.splice(dropIndex, 0, moved);
      setDragIndex(null);
      commitReorder(reordered);
    },
    [canReorder, dragIndex, filteredItems, commitReorder]
  );

  const moveItem = useCallback(
    (index: number, direction: -1 | 1) => {
      if (!canReorder) return;
      const target = index + direction;
      if (target < 0 || target >= filteredItems.length) return;

      const reordered = [...filteredItems];
      const [moved] = reordered.splice(index, 1);
      reordered.splice(target, 0, moved);
      commitReorder(reordered);
    },
    [canReorder, filteredItems, commitReorder]
  );

  const pillClass = (active: boolean) =>
    cn(
      "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
      active
        ? "bg-accent text-white"
        : "bg-white/5 text-cream/70 hover:bg-white/10 hover:text-cream"
    );

  return (
    <div className="space-y-6 sm:space-y-8">
      <div
        ref={formSectionRef}
        id="menu-item-form"
        className={`admin-card scroll-mt-20 p-4 transition-colors sm:p-6 ${
          editing
            ? "border-accent/50 ring-2 ring-accent/20 shadow-[0_0_0_1px_rgb(var(--color-accent)/0.15)]"
            : ""
        }`}
      >
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-cream">
            {editing ? "Edit menu item" : "Add menu item"}
          </h2>
          {editing ? (
            <span className="inline-flex items-center rounded-full bg-accent/15 px-3 py-1 text-xs font-medium text-accent">
              Editing: {editing.name}
            </span>
          ) : null}
        </div>
        <form
          key={editing?.id ?? "new"}
          action={handleSubmit}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          <Input
            ref={nameInputRef}
            name="name"
            label="Name"
            defaultValue={editing?.name ?? ""}
            required
            className="sm:col-span-2"
          />
          <div className="space-y-2 sm:col-span-2">
            <label className="block text-sm font-medium text-cream/80">
              Category
            </label>
            <select
              name="category_id"
              defaultValue={editing?.category_id ?? categories[0]?.id}
              required
              className="min-h-11 w-full rounded-xl border border-white/10 bg-ink px-4 py-3 text-base text-cream focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/20 sm:text-sm"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <Textarea
            name="description"
            label="Description"
            defaultValue={editing?.description ?? ""}
            rows={3}
            className="sm:col-span-2"
          />
          <Input
            name="price"
            label="Price (USD)"
            type="number"
            min={0}
            step="any"
            defaultValue={editing?.price ?? ""}
            required
          />

          <div className="sm:col-span-2">
            <ImageCropField
              name="image_url"
              cropName="image_crop"
              label="Image"
              defaultUrl={editing?.image_url ?? ""}
              defaultCrop={parseCrop(editing?.image_crop)}
              previewRatio={1}
              helpText="Shown on product cards as a square. Compressed automatically (max 5 MB)."
            />
          </div>

          <label className="flex min-h-11 items-center gap-3 text-sm text-cream/80">
            <input
              type="checkbox"
              name="is_popular"
              defaultChecked={editing?.is_popular ?? false}
              className="h-5 w-5 rounded border-white/20"
            />
            Popular
          </label>
          <label className="flex min-h-11 items-center gap-3 text-sm text-cream/80">
            <input
              type="checkbox"
              name="is_best_seller"
              defaultChecked={editing?.is_best_seller ?? false}
              className="h-5 w-5 rounded border-white/20"
            />
            Best Seller
          </label>
          <label className="flex min-h-11 items-center gap-3 text-sm text-cream/80 sm:col-span-2">
            <input
              type="checkbox"
              name="is_available"
              defaultChecked={editing?.is_available ?? true}
              className="h-5 w-5 rounded border-white/20"
            />
            Available on menu
          </label>

          {error ? (
            <p className="text-sm text-red-400 sm:col-span-2">{error}</p>
          ) : null}
          <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row">
            <Button type="submit" variant="accent" isLoading={pending} className="min-h-11 w-full sm:w-auto">
              {editing ? "Save changes" : "Add item"}
            </Button>
            {editing ? (
              <Button type="button" variant="ghost" onClick={resetForm}>
                <X className="h-4 w-4" />
                Cancel edit
              </Button>
            ) : null}
          </div>
        </form>
      </div>

      <div className="admin-card p-4 sm:p-6">
        <div className="mb-4 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-cream">Menu items</h2>
            <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-muted">
              Showing {filteredItems.length} of {items.length}
            </span>
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Search items by name..."
              className="min-h-11 w-full rounded-xl border border-white/10 bg-ink py-2.5 pl-10 pr-4 text-base text-cream placeholder:text-muted focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/20 sm:text-sm"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFilterCategory("all")}
              className={pillClass(filterCategory === "all")}
            >
              All Items
              <span className="text-xs opacity-70">{items.length}</span>
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setFilterCategory(cat.id)}
                className={pillClass(filterCategory === cat.id)}
              >
                {cat.name}
                <span className="text-xs opacity-70">
                  {countByCategory[cat.id] ?? 0}
                </span>
              </button>
            ))}
          </div>

          <p className="text-sm text-muted">
            {canReorder
              ? finePointer
                ? "Use the arrows or drag the handle to reorder. Order matches the live menu."
                : "Use the ↑ ↓ buttons to reorder. Order matches the live menu."
              : filterQuery.trim()
                ? "Clear search to reorder items."
                : "Select a category to reorder items."}
          </p>
        </div>

        {filteredItems.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted">
            No items match your filters.
          </p>
        ) : (
          <>
            <ul className="divide-y divide-white/5 md:hidden">
              {filteredItems.map((item, index) => (
                <li
                  key={item.id}
                  className="flex items-start justify-between gap-3 py-4 first:pt-0 last:pb-0"
                >
                  <div className="flex min-w-0 flex-1 items-start gap-2">
                    {canReorder ? (
                      <div className="flex shrink-0 flex-col gap-1">
                        <button
                          type="button"
                          disabled={index === 0 || pending}
                          onClick={() => moveItem(index, -1)}
                          className="flex h-11 w-11 touch-manipulation items-center justify-center rounded-lg border border-white/10 bg-white/5 text-cream/70 active:bg-white/10 disabled:opacity-30"
                          aria-label={`Move ${item.name} up`}
                        >
                          <ChevronUp className="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          disabled={
                            index === filteredItems.length - 1 || pending
                          }
                          onClick={() => moveItem(index, 1)}
                          className="flex h-11 w-11 touch-manipulation items-center justify-center rounded-lg border border-white/10 bg-white/5 text-cream/70 active:bg-white/10 disabled:opacity-30"
                          aria-label={`Move ${item.name} down`}
                        >
                          <ChevronDown className="h-5 w-5" />
                        </button>
                      </div>
                    ) : null}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-cream">{item.name}</p>
                      <p className="mt-0.5 text-sm text-muted">
                        {categoryMap[item.category_id] ?? item.category_id}
                      </p>
                      <p className="mt-1 text-sm text-cream">
                        {formatPrice(Number(item.price))}
                      </p>
                      <span
                        className={
                          item.is_available
                            ? "mt-1 inline-block text-xs text-green-400"
                            : "mt-1 inline-block text-xs text-red-400"
                        }
                      >
                        {item.is_available ? "Available" : "Hidden"}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => startEdit(item)}
                      className="flex h-11 w-11 items-center justify-center rounded-lg text-cream/60 hover:bg-white/5"
                      aria-label={`Edit ${item.name}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id, item.name)}
                      className="flex h-11 w-11 items-center justify-center rounded-lg text-red-400/70 hover:bg-red-500/10"
                      aria-label={`Delete ${item.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="hidden max-h-[60vh] overflow-auto rounded-xl border border-white/5 md:block">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="sticky top-0 z-10">
                  <tr className="text-muted">
                    {canReorder ? (
                      <th className="w-10 border-b border-white/10 bg-surface-raised px-2 py-3 font-medium" />
                    ) : null}
                    <th className="border-b border-white/10 bg-surface-raised px-4 py-3 font-medium">Item</th>
                    <th className="border-b border-white/10 bg-surface-raised px-4 py-3 font-medium">Category</th>
                    <th className="border-b border-white/10 bg-surface-raised px-4 py-3 font-medium">Price</th>
                    <th className="border-b border-white/10 bg-surface-raised px-4 py-3 font-medium">Status</th>
                    <th className="border-b border-white/10 bg-surface-raised px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredItems.map((item, index) => (
                    <tr
                      key={item.id}
                      draggable={canDragReorder}
                      onDragStart={() => canDragReorder && setDragIndex(index)}
                      onDragOver={(e) => canDragReorder && e.preventDefault()}
                      onDrop={() => handleDrop(index)}
                      onDragEnd={() => setDragIndex(null)}
                      className={cn(
                        "transition-colors hover:bg-white/[0.02]",
                        dragIndex === index && "opacity-50"
                      )}
                    >
                      {canReorder ? (
                        <td className="px-2 py-3">
                          <div className="flex flex-col items-center gap-1">
                            <button
                              type="button"
                              disabled={index === 0 || pending}
                              onClick={() => moveItem(index, -1)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-cream/50 hover:bg-white/5 hover:text-cream disabled:opacity-30"
                              aria-label={`Move ${item.name} up`}
                            >
                              <ChevronUp className="h-4 w-4" />
                            </button>
                            <span
                              className={cn(
                                "text-cream/40",
                                canDragReorder
                                  ? "cursor-grab active:cursor-grabbing"
                                  : "opacity-40"
                              )}
                              aria-hidden
                            >
                              <GripVertical className="h-4 w-4" />
                            </span>
                            <button
                              type="button"
                              disabled={
                                index === filteredItems.length - 1 || pending
                              }
                              onClick={() => moveItem(index, 1)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-cream/50 hover:bg-white/5 hover:text-cream disabled:opacity-30"
                              aria-label={`Move ${item.name} down`}
                            >
                              <ChevronDown className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      ) : null}
                      <td className="px-4 py-3">
                        <p className="font-medium text-cream">{item.name}</p>
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {categoryMap[item.category_id] ?? item.category_id}
                      </td>
                      <td className="px-4 py-3 text-cream">
                        {formatPrice(Number(item.price))}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            item.is_available
                              ? "text-green-400"
                              : "text-red-400"
                          }
                        >
                          {item.is_available ? "Available" : "Hidden"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(item)}
                            className="flex h-10 w-10 items-center justify-center rounded-lg text-cream/60 hover:bg-white/5"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id, item.name)}
                            className="flex h-10 w-10 items-center justify-center rounded-lg text-red-400/70 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
