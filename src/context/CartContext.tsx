import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Product } from "../types/product";
import {
  DEFAULT_PRODUCT_STOCK,
  getDiscountedPrice,
} from "../utils/productHelpers";

interface CartItem extends Product {
  cartKey: string;
  quantity: number;
  selectedSize: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, selectedSize: string) => void;
  increaseQuantity: (cartKey: string) => void;
  decreaseQuantity: (cartKey: string) => void;
  removeFromCart: (cartKey: string) => void;
  clearCart: () => void;
  toastMessage: string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function getCartKey(productId: number, selectedSize: string) {
  return `${productId}-${selectedSize}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem("cart");

    if (!savedCart) {
      return [];
    }

    return JSON.parse(savedCart).map((item: Partial<CartItem>) => {
      const selectedSize = item.selectedSize || item.sizes?.[0] || "M";
      const id = Number(item.id);

      return {
        ...item,
        id,
        selectedSize,
        cartKey: item.cartKey || getCartKey(id, selectedSize),
        quantity: Number(item.quantity ?? 1),
        stock: Number(item.stock ?? DEFAULT_PRODUCT_STOCK),
        sizes: item.sizes || ["XS", "S", "M", "L", "XL"],
      };
    });
  });

  const [toastMessage, setToastMessage] = useState("");

  const addToCart = (product: Product, selectedSize: string) => {
    const size = selectedSize || product.sizes[0];
    const cartKey = getCartKey(product.id, size);

    setCartItems((prevItems) => {
      const existingProduct = prevItems.find((item) => item.cartKey === cartKey);

      if (existingProduct) {
        return prevItems.map((item) =>
          item.cartKey === cartKey
            ? {
                ...item,
                quantity:
                  item.quantity < item.stock ? item.quantity + 1 : item.quantity,
              }
            : item
        );
      }

      return [
        ...prevItems,
        {
          ...product,
          cartKey,
          selectedSize: size,
          price: getDiscountedPrice(product),
          quantity: 1,
          stock: product.stock || DEFAULT_PRODUCT_STOCK,
        },
      ];
    });

    setToastMessage(`${product.name} talla ${size} agregado al carrito`);
  };

  const increaseQuantity = (cartKey: string) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.cartKey === cartKey
          ? {
              ...item,
              quantity:
                item.quantity < item.stock ? item.quantity + 1 : item.quantity,
            }
          : item
      )
    );
  };

  const decreaseQuantity = (cartKey: string) => {
    setCartItems((prevItems) =>
      prevItems
        .map((item) =>
          item.cartKey === cartKey
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (cartKey: string) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.cartKey !== cartKey)
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    if (!toastMessage) return;

    const timer = setTimeout(() => {
      setToastMessage("");
    }, 2500);

    return () => clearTimeout(timer);
  }, [toastMessage]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCart,
        toastMessage,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart debe usarse dentro de CartProvider");
  }

  return context;
}
