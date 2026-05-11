import type { Product } from "../types/product";

export const DEFAULT_PRODUCT_SIZES = ["XS", "S", "M", "L", "XL"];
export const DEFAULT_PRODUCT_STOCK = 50;
export const DEFAULT_PRODUCT_GENDER = "Unisex";

const defaultDiscounts: Record<number, number> = {
  2: 15,
  3: 10,
  5: 20,
  8: 12,
};

function normalizeSizes(sizes: unknown) {
  if (Array.isArray(sizes)) {
    const parsedSizes = sizes
      .map((size) => String(size).trim())
      .filter(Boolean);

    return parsedSizes.length > 0 ? parsedSizes : DEFAULT_PRODUCT_SIZES;
  }

  if (typeof sizes === "string") {
    const parsedSizes = sizes
      .split(",")
      .map((size) => size.trim())
      .filter(Boolean);

    return parsedSizes.length > 0 ? parsedSizes : DEFAULT_PRODUCT_SIZES;
  }

  return DEFAULT_PRODUCT_SIZES;
}

function inferGender(category?: string, gender?: string) {
  if (gender?.trim()) {
    return gender.trim();
  }

  const normalizedCategory = category?.trim().toLowerCase() ?? "";
  const womensCategories = [
    "vestidos",
    "faldas",
    "tops",
    "sets",
    "blazers",
  ];

  if (womensCategories.includes(normalizedCategory)) {
    return "Mujer";
  }

  if (["camisas", "chamarras", "abrigos"].includes(normalizedCategory)) {
    return "Hombre";
  }

  return DEFAULT_PRODUCT_GENDER;
}

export function normalizeProduct(
  product: Partial<Product> & {
    id?: number;
    discount_percentage?: number;
    gender?: string;
  }
) {
  const id = Number(product.id);
  const discountPercentage = Number(
    product.discountPercentage ?? product.discount_percentage ?? defaultDiscounts[id] ?? 0
  );

  return {
    id,
    name: product.name ?? "",
    price: Number(product.price ?? 0),
    image: product.image ?? "",
    category: product.category ?? "",
    gender: inferGender(product.category, product.gender),
    description: product.description ?? "",
    sizes: normalizeSizes(product.sizes),
    stock: Number(product.stock ?? DEFAULT_PRODUCT_STOCK),
    discountPercentage,
  };
}

export function getDiscountedPrice(product: Product) {
  const discount = product.discountPercentage ?? 0;

  if (discount <= 0) {
    return product.price;
  }

  return Math.round(product.price * (1 - discount / 100));
}

export function isProductOnSale(product: Product) {
  return (product.discountPercentage ?? 0) > 0;
}

export function getSimilarProducts(
  products: Product[],
  product: Product,
  limit = 3
) {
  const sameCategory = products.filter(
    (item) => item.id !== product.id && item.category === product.category
  );

  const similarPrice = products.filter((item) => {
    const priceDifference = Math.abs(item.price - product.price);
    return item.id !== product.id && priceDifference <= product.price * 0.35;
  });
  const fallbackProducts = products.filter((item) => item.id !== product.id);

  return [...sameCategory, ...similarPrice, ...fallbackProducts]
    .filter(
      (item, index, list) =>
        list.findIndex((candidate) => candidate.id === item.id) === index
    )
    .slice(0, limit);
}
