import { products as initialProducts } from "../data/products";
import type { Product } from "../types/product";

const STORAGE_KEY = "admin_products";

export function getStoredProducts(): Product[] {
  const savedProducts = localStorage.getItem(STORAGE_KEY);

  if (savedProducts) {
    const parsedProducts = JSON.parse(savedProducts);

    if (Array.isArray(parsedProducts) && parsedProducts.length > 0) {
      return parsedProducts;
    }
  }

  return initialProducts;
}

export function saveProducts(products: Product[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}