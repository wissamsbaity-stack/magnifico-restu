"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Truck } from "lucide-react";
import { AnimatePresence, m } from "@/lib/motion";
import { WhatsAppIcon } from "@/components/icons/BrandIcons";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { OrderTypeSelector } from "@/components/checkout/OrderTypeSelector";
import { OrderConfirmDialog } from "@/components/checkout/OrderConfirmDialog";
import { OrderSubmittingOverlay } from "@/components/checkout/OrderSubmittingOverlay";
import type { OrderType } from "@/types/order";
import { useCart } from "@/contexts/CartContext";
import { useSettings } from "@/contexts/SettingsContext";
import { useActiveContact } from "@/hooks/useActiveContact";
import { siteConfig } from "@/config/site";
import { buildWhatsAppOrderUrl } from "@/lib/whatsapp";
import { isValidLebanonPhone, formatPrice } from "@/lib/utils";
import { placeOrder } from "@/app/checkout/actions";
import { logSupabaseError } from "@/lib/orders/supabase-error";
import type { DeliveryDetails } from "@/types/order";

interface FormErrors {
  name?: string;
  phone?: string;
  city?: string;
  street?: string;
  building?: string;
}

const initialForm: DeliveryDetails = {
  name: "",
  phone: "",
  city: "",
  street: "",
  building: "",
  deliveryInstructions: "",
};

const fieldCollapse = {
  initial: { height: 0, opacity: 0 },
  animate: {
    height: "auto",
    opacity: 1,
    transition: { duration: 0.28, ease: [0.4, 0, 0.2, 1] as const },
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] as const },
  },
};

