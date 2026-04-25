import { Link } from "react-router-dom";
import type { Product } from "../types/product";

interface Props {
  product: Product;
}

function ProductCard({ product }: Props) {
  return (
    <article className="group bg-white rounded-[2rem] overflow-hidden border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_18px_40px_rgba(0,0,0,0.08)] transition-all duration-300">
      <div className="relative overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-64 sm:h-72 lg:h-80 object-cover group-hover:scale-[1.03] transition duration-500"
        />

        <div className="absolute top-4 left-4">
          <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-[#7a1f2b] shadow-sm">
            {product.category}
          </span>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold tracking-tight text-[#111827] line-clamp-2">
          {product.name}
        </h3>

        <p className="text-gray-500 text-sm mt-2 leading-relaxed line-clamp-2 sm:line-clamp-3">
          {product.description}
        </p>

        <div className="mt-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] sm:text-xs uppercase tracking-[0.2em] text-gray-400">
              Precio
            </p>
            <p className="text-xl sm:text-2xl font-extrabold text-[#111827]">
              ${product.price}
            </p>
          </div>

          <Link
            to={`/producto/${product.id}`}
            className="shrink-0 px-4 sm:px-5 py-2.5 rounded-2xl bg-[#111827] text-white text-sm sm:text-base font-semibold hover:bg-[#1f2937] transition"
          >
            Ver más
          </Link>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;