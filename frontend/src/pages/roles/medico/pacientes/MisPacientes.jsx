/**
 * 👨‍⚕️ MisPacientes.jsx - Tabla de Pacientes para Médicos (v1.46.0)
 *
 * Panel que muestra los pacientes asignados al médico en tabla
 * con acciones profesionales de gestión de estado:
 * - Cambiar Estado: Atendido | Pendiente | Deserción (con razones)
 * - Generar Interconsulta
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  Clock,
  AlertCircle,
  Loader,
  RefreshCw,
  CheckCircle,
  ChevronRight,
  ChevronDown,
  X,
  Check,
  FileText,
  Share2,
  Heart,
  Calendar,
  Eye,
  Activity,
  Stethoscope,
  HelpCircle,
  Ticket
} from 'lucide-react';
import toast from 'react-hot-toast';
import gestionPacientesService from '../../../../services/gestionPacientesService';
import { obtenerEspecialidadesActivasCenate } from '../../../../services/bolsasService';
import ipressService from '../../../../services/ipressService';
import ModalEvaluacionECG from '../../../../components/teleecgs/ModalEvaluacionECG';
import teleecgService from '../../../../services/teleecgService';
import { useAuth } from '../../../../context/AuthContext';
import CalendarioAsignacion from '../../../../components/calendario/CalendarioAsignacion';
import CrearTicketModal from '../../../mesa-ayuda/components/CrearTicketModal';
import { mesaAyudaService } from '../../../../services/mesaAyudaService';

// ✅ v1.78.0: Sistema Genérico de Especialidades
// Define qué funcionalidades tiene cada tipo de especialidad
const SPECIALTY_FEATURES = {
  CARDIOLOGIA: {
    keywords: ['cardio', 'corazón'],
    features: ['EKG_COLUMNS', 'EKG_ACTION'],
    name: 'Cardiología'
  },
  ENDOCRINOLOGIA: {
    keywords: ['endocrin', 'diabetes'],
    features: ['GLUCOSE_MONITORING'],
    name: 'Endocrinología'
  },
  TERAPIA_LENGUAJE: {
    keywords: ['lenguaje', 'fonoaudiol', 'terapia del habla', 'speech'],
    features: ['SPEECH_THERAPY_NOTES'],
    name: 'Terapia del Lenguaje'
  },
  MEDICINA_GENERAL: {
    keywords: ['general', 'médico'],
    features: [],
    name: 'Medicina General'
  }
  // Agregar más especialidades según sea necesario
};

// Estilos de animaciones personalizadas
const animationStyles = `
  @keyframes cardFloatKpi {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-6px); }
  }

  @keyframes cardGlowKpi {
    0%, 100% { box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15); }
    50% { box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25); }
  }

  @keyframes slideUpKpi {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes pulseRed {
    0%, 100% {
      box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4);
      transform: scale(1);
    }
    50% {
      box-shadow: 0 0 0 4px rgba(220, 38, 38, 0);
      transform: scale(1.02);
    }
  }

  .ecg-button-pulse {
    animation: pulseRed 2s infinite;
  }

  .kpi-card-hover {
    transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .kpi-card-hover:hover {
    transform: translateY(-10px) scale(1.02);
    animation: cardGlowKpi 1.5s ease-in-out infinite;
  }

  @media (prefers-reduced-motion: no-preference) {
    .kpi-card-animate {
      animation: slideUpKpi 0.6s ease-out forwards;
    }

    .kpi-card-animate:nth-child(1) {
      animation-delay: 0s;
    }

    .kpi-card-animate:nth-child(2) {
      animation-delay: 0.1s;
    }

    .kpi-card-animate:nth-child(3) {
      animation-delay: 0.2s;
    }

    .kpi-card-animate:nth-child(4) {
      animation-delay: 0.3s;
    }
  }
`;

export default function MisPacientes() {
  // ✅ v1.78.0: Obtener información del médico autenticado desde AuthContext + localStorage + pacientes
  const { user: authUser } = useAuth();

  // ✅ v1.78.0: Estado para información del médico logueado (nombre + especialidad desde backend)
  const [doctorInfo, setDoctorInfo] = useState(null);

  // Estado para rastrear la especialidad del médico (se actualiza cuando carguen los pacientes)
  const [userSpecialty, setUserSpecialty] = useState(null);

  // Función auxiliar para detectar la especialidad basada en palabras clave
  const detectSpecialtyByKeywords = (text) => {
    if (!text) return null;
    const textLower = text.toLowerCase();
    for (const [key, config] of Object.entries(SPECIALTY_FEATURES)) {
      if (config.keywords.some(keyword => textLower.includes(keyword))) {
        return key;
      }
    }
    return null;
  };

  // ✅ v1.78.0: Sistema genérico para detectar especialidad y sus características
  const specialtyConfig = useMemo(() => {
    try {
      let detectedSpecialty = null;

      // 1. ⭐ PRIORIDAD: Desde API endpoint (especialidad del MÉDICO LOGUEADO)
      if (doctorInfo?.especialidad) {
        detectedSpecialty = detectSpecialtyByKeywords(doctorInfo.especialidad);
        if (detectedSpecialty) {
          console.log('✅ v1.78.0: Especialidad desde API (doctor logueado):', detectedSpecialty, 'Nombre:', doctorInfo.especialidad);
          return SPECIALTY_FEATURES[detectedSpecialty];
        }
      }

      // 2. Fallback: Intentar desde AuthContext
      if (authUser?.especialidad) {
        detectedSpecialty = detectSpecialtyByKeywords(authUser.especialidad);
        if (detectedSpecialty) {
          console.log('✅ v1.78.0: Especialidad detectada desde AuthContext:', detectedSpecialty, 'Nombre:', authUser.especialidad);
          return SPECIALTY_FEATURES[detectedSpecialty];
        }
      }

      // 3. Fallback: Intentar desde localStorage
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        const especialidad = user.especialidad || user.especialidadNombre || '';
        detectedSpecialty = detectSpecialtyByKeywords(especialidad);
        if (detectedSpecialty) {
          console.log('✅ v1.78.0: Especialidad detectada desde localStorage:', detectedSpecialty, 'Nombre:', especialidad);
          return SPECIALTY_FEATURES[detectedSpecialty];
        }
      }

      // 4. Si se detectó desde pacientes, usar ese valor
      if (userSpecialty) {
        console.log('✅ v1.78.0: Especialidad detectada desde pacientes:', userSpecialty);
        return SPECIALTY_FEATURES[userSpecialty];
      }

      console.log('⚠️ v1.78.0: No se detectó especialidad');
      return null;
    } catch (error) {
      console.error('Error al detectar especialidad:', error);
      return null;
    }
  }, [doctorInfo, authUser, userSpecialty]);

  // Helper para verificar si la especialidad actual tiene una característica
  const hasFeature = (feature) => {
    return specialtyConfig?.features?.includes(feature) || false;
  };

  // Alias para mantener compatibilidad con código existente
  const esCardiologo = hasFeature('EKG_COLUMNS');

  // ✅ v1.109.25: Formatear nombre del doctor con "Dr(a)" y orden correcto
  const formatearNombreDoctor = (nombreCompleto) => {
    if (!nombreCompleto) return 'Dr Médico';

    // Lista de nombres femeninos comunes en Perú
    const nombresFemeninos = [
      'keyla', 'maría', 'josefa', 'juana', 'rosa', 'ana', 'teresa', 'carla',
      'patricia', 'sandra', 'gloria', 'diana', 'laura', 'monica', 'beatriz',
      'elena', 'francisca', 'lucia', 'raquel', 'susana', 'victoria', 'yolanda',
      'alejandra', 'carolina', 'daniela', 'gabriela', 'isabela', 'jessica',
      'katrina', 'lorena', 'magdalena', 'nora', 'olivia', 'paula', 'rachel',
      'sabrina', 'tania', 'valentina', 'wendy', 'xiomara', 'yasmin', 'zoe'
    ];

    const palabras = nombreCompleto.trim().split(/\s+/).filter(p => p.length > 0);
    if (palabras.length === 0) return 'Dr Médico';

    // Detectar género buscando nombres femeninos en la lista
    const nombreLower = nombreCompleto.toLowerCase();
    const esFemenino = nombresFemeninos.some(nf => nombreLower.includes(nf));
    const titulo = esFemenino ? 'Dra' : 'Dr';

    // Asumir que la última palabra es un apellido (ej: Llanos)
    // y el penúltimo es otro apellido (ej: Humán)
    // Luego vienen los nombres (ej: Keyla Isabel)
    // Formato: "Apellido1 Apellido2 Nombre1 Nombre2" → "Nombre1 Nombre2 Apellido1 Apellido2"
    // O más simple: tomar últimas 1-2 palabras como apellidos

    if (palabras.length >= 3) {
      // Si hay 3+ palabras, asumir: apellidos al inicio, nombres al final
      // Humán Keyla Isabel Llanos → Keyla Isabel es el nombre
      const apellidos = [palabras[0], palabras[palabras.length - 1]].filter(p => p);
      const nombres = palabras.slice(1, -1);
      return `${titulo} ${nombres.join(' ')} ${apellidos.join(' ')}`;
    } else if (palabras.length === 2) {
      // Si hay 2 palabras, asumir: primer apellido, luego nombre
      return `${titulo} ${palabras[1]} ${palabras[0]}`;
    } else {
      // Si hay 1 palabra, es solo un nombre
      return `${titulo} ${palabras[0]}`;
    }
  };

  // Formatear nombre del paciente: "APELLIDO1 APELLIDO2 NOMBRE1 NOMBRE2" → "Nombre1 Nombre2 Apellido1 Apellido2"
  const formatearNombrePaciente = (nombreCompleto) => {
    if (!nombreCompleto) return '';
    const palabras = nombreCompleto.trim().split(/\s+/).filter(p => p.length > 0);
    if (palabras.length <= 2) {
      return palabras.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    }
    // 4 palabras: AP1 AP2 NOM1 NOM2 → NOM1 NOM2 AP1 AP2
    // 3 palabras: AP1 AP2 NOM1 → NOM1 AP1 AP2
    const apellidos = palabras.slice(0, 2);
    const nombres = palabras.slice(2);
    return [...nombres, ...apellidos]
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  };

  const [pacientes, setPacientes] = useState([]);

  // ✅ v1.66.0: Helper para parsear fechas sin desfase de zona horaria
  const parsearFechaLocal = (dateStr) => {
    const [año, mes, día] = dateStr.split('-').map(Number);
    return new Date(año, mes - 1, día);
  };

  // ✅ v1.67.5: Extraer fecha convirtiendo de UTC a Lima (UTC-5)
  // PROBLEMA: Backend devuelve timestamps ISO en UTC, pero la BD los almacena en Lima
  // Ejemplo: 2026-02-12 19:20 Lima = 2026-02-13 00:20 UTC
  // El split('T')[0] en UTC da 2026-02-13, pero la fecha real en Lima es 2026-02-12
  const extraerFecha = (dateStr) => {
    if (!dateStr) return null;
    try {
      // Parsear como ISO 8601 (UTC)
      const dateObj = new Date(dateStr);

      // Convertir a Lima: restar 5 horas al UTC
      const limaDate = new Date(dateObj.getTime() - (5 * 60 * 60 * 1000));

      // Extraer fecha en formato YYYY-MM-DD
      const año = limaDate.getUTCFullYear();
      const mes = String(limaDate.getUTCMonth() + 1).padStart(2, '0');
      const día = String(limaDate.getUTCDate()).padStart(2, '0');

      return `${año}-${mes}-${día}`;
    } catch (e) {
      console.error('❌ Error al procesar fecha:', dateStr, e);
      return null;
    }
  };

  // ✅ v1.67.4: Obtener la fecha de HOY en zona horaria de Lima (UTC-5)
  // IMPORTANTE: Perú (Lima) está en UTC-5 y NO usa horario de verano
  const obtenerHoyEnLima = () => {
    const ahora = new Date();
    // Convertir a Lima: UTC-5 = restar 5 horas al UTC
    const limaTime = new Date(ahora.getTime() - (5 * 60 * 60 * 1000));
    const año = limaTime.getUTCFullYear();
    const mes = String(limaTime.getUTCMonth() + 1).padStart(2, '0');
    const día = String(limaTime.getUTCDate()).padStart(2, '0');
    const hoyEnLima = `${año}-${mes}-${día}`;
    console.log(`🕐 HOY EN LIMA (UTC-5): ${hoyEnLima}, UTC: ${ahora.toISOString().split('T')[0]}`);
    return hoyEnLima;
  };

  // ✅ v1.67.6: Calcular fechas con ATENCIÓN para el calendario
  // IMPORTANTE: El médico necesita ver cuándo DEBE ATENDER, no cuándo fue asignado
  // fecha_atencion es DATE (YYYY-MM-DD), sin timezone issues
  const fechasConAsignaciones = useMemo(() => {
    const fechasMap = {};
    let contadores = {
      total: 0,
      conFechaAtencion: 0,
      sinFechaAtencion: 0,
      conFechaAsignacionSolo: 0
    };

    if (Array.isArray(pacientes)) {
      console.log(`\n📅 v1.67.6: Procesando ${pacientes.length} pacientes por FECHA DE ATENCIÓN...`);
      pacientes.forEach((p, idx) => {
        contadores.total++;

        // PREFERENCIA 1: Usar fechaAtencion (cuándo debe atender)
        if (p.fechaAtencion) {
          const fechaAtencion = typeof p.fechaAtencion === 'string'
            ? p.fechaAtencion.split('T')[0]
            : p.fechaAtencion;

          console.log(`[${idx}] ${p.apellidosNombres.substring(0, 30)}: fechaAtencion="${fechaAtencion}" ✅`);
          if (fechaAtencion) {
            fechasMap[fechaAtencion] = (fechasMap[fechaAtencion] || 0) + 1;
            contadores.conFechaAtencion++;
          }
        }
        // FALLBACK: Si NO tiene fechaAtencion, usar fechaAsignacion
        else if (p.fechaAsignacion) {
          const fechaAsignacion = extraerFecha(p.fechaAsignacion);
          console.log(`[${idx}] ${p.apellidosNombres.substring(0, 30)}: SIN fechaAtencion, usando fechaAsignacion="${fechaAsignacion}" ⚠️`);
          if (fechaAsignacion) {
            fechasMap[fechaAsignacion] = (fechasMap[fechaAsignacion] || 0) + 1;
            contadores.conFechaAsignacionSolo++;
          }
        }
        else {
          console.log(`[${idx}] ${p.apellidosNombres.substring(0, 30)}: SIN fechaAtencion NI fechaAsignacion ❌`);
          contadores.sinFechaAtencion++;
        }
      });
    }
    console.log('📊 ESTADÍSTICAS:', contadores);
    console.log('📅 RESULTADO FINAL - Fechas de ATENCIÓN:', fechasMap);
    return fechasMap;
  }, [pacientes]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [modalAccion, setModalAccion] = useState(null);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState('Pendiente');
  const [razonDesercion, setRazonDesercion] = useState('');

  // ✅ v1.50.0: Modal de detalles del paciente
  const [mostrarDetalles, setMostrarDetalles] = useState(false);
  const [pacienteDetalles, setPacienteDetalles] = useState(null);

  // ✅ v1.47.0: Estados para modal Atender Paciente
  const [tieneRecita, setTieneRecita] = useState(false);
  const [recitaDias, setRecitaDias] = useState(7);
  const [expandRecita, setExpandRecita] = useState(false);

  const [tieneInterconsulta, setTieneInterconsulta] = useState(false);
  const [interconsultaEspecialidad, setInterconsultaEspecialidad] = useState('');
  const [expandInterconsulta, setExpandInterconsulta] = useState(false);

  const [esCronico, setEsCronico] = useState(false);
  const [enfermedadesCronicas, setEnfermedadesCronicas] = useState([]);
  const [otroDetalle, setOtroDetalle] = useState('');
  const [expandCronico, setExpandCronico] = useState(false);

  const [especialidades, setEspecialidades] = useState([]);
  const [notasAccion, setNotasAccion] = useState('');

  // ✅ v1.64.0: Estados para editar Bolsa 107 campos
  const [editingField, setEditingField] = useState(null); // 'consentimiento' o 'tiempo'
  const [pacienteEditando, setPacienteEditando] = useState(null);
  const [editValue, setEditValue] = useState('');

  // ============ v1.49.0: FILTROS AVANZADOS ============
  const [filtroIpress, setFiltroIpress] = useState('');
  const [filtroRangoFecha, setFiltroRangoFecha] = useState('hoy');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [ipressDisponibles, setIpressDisponibles] = useState([]);
  const [ordenarPor, setOrdenarPor] = useState('reciente');

  // ✅ v1.66.0: CALENDARIO PROFESIONAL DE ASIGNACIONES
  const [fechaSeleccionadaCalendario, setFechaSeleccionadaCalendario] = useState(null);

  // ============ v1.62.0: FILTRO DE FECHA DE ATENCIÓN ============
  const [fechaAtencionSeleccionada, setFechaAtencionSeleccionada] = useState('');
  const [fechasAtencionDisponibles, setFechasAtencionDisponibles] = useState([]);

  // ✅ v1.64.0: FILTRO DE TIPO DE BOLSA ============
  const [filtroBolsa, setFiltroBolsa] = useState('');
  const [bolsasDelMedico, setBolsasDelMedico] = useState([]);
  const filtroAutoAplicado = React.useRef(false);

  // ✅ v1.65.2: Estado para filtros colapsables
  const [filtrosExpandidos, setFiltrosExpandidos] = useState(false);

  // ✅ v1.66.1: Estados para visualización y evaluación de ECGs en tabla
  const [showECGModal, setShowECGModal] = useState(false);
  const [ecgActual, setEcgActual] = useState(null);
  const [cargandoECG, setCargandoECG] = useState(false);
  const [ecgCounts, setEcgCounts] = useState({});
  const [evaluacionesEstados, setEvaluacionesEstados] = useState({}); // ✅ Rastrear estado de evaluación por DNI
  const [showResultadosModal, setShowResultadosModal] = useState(false); // ✅ Modal para ver resultados
  const [resultadosActuales, setResultadosActuales] = useState(null); // ✅ Resultados a mostrar
  const [pacientesRechazados, setPacientesRechazados] = useState({}); // ✅ v1.92.0: Rastrear imágenes rechazadas (OBSERVADA) por DNI

  // ✅ v1.64.0: Estados para Modal Crear Ticket Mesa de Ayuda
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [pacienteTicket, setPacienteTicket] = useState(null);
  const [ticketDetalleModal, setTicketDetalleModal] = useState(null);
  const [ticketsMedico, setTicketsMedico] = useState({});

  const bolsasDisponibles = [
    { id: 1, nombre: 'Bolsa 107 (Módulo 107)' },
    { id: 2, nombre: 'Dengue' },
    { id: 3, nombre: 'PADOMI' },
    { id: 4, nombre: 'Referencia INTER' }
  ];

  // ✅ v1.64.0: Auto-detectar bolsas del médico (SIN aplicar filtro automático)
  useEffect(() => {
    if (pacientes && pacientes.length > 0 && !filtroAutoAplicado.current) {
      // Detectar qué bolsas tiene el médico
      const bolsasUnicos = [...new Set(
        pacientes
          .map(p => p.idBolsa)
          .filter(b => b !== null && b !== undefined)
      )].sort((a, b) => a - b);

      console.log('🔍 Bolsas detectadas del médico:', bolsasUnicos);
      setBolsasDelMedico(bolsasUnicos);

      // POR DEFECTO: Mostrar TODAS las bolsas (sin filtro automático)
      // El médico puede seleccionar una bolsa específica del dropdown si lo desea
      console.log('✅ Cargando todas las bolsas por defecto (sin filtro automático)');
      filtroAutoAplicado.current = true;
    }
  }, [pacientes]);

  // ✅ v1.65.0: Cargar tickets del médico para mostrar estado en columna
  const cargarTicketsMedico = async (idMedico) => {
    try {
      const result = await mesaAyudaService.obtenerPorMedico(idMedico, 0, 500);
      const tickets = result?.data?.content || [];
      const mapa = {};
      for (const t of tickets) {
        if (t.dniPaciente && (!mapa[t.dniPaciente] || t.id > mapa[t.dniPaciente].id)) {
          mapa[t.dniPaciente] = t;
        }
      }
      setTicketsMedico(mapa);
    } catch (error) {
      console.error('⚠️ Error al cargar tickets del médico:', error);
    }
  };

  // ✅ v1.78.0: Cargar información del médico logueado (especialidad)
  useEffect(() => {
    const cargarInfoMedico = async () => {
      try {
        const info = await gestionPacientesService.obtenerInfoMedicoActual();
        console.log('✅ v1.78.0: Información del doctor cargada:', info);
        setDoctorInfo(info);
        if (info?.idPersonal) cargarTicketsMedico(info.idPersonal);
      } catch (error) {
        console.error('⚠️ v1.78.0: Error al cargar información del doctor:', error);
      }
    };
    cargarInfoMedico();
  }, []);

  // ✅ v1.78.0: Cargar especialidades PRIMERO, luego pacientes (evita race condition)
  useEffect(() => {
    cargarEspecialidades();
  }, []);

  // ✅ v1.104.0: Cargar pacientes con timeout - no esperar indefinidamente si especialidades falla
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('✅ v1.104.0: Cargando pacientes (timeout de especialidades)...');
      cargarPacientes();
    }, 1000);

    // Si especialidades carga antes del timeout, cargar de inmediato
    if (especialidades.length > 0) {
      clearTimeout(timer);
      console.log('✅ v1.78.0: Especialidades cargadas, ahora cargando pacientes...');
      cargarPacientes();
    }

    return () => clearTimeout(timer);
  }, [especialidades.length]);

  // ✅ v1.78.0: Cargar ECGs cuando se detecta que es cardiólogo
  useEffect(() => {
    if (esCardiologo && pacientes.length > 0) {
      console.log('✅ v1.78.0: Cargando conteos de ECG para cardiólogo...');
      cargarConteosECG(pacientes);
      // ✅ v1.80.0: Cargar estados de evaluación de ECGs
      cargarEstadosEvaluacion(pacientes);
    }
  }, [esCardiologo, pacientes]);

  const cargarEspecialidades = async () => {
    try {
      const data = await obtenerEspecialidadesActivasCenate();
      setEspecialidades(Array.isArray(data) ? data : []);
      console.log('✅ Especialidades CENATE cargadas:', data);
    } catch (error) {
      console.error('Error cargando especialidades CENATE:', error);
    }
  };

  // ✅ v1.49.0: Cargar IPRESS disponibles
  useEffect(() => {
    const cargarIpress = async () => {
      try {
        const data = await ipressService.obtenerActivas();

        if (data && Array.isArray(data) && data.length > 0) {
          // Usar datos del API
          const ipressFormatted = data.map(i => ({
            id: i.idIpress,
            nombre: i.descIpress
          }));
          setIpressDisponibles(ipressFormatted);
        } else {
          // Fallback: extraer IPRESS únicas de pacientes
          const ipressUnicos = [...new Set(
            pacientes
              .map(p => p.ipress)
              .filter(i => i && i !== '-')
          )].sort();

          setIpressDisponibles(ipressUnicos.map((nombre, idx) => ({
            id: idx,
            nombre
          })));
        }
      } catch (error) {
        console.error('Error cargando IPRESS:', error);
        // Fallback en caso de error
        const ipressUnicos = [...new Set(
          pacientes.map(p => p.ipress).filter(i => i && i !== '-')
        )].sort();
        setIpressDisponibles(ipressUnicos.map((nombre, idx) => ({
          id: idx,
          nombre
        })));
      }
    };

    if (pacientes.length > 0) {
      cargarIpress();
    }
  }, [pacientes]);

  const cargarPacientes = async () => {
    try {
      setLoading(true);
      const data = await gestionPacientesService.obtenerPacientesMedico();
      console.log('🔍 [DEBUG] Datos del API:', data);
      if (data?.length > 0) {
        console.log('🔍 [DEBUG] Primer paciente estructura:', data[0]);
        console.log('🔍 [DEBUG] Campos disponibles:', Object.keys(data[0]));
        console.log('🔍 [DEBUG] ipress:', data[0].ipress);
        console.log('🔍 [DEBUG] fechaAsignacion:', data[0].fechaAsignacion);
        console.log('🔍 [DEBUG] TODOS LOS CAMPOS:', JSON.stringify(data[0], null, 2));
      }
      setPacientes(Array.isArray(data) ? data : []);

      // ✅ v1.78.0: Detectar especialidad desde el primer paciente si no está en contexto
      if (data?.length > 0 && !authUser?.especialidad && especialidades.length > 0) {
        const primerPaciente = data[0];
        let especialidadDetectada = null;

        // El especialidadMedico viene del backend como ID (número)
        if (primerPaciente?.especialidadMedico) {
          const especIdMedico = parseInt(primerPaciente.especialidadMedico);

          // ✅ FIX v1.78.0: Usar descServicio en lugar de nombre (bug encontrado)
          const especialidadEncontrada = especialidades.find(esp => esp.id === especIdMedico);

          if (especialidadEncontrada?.descServicio) {
            especialidadDetectada = detectSpecialtyByKeywords(especialidadEncontrada.descServicio);
            console.log('✅ v1.78.0: Especialidad encontrada en backend:', especialidadEncontrada.descServicio);
            console.log('✅ v1.78.0: Especialidad mapeada a:', especialidadDetectada);

            if (especialidadDetectada) {
              setUserSpecialty(especialidadDetectada);
              console.log('✅ v1.78.0: Sistema de especialidades activado para:', especialidadDetectada);
            }
          } else {
            console.warn('⚠️ v1.78.0: No se encontró especialidad con ID:', especIdMedico);
            console.warn('⚠️ v1.78.0: IDs disponibles:', especialidades.map(e => e.id).join(', '));
          }
        }
      }

      // ✅ v1.78.0: Mostrar notificación de carga
      if (data?.length > 0) {
        toast.success(`${data.length} pacientes cargados`);
        // Los ECGs se cargarán automáticamente en el useEffect cuando se detecte la especialidad

        // ✅ v1.80.5: Cargar fechas de toma EKG en background (sin bloquear UI)
        cargarFechasTomaEKG(data);
      }
    } catch (error) {
      console.error('Error cargando pacientes:', error);
      toast.error('Error al cargar pacientes');
      setPacientes([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ v1.80.5: Cargar fechas de toma EKG desde endpoint separado (transacción separada)
  const cargarFechasTomaEKG = async (pacientesActuales) => {
    try {
      const dnis = [...new Set(pacientesActuales.map(p => p.numDoc).filter(Boolean))];
      if (dnis.length === 0) return;

      // Procesar en chunks de 10 para no saturar el backend
      const chunks = [];
      for (let i = 0; i < dnis.length; i += 10) {
        chunks.push(dnis.slice(i, i + 10));
      }

      // Recolectar todos los updates antes de hacer setState
      const updates = {};

      for (const chunk of chunks) {
        await Promise.all(
          chunk.map(async (dni) => {
            try {
              const datosEKG = await gestionPacientesService.obtenerDatosEKGPaciente(dni);
              console.log(`📅 [EKG ${dni}] Respuesta del servidor:`, datosEKG);

              // Siempre actualizar, aunque sea null
              if (datosEKG) {
                updates[dni] = datosEKG.fechaTomaEKG;
                console.log(`✅ [EKG ${dni}] Fecha actualizada a:`, datosEKG.fechaTomaEKG);
              }
            } catch (error) {
              console.warn(`❌ Error cargando fecha EKG para DNI ${dni}:`, error);
              updates[dni] = null;
            }
          })
        );
      }

      // Aplicar todas las actualizaciones de una vez
      const pacientesActualizados = pacientesActuales.map(p => {
        if (updates.hasOwnProperty(p.numDoc)) {
          return { ...p, fechaTomaEKG: updates[p.numDoc] };
        }
        return p;
      });

      setPacientes(pacientesActualizados);
      console.log('✅ [FECHA TOMA EKG] Fechas cargadas para todos los pacientes', updates);
    } catch (error) {
      console.error('❌ Error cargando fechas de toma EKG:', error);
    }
  };

  // ✅ v1.66.0: Cargar conteos de ECG para todos los pacientes (en lotes de 10)
  const cargarConteosECG = async (pacientesActuales) => {
    try {
      console.log('🚀 [v1.89.8] Cargando conteos ECG con BATCH...');
      const startTime = performance.now();

      // ✅ v1.89.8: BATCH endpoint - UNA sola llamada en lugar de 21
      const ecgsPorPaciente = await gestionPacientesService.obtenerECGsBatch();

      const counts = {};
      Object.keys(ecgsPorPaciente).forEach(dni => {
        counts[dni] = Array.isArray(ecgsPorPaciente[dni]) ? ecgsPorPaciente[dni].length : 0;
      });

      setEcgCounts(counts);

      const endTime = performance.now();
      const tiempoMs = (endTime - startTime).toFixed(0);
      console.log(`✅ [v1.89.8] Conteos cargados en ${tiempoMs}ms:`, counts);
    } catch (error) {
      console.error('❌ [v1.89.8] Error cargando conteos ECG:', error);
    }
  };

  // ✅ v1.92.0: Cargar estados de evaluación ECG + detectar rechazos (en background, sin bloquear UI)
  const cargarEstadosEvaluacion = async (pacientesActuales) => {
    try {
      console.log('🚀 [v1.89.8] Cargando estados de evaluación ECG con BATCH...');
      const startTime = performance.now();

      const estados = {};
      const rechazos = {}; // ✅ v1.92.0: Rastrear imágenes rechazadas (OBSERVADA)

      // ✅ v1.89.8: BATCH endpoint - UNA sola llamada en lugar de 21
      const ecgsPorPaciente = await gestionPacientesService.obtenerECGsBatch();

      Object.keys(ecgsPorPaciente).forEach(dni => {
        const imagenes = ecgsPorPaciente[dni];

        if (imagenes && Array.isArray(imagenes)) {
          // ✅ v1.92.0: Detectar imágenes rechazadas (estado OBSERVADA)
          const imagenesRechazadas = imagenes.filter(
            img => img && img.estado === 'OBSERVADA'
          );

          if (imagenesRechazadas.length > 0) {
            rechazos[dni] = {
              cantidad: imagenesRechazadas.length,
              motivos: imagenesRechazadas.map(img => ({
                id: img.idImagen || img.id_imagen,
                observaciones: img.observaciones || img.observacionesClinicas || '',
                fecha: img.fechaEnvio || img.fecha_envio || ''
              }))
            };
            console.log(`⚠️ Paciente ${dni} tiene ${imagenesRechazadas.length} imagen(es) rechazada(s)`);
          }

          // Obtener la última evaluación
          const evaluadas = imagenes.filter(
            img => img && img.evaluacion && img.evaluacion !== 'SIN_EVALUAR'
          );

          if (evaluadas.length > 0) {
            const ultima = evaluadas[evaluadas.length - 1];
            estados[dni] = {
              estado: 'EVALUADO',
              datos: {
                evaluacion: ultima.evaluacion || '',
                descripcion: ultima.descripcion_evaluacion || ultima.descripcionEvaluacion || '',
                fecha: ultima.fechaEvaluacion || '',
                hallazgos: ultima.hallazgos || '',
                observacionesClinicas: ultima.observacionesClinicas || ''
              }
            };
          } else {
            estados[dni] = { estado: 'PENDIENTE' };
          }
        } else {
          estados[dni] = { estado: 'SIN_IMAGENES' };
        }
      });

      setEvaluacionesEstados(estados);
      setPacientesRechazados(rechazos); // ✅ v1.92.0: Guardar rechazos

      const endTime = performance.now();
      const tiempoMs = (endTime - startTime).toFixed(0);
      console.log(`✅ [v1.89.8] Estados cargados en ${tiempoMs}ms`);
    } catch (error) {
      console.error('❌ [v1.89.8] Error cargando estados evaluación:', error);
    }
  };

  // ✅ v1.89.0: Parsear texto de evaluación para extraer secciones
  const parsearEvaluacionCompleta = (descripcion) => {
    if (!descripcion) return { hallazgos: '', observacionesClinicas: '' };

    // Extraer HALLAZGOS (pueden ser NORMALES o ANORMALES)
    let hallazgos = '';
    if (descripcion.includes('HALLAZGOS NORMALES:')) {
      hallazgos = descripcion.split('HALLAZGOS NORMALES:')[1]?.split('OBSERVACIONES CLÍNICAS:')[0]?.trim() || '';
    } else if (descripcion.includes('HALLAZGOS ANORMALES:')) {
      hallazgos = descripcion.split('HALLAZGOS ANORMALES:')[1]?.split('OBSERVACIONES CLÍNICAS:')[0]?.trim() || '';
    }

    // Extraer OBSERVACIONES CLÍNICAS
    const observacionesClinicas = descripcion.split('OBSERVACIONES CLÍNICAS:')[1]?.trim() || '';

    return {
      hallazgos: hallazgos ? hallazgos.split('\n').filter(h => h.trim().startsWith('-')).map(h => h.replace(/^-\s*/, '').trim()).join('\n') : '',
      observacionesClinicas
    };
  };

  // ✅ v1.80.0: Función para abrir modal de resultados
  const abrirResultadosEvaluacion = (paciente) => {
    const estado = evaluacionesEstados[paciente.numDoc];
    if (estado?.datos) {
      // ✅ v1.89.0: Parsear descripción completa para extraer hallazgos y observaciones
      const { hallazgos, observacionesClinicas } = parsearEvaluacionCompleta(estado.datos.descripcion);

      setResultadosActuales({
        paciente,
        ...estado.datos,
        hallazgos: hallazgos || estado.datos.hallazgos,
        observacionesClinicas: observacionesClinicas || estado.datos.observacionesClinicas
      });
      setShowResultadosModal(true);
    } else {
      toast.info('No hay evaluación disponible para este paciente');
    }
  };

  // ✅ v1.49.0: Filtrado completo con 5 niveles
  const pacientesFiltrados = React.useMemo(() => {
    let resultados = [...pacientes];

    // 1. Filtro búsqueda (DNI/Nombre)
    if (busqueda.trim()) {
      const searchLower = busqueda.toLowerCase();
      resultados = resultados.filter(p =>
        (p.apellidosNombres?.toLowerCase().includes(searchLower)) ||
        (p.numDoc?.includes(busqueda))
      );
    }

    // 2. Filtro condición
    if (filtroEstado) {
      resultados = resultados.filter(p => p.condicion === filtroEstado);
    }

    // 3. NUEVO: Filtro de Tipo de Bolsa (v1.64.0)
    if (filtroBolsa) {
      resultados = resultados.filter(p => p.idBolsa === parseInt(filtroBolsa));
    }

    // 4. NUEVO: Filtro IPRESS
    if (filtroIpress) {
      resultados = resultados.filter(p => p.ipress === filtroIpress);
    }

    // 5. NUEVO: Filtro rango fecha
    if (filtroRangoFecha !== 'todos') {
      const ahora = new Date();
      const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());

      resultados = resultados.filter(p => {
        if (!p.fechaAsignacion) return false;

        // Parsear ISO 8601 (maneja Z y offset)
        let fechaPaciente;
        if (p.fechaAsignacion.endsWith('Z')) {
          fechaPaciente = new Date(new Date(p.fechaAsignacion).getTime() - (5 * 60 * 60 * 1000));
        } else {
          fechaPaciente = new Date(p.fechaAsignacion);
        }

        const fechaSoloFecha = new Date(
          fechaPaciente.getFullYear(),
          fechaPaciente.getMonth(),
          fechaPaciente.getDate()
        );

        switch (filtroRangoFecha) {
          case 'hoy':
            return fechaSoloFecha.getTime() === hoy.getTime();

          case 'ayer':
            const ayer = new Date(hoy);
            ayer.setDate(ayer.getDate() - 1);
            return fechaSoloFecha.getTime() === ayer.getTime();

          case '7dias':
            const hace7Dias = new Date(hoy);
            hace7Dias.setDate(hace7Dias.getDate() - 7);
            return fechaSoloFecha >= hace7Dias && fechaSoloFecha <= hoy;

          case 'personalizado':
            if (!fechaDesde && !fechaHasta) return true;

            const desde = fechaDesde ? new Date(fechaDesde + 'T00:00:00') : null;
            const hasta = fechaHasta ? new Date(fechaHasta + 'T23:59:59') : null;

            if (desde && hasta) {
              return fechaPaciente >= desde && fechaPaciente <= hasta;
            } else if (desde) {
              return fechaPaciente >= desde;
            } else if (hasta) {
              return fechaPaciente <= hasta;
            }
            return true;

          default:
            return true;
        }
      });
    }

    // 6. NUEVO: Ordenamiento
    if (ordenarPor === 'reciente') {
      resultados.sort((a, b) => {
        if (!a.fechaAsignacion) return 1;
        if (!b.fechaAsignacion) return -1;
        return new Date(b.fechaAsignacion) - new Date(a.fechaAsignacion);
      });
    } else if (ordenarPor === 'antiguo') {
      resultados.sort((a, b) => {
        if (!a.fechaAsignacion) return 1;
        if (!b.fechaAsignacion) return -1;
        return new Date(a.fechaAsignacion) - new Date(b.fechaAsignacion);
      });
    }

    return resultados;
  }, [pacientes, busqueda, filtroEstado, filtroBolsa, filtroIpress, filtroRangoFecha, fechaDesde, fechaHasta, ordenarPor]);

  const formatearFecha = (fecha) => {
    if (!fecha) return '-';

    try {
      // ✅ v1.47.0: Manejo de dos formatos de ISO 8601
      // 1. Con offset: "2026-02-06T08:06:44.765279-05:00" (hora LOCAL con offset)
      // 2. Con Z (UTC): "2026-02-06T10:58:54.563975Z" (UTC, requiere conversión a -05:00)

      let año, mes, día, hora, minuto, segundo;

      if (fecha.endsWith('Z')) {
        // Formato UTC (Z) - necesita conversión a hora local Peru (-05:00)
        // Crear Date object desde ISO string con Z
        const date = new Date(fecha);

        // Convertir a Peru local time (UTC-5)
        // Restar 5 horas al UTC
        let peruDate = new Date(date.getTime() - (5 * 60 * 60 * 1000));

        año = peruDate.getUTCFullYear();
        mes = String(peruDate.getUTCMonth() + 1).padStart(2, '0');
        día = String(peruDate.getUTCDate()).padStart(2, '0');
        hora = String(peruDate.getUTCHours()).padStart(2, '0');
        minuto = String(peruDate.getUTCMinutes()).padStart(2, '0');
        segundo = String(peruDate.getUTCSeconds()).padStart(2, '0');
      } else {
        // Formato con offset (±HH:MM) - ya es hora LOCAL, extraer componentes directamente
        // Expresión regex para ISO 8601: YYYY-MM-DDTHH:MM:SS[.ffffff][±HH:MM]
        const isoMatch = fecha.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?([+-]\d{2}):?(\d{2})?/);
        if (!isoMatch) return '-';

        año = isoMatch[1];
        mes = isoMatch[2];
        día = isoMatch[3];
        hora = isoMatch[4];
        minuto = isoMatch[5];
        segundo = isoMatch[6];
      }

      // Convertir a números para formateo
      const h = parseInt(hora);
      const m = parseInt(minuto);
      const s = parseInt(segundo);
      const d = parseInt(día);
      const mo = parseInt(mes);
      const y = parseInt(año);

      // Formatear en 12 horas con AM/PM
      const meridiem = h >= 12 ? 'p. m.' : 'a. m.';
      const h12 = h % 12 || 12;

      return `${String(d).padStart(2, '0')}/${String(mo).padStart(2, '0')}/${y}, ${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')} ${meridiem}`;
    } catch (e) {
      console.error('Error formateando fecha:', fecha, e);
      return '-';
    }
  };

  // ✅ v1.48.0: Formato humanizado sin segundos (para tabla)
  // ✅ v1.80.6: Formatear SOLO fecha sin hora (para FECHA TOMA EKG)
  const formatearSoloFecha = (fecha) => {
    if (!fecha) return '-';

    try {
      let año, mes, día;

      // Manejar fechas DATE simples (YYYY-MM-DD)
      const dateOnlyMatch = fecha.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (dateOnlyMatch) {
        año = dateOnlyMatch[1];
        mes = dateOnlyMatch[2];
        día = dateOnlyMatch[3];
      } else if (fecha.endsWith('Z')) {
        const date = new Date(fecha);
        let peruDate = new Date(date.getTime() - (5 * 60 * 60 * 1000));
        año = String(peruDate.getUTCFullYear());
        mes = String(peruDate.getUTCMonth() + 1).padStart(2, '0');
        día = String(peruDate.getUTCDate()).padStart(2, '0');
      } else {
        const isoMatch = fecha.match(/(\d{4})-(\d{2})-(\d{2})/);
        if (!isoMatch) return '-';
        año = isoMatch[1];
        mes = isoMatch[2];
        día = isoMatch[3];
      }

      const d = parseInt(día);
      const mo = parseInt(mes);
      const y = parseInt(año);

      // Retornar solo la fecha en formato DD/MM/YY
      return `${String(d).padStart(2, '0')}/${String(mo).padStart(2, '0')}/${String(y).slice(-2)}`;
    } catch (e) {
      console.error('Error formateando solo fecha:', fecha, e);
      return '-';
    }
  };

  const formatearFechaHumana = (fecha) => {
    if (!fecha) return '-';

    try {
      let año, mes, día, hora, minuto;

      // ✅ v1.79.0: Manejar fechas DATE simples (YYYY-MM-DD) sin hora
      const dateOnlyMatch = fecha.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (dateOnlyMatch) {
        año = dateOnlyMatch[1];
        mes = dateOnlyMatch[2];
        día = dateOnlyMatch[3];
        hora = '00';
        minuto = '00';
      } else if (fecha.endsWith('Z')) {
        const date = new Date(fecha);
        let peruDate = new Date(date.getTime() - (5 * 60 * 60 * 1000));

        año = peruDate.getUTCFullYear();
        mes = String(peruDate.getUTCMonth() + 1).padStart(2, '0');
        día = String(peruDate.getUTCDate()).padStart(2, '0');
        hora = String(peruDate.getUTCHours()).padStart(2, '0');
        minuto = String(peruDate.getUTCMinutes()).padStart(2, '0');
      } else {
        const isoMatch = fecha.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?([+-]\d{2}):?(\d{2})?/);
        if (!isoMatch) return '-';

        año = isoMatch[1];
        mes = isoMatch[2];
        día = isoMatch[3];
        hora = isoMatch[4];
        minuto = isoMatch[5];
      }

      const h = parseInt(hora);
      const m = parseInt(minuto);
      const d = parseInt(día);
      const mo = parseInt(mes);
      const y = parseInt(año);

      // Verificar si es hoy
      const hoy = new Date();
      const peruHoy = new Date(hoy.getTime() - (5 * 60 * 60 * 1000));
      const diaHoy = peruHoy.getUTCDate();
      const mesHoy = peruHoy.getUTCMonth() + 1;
      const anoHoy = peruHoy.getUTCFullYear();

      const esHoy = d === diaHoy && mo === mesHoy && y === anoHoy;

      const meridiem = h >= 12 ? 'p. m.' : 'a. m.';
      const h12 = h % 12 || 12;
      const horaFormato = `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

      if (esHoy) {
        return `Hoy, ${horaFormato} ${meridiem}`;
      } else {
        return `${String(d).padStart(2, '0')}/${String(mo).padStart(2, '0')}/${String(y).slice(-2)} ${horaFormato} ${meridiem}`;
      }
    } catch (e) {
      console.error('Error formateando fecha humanizada:', fecha, e);
      return '-';
    }
  };

  // ✅ v1.63.0: Renderizar tiempo de inicio de síntomas con semáforo (ROJO/AMARILLO/VERDE)
  // ✅ v1.64.0: Renderizar tiempo inicio síntomas (EDITABLE en estado Pendiente)
  const renderTiempoInicioSintomas = (paciente) => {
    // Si no es Bolsa 107
    if (paciente.idBolsa !== 1) {
      return <span className="text-gray-400 text-xs">—</span>;
    }

    const tiempo = paciente.tiempoInicioSintomas;
    const esEditable = paciente.condicion === 'Pendiente';

    // Función para determinar colores
    const getColoresTimepo = (t) => {
      if (!t || t.trim() === '') {
        return { bgColor: 'bg-green-100', textColor: 'text-green-700', circleColor: 'bg-green-600' };
      }
      const tiempoUpper = t.toUpperCase();
      if (tiempoUpper.includes('< 24') || tiempoUpper.includes('<24')) {
        return { bgColor: 'bg-red-100', textColor: 'text-red-700', circleColor: 'bg-red-600' };
      } else if (tiempoUpper.includes('24') && tiempoUpper.includes('72')) {
        return { bgColor: 'bg-yellow-100', textColor: 'text-yellow-700', circleColor: 'bg-yellow-500' };
      } else {
        return { bgColor: 'bg-green-100', textColor: 'text-green-700', circleColor: 'bg-green-600' };
      }
    };

    const { bgColor, textColor, circleColor } = getColoresTimepo(tiempo);
    const displayTiempo = tiempo && tiempo.trim() !== '' ? tiempo : '> 72 hrs.';

    // Si es editable (Pendiente), renderizar como botón
    if (esEditable) {
      return (
        <button
          onClick={() => {
            setPacienteEditando(paciente);
            setEditingField('tiempo');
            setEditValue(tiempo || '> 72 hrs.');
          }}
          className={`inline-flex items-center gap-2 px-2 py-1 ${bgColor} ${textColor} rounded text-xs font-semibold cursor-pointer hover:shadow-md transition-all`}
          title="Click para editar tiempo de síntomas"
        >
          <span className={`w-2 h-2 ${circleColor} rounded-full`}></span>
          {displayTiempo}
        </button>
      );
    }

    // Si NO es editable, renderizar como span normal
    return (
      <span className={`inline-flex items-center gap-2 px-2 py-1 ${bgColor} ${textColor} rounded text-xs font-semibold`}>
        <span className={`w-2 h-2 ${circleColor} rounded-full`}></span>
        {displayTiempo}
      </span>
    );
  };

  // ✅ v1.64.0: Renderizar consentimiento informado (EDITABLE en estado Pendiente)
  // ✅ v1.64.2: El consentimiento informado aplica a TODAS las bolsas, no solo Bolsa 107
  const renderConsentimientoInformado = (paciente) => {

    // 🚨 Si está en estado "Deserción" → NO consentimiento (NO EDITABLE)
    if (paciente.condicion === 'Deserción') {
      return (
        <span className="inline-block bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-semibold">
          ✗ No
        </span>
      );
    }

    const consentimiento = paciente.consentimientoInformado;
    const esEditable = paciente.condicion === 'Pendiente';

    // Renderizar como botón clickeable si es Pendiente
    if (esEditable) {
      if (consentimiento === true || consentimiento === 'true' || consentimiento === 'v') {
        return (
          <button
            onClick={() => {
              setPacienteEditando(paciente);
              setEditingField('consentimiento');
              setEditValue('true');
            }}
            className="inline-block bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold cursor-pointer hover:bg-green-200 hover:shadow-md transition-all"
            title="Click para editar consentimiento"
          >
            ✓ Sí
          </button>
        );
      } else if (consentimiento === false || consentimiento === 'false') {
        return (
          <button
            onClick={() => {
              setPacienteEditando(paciente);
              setEditingField('consentimiento');
              setEditValue('false');
            }}
            className="inline-block bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-semibold cursor-pointer hover:bg-red-200 hover:shadow-md transition-all"
            title="Click para editar consentimiento"
          >
            ✗ No
          </button>
        );
      } else {
        // ✅ v1.64.2: Por defecto cuando es NULL, mostrar "✗ No" clickeable para que médico pueda cambiar a "✓ Sí"
        return (
          <button
            onClick={() => {
              setPacienteEditando(paciente);
              setEditingField('consentimiento');
              setEditValue('false');
            }}
            className="inline-block bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-semibold cursor-pointer hover:bg-red-200 hover:shadow-md transition-all"
            title="Click para editar consentimiento"
          >
            ✗ No
          </button>
        );
      }
    }

    // Si NO es editable (estado distinto a Pendiente), mostrar como span normal
    if (consentimiento === true || consentimiento === 'true' || consentimiento === 'v') {
      return (
        <span className="inline-block bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold">
          ✓ Sí
        </span>
      );
    } else if (consentimiento === false || consentimiento === 'false') {
      return (
        <span className="inline-block bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-semibold">
          ✗ No
        </span>
      );
    } else {
      // ✅ v1.64.2: Por defecto cuando es NULL, mostrar "✗ No"
      return (
        <span className="inline-block bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-semibold">
          ✗ No
        </span>
      );
    }
  };

  const getColorCondicion = (condicion) => {
    // ✅ v1.48.0: Colores más distintos y visualmente separados
    // - Pendiente: Naranja vibrante (llama atención = acción requerida)
    // - Atendido: Verde suave (descarte visual = completado)
    // - Citado: Azul profesional (estado intermedio)
    // - Reprogramación Fallida: Rojo (problema)
    // - No Contactado: Gris neutro (estado neutro)
    const colores = {
      'Citado': 'bg-sky-100 text-sky-700 border-sky-300',
      'Atendido': 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700',
      'Pendiente': 'bg-orange-100 text-orange-700 border-orange-300',
      'Reprogramación Fallida': 'bg-red-100 text-red-700 border-red-300',
      'No Contactado': 'bg-slate-100 text-slate-600 border-slate-300',
      'Rechazado': 'bg-purple-100 text-purple-700 border-purple-300' // ✅ v1.92.0: Morado para rechazos
    };
    return colores[condicion] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const abrirAccion = (paciente) => {
    setPacienteSeleccionado(paciente);
    setModalAccion('cambiarEstado');
    setEstadoSeleccionado('Pendiente'); // Por defecto
    setRazonDesercion('');
    setNotasAccion('');
  };

  // ✅ v1.50.0: Abrir modal de detalles del paciente
  const abrirDetallesPaciente = (paciente) => {
    setPacienteDetalles(paciente);
    setMostrarDetalles(true);
  };

  // ✅ v1.90.0: Abrir modal de evaluación de ECG - AHORA CON TODAS LAS IMÁGENES
  const abrirCarruselECG = async (paciente) => {
    try {
      setCargandoECG(true);

      // ⚡ OPTIMIZACIÓN: Abrir modal INMEDIATAMENTE (sin esperar imagen)
      setShowECGModal(true);

      // ⚡ Cargar datos en paralelo (Promise.all para mayor velocidad)
      const [resultado] = await Promise.all([
        teleecgService.listarAgrupoPorAsegurado(paciente.numDoc, ''),
      ]);

      if (resultado.length === 0 || !resultado[0].imagenes || resultado[0].imagenes.length === 0) {
        toast.error('No se encontraron imágenes ECG para este paciente');
        setCargandoECG(false);
        setShowECGModal(false);
        return;
      }

      // ✅ v1.90.0: Obtener TODAS las imágenes (no solo la primera)
      const todasLasImagenes = resultado[0].imagenes;

      // ⚡ Cargar TODAS las imágenes en paralelo
      const imagenesConContenido = await Promise.all(
        todasLasImagenes.map(async (ecg) => {
          try {
            const idImagen = ecg.id_imagen || ecg.idImagen;
            const preview = await teleecgService.verPreview(idImagen);
            return {
              ...ecg,
              ...preview,
            };
          } catch (error) {
            console.error('Error cargando preview para imagen:', error);
            // Retornar la imagen sin contenido en lugar de fallar
            return ecg;
          }
        })
      );

      // Preparar objeto ECG para el modal CON TODAS LAS IMÁGENES
      const ecgParaModal = {
        imagenes: imagenesConContenido,  // ✅ ARRAY DE TODAS LAS IMÁGENES
        paciente: {
          numDoc: paciente.numDoc,
          nombres: paciente.apellidosNombres,
          ipress: paciente.ipress,
        },
      };

      setEcgActual(ecgParaModal);
      setCargandoECG(false);

    } catch (error) {
      console.error('Error cargando ECG:', error);
      toast.error('Error al cargar las imágenes ECG');
      setCargandoECG(false);
      setShowECGModal(false);
    }
  };

  // ✅ v1.66.1: Manejar confirmación de evaluación de ECG
  const manejarConfirmacionECG = async (tipoEvaluacion, evaluacionCompleta, idImagen, contextoMedico) => {
    try {
      console.log('✅ Evaluación ECG confirmada:', {tipoEvaluacion, idImagen, contextoMedico});

      // ✅ v1.80.2: Guardar evaluación en backend usando API
      // El endpoint espera: PUT /teleekgs/{idImagen}/evaluar
      // Con body: { evaluacion: "NORMAL|ANORMAL|NO_DIAGNOSTICO", descripcion: "texto" }

      if (!idImagen) {
        toast.error('❌ No se pudo obtener ID de la imagen');
        return;
      }

      // ✅ v1.89.0: ENVIAR TEXTO COMPLETO con hallazgos + observaciones
      // El backend almacena en descripcion_evaluacion toda la información
      // Esto permite ver hallazgos + comentarios cuando se abre "Ver Detalles"
      const descripcionCompleta = evaluacionCompleta;

      // Preparar payload para el API
      const payload = {
        evaluacion: tipoEvaluacion,
        descripcion: descripcionCompleta
      };

      console.log('📤 Enviando evaluación COMPLETA al backend:', payload);

      // Llamar al API para guardar evaluación
      const response = await teleecgService.evaluarImagen(idImagen, tipoEvaluacion, descripcionCompleta);

      console.log('✅ Respuesta del backend:', response);

      toast.success('✅ Evaluación guardada correctamente en el backend');

      // ✅ v1.80.0: No cerrar el modal automáticamente
      // El modal se cierra cuando el usuario hace clic en "Atendido"
      // después de revisar los detalles con el botón "Ver Detalles"

      // ✅ v1.86.2: Recargar datos para mostrar estetoscopio azul actualizado
      cargarPacientes();
    } catch (error) {
      console.error('❌ Error guardando evaluación:', error);
      toast.error('❌ Error al guardar la evaluación: ' + (error.message || 'Error desconocido'));
    }
  };

  const procesarAccion = async () => {
    if (!pacienteSeleccionado) return;

    // ✅ v1.47.0: Si seleccionó "Atendido", registrar atención (opciones son opcionales)
    if (estadoSeleccionado === 'Atendido') {
      await procesarAtencionMedica();
      return;
    }

    // Validación para deserción
    if (estadoSeleccionado === 'Deserción' && !razonDesercion) {
      toast.error('Debe seleccionar una razón para registrar deserción');
      return;
    }

    try {
      setProcesando(true);

      // Preparar observaciones basadas en el estado
      let observaciones = '';
      if (estadoSeleccionado === 'Deserción') {
        observaciones = `Deserción registrada. Razón: ${razonDesercion}`;
      }
      // ✅ Cuando es "Pendiente": observaciones quedan vacías (borrar motivo)

      // ✅ v1.46.0: Usar idSolicitudBolsa si existe (pacientes de dim_solicitud_bolsa)
      // Si no, usar idGestion (pacientes de gestion_paciente)
      const idParaActualizar = pacienteSeleccionado.idSolicitudBolsa || pacienteSeleccionado.idGestion;

      console.log('🔍 [DEBUG] Actualizando condición:', {
        idSolicitudBolsa: pacienteSeleccionado.idSolicitudBolsa,
        idGestion: pacienteSeleccionado.idGestion,
        idParaActualizar,
        estado: estadoSeleccionado
      });

      // Guardar cambio en la base de datos
      await gestionPacientesService.actualizarCondicion(
        idParaActualizar,
        estadoSeleccionado,
        observaciones
      );

      // Mensaje de éxito
      if (estadoSeleccionado === 'Deserción') {
        toast.success(`Deserción registrada: ${razonDesercion} ✓`);
      } else {
        toast.success(`Estado cambiado a "${estadoSeleccionado}" ✓`);
      }

      // ✅ v1.47.0: Recargar lista de pacientes para obtener la fecha de atención actualizada
      await cargarPacientes();

      setModalAccion(null);
      setPacienteSeleccionado(null);
      setEstadoSeleccionado('Pendiente');
      setRazonDesercion('');
    } catch (error) {
      console.error('Error procesando acción:', error);
      toast.error('Error al cambiar estado. Intenta nuevamente.');
    } finally {
      setProcesando(false);
    }
  };

  // ✅ v1.47.0: Procesar atención médica (Recita + Interconsulta + Crónico)
  const procesarAtencionMedica = async () => {
    if (!pacienteSeleccionado) return;

    // ✅ v1.47.0: Opciones son opcionales - el médico decide si son necesarias
    try {
      setProcesando(true);

      const idParaAtender = pacienteSeleccionado.idSolicitudBolsa || pacienteSeleccionado.idGestion;

      const payload = {
        tieneRecita,
        recitaDias: tieneRecita ? recitaDias : null,
        tieneInterconsulta,
        interconsultaEspecialidad: tieneInterconsulta ? interconsultaEspecialidad : null,
        esCronico,
        enfermedades: esCronico ? enfermedadesCronicas : []
        // ✅ v1.47.2: Sin otroDetalle - solo respuestas cerradas (Hipertensión, Diabetes)
      };

      console.log('🏥 [v1.47.0] Registrando atención:', payload);

      // 1️⃣ Registrar atención médica
      await gestionPacientesService.atenderPaciente(idParaAtender, payload);

      // 2️⃣ Cambiar estado a Atendido en la BD
      await gestionPacientesService.actualizarCondicion(
        idParaAtender,
        'Atendido',
        ''
      );

      // 3️⃣ Actualizar el estado local INMEDIATAMENTE (sin recargar del servidor)
      setPacientes(prevPacientes =>
        prevPacientes.map(p =>
          (p.idSolicitudBolsa === idParaAtender || p.idGestion === idParaAtender)
            ? { ...p, condicion: 'Atendido' }
            : p
        )
      );

      toast.success('✅ Atención registrada correctamente');

      // 4️⃣ Cerrar modales
      setModalAccion(null);
      setPacienteSeleccionado(null);
      setEstadoSeleccionado('Pendiente');

      // Limpiar campos del modal
      setTieneRecita(false);
      setRecitaDias(7);
      setTieneInterconsulta(false);
      setInterconsultaEspecialidad('');
      setEsCronico(false);
      setEnfermedadesCronicas([]);
      setOtroDetalle('');
    } catch (error) {
      console.error('Error registrando atención:', error);
      toast.error('Error al registrar atención. Intenta nuevamente.');
    } finally {
      setProcesando(false);
    }
  };

  // ✅ v1.64.0: Actualizar Consentimiento Informado durante atención
  const actualizarConsentimiento = async (pacienteId, nuevoValor) => {
    try {
      setProcesando(true);
      await gestionPacientesService.actualizarCondicion(
        pacienteId,
        pacienteEditando.condicion,
        JSON.stringify({ consentimientoInformado: nuevoValor })
      );
      toast.success('✅ Consentimiento actualizado');
      setEditingField(null);
      setPacienteEditando(null);
      cargarPacientes();
    } catch (error) {
      console.error('Error al actualizar consentimiento:', error);
      toast.error('Error al actualizar consentimiento');
    } finally {
      setProcesando(false);
    }
  };

  // ✅ v1.64.0: Actualizar Tiempo Inicio Síntomas durante atención
  const actualizarTiempoSintomas = async (pacienteId, nuevoTiempo) => {
    try {
      setProcesando(true);
      await gestionPacientesService.actualizarCondicion(
        pacienteId,
        pacienteEditando.condicion,
        JSON.stringify({ tiempoInicioSintomas: nuevoTiempo })
      );
      toast.success('✅ Tiempo de síntomas actualizado');
      setEditingField(null);
      setPacienteEditando(null);
      cargarPacientes();
    } catch (error) {
      console.error('Error al actualizar tiempo síntomas:', error);
      toast.error('Error al actualizar tiempo de síntomas');
    } finally {
      setProcesando(false);
    }
  };

  // ✅ v1.62.0: Obtener fechas de atención únicas según estado filtrado
  // ✅ v1.65.1: Obtener fechas de atención filtradas por estado
  const obtenerFechasAtencion = () => {
    let pacientesAFiltrar = pacientes;

    // 1️⃣ Aplicar filtro de estado si existe
    if (filtroEstado) {
      pacientesAFiltrar = pacientesAFiltrar.filter(p => p.condicion === filtroEstado);
      console.log(`✅ Filtrado por estado "${filtroEstado}": ${pacientesAFiltrar.length} pacientes`);
    }

    // 2️⃣ Obtener SOLO fechas de pacientes que tienen fechaAtencion
    const fechas = [...new Set(
      pacientesAFiltrar
        .filter(p => p.fechaAtencion) // Solo pacientes con fecha de atención
        .map(p => {
          // Extraer fecha en formato ISO: "2026-02-06T16:30:17.428Z" → "2026-02-06"
          return p.fechaAtencion.split('T')[0];
        })
    )].sort().reverse(); // Ordenar descendente (más recientes primero)

    console.log(`📅 Fechas de atención disponibles para estado "${filtroEstado || 'TODOS'}": ${fechas.length} fechas`, fechas);
    return fechas;
  };

  // ✅ v1.65.1: Actualizar fechas disponibles cuando cambia el estado o pacientes
  useEffect(() => {
    const fechas = obtenerFechasAtencion();
    setFechasAtencionDisponibles(fechas);
    setFechaAtencionSeleccionada(''); // Limpiar selección de fecha
  }, [filtroEstado, pacientes]);

  // ✅ v1.67.5: Filtrar pacientes por fecha de ATENCIÓN (cuándo debe atender el médico)
  // IMPORTANTE: Usar fechaAtencion, NO fechaAsignacion
  // Prioridad: fechaSeleccionadaCalendario > fechaAtencionSeleccionada > comportamiento anterior
  const pacientesFiltradosPorFecha = pacientesFiltrados.filter(p => {
    // ✅ v1.67.5: PRIORIDAD 1: Si hay fecha seleccionada en el calendario, usar fechaAtencion
    if (fechaSeleccionadaCalendario) {
      if (!p.fechaAtencion) {
        console.log(`🔴 Paciente ${p.apellidosNombres} sin fechaAtencion`);
        return false;
      }
      // v1.67.5: fechaAtencion es DATE (YYYY-MM-DD), extraer correctamente
      const fechaAtencion = typeof p.fechaAtencion === 'string'
        ? p.fechaAtencion.split('T')[0]
        : p.fechaAtencion;

      const match = fechaAtencion === fechaSeleccionadaCalendario;
      if (!match) {
        console.log(`🟡 ${p.apellidosNombres}: fechaAtencion="${fechaAtencion}" != seleccionada="${fechaSeleccionadaCalendario}"`);
      } else {
        console.log(`✅ ${p.apellidosNombres}: COINCIDE - debe atender el ${fechaSeleccionadaCalendario}`);
      }
      return match;
    }

    // PRIORIDAD 2: Si el filtro de ATENCIÓN está seleccionado, úsalo
    if (fechaAtencionSeleccionada) {
      if (!p.fechaAtencion) return false;
      const fechaAtencion = p.fechaAtencion.split('T')[0];
      return fechaAtencion === fechaAtencionSeleccionada;
    }

    // PRIORIDAD 3: Si NO hay filtro ATENCIÓN, usa el filtro ASIGNACIÓN (comportamiento anterior)
    if (!p.fechaAsignacion) return false;

    // v1.67.4: Extraer fecha y calcular HOY en Lima (UTC-5)
    const fechaAsignacion = extraerFecha(p.fechaAsignacion);
    const hoy = obtenerHoyEnLima();

    // Por default, filtroRangoFecha es 'todos', pero queremos comportamiento de 'hoy'
    if (filtroRangoFecha === 'todos' || filtroRangoFecha === 'hoy') {
      return fechaAsignacion === hoy;
    }

    if (filtroRangoFecha === 'ayer') {
      // Calcular ayer en Lima (restar 1 día a la fecha de hoy en Lima)
      const hoyDate = new Date(hoy);
      const ayerDate = new Date(hoyDate.getTime() - 86400000);
      const ayer = `${ayerDate.getFullYear()}-${String(ayerDate.getMonth() + 1).padStart(2, '0')}-${String(ayerDate.getDate()).padStart(2, '0')}`;
      return fechaAsignacion === ayer;
    }

    if (filtroRangoFecha === '7dias') {
      // Calcular hace 7 días en Lima
      const hoyDate = new Date(hoy);
      const hace7diasDate = new Date(hoyDate.getTime() - 7 * 86400000);
      const hace7dias = `${hace7diasDate.getFullYear()}-${String(hace7diasDate.getMonth() + 1).padStart(2, '0')}-${String(hace7diasDate.getDate()).padStart(2, '0')}`;
      return fechaAsignacion >= hace7dias && fechaAsignacion <= hoy;
    }

    if (filtroRangoFecha === 'personalizado') {
      const desde = fechaDesde || null;
      const hasta = fechaHasta || null;
      if (desde && hasta) {
        return fechaAsignacion >= desde && fechaAsignacion <= hasta;
      }
      return true;
    }

    return true;
  });

  const toggleEnfermedad = (enfermedad) => {
    setEnfermedadesCronicas(prev =>
      prev.includes(enfermedad)
        ? prev.filter(e => e !== enfermedad)
        : [...prev, enfermedad]
    );
  };

  // ✅ v1.48.0: Estilos dinámicos para botón de condición
  const getButtonStyleCondicion = (condicion) => {
    const baseClasses = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105';

    if (condicion === 'Atendido') {
      return `${baseClasses} ${getColorCondicion(condicion)} opacity-70`;
    } else if (condicion === 'Pendiente') {
      return `${baseClasses} ${getColorCondicion(condicion)} shadow-md hover:shadow-lg`;
    }
    return `${baseClasses} ${getColorCondicion(condicion)}`;
  };

  // ✅ v1.68.2: Estadísticas del período ACTUAL (no histórico)
  // Los números SIEMPRE corresponden con lo que ves en la tabla
  const statsDelPeriodo = React.useMemo(() => {
    const total = pacientesFiltradosPorFecha.length;
    const atendidos = pacientesFiltradosPorFecha.filter(p => p.condicion === 'Atendido').length;
    const pendientes = pacientesFiltradosPorFecha.filter(p => p.condicion === 'Pendiente').length;
    const deserciones = pacientesFiltradosPorFecha.filter(p => p.condicion === 'Deserción').length;

    return { total, atendidos, pendientes, deserciones };
  }, [pacientesFiltradosPorFecha]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Cargando pacientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-20 py-6">
      <style>{animationStyles}</style>
      <div className="w-full">
        {/* Header Mejorado */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-8 h-8 text-[#0A5BA9]" />
            <h1 className="text-3xl font-bold text-gray-900">PANEL DEL PROFESIONAL DE SALUD</h1>
          </div>
          <p className="text-gray-600 font-medium mb-6">Gestiona y coordina la atención de tus pacientes asignados</p>

          {/* ✅ v1.78.0: Card profesional del médico logueado */}
          {(doctorInfo?.nombre || authUser?.nombre) && (
            <div className="bg-gradient-to-r from-[#0A5BA9] to-[#084A8E] rounded-xl p-6 shadow-lg border border-[#0A5BA9]/20 backdrop-blur-sm">
              <div className="flex items-start gap-6">
                {/* Avatar Circle */}
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">
                        {(doctorInfo?.nombre || authUser?.nombre || 'MD')
                          .split(' ')
                          .slice(0, 2)
                          .map(n => n[0])
                          .join('')
                          .toUpperCase()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Información */}
                <div className="flex-1">
                  <div className="flex items-baseline gap-3 mb-2">
                    <p className="text-sm font-semibold text-white/80 uppercase tracking-wider">
                      {(() => {
                        const roles = (authUser?.roles || []).map(r => r.toUpperCase());
                        if (roles.includes('MEDICO') || roles.includes('MÉDICO')) return 'Médico';
                        if (roles.includes('ENFERMERIA') || roles.includes('ENFERMERÍA')) return 'Enfermería';
                        if (roles.includes('OBSTETRA')) return 'Obstetra';
                        if (roles.includes('PSICOLOGO') || roles.includes('PSICÓLOGO')) return 'Psicólogo';
                        if (roles.includes('NUTRICION') || roles.includes('NUTRICIÓN')) return 'Nutricionista';
                        if (roles.includes('LABORATORIO')) return 'Laboratorio';
                        if (roles.includes('RADIOLOGIA') || roles.includes('RADIOLOGÍA')) return 'Radiología';
                        if (roles.includes('FARMACIA')) return 'Farmacia';
                        if (roles.includes('TERAPISTA_LENG')) return 'Terapista de Lenguaje';
                        if (roles.includes('TERAPISTA_FISI')) return 'Terapista Físico';
                        return 'Profesional de Salud';
                      })()}
                    </p>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-400/20 text-green-50 border border-green-400/30">
                      ● En línea
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-1">{formatearNombreDoctor(doctorInfo?.nombre || authUser?.nombre)}</h2>
                  {doctorInfo?.especialidad && (
                    <div className="flex items-center gap-2 text-white/90 text-sm font-medium">
                      <Stethoscope className="w-4 h-4" />
                      <span>{doctorInfo.especialidad}</span>
                    </div>
                  )}
                </div>

                {/* Stats Quick */}
                <div className="flex gap-6 text-center">
                  <div>
                    <p className="text-3xl font-bold text-white">{pacientesFiltradosPorFecha.length}</p>
                    <p className="text-xs text-white/80 font-medium mt-1">Hoy</p>
                  </div>
                  <div className="w-px bg-white/20"></div>
                  <div>
                    <p className="text-3xl font-bold text-white">{pacientes.filter(p => p.condicion === 'Atendido').length}</p>
                    <p className="text-xs text-white/80 font-medium mt-1">Atendidos</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 📊 Estadísticas - Clicables para Filtrar */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Total de Pacientes - Clicable para limpiar filtro */}
          <button
            onClick={() => {
              setFiltroEstado('');
              setFiltroRangoFecha('hoy');
              setFechaDesde('');
              setFechaHasta('');
              setFechaAtencionSeleccionada('');
              setFechaSeleccionadaCalendario(null); // ✅ v1.66.0: Limpiar calendario
            }}
            className={`kpi-card-animate kpi-card-hover text-left rounded-xl p-7 overflow-hidden relative group ${
              filtroEstado === ''
                ? 'bg-gradient-to-br from-slate-600 to-slate-700 shadow-lg'
                : 'bg-gradient-to-br from-slate-400 to-slate-600 shadow-md hover:from-slate-500 hover:to-slate-700'
            } text-white border-0 cursor-pointer`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10">
              <p className="text-sm font-semibold text-slate-100">Total de Pacientes</p>
              <p className="text-4xl font-bold mt-3 text-white">{statsDelPeriodo.total}</p>
              <p className="text-xs mt-3 text-slate-300 group-hover:text-white transition-colors">Haz clic para limpiar filtro</p>
            </div>
          </button>

          {/* Atendidos - Clicable */}
          <button
            onClick={() => {
              setFiltroEstado('Atendido');
              setFiltroRangoFecha('hoy');
              setFechaDesde('');
              setFechaHasta('');
              setFechaAtencionSeleccionada('');
              setFechaSeleccionadaCalendario(null); // ✅ v1.66.0: Limpiar calendario
            }}
            className={`kpi-card-animate kpi-card-hover text-left rounded-xl p-7 overflow-hidden relative group ${
              filtroEstado === 'Atendido'
                ? 'bg-gradient-to-br from-teal-600 to-teal-700 shadow-lg'
                : 'bg-gradient-to-br from-teal-500 to-teal-600 shadow-md hover:from-teal-600 hover:to-teal-700'
            } text-white border-0 cursor-pointer`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10">
              <p className="text-sm font-semibold text-emerald-100">Atendidos</p>
              <p className="text-4xl font-bold mt-3 text-white">
                {statsDelPeriodo.atendidos}
              </p>
              <p className="text-xs mt-3 text-emerald-200 group-hover:text-white transition-colors">Haz clic para filtrar</p>
            </div>
          </button>

          {/* Pendientes - Clicable */}
          <button
            onClick={() => {
              setFiltroEstado('Pendiente');
              setFiltroRangoFecha('hoy');
              setFechaDesde('');
              setFechaHasta('');
              setFechaAtencionSeleccionada('');
              setFechaSeleccionadaCalendario(null); // ✅ v1.66.0: Limpiar calendario
            }}
            className={`kpi-card-animate kpi-card-hover text-left rounded-xl p-7 overflow-hidden relative group ${
              filtroEstado === 'Pendiente'
                ? 'bg-gradient-to-br from-amber-600 to-amber-700 shadow-lg'
                : 'bg-gradient-to-br from-amber-500 to-amber-600 shadow-md hover:from-amber-600 hover:to-amber-700'
            } text-white border-0 cursor-pointer`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10">
              <p className="text-sm font-semibold text-amber-100">Pendientes</p>
              <p className="text-4xl font-bold mt-3 text-white">
                {statsDelPeriodo.pendientes}
              </p>
              <p className="text-xs mt-3 text-amber-200 group-hover:text-white transition-colors">Haz clic para filtrar</p>
            </div>
          </button>

          {/* Deserción - Clicable */}
          <button
            onClick={() => {
              setFiltroEstado('Deserción');
              setFiltroRangoFecha('hoy');
              setFechaDesde('');
              setFechaHasta('');
              setFechaAtencionSeleccionada('');
              setFechaSeleccionadaCalendario(null); // ✅ v1.66.0: Limpiar calendario
            }}
            className={`kpi-card-animate kpi-card-hover text-left rounded-xl p-7 overflow-hidden relative group ${
              filtroEstado === 'Deserción'
                ? 'bg-gradient-to-br from-red-600 to-red-700 shadow-lg'
                : 'bg-gradient-to-br from-red-500 to-red-600 shadow-md hover:from-red-600 hover:to-red-700'
            } text-white border-0 cursor-pointer`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10">
              <p className="text-sm font-semibold text-rose-100">Deserción</p>
              <p className="text-4xl font-bold mt-3 text-white">
                {statsDelPeriodo.deserciones}
              </p>
              <p className="text-xs mt-3 text-rose-200 group-hover:text-white transition-colors">Haz clic para filtrar</p>
            </div>
          </button>
        </div>

        {/* ✅ v1.65.2: Filtros colapsables - Accordion */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 shadow-md rounded-xl mb-6 overflow-hidden">
          {/* ENCABEZADO - BOTÓN PARA EXPANDIR/COLAPSAR + LIMPIAR */}
          <div className="px-4 py-2.5 flex items-center justify-between hover:bg-slate-100 transition-colors border-b border-slate-200">
            <button
              onClick={() => setFiltrosExpandidos(!filtrosExpandidos)}
              className="flex-1 flex items-center gap-2"
            >
              <div className="p-1.5 bg-[#0A5BA9]/10 rounded-lg">
                <Filter className="w-4 h-4 text-[#0A5BA9]" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-bold text-gray-900">Filtros de Búsqueda</h3>
                <p className="text-[11px] text-gray-500">
                  {filtroEstado || filtroBolsa || filtroIpress || filtroRangoFecha !== 'hoy' ?
                    '✅ Con filtros aplicados' :
                    'Sin filtros activos'}
                </p>
              </div>
            </button>

            {/* Botones de acción */}
            <div className="flex items-center gap-2">
              {/* Botón Limpiar (siempre visible) */}
              {(busqueda || filtroEstado || filtroBolsa || filtroIpress || filtroRangoFecha !== 'hoy') && (
                <button
                  onClick={() => {
                    setBusqueda('');
                    setFiltroEstado('');
                    setFiltroBolsa('');
                    setFiltroIpress('');
                    setFiltroRangoFecha('hoy');
                    setFechaDesde('');
                    setFechaHasta('');
                    setFechaAtencionSeleccionada('');
                    setOrdenarPor('reciente');
                    toast.success('✨ Filtros limpiados');
                  }}
                  title="Limpiar todos los filtros"
                  className="px-2.5 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
                >
                  <X className="w-4 h-4" />
                  Limpiar
                </button>
              )}

              {/* Chevron expandir/colapsar */}
              <ChevronDown
                className={`w-6 h-6 text-gray-600 transition-transform flex-shrink-0 ${
                  filtrosExpandidos ? 'rotate-180' : ''
                }`}
              />
            </div>
          </div>

          {/* CONTENIDO - FILTROS (COLAPSABLE) */}
          {filtrosExpandidos && (
            <div className="px-4 py-3 border-t border-slate-200 bg-white space-y-3">

          {/* FILA 1: Búsqueda + Estado + Actualizar (4-column symmetric grid) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end mb-3">
            {/* Búsqueda - span 2 columns */}
            <div className="md:col-span-2">
              <label className="block text-[11px] font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                <Search className="w-3.5 h-3.5 inline mr-1.5 text-[#0A5BA9]" />
                Buscar Paciente
              </label>
              <input
                type="text"
                placeholder="Nombre o DNI..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full h-[34px] px-3 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0A5BA9] focus:border-transparent transition-all shadow-sm hover:border-slate-400"
              />
            </div>

            {/* Estado - 1 column */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                <Filter className="w-3.5 h-3.5 inline mr-1.5 text-orange-500" />
                Estado
              </label>
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="w-full h-[34px] px-3 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all shadow-sm hover:border-slate-400"
              >
                <option value="">Todos</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Atendido">Atendido</option>
                <option value="Deserción">Deserción</option>
              </select>
            </div>

            {/* Botón Actualizar - 1 column */}
            <div>
              <button
                onClick={cargarPacientes}
                title="Actualizar lista de pacientes"
                className="w-full h-[34px] px-3 bg-gradient-to-r from-[#0A5BA9] to-[#0d4a8f] text-white text-xs rounded-lg hover:from-[#083d78] hover:to-[#062d5f] transition-all duration-200 flex items-center justify-center gap-1.5 hover:shadow-lg font-medium active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Actualizar
              </button>
            </div>
          </div>

          {/* FILA 2: Tipo de Bolsa + IPRESS + Asignación + Atención (4-column symmetric grid) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-start">
            {/* Filtro Tipo de Bolsa - 1 column */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                <span className="inline-block w-3.5 h-3.5 mr-1.5 text-purple-500">📦</span>
                Bolsa
              </label>
              <select
                value={filtroBolsa}
                onChange={(e) => setFiltroBolsa(e.target.value)}
                className="w-full h-[34px] px-3 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all shadow-sm hover:border-slate-400"
              >
                <option value="">Todas</option>
                {bolsasDisponibles.map((bolsa) => (
                  <option key={bolsa.id} value={bolsa.id.toString()}>
                    {bolsa.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro IPRESS - 1 column */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                <span className="inline-block w-3.5 h-3.5 mr-1.5 text-blue-500">🏥</span>
                IPRESS
              </label>
              <select
                value={filtroIpress}
                onChange={(e) => setFiltroIpress(e.target.value)}
                className="w-full h-[34px] px-3 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all shadow-sm hover:border-slate-400"
              >
                <option value="">Todas</option>
                {ipressDisponibles.map((ipress) => (
                  <option key={ipress.id} value={ipress.nombre}>
                    {ipress.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* ✅ v1.67.5: Filtro Calendario - Cuándo DEBE ATENDER el médico - 1 column */}
            <div data-selector-asignacion>
              <label className="block text-[11px] font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                <Calendar className="w-3.5 h-3.5 inline mr-1.5 text-green-600" />
                Atención (Cuándo Atender)
              </label>
              <CalendarioAsignacion
                fechaSeleccionada={fechaSeleccionadaCalendario}
                onFechaChange={(fecha) => {
                  setFechaSeleccionadaCalendario(fecha);
                  // ✅ v1.67.1: Cambiar filtroRangoFecha para permitir filtros de fecha custom
                  // Si se selecciona una fecha, desactivar el filtro 'hoy' por defecto
                  if (fecha) {
                    setFiltroRangoFecha('personalizado');
                  } else {
                    setFiltroRangoFecha('hoy'); // Limpiar = volver a hoy
                  }
                }}
                fechasConAsignaciones={fechasConAsignaciones}
              />
            </div>

          </div>

          {/* FILA 3: Rango Personalizado (condicional) */}
          {filtroRangoFecha === 'personalizado' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-3 mt-1 pl-3 border-l-4 border-green-500 bg-green-50/40 rounded-r-lg">
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                  📅 Desde
                </label>
                <input
                  type="date"
                  value={fechaDesde}
                  onChange={(e) => setFechaDesde(e.target.value)}
                  className="w-full h-[34px] px-3 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all shadow-sm hover:border-slate-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                  📅 Hasta
                </label>
                <input
                  type="date"
                  value={fechaHasta}
                  onChange={(e) => setFechaHasta(e.target.value)}
                  className="w-full h-[34px] px-3 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all shadow-sm hover:border-slate-400"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                  Ordenar por
                </label>
                <select
                  value={ordenarPor}
                  onChange={(e) => setOrdenarPor(e.target.value)}
                  className="w-full h-[34px] px-3 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all shadow-sm hover:border-slate-400"
                >
                  <option value="reciente">Más recientes primero</option>
                  <option value="antiguo">Más antiguos primero</option>
                </select>
              </div>
            </div>
          )}
            </div>
          )}
        </div>

        {/* Tabla de pacientes */}
        {pacientesFiltradosPorFecha.length === 0 ? (
          <div className="bg-blue-50 border border-blue-200 shadow-sm rounded-lg p-12 text-center">
            <p className="text-gray-700 font-semibold text-base mb-2">
              {fechaSeleccionadaCalendario
                ? `No hay pacientes programados para atender el ${parsearFechaLocal(fechaSeleccionadaCalendario).toLocaleDateString('es-ES', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}`
                : (filtroRangoFecha === 'todos' || filtroRangoFecha === 'hoy' ? 'No hay pacientes programados para atender hoy' : 'No hay pacientes en el período seleccionado')
              }
            </p>
            <p className="text-gray-500 text-sm mb-6">
              {fechaSeleccionadaCalendario
                ? 'Intenta seleccionando otra fecha desde el calendario'
                : (filtroRangoFecha === 'todos' || filtroRangoFecha === 'hoy'
                  ? 'Selecciona otra fecha desde el calendario "ASIGNACIÓN"'
                  : 'Intenta seleccionando otro período o ajustando los filtros.')
              }
            </p>
          </div>
        ) : (
          <div className="relative overflow-hidden bg-white border border-gray-200 shadow-sm rounded-lg">
            <div className="overflow-x-auto relative">
              <table className="w-full text-sm text-left">
                <thead className="text-xs font-semibold text-white uppercase tracking-wider bg-slate-700 relative z-20">
                  <tr>
                    <th className="px-2 py-1 text-left">Paciente</th>
                    <th className="px-2 py-1 text-left">Teléfono</th>
                    <th className="px-2 py-1 text-left">IPRESS</th>

                    {/* ✅ v1.76.0: Columna de Fecha toma EKG SOLO para Cardiología */}
                    {esCardiologo && (
                      <th className="px-2 py-1 text-left">📅 Fecha toma EKG</th>
                    )}

                    {/* ✅ v1.63.0: Columnas condicionales SOLO para Bolsa 107 (idBolsa = 1) */}
                    {pacientesFiltradosPorFecha.some(p => p.idBolsa === 1) && (
                      <>
                        <th className="px-2 py-1 text-left">Tiempo Inicio Síntomas</th>
                        <th className="px-2 py-1 text-left">Consentimiento Informado</th>
                      </>
                    )}

                    <th className="px-2 py-1 text-left">Condición</th>
                    <th className="px-2 py-1 text-left">Observaciones</th>
                    <th className="px-2 py-1 text-left">🔔 Motivo Llamada</th>
                    <th className="px-2 py-1 text-left">Fecha Asignación</th>
                    <th className="px-2 py-1 text-left">Fecha Atención</th>
                    {/* ✅ v1.66.4: Columna para visualizar ECGs (SOLO CARDIÓLOGOS) */}
                    {esCardiologo && (
                      <th className="px-2 py-1 text-center">Atender Lectura EKG</th>
                    )}
                    {/* ✅ v1.64.0: Columna FINAL de Generación de Ticket */}
                    <th className="px-2 py-1 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Ticket size={14} />
                        <span>Ticket Mesa de Ayuda</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {pacientesFiltradosPorFecha.map((paciente, idx) => (
                    <tr key={idx} className={`transition-colors duration-150 ${
                      idx % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'
                    }`}>
                      {/* Paciente: Nombre compacto + DNI abajo en gris + Ojo para ver detalles */}
                      <td className="px-2 py-0.5">
                        <div className="flex items-start gap-2">
                          {/* Ojo - icono para detalles */}
                          <button
                            onClick={() => abrirDetallesPaciente(paciente)}
                            title="Ver detalles del paciente"
                            className="flex-shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors duration-150"
                          >
                            <Eye className="w-3.5 h-3.5" strokeWidth={2} />
                          </button>

                          {/* Nombre y DNI */}
                          <div className="flex flex-col gap-0 min-w-0 leading-tight">
                            <div className="font-semibold text-gray-900 text-[13px]">{formatearNombrePaciente(paciente.apellidosNombres)}</div>
                            <div className="text-gray-400 text-[11px]">DNI: {paciente.numDoc}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-1 text-sm">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600 flex-shrink-0"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                            <div>
                              <span className="text-[10px] font-bold text-green-700 uppercase block leading-none">Principal</span>
                              <span className="text-gray-800 text-xs">{paciente.telefono || '-'}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600 flex-shrink-0"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                            <div>
                              <span className="text-[10px] font-bold text-green-700 uppercase block leading-none">Alterno</span>
                              <span className="text-gray-800 text-xs">{paciente.telefonoAlterno || '-'}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-1 text-gray-600 text-sm">{paciente.ipress || '-'}</td>

                      {/* ✅ v1.76.0: Fecha toma EKG - SOLO para Cardiología */}
                      {esCardiologo && (
                        <td className="px-2 py-1 text-gray-600 text-xs whitespace-nowrap">
                          {paciente.fechaTomaEKG ? formatearSoloFecha(paciente.fechaTomaEKG) : '-'}
                        </td>
                      )}

                      {/* ✅ v1.63.0: TIEMPO INICIO SÍNTOMAS (solo si hay pacientes de Bolsa 107) */}
                      {pacientesFiltradosPorFecha.some(p => p.idBolsa === 1) && (
                        <td className="px-2 py-1 text-sm">
                          {renderTiempoInicioSintomas(paciente)}
                        </td>
                      )}

                      {/* ✅ v1.63.0: CONSENTIMIENTO INFORMADO (solo si hay pacientes de Bolsa 107) */}
                      {pacientesFiltradosPorFecha.some(p => p.idBolsa === 1) && (
                        <td className="px-2 py-1 text-sm">
                          {renderConsentimientoInformado(paciente)}
                        </td>
                      )}

                      <td className="px-2 py-1">
                        {/* ✅ v1.92.0: Si hay imágenes rechazadas, mostrar "Rechazado" en morado */}
                        {pacientesRechazados[paciente.numDoc] ? (
                          <div
                            title={`ECG rechazado. ${pacientesRechazados[paciente.numDoc].cantidad} imagen(es) con motivo de rechazo`}
                            className={getButtonStyleCondicion('Rechazado')}
                          >
                            <span>⚠️ Rechazado</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => abrirAccion(paciente)}
                            title="Haz clic para cambiar estado"
                            className={getButtonStyleCondicion(paciente.condicion)}
                          >
                            <span>{paciente.condicion || 'Sin asignar'}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                      <td className="px-2 py-1 text-gray-600">
                        {paciente.observaciones ? (
                          <span className="inline-flex px-2.5 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                            {paciente.observaciones}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-2 py-1 text-gray-600 text-sm max-w-xs truncate" title={paciente.motivoLlamadoBolsa}>
                        {paciente.motivoLlamadoBolsa ? (
                          <span className="inline-flex px-2.5 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                            {paciente.motivoLlamadoBolsa}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-2 py-1 text-gray-600 text-xs whitespace-nowrap">
                        {formatearFechaHumana(paciente.fechaAsignacion)}
                      </td>
                      <td className="px-2 py-1 text-gray-600 text-xs whitespace-nowrap">
                        {formatearFechaHumana(paciente.fechaAtencion)}
                      </td>

                      {/* ✅ v1.80.0: Columna - Ver imágenes ECG (SOLO CARDIÓLOGOS) + Estados */}
                      {esCardiologo && (
                        <td className="px-2 py-1 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {/* ✅ v1.92.0: Botón para atender/evaluar ECG - Maneja rechazos */}
                            {pacientesRechazados[paciente.numDoc] ? (
                              // ✅ v1.92.0: Si hay rechazo, mostrar botón deshabilitado en gris con 🔄
                              <button
                                disabled={true}
                                title={`ECG rechazado. IPRESS debe cargar nueva imagen. Motivo: ${pacientesRechazados[paciente.numDoc].motivos?.[0]?.observaciones || 'Por especificar'}`}
                                className="relative inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm bg-gray-400 text-white border border-gray-500 cursor-not-allowed opacity-60"
                              >
                                <RefreshCw className="w-6 h-6" strokeWidth={2} />
                                <span className="text-xs">{pacientesRechazados[paciente.numDoc].cantidad}</span>
                              </button>
                            ) : (
                              // ✅ Normal: Botón de evaluación
                              <button
                                onClick={() => abrirCarruselECG(paciente)}
                                disabled={cargandoECG}
                                title={
                                  cargandoECG
                                    ? 'Cargando ECG...'
                                    : evaluacionesEstados[paciente.numDoc]?.estado === 'EVALUADO'
                                    ? '✏️ Editar evaluación ECG (ya evaluado)'
                                    : 'Evaluar ECG (Pendiente)'
                                }
                                className={`relative inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm transition-all ${
                                  cargandoECG
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50 border border-gray-200'
                                    : evaluacionesEstados[paciente.numDoc]?.estado === 'EVALUADO'
                                    ? 'bg-green-600 text-white border border-green-700 hover:bg-green-700 cursor-pointer'
                                    : 'bg-red-600 text-white hover:bg-red-700 cursor-pointer border border-red-700 ecg-button-pulse'
                                }`}
                              >
                                <Stethoscope
                                  className={`w-6 h-6 ${
                                    evaluacionesEstados[paciente.numDoc]?.estado === 'EVALUADO'
                                      ? 'text-white'
                                      : 'text-current'
                                  }`}
                                  strokeWidth={2}
                                />
                                {ecgCounts[paciente.numDoc] > 0 && (
                                  <span className="font-bold">{ecgCounts[paciente.numDoc]}</span>
                                )}
                              </button>
                            )}

                            {/* ✅ v1.80.0: Botón para ver resultados (si fue evaluado) */}
                            {evaluacionesEstados[paciente.numDoc]?.estado === 'EVALUADO' && (
                              <button
                                onClick={() => abrirResultadosEvaluacion(paciente)}
                                title="Ver resultados de evaluación"
                                className="inline-flex items-center justify-center p-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 border border-emerald-700 transition-all"
                              >
                                <Check className="w-5 h-5" strokeWidth={2} />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                      {/* ✅ v1.65.0: COLUMNA FINAL - Ticket Mesa de Ayuda con estado */}
                      <td className="px-2 py-1 text-center">
                        <div className="flex flex-col items-center gap-1">
                          {ticketsMedico[paciente.numDoc] && (() => {
                            const t = ticketsMedico[paciente.numDoc];
                            const colores = {
                              NUEVO: 'bg-amber-100 text-amber-800 border-amber-300',
                              EN_PROCESO: 'bg-blue-100 text-blue-800 border-blue-300',
                              RESUELTO: 'bg-green-100 text-green-800 border-green-300',
                            };
                            return (
                              <button
                                onClick={() => setTicketDetalleModal(t)}
                                className={`inline-flex flex-col items-center px-1.5 py-0.5 rounded-md text-[9px] font-semibold border cursor-pointer hover:opacity-80 transition-opacity leading-tight ${colores[t.estado] || colores.NUEVO}`}
                                title={`Ver detalle del Ticket ${t.numeroTicket}`}
                              >
                                <span>{t.numeroTicket}</span>
                                <span className="text-[8px] opacity-80">{t.estado === 'EN_PROCESO' ? 'PROCESO' : t.estado}</span>
                              </button>
                            );
                          })()}
                          <button
                            onClick={() => {
                              setPacienteTicket(paciente);
                              setShowTicketModal(true);
                            }}
                            title="Generar ticket de Mesa de Ayuda para este paciente"
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                          >
                            <Ticket size={16} strokeWidth={1.5} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Cambio de Estado */}
      {modalAccion === 'cambiarEstado' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh]">
            {/* Header Fijo - Mejorado con tipografía y espaciado */}
            <div className="relative px-6 py-5 bg-[#0A5BA9] rounded-t-lg">
              {/* Close Button X - En círculo con zona segura */}
              <button
                onClick={() => setModalAccion(null)}
                className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
                title="Cerrar"
              >
                <X className="w-5 h-5 text-white" strokeWidth={2.5} />
              </button>

              <div className="flex items-start justify-between gap-6 pr-12">
                {/* Nombre del paciente y DNI */}
                <div className="flex-1">
                  <p className="text-2xl font-bold text-white leading-relaxed">
                    {formatearNombrePaciente(pacienteSeleccionado?.apellidosNombres)}
                  </p>
                  <p className="text-sm text-white/75 font-medium mt-1">DNI: {pacienteSeleccionado?.numDoc}</p>
                </div>

                {/* Estado Actual como Badge - Mejor alineación */}
                <div className="px-3 py-2 bg-white/20 rounded-full backdrop-blur-sm flex-shrink-0">
                  <p className="text-xs font-semibold text-white uppercase tracking-wider">{pacienteSeleccionado?.condicion || 'Citado'}</p>
                </div>
              </div>
            </div>

            {/* Contenido Scrolleable - Más espacio blanco */}
            <div className="flex-1 overflow-y-auto p-8 bg-white space-y-6">
              {/* Opción Atendido - DESTACADA */}
              <button
                onClick={() => setEstadoSeleccionado('Atendido')}
                className={`w-full text-left p-4 rounded-lg border-2 cursor-pointer transition-all font-semibold ${
                  estadoSeleccionado === 'Atendido'
                    ? 'border-green-500 bg-green-50 shadow-md text-green-900'
                    : 'border-gray-300 bg-white hover:border-green-300 hover:bg-gray-50 text-gray-900'
                }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                    estadoSeleccionado === 'Atendido'
                      ? 'bg-green-500 text-white'
                      : 'border-2 border-gray-400 text-gray-400'
                  }`}>
                    <Check className="w-4 h-4" strokeWidth={3} />
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-bold">Atendido</p>
                    <p className="text-sm text-gray-600 font-normal mt-1">Consulta completada</p>
                  </div>
                </div>
              </button>

              {/* ✅ Opciones de Atención (aparecen cuando selecciona Atendido) - Chips simples */}
              {estadoSeleccionado === 'Atendido' && (
                <div className="space-y-3 pl-10">
                  {/* Grid 3 columnas para chips grandes */}
                  <div className="grid grid-cols-3 gap-3">
                    {/* Chip 1: Recita */}
                    <button
                      onClick={() => {
                        setTieneRecita(!tieneRecita);
                        setExpandRecita(!expandRecita);
                      }}
                      className={`p-4 rounded-lg transition-all cursor-pointer text-center font-semibold ${
                        tieneRecita
                          ? 'bg-green-100 text-green-900 border-2 border-green-400 shadow-md'
                          : 'bg-gray-100 text-gray-700 border-2 border-gray-300 hover:bg-gray-200 hover:border-green-300'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="w-5 h-5" strokeWidth={2.5} />
                        <span className="text-sm">Recita</span>
                      </div>
                    </button>

                    {/* Chip 2: Interconsulta */}
                    <button
                      onClick={() => {
                        setTieneInterconsulta(!tieneInterconsulta);
                        setExpandInterconsulta(!expandInterconsulta);
                      }}
                      className={`p-4 rounded-lg transition-all cursor-pointer text-center font-semibold ${
                        tieneInterconsulta
                          ? 'bg-blue-100 text-blue-900 border-2 border-blue-400 shadow-md'
                          : 'bg-gray-100 text-gray-700 border-2 border-gray-300 hover:bg-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Share2 className="w-5 h-5" strokeWidth={2.5} />
                        <span className="text-sm">Interconsulta</span>
                      </div>
                    </button>

                    {/* Chip 3: Registrar Crónico */}
                    <button
                      onClick={() => {
                        setEsCronico(!esCronico);
                        setExpandCronico(!expandCronico);
                      }}
                      className={`p-4 rounded-lg transition-all cursor-pointer text-center font-semibold ${
                        esCronico
                          ? 'bg-purple-100 text-purple-900 border-2 border-purple-400 shadow-md'
                          : 'bg-gray-100 text-gray-700 border-2 border-gray-300 hover:bg-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Heart className="w-5 h-5" strokeWidth={2.5} />
                        <span className="text-sm">Registrar Crónico</span>
                      </div>
                    </button>
                  </div>

                  {/* Detalles Expandibles */}
                  <div className="space-y-2">
                    {/* Detalle 1: RECITA */}
                    {expandRecita && tieneRecita && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 animate-in slide-in-from-top-2">
                        <label className="text-xs font-semibold text-gray-700 block mb-2">Plazo:</label>
                        <select
                          value={recitaDias}
                          onChange={(e) => setRecitaDias(parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-green-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm font-medium text-gray-900 bg-white"
                        >
                          <option value={3}>3 días</option>
                          <option value={7}>7 días</option>
                          <option value={15}>15 días</option>
                          <option value={30}>30 días</option>
                          <option value={60}>60 días</option>
                          <option value={90}>90 días</option>
                        </select>
                      </div>
                    )}

                    {/* Detalle 2: INTERCONSULTA */}
                    {expandInterconsulta && tieneInterconsulta && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 animate-in slide-in-from-top-2">
                        <label className="text-xs font-semibold text-gray-700 block mb-2">Especialidad:</label>
                        <select
                          value={interconsultaEspecialidad}
                          onChange={(e) => setInterconsultaEspecialidad(e.target.value)}
                          className="w-full px-3 py-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium text-gray-900 bg-white"
                        >
                          <option value="">Selecciona especialidad...</option>
                          {especialidades.map(esp => (
                            <option key={esp.id} value={esp.descServicio}>
                              {esp.descServicio}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Detalle 3: CRÓNICO */}
                    {/* ✅ v1.47.2: Solo respuestas cerradas - Hipertensión y Diabetes */}
                    {expandCronico && esCronico && (
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 animate-in slide-in-from-top-2">
                        <div className="space-y-2">
                          <label className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-purple-100 transition-colors">
                            <input
                              type="checkbox"
                              checked={enfermedadesCronicas.includes('Hipertensión')}
                              onChange={() => toggleEnfermedad('Hipertensión')}
                              className="w-4 h-4 text-purple-600 rounded"
                            />
                            <span className="text-xs font-medium text-gray-800">Hipertensión</span>
                          </label>

                          <label className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-purple-100 transition-colors">
                            <input
                              type="checkbox"
                              checked={enfermedadesCronicas.includes('Diabetes')}
                              onChange={() => toggleEnfermedad('Diabetes')}
                              className="w-4 h-4 text-purple-600 rounded"
                            />
                            <span className="text-xs font-medium text-gray-800">Diabetes</span>
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Opción Pendiente */}
              <button
                onClick={() => setEstadoSeleccionado('Pendiente')}
                className={`w-full text-left p-4 rounded-lg border-2 cursor-pointer transition-all font-semibold ${
                  estadoSeleccionado === 'Pendiente'
                    ? 'border-amber-500 bg-amber-50 shadow-md text-amber-900'
                    : 'border-gray-300 bg-white hover:border-amber-300 hover:bg-gray-50 text-gray-900'
                }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                    estadoSeleccionado === 'Pendiente'
                      ? 'bg-amber-500 text-white'
                      : 'border-2 border-gray-400 text-gray-400'
                  }`}>
                    <Clock className="w-4 h-4" strokeWidth={3} />
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-bold">Pendiente <span className="text-xs text-gray-500 font-normal">(por defecto)</span></p>
                    <p className="text-sm text-gray-600 font-normal mt-1">Aún no atendido, requiere seguimiento</p>
                  </div>
                </div>
              </button>

              {/* Opción Deserción */}
              <button
                onClick={() => setEstadoSeleccionado('Deserción')}
                className={`w-full text-left p-4 rounded-lg border-2 cursor-pointer transition-all font-semibold ${
                  estadoSeleccionado === 'Deserción'
                    ? 'border-red-400 bg-red-50 shadow-md text-red-900'
                    : 'border-gray-300 bg-white hover:border-red-300 hover:bg-gray-50 text-gray-900'
                }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                    estadoSeleccionado === 'Deserción'
                      ? 'border-2 border-red-500 text-red-500'
                      : 'border-2 border-gray-400 text-gray-400'
                  }`}>
                    <X className="w-4 h-4" strokeWidth={3} />
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-bold">Deserción</p>
                    <p className="text-sm text-gray-600 font-normal mt-1">Paciente no asistió o no desea atención</p>
                  </div>
                </div>
              </button>

                {/* Campo de razón para deserción */}
                {estadoSeleccionado === 'Deserción' && (
                  <div className="mt-6 ml-10 pt-6 border-t border-red-200">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Seleccione la razón:</label>
                    <select
                      value={razonDesercion}
                      onChange={(e) => setRazonDesercion(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 text-sm"
                    >
                      <option value="">-- Seleccionar razón --</option>
                      <optgroup label="Contacto">
                        <option value="No contactado">No contactado</option>
                        <option value="No contesta">No contesta</option>
                        <option value="Número apagado">Número apagado</option>
                        <option value="Número no existe">Número no existe</option>
                        <option value="Número equivocado">Número equivocado</option>
                      </optgroup>
                      <optgroup label="Rechazo">
                        <option value="Paciente rechazó">Paciente rechazó</option>
                        <option value="No desea atención">No desea atención</option>
                      </optgroup>
                      <optgroup label="Condición Médica">
                        <option value="Paciente internado">Paciente internado</option>
                        <option value="Paciente fallecido">Paciente fallecido</option>
                        <option value="Examen pendiente">Examen pendiente</option>
                      </optgroup>
                      <optgroup label="Otro">
                        <option value="Otro">Otro</option>
                      </optgroup>
                    </select>
                  </div>
                )}
            </div>

            {/* Footer Fijo con Botones */}
            <div className="border-t border-gray-200 p-6 bg-white flex gap-3 justify-end rounded-b-lg">
              <button
                onClick={() => setModalAccion(null)}
                disabled={procesando}
                className="px-5 py-2.5 text-gray-700 border-2 border-gray-300 rounded-lg hover:bg-gray-100 hover:border-gray-400 transition disabled:opacity-50 font-semibold text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={procesarAccion}
                disabled={procesando}
                className="px-6 py-2.5 bg-[#0A5BA9] text-white rounded-lg hover:bg-[#083d78] transition disabled:opacity-50 font-semibold text-sm flex items-center justify-center gap-2 shadow-sm"
              >
                {procesando ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  '✓ Confirmar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ v1.50.0: Modal de Detalles del Paciente */}
      {mostrarDetalles && pacienteDetalles && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="relative px-6 py-5 bg-gradient-to-r from-[#0A5BA9] to-[#0A5BA9]/90">
              <button
                onClick={() => setMostrarDetalles(false)}
                className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
                title="Cerrar"
              >
                <X className="w-5 h-5 text-white" strokeWidth={2.5} />
              </button>

              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <p className="text-2xl font-bold text-white">
                    {formatearNombrePaciente(pacienteDetalles.apellidosNombres)}
                  </p>
                  <p className="text-sm text-white/80 mt-1">DNI: {pacienteDetalles.numDoc}</p>
                </div>
                <div className="px-3 py-2 bg-white/20 rounded-full backdrop-blur-sm flex-shrink-0">
                  <p className="text-xs font-semibold text-white uppercase tracking-wider">{pacienteDetalles.condicion}</p>
                </div>
              </div>
            </div>

            {/* Contenido */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Grid 2 columnas */}
              <div className="grid grid-cols-2 gap-4">
                {/* Teléfono */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Teléfono</p>
                  <p className="text-lg font-bold text-gray-900">{pacienteDetalles.telefono || '-'}</p>
                </div>

                {/* IPRESS */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">IPRESS</p>
                  <p className="text-sm font-semibold text-gray-900">{pacienteDetalles.ipress || '-'}</p>
                </div>
              </div>

              {/* Fechas */}
              <div className="grid grid-cols-2 gap-4">
                {/* Fecha Asignación */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-1">📅 Asignado</p>
                  <p className="text-sm font-medium text-gray-900">{formatearFechaHumana(pacienteDetalles.fechaAsignacion) || '-'}</p>
                </div>

                {/* Fecha Atención - solo para Atendido */}
                {pacienteDetalles.condicion !== 'Deserción' && (
                  <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                    <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">✓ Atendido</p>
                    <p className="text-sm font-medium text-gray-900">
                      {pacienteDetalles.condicion === 'Atendido' ? (formatearFechaHumana(pacienteDetalles.fechaAtencion) || '-') : '-'}
                    </p>
                  </div>
                )}

                {/* Fecha Deserción - solo para Deserción */}
                {pacienteDetalles.condicion === 'Deserción' && (
                  <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <p className="text-xs font-semibold text-red-700 uppercase tracking-wider mb-1">✗ Deserción</p>
                    <p className="text-sm font-medium text-gray-900">{formatearFechaHumana(pacienteDetalles.fechaAtencion) || '-'}</p>
                  </div>
                )}
              </div>

              {/* Observaciones */}
              {pacienteDetalles.observaciones && (
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  <p className="text-xs font-semibold text-yellow-700 uppercase tracking-wider mb-2">Motivo / Observaciones</p>
                  <p className="text-sm text-gray-900">{pacienteDetalles.observaciones}</p>
                </div>
              )}

              {/* Enfermedades Crónicas */}
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <div className="flex items-center gap-2 mb-3">
                  <Heart className="w-5 h-5 text-purple-600" strokeWidth={2.5} />
                  <p className="text-sm font-semibold text-purple-900 uppercase tracking-wider">Enfermedades Crónicas</p>
                </div>
                {pacienteDetalles.enfermedadCronica && pacienteDetalles.enfermedadCronica.length > 0 ? (
                  <div className="space-y-2">
                    {pacienteDetalles.enfermedadCronica.map((enfermedad, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded border border-purple-100">
                        <div className="w-2 h-2 rounded-full bg-purple-600 flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-900">{enfermedad}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 italic">No registra enfermedades crónicas</p>
                )}
              </div>

              {/* Información adicional */}
              <div className="bg-gray-100 rounded-lg p-4 border border-gray-300">
                <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">Información del Sistema</p>
                <div className="space-y-2 text-xs text-gray-700">
                  {pacienteDetalles.idSolicitudBolsa && (
                    <div className="flex justify-between">
                      <span>ID Solicitud Bolsa:</span>
                      <span className="font-mono text-gray-900">{pacienteDetalles.idSolicitudBolsa}</span>
                    </div>
                  )}
                  {pacienteDetalles.idGestion && (
                    <div className="flex justify-between">
                      <span>ID Gestión:</span>
                      <span className="font-mono text-gray-900">{pacienteDetalles.idGestion}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-6 bg-white flex justify-end rounded-b-lg">
              <button
                onClick={() => setMostrarDetalles(false)}
                className="px-6 py-2.5 bg-[#0A5BA9] text-white rounded-lg hover:bg-[#083d78] transition font-semibold text-sm"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ v1.64.0: Modal para editar Tiempo Inicio Síntomas o Consentimiento Informado */}
      {editingField && pacienteEditando && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {editingField === 'tiempo' ? 'Editar Tiempo Inicio Síntomas' : 'Editar Consentimiento Informado'}
            </h2>

            {editingField === 'tiempo' ? (
              <div className="space-y-4">
                <select
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A5BA9]"
                >
                  <option value="< 24 hrs.">🔴 &lt; 24 hrs. (Urgente)</option>
                  <option value="24 - 72 hrs.">🟡 24 - 72 hrs. (Media Prioridad)</option>
                  <option value="> 72 hrs.">🟢 &gt; 72 hrs. (Baja Prioridad)</option>
                </select>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex gap-3">
                  <button
                    onClick={() => setEditValue('true')}
                    className={`flex-1 py-2 px-3 rounded-lg font-semibold text-sm transition-all ${
                      editValue === 'true'
                        ? 'bg-green-100 text-green-700 border-2 border-green-600'
                        : 'bg-gray-100 text-gray-700 border-2 border-gray-200'
                    }`}
                  >
                    ✓ Sí
                  </button>
                  <button
                    onClick={() => setEditValue('false')}
                    className={`flex-1 py-2 px-3 rounded-lg font-semibold text-sm transition-all ${
                      editValue === 'false'
                        ? 'bg-red-100 text-red-700 border-2 border-red-600'
                        : 'bg-gray-100 text-gray-700 border-2 border-gray-200'
                    }`}
                  >
                    ✗ No
                  </button>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setEditingField(null);
                  setPacienteEditando(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (editingField === 'tiempo') {
                    actualizarTiempoSintomas(pacienteEditando.idGestion, editValue);
                  } else {
                    actualizarConsentimiento(pacienteEditando.idGestion, editValue === 'true');
                  }
                }}
                disabled={procesando}
                className="flex-1 px-4 py-2 bg-[#0A5BA9] text-white rounded-lg font-medium hover:bg-[#083d78] disabled:opacity-50"
              >
                {procesando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ v1.66.1: Modal de Evaluación de ECG - Triaje Clínico */}
      {showECGModal && ecgActual && (
        <ModalEvaluacionECG
          isOpen={showECGModal}
          ecg={ecgActual}
          onClose={() => {
            setShowECGModal(false);
            setEcgActual(null);
          }}
          onConfirm={manejarConfirmacionECG}
          loading={cargandoECG}
        />
      )}

      {/* ✅ v1.80.0: Modal para ver resultados de evaluación guardada */}
      {showResultadosModal && resultadosActuales && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-lg border-b border-blue-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    📋 Resultados de Evaluación ECG
                  </h2>
                  <p className="text-blue-100 text-sm">
                    {formatearNombrePaciente(resultadosActuales.paciente?.apellidosNombres)} (DNI: {resultadosActuales.paciente?.numDoc})
                  </p>
                </div>
                <button
                  onClick={() => setShowResultadosModal(false)}
                  className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
                  title="Cerrar"
                >
                  <X className="w-6 h-6" strokeWidth={2} />
                </button>
              </div>
            </div>

            {/* Contenido */}
            <div className="p-8 space-y-6">
              {/* Evaluación General */}
              <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded">
                <h3 className="text-lg font-bold text-blue-900 mb-2">
                  🔍 Evaluación: {resultadosActuales.evaluacion === 'NORMAL' ? '✅ NORMAL' : '⚠️ ANORMAL'}
                </h3>
                <p className="text-blue-700 font-medium">
                  Estado: {resultadosActuales.evaluacion}
                </p>
                {resultadosActuales.fecha && (
                  <p className="text-blue-600 text-sm mt-1">
                    Evaluado el: {new Date(resultadosActuales.fecha).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                )}
              </div>

              {/* Hallazgos */}
              {resultadosActuales.hallazgos && (
                <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded">
                  <h3 className="text-lg font-bold text-green-900 mb-3">✅ Hallazgos</h3>
                  <ul className="space-y-2">
                    {Array.isArray(resultadosActuales.hallazgos) ? (
                      resultadosActuales.hallazgos.map((h, i) => (
                        <li key={i} className="text-green-700 flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" strokeWidth={2} />
                          <span>{h}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-green-700">{resultadosActuales.hallazgos}</li>
                    )}
                  </ul>
                </div>
              )}

              {/* Observaciones Clínicas */}
              {resultadosActuales.observacionesClinicas && (
                <div className="border-l-4 border-purple-500 bg-purple-50 p-4 rounded">
                  <h3 className="text-lg font-bold text-purple-900 mb-3">📝 Observaciones Clínicas</h3>
                  <p className="text-purple-700 leading-relaxed">
                    {resultadosActuales.observacionesClinicas}
                  </p>
                </div>
              )}

              {/* Descripción de Evaluación */}
              {resultadosActuales.descripcion && (
                <div className="border-l-4 border-amber-500 bg-amber-50 p-4 rounded">
                  <h3 className="text-lg font-bold text-amber-900 mb-3">📌 Descripción</h3>
                  <p className="text-amber-700 leading-relaxed">
                    {resultadosActuales.descripcion}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t rounded-b-lg flex justify-end gap-3">
              <button
                onClick={() => setShowResultadosModal(false)}
                className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ v1.64.0: Modal para Crear Ticket Mesa de Ayuda */}
      <CrearTicketModal
        isOpen={showTicketModal}
        onClose={() => {
          setShowTicketModal(false);
          setPacienteTicket(null);
        }}
        medico={doctorInfo ? {
          id: doctorInfo.idPersonal,
          nombre: doctorInfo.nombre,
          especialidad: doctorInfo.especialidad || userSpecialty?.name || 'General'
        } : null}
        paciente={pacienteTicket ? {
          id: pacienteTicket.idSolicitudBolsa,
          idSolicitudBolsa: pacienteTicket.idSolicitudBolsa,
          tipoDocumento: pacienteTicket.tipoDoc || 'DNI',
          dni: pacienteTicket.numDoc,
          nombre: pacienteTicket.apellidosNombres,
          especialidad: doctorInfo?.especialidad || userSpecialty?.name || 'General',
          ipress: pacienteTicket.ipress,
          telefono: pacienteTicket.telefono
        } : null}
        onSuccess={(ticket) => {
          toast.success('Ticket creado exitosamente');
          setShowTicketModal(false);
          setPacienteTicket(null);
          if (doctorInfo?.idPersonal) cargarTicketsMedico(doctorInfo.idPersonal);
        }}
      />

      {/* Modal Detalle Ticket Mesa de Ayuda - Vista Médico */}
      {ticketDetalleModal && (() => {
        const t = ticketDetalleModal;
        const esResuelto = t.estado === 'RESUELTO';
        const enProceso = t.estado === 'EN_PROCESO';
        const esNuevo = t.estado === 'NUEVO';
        const formatFecha = (f) => f ? new Date(f).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }) : '';
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setTicketDetalleModal(null)} />
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">

              {/* Header con estado visual */}
              <div className={`rounded-t-2xl px-6 py-5 ${esResuelto ? 'bg-gradient-to-r from-green-600 to-green-500' : enProceso ? 'bg-gradient-to-r from-blue-600 to-blue-500' : 'bg-gradient-to-r from-amber-500 to-amber-400'}`}>
                <button onClick={() => setTicketDetalleModal(null)} className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors">
                  <X size={20} />
                </button>
                <p className="text-white/70 text-xs font-medium mb-1">Ticket {t.numeroTicket}</p>
                <h3 className="text-white font-bold text-lg leading-snug">
                  {esResuelto ? 'Tu solicitud fue atendida' : enProceso ? 'Tu solicitud está siendo atendida' : 'Tu solicitud fue recibida'}
                </h3>
                <p className="text-white/60 text-xs mt-2">Enviada el {formatFecha(t.fechaCreacion)}</p>
              </div>

              <div className="p-6">
                {/* Timeline visual */}
                <div className="relative pl-8 space-y-6">
                  {/* Línea vertical del timeline */}
                  <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gray-200" />

                  {/* Paso 1: Lo que reportó el médico */}
                  <div className="relative">
                    <div className="absolute -left-8 top-0.5 w-6 h-6 rounded-full bg-[#0A5BA9] flex items-center justify-center">
                      <span className="text-white text-xs font-bold">1</span>
                    </div>
                    <p className="text-xs font-semibold text-[#0A5BA9] uppercase tracking-wide mb-2">Tu solicitud</p>
                    <div className="bg-blue-50/70 rounded-xl p-4 border border-blue-100">
                      <p className="text-sm font-semibold text-gray-900 mb-1">{t.nombreMotivo || t.titulo || 'Solicitud'}</p>
                      {(t.observaciones || t.descripcion) && (
                        <p className="text-sm text-gray-600 mt-2 border-t border-blue-100 pt-2">"{t.observaciones || t.descripcion}"</p>
                      )}
                    </div>
                  </div>

                  {/* Paso 2: Asignación */}
                  <div className="relative">
                    <div className={`absolute -left-8 top-0.5 w-6 h-6 rounded-full flex items-center justify-center ${t.nombrePersonalAsignado ? 'bg-[#0A5BA9]' : 'bg-gray-300'}`}>
                      <span className="text-white text-xs font-bold">2</span>
                    </div>
                    <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${t.nombrePersonalAsignado ? 'text-[#0A5BA9]' : 'text-gray-400'}`}>
                      PERSONAL DE MESA DE AYUDA ASIGNADO
                    </p>
                    {t.nombrePersonalAsignado ? (
                      <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#0A5BA9] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {t.nombrePersonalAsignado.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{t.nombrePersonalAsignado}</p>
                          <p className="text-xs text-gray-400">Mesa de Ayuda</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 italic">En espera de asignación...</p>
                    )}
                  </div>

                  {/* Paso 3: Respuesta */}
                  <div className="relative">
                    <div className={`absolute -left-8 top-0.5 w-6 h-6 rounded-full flex items-center justify-center ${t.respuesta ? 'bg-green-500' : 'bg-gray-300'}`}>
                      {t.respuesta ? (
                        <CheckCircle size={14} className="text-white" />
                      ) : (
                        <span className="text-white text-xs font-bold">3</span>
                      )}
                    </div>
                    <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${t.respuesta ? 'text-green-600' : 'text-gray-400'}`}>
                      Respuesta
                    </p>
                    {t.respuesta ? (
                      <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
                        <p className="text-sm text-gray-900 leading-relaxed">{t.respuesta}</p>
                        <p className="text-xs text-gray-400 mt-3 pt-2 border-t border-green-200">
                          {formatFecha(t.fechaRespuesta)}
                        </p>
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-xl p-4 border border-dashed border-gray-300">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                          <p className="text-sm text-gray-500">Esperando respuesta de Mesa de Ayuda</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 pb-6">
                <button
                  onClick={() => setTicketDetalleModal(null)}
                  className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors text-sm"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
}
