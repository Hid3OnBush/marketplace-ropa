export interface OrderItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  selectedSize?: string;
}

export interface Order {
  id: number;
  customerName: string;
  customerEmail: string;

  address: string;
  city: string;
  shippingAddress: string;
  shippingMethod: string;

  paymentMethod: string;

  trackingNumber: string;
  carrier?: string;
  notes?: string;

  estimatedDelivery: string;

  status:
    | "Pendiente"
    | "Pagado"
    | "Preparando"
    | "Enviado"
    | "En camino"
    | "Entregado";

  total: number;
  createdAt: string;

  items: OrderItem[];
}

const ORDERS_KEY = "store_orders";

export function getOrders(): Order[] {
  const saved = localStorage.getItem(ORDERS_KEY);
  return saved ? JSON.parse(saved) : [];
}

export function saveOrders(orders: Order[]) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

export function createOrder(order: Order) {
  const orders = getOrders();
  orders.unshift(order);
  saveOrders(orders);
}

export function updateOrderStatus(orderId: number, status: Order["status"]) {
  const orders = getOrders().map((order) =>
    order.id === orderId ? { ...order, status } : order
  );
  saveOrders(orders);
}

export function updateOrder(orderId: number, data: Partial<Order>) {
  const orders = getOrders().map((order) =>
    order.id === orderId ? { ...order, ...data } : order
  );

  saveOrders(orders);
}
