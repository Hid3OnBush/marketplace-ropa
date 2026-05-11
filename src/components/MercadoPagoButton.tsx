import { useEffect, useState } from "react";
import { initMercadoPago, Wallet } from "@mercadopago/sdk-react";
import { saveCheckoutSnapshot } from "../utils/checkoutStorage";

const MP_PUBLIC_KEY = "APP_USR-5e8d641f-fbbb-4c1f-ac73-709138c0f06c";
const MP_BACKEND_URL = "https://mercadopago-backend-production.up.railway.app";

interface MercadoPagoButtonProps {
items: {
id: number;
name: string;
price: number;
image: string;
quantity: number;
selectedSize?: string;
}[];
disabled?: boolean;
disabledMessage?: string;
checkoutData: {
customerName: string;
customerEmail: string;
address: string;
city: string;
shippingMethod: string;
shippingCost: number;
total: number;
};
}

function MercadoPagoButton({
items,
checkoutData,
disabled = false,
disabledMessage = "Completa tus datos",
}: MercadoPagoButtonProps) {
const [preferenceId, setPreferenceId] = useState("");

useEffect(() => {
initMercadoPago(MP_PUBLIC_KEY, {
locale: "es-MX",
});
}, []);

const createPreference = async () => {
try {
const externalReference = `ORDER-${Date.now()}`;
const shippingItem =
checkoutData.shippingCost > 0
? [
{
id: 999999,
name:
checkoutData.shippingMethod === "express"
? "Envio express"
: "Envio estandar",
price: checkoutData.shippingCost,
image: "",
quantity: 1,
},
]
: [];
const paymentItems = [...items, ...shippingItem];

saveCheckoutSnapshot({
customerName: checkoutData.customerName,
customerEmail: checkoutData.customerEmail,
address: checkoutData.address,
city: checkoutData.city,
shippingMethod: checkoutData.shippingMethod,
shippingCost: checkoutData.shippingCost,
total: checkoutData.total,
items,
createdAt: new Date().toISOString(),
});

const response = await fetch(`${MP_BACKEND_URL}/create_preference`, {
method: "POST",
headers: {
"Content-Type": "application/json",
},
body: JSON.stringify({
items: paymentItems,
customer: {
name: checkoutData.customerName,
email: checkoutData.customerEmail,
},
externalReference,
}),
});

const data = await response.json();

console.log("Respuesta Mercado Pago:", data);

if (!response.ok) {
alert(data.details || data.error || "Error creando preferencia");
return;
}

if (data.id) {
setPreferenceId(data.id);
} else {
alert("No se pudo generar la preferencia de pago.");
}
} catch (error) {
console.error("Error al conectar con Mercado Pago:", error);
alert(String(error));
}
};

return (
<div className="space-y-4">
{!preferenceId ? (
<button
onClick={createPreference}
disabled={disabled}
className="min-h-12 w-full bg-[#111111] px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-45 sm:text-sm sm:tracking-[0.18em]"
>
{disabled ? disabledMessage : "Pagar con Mercado Pago"}
</button>
) : (
<div className="border border-black/10 bg-white p-4">
<Wallet initialization={{ preferenceId }} />
</div>
)}
</div>
);
}

export default MercadoPagoButton;
