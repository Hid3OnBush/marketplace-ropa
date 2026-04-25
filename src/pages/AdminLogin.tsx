import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginAdmin } from "../utils/auth";

function AdminLogin() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const success = loginAdmin(password);

    if (!success) {
      setError("Contraseña incorrecta");
      return;
    }

    setError("");
    navigate("/admin");
  };

  return (
    <div className="min-h-screen bg-[#f6f4ef] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[2rem] border border-black/5 shadow-[0_20px_60px_rgba(0,0,0,0.06)] p-8">
        <p className="text-[#7a1f2b] font-bold uppercase tracking-[0.25em] text-sm">
          Acceso privado
        </p>

        <h1 className="text-4xl font-extrabold text-[#111827] mt-3 tracking-tight">
          Login Admin
        </h1>

        <p className="text-gray-600 mt-3">
          Ingresa la contraseña para acceder al panel administrativo.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-black/10 bg-[#fcfbf8] p-4 rounded-2xl outline-none focus:ring-2 focus:ring-[#7a1f2b]"
            required
          />

          {error && (
            <p className="text-red-500 text-sm font-medium">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-[#111827] text-white py-4 rounded-2xl font-bold hover:bg-[#1f2937] transition"
          >
            Entrar
          </button>
        </form>

        <div className="mt-6 text-sm text-gray-500">
          Contraseña demo: <span className="font-semibold">admin123</span>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;