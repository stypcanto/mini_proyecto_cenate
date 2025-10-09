import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus, Lock, Mail, ArrowLeft, User } from "lucide-react";
import { registerUser } from "../api/config";

const Register = () => {
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        confirmPassword: "",
        email: "",
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!formData.username || !formData.password || !formData.email) {
            setError("Todos los campos son obligatorios.");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        try {
            setLoading(true);
            const data = await registerUser(formData);
            if (data?.message?.toLowerCase().includes("exito")) {
                setSuccess("✅ Usuario registrado correctamente. Redirigiendo...");
                setTimeout(() => navigate("/login"), 2000);
            } else {
                setError(data?.message || "Error al registrar usuario.");
            }
        } catch (err) {
            console.error(err);
            setError("Error al registrar usuario.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{ backgroundImage: "url('/images/fondo-portal-web-cenate-2025.png')" }}
            className="min-h-screen bg-cover bg-center flex items-center justify-center p-4 relative"
        >
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_2px_2px,white_1px,transparent_0)] bg-[length:40px_40px]"></div>

            <div className="w-full max-w-md relative z-10">
                {/* Botón volver */}
                <Link
                    to="/login"
                    className="inline-flex items-center space-x-2 text-white hover:text-blue-100 transition-colors mb-6"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="font-medium">Volver al Login</span>
                </Link>

                <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#2e63a6] to-[#1d4f8a] rounded-2xl mb-6 shadow-lg">
                        <UserPlus className="w-10 h-10 text-white" />
                    </div>

                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                        Crear una cuenta
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Regístrate para acceder al sistema
                    </p>

                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg text-red-700">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg text-green-700">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleRegister} className="space-y-5 text-left">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Usuario
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="Ingresa tu usuario"
                                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2e63a6] focus:border-transparent"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Correo electrónico
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="ejemplo@correo.com"
                                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2e63a6] focus:border-transparent"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Contraseña
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="********"
                                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2e63a6] focus:border-transparent"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Confirmar contraseña
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="********"
                                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2e63a6] focus:border-transparent"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 px-6 bg-gradient-to-r from-[#2e63a6] to-[#1d4f8a] text-white font-bold rounded-xl shadow-lg hover:scale-[1.02] transition-transform"
                        >
                            {loading ? "Registrando..." : "Crear cuenta"}
                        </button>
                    </form>
                </div>

                <p className="mt-6 text-center text-white/80 text-sm">
                    © {new Date().getFullYear()} CENATE - EsSalud · Todos los derechos reservados
                </p>
            </div>
        </div>
    );
};

export default Register;
