export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  gender: string;
  description: string;
  sizes: string[];
  stock: number;
  discountPercentage?: number;
}
