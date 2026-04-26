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
}[];
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

function MercadoPagoButton({ items, checkoutData }: MercadoPagoButtonProps) {
const [preferenceId, setPreferenceId] = useState("");

useEffect(() => {
initMercadoPago(MP_PUBLIC_KEY, {
locale: "es-MX",
});
}, []);

const createPreference = async () => {
try {
const externalReference = `ORDER-${Date.now()}`;

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
items,
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
className="w-full bg-[#009ee3] text-white py-4 rounded-2xl font-bold hover:opacity-90 transition"
>
Pagar con Mercado Pago
</button>
) : (
<div className="bg-white rounded-2xl border border-black/5 p-4">
<Wallet initialization={{ preferenceId }} />
</div>
)}
</div>
);
}