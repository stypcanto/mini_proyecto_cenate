// ========================================================================
// 👤 PerfilTab.jsx – Pestaña de información personal editable
// ========================================================================

import React, { useState, useRef, useEffect } from "react";
import {
  Camera,
  AlertCircle,
  Save,
  X,
} from "lucide-react";
import apiClient from "../../services/apiClient";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

/**
 * 👤 Pestaña de información personal
 * Permite editar datos personales y cambiar foto de perfil
 */
export default function PerfilTab({ user }) {
  const { refreshUser } = useAuth();
  const fileInputRef = useRef(null);

  // Estado del formulario
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [errors, setErrors] = useState({});

  // Foto
  const [fotoFile, setFotoFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(user?.foto);

  // Datos personales
  const initialFormData = {
    nombres: user?.nombreCompleto || "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    correoPersonal: user?.correoPersonal || "",
    correoInstitucional: user?.correoInstitucional || "",
    telefono: user?.telefono || "",
    numeroDocumento: user?.numeroDocumento || "",
    areaTrabajo: user?.area || "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [originalFormData, setOriginalFormData] = useState(initialFormData);

  // 📋 Cargar datos personales completos al montar el componente
  useEffect(() => {
    const fetchPersonalData = async () => {
      if (!user?.id) return;

      try {
        setLoadingData(true);
        const response = await apiClient.get(`/usuarios/personal/${user.id}`, true);

        if (response) {
          console.log("✅ Datos personales cargados:", response);

          const fetchedData = {
            nombres: response.nombreCompleto || response.nombre_completo || user?.nombreCompleto || "",
            apellidoPaterno: response.apellidoPaterno || response.apellido_paterno || "",
            apellidoMaterno: response.apellidoMaterno || response.apellido_materno || "",
            correoPersonal: response.correoPersonal || response.correo_personal || "",
            correoInstitucional: response.correoInstitucional || response.correo_institucional || "",
            telefono: response.telefono || "",
            numeroDocumento: response.numeroDocumento || response.numero_documento || "",
            areaTrabajo: response.areaTrabajo || response.nombre_area || response.area_trabajo || "",
          };

          setFormData(fetchedData);
          setOriginalFormData(fetchedData);

          // Actualizar foto si está disponible
          if (response.fotoUrl || response.foto_url) {
            setFotoPreview(response.fotoUrl || response.foto_url);
          }
        }
      } catch (error) {
        console.error("❌ Error cargando datos personales:", error);
        // No mostrar error al usuario, solo mantener datos del contexto
      } finally {
        setLoadingData(false);
      }
    };

    fetchPersonalData();
  }, [user?.id]);

  // 📝 Validar archivo de foto
  const validarArchivo = (file) => {
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_TYPES = ["image/jpeg", "image/png"];

    if (!file) return null;

    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Solo se permiten archivos JPEG o PNG";
    }

    if (file.size > MAX_SIZE) {
      return "El archivo no debe superar 5MB";
    }

    return null;
  };

  // 📸 Manejar cambio de foto
  const handleFotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validarArchivo(file);
    if (error) {
      toast.error(error);
      return;
    }

    setFotoFile(file);

    // Crear preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setFotoPreview(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  // 📝 Manejar cambio de input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpiar errores del campo
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // 💾 Manejar guardar cambios
  const handleSubmit = async () => {
    // Validaciones
    const newErrors = {};

    if (!formData.nombres.trim()) {
      newErrors.nombres = "El nombre es requerido";
    }

    if (!formData.correoPersonal.trim()) {
      newErrors.correoPersonal = "El email personal es requerido";
    } else if (!isValidEmail(formData.correoPersonal)) {
      newErrors.correoPersonal = "Email inválido";
    }

    if (
      formData.correoInstitucional.trim() &&
      !isValidEmail(formData.correoInstitucional)
    ) {
      newErrors.correoInstitucional = "Email inválido";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      // 1. Subir foto si hay cambio
      if (fotoFile) {
        const uploadData = new FormData();
        uploadData.append("foto", fotoFile);

        await apiClient.uploadFile(
          `/fotos-perfil/upload/${user.id}`,
          uploadData,
          true
        );
      }

      // 2. Actualizar datos personales
      const updateResponse = await apiClient.put(
        `/usuarios/personal/${user.id}`,
        {
          nombres: formData.nombres,
          correoPersonal: formData.correoPersonal,
          correoInstitucional: formData.correoInstitucional,
          telefono: formData.telefono,
        },
        true
      );

      // 3. Actualizar formData original con los nuevos datos
      if (updateResponse?.usuario) {
        const updatedData = {
          ...formData,
          ...updateResponse.usuario,
        };
        setOriginalFormData(updatedData);
        setFormData(updatedData);
      }

      // 4. Refrescar datos de usuario en contexto
      await refreshUser();

      toast.success("Perfil actualizado correctamente");
      setEditMode(false);
      setFotoFile(null);
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Error al actualizar perfil";
      toast.error(errorMsg);
      setErrors({ submit: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  // ❌ Manejar cancelar
  const handleCancel = () => {
    setEditMode(false);
    setFotoFile(null);
    setFotoPreview(user?.foto);
    setFormData(originalFormData);
    setErrors({});
  };

  return (
    <div className="space-y-6">
      {/* 📸 Sección Foto de Perfil */}
      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-900">Foto de Perfil</h3>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-6">
            {/* Foto */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                {fotoPreview ? (
                  <img
                    src={fotoPreview}
                    alt="Foto de perfil"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white text-4xl font-bold">
                    {user?.nombreCompleto?.[0]?.toUpperCase()}
                  </span>
                )}
              </div>

              {editMode && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg transition-all"
                >
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Información */}
            <div className="flex-1">
              <p className="text-sm text-slate-600">
                {fotoFile
                  ? "Nueva foto seleccionada"
                  : "Foto actual de perfil"}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Formatos: JPEG, PNG | Máximo 5MB
              </p>

              {editMode && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-3 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  {fotoFile ? "Cambiar Foto" : "Subir Foto"}
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleFotoChange}
                className="hidden"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 👤 Sección Información Personal */}
      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">
            Información Personal
          </h3>

          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium transition-all"
            >
              Editar
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                disabled={loading}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
              >
                <X className="w-4 h-4 inline mr-1" />
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {loading ? "Guardando..." : "Guardar"}
              </button>
            </div>
          )}
        </div>

        <div className="p-6 space-y-5">
          {/* Loading datos */}
          {loadingData && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin flex-shrink-0 mt-0.5" />
              <p className="text-blue-700 text-sm">Cargando información personal...</p>
            </div>
          )}

          {/* Error general */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Nombre */}
          <FormField
            label="Nombre Completo"
            name="nombres"
            value={formData.nombres}
            onChange={handleInputChange}
            disabled={!editMode}
            error={errors.nombres}
            placeholder="Ej: Juan Carlos Pérez García"
          />

          {/* Email Personal */}
          <FormField
            label="Email Personal"
            name="correoPersonal"
            type="email"
            value={formData.correoPersonal}
            onChange={handleInputChange}
            disabled={!editMode}
            error={errors.correoPersonal}
            placeholder="correo@personal.com"
          />

          {/* Email Corporativo */}
          <FormField
            label="Email Corporativo (Opcional)"
            name="correoInstitucional"
            type="email"
            value={formData.correoInstitucional}
            onChange={handleInputChange}
            disabled={!editMode}
            error={errors.correoInstitucional}
            placeholder="correo@institucional.com"
          />

          {/* Teléfono */}
          <FormField
            label="Teléfono (Opcional)"
            name="telefono"
            value={formData.telefono}
            onChange={handleInputChange}
            disabled={!editMode}
            error={errors.telefono}
            placeholder="Ej: +51 987 654 321"
          />

          {/* DNI (Read-only) */}
          <FormField
            label="Número de Documento"
            name="numeroDocumento"
            value={formData.numeroDocumento}
            disabled={true}
            placeholder="No editable"
          />

          {/* Área de Trabajo (Read-only) */}
          <FormField
            label="Área de Trabajo"
            name="areaTrabajo"
            value={formData.areaTrabajo}
            disabled={true}
            placeholder="No editable"
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 🔧 Componente: Campo de formulario
// ============================================================
function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  disabled,
  error,
  placeholder,
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-900 mb-2">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full px-4 py-2.5 border-2 rounded-lg transition-all ${
          disabled
            ? "bg-slate-100 border-slate-200 text-slate-600 cursor-not-allowed"
            : error
            ? "border-red-500 bg-red-50 focus:border-red-600 focus:ring-1 focus:ring-red-600"
            : "border-slate-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
        }`}
      />
      {error && (
        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
}

// ============================================================
// 🔧 Utilidad: Validar email
// ============================================================
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
