import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AccountRequest = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        nombreCompleto: "",
        emailInstitucional: "",
        motivo: "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Aquí podrías llamar a tu API para enviar la solicitud
        alert("✅ Solicitud enviada correctamente");
        navigate("/login");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100">
            <div className="relative w-full max-w-md p-8 rounded-2xl shadow-2xl backdrop-blur-lg bg-white/70 border border-white/30 animate-fadeIn">
                <h2 className="text-2xl font-bold text-gray-800 text-center mb-1">
                    Solicitud de Creación de Cuenta
                </h2>
                <p className="text-sm text-gray-500 text-center mb-6">
                    Completa los siguientes campos para solicitar acceso
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nombre completo
                        </label>
                        <input
                            type="text"
                            name="nombreCompleto"
                            placeholder="Ej. Juan Pérez"
                            value={formData.nombreCompleto}
                            onChange={handleChange}
                            required
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none bg-white/80"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Correo institucional
                        </label>
                        <input
                            type="email"
                            name="emailInstitucional"
                            placeholder="Ej. juan.perez@essalud.gob.pe"
                            value={formData.emailInstitucional}
                            onChange={handleChange}
                            required
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none bg-white/80"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Motivo de la solicitud
                        </label>
                        <textarea
                            name="motivo"
                            rows="3"
                            placeholder="Describe brevemente el motivo de la solicitud"
                            value={formData.motivo}
                            onChange={handleChange}
                            required
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none bg-white/80"
                        ></textarea>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-indigo-600 text-white font-semibold py-2.5 rounded-lg hover:bg-indigo-700 transition-all duration-200 shadow-md"
                    >
                        Enviar Solicitud
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate("/login")}
                        className="w-full border border-gray-300 text-gray-600 font-medium py-2.5 rounded-lg hover:bg-gray-100 transition-all duration-200"
                    >
                        Volver al login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AccountRequest;