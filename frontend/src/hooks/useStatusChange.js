import { useCallback, useRef } from 'react';
import toast from 'react-hot-toast';

/**
 * Hook para cambiar estado de paciente con patrón Undo
 *
 * UX Pattern: Cambio optimista + Toast con Undo (5s) + Backend call
 * Basado en: Gmail, Slack, Trello
 *
 * @param {Function} onStatusChange - Callback para actualizar UI localmente
 * @param {Function} onStatusChangedBackend - API call para actualizar backend
 */
export const useStatusChange = (onStatusChange, onStatusChangedBackend) => {
  const timeoutRef = useRef(null);
  const toastRef = useRef(null);

  const changeStatus = useCallback(
    async (pacienteId, newStatus, previousStatus, pacienteNombre) => {
      console.log("📋 changeStatus INICIADO");
      console.log("  pacienteId:", pacienteId);
      console.log("  newStatus:", newStatus);
      console.log("  previousStatus:", previousStatus);
      console.log("  pacienteNombre:", pacienteNombre);
      
      // Limpiar toast y timeout previos si existen
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (toastRef.current) {
        toast.dismiss(toastRef.current);
      }

      // 1️⃣ CAMBIO OPTIMISTA - Actualizar UI inmediatamente (sin esperar backend)
      console.log("1️⃣ Actualizando UI localmente (optimistic)");
      onStatusChange(pacienteId, newStatus);

      // 2️⃣ MOSTRAR TOAST CON UNDO (5 segundos) - Verde suave
      console.log("2️⃣ Mostrando toast con Undo");
      toastRef.current = toast((t) => (
        <div className="flex items-center justify-between gap-4 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex-1">
            <p className="font-semibold text-green-900">✅ Estado actualizado</p>
            <p className="text-sm text-green-800">
              {pacienteNombre}: <span className="font-bold text-green-700">{newStatus}</span>
            </p>
          </div>
          <button
            onClick={() => {
              console.log("↶ Usuario hizo clic en Deshacer");
              // DESHACER: Restaurar estado anterior
              onStatusChange(pacienteId, previousStatus);
              toast.dismiss(t.id);
              toast.success('Cambio deshecho', { duration: 3000 });

              // Limpiar timeout del backend
              if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
              }
            }}
            className="px-3 py-1 bg-white text-green-600 border border-green-300 rounded hover:bg-green-100 font-medium text-sm whitespace-nowrap transition-colors"
          >
            ↶ Deshacer
          </button>
        </div>
      ), {
        duration: 5000,
        position: 'bottom-right',
        style: {
          background: 'transparent',
          boxShadow: 'none',
          padding: '0'
        }
      });

      // 3️⃣ COMMIT AL BACKEND DESPUÉS DE 5 SEGUNDOS (si no se deshizo)
      console.log("3️⃣ Programando commit al backend para después de 5 segundos");
      timeoutRef.current = setTimeout(async () => {
        console.log("⏱️ 5 segundos pasados, enviando al backend");
        console.log("🌐 Llamando a onStatusChangedBackend");
        try {
          await onStatusChangedBackend(pacienteId, newStatus);

          // Mostrar confirmación silenciosa (solo en log)
          console.log(`✅ Estado guardado en backend: ${pacienteNombre} → ${newStatus}`);
        } catch (error) {
          console.error('❌ Error guardando estado en backend:', error);

          // ROLLBACK AUTOMÁTICO en caso de error
          onStatusChange(pacienteId, previousStatus);
          toast.dismiss(toastRef.current);

          toast.error(
            <div>
              <p className="font-medium">Error al guardar estado</p>
              <p className="text-sm">Se restauró al estado anterior</p>
            </div>,
            { duration: 4000 }
          );
        }
      }, 5000);
    },
    [onStatusChange, onStatusChangedBackend]
  );

  return { changeStatus };
};
