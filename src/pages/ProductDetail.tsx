import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { useCart } from "../context/CartContext";
import type { Product } from "../types/product";
import API_URL from "../api/api";
import { products as initialProducts } from "../data/products";
import { applyProductOverrides } from "../utils/productStorage";
import {
  getDiscountedPrice,
  getSimilarProducts,
  isProductOnSale,
  normalizeProduct,
} from "../utils/productHelpers";

function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | undefined>(undefined);
  const [productList, setProductList] = useState<Product[]>([]);
  const [selectedSize, setSelectedSize] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setIsLoading(true);

        const response = await fetch(`${API_URL}/products`);
        const data: Partial<Product>[] = await response.json();
        const mappedProducts: Product[] = applyProductOverrides(
          Array.isArray(data) && data.length > 0
            ? data.map(normalizeProduct)
            : initialProducts.map(normalizeProduct)
        );

        const foundProduct = mappedProducts.find(
          (item) => item.id === Number(id)
        );
        setProductList(mappedProducts);
        setProduct(foundProduct);
        setSelectedSize(foundProduct?.sizes[0] ?? "");
      } catch (error) {
        console.error("Error cargando producto:", error);
        const fallbackProducts = applyProductOverrides(
          initialProducts.map(normalizeProduct)
        );
        const foundProduct = fallbackProducts.find(
          (item) => item.id === Number(id)
        );
        setProductList(fallbackProducts);
        setProduct(foundProduct);
        setSelectedSize(foundProduct?.sizes[0] ?? "");
      } finally {
        setIsLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f6f4ef] p-4 sm:p-6">
        <div className="max-w-5xl mx-auto bg-white rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.06)] border border-black/5 p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-[#111827]">
            Cargando producto...
          </h1>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#f6f4ef] p-4 sm:p-6">
        <div className="max-w-5xl mx-auto bg-white rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.06)] border border-black/5 p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-red-500">
            Producto no encontrado
          </h1>
        </div>
      </div>
    );
  }

  const salePrice = getDiscountedPrice(product);
  const isOnSale = isProductOnSale(product);
  const similarProducts = getSimilarProducts(productList, product);

  return (
    <div className="min-h-screen bg-[#f6f4ef] p-4 sm:p-6">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-6 sm:gap-8">
        <div className="bg-white rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.06)] border border-black/5 p-4 sm:p-5">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-[320px] sm:h-[420px] lg:h-[520px] object-cover rounded-[1.5rem]"
          />
        </div>

        <div className="bg-white rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.06)] border border-black/5 p-6 sm:p-8 flex flex-col justify-center">
          <span className="text-[#7a1f2b] font-bold uppercase tracking-[0.2em] text-xs sm:text-sm">
            {product.category}
          </span>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#111827] mt-4 tracking-tight">
            {product.name}
          </h1>

          <p className="text-gray-600 mt-5 text-base sm:text-lg leading-relaxed">
            {product.description}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
            <span className="text-3xl sm:text-4xl font-extrabold text-[#7a1f2b]">
              ${salePrice}
            </span>
            {isOnSale && (
              <>
                <span className="text-lg text-gray-400 line-through">
                  ${product.price}
                </span>
                <span className="bg-[#7a1f2b] text-white px-3 py-1 rounded-full text-sm font-bold">
                  -{product.discountPercentage}% oferta
                </span>
              </>
            )}
            <span className="text-sm text-gray-500">IVA incluido</span>
          </div>

          <div className="mt-8 grid gap-5">
            <div>
              <p className="text-sm font-bold text-[#111827] mb-3">
                Selecciona talla
              </p>

              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    type="button"
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-12 px-4 py-2 rounded-xl border font-bold transition ${
                      selectedSize === size
                        ? "border-[#7a1f2b] bg-[#fff7f8] text-[#7a1f2b]"
                        : "border-black/10 bg-[#fcfbf8] text-[#111827] hover:bg-[#efeae1]"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[#fcfbf8] rounded-2xl p-4 border border-black/5 text-sm text-gray-700">
              <span className="font-bold text-[#111827]">
                {product.stock} unidades disponibles
              </span>{" "}
              en stock para este producto.
            </div>
          </div>

          <div className="mt-8 grid gap-4 text-sm text-gray-600">
            <div className="bg-[#fcfbf8] rounded-2xl p-4 border border-black/5">
              🚚 Envío rápido disponible
            </div>
            <div className="bg-[#fcfbf8] rounded-2xl p-4 border border-black/5">
              🔒 Compra segura
            </div>
            <div className="bg-[#fcfbf8] rounded-2xl p-4 border border-black/5">
              ✨ Calidad premium
            </div>
          </div>

          <button
            onClick={() => addToCart(product, selectedSize)}
            disabled={product.stock <= 0 || !selectedSize}
            className="mt-8 bg-[#111827] text-white px-6 py-4 rounded-2xl font-bold hover:bg-[#1f2937] transition w-full md:w-fit shadow-lg"
          >
            Agregar al carrito
          </button>
        </div>
      </div>

      {similarProducts.length > 0 && (
        <section className="max-w-7xl mx-auto mt-10">
          <div className="mb-6">
            <p className="text-[#7a1f2b] font-bold uppercase tracking-[0.25em] text-sm">
              Recomendaciones
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827] mt-2">
              Productos similares
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
            {similarProducts.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default ProductDetail;
