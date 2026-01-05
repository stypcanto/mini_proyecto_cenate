// Modal de Actualización de Usuario - VERSIÓN COMPLETA CON LÓGICA CONDICIONAL
import React, { useState, useEffect, useRef } from 'react';
import { X, Edit, Shield, Save, User, Mail, Briefcase, GraduationCap, RefreshCw, Key, Building2, Check, Camera, Image as ImageIcon, XCircle, Lock, Send } from 'lucide-react';
import PermisosUsuarioPanel from '../PermisosUsuarioPanel';
import FormField from '../modals/FormField';
import SelectField from '../modals/SelectField';
import api from '../../../../services/apiClient';
import MonthYearPicker from '../../../../components/common/MonthYearPicker';
import { getFotoUrl } from '../../../../utils/apiUrlHelper';
import { useAuth } from '../../../../context/AuthContext';
import { clearToken, clearUser } from '../../../../constants/auth';
import FirmaDigitalTab from './FirmaDigitalTab'; // 🆕 v1.14.0
import ActualizarEntregaTokenModal from './ActualizarEntregaTokenModal'; // 🆕 v1.14.0

// 🛠️ Helper: Convertir fecha del servidor (YYYY-MM-DD) a formato de input date sin cambio de zona horaria
const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  // Si ya está en formato correcto YYYY-MM-DD, retornar tal cual
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }
  // Si tiene tiempo, extraer solo la fecha
  return dateString.split('T')[0];
};

