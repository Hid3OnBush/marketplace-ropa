import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import type { Product } from "../types/product";
import API_URL from "../api/api";

function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setIsLoading(true);

        const response = await fetch(`${API_URL}/products`);
        const data: Product[] = await response.json();

        const foundProduct = data.find((item) => item.id === Number(id));
        setProduct(foundProduct);
      } catch (error) {
        console.error("Error cargando producto:", error);
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
              ${product.price}
            </span>
            <span className="text-sm text-gray-500">IVA incluido</span>
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
            onClick={() => addToCart(product)}
            className="mt-8 bg-[#111827] text-white px-6 py-4 rounded-2xl font-bold hover:bg-[#1f2937] transition w-full md:w-fit shadow-lg"
          >
            Agregar al carrito
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;