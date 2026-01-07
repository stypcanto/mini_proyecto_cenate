// ========================================================================
// 🔔 NotificacionesPanel.jsx – Panel de Notificaciones (CENATE 2025)
// ------------------------------------------------------------------------
// Panel desplegable que muestra notificaciones del sistema
// ========================================================================

import React, { useEffect, useState } from 'react';
import { X, Cake, User } from 'lucide-react';
import apiClient from '../services/apiClient';

export default function NotificacionesPanel({ isOpen, onClose }) {
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
      const response = await apiClient.get('/notificaciones/cumpleanos');
      console.log('📋 Notificaciones recibidas:', response);
      setNotificaciones(response || []);
    } catch (error) {
      console.error('❌ Error al cargar notificaciones:', error);
      setNotificaciones([]);
    } finally {
      setLoading(false);
    }
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
            <div className="divide-y divide-gray-200 dark:divide-slate-700">
              {notificaciones.map((notif, index) => (
                <div
                  key={index}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar o foto */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                      {notif.foto_url ? (
                        <img
                          src={notif.foto_url}
                          alt={notif.nombre_completo}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-6 h-6 text-white" />
                      )}
                    </div>

                    {/* Información */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {notif.nombre_completo}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {notif.profesion || 'Personal médico'}
                          </p>
                        </div>
                        <span className="text-2xl">🎂</span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                        {notif.mensaje}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {notificaciones.length > 0 && (
          <div className="p-3 bg-gray-50 dark:bg-slate-700/50 border-t border-gray-200 dark:border-slate-700 text-center">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {notificaciones.length} {notificaciones.length === 1 ? 'cumpleaños' : 'cumpleaños'} para celebrar hoy
            </p>
          </div>
        )}
      </div>
    </>
  );
}
