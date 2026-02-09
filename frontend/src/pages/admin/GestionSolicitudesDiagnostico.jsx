import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  X,
  Save,
  FileText,
} from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * 🏥 Gestión de Solicitudes Diagnóstico
 * Página básica para gestionar solicitudes de diagnósticos
 */
export default function GestionSolicitudesDiagnostico() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedId, setSelectedId] = useState(null);
  const [formData, setFormData] = useState({
    paciente: '',
    dni: '',
    diagnostico: '',
    medico: '',
    fecha: new Date().toISOString().split('T')[0],
  });

  // Cargar datos de ejemplo al iniciar
  useEffect(() => {
    setSolicitudes([
      {
        id: 1,
        paciente: 'Juan Pérez',
        dni: '12345678',
        diagnostico: 'Radiografía',
        medico: 'Dr. Carlos López',
        fecha: '2026-02-08',
        estado: 'Pendiente',
      },
      {
        id: 2,
        paciente: 'María García',
        dni: '87654321',
        diagnostico: 'Ecografía',
        medico: 'Dra. Ana Martínez',
        fecha: '2026-02-07',
        estado: 'Completada',
      },
    ]);
  }, []);

  const filteredSolicitudes = solicitudes.filter(
    (sol) =>
      sol.paciente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sol.dni.includes(searchTerm)
  );

  const handleOpenModal = (mode, solicitud = null) => {
    setModalMode(mode);
    if (solicitud) {
      setSelectedId(solicitud.id);
      setFormData(solicitud);
    } else {
      setFormData({
        paciente: '',
        dni: '',
        diagnostico: '',
        medico: '',
        fecha: new Date().toISOString().split('T')[0],
      });
    }
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.paciente || !formData.dni) {
      toast.error('Por favor completa los campos obligatorios');
      return;
    }

    if (modalMode === 'create') {
      const newSolicitud = {
        id: Date.now(),
        ...formData,
        estado: 'Pendiente',
      };
      setSolicitudes([...solicitudes, newSolicitud]);
      toast.success('Solicitud creada');
    } else {
      setSolicitudes(
        solicitudes.map((sol) =>
          sol.id === selectedId ? { ...sol, ...formData } : sol
        )
      );
      toast.success('Solicitud actualizada');
    }
    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta solicitud?')) {
      setSolicitudes(solicitudes.filter((sol) => sol.id !== id));
      toast.success('Solicitud eliminada');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Gestión de Solicitudes Diagnóstico
              </h1>
              <p className="text-gray-600">
                Administra las solicitudes de diagnósticos médicos
              </p>
            </div>
            <button
              onClick={() => handleOpenModal('create')}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Nueva Solicitud
            </button>
          </div>
        </div>

        {/* Búsqueda */}
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por paciente o DNI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredSolicitudes.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No hay solicitudes</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-blue-600 text-white">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Paciente
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      DNI
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Diagnóstico
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Médico
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-semibold">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredSolicitudes.map((solicitud) => (
                    <tr key={solicitud.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {solicitud.paciente}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {solicitud.dni}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {solicitud.diagnostico}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {solicitud.medico}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {solicitud.fecha}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            solicitud.estado === 'Completada'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {solicitud.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenModal('view', solicitud)}
                            className="p-2 hover:bg-blue-100 rounded text-blue-600"
                            title="Ver"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenModal('edit', solicitud)}
                            className="p-2 hover:bg-green-100 rounded text-green-600"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(solicitud.id)}
                            className="p-2 hover:bg-red-100 rounded text-red-600"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {modalMode === 'create'
                  ? 'Nueva Solicitud'
                  : modalMode === 'edit'
                  ? 'Editar Solicitud'
                  : 'Detalles'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulario */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Paciente *
                </label>
                <input
                  type="text"
                  value={formData.paciente}
                  onChange={(e) =>
                    setFormData({ ...formData, paciente: e.target.value })
                  }
                  disabled={modalMode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  placeholder="Nombre del paciente"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  DNI *
                </label>
                <input
                  type="text"
                  value={formData.dni}
                  onChange={(e) =>
                    setFormData({ ...formData, dni: e.target.value })
                  }
                  disabled={modalMode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  placeholder="DNI"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Diagnóstico
                </label>
                <input
                  type="text"
                  value={formData.diagnostico}
                  onChange={(e) =>
                    setFormData({ ...formData, diagnostico: e.target.value })
                  }
                  disabled={modalMode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  placeholder="Tipo de diagnóstico"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Médico
                </label>
                <input
                  type="text"
                  value={formData.medico}
                  onChange={(e) =>
                    setFormData({ ...formData, medico: e.target.value })
                  }
                  disabled={modalMode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  placeholder="Nombre del médico"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha
                </label>
                <input
                  type="date"
                  value={formData.fecha}
                  onChange={(e) =>
                    setFormData({ ...formData, fecha: e.target.value })
                  }
                  disabled={modalMode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50"
              >
                Cerrar
              </button>
              {modalMode !== 'view' && (
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
                >
                  <Save className="w-4 h-4" />
                  Guardar
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
