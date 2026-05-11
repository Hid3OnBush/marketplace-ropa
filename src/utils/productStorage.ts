import { products as initialProducts } from "../data/products";
import type { Product } from "../types/product";
import { normalizeProduct } from "./productHelpers";

const STORAGE_KEY = "admin_products";
const PRODUCT_OVERRIDES_KEY = "product_overrides";

type ProductOverride = Partial<
  Pick<Product, "gender" | "sizes" | "stock" | "discountPercentage">
>;

function getProductOverrides(): Record<string, ProductOverride> {
  const savedOverrides = localStorage.getItem(PRODUCT_OVERRIDES_KEY);
  return savedOverrides ? JSON.parse(savedOverrides) : {};
}

function getNameOverrideKey(productName: string) {
  return `name:${productName.trim().toLowerCase()}`;
}

export function applyProductOverrides(products: Product[]) {
  const overrides = getProductOverrides();

  return products.map((product) => {
    const idOverride = overrides[String(product.id)] || {};
    const nameOverride = overrides[getNameOverrideKey(product.name)] || {};

    return {
      ...product,
      ...nameOverride,
      ...idOverride,
    };
  });
}

export function saveProductOverride(
  productId: number,
  override: ProductOverride
) {
  const overrides = getProductOverrides();
  overrides[String(productId)] = {
    ...(overrides[String(productId)] || {}),
    ...override,
  };

  localStorage.setItem(PRODUCT_OVERRIDES_KEY, JSON.stringify(overrides));
}

export function saveProductNameOverride(
  productName: string,
  override: ProductOverride
) {
  const overrides = getProductOverrides();
  const key = getNameOverrideKey(productName);

  overrides[key] = {
    ...(overrides[key] || {}),
    ...override,
  };

  localStorage.setItem(PRODUCT_OVERRIDES_KEY, JSON.stringify(overrides));
}

export function removeProductOverride(productId: number) {
  const overrides = getProductOverrides();
  delete overrides[String(productId)];
  localStorage.setItem(PRODUCT_OVERRIDES_KEY, JSON.stringify(overrides));
}

export function getStoredProducts(): Product[] {
  const savedProducts = localStorage.getItem(STORAGE_KEY);

  if (savedProducts) {
    const parsedProducts = JSON.parse(savedProducts);

    if (Array.isArray(parsedProducts) && parsedProducts.length > 0) {
      return applyProductOverrides(parsedProducts.map(normalizeProduct));
    }
  }

  return applyProductOverrides(initialProducts.map(normalizeProduct));
}

export function saveProducts(products: Product[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}
