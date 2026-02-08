// src/pages/roles/gestionterritorial/RespuestasSolicitudes.jsx
import React, { useEffect, useState } from "react";
import { FileText, Loader2 } from "lucide-react";
import TabSolicitudes from "../coordinador/gestion-periodos/components/TabSolicitudes";
import { solicitudTurnosService } from "../../../services/solicitudTurnosService";
import { getEstadoBadgeDefault } from "../coordinador/gestion-periodos/utils/ui";

export default function RespuestasSolicitudes() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    estado: "TODAS",
    periodo: "",
    busqueda: "",
    macroId: "",
    redId: "",
    ipressId: "",
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      // Cargar solicitudes
      const dataSolicitudes = await solicitudTurnosService.obtenerTodas(filtros);
      const list = Array.isArray(dataSolicitudes)
        ? dataSolicitudes
        : Array.isArray(dataSolicitudes?.content)
        ? dataSolicitudes.content
        : [];
      setSolicitudes(list);

      // Cargar periodos (puedes obtenerlos de un servicio si existe)
      // Por ahora usamos array vacío, el componente TabSolicitudes lo maneja
      setPeriodos([]);
    } catch (err) {
      console.error("Error al cargar datos:", err);
      setSolicitudes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVerDetalle = (solicitud) => {
    // En modo read-only, puedes redirigir a una vista de detalles sin permisos de edición
    console.log("Ver detalle (read-only):", solicitud);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Respuestas de los Requerimientos de las IPRESS
          </h1>
          <p className="text-gray-600">
            Consulte el estado de las respuestas enviadas por las IPRESS
          </p>
        </div>

        {/* Contenedor Principal */}
        {loading ? (
          <div className="flex items-center justify-center py-12 bg-white rounded-lg">
            <div className="text-center">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" />
              <p className="text-sm text-gray-600">Cargando datos...</p>
            </div>
          </div>
        ) : solicitudes.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
            <FileText className="w-16 h-16 mx-auto mb-3 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              No se encontraron solicitudes
            </h3>
            <p className="text-sm text-gray-500">
              No hay respuestas disponibles en este momento
            </p>
          </div>
        ) : (
          <TabSolicitudes
            solicitudes={solicitudes}
            loading={loading}
            filtros={filtros}
            setFiltros={setFiltros}
            onVerDetalle={handleVerDetalle}
            onAprobar={() => {}} // No hacer nada en modo read-only
            onRechazar={() => {}} // No hacer nada en modo read-only
            getEstadoBadge={getEstadoBadgeDefault}
            periodos={periodos}
            onConsultar={() => {}}
            readOnly={true} // Modo read-only
          />
        )}
      </div>
    </div>
  );
}