export function CheckoutForm({
  orderType,
  onOrderTypeChange,
}: {
  orderType: OrderType;
  onOrderTypeChange: (type: OrderType) => void;
}) {
  const router = useRouter();
  const { items, subtotal, deliveryFee, clearCart } = useCart();
  const settings = useSettings();
  const { whatsapp, restaurantName } = useActiveContact();
  const [form, setForm] = useState<DeliveryDetails>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Orders dashboard / built-in checkout is disabled for now (WhatsApp-only).
  // The built-in code is kept intact behind this flag for later re-enabling.
  const isBuiltIn =
    siteConfig.ordersEnabled && settings.checkoutMethod === "builtin";
  const isDelivery = orderType === "delivery";
  const appliedDeliveryFee = isDelivery ? deliveryFee : 0;
  const total = subtotal + appliedDeliveryFee;

  const handleOrderTypeChange = (type: OrderType) => {
    onOrderTypeChange(type);
    if (type === "pickup") {
      setErrors((prev) => ({
        ...prev,
        city: undefined,
        street: undefined,
        building: undefined,
      }));
    }
  };

  const updateField = (field: keyof DeliveryDetails, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.phone.trim()) newErrors.phone = "Phone number is required";
    else if (!isValidLebanonPhone(form.phone))
      newErrors.phone = "Enter a valid Lebanon number (e.g. 70123456)";

    if (isDelivery) {
      if (!form.city.trim()) newErrors.city = "City is required";
      if (!form.street.trim()) newErrors.street = "Street is required";
      if (!form.building.trim()) newErrors.building = "Building is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleWhatsAppSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate() || items.length === 0) return;

    const url = buildWhatsAppOrderUrl({
      phone: whatsapp,
      restaurantName,
      orderType,
      customer: form,
      items,
      subtotal,
      deliveryFee: appliedDeliveryFee,
      total,
    });

    window.open(url, "_blank", "noopener,noreferrer");
    clearCart();
    setForm(initialForm);
    onOrderTypeChange("delivery");
  };

  const handleBuiltInPlaceOrder = (e: FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!validate() || items.length === 0) return;
    setShowConfirm(true);
  };

  const handleConfirmBuiltInOrder = () => {
    setShowConfirm(false);
    setIsSubmitting(true);
    setSubmitError(null);

    void (async () => {
      const result = await placeOrder({
        orderType,
        customerName: form.name,
        customerPhone: form.phone,
        city: isDelivery ? form.city : null,
        street: isDelivery ? form.street : null,
        building: isDelivery ? form.building : null,
        deliveryInstructions: form.deliveryInstructions || null,
        items: items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          notes: item.notes.trim() ? item.notes.trim() : null,
        })),
        subtotal,
        deliveryFee: appliedDeliveryFee,
        total,
      });

      if (!result.success) {
        if (result.debug) {
          logSupabaseError("placeOrder", result.debug);
        } else {
          console.error("[placeOrder] Order submission failed", {
            error: result.error,
          });
        }
        setIsSubmitting(false);
        setSubmitError(result.error ?? "Order submission failed.");
        return;
      }

      setIsSubmitting(false);
      clearCart();
      setForm(initialForm);
      onOrderTypeChange("delivery");
      router.replace("/", { scroll: false });
    })();
  };

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-line/10 bg-surface-raised p-8 text-center shadow-card">
        <p className="mb-4 text-muted">Your cart is empty</p>
        <Link href="/menu">
          <Button variant="pink">Browse Menu</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <form
        onSubmit={isBuiltIn ? handleBuiltInPlaceOrder : handleWhatsAppSubmit}
        className="space-y-5"
      >
        <OrderTypeSelector value={orderType} onChange={handleOrderTypeChange} />

        <Input
          label="Full Name"
          placeholder="Your name"
          value={form.name}
          onChange={(e) => updateField("name", e.target.value)}
          error={errors.name}
          required
        />

        <Input
          label="Phone Number"
          type="tel"
          placeholder="70123456"
          value={form.phone}
          onChange={(e) => updateField("phone", e.target.value)}
          error={errors.phone}
          required
        />
        <p className="-mt-3 text-xs text-muted">
          Lebanese number -- XX XXX XXX
        </p>

        <AnimatePresence initial={false} mode="wait">
          {isDelivery ? (
            <m.div
              key="delivery-fields"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={fieldCollapse}
              className="space-y-5 overflow-hidden"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <Input
                  label="City"
                  placeholder="City"
                  value={form.city}
                  onChange={(e) => updateField("city", e.target.value)}
                  error={errors.city}
                  required
                />
                <Input
                  label="Street"
                  placeholder="Street / area"
                  value={form.street}
                  onChange={(e) => updateField("street", e.target.value)}
                  error={errors.street}
                  required
                />
              </div>

              <Input
                label="Building"
                placeholder="Apt 4B, Floor 2, Villa 12..."
                value={form.building}
                onChange={(e) => updateField("building", e.target.value)}
                error={errors.building}
                required
              />

              <Textarea
                label="Delivery Instructions"
                labelHint="(Optional)"
                placeholder="Ring the doorbell, gate code, landmarks..."
                value={form.deliveryInstructions}
                onChange={(e) =>
                  updateField("deliveryInstructions", e.target.value)
                }
                rows={3}
              />
            </m.div>
          ) : (
            <m.div
              key="pickup-note"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={fieldCollapse}
              className="overflow-hidden"
            >
              <Textarea
                label="Order Note"
                labelHint="(Optional)"
                placeholder="Allergies, pickup time, special requests..."
                value={form.deliveryInstructions}
                onChange={(e) =>
                  updateField("deliveryInstructions", e.target.value)
                }
                rows={3}
              />
            </m.div>
          )}
        </AnimatePresence>

        <OrderSummary orderType={orderType} />

        <AnimatePresence initial={false}>
          {isDelivery ? (
            <m.div
              key={isBuiltIn ? "builtin-delivery-fee" : "whatsapp-delivery-fee"}
              initial="initial"
              animate="animate"
              exit="exit"
              variants={fieldCollapse}
              className="overflow-hidden"
            >
              <div className="rounded-xl border border-brand-yellow/20 bg-brand-yellow/10 p-4 sm:p-5">
                <div className="flex gap-3 sm:gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-yellow/25 ring-1 ring-brand-yellow/30">
                    <Truck className="h-5 w-5 text-brand-pink" aria-hidden />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <p className="text-sm font-medium text-cream">Delivery fee</p>
                    {isBuiltIn ? (
                      <p className="text-sm text-muted">
                        Delivery Fee:{" "}
                        <span className="font-semibold text-brand-pink">
                          {formatPrice(appliedDeliveryFee)}
                        </span>
                      </p>
                    ) : (
                      <p className="text-sm text-muted">
                        Delivery fee confirmed via WhatsApp.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </m.div>
          ) : null}
        </AnimatePresence>

        {submitError ? (
          <p className="text-sm text-red-400">{submitError}</p>
        ) : null}

        {isBuiltIn ? (
          <>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={isSubmitting}
            >
              Place Order
            </Button>
            <p className="text-center text-xs text-muted">
              Your order is sent directly to the restaurant
            </p>
          </>
        ) : (
          <>
            <Button type="submit" variant="whatsapp" size="lg" className="w-full">
              <WhatsAppIcon size={20} />
              Send Order via WhatsApp
            </Button>
          </>
        )}
      </form>

      {isBuiltIn ? (
        <>
          <OrderConfirmDialog
            open={showConfirm}
            onConfirm={handleConfirmBuiltInOrder}
            onCancel={() => setShowConfirm(false)}
          />
          <OrderSubmittingOverlay open={isSubmitting} />
        </>
      ) : null}
    </>
  );
}
