// ========================================================================
// 🧑‍💼 CrearUsuario.jsx - DISEÑO OSCURO
// ========================================================================

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, UserPlus, ArrowLeft, LockKeyhole } from "lucide-react";
import toast from "react-hot-toast";
import AdminLayout from "../components/layout/AdminLayout";
import { apiClient } from "../lib/apiClient";
import { PermissionGate } from "../components/security/PermissionGate";
import { usePermissions } from "../hooks/usePermissions";

export default function CrearUsuario() {
  const navigate = useNavigate();
  const { tienePermiso } = usePermissions();
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    nombres: "",
    apellido_paterno: "",
    apellido_materno: "",
    numero_documento: "",
    tipo_documento: "DNI",
    genero: "M",
    fecha_nacimiento: "",
    telefono: "",
    correo_personal: "",
    correo_corporativo: "",
    rol: "MEDICO",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Solo se permiten archivos de imagen");
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.nombres || !formData.numero_documento) {
      toast.error("Por favor completa todos los campos obligatorios");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    setLoading(true);
    try {
      const data = await apiClient.post("/usuarios/crear", formData, true);

      if (photoFile && data.id_user) {
        const formDataPhoto = new FormData();
        formDataPhoto.append("foto", photoFile);
        await apiClient.post(`/personal/${data.id_user}/foto`, formDataPhoto, true);
      }

      toast.success("Usuario creado exitosamente");
      navigate("/admin/users");
    } catch (error) {
      toast.error(error.message || "Error al crear usuario");
    } finally {
      setLoading(false);
    }
  };

  const puedeCrear = tienePermiso("/admin/users", "crear");

  return (
    <AdminLayout>
      <div className="p-8 bg-slate-900">
        {!puedeCrear ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <LockKeyhole className="w-16 h-16 text-gray-500 mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Acceso denegado</h2>
            <p className="text-gray-400">No tienes permisos para crear usuarios.</p>
            <button
              onClick={() => navigate("/admin/users")}
              className="mt-6 px-6 py-2.5 bg-slate-800/50 hover:bg-slate-700/50 text-gray-300 rounded-lg transition-all border border-slate-700"
            >
              Volver
            </button>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-t-2xl px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {photoPreview ? (
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="w-20 h-20 rounded-full border-4 border-white/30 object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full border-4 border-white/30 bg-white/20 flex items-center justify-center text-white">
                        <UserPlus size={32} />
                      </div>
                    )}
                    <label className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors shadow-lg">
                      <Camera size={20} className="text-blue-600" />
                      <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                    </label>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Crear Usuario</h2>
                    <p className="text-blue-100 text-sm mt-1">Completa el formulario para registrar un nuevo usuario</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate("/admin/users")}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg transition-all flex items-center gap-2 border border-white/30"
                >
                  <ArrowLeft size={18} />
                  Volver
                </button>
              </div>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="bg-slate-800/30 rounded-b-2xl border border-slate-700/50 border-t-0 p-8 space-y-8">
              {/* Credenciales */}
              <Section title="Credenciales de Acceso">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField label="Usuario *" name="username" value={formData.username} onChange={handleChange} required />
                  <FormField label="Contraseña *" type="password" name="password" value={formData.password} onChange={handleChange} required />
                  <FormField label="Confirmar Contraseña *" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
                </div>
              </Section>

              {/* Información Personal */}
              <Section title="Información Personal">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField label="Nombres *" name="nombres" value={formData.nombres} onChange={handleChange} required />
                  <FormField label="Apellido Paterno *" name="apellido_paterno" value={formData.apellido_paterno} onChange={handleChange} required />
                  <FormField label="Apellido Materno" name="apellido_materno" value={formData.apellido_materno} onChange={handleChange} />
                  <FormField label="Número de Documento *" name="numero_documento" value={formData.numero_documento} onChange={handleChange} required />
                  <FormSelect label="Tipo de Documento" name="tipo_documento" value={formData.tipo_documento} onChange={handleChange}>
                    <option value="DNI">DNI</option>
                    <option value="CE">Carnet de Extranjería</option>
                    <option value="PASAPORTE">Pasaporte</option>
                  </FormSelect>
                  <FormSelect label="Género" name="genero" value={formData.genero} onChange={handleChange}>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                  </FormSelect>
                </div>
              </Section>

              {/* Contacto */}
              <Section title="Información de Contacto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField label="Teléfono" name="telefono" value={formData.telefono} onChange={handleChange} />
                  <FormField label="Email Personal" name="correo_personal" type="email" value={formData.correo_personal} onChange={handleChange} />
                  <FormField label="Email Corporativo" name="correo_corporativo" type="email" value={formData.correo_corporativo} onChange={handleChange} />
                </div>
              </Section>

              {/* Rol */}
              <Section title="Rol del Sistema">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormSelect label="Rol *" name="rol" value={formData.rol} onChange={handleChange}>
                    <option value="MEDICO">Médico</option>
                    <option value="ENFERMERO">Enfermero</option>
                    <option value="ADMIN">Administrador</option>
                    <option value="SUPERADMIN">Super Administrador</option>
                    <option value="PERSONAL_CNT">Personal CNT</option>
                    <option value="PERSONAL_EXTERNO">Personal Externo</option>
                  </FormSelect>
                </div>
              </Section>

              {/* Botones */}
              <div className="flex gap-3 justify-end pt-6 border-t border-slate-700/50">
                <button
                  onClick={() => navigate("/admin/users")}
                  type="button"
                  className="px-6 py-2.5 bg-slate-800/50 hover:bg-slate-700/50 text-gray-300 rounded-lg transition-all border border-slate-700"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold rounded-lg flex items-center gap-2 transition-all disabled:opacity-50 shadow-lg"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creando...
                    </>
                  ) : (
                    <>
                      <UserPlus size={18} />
                      Crear Usuario
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

// Componentes auxiliares
function Section({ title, children }) {
  return (
    <div>
      <h3 className="text-lg font-bold text-white mb-4 pb-2 border-b-2 border-blue-500/50">{title}</h3>
      {children}
    </div>
  );
}

function FormField({ label, name, value, onChange, type = "text", required = false }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-300 mb-2">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg 
                 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 
                 text-white placeholder:text-gray-500 transition-all"
      />
    </div>
  );
}

function FormSelect({ label, name, value, onChange, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-300 mb-2">{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg 
                 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 
                 text-white transition-all"
      >
        {children}
      </select>
    </div>
  );
}
