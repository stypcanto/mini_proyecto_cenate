import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus, Lock, Mail, ArrowLeft, User, Eye, EyeOff } from "lucide-react";
import { useUsuarios } from "../hooks/useUsuarios";

const Register = () => {
    const { registerUser } = useUsuarios();
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        const { username, email, password, confirmPassword } = formData;

        if (!username || !email || !password || !confirmPassword) {
            setError("Por favor completa todos los campos.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        const strongRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=])[A-Za-z\d!@#$%^&*()_\-+=]{8,}$/;
        if (!strongRegex.test(password)) {
            setError(
                "La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, números y un símbolo."
            );
            return;
        }

        try {
            setLoading(true);
            const data = await registerUser(formData);
            if (data?.message?.toLowerCase().includes("exitosamente")) {
                setSuccess("✅ Usuario registrado correctamente. Redirigiendo...");
                setTimeout(() => navigate("/login"), 2000);
            } else {
                setError(data?.message || "Error al registrar usuario.");
            }
        } catch (err) {
            console.error("❌ Error en registro:", err);
            setError(err.message || "Error al registrar usuario.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                backgroundImage: "url('/images/fondo-portal-web-cenate-2025.png')",
            }}
            className="min-h-screen bg-cover bg-center flex items-center justify-center p-4 relative"
        >
            {/* Patrón Apple-style */}
            <div className="absolute inset-0 bg-white/10 backdrop-blur-2xl" />

            <div className="w-full max-w-md relative z-10 transition-all duration-500 ease-in-out hover:scale-[1.01]">
                {/* Botón volver */}
                <Link
                    to="/login"
                    className="inline-flex items-center space-x-2 text-white hover:text-blue-100 transition-colors mb-6"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="font-medium">Volver al Login</span>
                </Link>

                <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_0_35px_-10px_rgba(0,0,0,0.3)] p-8 md:p-10 text-center border border-white/40">
                    {/* Icono superior */}
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#2e63a6] to-[#1d4f8a] rounded-2xl mb-6 shadow-lg">
                        <UserPlus className="w-10 h-10 text-white" />
                    </div>

                    <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
                        Crear una cuenta
                    </h2>
                    <p className="text-gray-600 mb-6 text-sm">
                        Regístrate para acceder al sistema interno de CENATE
                    </p>

                    {/* Mensajes */}
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg text-red-700 text-sm font-medium animate-fade-in">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg text-green-700 text-sm font-medium animate-fade-in">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleRegister} className="space-y-5 text-left">
                        {/* Usuario */}
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
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#2e63a6] focus:border-transparent bg-white/60 backdrop-blur-sm transition-all"
                                    required
                                />
                            </div>
                        </div>

                        {/* Email */}
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
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#2e63a6] focus:border-transparent bg-white/60 backdrop-blur-sm"
                                    required
                                />
                            </div>
                        </div>

                        {/* Contraseña */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Contraseña
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="********"
                                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#2e63a6] focus:border-transparent bg-white/60 backdrop-blur-sm"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#2e63a6]"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Confirmar contraseña */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Confirmar contraseña
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type={showConfirm ? "text" : "password"}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="********"
                                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#2e63a6] focus:border-transparent bg-white/60 backdrop-blur-sm"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#2e63a6]"
                                >
                                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Botón */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 px-6 bg-gradient-to-r from-[#2e63a6] to-[#1d4f8a] text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Registrando...</span>
                                </>
                            ) : (
                                <>
                                    <UserPlus className="w-5 h-5" />
                                    <span>Crear cuenta</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p className="mt-6 text-center text-white/80 text-sm font-light tracking-wide">
                    © {new Date().getFullYear()} CENATE - EsSalud · Todos los derechos reservados
                </p>
            </div>
        </div>
    );
};

export default Register;