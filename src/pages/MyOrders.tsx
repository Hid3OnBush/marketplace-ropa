import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import type { Order } from "../orders/orderStorage";
import API_URL from "../api/api";

const orderSteps = [
  "Pendiente",
  "Pagado",
  "Preparando",
  "Enviado",
  "En camino",
  "Entregado",
] as const;

function MyOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadMyOrders = async () => {
      if (!user) return;

      try {
        setIsLoading(true);

        const response = await fetch(`${API_URL}/orders/user/${user.email}`);
        const data = await response.json();

        const mappedOrders = data.map((order: any) => ({
          id: order.id,
          customerName: order.customer_name,
          customerEmail: order.customer_email,
          address: order.address,
          city: order.city,
          shippingAddress: order.shipping_address,
          shippingMethod: order.shipping_method,
          paymentMethod: order.payment_method,
          trackingNumber: order.tracking_number,
          carrier: order.carrier,
          notes: order.notes,
          estimatedDelivery: order.estimated_delivery,
          status: order.status,
          total: Number(order.total),
          createdAt: order.created_at,
          items: order.items.map((item: any) => ({
            id: item.product_id || item.id,
            name: item.name,
            price: Number(item.price),
            image: item.image,
            quantity: item.quantity,
            selectedSize: item.selected_size || item.selectedSize,
          })),
        }));

        setOrders(mappedOrders);
      } catch (error) {
        console.error("Error cargando mis pedidos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMyOrders();
  }, [user]);

  const myOrders = orders;

  const stats = useMemo(() => {
    const totalOrders = myOrders.length;
    const totalSpent = myOrders.reduce((acc, order) => acc + order.total, 0);
    const activeOrders = myOrders.filter(
      (order) => order.status !== "Entregado"
    ).length;
    const deliveredOrders = myOrders.filter(
      (order) => order.status === "Entregado"
    ).length;

    return {
      totalOrders,
      totalSpent,
      activeOrders,
      deliveredOrders,
    };
  }, [myOrders]);

  const getStatusIndex = (status: string) => {
    return orderSteps.indexOf(status as (typeof orderSteps)[number]);
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "Pendiente":
        return "bg-gray-100 text-gray-700";
      case "Pagado":
        return "bg-blue-100 text-blue-700";
      case "Preparando":
        return "bg-yellow-100 text-yellow-700";
      case "Enviado":
        return "bg-indigo-100 text-indigo-700";
      case "En camino":
        return "bg-orange-100 text-orange-700";
      case "Entregado":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f6f4ef] p-4 sm:p-6">
        <div className="max-w-5xl mx-auto bg-white rounded-[2rem] border border-black/5 shadow-[0_20px_60px_rgba(0,0,0,0.06)] p-8">
          <h1 className="text-3xl font-bold text-[#111827]">Mis pedidos</h1>
          <p className="mt-4 text-gray-600">
            Debes iniciar sesión para ver tus pedidos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f4ef] p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white rounded-[2rem] border border-black/5 shadow-[0_20px_60px_rgba(0,0,0,0.06)] p-6 sm:p-8">
          <p className="text-[#7a1f2b] font-bold uppercase tracking-[0.25em] text-xs sm:text-sm">
            Cuenta
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111827] mt-3 tracking-tight">
            Historial de pedidos
          </h1>
          <p className="text-gray-600 mt-3">
            Consulta tus compras, seguimiento, envíos y detalles de cada pedido.
          </p>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-[2rem] border border-black/5 shadow-sm p-8 text-center text-gray-600">
            Cargando pedidos...
          </div>
        ) : myOrders.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-[2rem] border border-black/5 shadow-sm p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                Pedidos
              </p>
              <p className="text-3xl font-extrabold text-[#111827] mt-2">
                {stats.totalOrders}
              </p>
            </div>

            <div className="bg-white rounded-[2rem] border border-black/5 shadow-sm p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                Total gastado
              </p>
              <p className="text-3xl font-extrabold text-[#7a1f2b] mt-2">
                ${stats.totalSpent}
              </p>
            </div>

            <div className="bg-white rounded-[2rem] border border-black/5 shadow-sm p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                En proceso
              </p>
              <p className="text-3xl font-extrabold text-blue-700 mt-2">
                {stats.activeOrders}
              </p>
            </div>

            <div className="bg-white rounded-[2rem] border border-black/5 shadow-sm p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                Entregados
              </p>
              <p className="text-3xl font-extrabold text-green-700 mt-2">
                {stats.deliveredOrders}
              </p>
            </div>
          </div>
        )}

        {!isLoading && myOrders.length === 0 ? (
          <div className="bg-white rounded-[2rem] border border-black/5 shadow-sm p-8 text-center text-gray-600">
            Aún no tienes pedidos registrados.
          </div>
        ) : (
          !isLoading && (
            <div className="space-y-6">
              {myOrders.map((order) => {
                const currentStep = getStatusIndex(order.status);
                const progress =
                  currentStep >= 0
                    ? ((currentStep + 1) / orderSteps.length) * 100
                    : 0;

                const isExpanded = expandedOrderId === order.id;

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-[2rem] border border-black/5 shadow-sm p-6 sm:p-8"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                          Pedido
                        </p>
                        <h2 className="text-2xl font-bold text-[#111827] mt-1">
                          #{order.id}
                        </h2>
                        <p className="text-gray-500 text-sm mt-1">
                          {new Date(order.createdAt).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:items-end">
                        <span
                          className={`px-4 py-2 rounded-full font-semibold text-sm w-fit ${getStatusStyles(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>

                        <p className="text-2xl font-extrabold text-[#7a1f2b]">
                          ${order.total}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 grid md:grid-cols-3 gap-4">
                      <div className="bg-[#fcfbf8] rounded-2xl border border-black/5 p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                          Seguimiento
                        </p>
                        <p className="text-base font-bold text-[#111827] mt-2 break-all">
                          {order.trackingNumber}
                        </p>
                      </div>

                      <div className="bg-[#fcfbf8] rounded-2xl border border-black/5 p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                          Entrega estimada
                        </p>
                        <p className="text-base font-bold text-[#111827] mt-2">
                          {order.estimatedDelivery
                            ? new Date(order.estimatedDelivery).toLocaleDateString()
                            : "Sin fecha"}
                        </p>
                      </div>

                      <div className="bg-[#fcfbf8] rounded-2xl border border-black/5 p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                          Método de pago
                        </p>
                        <p className="text-base font-bold text-[#111827] mt-2">
                          {order.paymentMethod}
                        </p>
                      </div>
                    </div>

                    <div className="mt-8">
                      <div className="flex items-center justify-between text-[11px] sm:text-xs text-gray-500 mb-3 overflow-x-auto gap-3">
                        {orderSteps.map((step, index) => (
                          <span
                            key={step}
                            className={`whitespace-nowrap ${
                              index <= currentStep
                                ? "text-[#111827] font-semibold"
                                : "text-gray-400"
                            }`}
                          >
                            {step}
                          </span>
                        ))}
                      </div>

                      <div className="w-full h-3 bg-[#efeae1] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#7a1f2b] transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-6 bg-[#fcfbf8] rounded-2xl border border-black/5 p-4 space-y-2">
                      <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                        Envío
                      </p>

                      <p className="text-sm text-[#111827]">
                        <span className="font-semibold">Dirección:</span>{" "}
                        {order.shippingAddress}
                      </p>

                      <p className="text-sm text-[#111827]">
                        <span className="font-semibold">Método:</span>{" "}
                        {order.shippingMethod}
                      </p>

                      {order.carrier && (
                        <p className="text-sm text-[#111827]">
                          <span className="font-semibold">Paquetería:</span>{" "}
                          {order.carrier}
                        </p>
                      )}

                      {order.notes && (
                        <p className="text-sm text-[#111827]">
                          <span className="font-semibold">Notas:</span>{" "}
                          {order.notes}
                        </p>
                      )}
                    </div>

                    <div className="mt-6 flex items-center justify-between gap-4 border-t border-black/10 pt-5">
                      <p className="font-bold text-[#111827]">
                        {order.items.length} producto
                        {order.items.length !== 1 ? "s" : ""}
                      </p>

                      <button
                        onClick={() =>
                          setExpandedOrderId(isExpanded ? null : order.id)
                        }
                        className="bg-[#efeae1] text-[#111827] px-5 py-3 rounded-2xl font-semibold hover:bg-[#e8e0d4] transition"
                      >
                        {isExpanded ? "Ocultar detalle" : "Ver detalle"}
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="mt-6 space-y-4">
                        {order.items.map((item) => (
                          <div
                            key={`${order.id}-${item.id}`}
                            className="flex items-center gap-4 border border-black/5 rounded-2xl p-4 bg-[#fcfbf8]"
                          >
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-16 h-16 rounded-2xl object-cover"
                            />

                            <div className="flex-1">
                              <p className="font-semibold text-[#111827]">
                                {item.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                Cantidad: {item.quantity}
                              </p>
                              {item.selectedSize && (
                                <p className="text-sm text-gray-500">
                                  Talla: {item.selectedSize}
                                </p>
                              )}
                            </div>

                            <p className="font-bold text-[#111827]">
                              ${item.price * item.quantity}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default MyOrders;
