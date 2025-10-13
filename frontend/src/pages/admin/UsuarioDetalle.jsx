// ========================================================================
// 🧾 UsuarioDetalle.jsx — Ficha completa del usuario (Estilo CENATE)
// ========================================================================

import React from "react";
import { motion } from "framer-motion";
import { X, Mail, Phone, UserCircle, Briefcase, ShieldCheck, MapPin, Calendar } from "lucide-react";

const UsuarioDetalle = ({ usuario, onClose }) => {
    if (!usuario) return null;

    const {
        nombreCompleto,
        nombres,
        apellidoPaterno,
        apellidoMaterno,
        tipoDocumento,
        numeroDocumento,
        correoPersonal,
        correoCorporativo,
        telefono,
        direccion,
        profesionPrincipal,
        colegiatura,
        regimenLaboral,
        areaTrabajo,
        ordenCompra,
        firmaDigital,
        fotoUrl,
        estado,
        roles,
        permisos,
    } = usuario;

    return (
        <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden relative"
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
            >
                {/* Cerrar */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Encabezado */}
                <div className="bg-gradient-to-r from-[#0a1832] to-[#102a56] text-white p-6 flex items-center gap-6">
                    <img
                        src={fotoUrl || "/default-user.png"}
                        alt="Foto de usuario"
                        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                    <div>
                        <h2 className="text-2xl font-semibold tracking-tight">
                            {nombreCompleto || `${nombres} ${apellidoPaterno || ""} ${apellidoMaterno || ""}`}
                        </h2>
                        <p className="text-blue-200">{profesionPrincipal || "Profesional de Salud"}</p>
                        <p className="text-sm mt-1">{areaTrabajo || "—"}</p>
                        <span
                            className={`inline-block mt-2 px-3 py-1 text-xs rounded-full font-semibold ${
                                estado === "ACTIVO"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                            }`}
                        >
              {estado}
            </span>
                    </div>
                </div>

                {/* Cuerpo */}
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Información Personal */}
                    <section>
                        <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <UserCircle className="w-5 h-5 text-blue-600" /> Datos Personales
                        </h3>
                        <div className="space-y-2 text-sm text-gray-700">
                            <p><strong>Documento:</strong> {tipoDocumento} {numeroDocumento}</p>
                            <p><strong>Correo personal:</strong> {correoPersonal || "—"}</p>
                            <p><strong>Correo corporativo:</strong> {correoCorporativo || "—"}</p>
                            <p><strong>Teléfono:</strong> {telefono || "—"}</p>
                            <p><strong>Dirección:</strong> {direccion || "—"}</p>
                        </div>
                    </section>

                    {/* Información Profesional */}
                    <section>
                        <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-blue-600" /> Datos Profesionales
                        </h3>
                        <div className="space-y-2 text-sm text-gray-700">
                            <p><strong>Profesión:</strong> {profesionPrincipal || "—"}</p>
                            <p><strong>Colegiatura:</strong> {colegiatura || "—"}</p>
                            <p><strong>Régimen laboral:</strong> {regimenLaboral || "—"}</p>
                            <p><strong>Área:</strong> {areaTrabajo || "—"}</p>
                            <p><strong>Orden de compra:</strong> {ordenCompra || "—"}</p>
                        </div>
                    </section>

                    {/* Firma y roles */}
                    <section className="md:col-span-2">
                        <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-blue-600" /> Seguridad y Roles
                        </h3>
                        <div className="flex flex-wrap gap-2 text-sm text-gray-700">
                            <p><strong>Roles:</strong> {roles?.join(", ") || "Sin roles"}</p>
                            <p><strong>Permisos:</strong> {permisos?.join(", ") || "Sin permisos"}</p>
                        </div>

                        {firmaDigital && (
                            <div className="mt-4">
                                <p className="text-sm font-medium text-gray-700 mb-2">Firma digital:</p>
                                <img
                                    src={firmaDigital}
                                    alt="Firma digital"
                                    className="h-16 object-contain border-b border-gray-300"
                                />
                            </div>
                        )}
                    </section>
                </div>

                {/* Pie */}
                <div className="border-t border-gray-200 px-8 py-4 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium"
                    >
                        Cerrar
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default UsuarioDetalle;