import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../auth/AuthContext";
import MercadoPagoButton from "../components/MercadoPagoButton";
import { saveCheckoutSnapshot } from "../utils/checkoutStorage";
import {
  FREE_SHIPPING_THRESHOLD,
  getShippingCost,
  qualifiesForFreeShipping,
} from "../utils/shipping";
import API_URL from "../api/api";

type PaymentMethod = "mercadopago" | "stripe" | "paypal";

function Checkout() {
  const { cartItems } = useCart();
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("mercadopago");

  const [isStripeLoading, setIsStripeLoading] = useState(false);
  const [isPaypalLoading, setIsPaypalLoading] = useState(false);

  const [formData, setFormData] = useState({
    nombre: user?.name || "",
    correo: user?.email || "",
    direccion: user?.address || "",
    ciudad: user?.city || "",
    metodoEnvio: "estandar",
  });

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const hasFreeShipping = qualifiesForFreeShipping(subtotal);
  const shipping = getShippingCost(subtotal, formData.metodoEnvio);
  const total = subtotal + shipping;
  const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const shippingLabel =
    hasFreeShipping
      ? "Envio gratis"
      : formData.metodoEnvio === "express"
      ? "Envio express"
      : "Envio estandar";

  const isCheckoutReady =
    Boolean(formData.nombre.trim()) &&
    Boolean(formData.correo.trim()) &&
    Boolean(formData.direccion.trim()) &&
    Boolean(formData.ciudad.trim());

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validateCheckoutData = () => {
    if (!isCheckoutReady) {
      alert("Completa todos los datos de envio antes de pagar.");
      return false;
    }

    return true;
  };

  const checkoutItems = cartItems.map((item) => ({
    id: item.id,
    name: item.name,
    price: item.price,
    image: item.image,
    quantity: item.quantity,
    selectedSize: item.selectedSize,
  }));

  const saveSnapshot = () => {
    saveCheckoutSnapshot({
      customerName: formData.nombre,
      customerEmail: formData.correo,
      address: formData.direccion,
      city: formData.ciudad,
      shippingMethod: formData.metodoEnvio,
      shippingCost: shipping,
      total,
      items: checkoutItems,
      createdAt: new Date().toISOString(),
    });
  };

  const handleStripePayment = async () => {
    if (!validateCheckoutData()) return;

    try {
      setIsStripeLoading(true);
      saveSnapshot();

      const response = await fetch(`${API_URL}/payments/stripe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items:
            shipping > 0
              ? [
                  ...checkoutItems,
                  {
                    id: 999999,
                    name: shippingLabel,
                    price: shipping,
                    image: "",
                    quantity: 1,
                  },
                ]
              : checkoutItems,
          total,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.url) {
        alert("No se pudo iniciar el pago con Stripe.");
        console.error(data);
        return;
      }

      window.location.href = data.url;
    } catch (error) {
      console.error("Error con Stripe:", error);
      alert("Error al conectar con Stripe.");
    } finally {
      setIsStripeLoading(false);
    }
  };

  const handlePaypalPayment = async () => {
    if (!validateCheckoutData()) return;

    try {
      setIsPaypalLoading(true);
      saveSnapshot();

      const response = await fetch(`${API_URL}/payments/paypal`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ total }),
      });

      const data = await response.json();

      if (!response.ok || !data.url) {
        alert("No se pudo iniciar el pago con PayPal.");
        console.error(data);
        return;
      }

      window.location.href = data.url;
    } catch (error) {
      console.error("Error con PayPal:", error);
      alert("Error al conectar con PayPal.");
    } finally {
      setIsPaypalLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#f7f5f1] px-4 py-10 sm:px-6">
        <section className="mx-auto max-w-3xl border border-black/10 bg-white px-6 py-14 text-center sm:px-12">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gray-500">
            Checkout
          </p>
              <h1 className="mt-5 text-3xl font-semibold tracking-tight text-[#111111] sm:text-5xl">
            Tu bolsa esta vacia
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-gray-600 sm:text-base">
            Agrega productos antes de continuar con el pago.
          </p>
          <Link
            to="/productos"
            className="mt-8 inline-flex min-h-12 items-center justify-center bg-[#111111] px-6 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-black sm:px-8 sm:text-sm sm:tracking-[0.18em]"
          >
            Ver catalogo
          </Link>
        </section>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#f7f5f1] px-4 py-10 sm:px-6">
        <section className="mx-auto max-w-3xl border border-black/10 bg-white px-6 py-14 text-center sm:px-12">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gray-500">
            Checkout
          </p>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight text-[#111111] sm:text-5xl">
            Inicia sesion
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-gray-600 sm:text-base">
            Necesitas entrar a tu cuenta para completar la compra.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="mt-8 inline-flex min-h-12 items-center justify-center bg-[#111111] px-6 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-black sm:px-8 sm:text-sm sm:tracking-[0.18em]"
          >
            Ir a iniciar sesion
          </button>
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
                Checkout
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#111111] sm:text-5xl">
                Finalizar compra
              </h1>
            </div>

            <Link
              to="/carrito"
              className="text-sm font-semibold uppercase tracking-[0.16em] text-[#111111] underline underline-offset-4"
            >
              Volver a la bolsa
            </Link>
          </div>
        </header>

        <div className="grid gap-10 pt-8 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-start">
          <div className="space-y-6">
            <section className="border border-black/10 bg-white">
              <div className="border-b border-black/10 px-5 py-4 sm:px-6">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500">
                  01 / Envio
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-[#111111] sm:text-2xl">
                  Datos de entrega
                </h2>
              </div>

              <form className="grid gap-4 p-5 sm:p-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <input
                    name="nombre"
                    placeholder="Nombre completo"
                    value={formData.nombre}
                    onChange={handleChange}
                    className="h-12 border border-black/20 bg-white px-4 text-sm outline-none transition focus:border-[#111111]"
                    required
                  />

                  <input
                    name="correo"
                    type="email"
                    placeholder="Correo electronico"
                    value={formData.correo}
                    onChange={handleChange}
                    className="h-12 border border-black/20 bg-white px-4 text-sm outline-none transition focus:border-[#111111]"
                    required
                  />
                </div>

                <input
                  name="direccion"
                  placeholder="Direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  className="h-12 border border-black/20 bg-white px-4 text-sm outline-none transition focus:border-[#111111]"
                  required
                />

                <input
                  name="ciudad"
                  placeholder="Ciudad"
                  value={formData.ciudad}
                  onChange={handleChange}
                  className="h-12 border border-black/20 bg-white px-4 text-sm outline-none transition focus:border-[#111111]"
                  required
                />
              </form>
            </section>

            {!hasFreeShipping ? (
              <section className="border border-black/10 bg-white">
                <div className="border-b border-black/10 px-5 py-4 sm:px-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500">
                    02 / Metodo de envio
                  </p>
                  <h2 className="mt-2 text-xl font-semibold tracking-tight text-[#111111] sm:text-2xl">
                    Elige tu entrega
                  </h2>
                </div>

                <div className="grid gap-3 p-5 sm:p-6">
                  {[
                    {
                      value: "estandar",
                      title: "Envio estandar",
                      detail: "Entrega regular",
                      price: 99,
                    },
                    {
                      value: "express",
                      title: "Envio express",
                      detail: "Entrega prioritaria",
                      price: 199,
                    },
                  ].map((option) => {
                    const isSelected = formData.metodoEnvio === option.value;

                    return (
                      <label
                        key={option.value}
                        className={`flex cursor-pointer items-center justify-between gap-3 border px-4 py-4 transition ${
                          isSelected
                            ? "border-[#111111] bg-[#f7f5f1]"
                            : "border-black/10 bg-white hover:border-black/30"
                        }`}
                      >
                        <span className="flex min-w-0 items-center gap-3">
                          <input
                            type="radio"
                            name="metodoEnvio"
                            value={option.value}
                            checked={isSelected}
                            onChange={handleChange}
                            className="accent-[#111111]"
                          />
                          <span className="min-w-0">
                            <span className="block text-sm font-semibold text-[#111111]">
                              {option.title}
                            </span>
                            <span className="block text-xs text-gray-500">
                              {option.detail}
                            </span>
                          </span>
                        </span>
                        <span className="shrink-0 text-sm font-semibold text-[#111111]">
                          ${option.price}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </section>
            ) : (
              <section className="border border-black/10 bg-white px-5 py-5 sm:px-6">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500">
                  02 / Envio gratis
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-[#111111] sm:text-2xl">
                  Tu compra supera ${FREE_SHIPPING_THRESHOLD}
                </h2>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  No se agregara ningun cargo de envio al pago.
                </p>
              </section>
            )}

            <section className="border border-black/10 bg-white">
              <div className="border-b border-black/10 px-5 py-4 sm:px-6">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500">
                  03 / Pago
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-[#111111] sm:text-2xl">
                  Metodo de pago
                </h2>
              </div>

              <div className="p-5 sm:p-6">
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    ["mercadopago", "Mercado Pago"],
                    ["stripe", "Stripe"],
                    ["paypal", "PayPal"],
                  ].map(([value, label]) => {
                    const isSelected = paymentMethod === value;

                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setPaymentMethod(value as PaymentMethod)}
                        className={`h-12 border text-sm font-semibold uppercase tracking-[0.12em] transition ${
                          isSelected
                            ? "border-[#111111] bg-[#111111] text-white"
                            : "border-black/20 bg-white text-[#111111] hover:border-[#111111]"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-5">
                  {paymentMethod === "mercadopago" && (
                    <MercadoPagoButton
                      items={checkoutItems}
                      disabled={!isCheckoutReady}
                      disabledMessage="Completa tus datos de envio"
                      checkoutData={{
                        customerName: formData.nombre,
                        customerEmail: formData.correo,
                        address: formData.direccion,
                        city: formData.ciudad,
                        shippingMethod: formData.metodoEnvio,
                        shippingCost: shipping,
                        total,
                      }}
                    />
                  )}

                  {paymentMethod === "stripe" && (
                    <button
                      onClick={handleStripePayment}
                      disabled={isStripeLoading || !isCheckoutReady}
                      className="min-h-12 w-full bg-[#111111] px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-45 sm:text-sm sm:tracking-[0.18em]"
                    >
                      {isStripeLoading ? "Abriendo Stripe..." : "Pagar con Stripe"}
                    </button>
                  )}

                  {paymentMethod === "paypal" && (
                    <button
                      onClick={handlePaypalPayment}
                      disabled={isPaypalLoading || !isCheckoutReady}
                      className="min-h-12 w-full bg-[#111111] px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-45 sm:text-sm sm:tracking-[0.18em]"
                    >
                      {isPaypalLoading ? "Abriendo PayPal..." : "Pagar con PayPal"}
                    </button>
                  )}
                </div>

                {!isCheckoutReady && (
                  <p className="mt-4 text-xs leading-5 text-gray-500">
                    Completa los datos de entrega para activar el pago.
                  </p>
                )}
              </div>
            </section>
          </div>

          <aside className="border border-black/10 bg-white p-6 lg:sticky lg:top-28">
            <div className="border-b border-black/10 pb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500">
                Resumen
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-[#111111] sm:text-2xl">
                Tu pedido
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {itemCount} articulo{itemCount !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="space-y-5 py-6">
              {cartItems.map((item) => (
                <div
                  key={item.cartKey}
                  className="grid grid-cols-[64px_minmax(0,1fr)] gap-3 sm:grid-cols-[72px_minmax(0,1fr)]"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-24 w-full object-cover"
                  />
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-semibold leading-tight text-[#111111]">
                        {item.name}
                      </p>
                      <p className="text-sm font-semibold text-[#111111]">
                        ${item.price * item.quantity}
                      </p>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      Talla {item.selectedSize} / Cantidad {item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 border-t border-black/10 py-6 text-sm">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal</span>
                <span>${subtotal}</span>
              </div>
              {!hasFreeShipping && (
                <div className="flex justify-between text-gray-700">
                  <span>{shippingLabel}</span>
                  <span>${shipping}</span>
                </div>
              )}
              {hasFreeShipping && (
                <div className="bg-[#f7f5f1] px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#111111]">
                  Envio gratis aplicado
                </div>
              )}
              <div className="flex justify-between border-t border-black/10 pt-5 text-lg font-semibold text-[#111111]">
                <span>Total</span>
                <span>${total}</span>
              </div>
            </div>

            <p className="text-xs leading-5 text-gray-500">
              Al pagar se guardara tu pedido y podras consultar su estado en Mis
              pedidos.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
