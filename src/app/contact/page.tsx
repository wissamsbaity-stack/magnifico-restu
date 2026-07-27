import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ContactForm } from "@/components/contact/ContactForm";
import { ContactDetails } from "@/components/contact/ContactDetails";
import { ContactMap } from "@/components/contact/ContactMap";
import { getSiteSettings } from "@/lib/settings/site-settings";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: "Contact",
    description: `Get in touch with ${settings.name}. Find our locations, hours, and contact details.`,
  };
}

export default function ContactPage() {
  return (
    <div className="pb-20">
      <section className="border-b border-line/10 bg-surface-raised/30 py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Get in Touch"
            title="We'd love to hear from you"
            description="Questions about your order, catering, or just want to say hi? Reach out anytime."
            align="center"
          />
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <ContactDetails />
          <ContactForm />
        </div>

        <ContactMap />
      </div>
    </div>
  );
}
