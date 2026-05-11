import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Toast from "./components/Toast";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import { CartProvider } from "./context/CartContext";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Success from "./pages/Success";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import AdminRoute from "./components/AdminRoute";
import { AuthProvider } from "./auth/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MyOrders from "./pages/MyOrders";
import AdminOrders from "./pages/AdminOrders";
import Account from "./pages/Account";
import PaymentResult from "./pages/PaymentResult";
import CustomerRoute from "./components/CustomerRoute";
import ScrollToTop from "./components/ScrollToTop";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <ScrollToTop />
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <Toast />

            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/productos" element={<Products />} />
                <Route path="/producto/:id" element={<ProductDetail />} />
                <Route path="/carrito" element={<CustomerRoute><Cart /></CustomerRoute>}/>
                <Route path="/checkout" element={<CustomerRoute><Checkout /></CustomerRoute>}/>

                <Route path="/pedido-exitoso" element={<Success />} />

                <Route path="/payment/success" element={<PaymentResult />} />
                <Route path="/payment/failure" element={<PaymentResult />} />
                <Route path="/payment/pending" element={<PaymentResult />} />

                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Register />} />
                <Route path="/mi-cuenta" element={<Account />} />
                <Route path="/mis-pedidos" element={<MyOrders />} />

                <Route path="/login-admin" element={<AdminLogin />} />
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <Admin />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin-pedidos"
                  element={
                    <AdminRoute>
                      <AdminOrders />
                    </AdminRoute>
                  }
                />
              </Routes>
            </main>

            <Footer />
          </div>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
