"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import {
  createBranch,
  updateBranch,
  deleteBranch,
} from "@/app/admin/(dashboard)/actions";
import type { Branch } from "@/types/branch";
import type { OpeningHour } from "@/lib/supabase/types";

function BranchForm({
  branch,
  count,
  onDone,
}: {
  branch: Branch | null;
  count: number;
  onDone: () => void;
}) {
  const [hours, setHours] = useState<OpeningHour[]>(
    branch?.hours?.length ? branch.hours : [{ days: "Daily", time: "" }]
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    formData.set("opening_hours", JSON.stringify(hours));
    if (branch) formData.set("id", branch.id);
    startTransition(async () => {
      const action = branch ? updateBranch : createBranch;
      const result = await action(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onDone();
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <Input name="name" label="Branch name" defaultValue={branch?.name ?? ""} required />
      <Textarea
        name="address"
        label="Address"
        defaultValue={branch?.address ?? ""}
        rows={2}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input name="phone" label="Phone" defaultValue={branch?.phone ?? ""} />
        <Input
          name="whatsapp_phone"
          label="WhatsApp number"
          placeholder="96181999162"
          defaultValue={branch?.whatsapp ?? ""}
        />
      </div>
      <Input
        name="google_maps_url"
        label="Google Maps link (optional)"
        placeholder="https://maps.google.com/..."
        defaultValue={branch?.googleMapsUrl ?? ""}
      />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-cream/80">Opening hours</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setHours((h) => [...h, { days: "", time: "" }])}
          >
            <Plus className="h-4 w-4" />
            Add slot
          </Button>
        </div>
        {hours.map((slot, i) => (
          <div key={i} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <Input
              label={i === 0 ? "Days" : undefined}
              value={slot.days}
              onChange={(e) => {
                const next = [...hours];
                next[i] = { ...next[i], days: e.target.value };
                setHours(next);
              }}
              placeholder="Daily"
              className="flex-1"
            />
            <Input
              label={i === 0 ? "Hours" : undefined}
              value={slot.time}
              onChange={(e) => {
                const next = [...hours];
                next[i] = { ...next[i], time: e.target.value };
                setHours(next);
              }}
              placeholder="11:00 AM - 1:00 AM"
              className="flex-1"
            />
            <button
              type="button"
              onClick={() => setHours((h) => h.filter((_, j) => j !== i))}
              className="flex h-11 w-11 shrink-0 items-center justify-center self-end rounded-lg text-red-400 hover:bg-red-500/10"
              aria-label="Remove hours slot"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          name="sort_order"
          label="Sort order"
          type="number"
          defaultValue={branch?.sortOrder ?? count}
        />
        <label className="flex items-center gap-2 self-end pb-2 text-sm text-cream/80">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={branch ? branch.isActive : true}
            className="h-4 w-4 rounded border-white/20 bg-ink"
          />
          Active (visible to customers)
        </label>
      </div>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="submit" variant="accent" isLoading={pending} className="min-h-11 w-full sm:w-auto">
          {branch ? "Save changes" : "Add branch"}
        </Button>
        {branch ? (
          <Button type="button" variant="ghost" onClick={onDone}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}

export function BranchesManager({ branches }: { branches: Branch[] }) {
  const [editing, setEditing] = useState<Branch | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const formSectionRef = useRef<HTMLDivElement>(null);
  const shouldScrollToFormRef = useRef(false);

  function startEdit(branch: Branch) {
    setEditing(branch);
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

  function handleDelete(id: string, name: string) {
    if (!confirm(`Delete branch "${name}"?`)) return;
    startTransition(async () => {
      const result = await deleteBranch(id);
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
      <div ref={formSectionRef} className="admin-card p-4 sm:p-6">
        <h2 className="mb-4 text-lg font-semibold text-cream">
          {editing ? "Edit branch" : "Add branch"}
        </h2>
        <BranchForm
          key={editing?.id ?? "new"}
          branch={editing}
          count={branches.length}
          onDone={() => setEditing(null)}
        />
      </div>

      <div className="admin-card p-4 sm:p-6">
        <h2 className="mb-4 text-lg font-semibold text-cream">
          Branches ({branches.length})
        </h2>
        {error ? <p className="mb-3 text-sm text-red-400">{error}</p> : null}
        <ul className="divide-y divide-white/5">
          {branches.map((branch) => (
            <li
              key={branch.id}
              className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="font-medium text-cream">
                  {branch.name}
                  {!branch.isActive ? (
                    <span className="ml-2 rounded bg-white/10 px-1.5 py-0.5 text-xs text-muted">
                      hidden
                    </span>
                  ) : null}
                </p>
                <p className="truncate text-xs text-muted">
                  {branch.address || "No address"}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => startEdit(branch)}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-cream/60 hover:bg-white/5 hover:text-cream"
                  aria-label={`Edit ${branch.name}`}
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(branch.id, branch.name)}
                  disabled={pending}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-red-400/70 hover:bg-red-500/10 hover:text-red-400"
                  aria-label={`Delete ${branch.name}`}
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
