export interface CheckoutSnapshotItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export interface CheckoutSnapshot {
  customerName: string;
  customerEmail: string;
  address: string;
  city: string;
  shippingMethod: string;
  shippingCost: number;
  total: number;
  items: CheckoutSnapshotItem[];
  createdAt: string;
}

const CHECKOUT_SNAPSHOT_KEY = "checkout_snapshot";

export function saveCheckoutSnapshot(snapshot: CheckoutSnapshot) {
  localStorage.setItem(CHECKOUT_SNAPSHOT_KEY, JSON.stringify(snapshot));
}

export function getCheckoutSnapshot(): CheckoutSnapshot | null {
  const saved = localStorage.getItem(CHECKOUT_SNAPSHOT_KEY);
  return saved ? JSON.parse(saved) : null;
}

export function clearCheckoutSnapshot() {
  localStorage.removeItem(CHECKOUT_SNAPSHOT_KEY);
}