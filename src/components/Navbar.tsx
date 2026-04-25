import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../auth/AuthContext";
import { useEffect, useRef, useState } from "react";

function Navbar() {
  const { cartItems } = useCart();
  const { user, isLoggedIn, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const linkClass = (path: string) =>
    `relative text-sm sm:text-base font-medium tracking-wide transition ${
      location.pathname === path
        ? "text-[#111827]"
        : "text-gray-500 hover:text-[#111827]"
    }`;

  const handleLogout = () => {
    logout();
    navigate("/");
    setMenuOpen(false);
  };

  const getInitial = () => {
    if (!user?.name) return "U";
    return user.name.trim().charAt(0).toUpperCase();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-black/5">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-[80px] flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#111827] text-white flex items-center justify-center font-bold">
              U
            </div>

            <div>
              <p className="text-lg font-extrabold tracking-tight text-[#111827]">
                UrbanStyle
              </p>
              <p className="text-[10px] text-gray-400 tracking-[0.3em] uppercase">
                premium wear
              </p>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className={linkClass("/")}>
              Inicio
            </Link>

            <Link to="/productos" className={linkClass("/productos")}>
              Productos
            </Link>
          </div>

          <div className="flex items-center gap-5">
            {!isAdmin && (
              <Link to="/carrito" className="relative">
                <span className="text-sm sm:text-base font-medium text-gray-700 hover:text-black transition">
                  Carrito
                </span>

                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-4 min-w-[20px] h-[20px] px-1 rounded-full bg-[#7a1f2b] text-white text-[11px] font-bold flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>
            )}

            {!isLoggedIn ? (
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl border border-black/10 text-sm font-medium hover:bg-black hover:text-white transition"
              >
                Iniciar sesión
              </Link>
            ) : (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="relative w-11 h-11 rounded-full bg-[#111827] text-white flex items-center justify-center font-bold overflow-hidden border border-black/10 shadow-[0_8px_20px_rgba(0,0,0,0.10)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.16)] hover:scale-[1.03] transition-all duration-200"
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-bold tracking-wide">
                      {getInitial()}
                    </span>
                  )}
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-black/5 overflow-hidden">
                    <div className="px-4 py-3 border-b border-black/5 bg-gradient-to-b from-[#fcfbf8] to-white">
                      <p className="text-sm font-semibold text-[#111827]">
                        {user?.name}
                      </p>
                      <p className="text-xs text-gray-500 break-all">
                        {user?.email}
                      </p>
                    </div>

                    <div className="flex flex-col">
                      {!isAdmin && (
                        <>
                          <Link
                            to="/mi-cuenta"
                            onClick={() => setMenuOpen(false)}
                            className="block w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition"
                          >
                            Mi cuenta
                          </Link>

                          <Link
                            to="/mis-pedidos"
                            onClick={() => setMenuOpen(false)}
                            className="block w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition"
                          >
                            Mis pedidos
                          </Link>
                        </>
                      )}

                      {isAdmin && (
                        <>
                          <Link
                            to="/admin"
                            onClick={() => setMenuOpen(false)}
                            className="block w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition"
                          >
                            Panel admin
                          </Link>

                          <Link
                            to="/admin-pedidos"
                            onClick={() => setMenuOpen(false)}
                            className="block w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition"
                          >
                            Pedidos
                          </Link>
                        </>
                      )}

                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition"
                      >
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;