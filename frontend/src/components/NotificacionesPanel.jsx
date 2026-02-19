// ========================================================================
// 🔔 NotificacionesPanel.jsx – Panel de Notificaciones (CENATE 2025)
// ------------------------------------------------------------------------
// Panel desplegable que muestra notificaciones del sistema
// ========================================================================

import React, { useEffect, useState } from 'react';
import { X, Cake, User } from 'lucide-react';
import apiClient from '../lib/apiClient';

export default function NotificacionesPanel({ isOpen, onClose, esSuperAdmin = false }) {
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      cargarNotificaciones();
    }
  }, [isOpen]);

  const cargarNotificaciones = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/notificaciones/cumpleanos', true);
      console.log('📋 Notificaciones recibidas:', response);
      setNotificaciones(response || []);
    } catch (error) {
      console.error('❌ Error al cargar notificaciones:', error);
      setNotificaciones([]);
    } finally {
      setLoading(false);
    }
  };

  // Formatear profesión: "INGENIERÍA" → "Profesional en Ingeniería"
  const formatearProfesion = (profesion) => {
    if (!profesion) return 'Profesional de salud';
    const nombre = profesion.charAt(0).toUpperCase() + profesion.slice(1).toLowerCase();
    return `Profesional en ${nombre}`;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay oscuro */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      ></div>

      {/* Panel de notificaciones */}
      <div className="fixed top-16 right-6 w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl z-50 border border-gray-200 dark:border-slate-700 overflow-hidden">
        {/* Header del panel */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-[#0a5ba9] to-[#1C5B36]">
          <div className="flex items-center gap-2">
            <Cake className="w-5 h-5 text-white" />
            <h3 className="text-lg font-bold text-white">Cumpleaños de Hoy</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Contenido */}
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0a5ba9]"></div>
            </div>
          ) : notificaciones.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <Cake className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No hay cumpleaños hoy</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-slate-700">
              {notificaciones.map((notif, index) => (
                <div
                  key={index}
                  className="px-4 py-3 hover:bg-blue-50/50 dark:hover:bg-slate-700/50 transition-colors flex items-center gap-3"
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center flex-shrink-0 ring-2 ring-white shadow-sm">
                    {notif.foto_url ? (
                      <img
                        src={notif.foto_url}
                        alt={notif.nombre_completo}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-white" />
                    )}
                  </div>

                  {/* Nombre + profesión */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                      {notif.nombre_completo}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {esSuperAdmin
                        ? `Cumple ${notif.mensaje?.match(/\d+/)?.[0] || ''} años · ${formatearProfesion(notif.profesion)}`
                        : formatearProfesion(notif.profesion)}
                    </p>
                  </div>

                  <span className="text-lg flex-shrink-0">🎂</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {notificaciones.length > 0 && (
          <div className="px-4 py-2.5 bg-gray-50 dark:bg-slate-700/50 border-t border-gray-100 dark:border-slate-700 text-center">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {notificaciones.length} {notificaciones.length === 1 ? 'persona cumple' : 'personas cumplen'} años hoy
            </p>
          </div>
        )}
      </div>
    </>
  );
}
