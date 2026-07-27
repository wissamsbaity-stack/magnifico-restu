"use client";

import { useState, type FormEvent } from "react";
import { Send } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

export function ContactForm() {
  const [notice, setNotice] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setNotice(
      "Online messaging is not available yet. Please reach us via WhatsApp or phone on this page."
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl border border-cream/5 bg-surface-raised p-6 lg:p-8"
    >
      <h3 className="text-lg font-semibold text-cream">Send a Message</h3>

      {notice ? (
        <p
          role="status"
          aria-live="polite"
          className="rounded-xl border border-line/10 bg-surface-raised px-4 py-3 text-sm text-muted"
        >
          {notice}
        </p>
      ) : null}

      <Input
        label="Name"
        placeholder="Your name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        required
      />

      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        required
      />

      <Textarea
        label="Message"
        placeholder="How can we help?"
        value={form.message}
        onChange={(e) => setForm({ ...form, message: e.target.value })}
        rows={5}
        required
      />

      <Button type="submit" variant="secondary" className="w-full">
        <Send className="h-4 w-4" />
        Send Message
      </Button>

      <p className="text-xs text-muted">
        Form submissions will be connected to Supabase in a future update.
      </p>
    </form>
  );
}
