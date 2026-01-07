// ========================================================================
// CHATBOT CITA - Sistema de Solicitud de Citas CENATE
// ========================================================================
// Wizard de 3 pasos para solicitar citas medicas
// Paso 1: Consultar paciente por documento
// Paso 2: Seleccionar servicio y ver disponibilidad
// Paso 3: Confirmar y generar solicitud
// ========================================================================

import React, { useState } from 'react';
import chatbotService from '../../services/chatbotService';

// Componente de Alerta reutilizable
const Alert = ({ children, type = 'info', onClose }) => {
  const colors = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800'
  };

  return (
    <div className={`p-4 border rounded-lg ${colors[type]} mb-4 flex justify-between items-start`}>
      <span>{children}</span>
      {onClose && (
        <button onClick={onClose} className="ml-4 text-lg font-bold opacity-50 hover:opacity-100">
          &times;
        </button>
      )}
    </div>
  );
};

// Indicador de pasos
const StepIndicator = ({ currentStep }) => {
  const steps = [
    { number: 1, label: 'Datos del Paciente' },
    { number: 2, label: 'Disponibilidad' },
    { number: 3, label: 'Confirmacion' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1">
            <div className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  currentStep >= step.number
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                {step.number}
              </div>
              <div className="ml-3">
                <div
                  className={`font-semibold ${
                    currentStep >= step.number ? 'text-indigo-900' : 'text-gray-500'
                  }`}
                >
                  {step.label}
                </div>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-1 mx-4 ${
                  currentStep > step.number ? 'bg-indigo-600' : 'bg-gray-300'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default function ChatbotCita() {
  // Estado del wizard
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Paso 1: Paciente
  const [documento, setDocumento] = useState('');
  const [pacienteData, setPacienteData] = useState(null);

  // Paso 2: Servicios y disponibilidad
  const [idServicioSeleccionado, setIdServicioSeleccionado] = useState('');
  const [servicioSeleccionado, setServicioSeleccionado] = useState('');
  const [cabecerasList, setCabecerasList] = useState([]);
  const [atencionesList, setAtencionesList] = useState([]);
  const [activeTab, setActiveTab] = useState('cabeceras');

  // Paso 3: Cita seleccionada y solicitud
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [observacion, setObservacion] = useState('');
  const [solicitudCreada, setSolicitudCreada] = useState(null);

  // Paso 1: Consultar paciente
  const consultarPaciente = async () => {
    if (!documento || documento.length < 8) {
      setError('Por favor ingrese un documento valido (minimo 8 caracteres)');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const data = await chatbotService.consultarPaciente(documento);
      setPacienteData(data);

      let tipoPaciente = '';
      if (data.esPacienteNuevo) tipoPaciente = ' (Paciente Nuevo)';
      else if (data.esPacienteCenate) tipoPaciente = ' (Paciente CENATE)';
      else if (data.esPacienteGlobal) tipoPaciente = ' (Paciente Global)';

      setSuccess(`Datos del paciente cargados correctamente${tipoPaciente}`);
      setCurrentStep(2);
    } catch (err) {
      setError(err.message || 'Error al consultar paciente');
    } finally {
      setLoading(false);
    }
  };

  // Paso 2a: Consultar cabeceras de disponibilidad
  const consultarCabeceras = async () => {
    if (!idServicioSeleccionado) {
      setError('Por favor seleccione un servicio');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    setCabecerasList([]);
    setAtencionesList([]);
    setActiveTab('cabeceras');
    setCitaSeleccionada(null);

    try {
      const data = await chatbotService.getFechasDisponibles(idServicioSeleccionado);
      const lista = Array.isArray(data) ? data : [data];

      if (lista.length === 0) {
        setError('No hay fechas disponibles para este servicio');
        return;
      }

      setCabecerasList(lista);
      setSuccess(`Se encontraron ${lista.length} fechas disponibles`);
    } catch (err) {
      setError(err.message || 'Error al consultar disponibilidad');
    } finally {
      setLoading(false);
    }
  };

  // Paso 2b: Consultar detalle de disponibilidad (slots)
  const consultarDetalleDisponibilidad = async (fechaCita, codServicio) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    setAtencionesList([]);
    setCitaSeleccionada(null);

    try {
      const data = await chatbotService.getSlotsDisponibles(fechaCita, codServicio);
      const lista = Array.isArray(data) ? data : [data];

      if (lista.length === 0) {
        setError('No hay horarios disponibles para esta fecha');
        return;
      }

      setAtencionesList(lista);
      setActiveTab('atenciones');
      setSuccess(`Se encontraron ${lista.length} horarios disponibles`);
    } catch (err) {
      setError(err.message || 'Error al consultar horarios');
    } finally {
      setLoading(false);
    }
  };

  // Paso 3: Generar solicitud
  const generarSolicitud = async () => {
    if (!citaSeleccionada || !pacienteData) {
      setError('Por favor seleccione una cita disponible');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const solicitudBody = {
      periodo: citaSeleccionada.periodo || new Date().toISOString().slice(0, 7).replace('-', ''),
      docPaciente: pacienteData.documento,
      telefono: pacienteData.telefono || '',
      fechaCita: citaSeleccionada.fechaCita,
      horaCita: citaSeleccionada.horaCita,
      observacion: observacion || 'Solicitud generada desde ChatBot',
      idServicio: citaSeleccionada.idServicio,
      idActividad: citaSeleccionada.idActividad,
      idSubactividad: citaSeleccionada.idSubactividad,
      idAreaHospitalaria: citaSeleccionada.idAreaHosp || 1,
      idPersonal: citaSeleccionada.idPers || citaSeleccionada.idPersonal
    };

    try {
      const data = await chatbotService.crearSolicitud(solicitudBody);
      setSolicitudCreada(data);
      setSuccess('Solicitud de cita creada exitosamente!');
    } catch (err) {
      setError(err.message || 'Error al crear solicitud');
    } finally {
      setLoading(false);
    }
  };

  // Reiniciar wizard
  const reiniciar = () => {
    setCurrentStep(1);
    setDocumento('');
    setPacienteData(null);
    setServicioSeleccionado('');
    setIdServicioSeleccionado('');
    setCabecerasList([]);
    setAtencionesList([]);
    setCitaSeleccionada(null);
    setObservacion('');
    setSolicitudCreada(null);
    setError(null);
    setSuccess(null);
    setActiveTab('cabeceras');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-indigo-900">Sistema de Citas CENATE</h1>
              <p className="text-gray-600 mt-1">Solicitud de Citas Medicas - Telemedicina</p>
            </div>
            <button
              onClick={reiniciar}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Nueva Consulta
            </button>
          </div>
        </div>

        {/* Indicador de pasos */}
        <StepIndicator currentStep={currentStep} />

        {/* Alertas */}
        {error && (
          <Alert type="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert type="success" onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {/* PASO 1: Datos del Paciente */}
        {currentStep === 1 && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-indigo-900 mb-6">
              Paso 1: Consultar Datos del Paciente
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numero de Documento (DNI/CE)
                </label>
                <input
                  type="text"
                  value={documento}
                  onChange={(e) => setDocumento(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && consultarPaciente()}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Ingrese el numero de documento"
                  maxLength="15"
                />
              </div>

              <button
                onClick={consultarPaciente}
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Consultando...' : 'Consultar Paciente'}
              </button>
            </div>
          </div>
        )}

        {/* PASO 2: Disponibilidad */}
        {currentStep === 2 && pacienteData && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-indigo-900 mb-6">
              Paso 2: Consultar Disponibilidad
            </h2>

            {/* Info del paciente */}
            <div className="bg-indigo-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-indigo-900 mb-2">Informacion del Paciente</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Nombre:</span>
                  <span className="ml-2 font-medium">{pacienteData.nombre}</span>
                </div>
                <div>
                  <span className="text-gray-600">Documento:</span>
                  <span className="ml-2 font-medium">{pacienteData.documento}</span>
                </div>
                <div>
                  <span className="text-gray-600">Sexo:</span>
                  <span className="ml-2 font-medium">{pacienteData.sexo}</span>
                </div>
                <div>
                  <span className="text-gray-600">Edad:</span>
                  <span className="ml-2 font-medium">{pacienteData.edad} anos</span>
                </div>
                <div>
                  <span className="text-gray-600">Telefono:</span>
                  <span className="ml-2 font-medium">{pacienteData.telefono || 'No registrado'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Cobertura:</span>
                  <span className="ml-2 font-medium">
                    {pacienteData.tieneCobertura ? 'Si' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            {/* Selector de servicio */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seleccione un Servicio
                </label>
                <select
                  value={idServicioSeleccionado}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    setIdServicioSeleccionado(selectedId);

                    const serviciosList = pacienteData.listarServiciosDisponibles || [];
                    const servicioEncontrado = serviciosList.find(
                      (s) => s.idServicio === selectedId
                    );
                    setServicioSeleccionado(servicioEncontrado ? servicioEncontrado.nomServicio : '');

                    setCabecerasList([]);
                    setAtencionesList([]);
                    setCitaSeleccionada(null);
                    setActiveTab('cabeceras');
                  }}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">-- Seleccione un servicio --</option>
                  {pacienteData.listarServiciosDisponibles &&
                    pacienteData.listarServiciosDisponibles.map((servicio) => (
                      <option key={servicio.idServicio} value={servicio.idServicio}>
                        {servicio.nomServicio}
                      </option>
                    ))}
                </select>
              </div>

              <button
                onClick={consultarCabeceras}
                disabled={loading || !idServicioSeleccionado}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Consultando...' : 'Buscar Disponibilidad'}
              </button>
            </div>

            {/* Tabs Cabeceras / Atenciones */}
            {(cabecerasList.length > 0 || atencionesList.length > 0) && (
              <div className="mb-4 border-b flex">
                <button
                  className={`px-4 py-2 text-sm font-medium border-b-2 ${
                    activeTab === 'cabeceras'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500'
                  }`}
                  onClick={() => setActiveTab('cabeceras')}
                >
                  Fechas Disponibles ({cabecerasList.length})
                </button>
                <button
                  className={`px-4 py-2 text-sm font-medium border-b-2 ${
                    activeTab === 'atenciones'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500'
                  } ${atencionesList.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => atencionesList.length > 0 && setActiveTab('atenciones')}
                >
                  Horarios Disponibles ({atencionesList.length})
                </button>
              </div>
            )}

            {/* Lista de cabeceras (fechas) */}
            {activeTab === 'cabeceras' && cabecerasList.length > 0 && (
              <div className="space-y-3 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Seleccione una fecha para ver horarios:
                </h3>
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {cabecerasList.map((cab, idx) => (
                    <div
                      key={idx}
                      onClick={() => consultarDetalleDisponibilidad(cab.fechaCita, cab.codServicio)}
                      className="border rounded-lg p-4 cursor-pointer transition hover:shadow-md bg-blue-50 hover:bg-blue-100"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600">Fecha:</span>
                          <span className="ml-2 font-medium">{cab.fechaCita}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Servicio:</span>
                          <span className="ml-2 font-medium">{cab.servicio}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Turno:</span>
                          <span className="ml-2 font-medium">
                            {cab.tipoTurno} - {cab.descTipTurno}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lista de atenciones (slots/horarios) */}
            {activeTab === 'atenciones' && atencionesList.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Seleccione un horario:
                </h3>
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {atencionesList.map((cita, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setCitaSeleccionada(cita);
                        setCurrentStep(3);
                      }}
                      className="border rounded-lg p-4 cursor-pointer transition hover:shadow-md bg-gray-50 hover:bg-gray-100"
                    >
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600">Fecha:</span>
                          <span className="ml-2 font-medium">{cita.fechaCita}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Hora:</span>
                          <span className="ml-2 font-medium">{cita.horaCita}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Profesional:</span>
                          <span className="ml-2 font-medium">{cita.profesional}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Turno:</span>
                          <span className="ml-2 font-medium">{cita.turno}</span>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        Actividad: {cita.actividad} | Subactividad: {cita.subactividad}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Boton volver */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setCurrentStep(1);
                  setServicioSeleccionado('');
                  setIdServicioSeleccionado('');
                  setCabecerasList([]);
                  setAtencionesList([]);
                  setCitaSeleccionada(null);
                  setError(null);
                  setSuccess(null);
                  setActiveTab('cabeceras');
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Volver
              </button>
            </div>
          </div>
        )}

        {/* PASO 3: Confirmacion */}
        {currentStep === 3 && citaSeleccionada && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-indigo-900 mb-6">
              Paso 3: Confirmar y Generar Solicitud
            </h2>

            {!solicitudCreada ? (
              <>
                {/* Resumen de la cita */}
                <div className="bg-indigo-50 rounded-lg p-6 mb-6">
                  <h3 className="font-semibold text-indigo-900 mb-4">Resumen de la Cita</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Paciente:</span>
                      <span className="font-medium">{pacienteData.nombre}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Documento:</span>
                      <span className="font-medium">{pacienteData.documento}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Servicio:</span>
                      <span className="font-medium">{servicioSeleccionado}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fecha:</span>
                      <span className="font-medium">{citaSeleccionada.fechaCita}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Hora:</span>
                      <span className="font-medium">{citaSeleccionada.horaCita}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Profesional:</span>
                      <span className="font-medium">{citaSeleccionada.profesional}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Turno:</span>
                      <span className="font-medium">{citaSeleccionada.turno}</span>
                    </div>
                  </div>
                </div>

                {/* Campo de observaciones */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observaciones (Opcional)
                  </label>
                  <textarea
                    value={observacion}
                    onChange={(e) => setObservacion(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    rows="3"
                    placeholder="Ingrese observaciones adicionales..."
                  />
                </div>

                {/* Botones de accion */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setCurrentStep(2);
                      setCitaSeleccionada(null);
                      setObservacion('');
                      setError(null);
                      setSuccess(null);
                      setActiveTab('atenciones');
                    }}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                  >
                    Volver
                  </button>
                  <button
                    onClick={generarSolicitud}
                    disabled={loading}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Generando...' : 'Confirmar y Generar Solicitud'}
                  </button>
                </div>
              </>
            ) : (
              /* Confirmacion de exito */
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-10 h-10 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-green-600 mb-2">
                  Solicitud Creada Exitosamente!
                </h3>
                <p className="text-gray-600 mb-2">Su cita ha sido registrada en el sistema</p>
                {solicitudCreada.idSolicitud && (
                  <p className="text-sm text-gray-500 mb-6">
                    Numero de Solicitud: <strong>#{solicitudCreada.idSolicitud}</strong>
                  </p>
                )}

                <button
                  onClick={reiniciar}
                  className="bg-indigo-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-indigo-700 transition"
                >
                  Nueva Solicitud
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
