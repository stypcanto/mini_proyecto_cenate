// ========================================================================
// 🎴 CardMedicoModal.jsx – Modal para Crear/Editar Cards del Dashboard Médico
// ------------------------------------------------------------------------
// Componente modal para crear y editar cards del Dashboard Médico.
// ========================================================================

import React, { useEffect, useState } from "react";
import { X, Save, Loader2, Image as ImageIcon, Palette, Link2, FileText, Hash } from "lucide-react";

// Lista de imágenes disponibles en /public/images/iconos/
const IMAGENES_DISPONIBLES = [
  "ACCESO.png",
  "Anatomia patologica.svg",
  "BASE DE DATOS.png",
  "DRIVE.png",
  "folder.png",
  "GESTION TERRITORIAL.png",
  "icon_radiologia.png",
  "Iconos_ESSI.svg",
  "Iconos_Estadisticas de produccion.svg",
  "Iconos_Imagenes - teleconsulta.svg",
  "Iconos_Informacion de las IPRESS.svg",
  "Iconos_Informacion para personal asistencial.svg",
  "Iconos_listado de pacientes TC A-N.svg",
  "Iconos_listado de pacientes TC de Oncolog¡a.svg",
  "Iconos_listado de pacientes TC O-Z.svg",
  "Iconos_listado de pacientes TM.svg",
  "Iconos_listado de pacientes TO.svg",
  "Iconos_Mesa de ayuda.svg",
  "Iconos_Protocolo de contacto y atencion.svg",
  "Presentación.png",
  "RECURSOS REMOTO.png",
  "Referencia.svg",
  "TELECERT.png",
  "token usb.png",
  "Video.png",
  "WhatsApp.png",
  "Zoom.svg"
];

// Colores predefinidos
const COLORES_DISPONIBLES = [
  { label: "Azul CENATE", value: "#0A5BA9" },
  { label: "Verde", value: "#16A34A" },
  { label: "Azul Claro", value: "#3B82F6" },
  { label: "Púrpura", value: "#7C3AED" },
  { label: "Naranja", value: "#F59E0B" },
  { label: "Rojo", value: "#EF4444" },
  { label: "Cian", value: "#06B6D4" },
  { label: "Rosa", value: "#EC4899" },
];

