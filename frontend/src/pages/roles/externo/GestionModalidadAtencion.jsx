import React, { useEffect, useState } from "react";
import { AlertCircle, Check, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import ipressService from "../../../services/ipressService";

/**
 * 📋 GestionModalidadAtencion - Permite a Personal Externo actualizar la Modalidad de Atención de su IPRESS
 * @author Claude Code + Styp Canto Rondón
 */
export default function GestionModalidadAtencion() {
  // Toast helper usando react-hot-toast
  const showToast = (message, type) => {
    if (type === "success") {
      toast.success(message);
    } else if (type === "error") {
      toast.error(message);
    } else {
      toast(message);
    }
  };

  // Estados
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [miIpress, setMiIpress] = useState(null);
  const [modalidades, setModalidades] = useState([]);
  const [formData, setFormData] = useState({
    idModAten: "",
    detallesTeleconsulta: "",
    detallesTeleconsultorio: "",
  });
  const [errors, setErrors] = useState({});
  const [mostrarGuardadoReciente, setMostrarGuardadoReciente] = useState(false);

  /**
   * Obtiene el ID de la modalidad MIXTA
   */
  const getIdModalidadMixta = () => {
    if (!modalidades || !Array.isArray(modalidades) || modalidades.length === 0) {
      return null;
    }
    const modMixta = modalidades.find((mod) => mod && mod.descModAten === "MIXTA");
    return modMixta && modMixta.idModAten ? modMixta.idModAten.toString() : null;
  };

  /**
   * Valida si la modalidad seleccionada es MIXTA
   */
  const esModalidadMixta = () => {
    return formData.idModAten === getIdModalidadMixta();
  };

  /**
   * Carga la IPRESS del usuario y las modalidades disponibles
   */
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);

        // Cargar IPRESS del usuario logueado
        const dataIpress = await ipressService.obtenerMiIpress();
        setMiIpress(dataIpress.data || dataIpress);

        // Cargar modalidades activas
        const dataModalidades = await ipressService.obtenerModalidadesActivas();
        console.log("📋 Modalidades cargadas:", dataModalidades);
        console.log("📋 Primer elemento:", dataModalidades[0] || "N/A");
        setModalidades(dataModalidades || []);

        // Inicializar formulario con modalidad actual
        if (dataIpress.data || dataIpress) {
          const ipress = dataIpress.data || dataIpress;
          setFormData({
            idModAten: ipress.idModAten ? ipress.idModAten.toString() : "",
            detallesTeleconsulta: ipress.detallesTeleconsulta || "",
            detallesTeleconsultorio: ipress.detallesTeleconsultorio || "",
          });
        }
      } catch (err) {
        showToast(
          err.message || "Error al cargar los datos",
          "error"
        );
        console.error("Error al cargar datos:", err);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  /**
   * Valida los datos del formulario
   */
  const validarFormulario = () => {
    const newErrors = {};

    if (!formData.idModAten) {
      newErrors.idModAten = "Debe seleccionar una modalidad de atención";
    }

    if (esModalidadMixta()) {
      if (!formData.detallesTeleconsulta.trim()) {
        newErrors.detallesTeleconsulta = "Los detalles de TELECONSULTA son obligatorios para modalidad MIXTA";
      }
      if (!formData.detallesTeleconsultorio.trim()) {
        newErrors.detallesTeleconsultorio = "Los detalles de TELECONSULTORIO son obligatorios para modalidad MIXTA";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Maneja el cambio de la modalidad seleccionada
   */
  const handleModalidadChange = (e) => {
    const newIdModAten = e.target.value;
    setFormData({
      idModAten: newIdModAten,
      detallesTeleconsulta: "",
      detallesTeleconsultorio: "",
    });
    setErrors({});
  };

  /**
   * Maneja el cambio de los detalles
   */
  const handleDetallesChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  /**
   * Guarda los cambios en la base de datos
   */
  const handleGuardar = async () => {
    if (!validarFormulario()) {
      return;
    }

    try {
      setSaving(true);
      await ipressService.actualizarMiModalidad({
        idModAten: parseInt(formData.idModAten),
        detallesTeleconsulta: formData.detallesTeleconsulta || null,
        detallesTeleconsultorio: formData.detallesTeleconsultorio || null,
      });

      showToast("✅ Modalidad de atención actualizada exitosamente", "success");

      // Recargar IPRESS actualizada
      const dataIpress = await ipressService.obtenerMiIpress();
      const ipress = dataIpress.data || dataIpress;
      setMiIpress(ipress);

      // Actualizar formulario con datos frescos
      setFormData({
        idModAten: ipress.idModAten ? ipress.idModAten.toString() : "",
        detallesTeleconsulta: ipress.detallesTeleconsulta || "",
        detallesTeleconsultorio: ipress.detallesTeleconsultorio || "",
      });

      // Mostrar indicador de guardado por 5 segundos
      setMostrarGuardadoReciente(true);
      setTimeout(() => setMostrarGuardadoReciente(false), 5000);
    } catch (err) {
      showToast(
        err.message || "Error al actualizar la modalidad de atención",
        "error"
      );
      console.error("Error al guardar:", err);
    } finally {
      setSaving(false);
    }
  };

  /**
   * Recarga los datos desde el servidor
   */
  const handleRecargar = async () => {
    try {
      setLoading(true);
      const dataIpress = await ipressService.obtenerMiIpress();
      const ipress = dataIpress.data || dataIpress;
      setMiIpress(ipress);

      setFormData({
        idModAten: ipress.idModAten ? ipress.idModAten.toString() : "",
        detallesTeleconsulta: ipress.detallesTeleconsulta || "",
        detallesTeleconsultorio: ipress.detallesTeleconsultorio || "",
      });
      setErrors({});
      showToast("Datos recargados correctamente", "success");
    } catch (err) {
      showToast(err.message || "Error al recargar los datos", "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-slate-200 rounded-lg"></div>
          <div className="h-32 bg-slate-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!miIpress) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900">Error</h3>
            <p className="text-red-700 text-sm">No se encontró IPRESS asignada a su usuario</p>
          </div>
        </div>
      </div>
    );
  }

  const modalidadActual = modalidades.find(
    (m) => m && m.idModAten && m.idModAten.toString() === formData.idModAten
  );

  return (
    <div className="p-6 space-y-6">
      {/* Card 1: Información de la IPRESS */}
      <div className="bg-white rounded-lg shadow border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Información de su Institución
          </h2>
          {mostrarGuardadoReciente && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold border border-green-300 animate-pulse">
              <Check className="w-3 h-3" />
              Guardado
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">
              Código IPRESS
            </label>
            <p className="text-sm text-slate-900">{miIpress.codIpress || "No especificado"}</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">
              ID IPRESS
            </label>
            <p className="text-sm text-slate-900">{miIpress.idIpress || "No especificado"}</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">
              Nombre
            </label>
            <p className="text-sm text-slate-900">{miIpress.descIpress || "No especificado"}</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">
              Red de Salud
            </label>
            <p className="text-sm text-slate-900">
              {miIpress.red?.descRed || "No especificada"}
            </p>
          </div>
          <div className="col-span-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">
              Modalidad Actual
            </label>
            <div className="inline-block px-4 py-2 bg-blue-100 border-2 border-blue-500 rounded-lg mb-4">
              <p className="text-sm font-semibold text-blue-900">
                {miIpress.nombreModalidadAtencion || "No especificada"}
              </p>
            </div>

            {/* Mostrar detalles si es MIXTA */}
            {miIpress.idModAten === 3 && (
              <div className="mt-4 space-y-4">
                {miIpress.detallesTeleconsulta && (
                  <div className="bg-green-50 border border-green-300 rounded-lg p-4">
                    <p className="text-xs font-bold text-green-800 mb-2 flex items-center gap-2">
                      <span className="w-5 h-5 flex items-center justify-center bg-green-200 rounded-full text-xs">✓</span>
                      Detalles TELECONSULTA
                    </p>
                    <p className="text-sm text-green-700 whitespace-pre-wrap">
                      {miIpress.detallesTeleconsulta}
                    </p>
                  </div>
                )}
                {miIpress.detallesTeleconsultorio && (
                  <div className="bg-purple-50 border border-purple-300 rounded-lg p-4">
                    <p className="text-xs font-bold text-purple-800 mb-2 flex items-center gap-2">
                      <span className="w-5 h-5 flex items-center justify-center bg-purple-200 rounded-full text-xs">✓</span>
                      Detalles TELECONSULTORIO
                    </p>
                    <p className="text-sm text-purple-700 whitespace-pre-wrap">
                      {miIpress.detallesTeleconsultorio}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card 2: Formulario de Actualización */}
      <div className="bg-white rounded-lg shadow border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Actualizar Modalidad de Atención
        </h2>
        <div className="space-y-4">
          {/* Debug */}
          {(() => {
            console.log("🔍 Render modalidades:", modalidades);
            console.log("🔍 Filtered:", modalidades?.filter(mod => mod && mod.idModAten));
            return null;
          })()}
          {/* Selector de Modalidad */}
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">
              Modalidad de Atención *
            </label>
            <select
              value={formData.idModAten}
              onChange={handleModalidadChange}
              disabled={saving}
              className={`w-full px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${
                errors.idModAten
                  ? "border-red-300 bg-red-50 text-red-900"
                  : "border-slate-300 bg-white text-slate-900"
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">-- Seleccionar modalidad --</option>
              {modalidades && Array.isArray(modalidades) && modalidades.length > 0 ? modalidades.filter(mod => mod && mod.idModAten).map((mod) => (
                <option key={mod.idModAten} value={mod.idModAten.toString()}>
                  {mod.descModAten}
                </option>
              )) : null}
            </select>
            {errors.idModAten && (
              <p className="text-red-600 text-xs mt-1">{errors.idModAten}</p>
            )}
          </div>

          {/* Detalles MIXTA - Solo aparecen cuando se selecciona MIXTA */}
          {esModalidadMixta() && (
            <>
              <div className="mt-6 pt-6 border-t-2 border-slate-300">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg p-6 space-y-5">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-200 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-blue-700" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-blue-900">
                        Detalles de Modalidad MIXTA (Obligatorios)
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        Especifique los horarios y disponibilidad para ambos tipos de atención
                      </p>
                    </div>
                  </div>

                  {/* Detalles Teleconsulta */}
                  <div className="bg-white rounded-lg p-4 border border-slate-200">
                    <label className="text-sm font-bold text-slate-800 mb-2 block flex items-center gap-2">
                      <span className="w-6 h-6 flex items-center justify-center bg-green-100 text-green-700 rounded-full text-xs font-bold">1</span>
                      Detalles de TELECONSULTA *
                    </label>
                    <p className="text-xs text-slate-600 mb-3">
                      Horarios, especialidades, disponibilidad, condiciones especiales, etc.
                    </p>
                    <textarea
                      name="detallesTeleconsulta"
                      value={formData.detallesTeleconsulta}
                      onChange={handleDetallesChange}
                      disabled={saving}
                      rows="4"
                      maxLength="1000"
                      placeholder="Ej: Lunes a Viernes 8AM-5PM - Terapia Física, paciente en domicilio, consulta sin video"
                      className={`w-full px-4 py-3 border rounded-lg text-sm transition-colors resize-none ${
                        errors.detallesTeleconsulta
                          ? "border-red-400 bg-red-50 text-red-900 focus:ring-red-500"
                          : "border-slate-300 bg-white text-slate-900 focus:ring-green-500"
                      } focus:outline-none focus:ring-2`}
                    />
                    <div className="flex justify-between items-center mt-2">
                      {errors.detallesTeleconsulta && (
                        <p className="text-red-600 text-xs font-semibold">{errors.detallesTeleconsulta}</p>
                      )}
                      <span className="text-xs text-slate-500 ml-auto">
                        {formData.detallesTeleconsulta.length}/1000
                      </span>
                    </div>
                  </div>

                  {/* Detalles Teleconsultorio */}
                  <div className="bg-white rounded-lg p-4 border border-slate-200">
                    <label className="text-sm font-bold text-slate-800 mb-2 block flex items-center gap-2">
                      <span className="w-6 h-6 flex items-center justify-center bg-purple-100 text-purple-700 rounded-full text-xs font-bold">2</span>
                      Detalles de TELECONSULTORIO *
                    </label>
                    <p className="text-xs text-slate-600 mb-3">
                      Horarios, especialidades, disponibilidad, condiciones especiales, etc.
                    </p>
                    <textarea
                      name="detallesTeleconsultorio"
                      value={formData.detallesTeleconsultorio}
                      onChange={handleDetallesChange}
                      disabled={saving}
                      rows="4"
                      maxLength="1000"
                      placeholder="Ej: 7AM-1PM Cardiología con video, sin disponibilidad tardes, requiere equipamiento especial"
                      className={`w-full px-4 py-3 border rounded-lg text-sm transition-colors resize-none ${
                        errors.detallesTeleconsultorio
                          ? "border-red-400 bg-red-50 text-red-900 focus:ring-red-500"
                          : "border-slate-300 bg-white text-slate-900 focus:ring-purple-500"
                      } focus:outline-none focus:ring-2`}
                    />
                    <div className="flex justify-between items-center mt-2">
                      {errors.detallesTeleconsultorio && (
                        <p className="text-red-600 text-xs font-semibold">{errors.detallesTeleconsultorio}</p>
                      )}
                      <span className="text-xs text-slate-500 ml-auto">
                        {formData.detallesTeleconsultorio.length}/1000
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Botones de Acción */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleGuardar}
              disabled={saving}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium text-sm text-white transition-colors ${
                saving
                  ? "bg-slate-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
              }`}
            >
              <Check className="w-4 h-4" />
              {saving ? "Guardando..." : "Guardar Cambios"}
            </button>
            <button
              onClick={handleRecargar}
              disabled={saving}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium text-sm border-2 border-slate-300 text-slate-700 transition-colors ${
                saving
                  ? "bg-slate-50 cursor-not-allowed"
                  : "hover:bg-slate-50 active:bg-slate-100"
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              Recargar
            </button>
          </div>
        </div>
      </div>

      {/* Card 3: Información de Ayuda */}
      <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-2">ℹ️ Información</h3>
        <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
          <li>Puede actualizar la modalidad de atención de su institución las veces que sea necesario</li>
          <li>Si selecciona MIXTA, debe proporcionar detalles de ambas modalidades (Teleconsulta y Teleconsultorio)</li>
          <li>Los cambios se guardarán inmediatamente en la base de datos</li>
        </ul>
      </div>
    </div>
  );
}
