import React from "react";
import { motion } from "framer-motion";
import {
    Mail,
    Building2,
    Briefcase,
    ShieldCheck,
    Edit,
    Phone,
    UserCircle2,
    Award,
    Fingerprint,
    Network,
} from "lucide-react";
import { getFotoPersonalCntUrl } from "../../api/personal";

/**
 * 🧑‍⚕️ Card profesional de información de personal (CENATE o externo)
 * Visualiza toda la información laboral, académica y de contacto.
 */
export default function PersonalCard({ personal, onEdit, onViewRoles }) {
    if (!personal) return null;

    const {
        idPersonal,
        nombreCompleto,
        tipoPersonal,
        numeroDocumento,
        tipoDocumento,
        emailCorporativo,
        emailPersonal,
        telefono,
        area,
        regimenLaboral,
        profesiones = [],
        tiposPersonal = [],
        ocs = [],
        firmas = [],
        roles = [],
        estado,
        foto,
    } = personal;

    const fotoUrl = foto ? getFotoPersonalCntUrl(idPersonal) : "/images/default-avatar.png";

    return (
        <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="bg-white/70 backdrop-blur-md shadow-2xl rounded-3xl overflow-hidden border border-gray-100 transition-all duration-300"
        >
            {/* ================================
          ENCABEZADO (Foto + Datos principales)
      ================================= */}
            <div className="relative bg-gradient-to-r from-slate-100 to-slate-200 p-6 flex items-center gap-5">
                <img
                    src={fotoUrl}
                    alt={nombreCompleto}
                    className="w-28 h-28 rounded-full border-4 border-white shadow-lg object-cover"
                />
                <div>
                    <h2 className="text-2xl font-semibold text-gray-800 tracking-tight">
                        {nombreCompleto}
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                        {tipoDocumento?.descTipDoc || "Documento"}:{" "}
                        <span className="font-medium text-gray-700">{numeroDocumento}</span>
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    estado === "A"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                }`}
            >
              {estado === "A" ? "Activo" : "Inactivo"}
            </span>
                        <span className="px-3 py-1 bg-sky-100 text-sky-700 text-xs font-semibold rounded-full">
              {tipoPersonal || "—"}
            </span>
                    </div>
                </div>
            </div>

            {/* ================================
          DETALLES PRINCIPALES
      ================================= */}
            <div className="p-6 grid md:grid-cols-2 gap-4 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                    <Mail size={16} className="text-blue-500" />
                    <span>
            <strong>Correo corporativo:</strong> {emailCorporativo || "—"}
          </span>
                </div>

                <div className="flex items-center gap-2">
                    <Mail size={16} className="text-indigo-500" />
                    <span>
            <strong>Correo personal:</strong> {emailPersonal || "—"}
          </span>
                </div>

                <div className="flex items-center gap-2">
                    <Phone size={16} className="text-green-500" />
                    <span>
            <strong>Teléfono:</strong> {telefono || "—"}
          </span>
                </div>

                <div className="flex items-center gap-2">
                    <Building2 size={16} className="text-orange-500" />
                    <span>
            <strong>Área:</strong> {area?.descArea || "Sin área asignada"}
          </span>
                </div>

                <div className="flex items-center gap-2">
                    <Briefcase size={16} className="text-pink-500" />
                    <span>
            <strong>Régimen laboral:</strong> {regimenLaboral?.descRegLab || "—"}
          </span>
                </div>
            </div>

            {/* ================================
          RELACIONES PROFESIONALES (N:N)
      ================================= */}
            <div className="border-t border-gray-100 p-6 space-y-5">
                {profesiones.length > 0 && (
                    <SectionChips
                        title="Profesiones"
                        icon={<Award size={16} className="text-yellow-500" />}
                        items={profesiones}
                    />
                )}

                {tiposPersonal.length > 0 && (
                    <SectionChips
                        title="Tipo de Personal"
                        icon={<UserCircle2 size={16} className="text-rose-500" />}
                        items={tiposPersonal}
                    />
                )}

                {ocs.length > 0 && (
                    <SectionChips
                        title="Órdenes de Contrato"
                        icon={<Network size={16} className="text-blue-500" />}
                        items={ocs}
                    />
                )}

                {firmas.length > 0 && (
                    <SectionChips
                        title="Firmas Digitales"
                        icon={<Fingerprint size={16} className="text-indigo-500" />}
                        items={firmas}
                    />
                )}

                {roles.length > 0 && (
                    <SectionChips
                        title="Roles del Sistema"
                        icon={<ShieldCheck size={16} className="text-green-600" />}
                        items={roles.map((r) => r.descRol || r)}
                    />
                )}
            </div>

            {/* ================================
          FOOTER (Acciones)
      ================================= */}
            <div className="border-t border-gray-100 bg-gray-50 p-4 flex justify-end gap-3">
                <button
                    onClick={onViewRoles}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
                >
                    <ShieldCheck size={16} /> Ver Roles
                </button>
                <button
                    onClick={onEdit}
                    className="flex items-center gap-2 bg-blue-600 text-white text-sm px-4 py-2 rounded-xl shadow hover:bg-blue-700 transition-all"
                >
                    <Edit size={16} /> Editar
                </button>
            </div>
        </motion.div>
    );
}

/**
 * 🧩 Subcomponente reutilizable para secciones de etiquetas (chips)
 */
function SectionChips({ title, icon, items }) {
    return (
        <div>
            <div className="flex items-center gap-2 mb-2">
                {icon}
                <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">
                    {title}
                </h3>
            </div>
            <div className="flex flex-wrap gap-2">
                {items.map((item, i) => (
                    <span
                        key={i}
                        className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-full border border-slate-200"
                    >
            {item}
          </span>
                ))}
            </div>
        </div>
    );
}