import { useState } from "react";
import { useAuth } from "../auth/AuthContext";

function Account() {
  const { user, updateProfile } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    password: "",
    avatar: user?.avatar || "",
    address: user?.address || "",
    city: user?.city || "",
    phone: user?.phone || "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f6f4ef] p-4 sm:p-6">
        <div className="max-w-4xl mx-auto bg-white rounded-[2rem] border border-black/5 shadow-[0_20px_60px_rgba(0,0,0,0.06)] p-8">
          <h1 className="text-3xl font-bold text-[#111827]">Mi cuenta</h1>
          <p className="mt-4 text-gray-600">
            Debes iniciar sesión para ver tu cuenta.
          </p>
        </div>
      </div>
    );
  }

  const getInitial = () => {
    if (!formData.name) return "U";
    return formData.name.trim().charAt(0).toUpperCase();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Selecciona una imagen válida.");
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        avatar: reader.result as string,
      }));
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const success = updateProfile(formData);

    if (!success) {
      setError("No se pudieron guardar los cambios. Revisa el correo.");
      setMessage("");
      return;
    }

    setError("");
    setMessage("Tu perfil se actualizó correctamente.");
    setFormData((prev) => ({
      ...prev,
      password: "",
    }));
  };

  return (
    <div className="min-h-screen bg-[#f6f4ef] p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-black/5 shadow-[0_20px_60px_rgba(0,0,0,0.06)] p-6 sm:p-8">
          <p className="text-[#7a1f2b] font-bold uppercase tracking-[0.25em] text-xs sm:text-sm">
            Cuenta
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111827] mt-3 tracking-tight">
            Mi perfil
          </h1>
          <p className="text-gray-600 mt-3">
            Administra tu información personal, dirección y datos de contacto.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-black/5 shadow-sm p-6 sm:p-8">
            <p className="text-sm uppercase tracking-[0.2em] text-gray-500 font-semibold">
              Resumen de cuenta
            </p>

            <div className="mt-6 flex justify-center">
              {formData.avatar ? (
                <img
                  src={formData.avatar}
                  alt="Avatar"
                  className="w-28 h-28 rounded-full object-cover border border-black/10 shadow-sm"
                />
              ) : (
                <div className="w-28 h-28 rounded-full bg-[#111827] text-white flex items-center justify-center text-4xl font-bold shadow-sm">
                  {getInitial()}
                </div>
              )}
            </div>

            <div className="mt-6 space-y-4">
              <div className="bg-[#fcfbf8] border border-black/5 rounded-2xl p-4">
                <p className="text-xs text-gray-500 uppercase tracking-[0.2em]">
                  Nombre
                </p>
                <p className="text-lg font-bold text-[#111827] mt-1">
                  {user.name}
                </p>
              </div>

              <div className="bg-[#fcfbf8] border border-black/5 rounded-2xl p-4">
                <p className="text-xs text-gray-500 uppercase tracking-[0.2em]">
                  Correo
                </p>
                <p className="text-base font-semibold text-[#111827] mt-1 break-all">
                  {user.email}
                </p>
              </div>

              <div className="bg-[#fcfbf8] border border-black/5 rounded-2xl p-4">
                <p className="text-xs text-gray-500 uppercase tracking-[0.2em]">
                  Teléfono
                </p>
                <p className="text-base font-semibold text-[#111827] mt-1">
                  {user.phone || "No registrado"}
                </p>
              </div>

              <div className="bg-[#fcfbf8] border border-black/5 rounded-2xl p-4">
                <p className="text-xs text-gray-500 uppercase tracking-[0.2em]">
                  Dirección
                </p>
                <p className="text-base font-semibold text-[#111827] mt-1">
                  {user.address || "No registrada"}
                </p>
              </div>

              <div className="bg-[#fcfbf8] border border-black/5 rounded-2xl p-4">
                <p className="text-xs text-gray-500 uppercase tracking-[0.2em]">
                  Ciudad
                </p>
                <p className="text-base font-semibold text-[#111827] mt-1">
                  {user.city || "No registrada"}
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-black/5 shadow-sm p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-gray-500 font-semibold">
                  Configuración
                </p>
                <h2 className="text-2xl font-extrabold text-[#111827] mt-2">
                  Editar perfil
                </h2>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
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
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="phone"
                  placeholder="Teléfono"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full border border-black/10 bg-[#fcfbf8] p-4 rounded-2xl outline-none focus:ring-2 focus:ring-[#7a1f2b]"
                />

                <input
                  type="text"
                  name="city"
                  placeholder="Ciudad"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full border border-black/10 bg-[#fcfbf8] p-4 rounded-2xl outline-none focus:ring-2 focus:ring-[#7a1f2b]"
                />
              </div>

              <input
                type="text"
                name="address"
                placeholder="Dirección"
                value={formData.address}
                onChange={handleChange}
                className="w-full border border-black/10 bg-[#fcfbf8] p-4 rounded-2xl outline-none focus:ring-2 focus:ring-[#7a1f2b]"
              />

              <input
                type="password"
                name="password"
                placeholder="Nueva contraseña (opcional)"
                value={formData.password}
                onChange={handleChange}
                className="w-full border border-black/10 bg-[#fcfbf8] p-4 rounded-2xl outline-none focus:ring-2 focus:ring-[#7a1f2b]"
              />

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Foto de perfil
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full border border-black/10 bg-[#fcfbf8] p-3 rounded-2xl outline-none"
                />
              </div>

              {message && (
                <p className="text-green-600 text-sm font-medium">{message}</p>
              )}

              {error && (
                <p className="text-red-500 text-sm font-medium">{error}</p>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  className="bg-[#111827] text-white px-6 py-4 rounded-2xl font-bold hover:bg-[#1f2937] transition"
                >
                  Guardar cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Account;