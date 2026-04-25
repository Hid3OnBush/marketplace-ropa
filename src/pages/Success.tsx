import { Link } from "react-router-dom";

function Success() {
  return (
    <div className="min-h-screen bg-[#f6f4ef] flex items-center justify-center p-6">
      <div className="bg-white rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.06)] border border-black/5 p-10 max-w-2xl w-full text-center">
        <div className="w-24 h-24 mx-auto rounded-full bg-green-100 flex items-center justify-center text-5xl shadow-inner">
          ✅
        </div>

        <p className="text-[#7a1f2b] font-bold uppercase tracking-[0.25em] text-sm mt-8">
          Pago completado
        </p>

        <h1 className="text-4xl md:text-5xl font-extrabold text-[#111827] mt-4">
          ¡Pedido realizado con éxito!
        </h1>

        <p className="text-gray-600 mt-5 text-lg leading-relaxed max-w-xl mx-auto">
          Gracias por tu compra. Tu pedido fue registrado correctamente y está
          listo para ser procesado.
        </p>

        <div className="grid sm:grid-cols-2 gap-4 mt-10">
          <Link
            to="/productos"
            className="bg-[#111827] text-white px-6 py-4 rounded-2xl font-bold hover:bg-[#1f2937] transition"
          >
            Seguir comprando
          </Link>

          <Link
            to="/"
            className="bg-[#efeae1] text-[#111827] px-6 py-4 rounded-2xl font-bold hover:bg-[#e8e0d4] transition"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Success;