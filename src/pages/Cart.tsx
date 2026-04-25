import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

function Cart() {
  const {
    cartItems,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const total = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#f6f4ef] p-4 sm:p-6">
        <div className="max-w-5xl mx-auto bg-white rounded-[2rem] border border-black/5 shadow-[0_20px_60px_rgba(0,0,0,0.06)] p-8 sm:p-10 text-center">
          <p className="text-[#7a1f2b] font-bold uppercase tracking-[0.25em] text-sm">
            Carrito
          </p>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111827] mt-4 tracking-tight">
            Tu carrito está vacío
          </h1>

          <p className="text-gray-600 mt-4 text-base sm:text-lg">
            Aún no has agregado productos. Explora el catálogo y encuentra tu
            próximo outfit.
          </p>

          <Link
            to="/productos"
            className="inline-block mt-8 bg-[#111827] text-white px-7 py-3.5 rounded-2xl font-semibold hover:bg-[#1f2937] transition"
          >
            Ir al catálogo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f4ef] p-4 sm:p-6">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 bg-white rounded-[2rem] border border-black/5 shadow-[0_20px_60px_rgba(0,0,0,0.06)] p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <p className="text-[#7a1f2b] font-bold uppercase tracking-[0.25em] text-sm">
                Carrito
              </p>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111827] mt-3 tracking-tight">
                Tus productos seleccionados
              </h1>
            </div>

            <button
              onClick={clearCart}
              className="bg-red-50 text-red-600 px-5 py-3 rounded-2xl font-semibold hover:bg-red-100 transition w-fit"
            >
              Vaciar carrito
            </button>
          </div>

          <div className="grid gap-6">
            {cartItems.map((item) => (
              <article
                key={item.id}
                className="border border-black/8 rounded-[1.75rem] p-4 sm:p-5 bg-[#fffdfa] flex flex-col md:flex-row gap-5 items-center"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full max-w-[220px] md:w-36 h-36 object-cover rounded-2xl"
                />

                <div className="flex-1 w-full text-center md:text-left">
                  <p className="text-sm font-bold text-[#7a1f2b] uppercase tracking-wide">
                    {item.category}
                  </p>

                  <h2 className="text-2xl font-extrabold text-[#111827] mt-1">
                    {item.name}
                  </h2>

                  <p className="text-gray-500 mt-2 text-sm leading-relaxed">
                    {item.description}
                  </p>

                  <div className="flex items-center justify-center md:justify-start gap-3 mt-5">
                    <button
                      onClick={() => decreaseQuantity(item.id)}
                      className="w-10 h-10 rounded-xl bg-[#efeae1] hover:bg-[#e8e0d4] font-bold text-lg text-[#111827] transition"
                    >
                      -
                    </button>

                    <span className="text-lg font-semibold text-[#111827] min-w-[24px] text-center">
                      {item.quantity}
                    </span>

                    <button
                      onClick={() => increaseQuantity(item.id)}
                      className="w-10 h-10 rounded-xl bg-[#efeae1] hover:bg-[#e8e0d4] font-bold text-lg text-[#111827] transition"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="text-center md:text-right min-w-[120px]">
                  <p className="text-2xl font-extrabold text-[#111827]">
                    ${item.price * item.quantity}
                  </p>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="mt-4 px-3 py-2 rounded-xl bg-red-50 text-red-600 font-semibold hover:bg-red-100 transition"
                  >
                    Eliminar
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="bg-white rounded-[2rem] border border-black/5 shadow-[0_20px_60px_rgba(0,0,0,0.06)] p-6 h-fit lg:sticky lg:top-28">
          <p className="text-[#7a1f2b] font-bold uppercase tracking-[0.25em] text-sm">
            Resumen
          </p>

          <h2 className="text-3xl font-extrabold text-[#111827] mt-3">
            Tu compra
          </h2>

          <div className="mt-6 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between text-sm text-gray-700 gap-4"
              >
                <span>
                  {item.name} x{item.quantity}
                </span>
                <span className="font-semibold text-[#111827]">
                  ${item.price * item.quantity}
                </span>
              </div>
            ))}
          </div>

          <hr className="my-6 border-black/10" />

          <div className="space-y-3 text-gray-700">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${total}</span>
            </div>

            <div className="flex justify-between">
              <span>Envío</span>
              <span>Se calcula en checkout</span>
            </div>

            <div className="flex justify-between text-xl font-extrabold text-[#111827] pt-3 border-t border-black/10">
              <span>Total estimado</span>
              <span className="text-[#7a1f2b]">${total}</span>
            </div>
          </div>

          <Link
            to="/checkout"
            className="block text-center mt-8 bg-[#111827] text-white px-6 py-4 rounded-2xl font-bold hover:bg-[#1f2937] transition shadow-sm"
          >
            Continuar al pago
          </Link>
        </aside>
      </div>
    </div>
  );
}

export default Cart;