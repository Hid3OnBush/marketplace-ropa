import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-white border-t border-black/5 mt-14">
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link to="/" className="text-2xl font-extrabold text-[#111827]">
              UrbanStyle
            </Link>
            <p className="mt-4 text-gray-600 leading-relaxed">
              Marketplace de moda con identidad contemporánea, experiencia
              premium y diseño elegante inspirado en marcas reales.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-[#111827]">Tienda</h3>
            <ul className="mt-4 space-y-3 text-gray-600">
              <li>
                <Link to="/" className="hover:text-[#7a1f2b] transition">
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/productos" className="hover:text-[#7a1f2b] transition">
                  Productos
                </Link>
              </li>
              <li>
                <Link to="/carrito" className="hover:text-[#7a1f2b] transition">
                  Carrito
                </Link>
              </li>
              <li>
                <Link to="/checkout" className="hover:text-[#7a1f2b] transition">
                  Checkout
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold text-[#111827]">Soporte</h3>
            <ul className="mt-4 space-y-3 text-gray-600">
              <li>Preguntas frecuentes</li>
              <li>Envíos y devoluciones</li>
              <li>Métodos de pago</li>
              <li>Atención al cliente</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold text-[#111827]">Contacto</h3>
            <div className="mt-4 space-y-3 text-gray-600">
              <p>📍 Puebla, México</p>
              <p>📞 +52 222 123 4567</p>
              <p>✉️ contacto@urbanstyle.com</p>
            </div>
          </div>
        </div>

        <div className="border-t border-black/5 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>© 2026 UrbanStyle. Todos los derechos reservados.</p>
          <p>Diseñado con React + TypeScript + Tailwind CSS</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;