// 🆕 v1.15.15: Helper para enviar fechas al backend sin conversión UTC
// IMPORTANTE: Previene el bug donde "02/05/2025" se guarda como "01/05/2025"
const formatDateForBackend = (dateString) => {
  if (!dateString) return null;

  // Si ya está en formato YYYY-MM-DD correcto, retornar tal cual
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }

  // Si es un objeto Date, formatear manualmente en zona horaria local
  if (dateString instanceof Date) {
    const year = dateString.getFullYear();
    const month = String(dateString.getMonth() + 1).padStart(2, '0');
    const day = String(dateString.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  return dateString;
};

const ActualizarModel = ({ user, onClose, onSuccess, initialTab = 'personal', firmaDigitalOnly = false }) => {
  const { user: currentUser } = useAuth();
  const [selectedTab, setSelectedTab] = useState(initialTab); // 🎯 v1.14.0 - Soporta tab inicial personalizado
  const [loading, setLoading] = useState(false);
  const [ipress, setIpress] = useState([]);
  const [ipressAll, setIpressAll] = useState([]); // Todas las IPRESS sin filtrar
  const [loadingIpress, setLoadingIpress] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [correoSeleccionado, setCorreoSeleccionado] = useState(null);

  // Estados para Red y Macroregión (externos)
  const [redes, setRedes] = useState([]);
  const [loadingRedes, setLoadingRedes] = useState(false);
  const [redSeleccionada, setRedSeleccionada] = useState(null);
  const [macroregionInfo, setMacroregionInfo] = useState(null);
  const [showRedModal, setShowRedModal] = useState(false); // Modal para seleccionar Red

  // Estado para foto
  const [fotoSeleccionada, setFotoSeleccionada] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [fotoActual, setFotoActual] = useState(user?.foto_url || user?.foto_pers || null);
  const fileInputRef = useRef(null);

  // Ref para el panel de permisos
  const permisosRef = useRef(null);

  // Función helper para obtener el ID del usuario de forma segura
  const getUserId = () => {
    if (!user) {
      console.error('User object is null or undefined');
      return null;
    }

    // Lista exhaustiva de posibles nombres de propiedades para el ID
    const possibleIdProps = [
      'id_usuario', 'idUsuario', 'id', 'idUser',
      'userId', 'user_id', 'ID', 'Id',
      'id_user', 'ID_USUARIO', 'IDUSUARIO'
    ];

    // Primero intenta propiedades directas
    for (const prop of possibleIdProps) {
      if (user[prop] !== undefined && user[prop] !== null) {
        console.log(`ID encontrado en user.${prop}:`, user[prop]);
        return user[prop];
      }
    }

    // Intenta buscar en propiedades anidadas comunes
    if (user.data) {
      for (const prop of possibleIdProps) {
        if (user.data[prop] !== undefined && user.data[prop] !== null) {
          console.log(`ID encontrado en user.data.${prop}:`, user.data[prop]);
          return user.data[prop];
        }
      }
    }

    // Si nada funciona, busca cualquier propiedad que tenga "id" en el nombre
    const allProps = Object.keys(user);
    const idProp = allProps.find(prop =>
      prop.toLowerCase().includes('id') &&
      typeof user[prop] === 'number'
    );

    if (idProp) {
      console.log(`ID encontrado buscando "id" en propiedades: user.${idProp}:`, user[idProp]);
      return user[idProp];
    }

    console.error('No se pudo encontrar el ID del usuario en ninguna propiedad');
    console.error('Propiedades disponibles:', Object.keys(user));
    console.error('Usuario completo:', user);
    return null;
  };

  // Estados para roles
  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [currentUserRoles, setCurrentUserRoles] = useState([]);

  // Estados para catálogos profesionales
  const [profesiones, setProfesiones] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [regimenesLaborales, setRegimenesLaborales] = useState([]);
  const [areas, setAreas] = useState([]);
  const [tiposProfesional, setTiposProfesional] = useState([]); // 🆕 Tipos de profesional
  const [loadingCatalogos, setLoadingCatalogos] = useState(false);

  const [formData, setFormData] = useState({
    // Datos Básicos
    username: user?.username || '',

    // Datos Personales
    tipo_documento: user.tipo_documento || 'DNI',
    numero_documento: user.numero_documento || '',
    nombres: user.nombres || user.nombre_completo?.split(' ').slice(2).join(' ') || '',
    fecha_nacimiento: user.fecha_nacimiento || '',
    genero: user.genero || '',
    correo_institucional: user.correo_corporativo || user.correo_institucional || '',
    apellido_paterno: user.apellido_paterno || user.nombre_completo?.split(' ')[0] || '',
    apellido_materno: user.apellido_materno || user.nombre_completo?.split(' ')[1] || '',
    correo_personal: user.correo_personal || '',
    telefono: user.telefono || '',
    tipo_personal: user.tipo_personal || 'Interno',
    id_red: user.id_red || null, // Red seleccionada (para externos)
    id_ipress: user.idIpress || user.id_ipress || '',
    direccion: user.direccion || '',

    // Datos Profesionales
    id_profesion: user.id_profesion || '',
    desc_prof_otro: user.desc_prof_otro || '',
    colegiatura: user.colegiatura || '',
    tiene_especialidad_medica: user.tiene_especialidad_medica || (user.id_especialidad ? 'SI' : ''),
    id_especialidad: user.id_especialidad || '',
    rne: user.rne || '',

    // Datos Laborales
    id_regimen_laboral: user.id_regimen_laboral || '',
    id_tip_pers: user.id_tip_pers || '', // 🆕 Tipo de profesional
    codigo_planilla: user.codigo_planilla || '',
    periodo_ingreso: user.periodo_ingreso || '',
    id_area: user.id_area || '',
    // 🔥 CORRECCIÓN: Mantener el estado actual del usuario, por defecto ACTIVO
    estado: user.estado_usuario === 'INACTIVO' || user.estado_usuario === 'I' ? 'I' : 'A',

    // 🆕 v1.14.0 - Firma Digital (se cargará desde API)
    entrego_token: null,
    numero_serie_token: '',
    fecha_entrega_token: '',
    fecha_inicio_certificado: '',
    fecha_vencimiento_certificado: '',
    motivo_sin_token: null,
    observaciones_firma: '',

    // Roles
    roles: user?.roles ? (Array.isArray(user.roles) ? user.roles : [user.roles]) : []
  });

  // 🆕 v1.14.0 - Estados para Firma Digital
  const [firmaDigitalData, setFirmaDigitalData] = useState(null);
  const [loadingFirmaDigital, setLoadingFirmaDigital] = useState(false);
  const [mostrarModalActualizarEntrega, setMostrarModalActualizarEntrega] = useState(false);

  const [errors, setErrors] = useState({});

  useEffect(() => {
    console.log('=== DEBUGGING MODAL EDITAR USUARIO ===');
    console.log('Usuario recibido en modal:', user);
    console.log('Tipo de user:', typeof user);
    console.log('Propiedades de user:', user ? Object.keys(user) : 'user es null/undefined');
    console.log('Valores de user:', user ? Object.entries(user).slice(0, 10) : 'user es null/undefined');
    console.log('🔴 ESTADO DEL USUARIO:', user?.estado_usuario);
    console.log('🔴 ACTIVO:', user?.activo);
    console.log('🔴 ESTADO INICIAL CALCULADO:', user?.estado_usuario === 'INACTIVO' || user?.estado_usuario === 'I' ? 'I' : 'A');
    console.log('🔵 DATOS PROFESIONALES:');
    console.log('  - id_profesion:', user?.id_profesion);
    console.log('  - colegiatura:', user?.colegiatura);
    console.log('  - id_especialidad:', user?.id_especialidad);
    console.log('  - rne:', user?.rne);
    console.log('🟢 DATOS LABORALES:');
    console.log('  - id_regimen_laboral:', user?.id_regimen_laboral);
    console.log('  - codigo_planilla:', user?.codigo_planilla);
    console.log('  - id_area:', user?.id_area);
    console.log('  - periodo_ingreso:', user?.periodo_ingreso);

    const detectedId = getUserId();
    console.log('ID detectado:', detectedId);
    console.log('=====================================');

    cargarIpress();
    cargarCatalogos();
    cargarRoles();
    cargarFirmaDigital(); // 🆕 v1.14.0

    // 🔄 v1.14.1 - Si solo tenemos datos mínimos (desde Control de Firma Digital), cargar perfil completo
    // Detectamos datos mínimos si NO tiene nombres o apellidos (datos personales completos)
    const tieneDatosMinimos = !user?.nombres && !user?.apellido_paterno && detectedId;
    if (tieneDatosMinimos) {
      console.log('⚠️ Detectado datos mínimos, cargando perfil completo del usuario...');
      cargarPerfilCompleto(detectedId);
    }

    // 🌐 Si el usuario tiene rol COORDINADOR_RED, cargar las redes
    const userRoles = user?.roles ? (Array.isArray(user.roles) ? user.roles : [user.roles]) : [];
    if (userRoles.includes('COORDINADOR_RED')) {
      console.log('🌐 Usuario tiene rol COORDINADOR_RED, cargando redes...');
      cargarRedes();
    }

    // Cargar foto actual si existe
    if (user?.foto_url || user?.foto_pers) {
      const fotoUrl = user.foto_url || user.foto_pers;
      // Usar helper centralizado para construir URL
      const fotoUrlFinal = getFotoUrl(fotoUrl);
      if (fotoUrlFinal) {
        setFotoActual(fotoUrlFinal);
      }
    }

    // Si el usuario es EXTERNO, cargar Redes y todas las IPRESS
    const esExterno = !ipress.find(ip => ip.idIpress === (user?.idIpress || user?.id_ipress))?.descIpress?.toUpperCase().includes('CENATE') &&
                     (user?.idIpress || user?.id_ipress) !== 2;
    if (esExterno) {
      cargarRedes();
      cargarTodasIpress();
    }
  }, [user]);

  // Cargar Redes y IPRESS cuando el tipo de personal cambie a EXTERNO (desde UI)
  useEffect(() => {
    // Detectar si es externo basándose en la IPRESS actual
    const ipressActual = ipress.find(ip => ip.idIpress === parseInt(formData.id_ipress));
    const esCenate = ipressActual?.descIpress?.toUpperCase().includes('CENATE') ||
                     ipressActual?.codIpress === '739' ||
                     parseInt(formData.id_ipress) === 2;

    if (!esCenate && formData.id_ipress && ipress.length > 0 && redes.length === 0) {
      cargarRedes();
      cargarTodasIpress();
    }
  }, [formData.id_ipress, ipress]);

  // Inicializar id_red basándose en la IPRESS del usuario al cargar
  useEffect(() => {
    if (ipressAll.length > 0 && formData.id_ipress && !formData.id_red) {
      const ipressUsuario = ipressAll.find(ip => ip.idIpress === parseInt(formData.id_ipress));
      if (ipressUsuario) {
        const redId = ipressUsuario.idRed || ipressUsuario.red?.idRed || ipressUsuario.red?.id;
        if (redId) {
          console.log('🔵 Inicializando id_red desde IPRESS del usuario:', redId);
          setFormData(prev => ({ ...prev, id_red: redId }));
        }
      }
    }
  }, [ipressAll, formData.id_ipress]);

  // Filtrar IPRESS cuando cambia la Red seleccionada
  useEffect(() => {
    if (formData.id_red && ipressAll.length > 0) {
      const redId = parseInt(formData.id_red);
      // Buscar por id_red O por idRed (compatibilidad con diferentes formatos)
      const ipressFiltradas = ipressAll.filter(ip => {
        const ipressRedId = ip.idRed || ip.red?.idRed || ip.red?.id;
        return ipressRedId === redId;
      });
      console.log('🔍 IPRESS filtradas por Red', redId, ':', ipressFiltradas.length);

      // Si no hay IPRESS para esta Red, buscar una IPRESS con el MISMO nombre que la Red
      if (ipressFiltradas.length === 0) {
        const redSelec = redes.find(r => (r.id || r.idRed) === redId);
        if (redSelec) {
          const nombreRedOriginal = (redSelec.descripcion || redSelec.descRed || '').toUpperCase().trim();

          // Normalizar nombre (expandir abreviaturas comunes)
          const normalizarNombre = (nombre) => {
            return nombre
              .replace(/INSTIT\./g, 'INSTITUTO')
              .replace(/INST\./g, 'INSTITUTO')
              .replace(/HOSP\./g, 'HOSPITAL')
              .replace(/NAC\./g, 'NACIONAL')
              .replace(/CLIN\./g, 'CLINICA')
              .replace(/CTR\./g, 'CENTRO')
              .trim();
          };

          const nombreRed = normalizarNombre(nombreRedOriginal);
          console.log('🔍 Red sin IPRESS asociadas. Red:', nombreRed);

          // Extraer palabras clave significativas
          const palabrasIgnorar = ['DE', 'LA', 'EL', 'LOS', 'LAS', 'DEL', 'Y', 'EN'];
          const getPalabrasClave = (texto) => {
            return normalizarNombre(texto).split(' ').filter(p => p.length > 2 && !palabrasIgnorar.includes(p));
          };

          const palabrasClaveRed = getPalabrasClave(nombreRed);

          // Buscar IPRESS con coincidencia
          const ipressSimilar = ipressAll.find(ip => {
            const nombreIpressOriginal = (ip.descIpress || '').toUpperCase().trim();
            const nombreIpress = normalizarNombre(nombreIpressOriginal);

            // 1. Coincidencia exacta (normalizada)
            if (nombreIpress === nombreRed) return true;

            // 2. Uno contiene al otro
            if (nombreIpress.includes(nombreRed) || nombreRed.includes(nombreIpress)) return true;

            // 3. Coincidencia por palabras clave (al menos 3 palabras deben coincidir)
            const palabrasClaveIpress = getPalabrasClave(nombreIpress);
            const coincidencias = palabrasClaveRed.filter(p => palabrasClaveIpress.includes(p));
            if (coincidencias.length >= 3 || (coincidencias.length >= 2 && palabrasClaveRed.length <= 3)) {
              return true;
            }

            return false;
          });

          if (ipressSimilar) {
            console.log('✅ IPRESS encontrada:', ipressSimilar.descIpress);
            setIpress([ipressSimilar]);
            // Auto-seleccionar esta IPRESS
            setFormData(prev => ({ ...prev, id_ipress: ipressSimilar.idIpress }));
          } else {
            console.log('⚠️ No existe IPRESS con nombre similar a:', nombreRed);
            setIpress([]);
          }
        }
      } else {
        setIpress(ipressFiltradas);
        // Verificar si la IPRESS actual sigue en la lista filtrada
        if (formData.id_ipress) {
          const existeEnFiltro = ipressFiltradas.some(ip => ip.idIpress === parseInt(formData.id_ipress));
          if (!existeEnFiltro) {
            // La IPRESS actual no pertenece a esta Red, limpiar
            setFormData(prev => ({ ...prev, id_ipress: null }));
            setMacroregionInfo(null);
          }
        }
      }
    }
  }, [formData.id_red, ipressAll, redes]);

  // Actualizar Macroregión cuando cambia la IPRESS seleccionada
  useEffect(() => {
    if (formData.id_ipress && ipressAll.length > 0) {
      const ipressSeleccionada = ipressAll.find(ip => ip.idIpress === parseInt(formData.id_ipress));
      if (ipressSeleccionada?.red?.macroregion) {
        setMacroregionInfo(ipressSeleccionada.red.macroregion);
        console.log('🗺️ Macroregión encontrada:', ipressSeleccionada.red.macroregion);
      } else {
        setMacroregionInfo(null);
      }
    } else {
      setMacroregionInfo(null);
    }
  }, [formData.id_ipress, ipressAll]);

  // 🌐 Inicializar la Red seleccionada para COORDINADOR_RED cuando se cargan las redes
  useEffect(() => {
    if (redes.length > 0 && formData.id_red && formData.roles.includes('COORDINADOR_RED')) {
      const redId = parseInt(formData.id_red);
      const redSel = redes.find(r => (r.id || r.idRed) === redId);
      if (redSel) {
        console.log('🌐 Inicializando Red seleccionada para COORDINADOR_RED:', redSel);
        setRedSeleccionada(redSel);
        if (redSel.macroregion) {
          setMacroregionInfo(redSel.macroregion);
        }
      }
    }
  }, [redes, formData.id_red, formData.roles]);

  // 🔄 v1.14.1 - Cargar perfil completo del usuario desde el backend
  const cargarPerfilCompleto = async (userId) => {
    try {
      console.log(`🔄 Cargando perfil completo del usuario ID: ${userId}...`);
      const response = await api.get(`/usuarios/id/${userId}`);
      const userData = response.data || response;

      console.log('✅ Perfil completo cargado:', userData);

      // Actualizar formData con todos los datos del perfil
      setFormData(prev => ({
        ...prev,
        // Datos Personales
        numero_documento: userData.num_doc_pers || prev.numero_documento,
        nombres: userData.nom_pers || prev.nombres,
        apellido_paterno: userData.ape_pater_pers || prev.apellido_paterno,
        apellido_materno: userData.ape_mater_pers || prev.apellido_materno,
        fecha_nacimiento: userData.fec_nac_pers || prev.fecha_nacimiento,
        genero: userData.sexo_pers || prev.genero,
        correo_personal: userData.email_pers || prev.correo_personal,
        correo_institucional: userData.email_corp_pers || prev.correo_institucional,
        telefono: userData.fono_pers || prev.telefono,
        direccion: userData.direc_pers || prev.direccion,

        // Datos Profesionales
        id_profesion: userData.id_prof || prev.id_profesion,
        colegiatura: userData.num_coleg_pers || prev.colegiatura,
        id_especialidad: userData.id_serv_essi || prev.id_especialidad,
        rne: userData.rne_pers || prev.rne,

        // Datos Laborales
        id_regimen_laboral: userData.id_reg_lab || prev.id_regimen_laboral,
        id_tip_pers: userData.id_tip_pers || prev.id_tip_pers,
        codigo_planilla: userData.cod_planilla_pers || prev.codigo_planilla,
        periodo_ingreso: userData.per_ing_pers || prev.periodo_ingreso,
        id_area: userData.id_area || prev.id_area,
        id_ipress: userData.id_ipress || prev.id_ipress,

        // Estado
        estado: userData.stat_pers === 'I' ? 'I' : 'A'
      }));

    } catch (error) {
      console.error('❌ Error al cargar perfil completo del usuario:', error);
    }
  };

  const cargarIpress = async () => {
    try {
      setLoadingIpress(true);
      const response = await api.get('/ipress');
      setIpress(Array.isArray(response) ? response : response.data || []);
    } catch (error) {
      console.error('Error al cargar IPRESS:', error);
    } finally {
      setLoadingIpress(false);
    }
  };

  // Cargar todas las IPRESS (para filtrar por Red)
  const cargarTodasIpress = async () => {
    try {
      setLoadingIpress(true);
      console.log('🔍 Cargando todas las IPRESS desde /ipress...');
      const ipressResponse = await api.get('/ipress');
      console.log('✅ IPRESS cargadas:', ipressResponse);

      const ipressData = Array.isArray(ipressResponse) ? ipressResponse : [];
      const ipressFiltered = ipressData.filter(ip =>
        ip.codIpress !== '739' &&
        !ip.descIpress?.toUpperCase().includes('CENTRO NACIONAL DE TELEMEDICINA')
      );

      console.log('🏥 Total IPRESS (sin CENATE):', ipressFiltered.length);
      setIpressAll(ipressFiltered);
      setIpress([]); // Se llenará cuando se seleccione una Red
      setLoadingIpress(false);
    } catch (error) {
      console.error('❌ Error al cargar IPRESS:', error);
      setLoadingIpress(false);
    }
  };

  // Cargar Redes desde el backend
  const cargarRedes = async () => {
    try {
      setLoadingRedes(true);
      console.log('🔍 Cargando Redes desde /redes...');
      const redesResponse = await api.get('/redes');
      console.log('✅ Redes cargadas:', redesResponse);

      const redesData = Array.isArray(redesResponse) ? redesResponse : [];
      // Ordenar alfabéticamente por descripción
      const redesOrdenadas = redesData.sort((a, b) => {
        const descA = (a.descripcion || a.descRed || '').toLowerCase();
        const descB = (b.descripcion || b.descRed || '').toLowerCase();
        return descA.localeCompare(descB);
      });

      console.log('🏥 Total Redes:', redesOrdenadas.length);
      setRedes(redesOrdenadas);
      setLoadingRedes(false);
    } catch (error) {
      console.error('❌ Error al cargar Redes:', error);
      setRedes([]);
      setLoadingRedes(false);
    }
  };

  const cargarCatalogos = async () => {
    try {
      setLoadingCatalogos(true);
      //epy
      const [profRes, espRes, regRes, areaRes, tiposRes] = await Promise.all([
        api.get('/profesiones').catch((err) => { console.error('Error profesiones:', err); return { data: [] }; }),
        api.get('/servicio-essi').catch((err) => { console.error('Error especialidades:', err); return { data: [] }; }), // ✅ Usar mismo endpoint que CrearUsuarioModal
        api.get('/regimenes').catch((err) => { console.error('Error regimenes:', err); return { data: [] }; }),
        api.get('/admin/areas').catch((err) => { console.error('Error areas:', err); return { data: [] }; }),
        api.get('/tipos-personal').catch((err) => { console.error('Error tipos personal:', err); return { data: [] }; }) // 🆕 Tipos de profesional
      ]);

      console.log('Profesiones:', profRes);
      console.log('Especialidades:', espRes);
      console.log('Regímenes:', regRes);
      console.log('Áreas:', areaRes);

      // Función helper para extraer datos de diferentes estructuras de respuesta
      const extractData = (response) => {
        if (Array.isArray(response)) return response;
        if (response?.data && Array.isArray(response.data)) return response.data;
        if (response?.content && Array.isArray(response.content)) return response.content;
        return [];
      };

      // Extraer y ordenar datos
      const profData = extractData(profRes);
      const profOrdenadas = profData.sort((a, b) => {
        const descA = ((a.descProf || a.desc_prof || a.nombre) || '').toLowerCase();
        const descB = ((b.descProf || b.desc_prof || b.nombre) || '').toLowerCase();
        return descA.localeCompare(descB);
      });

      const espData = extractData(espRes);
      const espOrdenadas = espData.sort((a, b) => {
        // ✅ Usar mismo mapeo que CrearUsuarioModal: descServicio
        const descA = ((a.descServicio || a.descripcion || a.descEsp || a.desc_esp || a.nombre) || '').toLowerCase();
        const descB = ((b.descServicio || b.descripcion || b.descEsp || b.desc_esp || b.nombre) || '').toLowerCase();
        return descA.localeCompare(descB);
      });

      const regData = extractData(regRes);
      const regOrdenados = regData.sort((a, b) => {
        const descA = ((a.descRegLab || a.desc_reg_lab || a.descripcion || a.nombre) || '').toLowerCase();
        const descB = ((b.descRegLab || b.desc_reg_lab || b.descripcion || b.nombre) || '').toLowerCase();
        return descA.localeCompare(descB);
      });

      const areaData = extractData(areaRes);
      const areasOrdenadas = areaData.sort((a, b) => {
        const descA = ((a.descArea || a.desc_area || a.nombre || a.descripcion) || '').toLowerCase();
        const descB = ((b.descArea || b.desc_area || b.nombre || b.descripcion) || '').toLowerCase();
        return descA.localeCompare(descB);
      });

      const tiposData = extractData(tiposRes);
      const tiposOrdenados = tiposData.sort((a, b) => {
        const descA = ((a.descTipPers || a.desc_tip_pers || a.nombre || a.descripcion) || '').toLowerCase();
        const descB = ((b.descTipPers || b.desc_tip_pers || b.nombre || b.descripcion) || '').toLowerCase();
        return descA.localeCompare(descB);
      });

      console.log('🔥 Profesiones ordenadas:', profOrdenadas.length);
      console.log('🔥 Especialidades ordenadas:', espOrdenadas.length);
      console.log('🔥 Regímenes ordenados:', regOrdenados.length);
      console.log('🔥 Áreas ordenadas:', areasOrdenadas.length);
      console.log('🔥 Tipos de profesional ordenados:', tiposOrdenados.length);

      setProfesiones(profOrdenadas);
      setEspecialidades(espOrdenadas);
      setRegimenesLaborales(regOrdenados);
      setAreas(areasOrdenadas);
      setTiposProfesional(tiposOrdenados);

    } catch (error) {
      console.error('Error al cargar catálogos:', error);
    } finally {
      setLoadingCatalogos(false);
    }
  };

  const cargarRoles = async () => {
    try {
      const userResponse = await api.get('/auth/me');
      setCurrentUserRoles(userResponse.roles || []);

      const rolesResponse = await api.get('/admin/roles');
      setRoles(Array.isArray(rolesResponse) ? rolesResponse : []);
      setLoadingRoles(false);
    } catch (error) {
      console.error('Error al cargar roles:', error);
      setLoadingRoles(false);
    }
  };

  // 🆕 v1.14.0 - Cargar datos de firma digital
  const cargarFirmaDigital = async () => {
    if (!user?.id_personal) {
      console.log('⚠️ Usuario no tiene id_personal, saltando carga de firma digital');
      return;
    }

    setLoadingFirmaDigital(true);
    try {
      const response = await api.get(`/api/firma-digital/personal/${user.id_personal}`);
      if (response.data?.status === 200 && response.data?.data) {
        const firma = response.data.data;
        console.log('🖋️ Firma digital cargada:', firma);
        setFirmaDigitalData(firma);

        // Actualizar formData con los datos de firma digital
        setFormData(prev => ({
          ...prev,
          entrego_token: firma.entregoToken ? 'SI' : 'NO',
          numero_serie_token: firma.numeroSerieToken || '',
          fecha_entrega_token: formatDateForInput(firma.fechaEntregaToken),
          fecha_inicio_certificado: formatDateForInput(firma.fechaInicioCertificado),
          fecha_vencimiento_certificado: formatDateForInput(firma.fechaVencimientoCertificado),
          motivo_sin_token: firma.motivoSinToken || null,
          observaciones_firma: firma.observaciones || ''
        }));
      }
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('ℹ️ Usuario no tiene firma digital registrada');
      } else {
        console.error('❌ Error al cargar firma digital:', error);
      }
    } finally {
      setLoadingFirmaDigital(false);
    }
  };

  const handleRoleToggle = (roleName) => {
    const isPrivileged = ['ADMIN', 'SUPERADMIN'].includes(roleName);
    const isSuperAdmin = currentUserRoles.includes('SUPERADMIN');

    if (isPrivileged && !isSuperAdmin) {
      alert('Solo SUPERADMIN puede asignar roles privilegiados');
      return;
    }

    // Si se está seleccionando COORDINADOR_RED, abrir modal para seleccionar Red
    if (roleName === 'COORDINADOR_RED' && !formData.roles.includes('COORDINADOR_RED')) {
      console.log('🌐 Abriendo modal para seleccionar Red...');
      cargarRedes();
      // Agregar el rol primero
      setFormData(prev => ({
        ...prev,
        roles: [...prev.roles, roleName]
      }));
      // Abrir modal para seleccionar Red
      setShowRedModal(true);
      return;
    }

    // Si se está deseleccionando COORDINADOR_RED, limpiar la red seleccionada
    if (roleName === 'COORDINADOR_RED' && formData.roles.includes('COORDINADOR_RED')) {
      setFormData(prev => ({
        ...prev,
        roles: prev.roles.filter(r => r !== roleName),
        id_red: null // Limpiar Red al quitar el rol
      }));
      setRedSeleccionada(null);
      return;
    }

    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(roleName)
        ? prev.roles.filter(r => r !== roleName)
        : [...prev.roles, roleName]
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Constante para el tamaño máximo permitido (5MB)
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB en bytes

  // Función para formatear el tamaño del archivo
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  // Manejar selección de foto
  const handleFotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        alert('⚠️ Por favor selecciona un archivo de imagen válido (JPG, PNG, GIF, etc.)');
        return;
      }
      
      // Validar tamaño (máximo 5MB)
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      if (file.size > MAX_FILE_SIZE) {
        alert(
          `⚠️ La imagen es demasiado grande.\n\n` +
          `Tamaño del archivo: ${formatFileSize(file.size)}\n` +
          `Tamaño máximo permitido: 5 MB\n\n` +
          `Por favor selecciona una imagen más pequeña.`
        );
        return;
      }
      
      setFotoSeleccionada(file);
      
      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Eliminar foto seleccionada
  const handleEliminarFoto = () => {
    setFotoSeleccionada(null);
    setFotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Eliminar foto actual del servidor
  const handleEliminarFotoActual = async () => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar la foto actual?')) {
      return;
    }
    
    try {
      const userId = getUserId();
      if (!userId) {
        alert('❌ Error: No se pudo obtener el ID del usuario');
        return;
      }
      
      setLoading(true);
      await api.delete(`/personal/foto/${userId}`);
      setFotoActual(null);
      setFotoSeleccionada(null);
      setFotoPreview(null);
      alert('✅ Foto eliminada exitosamente');
    } catch (error) {
      console.error('Error al eliminar foto:', error);
      alert('❌ Error al eliminar la foto: ' + (error.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const validateTab = (tab) => {
    const newErrors = {};

    if (tab === 'personal') {
      if (!formData.username?.trim()) newErrors.username = 'Campo obligatorio';
      if (!formData.numero_documento?.trim()) newErrors.numero_documento = 'Campo obligatorio';
      if (!formData.nombres?.trim()) newErrors.nombres = 'Campo obligatorio';
      if (!formData.apellido_paterno?.trim()) newErrors.apellido_paterno = 'Campo obligatorio';
      if (!formData.apellido_materno?.trim()) newErrors.apellido_materno = 'Campo obligatorio';
      if (!formData.correo_personal?.trim()) newErrors.correo_personal = 'Campo obligatorio';
    }

    if (tab === 'profesional') {
      // Validar si seleccionó OTRO y no especificó
      const profesionSeleccionada = profesiones.find(p => 
        p.idProf === parseInt(formData.id_profesion)
      );
      if (profesionSeleccionada?.descProf?.toUpperCase().includes('OTRO') && !formData.desc_prof_otro?.trim()) {
        newErrors.desc_prof_otro = 'Debe especificar la profesión';
      }

      // Si es MEDICINA, Colegiatura es obligatoria
      const esMedicina = profesionSeleccionada?.descProf?.toUpperCase().includes('MEDICINA');
      if (esMedicina && !formData.colegiatura?.trim()) {
        newErrors.colegiatura = 'La colegiatura es obligatoria para profesionales de medicina';
      }

      // Si tiene especialidad médica = SI, entonces Especialidad y RNE son obligatorios
      if (esMedicina && formData.tiene_especialidad_medica === 'SI') {
        if (!formData.id_especialidad) {
          newErrors.id_especialidad = 'Debe seleccionar una especialidad';
        }
        if (!formData.rne?.trim()) {
          newErrors.rne = 'El RNE es obligatorio';
        }
      }
    }

    if (tab === 'laboral') {
      // Validar Código de Planilla si es régimen 728 o CAS
      const regimenSeleccionado = regimenesLaborales.find(r =>
        r.idRegLab === parseInt(formData.id_regimen_laboral)
      );
      const requiereCodigoPlanilla = regimenSeleccionado?.descRegLab?.toUpperCase().includes('728') ||
                                      regimenSeleccionado?.descRegLab?.toUpperCase().includes('CAS');

      if (requiereCodigoPlanilla && !formData.codigo_planilla?.trim()) {
        newErrors.codigo_planilla = 'El código de planilla es obligatorio para este régimen laboral';
      }
    }

    // 🌐 Validar Red para COORDINADOR_RED
    if (tab === 'roles') {
      if (formData.roles.includes('COORDINADOR_RED') && !formData.id_red) {
        newErrors.id_red = 'Debe seleccionar una Red para el Coordinador';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 🆕 v1.14.1 - FUNCIÓN: Guardar SOLO firma digital (sin tocar perfil de usuario)
  const handleSubmitFirmaDigitalOnly = async () => {
    try {
      setLoading(true);
      const userId = getUserId();

      if (!userId) {
        alert('❌ Error: No se pudo obtener el ID del usuario');
        setLoading(false);
        return;
      }

      // Preparar request SOLO con datos de firma digital
      const firmaDigitalRequest = {
        idPersonal: userId,
        entregoToken: formData.entrego_token === 'SI',
        numeroSerieToken: formData.numero_serie_token || null,
        fechaEntregaToken: formatDateForBackend(formData.fecha_entrega_token),
        fechaInicioCertificado: formatDateForBackend(formData.fecha_inicio_certificado),
        fechaVencimientoCertificado: formatDateForBackend(formData.fecha_vencimiento_certificado),
        motivoSinToken: formData.motivo_sin_token || null,
        observaciones: formData.observaciones_firma || null
      };

      console.log('📤 Actualizando SOLO firma digital:', firmaDigitalRequest);

      // Llamar al endpoint POST /api/firma-digital (hace UPSERT)
      const response = await api.post('/firma-digital', firmaDigitalRequest);

      console.log('✅ Firma digital actualizada exitosamente:', response.data);

      alert('✅ Firma digital actualizada exitosamente');

      // Cerrar modal y refrescar tabla
      onClose();
      if (onSuccess) {
        onSuccess();
      }

    } catch (error) {
      console.error('❌ Error al actualizar firma digital:', error);

      const errorMsg = error.response?.data?.message ||
                       error.message ||
                       'Error desconocido al actualizar firma digital';

      alert(`❌ Error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleNextOrSubmit = async (e) => {
    e.preventDefault();

    if (selectedTab === 'personal') {
      if (!validateTab('personal')) {
        alert('Por favor complete todos los campos obligatorios');
        return;
      }
      setSelectedTab('profesional');
      return;
    }

    if (selectedTab === 'profesional') {
      if (!validateTab('profesional')) {
        alert('Por favor complete todos los campos obligatorios');
        return;
      }
      setSelectedTab('laboral');
      return;
    }

    if (selectedTab === 'laboral') {
      if (!validateTab('laboral')) {
        alert('Por favor complete todos los campos obligatorios');
        return;
      }
      setSelectedTab('firma'); // 🆕 v1.14.0 - Ir a Firma Digital
      return;
    }

    // 🆕 v1.14.0 - Validación de Firma Digital
    if (selectedTab === 'firma') {
      const firmaErrors = {};
      const regimenSeleccionado = regimenesLaborales.find(r =>
        r.idRegLab === parseInt(formData.id_regimen_laboral)
      );
      const descRegimen = regimenSeleccionado?.descRegLab?.toUpperCase() || '';
      const requiereFirmaDigital = descRegimen.includes('CAS') || descRegimen.includes('728');

      if (requiereFirmaDigital) {
        // Validar que seleccionó si entregó token
        if (!formData.entrego_token) {
          firmaErrors.entrego_token = 'Debe indicar si entregó token';
        }

        // Si SÍ entregó: validar fechas Y número de serie
        if (formData.entrego_token === 'SI') {
          if (!formData.numero_serie_token || formData.numero_serie_token.trim() === '') {
            firmaErrors.numero_serie_token = 'Número de serie obligatorio';
          }
          if (!formData.fecha_inicio_certificado) {
            firmaErrors.fecha_inicio_certificado = 'Fecha de inicio obligatoria';
          }
          if (!formData.fecha_vencimiento_certificado) {
            firmaErrors.fecha_vencimiento_certificado = 'Fecha de vencimiento obligatoria';
          }
          if (formData.fecha_inicio_certificado && formData.fecha_vencimiento_certificado) {
            if (new Date(formData.fecha_vencimiento_certificado) <= new Date(formData.fecha_inicio_certificado)) {
              firmaErrors.fecha_vencimiento_certificado = 'Debe ser posterior a fecha de inicio';
            }
          }
        }

        // Si NO entregó: validar motivo
        if (formData.entrego_token === 'NO') {
          if (!formData.motivo_sin_token) {
            firmaErrors.motivo_sin_token = 'Debe seleccionar un motivo';
          }
          // Si YA_TIENE: validar fechas del certificado existente
          if (formData.motivo_sin_token === 'YA_TIENE') {
            if (!formData.fecha_inicio_certificado || !formData.fecha_vencimiento_certificado) {
              firmaErrors.fecha_inicio_certificado = 'Fechas del certificado obligatorias';
            }
          }
        }
      }

      setErrors(firmaErrors);

      if (Object.keys(firmaErrors).length > 0) {
        alert('Por favor corrija los errores en firma digital');
        return;
      }

      // 🆕 v1.14.1 - Si firmaDigitalOnly=true, guardar SOLO firma digital (no perfil completo)
      if (firmaDigitalOnly) {
        await handleSubmitFirmaDigitalOnly();
        return;
      }

      setSelectedTab('roles');
      return;
    }

    if (selectedTab === 'roles') {
      if (formData.roles.length === 0) {
        alert('Debe seleccionar al menos un rol');
        return;
      }
      setSelectedTab('permisos');
      return;
    }

    if (selectedTab === 'permisos') {
      setLoading(true);
      await handleSubmit();
    }
  };

  // 🔥 FUNCIÓN HELPER: Mapear tipo de documento a ID
  const getTipoDocumentoId = (tipoDoc) => {
    const mapping = {
      'DNI': 1,
      'CE': 2,
      'PASAPORTE': 3
    };
    return mapping[tipoDoc] || 1; // Por defecto DNI
  };

  const handleSubmit = async () => {
    try {
      const userId = getUserId();

      if (!userId) {
        alert('❌ Error: No se pudo obtener el ID del usuario');
        console.error('Usuario recibido:', user);
        return;
      }

      console.log('🔄 Iniciando actualización de usuario ID:', userId);
      console.log('📋 Datos del formulario completos:', formData);
      console.log('🔴 ESTADO EN FORMDATA:', formData.estado);
      console.log('🔴 TIPO DE ESTADO:', typeof formData.estado);
      console.log('🔵 DATOS PROFESIONALES EN FORMDATA:');
      console.log('  - id_profesion:', formData.id_profesion, '(tipo:', typeof formData.id_profesion, ')');
      console.log('  - colegiatura:', formData.colegiatura);
      console.log('  - id_especialidad:', formData.id_especialidad, '(tipo:', typeof formData.id_especialidad, ')');
      console.log('  - rne:', formData.rne);
      console.log('🟢 DATOS LABORALES EN FORMDATA:');
      console.log('  - id_regimen_laboral:', formData.id_regimen_laboral, '(tipo:', typeof formData.id_regimen_laboral, ')');
      console.log('  - codigo_planilla:', formData.codigo_planilla);
      console.log('  - id_area:', formData.id_area, '(tipo:', typeof formData.id_area, ')');
      console.log('  - periodo_ingreso:', formData.periodo_ingreso);

      // 🔥 MAPEAR TIPO DE DOCUMENTO A ID
      const idTipDoc = getTipoDocumentoId(formData.tipo_documento);
      console.log('🆔 Tipo de documento mapeado:', formData.tipo_documento, '→', idTipDoc);

      const dataToSend = {
        nombres: formData.nombres,
        apellidoPaterno: formData.apellido_paterno,
        apellidoMaterno: formData.apellido_materno,
        numeroDocumento: formData.numero_documento,
        idTipDoc: idTipDoc,  // ✅ ENVIAR ID EN LUGAR DE STRING
        genero: formData.genero,
        fechaNacimiento: formData.fecha_nacimiento,
        telefono: formData.telefono,
        correoPersonal: formData.correo_personal,
        correoInstitucional: formData.correo_institucional,
        direccion: formData.direccion,
        idProfesion: formData.id_profesion && formData.id_profesion !== '' ? parseInt(formData.id_profesion) : null,
        descProfOtro: formData.desc_prof_otro || null,
        colegiatura: formData.colegiatura || null,
        idEspecialidad: formData.id_especialidad && formData.id_especialidad !== '' ? parseInt(formData.id_especialidad) : null,
        rne: formData.rne || null,
        idRegimenLaboral: formData.id_regimen_laboral && formData.id_regimen_laboral !== '' ? parseInt(formData.id_regimen_laboral) : null,
        idTipPers: formData.id_tip_pers && formData.id_tip_pers !== '' ? parseInt(formData.id_tip_pers) : null, // 🆕 Tipo de profesional
        codigoPlanilla: formData.codigo_planilla || null,
        periodoIngreso: formData.periodo_ingreso || null,
        idIpress: formData.id_ipress && formData.id_ipress !== '' ? parseInt(formData.id_ipress) : null,
        idArea: formData.id_area && formData.id_area !== '' ? parseInt(formData.id_area) : null,
        estado: formData.estado || 'A'  // ✅ POR DEFECTO ACTIVO
      };

      console.log('📤 Datos personales a enviar:', dataToSend);
      const personalResponse = await api.put(`/usuarios/personal/${userId}`, dataToSend);
      console.log('✅ Respuesta actualización personal:', personalResponse);

      const usuarioData = {
        username: formData.username,
        roles: formData.roles,
        // 🌐 Enviar idRed solo si el usuario tiene rol COORDINADOR_RED
        idRed: formData.roles.includes('COORDINADOR_RED') ? formData.id_red : null
      };
      console.log('📤 Datos de usuario a enviar:', usuarioData);
      const usuarioResponse = await api.put(`/usuarios/id/${userId}`, usuarioData);
      console.log('✅ Respuesta actualización usuario:', usuarioResponse);

      // 🆕 v1.14.0 - Actualizar Firma Digital si existe en formData
      if (user?.id_personal && formData.id_regimen_laboral) {
        const regimenSeleccionado = regimenesLaborales.find(r =>
          r.idRegLab === parseInt(formData.id_regimen_laboral)
        );
        const descRegimen = regimenSeleccionado?.descRegLab?.toUpperCase() || '';
        const requiereFirmaDigital = descRegimen.includes('CAS') || descRegimen.includes('728');

        if (requiereFirmaDigital && formData.entrego_token) {
          try {
            const firmaDigitalPayload = {
              idPersonal: user.id_personal,
              entregoToken: formData.entrego_token === 'SI',
              numeroSerieToken: formData.numero_serie_token || null,
              fechaEntregaToken: formData.entrego_token === 'SI' && formData.fecha_entrega_token ? formatDateForBackend(formData.fecha_entrega_token) : (formData.entrego_token === 'SI' ? formatDateForBackend(new Date()) : null),
              fechaInicioCertificado: formatDateForBackend(formData.fecha_inicio_certificado),
              fechaVencimientoCertificado: formatDateForBackend(formData.fecha_vencimiento_certificado),
              motivoSinToken: formData.motivo_sin_token || null,
              observaciones: formData.observaciones_firma || null
            };
            console.log('🖋️ Actualizando firma digital:', firmaDigitalPayload);
            await api.post('/api/firma-digital', firmaDigitalPayload);
            console.log('✅ Firma digital actualizada exitosamente');
          } catch (error) {
            console.error('⚠️ Error al actualizar firma digital:', error);
            // No bloquear el flujo principal
          }
        }
      }

      // Si hay foto seleccionada, subirla
      if (fotoSeleccionada) {
        try {
          console.log('📸 Subiendo foto para usuario ID:', userId);
          await api.uploadFile(`/personal/foto/${userId}`, fotoSeleccionada);
          console.log('✅ Foto subida exitosamente');
        } catch (error) {
          console.error('⚠️ Error al subir la foto:', error);
          // No bloquear el flujo si falla la subida de foto
          alert(
            `✅ Usuario actualizado exitosamente\n\n` +
            `⚠️ Advertencia: No se pudo subir la foto. Puedes intentar subirla más tarde.\n\n` +
            `Error: ${error.message || 'Error desconocido'}`
          );
          if (onSuccess) {
            await onSuccess();
          }
          await new Promise(resolve => setTimeout(resolve, 500));
          onClose();
          return;
        }
      }

      // Guardar permisos si hay cambios
      if (permisosRef.current && permisosRef.current.hayCambios()) {
        console.log('🔐 Guardando permisos modulares...');
        const resultadoPermisos = await permisosRef.current.guardarPermisos();
        if (!resultadoPermisos.success) {
          console.error('⚠️ Error al guardar permisos:', resultadoPermisos.message);
          alert(
            `✅ Usuario actualizado exitosamente\n\n` +
            `⚠️ Advertencia: No se pudieron guardar algunos permisos.\n\n` +
            `Error: ${resultadoPermisos.message}`
          );
          if (onSuccess) {
            await onSuccess();
          }
          await new Promise(resolve => setTimeout(resolve, 500));
          onClose();
          return;
        }
        console.log('✅ Permisos guardados exitosamente');
      }

      // Verificar si se cambiaron los roles
      const rolesOriginales = user?.roles ? (Array.isArray(user.roles) ? user.roles : [user.roles]) : [];
      const rolesNuevos = formData.roles;
      const rolesOriginalesSet = new Set(rolesOriginales.map(r => String(r).toUpperCase()));
      const rolesNuevosSet = new Set(rolesNuevos.map(r => String(r).toUpperCase()));

      const cambiaron = rolesOriginalesSet.size !== rolesNuevosSet.size ||
                        [...rolesOriginalesSet].some(r => !rolesNuevosSet.has(r)) ||
                        [...rolesNuevosSet].some(r => !rolesOriginalesSet.has(r));

      console.log('🔄 Roles originales:', [...rolesOriginalesSet]);
      console.log('🔄 Roles nuevos:', [...rolesNuevosSet]);
      console.log('🔄 ¿Cambiaron los roles?:', cambiaron);

      // Si el usuario editado es el usuario actual, cerrar sesión para que recargue roles
      const editedUserId = getUserId();
      const currentUserId = currentUser?.id;

      console.log('🔍 Comparando IDs:', { editedUserId, currentUserId, tipoEditado: typeof editedUserId, tipoActual: typeof currentUserId });

      if (currentUserId && editedUserId && Number(currentUserId) === Number(editedUserId)) {
        alert('✅ Usuario actualizado exitosamente.\n\n🔄 Se cerrará la sesión para aplicar los cambios de rol.\nPor favor, vuelve a iniciar sesión.');
        onClose();
        // Limpiar sesión y redirigir al login
        clearToken();
        clearUser();
        window.location.href = '/login';
        return;
      }

      // Si se cambiaron los roles de OTRO usuario, marcar su sesión como invalidada
      if (cambiaron && editedUserId) {
        try {
          // Guardar en localStorage que este usuario necesita re-login
          const invalidSessions = JSON.parse(localStorage.getItem('invalidatedSessions') || '[]');
          if (!invalidSessions.includes(Number(editedUserId))) {
            invalidSessions.push(Number(editedUserId));
            localStorage.setItem('invalidatedSessions', JSON.stringify(invalidSessions));
            console.log('🔒 Sesión del usuario', editedUserId, 'marcada como invalidada');
          }
        } catch (e) {
          console.error('Error al marcar sesión como invalidada:', e);
        }
      }

      alert('✅ Usuario actualizado exitosamente' + (fotoSeleccionada ? ' con foto' : '') + (cambiaron ? '\n\n📌 Nota: El usuario deberá cerrar sesión y volver a ingresar para que los cambios de rol surtan efecto.' : ''));

      console.log('🔄 Llamando a onSuccess para recargar datos...');
      if (onSuccess) {
        await onSuccess();
      }

      onClose();
    } catch (error) {
      console.error('❌ Error al actualizar usuario:', error);
      console.error('❌ Detalles del error:', error.response?.data);
      alert(`❌ Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    try {
      setLoading(true);

      const userId = getUserId();

      if (!userId) {
        alert('❌ Error: No se pudo obtener el ID del usuario');
        console.error('Usuario recibido:', user);
        setLoading(false);
        return;
      }

      if (!correoSeleccionado) {
        alert('❌ Error: Por favor seleccione un correo electrónico');
        setLoading(false);
        return;
      }

      console.log('🔄 Enviando correo de reset para usuario ID:', userId, 'a correo:', correoSeleccionado);

      // Enviar email como query parameter
      const response = await api.put(`/usuarios/id/${userId}/reset-password?email=${encodeURIComponent(correoSeleccionado)}`);

      alert('✅ ' + (response.message || 'Se ha enviado un correo al usuario con el enlace para restablecer su contraseña'));
      setShowResetConfirm(false);
      setCorreoSeleccionado(null);

      if (onSuccess) onSuccess();

    } catch (error) {
      console.error('❌ Error al resetear contraseña:', error);

      const errorMsg = error.response?.data?.message ||
                      error.response?.data?.error ||
                      error.message ||
                      'Error desconocido';

      alert(`❌ Error al resetear la contraseña\n\n${errorMsg}\n\nVerifica la consola para más detalles.`);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 OBTENER LA PROFESIÓN SELECCIONADA
  const profesionSeleccionada = profesiones.find(p => 
    p.idProf === parseInt(formData.id_profesion)
  );
  const esMedicina = profesionSeleccionada?.descProf?.toUpperCase().includes('MEDICINA') || false;
  const esOtroProfesion = profesionSeleccionada?.descProf?.toUpperCase().includes('OTRO') || false;

  // 🔥 OBTENER EL RÉGIMEN LABORAL SELECCIONADO
  const regimenSeleccionado = regimenesLaborales.find(r => 
    r.idRegLab === parseInt(formData.id_regimen_laboral)
  );
  const requiereCodigoPlanilla = regimenSeleccionado?.descRegLab?.toUpperCase().includes('728') || 
                                  regimenSeleccionado?.descRegLab?.toUpperCase().includes('CAS') || 
                                  false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl my-4 overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="text-white">
                <h2 className="text-xl font-bold">Editar Usuario</h2>
                <p className="text-blue-100 text-sm">Usuario: @{user?.username}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 text-white rounded-xl transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4 overflow-x-auto">
            {/* Solo mostrar "Firma Digital" cuando firmaDigitalOnly={true} */}
            {!firmaDigitalOnly && (
              <button
                onClick={() => setSelectedTab('personal')}
                className={`px-4 py-2 font-medium text-sm rounded-t-xl transition-all whitespace-nowrap ${
                  selectedTab === 'personal'
                    ? 'bg-white text-blue-900'
                    : 'bg-blue-800/40 text-blue-100 hover:bg-blue-800/60'
                }`}
              >
                Datos Personales
              </button>
            )}
            {!firmaDigitalOnly && (
              <button
                onClick={() => setSelectedTab('profesional')}
                className={`px-4 py-2 font-medium text-sm rounded-t-xl transition-all whitespace-nowrap ${
                  selectedTab === 'profesional'
                    ? 'bg-white text-blue-900'
                    : 'bg-blue-800/40 text-blue-100 hover:bg-blue-800/60'
                }`}
              >
                Datos Profesionales
              </button>
            )}
            {!firmaDigitalOnly && (
              <button
                onClick={() => setSelectedTab('laboral')}
                className={`px-4 py-2 font-medium text-sm rounded-t-xl transition-all whitespace-nowrap ${
                  selectedTab === 'laboral'
                    ? 'bg-white text-blue-900'
                    : 'bg-blue-800/40 text-blue-100 hover:bg-blue-800/60'
                }`}
              >
                Datos Laborales
              </button>
            )}
            {/* 🆕 v1.14.0 - Tab Firma Digital */}
            <button
              onClick={() => setSelectedTab('firma')}
              className={`px-4 py-2 font-medium text-sm rounded-t-xl transition-all whitespace-nowrap ${
                selectedTab === 'firma'
                  ? 'bg-white text-blue-900'
                  : 'bg-blue-800/40 text-blue-100 hover:bg-blue-800/60'
              }`}
            >
              Firma Digital
            </button>
            {!firmaDigitalOnly && (
              <button
                onClick={() => setSelectedTab('roles')}
                className={`px-4 py-2 font-medium text-sm rounded-t-xl transition-all whitespace-nowrap ${
                  selectedTab === 'roles'
                    ? 'bg-white text-blue-900'
                    : 'bg-blue-800/40 text-blue-100 hover:bg-blue-800/60'
                }`}
              >
                Roles del Sistema
              </button>
            )}
            {!firmaDigitalOnly && (
              <button
                onClick={() => setSelectedTab('permisos')}
                className={`px-4 py-2 font-medium text-sm rounded-t-xl transition-all whitespace-nowrap ${
                  selectedTab === 'permisos'
                    ? 'bg-white text-blue-900'
                    : 'bg-blue-800/40 text-blue-100 hover:bg-blue-800/60'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  Permisos
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleNextOrSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto flex-1">

            {/* Pestaña Datos Personales */}
            {selectedTab === 'personal' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Información Personal</h3>
                </div>

                {/* Username y Resetear Contraseña */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre de Usuario <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.username ? 'border-red-500' : ''
                      }`}
                      placeholder="Ej: jgarcia"
                    />
                    {errors.username && (
                      <p className="text-red-500 text-xs mt-1">{errors.username}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contraseña
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowResetConfirm(true)}
                      className="w-full px-4 py-2.5 bg-blue-50 border-2 border-blue-300 text-blue-700 rounded-xl hover:bg-blue-100 transition-all flex items-center justify-center gap-2 font-medium"
                    >
                      <Mail className="w-4 h-4" />
                      Enviar correo de recuperación
                    </button>
                  </div>
                </div>

                {/* Resto de campos personales */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SelectField
                    label="Tipo de Documento"
                    name="tipo_documento"
                    value={formData.tipo_documento}
                    onChange={handleChange}
                    options={[
                      { value: 'DNI', label: 'DNI' },
                      { value: 'CE', label: 'Carnet de Extranjería' },
                      { value: 'PASAPORTE', label: 'Pasaporte' }
                    ]}
                    required
                  />

                  <FormField
                    label="Número de Documento"
                    name="numero_documento"
                    value={formData.numero_documento}
                    onChange={handleChange}
                    placeholder="12345678"
                    required
                    readOnly
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    label="Nombres"
                    name="nombres"
                    value={formData.nombres}
                    onChange={handleChange}
                    placeholder="Juan Carlos"
                    required
                    error={errors.nombres}
                  />

                  <FormField
                    label="Apellido Paterno"
                    name="apellido_paterno"
                    value={formData.apellido_paterno}
                    onChange={handleChange}
                    placeholder="García"
                    required
                    error={errors.apellido_paterno}
                  />

                  <FormField
                    label="Apellido Materno"
                    name="apellido_materno"
                    value={formData.apellido_materno}
                    onChange={handleChange}
                    placeholder="López"
                    required
                    error={errors.apellido_materno}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SelectField
                    label="Género"
                    name="genero"
                    value={formData.genero}
                    onChange={handleChange}
                    options={[
                      { value: 'M', label: 'Masculino' },
                      { value: 'F', label: 'Femenino' }
                    ]}
                    required
                  />

                  <FormField
                    label="Fecha de Nacimiento"
                    name="fecha_nacimiento"
                    type="date"
                    value={formData.fecha_nacimiento}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Correo Personal"
                    name="correo_personal"
                    type="email"
                    value={formData.correo_personal}
                    onChange={handleChange}
                    placeholder="ejemplo@mail.com"
                    required
                    error={errors.correo_personal}
                  />

                  <FormField
                    label="Correo Institucional"
                    name="correo_institucional"
                    type="email"
                    value={formData.correo_institucional}
                    onChange={handleChange}
                    placeholder="ejemplo@essalud.gob.pe"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Teléfono"
                    name="telefono"
                    type="tel"
                    value={formData.telefono}
                    onChange={handleChange}
                    placeholder="999888777"
                    required
                  />

                  <FormField
                    label="Dirección"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleChange}
                    placeholder="Av. Ejemplo 123, Lima"
                  />
                </div>

                {/* Campo de Foto */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Camera className="w-5 h-5 text-blue-600" />
                    Foto de Perfil
                  </h3>
                  <div className="space-y-4">
                    {/* Vista previa de la foto actual o nueva */}
                    {(fotoPreview || fotoActual) && (
                      <div className="relative inline-block">
                        <div className="w-32 h-32 rounded-xl overflow-hidden border-2 border-blue-300 shadow-md">
                          <img
                            src={fotoPreview || fotoActual}
                            alt="Foto de perfil"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Si falla cargar la foto, ocultar la imagen
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                        {fotoPreview && (
                          <button
                            type="button"
                            onClick={handleEliminarFoto}
                            className="absolute -top-2 -right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-all"
                            title="Cancelar nueva foto"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                        {fotoActual && !fotoPreview && (
                          <button
                            type="button"
                            onClick={handleEliminarFotoActual}
                            disabled={loading}
                            className="absolute -top-2 -right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-all disabled:opacity-50"
                            title="Eliminar foto actual"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                        {fotoSeleccionada && (
                          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-xs font-medium text-blue-900">
                              📷 Foto seleccionada: {fotoSeleccionada.name}
                            </p>
                            <p className="text-xs text-blue-700 mt-1">
                              Tamaño: <strong>{formatFileSize(fotoSeleccionada.size)}</strong> de {formatFileSize(MAX_FILE_SIZE)} máximo
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Input de archivo */}
                    <div>
                      <label
                        htmlFor="foto"
                        className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                          fotoPreview || fotoActual
                            ? 'border-blue-300 bg-blue-50'
                            : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
                        }`}
                      >
                        <input
                          ref={fileInputRef}
                          id="foto"
                          type="file"
                          accept="image/*"
                          onChange={handleFotoChange}
                          className="hidden"
                        />
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          {fotoPreview || fotoActual ? (
                            <>
                              <ImageIcon className="w-8 h-8 text-blue-600 mb-2" />
                              <p className="text-sm font-medium text-blue-700">
                                {fotoPreview ? 'Cambiar foto' : 'Subir nueva foto'}
                              </p>
                            </>
                          ) : (
                            <>
                              <Camera className="w-8 h-8 text-gray-400 mb-2" />
                              <p className="mb-2 text-sm text-gray-500">
                                <span className="font-semibold">Haz clic para subir</span> o arrastra y suelta
                              </p>
                              <p className="text-xs text-gray-600 font-medium">
                                PNG, JPG o GIF
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                📏 Tamaño máximo: <strong className="text-emerald-600">5 MB</strong>
                              </p>
                            </>
                          )}
                        </div>
                      </label>
                      <p className="text-xs text-gray-500 mt-2">
                        {fotoActual 
                          ? 'La foto actual se reemplazará al guardar los cambios'
                          : 'La foto es opcional y se puede agregar más tarde'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Pestaña Datos Profesionales - CON LÓGICA CONDICIONAL */}
            {selectedTab === 'profesional' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Información Profesional</h3>
                </div>

                {loadingCatalogos ? (
                  <div className="text-center py-8">
                    <div className="inline-block w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <p className="text-sm text-gray-500">Cargando catálogos...</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Campo Profesión - SIEMPRE VISIBLE */}
                      <SelectField
                        label="Profesión"
                        name="id_profesion"
                        value={formData.id_profesion}
                        onChange={(e) => {
                          const newProfId = e.target.value && e.target.value !== '' ? parseInt(e.target.value) : null;
                          const profesionSeleccionada = profesiones.find(p => 
                            p.idProf === newProfId
                          );
                          const esOtro = profesionSeleccionada?.descProf?.toUpperCase().includes('OTRO');
                          const esMed = profesionSeleccionada?.descProf?.toUpperCase().includes('MEDICINA');
                          
                          setFormData(prev => ({ 
                            ...prev, 
                            id_profesion: newProfId,
                            desc_prof_otro: esOtro ? prev.desc_prof_otro : '',
                            colegiatura: esMed ? prev.colegiatura : '',
                            tiene_especialidad_medica: esMed ? prev.tiene_especialidad_medica : '',
                            id_especialidad: esMed ? prev.id_especialidad : null,
                            rne: esMed ? prev.rne : ''
                          }));
                        }}
                        options={[
                          ...profesiones.map(prof => ({
                            value: prof.idProf,
                            label: prof.descProf
                          }))
                        ]}
                        error={errors.id_profesion}
                      />

                      {/* Campo ESPECIFICAR - Solo si seleccionó OTRO */}
                      {esOtroProfesion && (
                        <FormField
                          label="Especificar Profesión"
                          name="desc_prof_otro"
                          value={formData.desc_prof_otro}
                          onChange={handleChange}
                          placeholder="Ej: Arquitecto, Contador, etc."
                          required
                          error={errors.desc_prof_otro}
                        />
                      )}

                      {/* Campo Colegiatura - Obligatorio si es MEDICINA */}
                      {esMedicina ? (
                        <div>
                          <label htmlFor="colegiatura" className="block text-sm font-medium text-gray-700 mb-2">
                            Colegiatura <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="colegiatura"
                            name="colegiatura"
                            type="text"
                            required
                            value={formData.colegiatura}
                            onChange={handleChange}
                            placeholder="Ej: CMP 12345"
                            className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              errors.colegiatura ? 'border-red-500' : ''
                            }`}
                          />
                          {errors.colegiatura && (
                            <p className="text-red-500 text-xs mt-1">{errors.colegiatura}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            ⚠️ Campo obligatorio para profesionales de medicina
                          </p>
                        </div>
                      ) : (
                        <FormField
                          label="Número de Colegiatura"
                          name="colegiatura"
                          value={formData.colegiatura}
                          onChange={handleChange}
                          placeholder="CMP 12345, CEP 56789, etc."
                        />
                      )}

                      {/* Campo ¿Tiene Especialidad Médica? - Solo visible cuando se selecciona MEDICINA */}
                      {esMedicina && (
                        <div>
                          <label htmlFor="tiene_especialidad_medica" className="block text-sm font-medium text-gray-700 mb-2">
                            ¿El Profesional cuenta con especialidad médica?
                          </label>
                          <select
                            id="tiene_especialidad_medica"
                            name="tiene_especialidad_medica"
                            value={formData.tiene_especialidad_medica}
                            onChange={(e) => {
                              const valor = e.target.value;
                              setFormData(prev => ({
                                ...prev,
                                tiene_especialidad_medica: valor,
                                id_especialidad: valor === 'SI' ? prev.id_especialidad : null,
                                rne: valor === 'SI' ? prev.rne : ''
                              }));
                            }}
                            className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Seleccione una opción...</option>
                            <option value="SI">Sí</option>
                            <option value="NO">No</option>
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Campos MÉDICOS - Solo si es MEDICINA Y tiene_especialidad_medica = 'SI' */}
                    {esMedicina && formData.tiene_especialidad_medica === 'SI' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <label htmlFor="id_especialidad" className="block text-sm font-medium text-gray-700 mb-2">
                            Especialidad <span className="text-red-500">*</span>
                          </label>
                          <select
                            id="id_especialidad"
                            name="id_especialidad"
                            required
                            value={formData.id_especialidad || ''}
                            onChange={handleChange}
                            className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              errors.id_especialidad ? 'border-red-500' : ''
                            }`}
                          >
                            <option value="">Seleccione una especialidad...</option>
                            {especialidades.map(esp => (
                              <option key={esp.idServicio || esp.idEsp} value={esp.idServicio || esp.idEsp}>
                                {esp.descServicio || esp.descripcion}
                              </option>
                            ))}
                          </select>
                          {errors.id_especialidad && (
                            <p className="text-red-500 text-xs mt-1">{errors.id_especialidad}</p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="rne" className="block text-sm font-medium text-gray-700 mb-2">
                            RNE <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="rne"
                            name="rne"
                            type="text"
                            required
                            value={formData.rne}
                            onChange={handleChange}
                            placeholder="Registro Nacional de Especialidad"
                            className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              errors.rne ? 'border-red-500' : ''
                            }`}
                          />
                          {errors.rne && (
                            <p className="text-red-500 text-xs mt-1">{errors.rne}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Pestaña Datos Laborales */}
            {selectedTab === 'laboral' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Información Laboral</h3>
                </div>

                {loadingCatalogos ? (
                  <div className="text-center py-8">
                    <div className="inline-block w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <p className="text-sm text-gray-500">Cargando catálogos...</p>
                  </div>
                ) : (
                  <>
                    {/* Selector de Tipo de Personal e IPRESS */}
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl mb-4">
                      <h4 className="text-sm font-semibold text-blue-900 mb-3 uppercase tracking-wide flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        Asignación de IPRESS
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Selector de Tipo de Personal */}
                        <div>
                          <label htmlFor="tipo_personal_laboral" className="block text-sm font-medium text-gray-700 mb-2">
                            Tipo de Personal <span className="text-red-500">*</span>
                          </label>
                          <select
                            id="tipo_personal_laboral"
                            value={(() => {
                              // Determinar si es INTERNO basándose en la IPRESS
                              const ipressActual = ipress.find(ip => ip.idIpress === parseInt(formData.id_ipress));
                              const esCenate = ipressActual?.descIpress?.toUpperCase().includes('CENATE') ||
                                             ipressActual?.codIpress === '739' ||
                                             parseInt(formData.id_ipress) === 2;
                              return esCenate ? 'INTERNO' : 'EXTERNO';
                            })()}
                            onChange={(e) => {
                              const tipo = e.target.value;
                              if (tipo === 'INTERNO') {
                                // Buscar la IPRESS de CENATE
                                const cenateIpress = ipress.find(ip =>
                                  ip.codIpress === '739' ||
                                  ip.descIpress?.toUpperCase().includes('CENATE') ||
                                  ip.descIpress?.toUpperCase().includes('NACIONAL DE TELEMEDICINA')
                                );
                                if (cenateIpress) {
                                  setFormData(prev => ({ ...prev, id_ipress: cenateIpress.idIpress, id_red: null }));
                                  setRedSeleccionada(null);
                                  setMacroregionInfo(null);
                                } else {
                                  alert('No se encontró la IPRESS de CENATE en el sistema');
                                }
                              } else {
                                // Si cambia a EXTERNO, cargar Redes y limpiar selecciones
                                cargarRedes();
                                cargarTodasIpress();
                                setFormData(prev => ({ ...prev, id_ipress: null, id_red: null }));
                                setRedSeleccionada(null);
                                setMacroregionInfo(null);
                              }
                            }}
                            className="w-full px-4 py-2.5 border-2 border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white font-medium text-sm"
                          >
                            <option value="INTERNO">INTERNO - Centro Nacional de Telemedicina</option>
                            <option value="EXTERNO">EXTERNO - Otra IPRESS</option>
                          </select>
                          <p className="text-xs text-blue-600 mt-1">
                            <strong>INTERNO:</strong> Trabaja en CENATE | <strong>EXTERNO:</strong> Trabaja en otra institución
                          </p>
                        </div>

                        {/* IPRESS para INTERNO */}
                        {(() => {
                          const ipressActual = ipress.find(ip => ip.idIpress === parseInt(formData.id_ipress));
                          const esCenate = ipressActual?.descIpress?.toUpperCase().includes('CENATE') ||
                                         ipressActual?.codIpress === '739' ||
                                         parseInt(formData.id_ipress) === 2;
                          return esCenate;
                        })() && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              IPRESS <span className="text-red-500">*</span>
                            </label>
                            <div className="w-full px-4 py-3 border-2 border-emerald-300 bg-emerald-50 rounded-xl">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0">
                                  <Building2 className="w-4 h-4 text-white" />
                                </div>
                                <div className="flex-1">
                                  <p className="font-bold text-emerald-900 text-xs">
                                    {ipress.find(ip => ip.idIpress === parseInt(formData.id_ipress))?.codIpress || '739'} -
                                    {ipress.find(ip => ip.idIpress === parseInt(formData.id_ipress))?.descIpress || 'Centro Nacional de Telemedicina'}
                                  </p>
                                  <p className="text-xs text-emerald-700">Asignación automática para personal INTERNO</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Sección EXTERNO: Red → IPRESS → Macroregión */}
                      {(() => {
                        const ipressActual = ipress.find(ip => ip.idIpress === parseInt(formData.id_ipress));
                        const esCenate = ipressActual?.descIpress?.toUpperCase().includes('CENATE') ||
                                       ipressActual?.codIpress === '739' ||
                                       parseInt(formData.id_ipress) === 2;
                        return !esCenate;
                      })() && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          {/* Selector de Red */}
                          <div>
                            <label htmlFor="id_red" className="block text-sm font-medium text-gray-700 mb-2">
                              Red Asistencial <span className="text-red-500">*</span>
                            </label>
                            {loadingRedes ? (
                              <div className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl bg-gray-50 flex items-center justify-center">
                                <div className="inline-block w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                                <span className="text-sm text-gray-500">Cargando Redes...</span>
                              </div>
                            ) : (
                              <select
                                id="id_red"
                                name="id_red"
                                value={formData.id_red || ''}
                                onChange={(e) => {
                                  const redId = e.target.value ? parseInt(e.target.value) : null;
                                  setFormData(prev => ({ ...prev, id_red: redId, id_ipress: null }));
                                  const redSel = redes.find(r => (r.id || r.idRed) === redId);
                                  setRedSeleccionada(redSel);
                                  setMacroregionInfo(null);
                                }}
                                className={`w-full px-4 py-2 border-2 rounded-xl transition-all focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                                  errors.id_red ? 'border-red-500' : 'border-gray-300'
                                }`}
                              >
                                <option value="">Seleccione una Red...</option>
                                {redes.map(red => (
                                  <option key={red.id || red.idRed} value={red.id || red.idRed}>
                                    {red.codigo || red.codRed || ''} - {red.descripcion || red.descRed || 'Sin descripción'}
                                  </option>
                                ))}
                              </select>
                            )}
                            {errors.id_red && (
                              <p className="text-red-500 text-sm mt-1">{errors.id_red}</p>
                            )}
                          </div>

                          {/* Selector de IPRESS (filtrado por Red) */}
                          <div>
                            <label htmlFor="id_ipress" className="block text-sm font-medium text-gray-700 mb-2">
                              IPRESS de Procedencia <span className="text-red-500">*</span>
                            </label>
                            {loadingIpress ? (
                              <div className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl bg-gray-50 flex items-center justify-center">
                                <div className="inline-block w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                                <span className="text-sm text-gray-500">Cargando IPRESS...</span>
                              </div>
                            ) : (
                              <select
                                id="id_ipress"
                                name="id_ipress"
                                required
                                disabled={!formData.id_red}
                                value={formData.id_ipress || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, id_ipress: e.target.value ? parseInt(e.target.value) : null }))}
                                className={`w-full px-4 py-2 border-2 rounded-xl transition-all focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                                  errors.id_ipress ? 'border-red-500' : 'border-gray-300'
                                } ${!formData.id_red ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                              >
                                <option value="">
                                  {!formData.id_red ? 'Primero seleccione una Red...' : 'Seleccione una IPRESS...'}
                                </option>
                                {ipress.map(ip => (
                                  <option key={ip.idIpress} value={ip.idIpress}>
                                    {ip.codIpress || ''} - {ip.descIpress || 'Sin descripción'}
                                  </option>
                                ))}
                              </select>
                            )}
                            {errors.id_ipress && (
                              <p className="text-red-500 text-sm mt-1">{errors.id_ipress}</p>
                            )}
                            {formData.id_red && ipress.length === 0 && !loadingIpress && (
                              <p className="text-amber-600 text-sm mt-1">No hay IPRESS disponibles para esta Red</p>
                            )}
                          </div>

                          {/* Macroregión (solo lectura) */}
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Macroregión
                            </label>
                            <div className={`w-full px-4 py-3 border-2 rounded-xl ${
                              macroregionInfo ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50'
                            }`}>
                              {macroregionInfo ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-semibold text-blue-900 text-sm">
                                      {macroregionInfo.descMacro || 'Sin nombre'}
                                    </p>
                                    <p className="text-xs text-blue-600">Asignada automáticamente según IPRESS</p>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-gray-400 text-sm italic">
                                  Se mostrará automáticamente al seleccionar una IPRESS
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Resto de campos laborales */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* 🆕 NUEVO: Tipo de Profesional */}
                      <SelectField
                        label="Tipo de Profesional"
                        name="id_tip_pers"
                        value={formData.id_tip_pers}
                        onChange={handleChange}
                        options={[
                          ...tiposProfesional.map(tipo => ({
                            value: tipo.idTipPers || tipo.id_tip_pers,
                            label: tipo.descTipPers || tipo.desc_tip_pers
                          }))
                        ]}
                        error={errors.id_tip_pers}
                      />
                      
                      <SelectField
                        label="Régimen Laboral"
                        name="id_regimen_laboral"
                        value={formData.id_regimen_laboral}
                        onChange={(e) => {
                          handleChange(e);
                          // Limpiar código de planilla si cambia a un régimen que no lo requiere
                          const newRegimenId = e.target.value ? parseInt(e.target.value) : null;
                          const nuevoRegimen = regimenesLaborales.find(r => r.idRegLab === newRegimenId);
                          const requiere = nuevoRegimen?.descRegLab?.toUpperCase().includes('728') || 
                                          nuevoRegimen?.descRegLab?.toUpperCase().includes('CAS');
                          if (!requiere) {
                            setFormData(prev => ({ ...prev, codigo_planilla: '' }));
                          }
                        }}
                        options={[
                          ...regimenesLaborales.map(reg => ({
                            value: reg.idRegLab,
                            label: reg.descRegLab
                          }))
                        ]}
                        error={errors.id_regimen_laboral}
                      />

                      {/* Campo Código de Planilla - Solo visible y obligatorio para 728 y CAS */}
                      {requiereCodigoPlanilla && (
                        <div>
                          <label htmlFor="codigo_planilla" className="block text-sm font-medium text-gray-700 mb-2">
                            Código de Planilla <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="codigo_planilla"
                            name="codigo_planilla"
                            type="text"
                            required
                            value={formData.codigo_planilla}
                            onChange={handleChange}
                            placeholder="PLN-2024-001"
                            className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              errors.codigo_planilla ? 'border-red-500' : ''
                            }`}
                          />
                          {errors.codigo_planilla && (
                            <p className="text-red-500 text-xs mt-1">{errors.codigo_planilla}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            ⚠️ Campo obligatorio para régimen {regimenSeleccionado?.descRegLab}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <SelectField
                        label="Área de Trabajo"
                        name="id_area"
                        value={formData.id_area}
                        onChange={handleChange}
                        options={[
                          ...areas.map(area => ({
                            value: area.idArea,
                            label: area.descArea
                          }))
                        ]}
                        error={errors.id_area}
                      />

                       <MonthYearPicker
                         label="Periodo de Ingreso"
                         value={formData.periodo_ingreso}
                         onChange={(value) => setFormData({ ...formData, periodo_ingreso: value })}
                       />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <SelectField
                        label="Estado Laboral"
                        name="estado"
                        value={formData.estado}
                        onChange={handleChange}
                        options={[
                          { value: 'A', label: 'Activo' },
                          { value: 'I', label: 'Inactivo' }
                        ]}
                        required
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {/* 🆕 v1.14.0 - PESTAÑA FIRMA DIGITAL */}
            {selectedTab === 'firma' && (
              <div className="space-y-6">
                {/* Detección de firma PENDIENTE y botón de actualización */}
                {firmaDigitalData && firmaDigitalData.esPendiente && (
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-amber-100 rounded-lg">
                          <Send className="w-5 h-5 text-amber-700" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-amber-900 mb-1">
                            Entrega de Token Pendiente
                          </h4>
                          <p className="text-sm text-amber-700">
                            Este usuario tiene una entrega de token pendiente. Puede registrar la entrega cuando el personal entregue el token físicamente.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setMostrarModalActualizarEntrega(true)}
                        className="px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors shadow-md hover:shadow-lg flex items-center gap-2 whitespace-nowrap"
                      >
                        <Send className="w-4 h-4" />
                        Registrar Entrega
                      </button>
                    </div>
                  </div>
                )}

                {/* Componente FirmaDigitalTab */}
                {loadingFirmaDigital ? (
                  <div className="text-center py-12">
                    <div className="inline-block w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-3"></div>
                    <p className="text-gray-600">Cargando datos de firma digital...</p>
                  </div>
                ) : (
                  <FirmaDigitalTab
                    formData={formData}
                    setFormData={setFormData}
                    errors={errors}
                    handleChange={handleChange}
                    regimenLaboral={regimenesLaborales.find(r => r.idRegLab === parseInt(formData.id_regimen_laboral))?.descRegLab || ''}
                  />
                )}
              </div>
            )}

            {/* Pestaña Roles */}
            {selectedTab === 'roles' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  Roles del Sistema <span className="text-red-500">*</span>
                </h3>

                <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-xl mb-4 flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    !
                  </div>
                  <div>
                    <p className="font-semibold text-amber-900 text-sm">Debe seleccionar al menos un rol</p>
                    <p className="text-xs text-amber-700 mt-1">Los roles determinan los permisos y accesos del usuario</p>
                  </div>
                </div>

                {loadingRoles ? (
                  <div className="text-center py-8">
                    <div className="inline-block w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <p className="text-sm text-gray-500">Cargando roles...</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      {roles.map(role => {
                        const isSelected = formData.roles.includes(role.nombreRol);
                        const isPrivileged = ['ADMIN', 'SUPERADMIN'].includes(role.nombreRol);

                        return (
                          <label
                            key={role.idRol}
                            className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                              isSelected
                                ? 'border-blue-500 bg-blue-50 shadow-sm'
                                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleRoleToggle(role.nombreRol)}
                              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm text-gray-900">
                                  {role.nombreRol}
                                </span>
                                {isPrivileged && (
                                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-100 text-amber-700">
                                    🔑
                                  </span>
                                )}
                              </div>
                              {role.areaTrabajo && (
                                <span className="text-xs text-gray-500">{role.areaTrabajo}</span>
                              )}
                            </div>
                          </label>
                        );
                      })}
                    </div>

                    {formData.roles.length > 0 && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                        <p className="text-sm font-semibold text-green-700 mb-2">
                          Roles seleccionados ({formData.roles.length}):
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {formData.roles.map(rol => (
                            <span key={rol} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                              {rol}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 🌐 Indicador de Red asignada para COORDINADOR_RED */}
                    {formData.roles.includes('COORDINADOR_RED') && (
                      <div className={`mt-4 p-4 rounded-xl border-2 ${
                        formData.id_red
                          ? 'bg-purple-50 border-purple-300'
                          : 'bg-red-50 border-red-300'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Building2 className={`w-6 h-6 ${formData.id_red ? 'text-purple-600' : 'text-red-500'}`} />
                            <div>
                              {formData.id_red && redSeleccionada ? (
                                <>
                                  <p className="font-bold text-purple-800">
                                    {redSeleccionada.descripcion || redSeleccionada.descRed}
                                  </p>
                                  <p className="text-sm text-purple-600">
                                    Código: {redSeleccionada.codigo || redSeleccionada.codRed}
                                    {macroregionInfo && ` • ${macroregionInfo.descMacro || macroregionInfo.descripcion}`}
                                  </p>
                                </>
                              ) : (
                                <p className="font-medium text-red-600">
                                  Debe asignar una Red al Coordinador
                                </p>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              cargarRedes();
                              setShowRedModal(true);
                            }}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${
                              formData.id_red
                                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                                : 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                            }`}
                          >
                            {formData.id_red ? 'Cambiar Red' : 'Seleccionar Red'}
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Pestaña Permisos */}
            {selectedTab === 'permisos' && (
              <div>
                <PermisosUsuarioPanel
                  ref={permisosRef}
                  userId={getUserId()}
                  userRoles={formData.roles}
                  readOnly={false}
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              <span className="text-red-500">*</span> Campos obligatorios
            </div>
            <div className="flex gap-3">
              {/* Ocultar botón "Anterior" cuando firmaDigitalOnly={true} */}
              {!firmaDigitalOnly && selectedTab !== 'personal' && (
                <button
                  type="button"
                  onClick={() => {
                    const tabs = ['personal', 'profesional', 'laboral', 'roles', 'permisos'];
                    const currentIndex = tabs.indexOf(selectedTab);
                    if (currentIndex > 0) {
                      setSelectedTab(tabs[currentIndex - 1]);
                    }
                  }}
                  disabled={loading}
                  className="px-6 py-2.5 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 rounded-xl transition-all font-medium disabled:opacity-50"
                >
                  ← Anterior
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-6 py-2.5 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 rounded-xl transition-all font-medium disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 text-white rounded-xl transition-all font-medium shadow-lg disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Guardando...
                  </>
                ) : firmaDigitalOnly || selectedTab === 'permisos' ? (
                  <>
                    <Check className="w-4 h-4" />
                    Guardar Cambios
                  </>
                ) : (
                  'Siguiente →'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Modal de confirmación resetear contraseña */}
      {/* 🌐 Modal para seleccionar Red - COORDINADOR_RED */}
      {showRedModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header del modal */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <Building2 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Asignar Red al Coordinador</h3>
                  <p className="text-purple-200 text-sm">Seleccione la red que podrá gestionar</p>
                </div>
              </div>
            </div>

            {/* Contenido del modal */}
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                El usuario con rol <span className="font-bold text-purple-700">COORDINADOR_RED</span> solo podrá ver información de las IPRESS y personal de la red seleccionada.
              </p>

              {loadingRedes ? (
                <div className="flex items-center justify-center gap-3 py-8 text-purple-600">
                  <div className="w-6 h-6 border-3 border-purple-600 border-t-transparent rounded-full animate-spin" />
                  <span className="font-medium">Cargando redes disponibles...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-gray-700">
                    Red Asignada <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.id_red || ''}
                    onChange={(e) => {
                      const redId = e.target.value ? parseInt(e.target.value) : null;
                      setFormData(prev => ({ ...prev, id_red: redId }));

                      if (redId && redes.length > 0) {
                        const redSel = redes.find(r => (r.id || r.idRed) === redId);
                        if (redSel) {
                          setRedSeleccionada(redSel);
                          setMacroregionInfo(redSel.macroregion || null);
                        }
                      } else {
                        setRedSeleccionada(null);
                        setMacroregionInfo(null);
                      }
                    }}
                    className="w-full px-4 py-3 border-2 border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white font-medium text-lg"
                  >
                    <option value="">-- Seleccione una Red --</option>
                    {redes.map(red => (
                      <option key={red.id || red.idRed} value={red.id || red.idRed}>
                        {red.codigo || red.codRed} - {red.descripcion || red.descRed}
                      </option>
                    ))}
                  </select>

                  {/* Información de la Red seleccionada */}
                  {formData.id_red && redSeleccionada && (
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <span className="text-xs text-gray-500 uppercase">Red</span>
                          <p className="font-bold text-purple-800">
                            {redSeleccionada.descripcion || redSeleccionada.descRed}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500 uppercase">Código</span>
                          <p className="font-bold text-purple-800">
                            {redSeleccionada.codigo || redSeleccionada.codRed}
                          </p>
                        </div>
                        {macroregionInfo && (
                          <div className="col-span-2">
                            <span className="text-xs text-gray-500 uppercase">Macroregión</span>
                            <p className="font-bold text-indigo-700">
                              {macroregionInfo.descMacro || macroregionInfo.descripcion}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer del modal */}
            <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  // Si cancela y no había Red antes, quitar el rol
                  if (!formData.id_red) {
                    setFormData(prev => ({
                      ...prev,
                      roles: prev.roles.filter(r => r !== 'COORDINADOR_RED')
                    }));
                  }
                  setShowRedModal(false);
                }}
                className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!formData.id_red) {
                    alert('Debe seleccionar una Red para continuar');
                    return;
                  }
                  setShowRedModal(false);
                }}
                disabled={!formData.id_red}
                className={`px-5 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 ${
                  formData.id_red
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Check className="w-5 h-5" />
                Confirmar Red
              </button>
            </div>
          </div>
        </div>
      )}

      {showResetConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Recuperación de Contraseña</h3>
                <p className="text-sm text-gray-600">¿A qué correo desea enviar el enlace?</p>
              </div>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-4">
              <p className="text-sm text-blue-900 font-medium mb-2">
                Se enviará un correo electrónico al usuario con:
              </p>
              <ul className="text-sm text-blue-800 space-y-1 ml-4 list-disc">
                <li>Un enlace seguro para crear su nueva contraseña</li>
                <li>El enlace expirará en 24 horas</li>
              </ul>
            </div>

            {/* Selector de correo */}
            <div className="mb-4">
              <p className="text-sm font-semibold text-slate-800 mb-3">
                Seleccione el correo de destino: <span className="text-red-500">*</span>
              </p>
              <div className="space-y-2">
                {formData.correo_personal && (
                  <label className="flex items-center p-3 bg-white border-2 border-slate-200 rounded-lg hover:border-blue-500 cursor-pointer transition-all">
                    <input
                      type="radio"
                      name="correo_recuperacion"
                      value={formData.correo_personal}
                      checked={correoSeleccionado === formData.correo_personal}
                      onChange={(e) => setCorreoSeleccionado(e.target.value)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="ml-3">
                      <span className="font-medium text-slate-800">Correo Personal</span>
                      <span className="ml-2 text-sm text-slate-600">({formData.correo_personal})</span>
                    </div>
                  </label>
                )}

                {formData.correo_institucional && (
                  <label className="flex items-center p-3 bg-white border-2 border-slate-200 rounded-lg hover:border-blue-500 cursor-pointer transition-all">
                    <input
                      type="radio"
                      name="correo_recuperacion"
                      value={formData.correo_institucional}
                      checked={correoSeleccionado === formData.correo_institucional}
                      onChange={(e) => setCorreoSeleccionado(e.target.value)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="ml-3">
                      <span className="font-medium text-slate-800">Correo Institucional</span>
                      <span className="ml-2 text-sm text-slate-600">({formData.correo_institucional})</span>
                    </div>
                  </label>
                )}

                {!formData.correo_personal && !formData.correo_institucional && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-800">
                      ⚠️ Este usuario no tiene ningún correo electrónico registrado.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowResetConfirm(false);
                  setCorreoSeleccionado(null);
                }}
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleResetPassword}
                disabled={loading || !correoSeleccionado}
                className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Enviar Correo
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🆕 v1.14.0 - Modal para Actualizar Entrega de Token PENDIENTE */}
      {mostrarModalActualizarEntrega && firmaDigitalData && (
        <ActualizarEntregaTokenModal
          firmaDigital={firmaDigitalData}
          onClose={() => setMostrarModalActualizarEntrega(false)}
          onSuccess={() => {
            setMostrarModalActualizarEntrega(false);
            cargarFirmaDigital(); // Recargar datos actualizados
            alert('✅ Entrega de token registrada exitosamente');
          }}
        />
      )}
    </div>
  );
};

export default ActualizarModel;
