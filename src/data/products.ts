import type { Product } from "../types/product";

export const products: Product[] = [
  {
    id: 1,
    name: "Playera Oversize Negra",
    price: 399,
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
    category: "Playeras",
    description: "Playera cómoda y moderna para uso diario.",
  },
  {
    id: 2,
    name: "Sudadera Beige Premium",
    price: 699,
    image:
      "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=800&q=80",
    category: "Sudaderas",
    description: "Sudadera casual con estilo urbano y tela suave.",
  },
  {
    id: 3,
    name: "Pantalón Cargo Streetwear",
    price: 749,
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
    category: "Pantalones",
    description: "Pantalón cargo moderno ideal para outfits relajados.",
  },
];
