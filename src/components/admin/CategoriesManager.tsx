"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/app/admin/(dashboard)/actions";
import type { CategoryRow } from "@/lib/supabase/types";
import { Pencil, Trash2 } from "lucide-react";

export function CategoriesManager({
  categories,
}: {
  categories: CategoryRow[];
}) {
  const [editing, setEditing] = useState<CategoryRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const formSectionRef = useRef<HTMLDivElement>(null);
  const shouldScrollToFormRef = useRef(false);

  function startEdit(category: CategoryRow) {
    setEditing(category);
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
  }, [editing]);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const action = editing ? updateCategory : createCategory;
      if (editing) formData.set("id", editing.id);
      const result = await action(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setEditing(null);
    });
  }

  function handleDelete(id: string, name: string) {
    if (!confirm(`Delete category "${name}"? Menu items in this category may be affected.`)) {
      return;
    }
    startTransition(async () => {
      const result = await deleteCategory(id);
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
      <div ref={formSectionRef} className="admin-card p-4 sm:p-6">
        <h2 className="mb-4 text-lg font-semibold text-cream">
          {editing ? "Edit category" : "Add category"}
        </h2>
        <form
          key={editing?.id ?? "new"}
          action={handleSubmit}
          className="space-y-4"
        >
          <Input
            name="name"
            label="Name"
            defaultValue={editing?.name ?? ""}
            required
          />
          <Input
            name="sort_order"
            label="Sort order"
            type="number"
            defaultValue={editing?.sort_order ?? categories.length}
          />
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="submit" variant="accent" isLoading={pending} className="min-h-11 w-full sm:w-auto">
              {editing ? "Save changes" : "Add category"}
            </Button>
            {editing ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setEditing(null);
                  setError(null);
                }}
              >
                Cancel
              </Button>
            ) : null}
          </div>
        </form>
      </div>

      <div className="admin-card p-4 sm:p-6">
        <h2 className="mb-4 text-lg font-semibold text-cream">
          Categories ({categories.length})
        </h2>
        <ul className="divide-y divide-white/5">
          {categories.map((cat) => (
            <li
              key={cat.id}
              className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="font-medium text-cream">{cat.name}</p>
                <p className="text-xs text-muted">
                  {cat.slug} · order {cat.sort_order}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => startEdit(cat)}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-cream/60 hover:bg-white/5 hover:text-cream"
                  aria-label={`Edit ${cat.name}`}
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(cat.id, cat.name)}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-red-400/70 hover:bg-red-500/10 hover:text-red-400"
                  aria-label={`Delete ${cat.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
