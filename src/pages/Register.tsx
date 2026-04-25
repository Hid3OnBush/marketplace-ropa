import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    setError("");

    const success = await register({
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
    });

    setIsLoading(false);

    if (!success) {
      setError("Ese correo ya está registrado o hubo un error");
      return;
    }

    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#f6f4ef] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white rounded-[2rem] border border-black/5 shadow-[0_20px_60px_rgba(0,0,0,0.06)] p-6 sm:p-8">
        <p className="text-[#7a1f2b] font-bold uppercase tracking-[0.25em] text-xs sm:text-sm">
          Nueva cuenta
        </p>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111827] mt-3 tracking-tight">
          Crear cuenta
        </h1>

        <p className="text-gray-600 mt-3">
          Regístrate para guardar tus pedidos y comprar más rápido.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Nombre completo"
            value={formData.name}
            onChange={handleChange}
            className="w-full border border-black/10 bg-[#fcfbf8] p-4 rounded-2xl outline-none focus:ring-2 focus:ring-[#7a1f2b]"
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Correo electrónico"
            value={formData.email}
            onChange={handleChange}
            className="w-full border border-black/10 bg-[#fcfbf8] p-4 rounded-2xl outline-none focus:ring-2 focus:ring-[#7a1f2b]"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={handleChange}
            className="w-full border border-black/10 bg-[#fcfbf8] p-4 rounded-2xl outline-none focus:ring-2 focus:ring-[#7a1f2b]"
            required
          />

          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#111827] text-white py-4 rounded-2xl font-bold hover:bg-[#1f2937] transition disabled:opacity-70"
          >
            {isLoading ? "Registrando..." : "Registrarme"}
          </button>
        </form>

        <p className="mt-6 text-sm text-gray-600">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="text-[#7a1f2b] font-semibold">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;