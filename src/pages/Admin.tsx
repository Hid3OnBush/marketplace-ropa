import { useEffect, useMemo, useState } from "react";
import type { Product } from "../types/product";
import type { Order } from "../orders/orderStorage";
import { Link } from "react-router-dom";
import API_URL from "../api/api";

function Admin() {
  const [productList, setProductList] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    image: "",
    category: "",
    description: "",
  });

  const loadProducts = async () => {
    try {
      setIsLoadingProducts(true);
      const response = await fetch(`${API_URL}/products`);
      const data = await response.json();
      setProductList(data);
    } catch (error) {
      console.error("Error cargando productos:", error);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const loadOrders = async () => {
  try {
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
  }
};

useEffect(() => {
  loadProducts();
  loadOrders();
}, []);

  const productStats = useMemo(() => {
    const totalProducts = productList.length;

    const averagePrice =
      totalProducts > 0
        ? Math.round(
            productList.reduce((acc, product) => acc + Number(product.price), 0) /
              totalProducts
          )
        : 0;

    const mostExpensiveProduct =
      totalProducts > 0
        ? productList.reduce((prev, current) =>
            Number(current.price) > Number(prev.price) ? current : prev
          )
        : null;

    const categoriesCount = new Set(
      productList.map((product) => product.category.trim().toLowerCase())
    ).size;

    return {
      totalProducts,
      averagePrice,
      mostExpensiveProduct,
      categoriesCount,
    };
  }, [productList]);

  const orderStats = useMemo(() => {
    const totalOrders = orders.length;
    const totalSales = orders.reduce((acc, order) => acc + order.total, 0);

    const paidOrders = orders.filter(
      (order) =>
        order.status === "Pagado" ||
        order.status === "Preparando" ||
        order.status === "Enviado" ||
        order.status === "En camino" ||
        order.status === "Entregado"
    ).length;

    const deliveredOrders = orders.filter(
      (order) => order.status === "Entregado"
    ).length;

    return {
      totalOrders,
      totalSales,
      paidOrders,
      deliveredOrders,
    };
  }, [orders]);

  const recentOrders = useMemo(() => {
    return [...orders].slice(0, 5);
  }, [orders]);

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      image: "",
      category: "",
      description: "",
    });
    setEditingId(null);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Selecciona un archivo de imagen válido.");
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        image: reader.result as string,
      }));
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const productData = {
      name: formData.name.trim(),
      price: Number(formData.price),
      image:
        formData.image.trim() ||
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
      category: formData.category.trim(),
      description: formData.description.trim(),
    };

    if (
      !productData.name ||
      !productData.category ||
      !productData.description ||
      productData.price <= 0
    ) {
      alert("Completa correctamente todos los campos.");
      return;
    }

    try {
      if (editingId) {
        await fetch(`${API_URL}/products/${editingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(productData),
        });
      } else {
        await fetch(`${API_URL}/products`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(productData),
        });
      }

      await loadProducts();
      resetForm();
    } catch (error) {
      console.error("Error guardando producto:", error);
      alert("No se pudo guardar el producto.");
    }
  };

  const handleDeleteProduct = async (id: number) => {
    const confirmDelete = window.confirm(
      "¿Seguro que quieres eliminar este producto?"
    );

    if (!confirmDelete) return;

    try {
      await fetch(`${API_URL}/products/${id}`, {
        method: "DELETE",
      });

      await loadProducts();

      if (editingId === id) {
        resetForm();
      }
    } catch (error) {
      console.error("Error eliminando producto:", error);
      alert("No se pudo eliminar el producto.");
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      image: product.image,
      category: product.category,
      description: product.description,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="min-h-screen bg-[#f6f4ef] p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <section className="bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-black/5 shadow-[0_20px_60px_rgba(0,0,0,0.06)] p-6 sm:p-8">
          <p className="text-[#7a1f2b] font-bold uppercase tracking-[0.25em] text-xs sm:text-sm">
            Panel administrativo
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111827] mt-3 tracking-tight">
            Dashboard general
          </h1>
          <p className="text-gray-600 mt-3 text-sm sm:text-base">
            Administra productos desde la base de datos y revisa el rendimiento
            de tu tienda.
          </p>
        </section>

        <section className="grid sm:grid-cols-2 xl:grid-cols-5 gap-6">
          <div className="bg-white rounded-[2rem] border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.05)] p-6">
            <p className="text-sm uppercase tracking-[0.2em] text-gray-500 font-semibold">
              Productos
            </p>
            <h2 className="text-4xl font-extrabold text-[#111827] mt-3">
              {productStats.totalProducts}
            </h2>
            <p className="text-gray-500 mt-2">Total en catálogo</p>
          </div>

          <div className="bg-white rounded-[2rem] border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.05)] p-6">
            <p className="text-sm uppercase tracking-[0.2em] text-gray-500 font-semibold">
              Pedidos
            </p>
            <h2 className="text-4xl font-extrabold text-[#111827] mt-3">
              {orderStats.totalOrders}
            </h2>
            <p className="text-gray-500 mt-2">Total registrados</p>
          </div>

          <div className="bg-white rounded-[2rem] border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.05)] p-6">
            <p className="text-sm uppercase tracking-[0.2em] text-gray-500 font-semibold">
              Ventas totales
            </p>
            <h2 className="text-4xl font-extrabold text-[#7a1f2b] mt-3">
              ${orderStats.totalSales}
            </h2>
            <p className="text-gray-500 mt-2">Ingresos acumulados</p>
          </div>

          <div className="bg-white rounded-[2rem] border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.05)] p-6">
            <p className="text-sm uppercase tracking-[0.2em] text-gray-500 font-semibold">
              Pagados
            </p>
            <h2 className="text-4xl font-extrabold text-blue-700 mt-3">
              {orderStats.paidOrders}
            </h2>
            <p className="text-gray-500 mt-2">Pedidos confirmados</p>
          </div>

          <div className="bg-white rounded-[2rem] border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.05)] p-6">
            <p className="text-sm uppercase tracking-[0.2em] text-gray-500 font-semibold">
              Entregados
            </p>
            <h2 className="text-4xl font-extrabold text-green-700 mt-3">
              {orderStats.deliveredOrders}
            </h2>
            <p className="text-gray-500 mt-2">Pedidos completados</p>
          </div>
        </section>

        <section className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-black/5 shadow-[0_20px_60px_rgba(0,0,0,0.06)] p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-gray-500 font-semibold">
                  Pedidos recientes
                </p>
                <h2 className="text-2xl font-extrabold text-[#111827] mt-2">
                  Últimas compras
                </h2>
              </div>

              <Link
                to="/admin-pedidos"
                className="bg-[#111827] text-white px-5 py-3 rounded-2xl font-semibold hover:bg-[#1f2937] transition"
              >
                Ver pedidos
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className="border border-dashed border-black/10 rounded-[1.5rem] p-10 text-center text-gray-500 bg-[#fcfbf8]">
                No hay pedidos recientes todavía.
              </div>
            ) : (
              <div className="grid gap-4">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="border border-black/8 rounded-[1.5rem] p-4 bg-[#fffdfa] flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                  >
                    <div>
                      <p className="font-bold text-[#111827]">
                        Pedido #{order.id}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {order.customerName} · {order.customerEmail}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex flex-col md:items-end gap-2">
                      <span className="bg-[#efeae1] text-[#7a1f2b] px-3 py-1 rounded-full text-sm font-bold w-fit">
                        {order.status}
                      </span>
                      <p className="font-bold text-[#111827]">${order.total}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-black/5 shadow-[0_20px_60px_rgba(0,0,0,0.06)] p-6 sm:p-8">
            <p className="text-sm uppercase tracking-[0.2em] text-gray-500 font-semibold">
              Resumen de catálogo
            </p>
            <h2 className="text-2xl font-extrabold text-[#111827] mt-2">
              Productos y precios
            </h2>

            <div className="mt-6 space-y-4">
              <div className="bg-[#fcfbf8] border border-black/5 rounded-2xl p-4">
                <p className="text-sm text-gray-500">Precio promedio</p>
                <p className="text-2xl font-extrabold text-[#111827] mt-1">
                  ${productStats.averagePrice}
                </p>
              </div>

              <div className="bg-[#fcfbf8] border border-black/5 rounded-2xl p-4">
                <p className="text-sm text-gray-500">Categorías activas</p>
                <p className="text-2xl font-extrabold text-[#111827] mt-1">
                  {productStats.categoriesCount}
                </p>
              </div>

              <div className="bg-[#fcfbf8] border border-black/5 rounded-2xl p-4">
                <p className="text-sm text-gray-500">Más caro</p>
                <p className="text-lg font-extrabold text-[#111827] mt-1 leading-tight">
                  {productStats.mostExpensiveProduct
                    ? productStats.mostExpensiveProduct.name
                    : "Sin datos"}
                </p>
                <p className="text-[#7a1f2b] mt-2 font-semibold">
                  {productStats.mostExpensiveProduct
                    ? `$${productStats.mostExpensiveProduct.price}`
                    : ""}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3">
              <Link
                to="/admin-pedidos"
                className="w-full text-center bg-[#111827] text-white px-5 py-3 rounded-2xl font-semibold hover:bg-[#1f2937] transition"
              >
                Gestionar pedidos
              </Link>

              <Link
                to="/productos"
                className="w-full text-center bg-[#efeae1] text-[#111827] px-5 py-3 rounded-2xl font-semibold hover:bg-[#e8e0d4] transition"
              >
                Ver catálogo
              </Link>
            </div>
          </div>
        </section>

        <section className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-black/5 shadow-[0_20px_60px_rgba(0,0,0,0.06)] p-6 sm:p-8 h-fit">
            <div className="flex items-center justify-between mb-6 gap-4">
              <h2 className="text-2xl font-extrabold text-[#111827]">
                {editingId ? "Editar producto" : "Agregar producto"}
              </h2>

              {editingId && (
                <button
                  onClick={resetForm}
                  className="text-sm font-semibold text-gray-500 hover:text-[#7a1f2b] transition"
                >
                  Cancelar
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Nombre del producto"
                value={formData.name}
                onChange={handleChange}
                className="w-full border border-black/10 bg-[#fcfbf8] p-4 rounded-2xl outline-none focus:ring-2 focus:ring-[#7a1f2b]"
                required
              />

              <input
                type="number"
                name="price"
                placeholder="Precio"
                value={formData.price}
                onChange={handleChange}
                className="w-full border border-black/10 bg-[#fcfbf8] p-4 rounded-2xl outline-none focus:ring-2 focus:ring-[#7a1f2b]"
                required
                min="1"
              />

              <input
                type="text"
                name="image"
                placeholder="URL de imagen (opcional)"
                value={formData.image.startsWith("data:") ? "" : formData.image}
                onChange={handleChange}
                className="w-full border border-black/10 bg-[#fcfbf8] p-4 rounded-2xl outline-none focus:ring-2 focus:ring-[#7a1f2b]"
              />

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  O subir imagen desde tu PC
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full border border-black/10 bg-[#fcfbf8] p-3 rounded-2xl outline-none"
                />
              </div>

              {formData.image && (
                <img
                  src={formData.image}
                  alt="Vista previa"
                  className="w-full h-44 object-cover rounded-2xl border border-black/10 mt-2"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              )}

              <input
                type="text"
                name="category"
                placeholder="Categoría"
                value={formData.category}
                onChange={handleChange}
                className="w-full border border-black/10 bg-[#fcfbf8] p-4 rounded-2xl outline-none focus:ring-2 focus:ring-[#7a1f2b]"
                required
              />

              <textarea
                name="description"
                placeholder="Descripción"
                value={formData.description}
                onChange={handleChange}
                className="w-full border border-black/10 bg-[#fcfbf8] p-4 rounded-2xl outline-none focus:ring-2 focus:ring-[#7a1f2b] min-h-[120px]"
                required
              />

              <button
                type="submit"
                className="w-full bg-[#111827] text-white py-4 rounded-2xl font-bold hover:bg-[#1f2937] transition shadow-sm"
              >
                {editingId ? "Actualizar producto" : "Guardar producto"}
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-black/5 shadow-[0_20px_60px_rgba(0,0,0,0.06)] p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-extrabold text-[#111827]">
                Lista de productos
              </h2>
              <span className="bg-[#efeae1] text-[#7a1f2b] px-4 py-2 rounded-full text-sm font-bold">
                {productList.length} productos
              </span>
            </div>

            {isLoadingProducts ? (
              <div className="border border-dashed border-black/10 rounded-[1.5rem] p-10 text-center text-gray-500 bg-[#fcfbf8]">
                Cargando productos...
              </div>
            ) : productList.length === 0 ? (
              <div className="border border-dashed border-black/10 rounded-[1.5rem] p-10 text-center text-gray-500 bg-[#fcfbf8]">
                No hay productos registrados todavía.
              </div>
            ) : (
              <div className="grid gap-5">
                {productList.map((product) => (
                  <div
                    key={product.id}
                    className="border border-black/8 rounded-[1.75rem] p-4 flex flex-col md:flex-row gap-4 items-center bg-[#fffdfa]"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full max-w-[220px] md:w-28 h-28 object-cover rounded-2xl"
                    />

                    <div className="flex-1 text-center md:text-left">
                      <p className="text-sm font-bold text-[#7a1f2b] uppercase tracking-wide">
                        {product.category}
                      </p>
                      <h3 className="text-xl font-bold text-[#111827] mt-1">
                        {product.name}
                      </h3>
                      <p className="text-gray-600 mt-2 text-sm leading-relaxed">
                        {product.description}
                      </p>
                    </div>

                    <div className="text-center md:text-right">
                      <p className="text-2xl font-extrabold text-[#111827]">
                        ${product.price}
                      </p>

                      <div className="mt-4 flex flex-col gap-2">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="px-3 py-2 rounded-xl bg-[#efeae1] text-[#7a1f2b] font-semibold hover:bg-[#e8e0d4] transition"
                        >
                          Editar
                        </button>

                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="px-3 py-2 rounded-xl bg-red-50 text-red-600 font-semibold hover:bg-red-100 transition"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Admin;