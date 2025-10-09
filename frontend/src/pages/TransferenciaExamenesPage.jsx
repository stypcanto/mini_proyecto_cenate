import React, { useState } from 'react';
import { Search, Trash2, Edit, Plus } from 'lucide-react';
import ExamenModal from '../components/modals/ExamenModal';
import ConfirmDialog from '../components/modals/ConfirmDialog';
// Descomentar cuando el backend esté listo:
// import useExamenes from '../hooks/useExamenes';

const TransferenciaExamenesPage = () => {
  const [modalidadAtencion, setModalidadAtencion] = useState('');
  const [nivelAtencion, setNivelAtencion] = useState('');
  const [tipoExamen, setTipoExamen] = useState('');
  const [nombreExamen, setNombreExamen] = useState('');
  const [codigoExamen, setCodigoExamen] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedExamen, setSelectedExamen] = useState(null);
  const [examenToDelete, setExamenToDelete] = useState(null);

  // Cuando el backend esté listo, descomentar esto:
  // const {
  //   examenes,
  //   loading,
  //   error,
  //   searchExamenes,
  //   createExamen,
  //   updateExamen,
  //   deleteExamen
  // } = useExamenes();

  // Datos de ejemplo para la tabla (mock data)
  const [examenes, setExamenes] = useState([
    {
      id: 1,
      codigo: '87220',
      nombre: 'KOH - EXAMEN DE TEJIDOS PARA HONGOS',
      estado: 'Activo',
      ipressTransferencia: 'H.N. ALBERTO SABOGAL SOLOGUREN',
      modalidadAtencion: 'Ambulatorio',
      nivelAtencion: 'Nivel III',
      tipoExamen: 'Especializado'
    },
    {
      id: 2,
      codigo: '87220',
      nombre: 'ESTUDIOS DE SENSIBILIDAD A ANTIBIOTICOS; METODO DE DISCO, POR PLACA...',
      estado: 'Activo',
      ipressTransferencia: 'NINGUNA',
      modalidadAtencion: 'Ambulatorio',
      nivelAtencion: 'Nivel II',
      tipoExamen: 'Rutina'
    },
    {
      id: 3,
      codigo: '87220',
      nombre: 'KOH - EXAMEN DE TEJIDOS PARA HONGOS',
      estado: 'Activo',
      ipressTransferencia: 'H.N. ALBERTO SABOGAL SOLOGUREN',
      modalidadAtencion: 'Emergencia',
      nivelAtencion: 'Nivel III',
      tipoExamen: 'Urgencia'
    },
    {
      id: 4,
      codigo: '87220',
      nombre: 'ESTUDIOS DE SENSIBILIDAD A ANTIBIOTICOS; METODO DE DISCO, POR PLACA...',
      estado: 'Activo',
      ipressTransferencia: 'NINGUNA',
      modalidadAtencion: 'Hospitalizado',
      nivelAtencion: 'Nivel II',
      tipoExamen: 'Rutina'
    },
    {
      id: 5,
      codigo: '87220',
      nombre: 'KOH - EXAMEN DE TEJIDOS PARA HONGOS',
      estado: 'Activo',
      ipressTransferencia: 'H.N. ALBERTO SABOGAL SOLOGUREN',
      modalidadAtencion: 'Ambulatorio',
      nivelAtencion: 'Nivel III',
      tipoExamen: 'Especializado'
    },
    {
      id: 6,
      codigo: '87220',
      nombre: 'ESTUDIOS DE SENSIBILIDAD A ANTIBIOTICOS; METODO DE DISCO, POR PLACA...',
      estado: 'Activo',
      ipressTransferencia: 'NINGUNA',
      modalidadAtencion: 'Ambulatorio',
      nivelAtencion: 'Nivel I',
      tipoExamen: 'Rutina'
    },
    {
      id: 7,
      codigo: '87220',
      nombre: 'KOH - EXAMEN DE TEJIDOS PARA HONGOS',
      estado: 'Inactivo',
      ipressTransferencia: 'H.N. ALBERTO SABOGAL SOLOGUREN',
      modalidadAtencion: 'Emergencia',
      nivelAtencion: 'Nivel III',
      tipoExamen: 'Urgencia'
    }
  ]);

  // Filtrar exámenes según búsqueda
  const examenesFiltrados = examenes.filter(examen => {
    const matchNombre = nombreExamen === '' || 
      examen.nombre.toLowerCase().includes(nombreExamen.toLowerCase());
    const matchCodigo = codigoExamen === '' || 
      examen.codigo.includes(codigoExamen);
    return matchNombre && matchCodigo;
  });

  const handleNuevo = () => {
    setSelectedExamen(null);
    setIsModalOpen(true);
  };

  const handleEdit = (examen) => {
    setSelectedExamen(examen);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (examen) => {
    setExamenToDelete(examen);
    setIsConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (examenToDelete) {
      // Mock delete - eliminar del estado local
      setExamenes(examenes.filter(e => e.id !== examenToDelete.id));
      
      // Cuando el backend esté listo:
      // deleteExamen(examenToDelete.id);
      
      setExamenToDelete(null);
    }
  };

  const handleSave = (examenData) => {
    if (selectedExamen) {
      // Modo edición - actualizar en el estado local
      setExamenes(examenes.map(e => 
        e.id === selectedExamen.id 
          ? { ...e, ...examenData } 
          : e
      ));
      
      // Cuando el backend esté listo:
      // updateExamen(selectedExamen.id, examenData);
    } else {
      // Modo creación - agregar al estado local
      const nuevoExamen = {
        id: Math.max(...examenes.map(e => e.id)) + 1,
        ...examenData
      };
      setExamenes([...examenes, nuevoExamen]);
      
      // Cuando el backend esté listo:
      // createExamen(examenData);
    }
  };

  const handleSearch = () => {
    // Cuando el backend esté listo:
    // searchExamenes(nombreExamen, codigoExamen);
    console.log('Buscar:', { nombreExamen, codigoExamen });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header con logos */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <img 
              src="/images/Logo ESSALUD Azul.png" 
              alt="EsSalud" 
              className="h-12 object-contain"
            />
            <h1 className="text-2xl font-bold text-gray-800 text-center flex-1">
              FORMULARIO DE TRANSFERENCIA DE EXÁMENES<br />
              DE LABORATORIO - CENATE
            </h1>
            <img 
              src="/images/Logo CENATE Azul.png" 
              alt="CENATE" 
              className="h-12 object-contain"
            />
          </div>
        </div>

        {/* Formulario principal */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* IPRESS */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                IPRESS:
              </label>
              <input
                type="text"
                value="H.N EDGARDO REBAGLIATI MARTINS"
                disabled
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-800"
              />
            </div>

            {/* MODALIDAD DE ATENCIÓN */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                MODALIDAD DE ATENCIÓN:
              </label>
              <select
                value={modalidadAtencion}
                onChange={(e) => setModalidadAtencion(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">seleccione</option>
                <option value="ambulatorio">Ambulatorio</option>
                <option value="hospitalizado">Hospitalizado</option>
                <option value="emergencia">Emergencia</option>
              </select>
            </div>

            {/* NIVEL DE ATENCIÓN */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                NIVEL DE ATENCIÓN:
              </label>
              <select
                value={nivelAtencion}
                onChange={(e) => setNivelAtencion(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">seleccione</option>
                <option value="nivel1">Nivel I</option>
                <option value="nivel2">Nivel II</option>
                <option value="nivel3">Nivel III</option>
              </select>
            </div>

            {/* TIPO DE EXAMEN */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                TIPO DE EXAMEN:
              </label>
              <select
                value={tipoExamen}
                onChange={(e) => setTipoExamen(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">seleccione</option>
                <option value="rutina">Rutina</option>
                <option value="especializado">Especializado</option>
                <option value="urgencia">Urgencia</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabla de exámenes */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              EXAMENES DE LABORATORIO
            </h2>
            
            {/* Buscadores */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="relative md:col-span-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Nombre del examen"
                  value={nombreExamen}
                  onChange={(e) => setNombreExamen(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="relative md:col-span-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Código del examen"
                  value={codigoExamen}
                  onChange={(e) => setCodigoExamen(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleNuevo}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  NUEVO
                </button>
              </div>
            </div>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-bold text-blue-600">
                    CÓDIGO DEL EXAMEN
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-bold text-blue-600">
                    NOMBRE DEL EXAMEN
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-bold text-blue-600">
                    ESTADO
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-bold text-blue-600">
                    IPRESS DE TRANSFERENCIA DE EXAMEN
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-bold text-blue-600">
                    ACCIONES
                  </th>
                </tr>
              </thead>
              <tbody>
                {examenesFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-gray-500">
                      No se encontraron exámenes
                    </td>
                  </tr>
                ) : (
                  examenesFiltrados.map((examen) => (
                    <tr key={examen.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-800">
                        {examen.codigo}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-800">
                        {examen.nombre}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            examen.estado === 'Activo'
                              ? 'bg-green-400 text-white'
                              : 'bg-red-400 text-white'
                          }`}
                        >
                          {examen.estado}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-800">
                        {examen.ipressTransferencia}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleDeleteClick(examen)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleEdit(examen)}
                            className="text-gray-400 hover:text-blue-500 transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal para agregar/editar */}
      <ExamenModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        examen={selectedExamen}
        ipress="H.N EDGARDO REBAGLIATI MARTINS"
      />

      {/* Diálogo de confirmación */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="¿Eliminar Examen?"
        message={`¿Está seguro de que desea eliminar el examen "${examenToDelete?.nombre}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
};

export default TransferenciaExamenesPage;
