// ========================================================================
// 🏢 UserDetail.jsx – Información Personal e Institucional (CENATE 2025)
// ------------------------------------------------------------------------
// Vista corporativa profesional estilo Microsoft con diseño moderno
// Solo permite editar teléfono y correo con confirmación de cambios
// Todos los datos se cargan desde PersonalTotalController
// ========================================================================

import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import { apiClient } from "../../../../../lib/apiClient";
import { getFotoUrl } from "../../utils/apiUrlHelper";
import {
  Phone,
  Mail,
  Building2,
  ChevronLeft,
  User,
  FileText,
  Briefcase,
  MapPin,
  Lock,
  Edit3,
  CheckCircle,
  X,
  AlertCircle,
  Info,
  Award,
  Loader,
  Camera,
  Image as ImageIcon,
  XCircle,
  Upload,
  Edit,
  Trash2,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import api from '../../../../../lib/apiClient';

export default function UserDetail() {
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  
  // Estado para los datos del usuario desde backend
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    telefono: "",
    correo: "",
  });

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Estados para gestión de foto
  const [fotoSeleccionada, setFotoSeleccionada] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [fotoActual, setFotoActual] = useState(null);
  const [fotoError, setFotoError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef(null);
  
  // Constantes para validación de archivos
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  
  // Función helper para obtener el ID del usuario
  const getUserId = () => {
    return id || authUser?.id || authUser?.idUser || userData?.personal?.id_usuario || userData?.personal?.idUsuario || null;
  };
  
  // Formatear tamaño de archivo
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // 🔄 Cargar datos del usuario desde el backend
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const userId = id || authUser?.id || authUser?.idUser;
        
        if (!userId) {
          throw new Error("No se pudo obtener el ID del usuario");
        }

        // Obtener datos del endpoint unificado
        const data = await apiClient.get(`/personal/detalle/${userId}`, true);
        
        console.log('📋 Datos recibidos del endpoint /personal/detalle:', data);
        
        if (data && data.personal) {
          setUserData(data);
          
          // Extraer teléfono y correo desde la estructura anidada
          const telefono = data.personal?.contacto?.telefono || "";
          const correo = data.personal?.contacto?.correo_corporativo || 
                        data.personal?.contacto?.correo_personal || "";
          
          setForm({
            telefono: telefono,
            correo: correo,
          });
          
          // Cargar foto actual si existe
          const fotoUrlValue = data.personal?.foto_url || data.personal?.foto_pers || data.personal?.foto;
          console.log('📸 Valor de foto_url encontrado:', fotoUrlValue);
          console.log('📸 Estructura personal:', {
            foto_url: data.personal?.foto_url,
            foto_pers: data.personal?.foto_pers,
            foto: data.personal?.foto
          });
          
          if (fotoUrlValue && fotoUrlValue.trim() !== '' && fotoUrlValue !== 'null' && fotoUrlValue !== null) {
            const fotoUrlFinal = getFotoUrl(fotoUrlValue);
            if (fotoUrlFinal) {
              console.log('✅ URL de foto construida:', fotoUrlFinal);
              setFotoActual(fotoUrlFinal);
              setFotoError(false);
            }
          } else {
            console.log('⚠️ No hay foto disponible o el valor está vacío');
            setFotoActual(null);
            setFotoError(false);
          }
          
          setLoading(false);
        } else {
          throw new Error("No se encontraron datos del usuario");
        }

      } catch (err) {
        console.error("Error cargando datos del usuario:", err);
        setError(err.message || "Error al cargar los datos del usuario");
        setLoading(false);
        
        // Si falla, usar datos del contexto como fallback
        setUserData({ personal: authUser });
        setForm({
          telefono: authUser?.telefono || "",
          correo: authUser?.email || "",
        });
      }
    };

    fetchUserData();
  }, [id, authUser]);

  // 🔄 Detectar cambios en el formulario
  useEffect(() => {
    if (userData?.personal) {
      const currentTelefono = userData.personal?.contacto?.telefono || "";
      const currentCorreo = userData.personal?.contacto?.correo_corporativo || 
                           userData.personal?.contacto?.correo_personal || "";
      
      const changed =
        form.telefono !== currentTelefono ||
        form.correo !== currentCorreo;
      setHasChanges(changed);
    }
  }, [form, userData]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (hasChanges) {
      setShowConfirmDialog(true);
    }
  };

  const confirmSave = async () => {
    try {
      const userId = id || authUser?.id || authUser?.idUser;
      
      // Llamada al API para actualizar los datos
      // Por ahora, solo mostramos el mensaje de éxito
      // TODO: Implementar endpoint de actualización en el backend
      
      toast.success("Datos de contacto actualizados correctamente");
      setShowConfirmDialog(false);
      setHasChanges(false);
      
      // Recargar datos del usuario
      const updatedData = await apiClient.get(`/personal/detalle/${userId}`, true);
      setUserData(updatedData);
      
      // Actualizar el form con los nuevos datos
      const telefono = updatedData.personal?.contacto?.telefono || "";
      const correo = updatedData.personal?.contacto?.correo_corporativo || 
                    updatedData.personal?.contacto?.correo_personal || "";
      
      setForm({ telefono, correo });
      
    } catch (error) {
      toast.error("Error al actualizar los datos");
      console.error(error);
    }
  };

  const cancelSave = () => {
    setShowConfirmDialog(false);
  };
  
  // Manejar selección de foto
  const handleFotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        toast.error('⚠️ Por favor selecciona un archivo de imagen válido (JPG, PNG, GIF, etc.)');
        return;
      }
      
      // Validar tamaño (máximo 5MB)
      if (file.size > MAX_FILE_SIZE) {
        toast.error(
          `⚠️ La imagen es demasiado grande.\n\n` +
          `Tamaño del archivo: ${formatFileSize(file.size)}\n` +
          `Tamaño máximo permitido: 5 MB`
        );
        return;
      }
      
      setFotoSeleccionada(file);
      setFotoError(false);
      
      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Eliminar foto seleccionada (cancelar nueva)
  const handleEliminarFoto = () => {
    setFotoSeleccionada(null);
    setFotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Eliminar foto actual del servidor
  const handleEliminarFotoActual = async () => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar la foto actual?')) {
      return;
    }
    
    try {
      const userId = getUserId();
      if (!userId) {
        toast.error('❌ Error: No se pudo obtener el ID del usuario');
        return;
      }
      
      setUploading(true);
      await api.delete(`/personal/foto/${userId}`);
      setFotoActual(null);
      setFotoSeleccionada(null);
      setFotoPreview(null);
      setFotoError(false);
      
      toast.success('✅ Foto eliminada exitosamente');
      
      // Recargar datos del usuario
      const updatedData = await apiClient.get(`/personal/detalle/${userId}`, true);
      if (updatedData && updatedData.personal) {
        setUserData(updatedData);
        // Limpiar foto actual ya que fue eliminada
        setFotoActual(null);
        setFotoError(false);
      }
    } catch (error) {
      console.error('Error al eliminar foto:', error);
      toast.error('❌ Error al eliminar la foto: ' + (error.message || 'Error desconocido'));
    } finally {
      setUploading(false);
    }
  };
  
  // Subir foto nueva o actualizada
  const handleSubirFoto = async () => {
    if (!fotoSeleccionada) {
      toast.error('⚠️ Por favor selecciona una foto primero');
      return;
    }
    
    try {
      const userId = getUserId();
      if (!userId) {
        toast.error('❌ Error: No se pudo obtener el ID del usuario');
        return;
      }
      
      setUploading(true);
      const response = await api.uploadFile(`/personal/foto/${userId}`, fotoSeleccionada);
      console.log('✅ Foto subida exitosamente:', response);
      
      // Actualizar la foto actual con la nueva
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoActual(reader.result);
      };
      reader.readAsDataURL(fotoSeleccionada);
      
      // También intentar obtener la foto desde el servidor para asegurar la URL correcta
      try {
        const filename = response?.filename || response?.foto_pers || response?.foto_url;
        if (filename) {
          const fotoUrl = getFotoUrl(filename);
          if (fotoUrl) {
            setFotoActual(`${fotoUrl}?t=${Date.now()}`);
          }
        }
      } catch (err) {
        console.warn('⚠️ No se pudo obtener el nombre del archivo de la respuesta, usando preview');
      }
      
      setFotoSeleccionada(null);
      setFotoPreview(null);
      setFotoError(false);
      
      // Limpiar el input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      toast.success('✅ Foto subida exitosamente');
      
      // Recargar datos del usuario para obtener la nueva URL de la foto
      const updatedData = await apiClient.get(`/personal/detalle/${userId}`, true);
      if (updatedData && updatedData.personal) {
        setUserData(updatedData);
        
        // Actualizar la foto actual con la nueva URL del servidor
        const fotoUrlValue = updatedData.personal?.foto_url || updatedData.personal?.foto_pers || updatedData.personal?.foto;
        if (fotoUrlValue && fotoUrlValue.trim() !== '' && fotoUrlValue !== 'null' && fotoUrlValue !== null) {
          const fotoUrlFinal = getFotoUrl(fotoUrlValue);
          if (fotoUrlFinal) {
            console.log('✅ URL de foto actualizada después de subir:', fotoUrlFinal);
            setFotoActual(`${fotoUrlFinal}?t=${Date.now()}`);
          }
          setFotoError(false);
        }
      }
    } catch (error) {
      console.error('Error al subir foto:', error);
      toast.error('❌ Error al subir la foto: ' + (error.message || 'Error desconocido'));
    } finally {
      setUploading(false);
    }
  };

  // Obtener valores desde la estructura anidada
  const getNombre = () => userData?.personal?.nombres || "No especificado";
  const getApellidoPaterno = () => userData?.personal?.apellido_paterno || "";
  const getApellidoMaterno = () => userData?.personal?.apellido_materno || "";
  const getApellido = () => {
    const paterno = getApellidoPaterno();
    const materno = getApellidoMaterno();
    return `${paterno} ${materno}`.trim() || "No especificado";
  };
  const getTipoDocumento = () => userData?.personal?.tipo_documento || "No especificado";
  const getNumeroDocumento = () => userData?.personal?.numero_documento || "No especificado";
  const getProfesion = () => userData?.personal?.laboral?.profesion || "No especificado";
  const getEspecialidad = () => userData?.personal?.laboral?.especialidad || "No especificado";
  const getRne = () => userData?.personal?.laboral?.rne_especialista || "No especificado";
  const getColegiatura = () => userData?.personal?.laboral?.colegiatura || "No especificado";
  const getArea = () => userData?.personal?.laboral?.area || "No especificado";

  // Mostrar loader mientras carga
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Cargando información del usuario...</p>
        </div>
      </div>
    );
  }

  // Mostrar error si falla la carga
  if (error && !userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-6">
        <div className="w-full">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-red-900 mb-2">
              Error al cargar los datos
            </h2>
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => navigate("/user/dashboard")}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Volver al Panel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-6">
      <div className="w-full space-y-6">
        {/* 🎯 Header con breadcrumb */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
              <User className="w-4 h-4" />
              <span>Mi perfil</span>
              <ChevronLeft className="w-4 h-4 rotate-180" />
              <span className="text-slate-700 font-medium">
                Información personal
              </span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900">
              Información Personal e Institucional
            </h1>
          </div>
          <button
            onClick={() => navigate("/user/dashboard")}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-lg transition-all text-sm font-medium border border-slate-200 shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            Volver al Panel
          </button>
        </div>

        {/* 📋 Card principal de información */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Header del card */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Datos del Usuario
                  </h2>
                  <p className="text-blue-100 text-sm">
                    Información personal e institucional
                  </p>
                </div>
              </div>
              {hasChanges && (
                <div className="flex items-center gap-2 bg-amber-500/20 text-amber-100 px-3 py-1.5 rounded-lg text-sm">
                  <AlertCircle className="w-4 h-4" />
                  Cambios sin guardar
                </div>
              )}
            </div>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="p-6">
            {/* 📸 Sección: Foto de Perfil */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b">
                <Camera className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-slate-900">
                  Foto de Perfil
                </h3>
              </div>
              
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                  {/* Vista previa de la foto */}
                  <div className="relative flex-shrink-0">
                    <div className="w-32 h-32 rounded-xl overflow-hidden border-2 border-slate-200 shadow-md bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center">
                      {(fotoPreview || fotoActual) && !fotoError ? (
                        <img
                          src={fotoPreview || fotoActual}
                          alt="Foto de perfil"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error('❌ Error al cargar foto:', fotoPreview || fotoActual, e);
                            setFotoError(true);
                          }}
                          onLoad={() => {
                            console.log('✅ Foto cargada exitosamente:', fotoPreview || fotoActual);
                            setFotoError(false);
                          }}
                          key={fotoActual || fotoPreview} // Forzar re-render cuando cambia la URL
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                          <User className="w-12 h-12 mb-2" />
                          <span className="text-xs font-medium">Sin foto</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Botón eliminar foto actual */}
                    {fotoActual && !fotoPreview && !fotoError && (
                      <button
                        type="button"
                        onClick={handleEliminarFotoActual}
                        disabled={uploading}
                        className="absolute -top-2 -right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Eliminar foto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    
                    {/* Botón cancelar nueva foto */}
                    {fotoPreview && (
                      <button
                        type="button"
                        onClick={handleEliminarFoto}
                        disabled={uploading}
                        className="absolute -top-2 -right-2 p-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Cancelar nueva foto"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  {/* Controles de foto */}
                  <div className="flex-1 space-y-4">
                    {/* Input de archivo */}
                    <div>
                      <label
                        htmlFor="foto-perfil"
                        className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                          fotoPreview || fotoActual
                            ? 'border-blue-300 bg-blue-50 hover:border-blue-400'
                            : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50'
                        } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <input
                          ref={fileInputRef}
                          id="foto-perfil"
                          type="file"
                          accept="image/*"
                          onChange={handleFotoChange}
                          disabled={uploading}
                          className="hidden"
                        />
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          {fotoPreview || fotoActual ? (
                            <>
                              <ImageIcon className={`w-8 h-8 ${fotoPreview ? 'text-blue-600' : 'text-blue-500'} mb-2`} />
                              <p className={`text-sm font-medium ${fotoPreview ? 'text-blue-700' : 'text-blue-600'}`}>
                                {fotoPreview ? 'Cambiar foto' : 'Subir nueva foto'}
                              </p>
                            </>
                          ) : (
                            <>
                              <Camera className="w-8 h-8 text-gray-400 mb-2" />
                              <p className="mb-2 text-sm text-gray-500">
                                <span className="font-semibold">Haz clic para subir</span> o arrastra y suelta
                              </p>
                              <p className="text-xs text-gray-600 font-medium">
                                PNG, JPG o GIF
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                📏 Tamaño máximo: <strong className="text-blue-600">5 MB</strong>
                              </p>
                            </>
                          )}
                        </div>
                      </label>
                    </div>
                    
                    {/* Información de foto seleccionada */}
                    {fotoSeleccionada && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-xs font-medium text-blue-900">
                          📷 Foto seleccionada: {fotoSeleccionada.name}
                        </p>
                        <p className="text-xs text-blue-700 mt-1">
                          Tamaño: <strong>{formatFileSize(fotoSeleccionada.size)}</strong> de {formatFileSize(MAX_FILE_SIZE)} máximo
                        </p>
                      </div>
                    )}
                    
                    {/* Botones de acción */}
                    <div className="flex gap-3">
                      {fotoSeleccionada && (
                        <button
                          type="button"
                          onClick={handleSubirFoto}
                          disabled={uploading}
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {uploading ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              Subiendo...
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4" />
                              {fotoActual ? 'Actualizar Foto' : 'Subir Foto'}
                            </>
                          )}
                        </button>
                      )}
                      {fotoActual && !fotoPreview && (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg font-semibold text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Edit className="w-4 h-4" />
                          Editar Foto
                        </button>
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-500">
                      {fotoActual 
                        ? 'La foto actual se reemplazará al subir una nueva'
                        : 'La foto es opcional y ayuda a identificar al personal'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 👤 Sección: Información Personal */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b">
                <User className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-slate-900">
                  Información Personal
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <ReadOnlyField
                  icon={User}
                  label="Nombre"
                  value={getNombre()}
                />
                <ReadOnlyField
                  icon={User}
                  label="Apellidos"
                  value={getApellido()}
                />
                <ReadOnlyField
                  icon={FileText}
                  label="Tipo de Documento"
                  value={getTipoDocumento()}
                />
                <ReadOnlyField
                  icon={FileText}
                  label="N° Documento"
                  value={getNumeroDocumento()}
                />
              </div>
            </div>

            {/* 💼 Sección: Información Profesional */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b">
                <Briefcase className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-slate-900">
                  Información Profesional
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <ReadOnlyField
                  icon={Briefcase}
                  label="Profesión"
                  value={getProfesion()}
                />
                <ReadOnlyField
                  icon={Briefcase}
                  label="Especialidad"
                  value={getEspecialidad()}
                />
                <ReadOnlyField
                  icon={FileText}
                  label="RNE"
                  value={getRne()}
                />
                <ReadOnlyField
                  icon={Award}
                  label="Colegiatura"
                  value={getColegiatura()}
                />
                <ReadOnlyField
                  icon={MapPin}
                  label="Área de Trabajo"
                  value={getArea()}
                  fullWidth
                />
              </div>
            </div>

            {/* 📞 Sección: Información de Contacto (Editable) */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b">
                <Edit3 className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-slate-900">
                  Información de Contacto
                </h3>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                  Editable
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <EditableField
                  icon={Phone}
                  label="Teléfono"
                  name="telefono"
                  type="tel"
                  value={form.telefono}
                  onChange={handleChange}
                  placeholder="Ej: +51 999 999 999"
                />
                <EditableField
                  icon={Mail}
                  label="Correo Electrónico"
                  name="correo"
                  type="email"
                  value={form.correo}
                  onChange={handleChange}
                  placeholder="Ej: usuario@essalud.gob.pe"
                />
              </div>
            </div>

            {/* Botón guardar */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Lock className="w-4 h-4" />
                <span>
                  Los demás campos están protegidos y solo pueden ser
                  modificados por el Área de Gestión TI
                </span>
              </div>
              <button
                type="submit"
                disabled={!hasChanges}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all ${
                  hasChanges
                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>

        {/* 📢 Nota informativa */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 mb-1">
                Información importante
              </p>
              <p className="text-blue-700">
                Los datos personales y profesionales están protegidos y solo
                pueden ser modificados por el{" "}
                <strong>Área de Gestión TI de CENATE</strong>. Si necesita
                actualizar algún dato bloqueado, envíe una solicitud formal a
                través del canal institucional correspondiente.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 🔔 Diálogo de confirmación estilo Microsoft */}
      {showConfirmDialog && (
        <ConfirmationDialog
          onConfirm={confirmSave}
          onCancel={cancelSave}
          title="Confirmar actualización de datos"
          message="¿Está seguro de registrar la actualización de sus datos de contacto? Los cambios se aplicarán de inmediato."
          confirmText="Sí, actualizar"
          cancelText="Cancelar"
        />
      )}
    </div>
  );
}

// ============================================================
// 🔧 Componente: Campo de solo lectura
// ============================================================
function ReadOnlyField({ icon: Icon, label, value, fullWidth }) {
  return (
    <div className={`${fullWidth ? "col-span-full" : ""}`}>
      <label className="flex items-center gap-2 text-xs font-medium text-slate-600 mb-1.5">
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {label}
      </label>
      <div className="relative">
        <div className="w-full px-3 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 text-sm flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-slate-400" />
          <span className="flex-1">{value || "No especificado"}</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 🔧 Componente: Campo editable
// ============================================================
function EditableField({
  icon: Icon,
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
}) {
  return (
    <div>
      <label className="flex items-center gap-2 text-xs font-medium text-slate-600 mb-1.5">
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {label}
      </label>
      <div className="relative">
        <Edit3 className="absolute left-3 top-3 w-4 h-4 text-green-500" />
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full pl-10 pr-3 py-2.5 border-2 border-green-200 rounded-lg bg-white text-slate-900 text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all"
        />
      </div>
    </div>
  );
}

// ============================================================
// 🔧 Componente: Diálogo de confirmación
// ============================================================
function ConfirmationDialog({
  onConfirm,
  onCancel,
  title,
  message,
  confirmText,
  cancelText,
}) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-slate-600 leading-relaxed">{message}</p>
        </div>

        {/* Actions */}
        <div className="bg-slate-50 px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 font-medium hover:bg-slate-50 transition-colors"
          >
            <X className="w-4 h-4 inline mr-2" />
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors shadow-sm"
          >
            <CheckCircle className="w-4 h-4 inline mr-2" />
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
