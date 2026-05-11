import { useEffect, useMemo, useState } from "react";
import ProductCard from "../components/ProductCard";
import type { Product } from "../types/product";
import API_URL from "../api/api";
import { products as initialProducts } from "../data/products";
import { applyProductOverrides } from "../utils/productStorage";
import {
  isProductOnSale,
  normalizeProduct,
} from "../utils/productHelpers";

function Products() {
  const [productList, setProductList] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todos");
  const [gender, setGender] = useState("Todos");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);

        const response = await fetch(`${API_URL}/products`);
        const data = await response.json();

        const mappedProducts =
          Array.isArray(data) && data.length > 0
            ? data.map(normalizeProduct)
            : initialProducts.map(normalizeProduct);

        setProductList(applyProductOverrides(mappedProducts));
      } catch (error) {
        console.error("Error cargando productos:", error);
        setProductList(
          applyProductOverrides(initialProducts.map(normalizeProduct))
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(productList.map((product) => product.category))
    );

    return ["Todos", ...uniqueCategories];
  }, [productList]);

  const genders = useMemo(() => {
    const uniqueGenders = Array.from(
      new Set(productList.map((product) => product.gender))
    );

    return ["Todos", ...uniqueGenders];
  }, [productList]);

  const filteredProducts = useMemo(() => {
    return productList.filter((product) => {
      const matchesCategory =
        category === "Todos" || product.category === category;
      const matchesGender = gender === "Todos" || product.gender === gender;

      const matchesSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.description.toLowerCase().includes(search.toLowerCase()) ||
        product.category.toLowerCase().includes(search.toLowerCase()) ||
        product.gender.toLowerCase().includes(search.toLowerCase());

      return matchesCategory && matchesGender && matchesSearch;
    });
  }, [productList, search, category, gender]);

  const saleProducts = useMemo(() => {
    return filteredProducts.filter(isProductOnSale).slice(0, 3);
  }, [filteredProducts]);

  const regularProducts = useMemo(() => {
    const saleProductIds = new Set(saleProducts.map((product) => product.id));
    return filteredProducts.filter((product) => !saleProductIds.has(product.id));
  }, [filteredProducts, saleProducts]);

  const recommendedProducts = useMemo(() => {
    if (!search.trim() && category === "Todos" && gender === "Todos") {
      return [];
    }

    const filteredIds = new Set(filteredProducts.map((product) => product.id));
    const searchWords = search
      .toLowerCase()
      .split(" ")
      .map((word) => word.trim())
      .filter(Boolean);

    return productList
      .filter((product) => !filteredIds.has(product.id))
      .filter((product) => {
        const matchesCategory =
          category !== "Todos" && product.category === category;
        const matchesGender = gender !== "Todos" && product.gender === gender;
        const searchableText =
          `${product.name} ${product.description} ${product.category} ${product.gender}`.toLowerCase();
        const matchesSearch = searchWords.some((word) =>
          searchableText.includes(word)
        );

        return matchesCategory || matchesGender || matchesSearch;
      })
      .slice(0, 3);
  }, [productList, filteredProducts, search, category, gender]);

  return (
    <div className="min-h-screen bg-[#f6f4ef]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="bg-white rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.06)] border border-black/5 p-6 sm:p-8 mb-8">
          <p className="text-[#7a1f2b] font-bold uppercase tracking-[0.25em] text-xs sm:text-sm">
            Catálogo
          </p>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111827] mt-3 tracking-tight">
            Nuestros productos
          </h1>

          <p className="text-gray-600 mt-3 max-w-2xl text-sm sm:text-base">
            Explora prendas con estilo moderno y usa filtros para encontrar lo
            que necesitas más rápido.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <input
              type="text"
              placeholder="Buscar productos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-black/10 bg-[#fcfbf8] rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#7a1f2b]"
            />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-black/10 bg-[#fcfbf8] rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#7a1f2b]"
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full border border-black/10 bg-[#fcfbf8] rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#7a1f2b]"
            >
              {genders.map((item) => (
                <option key={item} value={item}>
                  {item === "Todos" ? "Todos los generos" : item}
                </option>
              ))}
            </select>
          </div>

          <p className="mt-4 text-sm text-gray-500">
            {isLoading
              ? "Cargando productos..."
              : `Mostrando ${filteredProducts.length} producto${
                  filteredProducts.length !== 1 ? "s" : ""
                }`}
          </p>
        </div>

        {!isLoading && saleProducts.length > 0 && (
          <section className="mb-10">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
              <div>
                <p className="text-[#7a1f2b] font-bold uppercase tracking-[0.25em] text-sm">
                  Rebajas
                </p>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827] mt-2">
                  Ofertas disponibles
                </h2>
                <p className="text-gray-600 mt-2 text-sm">
                  Rebajas filtradas por tu busqueda actual.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
              {saleProducts.map((product) => (
                <ProductCard key={`sale-${product.id}`} product={product} />
              ))}
            </div>
          </section>
        )}

        {isLoading ? (
          <div className="bg-white rounded-[2rem] border border-black/5 shadow-sm p-8 sm:p-10 text-center">
            <h2 className="text-2xl font-bold text-[#111827]">
              Cargando catálogo...
            </h2>
            <p className="text-gray-600 mt-3">
              Estamos obteniendo los productos desde la base de datos.
            </p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-[2rem] border border-black/5 shadow-sm p-8 sm:p-10 text-center">
            <h2 className="text-2xl font-bold text-[#111827]">
              No se encontraron productos
            </h2>
            <p className="text-gray-600 mt-3">
              Intenta con otro nombre o cambia la categoría seleccionada.
            </p>
          </div>
        ) : regularProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
            {regularProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : null}

        {!isLoading && recommendedProducts.length > 0 && (
          <section className="mt-12">
            <div className="mb-6">
              <p className="text-[#7a1f2b] font-bold uppercase tracking-[0.25em] text-sm">
                Recomendaciones
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827] mt-2">
                Opciones similares para ti
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
              {recommendedProducts.map((product) => (
                <ProductCard
                  key={`recommendation-${product.id}`}
                  product={product}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default Products;
