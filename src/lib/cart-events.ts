export function notifyItemAdded(name: string) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("cart:item-added", { detail: { name } })
    );
  }
}
