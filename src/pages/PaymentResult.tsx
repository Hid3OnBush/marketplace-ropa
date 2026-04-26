import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../auth/AuthContext";
import {
clearCheckoutSnapshot,
getCheckoutSnapshot,
} from "../utils/checkoutStorage";
import API_URL from "../api/api";

const MP_BACKEND_URL = "https://mercadopago-backend-production.up.railway.app";

function PaymentResult() {
const location = useLocation();
const { clearCart } = useCart();
const { user } = useAuth();

const [orderCreated, setOrderCreated] = useState(false);
const hasProcessedPayment = useRef(false);
const [verifiedStatus, setVerifiedStatus] = useState<string>("");
const [isChecking, setIsChecking] = useState(true);
const [snapshotFound, setSnapshotFound] = useState(true);

const params = useMemo(
() => new URLSearchParams(location.search),
[location.search]
);

const paymentId =
params.get("payment_id") || params.get("collection_id") || "";

const paypalToken = params.get("token") || "";
const status = params.get("status") || "";
const merchantOrderId = params.get("merchant_order_id") || "";
const provider = params.get("provider") || "mercadopago";

const resultType = useMemo(() => {
if (location.pathname.includes("success")) return "success";
if (location.pathname.includes("pending")) return "pending";
if (location.pathname.includes("failure")) return "failure";
return "unknown";
}, [location.pathname]);

useEffect(() => {
if (hasProcessedPayment.current) return;
hasProcessedPayment.current = true;

const verifyAndCreateOrder = async () => {
const snapshot = getCheckoutSnapshot();

if (!snapshot) {
setSnapshotFound(false);
setIsChecking(false);
return;
}

if (resultType !== "success") {
setIsChecking(false);
return;
}

try {
let realStatus = "";

if (provider === "mercadopago") {
if (!paymentId) {
setVerifiedStatus(status || "");
setIsChecking(false);
return;
}

const paymentResponse = await fetch(
`${MP_BACKEND_URL}/payment-status/${paymentId}`
);

const paymentData = await paymentResponse.json();
realStatus = paymentData.status || "";
}

if (provider === "stripe") {
if (!paymentId) {
setVerifiedStatus(status || "");
setIsChecking(false);
return;
}

const stripeResponse = await fetch(
`${API_URL}/payments/stripe/session/${paymentId}`
);

const stripeData = await stripeResponse.json();
realStatus = stripeData.status === "paid" ? "approved" : "pending";
}

if (provider === "paypal") {
const paypalOrderId = paypalToken || paymentId;

if (!paypalOrderId) {
setVerifiedStatus(status || "");
setIsChecking(false);
return;
}

const paypalResponse = await fetch(
`${API_URL}/payments/paypal/capture`,
{
method: "POST",
headers: {
"Content-Type": "application/json",
},
body: JSON.stringify({
orderId: paypalOrderId,
}),
}
);

const paypalData = await paypalResponse.json();

if (!paypalResponse.ok) {
console.error("Error capturando PayPal:", paypalData);
realStatus = "pending";
} else {
realStatus =
paypalData.status === "COMPLETED" ? "approved" : "pending";
}
}

setVerifiedStatus(realStatus);

if (realStatus !== "approved") {
setIsChecking(false);
return;
}

const trackingNumber = `${provider.toUpperCase()}-${
paymentId || paypalToken || merchantOrderId || Date.now()
}`;

const today = new Date();
const estimated = new Date(today);
const extraDays = snapshot.shippingMethod === "express" ? 2 : 5;
estimated.setDate(today.getDate() + extraDays);

const existingOrderResponse = await fetch(
`${API_URL}/orders/user/${snapshot.customerEmail}`
);

const existingOrders = await existingOrderResponse.json();

const alreadyExists = existingOrders.some(
(order: any) =>
order.tracking_number === trackingNumber ||
order.trackingNumber === trackingNumber
);

if (alreadyExists) {
clearCart();
clearCheckoutSnapshot();
setOrderCreated(true);
setIsChecking(false);
return;
}

const orderResponse = await fetch(`${API_URL}/orders`, {
method: "POST",
headers: {
"Content-Type": "application/json",
},
body: JSON.stringify({
userId: user?.id || null,
customerName: snapshot.customerName,
customerEmail: snapshot.customerEmail,
address: snapshot.address,
city: snapshot.city,
shippingAddress: `${snapshot.address}, ${snapshot.city}`,
shippingMethod: snapshot.shippingMethod,
paymentMethod: provider.toUpperCase(),
trackingNumber,
carrier: "",
notes: "",
estimatedDelivery: estimated
.toISOString()
.slice(0, 19)
.replace("T", " "),
status: "Pagado",
total: snapshot.total,
items: snapshot.items,
}),
});

if (!orderResponse.ok) {
throw new Error("No se pudo guardar el pedido en la base de datos");
}

clearCart();
clearCheckoutSnapshot();
setOrderCreated(true);
} catch (error) {
console.error("Error verificando pago o creando pedido:", error);
} finally {
setIsChecking(false);
}
};

verifyAndCreateOrder();
}, [
resultType,
status,
paymentId,
paypalToken,
merchantOrderId,
clearCart,
user,
provider,
]);

const effectiveResult =
resultType === "success" && verifiedStatus === "approved"
? "success"
: resultType === "success" &&
verifiedStatus &&
verifiedStatus !== "approved"
? "pending"
: resultType;

const content = {
success: {
badge: "Pago aprobado",
title: "Tu compra fue procesada con éxito",
text: "Tu pago fue verificado correctamente y tu pedido ya quedó registrado en la base de datos.",
color: "text-green-700 bg-green-100",
iconBg: "bg-green-100",
icon: "✅",
},
pending: {
badge: "Pago pendiente",
title: "Tu pago aún no está confirmado",
text: "El pago todavía no está completamente aprobado. Revisa más tarde el estado de tu compra.",
color: "text-yellow-700 bg-yellow-100",
iconBg: "bg-yellow-100",
icon: "⏳",
},
failure: {
badge: "Pago no completado",
title: "No se pudo completar el pago",
text: "Tu pago no fue aprobado. Puedes volver al checkout e intentarlo de nuevo.",
color: "text-red-700 bg-red-100",
iconBg: "bg-red-100",
icon: "❌",
},
unknown: {
badge: "Estado desconocido",
title: "No pudimos identificar el resultado",
text: "Revisa tu cuenta o intenta de nuevo más tarde.",
color: "text-gray-700 bg-gray-100",
iconBg: "bg-gray-100",
icon: "ℹ️",
},
}[effectiveResult as "success" | "pending" | "failure" | "unknown"];

return (
<div className="min-h-screen bg-[#f6f4ef] flex items-center justify-center p-4 sm:p-6">
<div className="w-full max-w-3xl bg-white rounded-[2rem] border border-black/5 shadow-[0_20px_60px_rgba(0,0,0,0.06)] p-8 sm:p-10 text-center">
<div
className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center text-5xl ${content.iconBg}`}
>
{content.icon}
</div>

<div className="mt-8">
<span
className={`px-4 py-2 rounded-full text-sm font-semibold ${content.color}`}
>
{content.badge}
</span>
</div>

<h1 className="text-3xl sm:text-5xl font-extrabold text-[#111827] mt-6 tracking-tight">
{isChecking ? "Verificando tu pago..." : content.title}
</h1>

<p className="text-gray-600 mt-5 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
{isChecking
? "Estamos consultando el estado real de tu pago."
: content.text}
</p>

{!snapshotFound && !isChecking && (
<div className="mt-8 bg-[#fcfbf8] border border-black/5 rounded-2xl p-5 text-left max-w-2xl mx-auto">
<p className="text-sm text-gray-700 leading-relaxed">
No encontramos la información temporal del checkout. Si ya
completaste el pago, revisa la sección{" "}
<span className="font-semibold text-[#111827]">Mis pedidos</span>{" "}
o vuelve a la tienda para comprobar tu compra.
</p>
</div>
)}

{(paymentId || paypalToken || merchantOrderId || provider) && (
<div className="mt-8 bg-[#fcfbf8] border border-black/5 rounded-2xl p-5 text-left max-w-xl mx-auto">
<p className="text-xs uppercase tracking-[0.2em] text-gray-500">
Referencias del pago
</p>

<p className="mt-3 text-sm text-[#111827]">
<span className="font-semibold">Proveedor:</span>{" "}
{provider.toUpperCase()}
</p>

{paymentId && (
<p className="mt-2 text-sm text-[#111827]">
<span className="font-semibold">Payment ID:</span> {paymentId}
</p>
)}

{paypalToken && (
<p className="mt-2 text-sm text-[#111827]">
<span className="font-semibold">PayPal Token:</span>{" "}
{paypalToken}
</p>
)}

{merchantOrderId && (
<p className="mt-2 text-sm text-[#111827]">
<span className="font-semibold">Merchant Order ID:</span>{" "}
{merchantOrderId}
</p>
)}

{(verifiedStatus || status) && (
<p className="mt-2 text-sm text-[#111827]">
<span className="font-semibold">Estado:</span>{" "}
{verifiedStatus || status}
</p>
)}
</div>
)}

{!isChecking && effectiveResult === "success" && orderCreated && (
<p className="mt-6 text-sm text-green-700 font-medium">
Tu pedido ya fue guardado correctamente en MySQL.
</p>
)}

{!isChecking && (
<div className="grid sm:grid-cols-2 gap-4 mt-10">
<Link
to={effectiveResult === "failure" ? "/checkout" : "/mis-pedidos"}
className="bg-[#111827] text-white px-6 py-4 rounded-2xl font-bold hover:bg-[#1f2937] transition"
>
{effectiveResult === "failure"
? "Volver al checkout"
: "Ver mis pedidos"}
</Link>

<Link
to="/"
className="bg-[#efeae1] text-[#111827] px-6 py-4 rounded-2xl font-bold hover:bg-[#e8e0d4] transition"
>
Ir al inicio
</Link>
</div>
)}
</div>
</div>
);
}

export default PaymentResult;