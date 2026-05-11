import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import {
  FREE_SHIPPING_THRESHOLD,
  qualifiesForFreeShipping,
} from "../utils/shipping";

function Cart() {
  const {
    cartItems,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const hasFreeShipping = qualifiesForFreeShipping(subtotal);
  const amountForFreeShipping = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0);

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#f7f5f1] px-4 py-10 sm:px-6">
        <section className="mx-auto max-w-3xl border border-black/10 bg-white px-6 py-14 text-center sm:px-12">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gray-500">
            Bolsa de compra
          </p>

          <h1 className="mt-5 text-3xl font-semibold tracking-tight text-[#111111] sm:text-5xl">
            Tu bolsa esta vacia
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-gray-600 sm:text-base">
            Guarda aqui tus prendas favoritas y vuelve cuando tengas listo el
            look completo.
          </p>

          <Link
            to="/productos"
            className="mt-8 inline-flex h-12 items-center justify-center bg-[#111111] px-8 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-black"
          >
            Ver catalogo
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f5f1] px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-7xl">
        <header className="border-b border-black/10 pb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gray-500">
                Bolsa de compra
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#111111] sm:text-5xl">
                Tu seleccion
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <p className="text-sm text-gray-600">
                {itemCount} articulo{itemCount !== 1 ? "s" : ""}
              </p>
              <Link
                to="/productos"
                className="text-sm font-semibold uppercase tracking-[0.16em] text-[#111111] underline underline-offset-4"
              >
                Seguir comprando
              </Link>
            </div>
          </div>
        </header>

        <div className="grid gap-10 pt-8 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-start">
          <section className="bg-white">
            <div className="hidden border-b border-black/10 px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 md:grid md:grid-cols-[1fr_140px_140px]">
              <span>Producto</span>
              <span className="text-center">Cantidad</span>
              <span className="text-right">Total</span>
            </div>

            <div className="divide-y divide-black/10">
              {cartItems.map((item) => (
                <article
                  key={item.cartKey}
                  className="grid gap-5 px-4 py-6 sm:px-6 md:grid-cols-[1fr_140px_140px] md:items-center"
                >
                  <div className="grid grid-cols-[104px_1fr] gap-4 sm:grid-cols-[128px_1fr]">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-36 w-full object-cover sm:h-44"
                    />

                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                        {item.category}
                      </p>
                      <h2 className="mt-2 text-lg font-semibold leading-tight text-[#111111] sm:text-xl">
                        {item.name}
                      </h2>

                      <div className="mt-4 grid gap-1 text-sm text-gray-600">
                        <p>Talla: {item.selectedSize}</p>
                        <p>Precio unitario: ${item.price}</p>
                        <p>Disponibles: {item.stock}</p>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.cartKey)}
                        className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-gray-500 underline underline-offset-4 transition hover:text-[#111111]"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-center">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500 md:hidden">
                      Cantidad
                    </span>

                    <div className="grid h-11 grid-cols-3 border border-black/20">
                      <button
                        onClick={() => decreaseQuantity(item.cartKey)}
                        className="h-11 w-11 text-lg transition hover:bg-[#f1eee8]"
                        aria-label="Disminuir cantidad"
                      >
                        -
                      </button>
                      <span className="flex h-11 w-11 items-center justify-center border-x border-black/20 text-sm font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => increaseQuantity(item.cartKey)}
                        disabled={item.quantity >= item.stock}
                        className="h-11 w-11 text-lg transition hover:bg-[#f1eee8] disabled:cursor-not-allowed disabled:opacity-35"
                        aria-label="Aumentar cantidad"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:block md:text-right">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500 md:hidden">
                      Total
                    </span>
                    <p className="text-lg font-semibold text-[#111111]">
                      ${item.price * item.quantity}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <aside className="border border-black/10 bg-white p-6 lg:sticky lg:top-28">
            <div className="flex items-center justify-between border-b border-black/10 pb-5">
              <h2 className="text-xl font-semibold tracking-tight text-[#111111]">
                Resumen
              </h2>
              <button
                onClick={clearCart}
                className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500 underline underline-offset-4 transition hover:text-red-600"
              >
                Vaciar
              </button>
            </div>

            <div className="space-y-4 py-6 text-sm text-gray-700">
              {cartItems.map((item) => (
                <div
                  key={item.cartKey}
                  className="flex items-start justify-between gap-4"
                >
                  <span>
                    {item.name}
                    <span className="block text-xs text-gray-500">
                      Talla {item.selectedSize} / x{item.quantity}
                    </span>
                  </span>
                  <span className="font-semibold text-[#111111]">
                    ${item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-4 border-t border-black/10 py-6 text-sm">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal</span>
                <span>${subtotal}</span>
              </div>
              {hasFreeShipping ? (
                <div className="bg-[#f7f5f1] px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#111111]">
                  Envio gratis aplicado
                </div>
              ) : (
                <div className="text-xs leading-5 text-gray-500">
                  Agrega ${amountForFreeShipping} mas para obtener envio gratis.
                </div>
              )}
              <div className="flex justify-between border-t border-black/10 pt-5 text-lg font-semibold text-[#111111]">
                <span>Total estimado</span>
                <span>${subtotal}</span>
              </div>
            </div>

            <Link
              to="/checkout"
              className="flex min-h-12 w-full items-center justify-center bg-[#111111] px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-black sm:text-sm sm:tracking-[0.18em]"
            >
              Continuar al pago
            </Link>

            <p className="mt-5 text-xs leading-5 text-gray-500">
              El costo de envio se confirma antes de pagar segun el metodo que
              elijas.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default Cart;
