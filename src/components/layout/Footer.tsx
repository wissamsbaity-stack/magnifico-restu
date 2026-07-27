"use client";

import Link from "next/link";
import { memo } from "react";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";
import { RestaurantBrand } from "@/components/layout/RestaurantBrand";
import { HeroSocialLinks } from "@/components/home/HeroSocialLinks";
import { instagramHandleFromUrl } from "@/lib/settings/helpers";
import { useActiveContact } from "@/hooks/useActiveContact";

export const Footer = memo(function Footer() {
  const settings = useSettings();
  const { phone, address: fullAddress, hours, branchName, mapsUrl } =
    useActiveContact();
  const instagramHandle = instagramHandleFromUrl(settings.social.instagram);

  return (
    <footer className="rounded-t-[1.25rem] bg-brand-ink sm:rounded-t-[1.75rem]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <RestaurantBrand size="sm" />
            {settings.hero.title ? (
              <p className="text-sm leading-relaxed text-white/55">
                {settings.hero.title}
              </p>
            ) : null}
          </div>

          <div>
            <h3 className="mb-4 font-display text-sm font-bold uppercase tracking-[0.14em] text-white">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {[
                { href: "/", label: "Home" },
                { href: "/menu", label: "Menu" },
                { href: "/contact", label: "Contact" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/55 transition-colors hover:text-accent"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-display text-sm font-bold uppercase tracking-[0.14em] text-white">
              Hours{branchName ? ` — ${branchName}` : ""}
            </h3>
            <ul className="space-y-2">
              {hours.map((slot) => (
                <li
                  key={`${slot.days}-${slot.time}`}
                  className="flex items-start gap-2 text-sm text-white/55"
                >
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <span>
                    <span className="text-white/80">{slot.days}</span>
                    <br />
                    {slot.time}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-display text-sm font-bold uppercase tracking-[0.14em] text-white">
              Contact
            </h3>
            <ul className="space-y-3">
              {phone ? (
                <li>
                  <a
                    href={`tel:${phone.replace(/\D/g, "")}`}
                    className="flex items-center gap-2 text-sm text-white/55 transition-colors hover:text-accent"
                  >
                    <Phone className="h-4 w-4 text-accent" />
                    {phone}
                  </a>
                </li>
              ) : null}
              {settings.email ? (
                <li>
                  <a
                    href={`mailto:${settings.email}`}
                    className="flex items-center gap-2 text-sm text-white/55 transition-colors hover:text-accent"
                  >
                    <Mail className="h-4 w-4 text-accent" />
                    {settings.email}
                  </a>
                </li>
              ) : null}
              {fullAddress ? (
                <li>
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-2 text-sm text-white/55 transition-colors hover:text-accent"
                  >
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    {fullAddress}
                  </a>
                </li>
              ) : null}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-5 border-t border-white/10 pt-8">
          <p className="text-sm text-white/45">
            &copy; {new Date().getFullYear()} {settings.name}
          </p>

          <div className="flex items-center gap-4">
            <HeroSocialLinks variant="footer" />
            {settings.social.instagram ? (
              <a
                href={settings.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-white/45 transition-colors hover:text-accent"
              >
                {instagramHandle}
              </a>
            ) : null}
            {settings.social.facebook ? (
              <a
                href={settings.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-white/45 transition-colors hover:text-accent"
              >
                Facebook
              </a>
            ) : null}
          </div>

          <p className="text-center text-xs text-white/40">
            Developed by{" "}
            <a
              href="https://www.instagram.com/wsdigital.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-brand-yellow transition-colors hover:text-brand-yellow/85"
            >
              WsDigital
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
});
