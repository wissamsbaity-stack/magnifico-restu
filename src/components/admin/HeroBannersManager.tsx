"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  createMenuBanner,
  deleteMenuBanner,
  reorderMenuBanners,
  toggleMenuBanner,
  updateMenuBanner,
} from "@/app/admin/(dashboard)/actions";
import { ImageCropField } from "@/components/admin/ImageCropField";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { mapMenuBanner } from "@/lib/supabase/banner-mappers";
import { parseCrop } from "@/lib/image-crop";
import type { Database } from "@/lib/supabase/types";
import type { MenuBanner } from "@/types/banner";
import { cn } from "@/lib/utils";
import {
  Eye,
  EyeOff,
  GripVertical,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

const HomeHeroCarousel = dynamic(
  () =>
    import("@/components/home/HomeHeroCarousel").then((m) => m.HomeHeroCarousel),
  {
    ssr: false,
    loading: () => (
      <div className="h-40 animate-pulse rounded-xl bg-white/5 sm:h-52" />
    ),
  }
);

type MenuBannerRow = Database["public"]["Tables"]["menu_banners"]["Row"];

const BANNER_RATIO = 16 / 9;

export function HeroBannersManager({
  banners: initialBanners = [],
  schemaReady = true,
  loadError = null,
}: {
  banners?: MenuBannerRow[];
  schemaReady?: boolean;
  loadError?: string | null;
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialBanners);
  const [editing, setEditing] = useState<MenuBannerRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const [draftUrl, setDraftUrl] = useState("");
  const [draftCrop, setDraftCrop] = useState<ReturnType<typeof parseCrop>>(null);
  const [draftCaption, setDraftCaption] = useState("");
  const [draftClickLink, setDraftClickLink] = useState("");
  const [draftEnabled, setDraftEnabled] = useState(true);

  useEffect(() => {
    setItems(initialBanners);
  }, [initialBanners]);

  function resetForm() {
    setEditing(null);
    setDraftUrl("");
    setDraftCrop(null);
    setDraftCaption("");
    setDraftClickLink("");
    setDraftEnabled(true);
    setError(null);
  }

  function startEdit(banner: MenuBannerRow) {
    setEditing(banner);
    setDraftUrl(banner.image_url);
    setDraftCrop(parseCrop(banner.image_crop));
    setDraftCaption(banner.caption ?? "");
    setDraftClickLink(banner.click_link ?? "");
    setDraftEnabled(banner.is_enabled);
    setError(null);
  }

  function handleSubmit(formData: FormData) {
    setError(null);
    if (draftEnabled) formData.set("is_enabled", "on");
    else formData.delete("is_enabled");

    startTransition(async () => {
      const action = editing ? updateMenuBanner : createMenuBanner;
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

  function handleDelete(id: string, label: string) {
    if (!confirm(`Delete banner "${label || "Untitled"}"?`)) return;
    startTransition(async () => {
      const result = await deleteMenuBanner(id);
      if (!result.ok) setError(result.error);
      else {
        setItems((prev) => prev.filter((b) => b.id !== id));
      }
    });
  }

  function handleToggle(id: string, enabled: boolean) {
    startTransition(async () => {
      const result = await toggleMenuBanner(id, enabled);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setItems((prev) =>
        prev.map((b) => (b.id === id ? { ...b, is_enabled: enabled } : b))
      );
    });
  }

  function handleDrop(dropIndex: number) {
    if (dragIndex === null || dragIndex === dropIndex) return;

    const reordered = [...items];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(dropIndex, 0, moved);
    setItems(reordered);
    setDragIndex(null);

    startTransition(async () => {
      const result = await reorderMenuBanners(reordered.map((b) => b.id));
      if (!result.ok) setError(result.error);
    });
  }

  const previewBanners: MenuBanner[] = useMemo(() => {
    const mapped = items.map(mapMenuBanner).filter((b) => b.isEnabled);

    if (draftUrl && draftEnabled) {
      const draft: MenuBanner = {
        id: editing?.id ?? "preview-draft",
        imageUrl: draftUrl,
        imageCrop: draftCrop,
        caption: draftCaption.trim() || null,
        clickLink: draftClickLink.trim() || null,
        sortOrder: 0,
        isEnabled: true,
      };

      if (editing) {
        return mapped.map((b) => (b.id === editing.id ? draft : b));
      }
      return [draft, ...mapped];
    }

    return mapped;
  }, [
    items,
    draftUrl,
    draftCrop,
    draftCaption,
    draftClickLink,
    draftEnabled,
    editing,
  ]);

  return (
    <div className="space-y-8">
      {!schemaReady ? (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 sm:p-6">
          <h2 className="text-base font-semibold text-amber-200">
            Database setup required
          </h2>
          <p className="mt-2 text-sm text-amber-100/80">{loadError}</p>
          <p className="mt-3 text-sm text-muted">
            Open Supabase → SQL Editor → run{" "}
            <code className="rounded bg-ink/60 px-1.5 py-0.5 text-xs text-cream">
              supabase/migrations/010_menu_banners.sql
            </code>
            , then{" "}
            <code className="rounded bg-ink/60 px-1.5 py-0.5 text-xs text-cream">
              011_menu_banners_simplify.sql
            </code>
            , and refresh this page.
          </p>
        </div>
      ) : null}

      {loadError && schemaReady ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {loadError}
        </div>
      ) : null}

      {schemaReady ? (
        <>
          <section className="admin-card p-4 sm:p-6">
            <h2 className="mb-1 text-lg font-semibold text-cream">Live preview</h2>
            <p className="mb-4 text-sm text-muted">
              Enabled banners appear on the homepage hero slider.
            </p>
            {previewBanners.length > 0 ? (
              <HomeHeroCarousel banners={previewBanners} showArrows={false} />
            ) : (
              <p className="rounded-xl border border-dashed border-white/10 py-12 text-center text-sm text-muted">
                No enabled banners yet. Add one below to see the carousel.
              </p>
            )}
          </section>

          <section
            className={cn(
              "admin-card p-4 sm:p-6",
              editing && "border-accent/50 ring-2 ring-accent/20"
            )}
          >
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold text-cream">
                {editing ? "Edit banner" : "Add banner"}
              </h2>
              {editing ? (
                <span className="inline-flex items-center rounded-full bg-accent/15 px-3 py-1 text-xs font-medium text-accent">
                  Editing banner
                </span>
              ) : null}
            </div>

            <form
              key={editing?.id ?? "new-banner"}
              action={handleSubmit}
              className="grid grid-cols-1 gap-4"
            >
              <ImageCropField
                name="image_url"
                cropName="image_crop"
                label="Banner image (16:9)"
                defaultUrl={draftUrl}
                defaultCrop={draftCrop}
                previewRatio={BANNER_RATIO}
                helpText="Wide banner for the homepage & menu carousels. Drag and zoom after upload."
                onChange={(url, crop) => {
                  setDraftUrl(url);
                  setDraftCrop(crop);
                }}
              />

              <Input
                name="caption"
                label="Banner caption (optional)"
                value={draftCaption}
                onChange={(e) => setDraftCaption(e.target.value)}
                placeholder="Summer specials"
              />

              <div>
                <Input
                  name="click_link"
                  label="Banner click link (optional)"
                  value={draftClickLink}
                  onChange={(e) => setDraftClickLink(e.target.value)}
                  placeholder="/menu?category=burgers"
                />
                <p className="mt-1.5 text-xs text-muted">
                  When set, the entire banner becomes clickable.
                </p>
              </div>

              <label className="flex min-h-11 items-center gap-3 text-sm text-cream/80">
                <input
                  type="checkbox"
                  checked={draftEnabled}
                  onChange={(e) => setDraftEnabled(e.target.checked)}
                  className="h-5 w-5 rounded border-white/20"
                />
                Show on homepage
              </label>

              {error ? <p className="text-sm text-red-400">{error}</p> : null}

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button type="submit" variant="accent" isLoading={pending} className="min-h-11">
                  {editing ? "Save banner" : "Add banner"}
                </Button>
                {editing ? (
                  <Button type="button" variant="ghost" onClick={resetForm}>
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                ) : null}
              </div>
            </form>
          </section>

          <section className="admin-card p-4 sm:p-6">
            <h2 className="mb-4 text-lg font-semibold text-cream">
              All banners
              <span className="ml-2 text-sm font-normal text-muted">
                ({items.length})
              </span>
            </h2>
            <p className="mb-4 text-sm text-muted">
              Drag to reorder. Order is reflected on the homepage after saving.
            </p>

            {items.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted">
                No banners yet. Add your first banner above.
              </p>
            ) : (
              <ul className="space-y-2">
                {items.map((banner, index) => (
                  <li
                    key={banner.id}
                    draggable
                    onDragStart={() => setDragIndex(index)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(index)}
                    onDragEnd={() => setDragIndex(null)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border border-white/10 bg-ink/50 p-3 transition-opacity",
                      dragIndex === index && "opacity-50"
                    )}
                  >
                    <button
                      type="button"
                      className="cursor-grab text-cream/40 hover:text-cream active:cursor-grabbing"
                      aria-label="Drag to reorder"
                    >
                      <GripVertical className="h-5 w-5" />
                    </button>

                    <div className="relative h-12 w-28 shrink-0 overflow-hidden rounded-lg border border-white/10">
                      <Image
                        src={banner.image_url}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="112px"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-cream">
                        {banner.caption || "No caption"}
                      </p>
                      <p className="truncate text-xs text-muted">
                        {banner.click_link || "No click link"}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          handleToggle(banner.id, !banner.is_enabled)
                        }
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                          banner.is_enabled
                            ? "text-green-400 hover:bg-green-500/10"
                            : "text-muted hover:bg-white/5"
                        )}
                        aria-label={
                          banner.is_enabled ? "Disable banner" : "Enable banner"
                        }
                      >
                        {banner.is_enabled ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => startEdit(banner)}
                        className="flex h-10 w-10 items-center justify-center rounded-lg text-cream/60 hover:bg-white/5"
                        aria-label="Edit banner"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(banner.id, banner.caption ?? "")
                        }
                        className="flex h-10 w-10 items-center justify-center rounded-lg text-red-400/70 hover:bg-red-500/10"
                        aria-label="Delete banner"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}
