export const FREE_SHIPPING_THRESHOLD = 1500;

export function qualifiesForFreeShipping(subtotal: number) {
  return subtotal >= FREE_SHIPPING_THRESHOLD;
}

export function getShippingCost(subtotal: number, shippingMethod: string) {
  if (qualifiesForFreeShipping(subtotal)) {
    return 0;
  }

  return shippingMethod === "express" ? 199 : 99;
}
