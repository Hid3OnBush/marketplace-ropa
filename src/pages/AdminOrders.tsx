import { useEffect, useState } from "react";
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

function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadOrders = async () => {
    try {
      setIsLoading(true);

      const response = await fetch(`${API_URL}/orders`);
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
        })),
      }));

      setOrders(mappedOrders);
    } catch (error) {
      console.error("Error cargando pedidos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleUpdateOrder = async (
    orderId: number,
    data: Partial<Order>
  ) => {
    try {
      const currentOrder = orders.find((order) => order.id === orderId);

      await fetch(`${API_URL}/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: data.status || currentOrder?.status,
          trackingNumber:
            data.trackingNumber !== undefined
              ? data.trackingNumber
              : currentOrder?.trackingNumber,
          carrier:
            data.carrier !== undefined ? data.carrier : currentOrder?.carrier,
          notes: data.notes !== undefined ? data.notes : currentOrder?.notes,
          estimatedDelivery:
            data.estimatedDelivery !== undefined
              ? data.estimatedDelivery
              : currentOrder?.estimatedDelivery,
        }),
      });

      await loadOrders();
    } catch (error) {
      console.error("Error actualizando pedido:", error);
      alert("No se pudo actualizar el pedido.");
    }
  };

  const handleStatusChange = (orderId: number, status: Order["status"]) => {
    handleUpdateOrder(orderId, { status });
  };

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

  return (
    <div className="min-h-screen bg-[#f6f4ef] p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-[2rem] border border-black/5 shadow-[0_20px_60px_rgba(0,0,0,0.06)] p-6 sm:p-8">
          <p className="text-[#7a1f2b] font-bold uppercase tracking-[0.25em] text-xs sm:text-sm">
            Administración
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111827] mt-3 tracking-tight">
            Gestión de pedidos
          </h1>
          <p className="text-gray-600 mt-3">
            Cambia el estado de envío, la paquetería y la guía de cada compra.
          </p>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-[2rem] border border-black/5 shadow-sm p-8 text-center text-gray-600">
            Cargando pedidos...
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-[2rem] border border-black/5 shadow-sm p-8 text-center text-gray-600">
            No hay pedidos registrados.
          </div>
        ) : (
          orders.map((order) => {
            const currentStep = getStatusIndex(order.status);
            const progress =
              currentStep >= 0
                ? ((currentStep + 1) / orderSteps.length) * 100
                : 0;

            return (
              <div
                key={order.id}
                className="bg-white rounded-[2rem] border border-black/5 shadow-sm p-6 sm:p-8"
              >
                <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-[#111827]">
                      Pedido #{order.id}
                    </h2>

                    <p className="text-gray-600">
                      <span className="font-semibold">Cliente:</span>{" "}
                      {order.customerName}
                    </p>

                    <p className="text-gray-600">
                      <span className="font-semibold">Correo:</span>{" "}
                      {order.customerEmail}
                    </p>

                    <p className="text-gray-600">
                      <span className="font-semibold">Dirección:</span>{" "}
                      {order.address}, {order.city}
                    </p>

                    <p className="text-gray-600">
                      <span className="font-semibold">Envío:</span>{" "}
                      {order.shippingMethod}
                    </p>

                    <p className="text-gray-500 text-sm">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="min-w-[260px] space-y-3">
                    <span
                      className={`px-4 py-2 rounded-full font-semibold text-sm w-fit inline-block ${getStatusStyles(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>

                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleStatusChange(
                          order.id,
                          e.target.value as Order["status"]
                        )
                      }
                      className="w-full border border-black/10 bg-[#fcfbf8] px-4 py-3 rounded-2xl outline-none focus:ring-2 focus:ring-[#7a1f2b]"
                    >
                      <option>Pendiente</option>
                      <option>Pagado</option>
                      <option>Preparando</option>
                      <option>Enviado</option>
                      <option>En camino</option>
                      <option>Entregado</option>
                    </select>
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

                <div className="mt-8 grid md:grid-cols-2 gap-4">
                  <div className="bg-[#fcfbf8] border border-black/5 rounded-2xl p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                      Paquetería
                    </p>
                    <input
                      type="text"
                      placeholder="DHL, Estafeta, FedEx..."
                      defaultValue={order.carrier || ""}
                      onBlur={(e) =>
                        handleUpdateOrder(order.id, {
                          carrier: e.target.value,
                        })
                      }
                      className="mt-3 w-full border border-black/10 bg-white px-4 py-3 rounded-2xl outline-none focus:ring-2 focus:ring-[#7a1f2b]"
                    />
                  </div>

                  <div className="bg-[#fcfbf8] border border-black/5 rounded-2xl p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                      Número de guía
                    </p>
                    <input
                      type="text"
                      placeholder="Guía de envío"
                      defaultValue={order.trackingNumber || ""}
                      onBlur={(e) =>
                        handleUpdateOrder(order.id, {
                          trackingNumber: e.target.value,
                        })
                      }
                      className="mt-3 w-full border border-black/10 bg-white px-4 py-3 rounded-2xl outline-none focus:ring-2 focus:ring-[#7a1f2b]"
                    />
                  </div>
                </div>

                <div className="mt-4 bg-[#fcfbf8] border border-black/5 rounded-2xl p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                    Notas internas
                  </p>
                  <textarea
                    placeholder="Notas internas del pedido..."
                    defaultValue={order.notes || ""}
                    onBlur={(e) =>
                      handleUpdateOrder(order.id, {
                        notes: e.target.value,
                      })
                    }
                    className="mt-3 w-full min-h-[110px] border border-black/10 bg-white px-4 py-3 rounded-2xl outline-none focus:ring-2 focus:ring-[#7a1f2b]"
                  />
                </div>

                <div className="mt-8 space-y-4">
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
                      </div>

                      <p className="font-bold text-[#111827]">
                        ${item.price * item.quantity}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 border-t border-black/10 pt-4 flex justify-between items-center font-bold text-[#111827]">
                  <span>Total</span>
                  <span className="text-[#7a1f2b]">${order.total}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default AdminOrders;