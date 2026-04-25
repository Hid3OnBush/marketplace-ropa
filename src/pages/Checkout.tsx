import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../auth/AuthContext";
import MercadoPagoButton from "../components/MercadoPagoButton";
import { saveCheckoutSnapshot } from "../utils/checkoutStorage";
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

  const shipping = formData.metodoEnvio === "express" ? 199 : 99;
  const total = subtotal + shipping;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validateCheckoutData = () => {
    if (
      !formData.nombre.trim() ||
      !formData.correo.trim() ||
      !formData.direccion.trim() ||
      !formData.ciudad.trim()
    ) {
      alert("Completa todos los datos de envío antes de pagar.");
      return false;
    }

    return true;
  };

  const saveSnapshot = () => {
    saveCheckoutSnapshot({
      customerName: formData.nombre,
      customerEmail: formData.correo,
      address: formData.direccion,
      city: formData.ciudad,
      shippingMethod: formData.metodoEnvio,
      shippingCost: shipping,
      total,
      items: cartItems.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: item.quantity,
      })),
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
          items: [
            ...cartItems.map((item) => ({
              id: item.id,
              name: item.name,
              price: item.price,
              image: item.image,
              quantity: item.quantity,
            })),
            {
              id: 999999,
              name:
                formData.metodoEnvio === "express"
                  ? "Envío express"
                  : "Envío estándar",
              price: shipping,
              image: "",
              quantity: 1,
            },
          ],
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
      <div className="min-h-screen bg-[#f6f4ef] p-4 sm:p-6">
        <div className="max-w-4xl mx-auto bg-white rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.06)] border border-black/5 p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#111827]">
            Checkout
          </h1>
          <p className="mt-4 text-gray-600">
            Tu carrito está vacío. Agrega productos antes de continuar.
          </p>
          <Link
            to="/productos"
            className="inline-block mt-6 bg-[#111827] text-white px-6 py-3 rounded-2xl font-bold hover:bg-[#1f2937] transition"
          >
            Ver productos
          </Link>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#f6f4ef] p-4 sm:p-6">
        <div className="max-w-4xl mx-auto bg-white rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.06)] border border-black/5 p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#111827]">
            Checkout
          </h1>
          <p className="mt-4 text-gray-600">
            Debes iniciar sesión para completar tu compra.
          </p>

          <button
            onClick={() => navigate("/login")}
            className="mt-6 bg-[#111827] text-white px-6 py-3 rounded-2xl font-bold hover:bg-[#1f2937] transition"
          >
            Ir a iniciar sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f4ef] p-4 sm:p-6">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.06)] border border-black/5 p-6 sm:p-8">
            <p className="text-[#7a1f2b] font-bold uppercase tracking-[0.25em] text-xs sm:text-sm">
              Checkout
            </p>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111827] mt-3 tracking-tight">
              Finaliza tu compra
            </h1>

            <p className="text-gray-600 mt-3">
              Completa tus datos de envío y elige tu método de pago.
            </p>

            <form className="grid gap-5 mt-8">
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  name="nombre"
                  placeholder="Nombre completo"
                  value={formData.nombre}
                  onChange={handleChange}
                  className="border border-black/10 bg-[#fcfbf8] p-4 rounded-2xl outline-none focus:ring-2 focus:ring-[#7a1f2b]"
                  required
                />

                <input
                  name="correo"
                  type="email"
                  placeholder="Correo electrónico"
                  value={formData.correo}
                  onChange={handleChange}
                  className="border border-black/10 bg-[#fcfbf8] p-4 rounded-2xl outline-none focus:ring-2 focus:ring-[#7a1f2b]"
                  required
                />
              </div>

              <input
                name="direccion"
                placeholder="Dirección"
                value={formData.direccion}
                onChange={handleChange}
                className="border border-black/10 bg-[#fcfbf8] p-4 rounded-2xl outline-none focus:ring-2 focus:ring-[#7a1f2b]"
                required
              />

              <div className="grid md:grid-cols-2 gap-4">
                <input
                  name="ciudad"
                  placeholder="Ciudad"
                  value={formData.ciudad}
                  onChange={handleChange}
                  className="border border-black/10 bg-[#fcfbf8] p-4 rounded-2xl outline-none focus:ring-2 focus:ring-[#7a1f2b]"
                  required
                />

                <select
                  name="metodoEnvio"
                  value={formData.metodoEnvio}
                  onChange={handleChange}
                  className="border border-black/10 bg-[#fcfbf8] p-4 rounded-2xl outline-none focus:ring-2 focus:ring-[#7a1f2b]"
                >
                  <option value="estandar">Envío estándar - $99</option>
                  <option value="express">Envío express - $199</option>
                </select>
              </div>
            </form>

            <div className="mt-8">
              <p className="text-[#7a1f2b] font-bold uppercase tracking-[0.25em] text-xs sm:text-sm">
                Pago
              </p>

              <h2 className="text-xl sm:text-2xl font-extrabold text-[#111827] mt-2 mb-4">
                Selecciona método de pago
              </h2>

              <div className="grid sm:grid-cols-3 gap-4 mb-6">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("mercadopago")}
                  className={`p-4 rounded-2xl border font-bold transition ${
                    paymentMethod === "mercadopago"
                      ? "border-[#7a1f2b] bg-[#fff7f8] text-[#7a1f2b]"
                      : "border-black/10 bg-[#fcfbf8] text-[#111827]"
                  }`}
                >
                  Mercado Pago
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("stripe")}
                  className={`p-4 rounded-2xl border font-bold transition ${
                    paymentMethod === "stripe"
                      ? "border-[#635bff] bg-[#f4f3ff] text-[#3730a3]"
                      : "border-black/10 bg-[#fcfbf8] text-[#111827]"
                  }`}
                >
                  Stripe
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("paypal")}
                  className={`p-4 rounded-2xl border font-bold transition ${
                    paymentMethod === "paypal"
                      ? "border-[#003087] bg-[#eef5ff] text-[#003087]"
                      : "border-black/10 bg-[#fcfbf8] text-[#111827]"
                  }`}
                >
                  PayPal
                </button>
              </div>

              {paymentMethod === "mercadopago" && (
                <MercadoPagoButton
                  items={cartItems.map((item) => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    image: item.image,
                    quantity: item.quantity,
                  }))}
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
                  disabled={isStripeLoading}
                  className="w-full bg-[#635bff] text-white py-4 rounded-2xl font-bold hover:opacity-90 transition disabled:opacity-70"
                >
                  {isStripeLoading ? "Abriendo Stripe..." : "Pagar con Stripe"}
                </button>
              )}

              {paymentMethod === "paypal" && (
                <button
                  onClick={handlePaypalPayment}
                  disabled={isPaypalLoading}
                  className="w-full bg-[#003087] text-white py-4 rounded-2xl font-bold hover:opacity-90 transition disabled:opacity-70"
                >
                  {isPaypalLoading ? "Abriendo PayPal..." : "Pagar con PayPal"}
                </button>
              )}

              <div className="mt-5 bg-[#fcfbf8] border border-black/5 rounded-2xl p-4">
                <p className="text-sm text-gray-600 leading-relaxed">
                  Después de completar el pago, vuelve a la tienda y revisa el
                  estado de tu compra en{" "}
                  <span className="font-semibold text-[#111827]">
                    Mis pedidos
                  </span>
                  .
                </p>

                <Link
                  to="/mis-pedidos"
                  className="inline-block mt-4 bg-[#efeae1] text-[#111827] px-5 py-3 rounded-2xl font-semibold hover:bg-[#e8e0d4] transition"
                >
                  Ya pagué, ver mis pedidos
                </Link>
              </div>
            </div>
          </section>
        </div>

        <aside className="bg-white rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.06)] border border-black/5 p-6 h-fit lg:sticky lg:top-28">
          <h2 className="text-2xl font-extrabold text-[#111827] mb-6">
            Resumen
          </h2>

          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex gap-3 items-center">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover"
                />

                <div className="flex-1">
                  <p className="font-semibold text-[#111827] text-sm">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    Cantidad: {item.quantity}
                  </p>
                </div>

                <p className="font-bold text-[#111827] text-sm sm:text-base">
                  ${item.price * item.quantity}
                </p>
              </div>
            ))}
          </div>

          <hr className="my-6 border-black/10" />

          <div className="space-y-3 text-gray-700 text-sm sm:text-base">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${subtotal}</span>
            </div>

            <div className="flex justify-between">
              <span>Envío</span>
              <span>${shipping}</span>
            </div>

            <div className="flex justify-between text-lg sm:text-xl font-extrabold text-[#111827] pt-3 border-t border-black/10">
              <span>Total</span>
              <span className="text-[#7a1f2b]">${total}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Checkout;