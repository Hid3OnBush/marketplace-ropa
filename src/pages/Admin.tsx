import { useEffect, useMemo, useRef, useState } from "react";
import type { Product } from "../types/product";
import type { Order } from "../orders/orderStorage";
import { Link } from "react-router-dom";
import API_URL from "../api/api";
import { products as demoProducts } from "../data/products";
import {
  applyProductOverrides,
  removeProductOverride,
  saveProductNameOverride,
  saveProductOverride,
} from "../utils/productStorage";
import {
  DEFAULT_PRODUCT_SIZES,
  DEFAULT_PRODUCT_STOCK,
  getDiscountedPrice,
  isProductOnSale,
  normalizeProduct,
} from "../utils/productHelpers";

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL", "28", "30", "32", "34", "36"];

function Admin() {
  const [productList, setProductList] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const productFormRef = useRef<HTMLDivElement | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    image: "",
    category: "",
    gender: "Unisex",
    description: "",
    sizes: DEFAULT_PRODUCT_SIZES,
    stock: DEFAULT_PRODUCT_STOCK.toString(),
    isOnSale: false,
    discountPercentage: "",
  });

  const loadProducts = async () => {
    try {
      setIsLoadingProducts(true);
      const response = await fetch(`${API_URL}/products`);
      const data = await response.json();
      setProductList(
        applyProductOverrides(
        Array.isArray(data) && data.length > 0
          ? data.map(normalizeProduct)
          : demoProducts.map(normalizeProduct)
        )
      );
    } catch (error) {
      console.error("Error cargando productos:", error);
      setProductList(applyProductOverrides(demoProducts.map(normalizeProduct)));
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
        selectedSize: item.selected_size || item.selectedSize,
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
      gender: "Unisex",
      description: "",
      sizes: DEFAULT_PRODUCT_SIZES,
      stock: DEFAULT_PRODUCT_STOCK.toString(),
      isOnSale: false,
      discountPercentage: "",
    });
    setEditingId(null);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = e.target.checked;

    setFormData((prev) => ({
      ...prev,
      isOnSale: enabled,
      discountPercentage: enabled ? prev.discountPercentage || "10" : "",
    }));
  };

  const handleSizeToggle = (size: string) => {
    setFormData((prev) => {
      const sizeIsSelected = prev.sizes.includes(size);
      const nextSizes = sizeIsSelected
        ? prev.sizes.filter((item) => item !== size)
        : [...prev.sizes, size];

      return {
        ...prev,
        sizes: nextSizes,
      };
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
    const savedEditingId = editingId;
    const stock = Number(formData.stock);
    const discountPercentage = formData.isOnSale
      ? Number(formData.discountPercentage)
      : 0;

    const productData = {
      name: formData.name.trim(),
      price: Number(formData.price),
      image:
        formData.image.trim() ||
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
      category: formData.category.trim(),
      gender: formData.gender,
      description: formData.description.trim(),
      sizes: formData.sizes.length > 0 ? formData.sizes : DEFAULT_PRODUCT_SIZES,
      stock,
      discountPercentage,
      discount_percentage: discountPercentage,
    };

    if (
      !productData.name ||
      !productData.category ||
      !productData.gender ||
      !productData.description ||
      productData.price <= 0 ||
      productData.stock < 0 ||
      (formData.isOnSale && discountPercentage <= 0) ||
      discountPercentage < 0 ||
      discountPercentage > 90
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

        saveProductOverride(editingId, {
          gender: productData.gender,
          sizes: productData.sizes,
          stock: productData.stock,
          discountPercentage: productData.discountPercentage,
        });
        saveProductNameOverride(productData.name, {
          gender: productData.gender,
          sizes: productData.sizes,
          stock: productData.stock,
          discountPercentage: productData.discountPercentage,
        });
      } else {
        const response = await fetch(`${API_URL}/products`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(productData),
        });

        const savedProduct = await response.json().catch(() => null);
        const savedProductId = Number(savedProduct?.id);

        if (savedProductId) {
          saveProductOverride(savedProductId, {
            gender: productData.gender,
            sizes: productData.sizes,
            stock: productData.stock,
            discountPercentage: productData.discountPercentage,
          });
        }

        saveProductNameOverride(productData.name, {
          gender: productData.gender,
          sizes: productData.sizes,
          stock: productData.stock,
          discountPercentage: productData.discountPercentage,
        });
      }

      await loadProducts();
      resetForm();

      if (savedEditingId) {
        setTimeout(() => {
          document
            .getElementById(`admin-product-${savedEditingId}`)
            ?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 100);
      }
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
      removeProductOverride(id);

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
      gender: product.gender,
      description: product.description,
      sizes: product.sizes,
      stock: product.stock.toString(),
      isOnSale: (product.discountPercentage ?? 0) > 0,
      discountPercentage: product.discountPercentage
        ? product.discountPercentage.toString()
        : "",
    });

    setTimeout(() => {
      productFormRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 0);
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
          <div
            ref={productFormRef}
            className="lg:col-span-1 bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-black/5 shadow-[0_20px_60px_rgba(0,0,0,0.06)] p-6 sm:p-8 h-fit"
          >
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

              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full border border-black/10 bg-[#fcfbf8] p-4 rounded-2xl outline-none focus:ring-2 focus:ring-[#7a1f2b]"
              >
                <option value="Unisex">Unisex</option>
                <option value="Mujer">Mujer</option>
                <option value="Hombre">Hombre</option>
              </select>

              <textarea
                name="description"
                placeholder="Descripción"
                value={formData.description}
                onChange={handleChange}
                className="w-full border border-black/10 bg-[#fcfbf8] p-4 rounded-2xl outline-none focus:ring-2 focus:ring-[#7a1f2b] min-h-[120px]"
                required
              />

              <div className="bg-[#fcfbf8] border border-black/5 rounded-2xl p-4">
                <p className="text-sm font-bold text-[#111827]">
                  Tallas habilitadas
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {SIZE_OPTIONS.map((size) => {
                    const isSelected = formData.sizes.includes(size);

                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => handleSizeToggle(size)}
                        className={`min-w-12 px-3 py-2 rounded-xl border font-bold transition ${
                          isSelected
                            ? "border-[#7a1f2b] bg-[#fff7f8] text-[#7a1f2b]"
                            : "border-black/10 bg-white text-[#111827] hover:bg-[#efeae1]"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Activa solo las tallas disponibles para esta prenda.
                </p>
              </div>

              <input
                type="number"
                name="stock"
                placeholder="Stock disponible"
                value={formData.stock}
                onChange={handleChange}
                className="w-full border border-black/10 bg-[#fcfbf8] p-4 rounded-2xl outline-none focus:ring-2 focus:ring-[#7a1f2b]"
                required
                min="0"
              />

              <div className="bg-[#fcfbf8] border border-black/5 rounded-2xl p-4 space-y-4">
                <label className="flex items-center justify-between gap-4">
                  <span>
                    <span className="block text-sm font-bold text-[#111827]">
                      Habilitar oferta
                    </span>
                    <span className="block text-xs text-gray-500 mt-1">
                      Muestra esta prenda en rebajas y aplica descuento.
                    </span>
                  </span>
                  <input
                    type="checkbox"
                    checked={formData.isOnSale}
                    onChange={handleSaleChange}
                    className="h-5 w-5 accent-[#7a1f2b]"
                  />
                </label>

                {formData.isOnSale && (
                  <input
                    type="number"
                    name="discountPercentage"
                    placeholder="Porcentaje de descuento"
                    value={formData.discountPercentage}
                    onChange={handleChange}
                    className="w-full border border-black/10 bg-white p-4 rounded-2xl outline-none focus:ring-2 focus:ring-[#7a1f2b]"
                    min="1"
                    max="90"
                  />
                )}
              </div>

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
                {productList.map((product) => {
                  const productIsOnSale = isProductOnSale(product);
                  const salePrice = getDiscountedPrice(product);

                  return (
                  <div
                    id={`admin-product-${product.id}`}
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
                      <p className="text-gray-500 mt-2 text-xs">
                        Genero: {product.gender} | Stock: {product.stock} | Tallas:{" "}
                        {product.sizes.join(", ")}
                      </p>
                    </div>

                    <div className="text-center md:text-right">
                      <p className="text-2xl font-extrabold text-[#111827]">
                        ${productIsOnSale ? salePrice : product.price}
                      </p>
                      {productIsOnSale && (
                        <div className="mt-1">
                          <p className="text-sm text-gray-400 line-through">
                            ${product.price}
                          </p>
                          <span className="inline-block mt-2 bg-[#7a1f2b] text-white px-3 py-1 rounded-full text-xs font-bold">
                            Oferta -{product.discountPercentage}%
                          </span>
                        </div>
                      )}

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
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Admin;
