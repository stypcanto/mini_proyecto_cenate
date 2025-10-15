// ========================================================================
// 🧩 UsuarioDetalle.jsx - Panel administrativo CENATE
// Muestra información completa del usuario seleccionado
// ========================================================================

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUsuarios } from "@/hooks/useUsuarios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Loader2,
    User,
    Mail,
    Briefcase,
    Calendar,
    FileSignature,
    IdCard,
    ArrowLeft,
    Edit3,
    Trash2,
} from "lucide-react";
import toast from "react-hot-toast";

// ========================================================================
// 🎯 COMPONENTE PRINCIPAL
// ========================================================================
const UsuarioDetalle = () => {
    const { username } = useParams(); // /admin/usuarios/:username
    const navigate = useNavigate();
    const { fetchUsuarioDetalle } = useUsuarios();

    const [usuario, setUsuario] = useState(null);
    const [loading, setLoading] = useState(true);

    // ======================================================
    // 🚀 Cargar información del usuario
    // ======================================================
    useEffect(() => {
        const loadDetalle = async () => {
            try {
                const data = await fetchUsuarioDetalle(username);
                setUsuario(data);
            } catch (err) {
                toast.error("Error al cargar el detalle del usuario.");
                navigate("/admin/users");
            } finally {
                setLoading(false);
            }
        };
        if (username) loadDetalle();
    }, [username, fetchUsuarioDetalle, navigate]);

    // ======================================================
    // 🧮 Calcular edad
    // ======================================================
    const calcularEdad = (fechaNacimiento) => {
        if (!fechaNacimiento) return "No registrada";
        const fecha = new Date(fechaNacimiento);
        const hoy = new Date();
        let edad = hoy.getFullYear() - fecha.getFullYear();
        const mes = hoy.getMonth() - fecha.getMonth();
        if (mes < 0 || (mes === 0 && hoy.getDate() < fecha.getDate())) edad--;
        return `${edad} años`;
    };

    // ======================================================
    // ⏳ Loader
    // ======================================================
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh]">
                <Loader2 className="animate-spin w-10 h-10 text-blue-600" />
                <p className="mt-3 text-gray-600 font-medium">Cargando usuario...</p>
            </div>
        );
    }

    if (!usuario) {
        return (
            <div className="text-center text-gray-500 mt-10">
                ❌ No se encontró información del usuario.
            </div>
        );
    }

    // ======================================================
    // 🧾 Render principal
    // ======================================================
    return (
        <div className="max-w-5xl mx-auto mt-10">
            <Card className="p-8 shadow-xl border border-gray-100 bg-white rounded-3xl">
                {/* 🧑 Foto y encabezado */}
                <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
                    <img
                        src={
                            usuario.fotoUrl
                                ? `${import.meta.env.VITE_API_URL}/uploads/${usuario.fotoUrl}`
                                : "/images/default-profile.png"
                        }
                        alt="Foto del usuario"
                        className="w-32 h-32 rounded-full object-cover border-4 border-blue-100 shadow-md"
                    />
                    <div className="flex-1 text-center md:text-left">
                        <h2 className="text-3xl font-bold text-gray-800">
                            {usuario.nombreCompleto || "Sin nombre registrado"}
                        </h2>
                        <p className="text-gray-600 flex justify-center md:justify-start items-center gap-2 mt-2">
                            <User size={18} /> {usuario.username} —{" "}
                            <span
                                className={`px-2 py-0.5 rounded-full text-sm font-medium ${
                                    usuario.activo
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                }`}
                            >
                {usuario.activo ? "Activo" : "Inactivo"}
              </span>
                        </p>
                    </div>
                </div>

                {/* 🧩 Información personal */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-gray-700">
                    <InfoRow icon={<Mail />} label="Correo personal" value={usuario.correoPersonal} />
                    <InfoRow icon={<Mail />} label="Correo corporativo" value={usuario.correoCorporativo} />
                    <InfoRow
                        icon={<IdCard />}
                        label="Documento"
                        value={`${usuario.tipoDocumento?.descTipDoc || ""} ${
                            usuario.numeroDocumento || ""
                        }`}
                    />
                    <InfoRow
                        icon={<Calendar />}
                        label="Fecha de nacimiento"
                        value={
                            usuario.fechaNacimiento
                                ? new Date(usuario.fechaNacimiento).toLocaleDateString("es-PE")
                                : "No registrada"
                        }
                    />
                    <InfoRow icon={<Calendar />} label="Edad" value={calcularEdad(usuario.fechaNacimiento)} />
                    <InfoRow icon={<Briefcase />} label="Área de trabajo" value={usuario.areaTrabajo} />
                    <InfoRow icon={<Briefcase />} label="Régimen laboral" value={usuario.regimenLaboral} />
                </div>

                {/* 🧾 Profesiones y firmas */}
                <div className="mt-8">
                    <Section title="Profesiones">
                        {usuario.profesiones?.length ? (
                            <ul className="list-disc list-inside space-y-1">
                                {usuario.profesiones.map((prof, i) => (
                                    <li key={i} className="text-gray-700">
                                        {prof.descProfesion || prof}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500 italic">Sin profesiones registradas</p>
                        )}
                    </Section>

                    <Section title="Firmas Digitales" icon={<FileSignature />}>
                        {usuario.firmasDigitales?.length ? (
                            <ul className="list-disc list-inside space-y-1">
                                {usuario.firmasDigitales.map((firma, i) => (
                                    <li key={i}>{firma}</li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500 italic">No tiene firmas asociadas</p>
                        )}
                    </Section>
                </div>

                {/* 🔘 Botones de acción */}
                <div className="mt-8 flex flex-wrap justify-end gap-3">
                    <Button
                        onClick={() => navigate("/admin/users")}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" /> Volver
                    </Button>
                    <Button
                        onClick={() => toast("Función de edición en desarrollo 🛠️")}
                        className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                    >
                        <Edit3 className="w-4 h-4" /> Editar
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={() =>
                            window.confirm("¿Deseas eliminar este usuario?") &&
                            toast.error("Eliminación aún no implementada 🚧")
                        }
                        className="flex items-center gap-2"
                    >
                        <Trash2 className="w-4 h-4" /> Eliminar
                    </Button>
                </div>
            </Card>
        </div>
    );
};

// ========================================================================
// 💠 Subcomponentes reutilizables
// ========================================================================
const InfoRow = ({ icon, label, value }) => (
    <p className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 shadow-sm border border-gray-100">
        <span className="text-blue-600">{icon}</span>
        <strong className="text-gray-800">{label}:</strong>{" "}
        <span className="text-gray-700">{value || "—"}</span>
    </p>
);

const Section = ({ title, icon, children }) => (
    <div className="mt-5">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-2">
            {icon && <span className="text-blue-600">{icon}</span>} {title}
        </h3>
        <div className="pl-3">{children}</div>
    </div>
);

export default UsuarioDetalle;