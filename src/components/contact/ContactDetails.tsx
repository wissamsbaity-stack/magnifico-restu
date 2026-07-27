"use client";

import { Clock, Mail, MapPin, Phone, type LucideIcon } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/BrandIcons";
import { Button } from "@/components/ui/Button";
import { BranchOpenBadge } from "@/components/branch/BranchOpenBadge";
import { useSettings } from "@/contexts/SettingsContext";
import { useBranchModalDispatch } from "@/contexts/BranchContext";
import { useActiveContact } from "@/hooks/useActiveContact";
import { buildWhatsAppContactUrl } from "@/lib/whatsapp";

export function ContactDetails() {
  const settings = useSettings();
  const { openBranchModal } = useBranchModalDispatch();
  const { phone, whatsapp, address, hours, restaurantName, branchName } =
    useActiveContact();

  const whatsappUrl = buildWhatsAppContactUrl(
    `Hi ${restaurantName}! I have a question.`,
    whatsapp,
    restaurantName
  );

  const contactCards: {
    label: string;
    value: string;
    href?: string;
    external?: boolean;
    icon?: LucideIcon;
    brand?: "whatsapp";
  }[] = [
    phone
      ? {
          icon: Phone,
          label: "Phone",
          value: phone,
          href: `tel:${phone.replace(/\D/g, "")}`,
        }
      : null,
    settings.email
      ? {
          icon: Mail,
          label: "Email",
          value: settings.email,
          href: `mailto:${settings.email}`,
        }
      : null,
    address ? { icon: MapPin, label: "Address", value: address } : null,
    whatsapp
      ? {
          brand: "whatsapp" as const,
          label: "WhatsApp",
          value: whatsapp,
          href: whatsappUrl,
          external: true,
        }
      : null,
  ].filter(Boolean) as {
    label: string;
    value: string;
    href?: string;
    external?: boolean;
    icon?: LucideIcon;
    brand?: "whatsapp";
  }[];

  return (
    <div className="space-y-6">
      {branchName ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line/10 bg-surface-raised p-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-accent" />
              <div>
                <p className="text-xs uppercase tracking-wider text-muted">
                  Selected branch
                </p>
                <p className="font-semibold text-cream">{branchName}</p>
              </div>
              <BranchOpenBadge hours={hours} className="ml-1" />
            </div>
            <Button variant="outline" size="sm" onClick={openBranchModal}>
              Change branch
            </Button>
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          {contactCards.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-line/10 bg-surface-raised p-5"
            >
              {item.brand === "whatsapp" ? (
                <WhatsAppIcon size={20} className="mb-3 text-accent" />
              ) : item.icon ? (
                <item.icon className="mb-3 h-5 w-5 text-accent" />
              ) : null}
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted">
                {item.label}
              </p>
              {item.href ? (
                <a
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                  className="text-sm font-medium text-cream transition-colors hover:text-accent"
                >
                  {item.value}
                </a>
              ) : (
                <p className="text-sm font-medium text-cream">{item.value}</p>
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-line/10 bg-surface-raised p-6">
            <div className="mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-accent" />
              <h3 className="font-semibold text-cream">Opening Hours</h3>
            </div>
            <ul className="space-y-3">
              {hours.map((slot) => (
                <li
                  key={`${slot.days}-${slot.time}`}
                  className="flex justify-between text-sm"
                >
                  <span className="text-muted">{slot.days}</span>
                  <span className="font-medium text-cream">{slot.time}</span>
                </li>
              ))}
            </ul>
          </div>

          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="whatsapp" size="lg" className="w-full sm:w-auto">
              <WhatsAppIcon size={20} />
              Message on WhatsApp
            </Button>
          </a>
        </div>
    </div>
  );
}
