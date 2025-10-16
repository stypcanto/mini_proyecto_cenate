import React, { useState } from "react";
import { registerUser } from "@/api/auth";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, UserPlus } from "lucide-react";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.email || !form.password || !form.confirm) {
      toast.error("Completa todos los campos.");
      return;
    }
    if (form.password !== form.confirm) {
      toast.error("Las contraseñas no coinciden.");
      return;
    }
    setLoading(true);
    try {
      await registerUser(form);
      toast.success("Cuenta creada correctamente. Puedes iniciar sesión.");
      navigate("/auth/login");
    } catch (error) {
      toast.error(error.message || "Error al crear cuenta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-[#001a3a] to-[#002b5c] text-white relative">
      <Link
        to="/auth/login"
        className="absolute top-6 left-6 flex items-center text-sm text-gray-300 hover:text-white"
      >
        <ArrowLeft size={16} className="mr-1" /> Volver
      </Link>

      <div className="w-full max-w-md p-8 bg-white/95 rounded-2xl shadow-2xl text-gray-800 mx-4">
        <h2 className="text-2xl font-bold text-center text-[#002b5c] mb-1">
          Crear Cuenta Nueva
        </h2>
        <p className="text-sm text-gray-500 mb-6 text-center">
          Solicitud de acceso a la Intranet CENATE
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="username"
            type="text"
            placeholder="Nombre de usuario"
            value={form.username}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />

          <input
            name="email"
            type="email"
            placeholder="Correo institucional"
            value={form.email}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />

          <input
            name="password"
            type="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />

          <input
            name="confirm"
            type="password"
            placeholder="Confirmar contraseña"
            value={form.confirm}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white py-3 rounded-lg flex justify-center items-center gap-2 transition-all"
          >
            <UserPlus size={18} />
            {loading ? "Registrando..." : "Registrar cuenta"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;