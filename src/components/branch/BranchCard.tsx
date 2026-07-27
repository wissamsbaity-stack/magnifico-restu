"use client";

import { memo } from "react";
import { Clock, MapPin, Navigation, Phone } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/BrandIcons";
import { Button } from "@/components/ui/Button";
import { BranchOpenBadge } from "@/components/branch/BranchOpenBadge";
import { useSettings } from "@/contexts/SettingsContext";
import { buildWhatsAppContactUrl } from "@/lib/whatsapp";
import { getBranchMapsUrl } from "@/lib/branch-helpers";
import type { Branch } from "@/types/branch";
import { cn } from "@/lib/utils";

interface BranchCardProps {
  branch: Branch;
  isActive: boolean;
  onSelect: (id: string) => void;
}

export const BranchCard = memo(function BranchCard({
  branch,
  isActive,
  onSelect,
}: BranchCardProps) {
  const settings = useSettings();

  const whatsappUrl = buildWhatsAppContactUrl(
    `Hi ${settings.name} (${branch.name})! I'd like to place an order.`,
    branch.whatsapp,
    settings.name
  );
  const mapsUrl = getBranchMapsUrl(branch);

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border bg-surface-raised shadow-card transition-colors",
        isActive ? "border-accent" : "border-line/10"
      )}
    >
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-xl font-bold text-cream">
            {branch.name}
          </h3>
          <BranchOpenBadge hours={branch.hours} className="shrink-0" />
        </div>

        {branch.address ? (
          <p className="flex items-start gap-2 text-sm text-muted">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            {branch.address}
          </p>
        ) : null}

        {branch.phone ? (
          <a
            href={`tel:${branch.phone.replace(/\D/g, "")}`}
            className="flex items-center gap-2 text-sm text-muted transition-colors hover:text-accent"
          >
            <Phone className="h-4 w-4 shrink-0 text-accent" />
            {branch.phone}
          </a>
        ) : null}

        {branch.hours.length > 0 ? (
          <ul className="space-y-1">
            {branch.hours.map((slot) => (
              <li
                key={`${slot.days}-${slot.time}`}
                className="flex items-center gap-2 text-sm text-muted"
              >
                <Clock className="h-4 w-4 shrink-0 text-accent" />
                <span className="text-cream/80">{slot.days}:</span> {slot.time}
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-auto flex flex-col gap-2 pt-2">
          <div className="grid grid-cols-2 gap-2">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="whatsapp" size="sm" className="w-full">
                <WhatsAppIcon size={16} />
                WhatsApp
              </Button>
            </a>
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="w-full">
                <Navigation className="h-4 w-4" />
                Directions
              </Button>
            </a>
          </div>
          {isActive ? (
            <div className="bg-brand-green-solid inline-flex h-9 w-full items-center justify-center rounded-full text-sm font-semibold text-white">
              Current branch
            </div>
          ) : (
            <Button
              variant="pink"
              size="sm"
              className="w-full"
              onClick={() => onSelect(branch.id)}
            >
              Select this branch
            </Button>
          )}
        </div>
      </div>
    </div>
  );
});
