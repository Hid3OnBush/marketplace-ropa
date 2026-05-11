import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { products } from "../data/products";

function Home() {
  const featuredProducts = products.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#f6f4ef]">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 items-center bg-white rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden border border-black/5 shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
          <div className="p-6 sm:p-8 md:p-14">
            <p className="text-[#7a1f2b] font-bold uppercase tracking-[0.25em] sm:tracking-[0.3em] text-xs sm:text-sm">
              Colección premium
            </p>

            <h1 className="mt-4 sm:mt-5 text-3xl sm:text-4xl md:text-6xl font-extrabold text-[#111827] leading-tight tracking-tight">
              Moda contemporánea con esencia urbana
            </h1>

            <p className="mt-5 sm:mt-6 text-gray-600 text-base sm:text-lg leading-relaxed max-w-xl">
              Descubre prendas modernas, limpias y versátiles en una experiencia
              digital inspirada en marcas de moda premium y ecommerce
              profesionales.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link
                to="/productos"
                className="bg-[#111827] text-white px-7 py-3.5 rounded-2xl font-semibold hover:bg-[#1f2937] transition text-center"
              >
                Explorar catálogo
              </Link>

              <a
                href="#destacados"
                className="bg-[#efeae1] text-[#111827] px-7 py-3.5 rounded-2xl font-semibold hover:bg-[#e8e0d4] transition text-center"
              >
                Ver destacados
              </a>
            </div>

            <div className="mt-8 sm:mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#faf8f3] rounded-2xl p-4 text-center border border-black/5">
                <p className="text-2xl font-extrabold text-[#111827]">
                  +{featuredProducts.length}
                </p>
                <p className="text-sm text-gray-500 mt-1">Destacados</p>
              </div>

              <div className="bg-[#faf8f3] rounded-2xl p-4 text-center border border-black/5">
                <p className="text-2xl font-extrabold text-[#111827]">24h</p>
                <p className="text-sm text-gray-500 mt-1">Envío rápido</p>
              </div>

              <div className="bg-[#faf8f3] rounded-2xl p-4 text-center border border-black/5">
                <p className="text-2xl font-extrabold text-[#111827]">100%</p>
                <p className="text-sm text-gray-500 mt-1">Calidad</p>
              </div>
            </div>
          </div>

          <div className="h-full">
            <img
              src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80"
              alt="Moda premium"
              className="w-full h-full object-cover min-h-[280px] sm:min-h-[360px] lg:min-h-[680px]"
            />
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: "Playeras",
              desc: "Diseños limpios, versátiles y modernos para diario.",
            },
            {
              title: "Sudaderas",
              desc: "Comodidad premium con una estética urbana refinada.",
            },
            {
              title: "Pantalones",
              desc: "Cortes contemporáneos para completar tu look.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="bg-white rounded-[2rem] border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] p-6"
            >
              <p className="text-sm text-[#7a1f2b] font-bold uppercase tracking-[0.2em]">
                Categoría
              </p>
              <h3 className="text-2xl font-extrabold text-[#111827] mt-2">
                {item.title}
              </h3>
              <p className="text-gray-600 mt-3">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="bg-[#111827] rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.10)] p-6 sm:p-8 md:p-12 text-white flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <p className="uppercase tracking-[0.3em] text-sm font-bold text-[#d4af37]">
              Edición exclusiva
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mt-3">
              Descubre piezas seleccionadas con estilo premium
            </h2>
            <p className="mt-3 text-white/80 text-base sm:text-lg max-w-2xl">
              Una experiencia de compra moderna con diseño elegante y enfoque
              visual tipo marca real.
            </p>
          </div>

          <Link
            to="/productos"
            className="bg-[#d4af37] text-[#111827] px-7 py-3 rounded-2xl font-bold hover:opacity-90 transition"
          >
            Ver colección
          </Link>
        </div>
      </section>

      <section id="destacados" className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <p className="text-[#7a1f2b] font-bold uppercase tracking-[0.25em] text-sm">
              Selección
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#111827] mt-2 tracking-tight">
              Productos destacados
            </h2>
          </div>

          <Link
            to="/productos"
            className="text-[#7a1f2b] font-semibold hover:opacity-80 transition"
          >
            Ver todo el catálogo →
          </Link>
        </div>

        {featuredProducts.length === 0 ? (
          <div className="bg-white rounded-[2rem] border border-black/5 shadow-sm p-8 text-center text-gray-600">
            No hay productos disponibles todavía.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 pb-16">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: "🚚",
              title: "Entrega eficiente",
              desc: "Opciones estándar y express para mejorar la experiencia.",
            },
            {
              icon: "🔒",
              title: "Pago confiable",
              desc: "Flujo de compra claro, seguro y profesional.",
            },
            {
              icon: "✨",
              title: "Diseño premium",
              desc: "Una tienda visualmente sólida, moderna y elegante.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="bg-white rounded-[2rem] border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] p-6"
            >
              <div className="text-3xl">{item.icon}</div>
              <h3 className="text-xl font-bold text-[#111827] mt-4">
                {item.title}
              </h3>
              <p className="text-gray-600 mt-2">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;
