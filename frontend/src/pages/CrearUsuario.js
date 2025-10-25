// ========================================================================
// 🧑‍💼 CrearUsuario.jsx – Versión final CENATE 2025 (sin AppLayout interno)
// ------------------------------------------------------------------------
// Se renderiza dentro del layout global aplicado en App.js.
// Mantiene diseño Apple/macOS, permisos MBAC y validaciones completas.
// ========================================================================

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, UserPlus, ArrowLeft, LockKeyhole } from "lucide-react";
import toast from "react-hot-toast";
import { apiClient } from "../lib/apiClient";
import { usePermissions } from "../hooks/usePermissions";
import axios from "axios";

export default function CrearUsuario() {
  const navigate = useNavigate();
  const { tienePermiso } = usePermissions();
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [profesiones, setProfesiones] = useState([]);
  const [loadingProfesiones, setLoadingProfesiones] = useState(true);
  const [regimenes, setRegimenes] = useState([]);
  const [loadingRegimenes, setLoadingRegimenes] = useState(true);
  const [especialidades, setEspecialidades] = useState([]);
  const [loadingEspecialidades, setLoadingEspecialidades] = useState(false);

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
    profesion: "",
    regimen_laboral: "",
    colegiatura: "",
    especialidad: "",
    rne: "",
  });

  // ============================================================
  // 📋 Cargar roles, profesiones y regímenes desde el backend
  // ============================================================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("auth.token");
        const headers = {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        };

        // Cargar roles
        const rolesResponse = await axios.get("http://localhost:8080/api/admin/roles", { headers });
        console.log("✅ Roles cargados:", rolesResponse.data);
        setRoles(rolesResponse.data);
        if (rolesResponse.data.length > 0) {
          setFormData(prev => ({ ...prev, rol: rolesResponse.data[0].nombreRol }));
        }
        setLoadingRoles(false);

        // Cargar profesiones
        const profesionesResponse = await axios.get("http://localhost:8080/api/profesiones", { headers });
        console.log("✅ Profesiones cargadas:", profesionesResponse.data);
        setProfesiones(profesionesResponse.data);
        if (profesionesResponse.data.length > 0) {
          setFormData(prev => ({ ...prev, profesion: profesionesResponse.data[0].idProf }));
        }
        setLoadingProfesiones(false);

        // Cargar regímenes laborales
        const regimenesResponse = await axios.get("http://localhost:8080/api/regimenes", { headers });
        console.log("✅ Regímenes cargados:", regimenesResponse.data);
        setRegimenes(regimenesResponse.data);
        if (regimenesResponse.data.length > 0) {
          setFormData(prev => ({ ...prev, regimen_laboral: regimenesResponse.data[0].idRegLab }));
        }
        setLoadingRegimenes(false);

      } catch (error) {
        console.error("❌ Error al cargar datos:", error);
        toast.error("Error al cargar datos del sistema");
        setLoadingRoles(false);
        setLoadingProfesiones(false);
        setLoadingRegimenes(false);
      }
    };

    fetchData();
  }, []);

  // ============================================================
  // 📋 Cargar especialidades cuando la profesión seleccionada es MÉDICO
  // ============================================================
  useEffect(() => {
    const cargarEspecialidades = async () => {
      const profesionSeleccionada = profesiones.find(p => p.idProf === parseInt(formData.profesion));
      const esMedico = profesionSeleccionada?.descProf?.toUpperCase().includes('MEDICO');

      if (esMedico) {
        setLoadingEspecialidades(true);
        try {
          const token = localStorage.getItem("auth.token");
          const response = await axios.get(`http://localhost:8080/api/especialidades/profesion/${formData.profesion}`, {
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          });
          console.log("✅ Especialidades cargadas:", response.data);
          setEspecialidades(response.data);
        } catch (error) {
          console.error("❌ Error al cargar especialidades:", error);
        } finally {
          setLoadingEspecialidades(false);
        }
      } else {
        setEspecialidades([]);
        setFormData(prev => ({ ...prev, especialidad: "", rne: "" }));
      }
    };

    if (formData.profesion && profesiones.length > 0) {
      cargarEspecialidades();
    }
  }, [formData.profesion, profesiones]);

  // ============================================================
  // 📸 Manejo de foto
  // ============================================================
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

  // ============================================================
  // 🧠 Manejo de formulario
  // ============================================================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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
      navigate("/admin/usuarios");
    } catch (error) {
      toast.error(error.message || "Error al crear usuario");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // 🔒 Verificar permiso MBAC
  // ============================================================
  const puedeCrear = tienePermiso("/admin/users", "crear");

  // ============================================================
  // 🧱 Render principal
  // ============================================================
  return (
    <div className="p-8 bg-[var(--bg-main)] transition-colors">
      {!puedeCrear ? (
        // 🔐 Sin permisos
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <LockKeyhole className="w-16 h-16 text-[var(--text-secondary)] mb-4" />
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
            Acceso denegado
          </h2>
          <p className="text-[var(--text-secondary)]">
            No tienes permisos para crear usuarios.
          </p>
          <button
            onClick={() => navigate("/admin/usuarios")}
            className="mt-6 px-6 py-2.5 rounded-lg border border-[var(--border-color)]
                       bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)]
                       transition-all"
          >
            Volver
          </button>
        </div>
      ) : (
        // 🧩 Formulario de creación
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-info)] rounded-t-2xl px-8 py-6">
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
                    <Camera size={20} className="text-[var(--color-primary)]" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Crear Usuario
                  </h2>
                  <p className="text-blue-100 text-sm mt-1">
                    Completa el formulario para registrar un nuevo usuario
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate("/admin/usuarios")}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg transition-all flex items-center gap-2 border border-white/30"
              >
                <ArrowLeft size={18} />
                Volver
              </button>
            </div>
          </div>

          {/* Formulario */}
          <form
            onSubmit={handleSubmit}
            className="bg-[var(--bg-card)]/70 rounded-b-2xl border border-[var(--border-color)] border-t-0 p-8 space-y-8 backdrop-blur-sm"
          >
            {/* Credenciales */}
            <Section title="Credenciales de Acceso">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  label="Usuario *"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
                <FormField
                  label="Contraseña *"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <FormField
                  label="Confirmar Contraseña *"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </Section>

            {/* Información Personal */}
            <Section title="Información Personal">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  label="Nombres *"
                  name="nombres"
                  value={formData.nombres}
                  onChange={handleChange}
                  required
                />
                <FormField
                  label="Apellido Paterno *"
                  name="apellido_paterno"
                  value={formData.apellido_paterno}
                  onChange={handleChange}
                  required
                />
                <FormField
                  label="Apellido Materno"
                  name="apellido_materno"
                  value={formData.apellido_materno}
                  onChange={handleChange}
                />
                <FormField
                  label="Número de Documento *"
                  name="numero_documento"
                  value={formData.numero_documento}
                  onChange={handleChange}
                  required
                />
                <FormSelect
                  label="Tipo de Documento"
                  name="tipo_documento"
                  value={formData.tipo_documento}
                  onChange={handleChange}
                >
                  <option value="DNI">DNI</option>
                  <option value="CE">Carnet de Extranjería</option>
                  <option value="PASAPORTE">Pasaporte</option>
                </FormSelect>
                <FormSelect
                  label="Género"
                  name="genero"
                  value={formData.genero}
                  onChange={handleChange}
                >
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </FormSelect>
              </div>
            </Section>

            {/* Contacto */}
            <Section title="Información de Contacto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  label="Teléfono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                />
                <FormField
                  label="Email Personal"
                  name="correo_personal"
                  type="email"
                  value={formData.correo_personal}
                  onChange={handleChange}
                />
                <FormField
                  label="Email Corporativo"
                  name="correo_corporativo"
                  type="email"
                  value={formData.correo_corporativo}
                  onChange={handleChange}
                />
              </div>
            </Section>

            {/* Rol */}
            <Section title="Rol del Sistema">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormSelect
                  label="Rol *"
                  name="rol"
                  value={formData.rol}
                  onChange={handleChange}
                  disabled={loadingRoles}
                >
                  {loadingRoles ? (
                    <option>Cargando roles...</option>
                  ) : roles.length === 0 ? (
                    <option>No hay roles disponibles</option>
                  ) : (
                    roles.map(role => (
                      <option key={role.idRol} value={role.nombreRol}>
                        {role.descRol} {role.admin ? '(Admin)' : ''}
                      </option>
                    ))
                  )}
                </FormSelect>
              </div>
            </Section>

            {/* Botones */}
            <div className="flex gap-3 justify-end pt-6 border-t border-[var(--border-color)]">
              <button
                onClick={() => navigate("/admin/usuarios")}
                type="button"
                className="px-6 py-2.5 rounded-lg border border-[var(--border-color)]
                         bg-[var(--bg-card)] hover:bg-[var(--bg-hover)]
                         text-[var(--text-primary)] transition-all"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-lg font-bold flex items-center gap-2
                         text-white transition-all disabled:opacity-50 shadow-lg
                         bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-info)]
                         hover:from-[var(--color-primary-dark)] hover:to-[var(--color-info)]"
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
  );
}

// ========================================================================
// 🧱 Componentes auxiliares
// ========================================================================
function Section({ title, children }) {
  return (
    <div>
      <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 pb-2 border-b-2 border-[var(--color-primary)]/50">
        {title}
      </h3>
      {children}
    </div>
  );
}

function FormField({ label, name, value, onChange, type = "text", required = false }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-4 py-3 rounded-lg border border-[var(--border-color)]
                   bg-[var(--bg-main)]/60 text-[var(--text-primary)]
                   focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)]
                   placeholder:text-[var(--text-secondary)]/60 transition-all"
      />
    </div>
  );
}

function FormSelect({ label, name, value, onChange, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
        {label}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 rounded-lg border border-[var(--border-color)]
                   bg-[var(--bg-main)]/60 text-[var(--text-primary)]
                   focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)]
                   transition-all"
      >
        {children}
      </select>
    </div>
  );
}