export default function CardMedicoModal({ isOpen, onClose, onSave, card = null }) {
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageKey, setImageKey] = useState(0);
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    link: "",
    icono: "ACCESO.png", // Cambiar a nombre de imagen por defecto
    color: "#0A5BA9",
    orden: 0,
    activo: true,
    targetBlank: true, // Por defecto siempre abrir en nueva ventana
  });

  useEffect(() => {
    if (card) {
      setFormData({
        titulo: card.titulo || "",
        descripcion: card.descripcion || "",
        link: card.link || "",
        icono: card.icono || "ACCESO.png",
        color: card.color || "#0A5BA9",
        orden: card.orden || 0,
        activo: card.activo !== undefined ? card.activo : true,
        targetBlank: card.targetBlank !== undefined ? card.targetBlank : true, // Respetar valor guardado, sino true por defecto
      });
    } else {
      // Reset form for new card
      setFormData({
        titulo: "",
        descripcion: "",
        link: "",
        icono: "ACCESO.png",
        color: "#0A5BA9",
        orden: 0,
        activo: true,
        targetBlank: true, // Siempre true por defecto para nuevas cards
      });
    }
      // Resetear error de imagen cuando cambia el modal
    setImageError(false);
    setImageLoading(true);
    setImageKey(0);
  }, [card, isOpen]);

  // Resetear error de imagen y forzar re-render cuando cambia el icono
  useEffect(() => {
    if (!formData.icono) return;
    
    setImageError(false);
    setImageLoading(true);
    setImageKey(prev => prev + 1); // Incrementar key para forzar re-render
    
    // Pre-cargar la imagen para verificar si existe
    const img = new Image();
    const imagenPath = `/images/iconos/${formData.icono}`;
    
    img.onload = () => {
      console.log("✅ Imagen pre-cargada correctamente:", imagenPath);
      setImageLoading(false);
      setImageError(false);
    };
    
    img.onerror = () => {
      console.error("❌ Error al pre-cargar imagen:", imagenPath);
      setImageError(true);
      setImageLoading(false);
    };
    
    img.src = imagenPath;
    
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [formData.icono]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.titulo.trim()) {
      alert("El título es requerido");
      return;
    }
    
    if (!formData.link.trim()) {
      alert("El link es requerido");
      return;
    }

    if (!formData.icono.trim()) {
      alert("El icono es requerido");
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Error al guardar card:", error);
      alert("Error al guardar la card: " + (error.message || "Error desconocido"));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Ruta de la imagen seleccionada con timestamp para evitar caché
  const imagenPath = `/images/iconos/${formData.icono}?v=${imageKey}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col animate-scaleIn">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-[#0A5BA9] to-[#2563EB] px-8 py-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {card ? "✏️ Editar Card" : "➕ Crear Nueva Card"}
            </h2>
            <p className="text-blue-100 text-sm mt-1">
              {card ? "Modifica los detalles de la card" : "Configura una nueva card para el Dashboard Médico"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-xl transition-colors text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form con scroll */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6">
          {/* Título */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              <FileText className="w-4 h-4 text-[#0A5BA9]" />
              Título <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl 
                       bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                       focus:ring-2 focus:ring-[#0A5BA9] focus:border-[#0A5BA9] transition-all
                       placeholder:text-slate-400"
              placeholder="Ej: Ubicaciones de Teleconsultorios y PC"
              required
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              <FileText className="w-4 h-4 text-[#0A5BA9]" />
              Descripción
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl 
                       bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                       focus:ring-2 focus:ring-[#0A5BA9] focus:border-[#0A5BA9] transition-all resize-none
                       placeholder:text-slate-400"
              rows="3"
              placeholder="Ej: Para Teleconsulta y Teleorientación"
            />
          </div>

          {/* Link/Ruta */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              <Link2 className="w-4 h-4 text-[#0A5BA9]" />
              Link/Ruta <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl 
                       bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                       focus:ring-2 focus:ring-[#0A5BA9] focus:border-[#0A5BA9] transition-all
                       placeholder:text-slate-400"
              placeholder="Ej: /roles/medico/teleconsultorios o https://ejemplo.com"
              required
            />
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-slate-400"></span>
              Puede ser una ruta interna (ej: /ruta) o una URL externa (ej: https://...)
            </p>
          </div>

          {/* Imagen y Color - Diseño mejorado */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Imagen con vista previa grande */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                <ImageIcon className="w-4 h-4 text-[#0A5BA9]" />
                Imagen <span className="text-red-500">*</span>
              </label>
              
              {/* Vista previa grande de la imagen */}
              <div className="mb-4 p-6 border-2 border-slate-200 dark:border-slate-600 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 flex flex-col items-center justify-center min-h-[200px]">
                <div
                  className="w-24 h-24 rounded-2xl flex items-center justify-center mb-4 shadow-lg transition-all duration-300 relative"
                  style={{ backgroundColor: `${formData.color}25` }}
                >
                  {imageLoading && !imageError && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-[#0A5BA9] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                  {imageError ? (
                    <div className="w-20 h-20 rounded-xl bg-slate-300 dark:bg-slate-600 flex items-center justify-center">
                      <span className="text-2xl text-slate-500">?</span>
                    </div>
                  ) : (
                    <img
                      key={`${formData.icono}-${imageKey}`} // Key único para forzar re-render cuando cambia
                      src={imagenPath}
                      alt={formData.icono}
                      className={`w-20 h-20 object-contain transition-all duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                      onError={(e) => {
                        console.error("Error al cargar imagen:", imagenPath);
                        setImageError(true);
                        setImageLoading(false);
                      }}
                      onLoad={() => {
                        console.log("Imagen cargada correctamente:", imagenPath);
                        setImageError(false);
                        setImageLoading(false);
                      }}
                    />
                  )}
                </div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 text-center px-4 break-words">
                  {formData.icono}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Vista previa del icono
                </p>
              </div>

              {/* Selector de imagen */}
              <select
                value={formData.icono}
                onChange={(e) => setFormData({ ...formData, icono: e.target.value })}
                className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl 
                         bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                         focus:ring-2 focus:ring-[#0A5BA9] focus:border-[#0A5BA9] transition-all
                         cursor-pointer"
                required
              >
                {IMAGENES_DISPONIBLES.map((imagen) => (
                  <option key={imagen} value={imagen}>
                    {imagen}
                  </option>
                ))}
              </select>
            </div>

            {/* Color */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                <Palette className="w-4 h-4 text-[#0A5BA9]" />
                Color de fondo
              </label>
              
              {/* Vista previa del color */}
              <div className="mb-4 p-6 border-2 border-slate-200 dark:border-slate-600 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 flex flex-col items-center justify-center min-h-[200px]">
                <div
                  className="w-24 h-24 rounded-2xl shadow-lg mb-4 transition-all duration-300"
                  style={{ backgroundColor: formData.color }}
                ></div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {COLORES_DISPONIBLES.find(c => c.value === formData.color)?.label || formData.color}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
                  {formData.color}
                </p>
              </div>

              {/* Selector de color */}
              <select
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl 
                         bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                         focus:ring-2 focus:ring-[#0A5BA9] focus:border-[#0A5BA9] transition-all
                         cursor-pointer"
              >
                {COLORES_DISPONIBLES.map((color) => (
                  <option key={color.value} value={color.value}>
                    {color.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Orden y checkboxes - Diseño mejorado */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Orden */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                <Hash className="w-4 h-4 text-[#0A5BA9]" />
                Orden de visualización
              </label>
              <input
                type="number"
                value={formData.orden}
                onChange={(e) => setFormData({ ...formData, orden: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl 
                         bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                         focus:ring-2 focus:ring-[#0A5BA9] focus:border-[#0A5BA9] transition-all"
                min="0"
              />
            </div>

            {/* Activo */}
            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-3 cursor-pointer p-4 border-2 border-slate-200 dark:border-slate-600 rounded-xl hover:border-[#0A5BA9] transition-all bg-white dark:bg-slate-700">
                <input
                  type="checkbox"
                  checked={formData.activo}
                  onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                  className="w-5 h-5 text-[#0A5BA9] rounded focus:ring-[#0A5BA9] cursor-pointer"
                />
                <div>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 block">
                    Activo
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Mostrar en el dashboard
                  </span>
                </div>
              </label>
            </div>

            {/* Target Blank */}
            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-3 cursor-pointer p-4 border-2 border-slate-200 dark:border-slate-600 rounded-xl hover:border-[#0A5BA9] transition-all bg-white dark:bg-slate-700">
                <input
                  type="checkbox"
                  checked={formData.targetBlank}
                  onChange={(e) => setFormData({ ...formData, targetBlank: e.target.checked })}
                  className="w-5 h-5 text-[#0A5BA9] rounded focus:ring-[#0A5BA9] cursor-pointer"
                />
                <div>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 block">
                    Nueva pestaña
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Abrir en nueva ventana
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Actions - Botones mejorados */}
          <div className="flex justify-end gap-4 pt-6 border-t-2 border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-slate-700 dark:text-slate-300 font-semibold 
                       hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all
                       border-2 border-slate-200 dark:border-slate-600 hover:border-slate-300"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-[#0A5BA9] to-[#2563EB] hover:from-[#2563EB] hover:to-[#3B82F6] 
                       text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl
                       flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Guardar Card
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

