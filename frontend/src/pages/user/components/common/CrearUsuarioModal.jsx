// Modal de Creación de Usuario con Datos Profesionales
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { X, UserPlus, Shield, Check, User, Mail, Calendar, Briefcase, GraduationCap, Camera, Image as ImageIcon, XCircle } from 'lucide-react';
import FormField from '../modals/FormField';
import SelectField from '../modals/SelectField';
import api from '../../../../lib/apiClient';
import MonthYearPicker from '../../../../components/common/MonthYearPicker';
import { API_ROUTES } from '../../../../constants/apiRoutes';
import FirmaDigitalTab from './FirmaDigitalTab'; // 🆕 v1.14.0

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

const CrearUsuarioModal = ({ onClose, onSuccess, ipressList, personalData = null }) => {
  const [selectedTab, setSelectedTab] = useState('personal');
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [currentUserRoles, setCurrentUserRoles] = useState([]);
  const [ipress, setIpress] = useState([]);
  const [ipressAll, setIpressAll] = useState([]); // Todas las IPRESS sin filtrar
  const [loadingIpress, setLoadingIpress] = useState(false);
  const [cenateIpress, setCenateIpress] = useState(null);
  const [usuarioExistenteModal, setUsuarioExistenteModal] = useState({ open: false, username: '', mensaje: '' });

  // Estados para Red y Macroregión (externos)
  const [redes, setRedes] = useState([]);
  const [loadingRedes, setLoadingRedes] = useState(false);
  const [redSeleccionada, setRedSeleccionada] = useState(null);
  const [macroregionInfo, setMacroregionInfo] = useState(null);
  
  // Estado para foto
  const [fotoSeleccionada, setFotoSeleccionada] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const fileInputRef = useRef(null);
  
  // Estados para catálogos profesionales
  const [profesiones, setProfesiones] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [regimenesLaborales, setRegimenesLaborales] = useState([]);
  const [areas, setAreas] = useState([]);
  const [tiposProfesional, setTiposProfesional] = useState([]); // 🆕 Tipos de profesional desde dim_tipo_personal
  const [loadingCatalogos, setLoadingCatalogos] = useState(false);
  
  const [formData, setFormData] = useState({
    // Datos Personales
    tipo_documento: 'DNI',
    numero_documento: '',
    nombres: '',
    fecha_nacimiento: '',
    genero: '',
    correo_institucional: '',
    apellido_paterno: '',
    apellido_materno: '',
    correo_personal: '',
    telefono: '',
    tipo_personal: '1', // Por defecto INTERNO - CENATE ('1' = Interno, '2' = Externo)
    id_red: null, // Red seleccionada (para externos)
    id_ipress: null,
    
    // Datos Profesionales (NUEVOS)
    id_profesion: null,
    desc_prof_otro: '', // Campo para especificar cuando selecciona OTRO
    colegiatura: '',
    tiene_especialidad_medica: '', // Nuevo campo: 'SI' o 'NO'
    id_especialidad: null,
    rne: '',
    
    // Datos Laborales (NUEVOS)
    id_regimen_laboral: null,
    id_tip_pers: null, // 🆕 Tipo de profesional (dim_tipo_personal)
    codigo_planilla: '',
    periodo_ingreso: '',
    id_area: null,

    // 🆕 v1.14.0 - Firma Digital
    entrego_token: null, // 'SI' o 'NO'
    numero_serie_token: '',
    fecha_entrega_token: '',
    fecha_inicio_certificado: '',
    fecha_vencimiento_certificado: '',
    motivo_sin_token: null, // 'YA_TIENE', 'NO_REQUIERE', 'PENDIENTE'
    observaciones_firma: '',

    // Roles
    roles: []
  });
  
  const [errors, setErrors] = useState({});

  // Cargar roles y catálogos al montar
  useEffect(() => {
    cargarRoles();
    cargarCatalogos();
  }, []);

  // Monitorear cuando las áreas se carguen
  useEffect(() => {
    console.log('🔍 Estado de areas actualizado:', areas);
    console.log('🔍 Número de áreas:', areas.length);
  }, [areas]);

  // 🆕 Pre-cargar datos cuando se crea usuario desde personal sin cuenta
  useEffect(() => {
    if (personalData && personalData.id_user === null) {
      console.log('👨 Pre-cargando datos de personal:', personalData);
      setFormData(prev => ({
        ...prev,
        tipo_documento: personalData.tipo_documento || 'DNI',
        numero_documento: personalData.numero_documento || '',
        nombres: personalData.nombres || '',
        apellido_paterno: personalData.apellido_paterno || '',
        apellido_materno: personalData.apellido_materno || '',
        fecha_nacimiento: personalData.fecha_nacimiento || '',
        genero: personalData.genero || '',
        correo_personal: personalData.correo_personal || '',
        telefono: personalData.telefono || '',
        correo_institucional: personalData.correo_corporativo || '',
        tipo_personal: personalData.id_origen?.toString() || personalData.tipo_personal || '1', // '1' = Interno, '2' = Externo
        id_ipress: personalData.id_ipress || null
      }));
    }
  }, [personalData]);

  // Cargar IPRESS y Redes cuando se selecciona tipo_personal
  useEffect(() => {
    // tipo_personal ahora es "1" (Interno) o "2" (Externo)
    if (formData.tipo_personal === '2') {  // Externo
      cargarRedes();
      cargarTodasIpress();
      // Limpiar selecciones previas
      setRedSeleccionada(null);
      setMacroregionInfo(null);
      setFormData(prev => ({ ...prev, id_red: null, id_ipress: null }));
    } else if (formData.tipo_personal === '1') {  // Interno
      cargarIpressCenate();
    }
  }, [formData.tipo_personal]);

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
          const codigoRed = (redSelec.codigo || redSelec.codRed || '').toString();

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
          console.log('🔍 Red sin IPRESS asociadas. Red:', nombreRed, '| Código:', codigoRed);

          // Extraer palabras clave significativas
          const palabrasIgnorar = ['DE', 'LA', 'EL', 'LOS', 'LAS', 'DEL', 'Y', 'EN'];
          const getPalabrasClave = (texto) => {
            return normalizarNombre(texto).split(' ').filter(p => p.length > 2 && !palabrasIgnorar.includes(p));
          };

          const palabrasClaveRed = getPalabrasClave(nombreRed);
          console.log('🔍 Palabras clave de la Red:', palabrasClaveRed);

          // Buscar IPRESS con coincidencia
          const ipressSimilar = ipressAll.find(ip => {
            const nombreIpressOriginal = (ip.descIpress || '').toUpperCase().trim();
            const nombreIpress = normalizarNombre(nombreIpressOriginal);

            // 1. Coincidencia exacta (normalizada)
            if (nombreIpress === nombreRed) {
              console.log('✅ Coincidencia EXACTA:', nombreIpressOriginal);
              return true;
            }

            // 2. Uno contiene al otro
            if (nombreIpress.includes(nombreRed) || nombreRed.includes(nombreIpress)) {
              console.log('✅ Coincidencia parcial:', nombreIpressOriginal);
              return true;
            }

            // 3. Coincidencia por palabras clave (al menos 3 palabras deben coincidir)
            const palabrasClaveIpress = getPalabrasClave(nombreIpress);
            const coincidencias = palabrasClaveRed.filter(p => palabrasClaveIpress.includes(p));
            if (coincidencias.length >= 3 || (coincidencias.length >= 2 && palabrasClaveRed.length <= 3)) {
              console.log('✅ Coincidencia por palabras:', coincidencias.join(', '), '→', nombreIpressOriginal);
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
            // No existe IPRESS con ese nombre - mostrar mensaje
            console.log('⚠️ No existe IPRESS con nombre similar a:', nombreRed);
            console.log('💡 Palabras buscadas:', palabrasClaveRed.join(', '));
            setIpress([]);
          }
        }
      } else {
        setIpress(ipressFiltradas);
        // Limpiar IPRESS seleccionada si ya no está en la lista filtrada
        if (formData.id_ipress) {
          const existeEnFiltro = ipressFiltradas.some(ip => ip.idIpress === formData.id_ipress);
          if (!existeEnFiltro) {
            setFormData(prev => ({ ...prev, id_ipress: null }));
            setMacroregionInfo(null);
          }
        }
      }
    } else {
      setIpress([]);
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

  const cargarCatalogos = async () => {
    try {
      setLoadingCatalogos(true);
      console.log('📚 Cargando catálogos profesionales...');
      
      // Cargar profesiones
      try {
        const profResponse = await api.get('/profesiones');
        console.log('✅ Profesiones cargadas:', profResponse);
        const profData = Array.isArray(profResponse) ? profResponse : [];
        // Ordenar alfabéticamente por descripción
        const profOrdenadas = profData.sort((a, b) => {
          const descA = (a.descProf || '').toLowerCase();
          const descB = (b.descProf || '').toLowerCase();
          return descA.localeCompare(descB);
        });
        setProfesiones(profOrdenadas);
        console.log('🔤 Profesiones ordenadas:', profOrdenadas.length);
      } catch (error) {
        console.error('⚠️ Error al cargar profesiones:', error);
        setProfesiones([]);
      }
      
      // Cargar especialidades
      try {
        const espResponse = await api.get(API_ROUTES.INICIO.SERVICIO_ESSI);
        console.log('✅ Especialidades cargadas:', espResponse);
        const espData = Array.isArray(espResponse) ? espResponse : [];
        // Ordenar alfabéticamente por descServicio
        const espOrdenadas = espData.sort((a, b) => {
          const descA = (a.descServicio || '').toLowerCase();
          const descB = (b.descServicio || '').toLowerCase();
          return descA.localeCompare(descB);
        });
        setEspecialidades(espOrdenadas);
        console.log('🔤 Especialidades ordenadas:', espOrdenadas.length);
      } catch (error) {
        console.error('⚠️ Error al cargar especialidades:', error);
        setEspecialidades([]);
      }
      
      // Cargar regímenes laborales
      try {
        const regResponse = await api.get('/regimenes');
        console.log('✅ Regímenes laborales cargados:', regResponse);
        const regData = Array.isArray(regResponse) ? regResponse : [];
        // Ordenar alfabéticamente por descripción
        const regOrdenados = regData.sort((a, b) => {
          const descA = (a.descRegLab || '').toLowerCase();
          const descB = (b.descRegLab || '').toLowerCase();
          return descA.localeCompare(descB);
        });
        setRegimenesLaborales(regOrdenados);
        console.log('🔤 Regímenes ordenados:', regOrdenados.length);
      } catch (error) {
        console.error('⚠️ Error al cargar regímenes laborales:', error);
        setRegimenesLaborales([]);
      }
      
      // Cargar tipos de profesional
      try {
        console.log('👨‍⚕️ Iniciando carga de tipos de profesional desde /tipos-personal...');
        const tiposResponse = await api.get('/tipos-personal');
        console.log('📎 Respuesta completa de tipos de profesional:', tiposResponse);
        console.log('📊 Tipo de respuesta:', typeof tiposResponse);
        console.log('📊 Es array?:', Array.isArray(tiposResponse));
        
        // Función helper para extraer datos
        const extractData = (response) => {
          if (Array.isArray(response)) {
            console.log('✅ La respuesta ya es un array con', response.length, 'elementos');
            return response;
          }
          if (response?.data && Array.isArray(response.data)) {
            console.log('✅ Extrayendo datos de response.data con', response.data.length, 'elementos');
            return response.data;
          }
          if (response?.content && Array.isArray(response.content)) {
            console.log('✅ Extrayendo datos de response.content con', response.content.length, 'elementos');
            return response.content;
          }
          console.warn('⚠️ No se pudo extraer array de la respuesta');
          return [];
        };
        
        const tiposData = extractData(tiposResponse);
        // Ordenar alfabéticamente por descripción
        const tiposOrdenados = tiposData.sort((a, b) => {
          const descA = (a.descTipPers || a.desc_tip_pers || '').toLowerCase();
          const descB = (b.descTipPers || b.desc_tip_pers || '').toLowerCase();
          return descA.localeCompare(descB);
        });
        console.log('🎯 Tipos de profesional extraídos y ordenados:', tiposOrdenados);
        console.log('🎯 Primera tipo (muestra):', tiposOrdenados[0]);
        setTiposProfesional(tiposOrdenados);
        console.log('✅ Estado de tipos de profesional actualizado con', tiposOrdenados.length, 'registros');
      } catch (error) {
        console.error('❌ Error al cargar tipos de profesional:', error);
        console.error('❌ Detalles del error:', error.response?.data || error.message);
        setTiposProfesional([]);
      }
      
      // Cargar áreas
      try {
        console.log('🏢 Iniciando carga de áreas desde /admin/areas...');
        const areaResponse = await api.get('/admin/areas');
        console.log('📦 Respuesta completa de áreas:', areaResponse);
        console.log('📊 Tipo de respuesta:', typeof areaResponse);
        console.log('📊 Es array?:', Array.isArray(areaResponse));
        
        // Función helper para extraer datos de diferentes estructuras de respuesta
        const extractData = (response) => {
          if (Array.isArray(response)) {
            console.log('✅ La respuesta ya es un array con', response.length, 'elementos');
            return response;
          }
          if (response?.data && Array.isArray(response.data)) {
            console.log('✅ Extrayendo datos de response.data con', response.data.length, 'elementos');
            return response.data;
          }
          if (response?.content && Array.isArray(response.content)) {
            console.log('✅ Extrayendo datos de response.content con', response.content.length, 'elementos');
            return response.content;
          }
          console.warn('⚠️ No se pudo extraer array de la respuesta');
          return [];
        };
        
        const areasData = extractData(areaResponse);
        // Ordenar alfabéticamente por descripción
        const areasOrdenadas = areasData.sort((a, b) => {
          const descA = (a.descArea || '').toLowerCase();
          const descB = (b.descArea || '').toLowerCase();
          return descA.localeCompare(descB);
        });
        console.log('🎯 Áreas extraídas y ordenadas:', areasOrdenadas);
        console.log('🎯 Primera área (muestra):', areasOrdenadas[0]);
        setAreas(areasOrdenadas);
        console.log('✅ Estado de áreas actualizado con', areasOrdenadas.length, 'registros');
      } catch (error) {
        console.error('❌ Error al cargar áreas:', error);
        console.error('❌ Detalles del error:', error.response?.data || error.message);
        setAreas([]);
      }
      
      setLoadingCatalogos(false);
    } catch (error) {
      console.error('❌ Error general al cargar catálogos:', error);
      setLoadingCatalogos(false);
    }
  };

  const cargarIpressCenate = async () => {
    try {
      console.log('🔍 Buscando IPRESS CENATE (código 739)...');
      const ipressResponse = ipressList && ipressList.length > 0 
        ? ipressList 
        : await api.get('/ipress');
      
      const cenateIpressFound = ipressResponse.find(ip => 
        ip.codIpress === '739' || 
        ip.descIpress?.toUpperCase().includes('CENATE') ||
        ip.descIpress?.toUpperCase().includes('NACIONAL DE TELEMEDICINA')
      );
      
      if (cenateIpressFound) {
        console.log('✅ IPRESS CENATE encontrada:', cenateIpressFound);
        setCenateIpress(cenateIpressFound);
        setFormData(prev => ({ ...prev, id_ipress: cenateIpressFound.idIpress }));
      } else {
        console.warn('⚠️ No se encontró IPRESS CENATE con código 739');
      }
    } catch (error) {
      console.error('❌ Error al cargar IPRESS CENATE:', error);
    }
  };

  // Limpiar número de documento cuando cambia el tipo
  useEffect(() => {
    if (formData.numero_documento) {
      let value = formData.numero_documento;
      
      if (formData.tipo_documento === 'DNI') {
        value = value.replace(/\D/g, '').slice(0, 8);
      } else if (formData.tipo_documento === 'C.E./PAS') {
        value = value.replace(/\D/g, '').slice(0, 20);
      } else if (formData.tipo_documento === 'PASAPORT') {
        value = value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 20).toUpperCase();
      }
      
      if (value !== formData.numero_documento) {
        setFormData(prev => ({ ...prev, numero_documento: value }));
      }
    }
  }, [formData.tipo_documento]);

  const cargarRoles = async () => {
    try {
      try {
        const userResponse = await api.get('/auth/me');
        console.log('✅ Usuario autenticado:', userResponse);
        setCurrentUserRoles(userResponse.roles || []);
      } catch (error) {
        console.error('⚠️ Error al obtener usuario autenticado:', error);
      }

      const rolesResponse = await api.get('/admin/roles');
      console.log('✅ Roles cargados:', rolesResponse);
      setRoles(Array.isArray(rolesResponse) ? rolesResponse : []);
      setLoadingRoles(false);
    } catch (error) {
      console.error('❌ Error al cargar roles:', error);
      alert('Error al cargar roles del sistema');
      setLoadingRoles(false);
    }
  };

  const cargarIpress = async () => {
    try {
      setLoadingIpress(true);
      console.log('🔍 Cargando IPRESS desde /ipress...');
      const ipressResponse = await api.get('/ipress');
      console.log('✅ IPRESS cargadas:', ipressResponse);

      const ipressFiltered = Array.isArray(ipressResponse)
        ? ipressResponse.filter(ip =>
            ip.codIpress !== '739' &&
            !ip.descIpress?.toUpperCase().includes('CENTRO NACIONAL DE TELEMEDICINA')
          )
        : [];

      console.log('🔍 IPRESS filtradas (sin CENATE):', ipressFiltered.length);
      setIpress(ipressFiltered);
      setLoadingIpress(false);
    } catch (error) {
      console.error('❌ Error al cargar IPRESS:', error);
      alert('Error al cargar la lista de IPRESS. Revise la consola.');
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

      const ipressFiltered = Array.isArray(ipressResponse)
        ? ipressResponse.filter(ip =>
            ip.codIpress !== '739' &&
            !ip.descIpress?.toUpperCase().includes('CENTRO NACIONAL DE TELEMEDICINA')
          )
        : [];

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

  const handleRoleToggle = (roleName) => {
    const isPrivileged = ['ADMIN', 'SUPERADMIN'].includes(roleName);
    const isSuperAdmin = currentUserRoles.includes('SUPERADMIN');

    if (isPrivileged && !isSuperAdmin) {
      alert('Solo SUPERADMIN puede asignar roles privilegiados');
      return;
    }

    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(roleName)
        ? prev.roles.filter(r => r !== roleName)
        : [...prev.roles, roleName]
    }));
  };

  // 🔥 OBTENER EL RÉGIMEN LABORAL SELECCIONADO
  const regimenSeleccionado = regimenesLaborales.find(r => 
    r.idRegLab === parseInt(formData.id_regimen_laboral)
  );
  const requiereCodigoPlanilla = regimenSeleccionado?.descRegLab?.toUpperCase().includes('728') || 
                                  regimenSeleccionado?.descRegLab?.toUpperCase().includes('CAS') || 
                                  false;

  const username = useMemo(() => {
    const { numero_documento } = formData;
    return numero_documento || '';
  }, [formData.numero_documento]);

  // 🆕 v1.18.0 - Password temporal REMOVIDO
  // Backend genera contraseña automática + envía email con token

  const handleDocumentoChange = useCallback((e) => {
    let { value } = e.target;
    const { tipo_documento } = formData;

    if (tipo_documento === 'DNI') {
      value = value.replace(/\D/g, '');
      value = value.slice(0, 8);
    } else if (tipo_documento === 'C.E./PAS') {
      value = value.replace(/\D/g, '');
      value = value.slice(0, 20);
    } else if (tipo_documento === 'PASAPORT') {
      value = value.replace(/[^a-zA-Z0-9]/g, '');
      value = value.slice(0, 20);
      value = value.toUpperCase();
    }

    setFormData(prev => ({ ...prev, numero_documento: value }));
  }, [formData.tipo_documento]);

  const handleTelefonoChange = useCallback((e) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.slice(0, 9);
    setFormData(prev => ({ ...prev, telefono: value }));
  }, []);

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

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = {};
    
    // Validar campos personales
    if (!formData.numero_documento.trim()) newErrors.numero_documento = 'Campo obligatorio';
    if (!formData.nombres.trim()) newErrors.nombres = 'Campo obligatorio';
    if (!formData.apellido_paterno.trim()) newErrors.apellido_paterno = 'Campo obligatorio';
    if (!formData.apellido_materno.trim()) newErrors.apellido_materno = 'Campo obligatorio';
    if (!formData.fecha_nacimiento) newErrors.fecha_nacimiento = 'Campo obligatorio';
    if (!formData.genero) newErrors.genero = 'Campo obligatorio';
    if (!formData.correo_personal.trim()) newErrors.correo_personal = 'Campo obligatorio';
    if (!formData.telefono.trim()) newErrors.telefono = 'Campo obligatorio';
    if (formData.roles.length === 0) newErrors.roles = 'Debe seleccionar al menos un rol';
    
    // tipo_personal: "1" = Interno, "2" = Externo
    if (formData.tipo_personal === '2' && !formData.id_ipress) {
      newErrors.id_ipress = 'Debe seleccionar una IPRESS';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.correo_institucional && !emailRegex.test(formData.correo_institucional)) {
      newErrors.correo_institucional = 'Formato de correo inválido';
    }
    if (formData.correo_personal && !emailRegex.test(formData.correo_personal)) {
      newErrors.correo_personal = 'Formato de correo inválido';
    }
    
    if (formData.tipo_documento === 'DNI') {
      if (formData.numero_documento.length !== 8) {
        newErrors.numero_documento = 'El DNI debe tener 8 dígitos';
      }
      if (!/^\d{8}$/.test(formData.numero_documento)) {
        newErrors.numero_documento = 'El DNI debe contener solo números';
      }
    } else if (formData.tipo_documento === 'C.E./PAS') {
      if (formData.numero_documento.length < 9 || formData.numero_documento.length > 20) {
        newErrors.numero_documento = 'El CE debe tener entre 9 y 20 dígitos';
      }
      if (!/^\d+$/.test(formData.numero_documento)) {
        newErrors.numero_documento = 'El CE debe contener solo números';
      }
    } else if (formData.tipo_documento === 'PASAPORT') {
      if (formData.numero_documento.length < 6 || formData.numero_documento.length > 20) {
        newErrors.numero_documento = 'El pasaporte debe tener entre 6 y 20 caracteres';
      }
      if (!/^[A-Z0-9]+$/.test(formData.numero_documento)) {
        newErrors.numero_documento = 'El pasaporte debe contener solo letras y números';
      }
    }
    
    if (formData.telefono && formData.telefono.length !== 9) {
      newErrors.telefono = 'El teléfono debe tener 9 dígitos';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleNextOrSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedTab === 'personal') {
      const personalErrors = {};
      
      if (!formData.numero_documento.trim()) personalErrors.numero_documento = 'Campo obligatorio';
      if (!formData.nombres.trim()) personalErrors.nombres = 'Campo obligatorio';
      if (!formData.apellido_paterno.trim()) personalErrors.apellido_paterno = 'Campo obligatorio';
      if (!formData.apellido_materno.trim()) personalErrors.apellido_materno = 'Campo obligatorio';
      if (!formData.fecha_nacimiento) personalErrors.fecha_nacimiento = 'Campo obligatorio';
      if (!formData.genero) personalErrors.genero = 'Campo obligatorio';
      if (!formData.correo_personal.trim()) personalErrors.correo_personal = 'Campo obligatorio';
      if (!formData.telefono.trim()) personalErrors.telefono = 'Campo obligatorio';
      
      // tipo_personal: "1" = Interno, "2" = Externo
      if (formData.tipo_personal === '2' && !formData.id_ipress) {
        personalErrors.id_ipress = 'Debe seleccionar una IPRESS';
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (formData.correo_institucional && !emailRegex.test(formData.correo_institucional)) {
        personalErrors.correo_institucional = 'Formato de correo inválido';
      }
      if (formData.correo_personal && !emailRegex.test(formData.correo_personal)) {
        personalErrors.correo_personal = 'Formato de correo inválido';
      }
      
      if (formData.tipo_documento === 'DNI') {
        if (formData.numero_documento.length !== 8) {
          personalErrors.numero_documento = 'El DNI debe tener 8 dígitos';
        }
        if (!/^\d{8}$/.test(formData.numero_documento)) {
          personalErrors.numero_documento = 'El DNI debe contener solo números';
        }
      } else if (formData.tipo_documento === 'C.E./PAS') {
        if (formData.numero_documento.length < 9 || formData.numero_documento.length > 20) {
          personalErrors.numero_documento = 'El CE debe tener entre 9 y 20 dígitos';
        }
        if (!/^\d+$/.test(formData.numero_documento)) {
          personalErrors.numero_documento = 'El CE debe contener solo números';
        }
      } else if (formData.tipo_documento === 'PASAPORT') {
        if (formData.numero_documento.length < 6 || formData.numero_documento.length > 20) {
          personalErrors.numero_documento = 'El pasaporte debe tener entre 6 y 20 caracteres';
        }
        if (!/^[A-Z0-9]+$/.test(formData.numero_documento)) {
          personalErrors.numero_documento = 'El pasaporte debe contener solo letras y números';
        }
      }
      
      if (formData.telefono && formData.telefono.length !== 9) {
        personalErrors.telefono = 'El teléfono debe tener 9 dígitos';
      }
      
      setErrors(personalErrors);
      
      if (Object.keys(personalErrors).length > 0) {
        alert('Por favor complete todos los campos obligatorios correctamente');
        return;
      }
      
      // Ir a roles si es externo, tipo_personal: '1' = Interno, '2' = Externo
      if (formData.tipo_personal === '2') {  // Externo
        setSelectedTab('roles');
      } else {
        setSelectedTab('profesionales');
      }


      return;
    }
    
    if (selectedTab === 'profesionales') {
      // Los datos profesionales son opcionales, pero validar formato si se llenan
      const profesionalesErrors = {};
      
      // Si seleccionó OTRO, debe especificar la profesión
      const profesionSeleccionada = profesiones.find(p => p.idProf === parseInt(formData.id_profesion));
      if (profesionSeleccionada?.descProf?.toUpperCase().includes('OTRO') && !formData.desc_prof_otro?.trim()) {
        profesionalesErrors.desc_prof_otro = 'Debe especificar la profesión';
      }
      
      // Si es MEDICINA, Colegiatura es obligatoria
      const esMedicina = profesionSeleccionada?.descProf?.toUpperCase().includes('MEDICINA');
      if (esMedicina && !formData.colegiatura?.trim()) {
        profesionalesErrors.colegiatura = 'La colegiatura es obligatoria para profesionales de medicina';
      }
      
      // Si tiene especialidad médica = SI, entonces Especialidad y RNE son obligatorios
      if (esMedicina && formData.tiene_especialidad_medica === 'SI') {
        if (!formData.id_especialidad) {
          profesionalesErrors.id_especialidad = 'Debe seleccionar una especialidad';
        }
        if (!formData.rne?.trim()) {
          profesionalesErrors.rne = 'El RNE es obligatorio';
        }
      }
      
      setErrors(profesionalesErrors);
      
      if (Object.keys(profesionalesErrors).length > 0) {
        alert('Por favor corrija los errores en los datos profesionales');
        return;
      }
      
      // Pasar a Datos Laborales
      setSelectedTab('laborales');
      return;
    }
    
    if (selectedTab === 'laborales') {
      // Los datos laborales son opcionales, pero validar formato si se llenan
      const laboralesErrors = {};
      
      // Si llenó periodo de ingreso, validar formato YYYYMM
      if (formData.periodo_ingreso && !/^\d{6}$/.test(formData.periodo_ingreso)) {
        laboralesErrors.periodo_ingreso = 'El periodo debe tener formato YYYYMM (ej: 202501)';
      }
      
      // Validar Código de Planilla si es régimen 728 o CAS
      const regimenSeleccionado = regimenesLaborales.find(r => 
        r.idRegLab === parseInt(formData.id_regimen_laboral)
      );
      const requiereCodigoPlanilla = regimenSeleccionado?.descRegLab?.toUpperCase().includes('728') || 
                                      regimenSeleccionado?.descRegLab?.toUpperCase().includes('CAS');
      
      if (requiereCodigoPlanilla && !formData.codigo_planilla?.trim()) {
        laboralesErrors.codigo_planilla = 'El código de planilla es obligatorio para este régimen laboral';
      }
      
      setErrors(laboralesErrors);

      if (Object.keys(laboralesErrors).length > 0) {
        alert('Por favor corrija los errores en los datos laborales');
        return;
      }

      // Pasar a Firma Digital (solo para internos)
      if (formData.tipo_personal !== '2') {
        setSelectedTab('firma');
      } else {
        setSelectedTab('roles');
      }
      return;
    }

    // 🆕 v1.14.0 - Validación de Firma Digital (solo para internos)
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

      // Pasar a Roles
      setSelectedTab('roles');
      return;
    }

    if (selectedTab === 'roles') {
      if (formData.roles.length === 0) {
        setErrors({ roles: 'Debe seleccionar al menos un rol' });
        alert('Debe seleccionar al menos un rol para el usuario');
        return;
      }
      
      setLoading(true);
      await handleSubmit();
    }
  };

  const handleSubmit = async () => {
    try {
      const dataToSend = {
        username: username,
        // 🆕 v1.18.0 - Password NO se envía aquí
        // Backend genera un password temporal + envía email con token
        // Usuario establecerá su propia password vía enlace de email
        nombres: formData.nombres,
        apellido_paterno: formData.apellido_paterno,
        apellido_materno: formData.apellido_materno,
        numero_documento: formData.numero_documento,
        tipo_documento: formData.tipo_documento,
        genero: formData.genero,
        fecha_nacimiento: formData.fecha_nacimiento,
        telefono: formData.telefono,
        correo_personal: formData.correo_personal,
        correo_corporativo: formData.correo_institucional || '',
        roles: formData.roles,
        estado: 'ACTIVO',
        
        // Datos profesionales (opcionales)
        id_profesion: formData.id_profesion || null,
        desc_prof_otro: formData.desc_prof_otro || null,
        colegiatura: formData.colegiatura || null,
        id_especialidad: formData.id_especialidad || null,
        rne: formData.rne || null,
        
        // Datos laborales (opcionales)
        id_regimen_laboral: formData.id_regimen_laboral || null,
        id_tip_pers: formData.id_tip_pers || null, // 🆕 Tipo de profesional
        codigo_planilla: formData.codigo_planilla || null,
        periodo_ingreso: formData.periodo_ingreso || null,
        id_area: formData.id_area || null,

        // ORIGEN PERSONAL (1=Interno, 2=Externo)
        id_origen: formData.tipo_personal ? parseInt(formData.tipo_personal) : null,
        
        // ✅ IPRESS - SIEMPRE enviar si existe
        idIpress: formData.id_ipress || null
      };
      
      // 🐞 DEBUG: Verificar que idIpress se envía correctamente
      console.log('🐞 DEBUG - Datos antes de enviar:');
      console.log('  tipo_personal:', formData.tipo_personal);
      console.log('  id_ipress:', formData.id_ipress);
      console.log('  id_origen:', dataToSend.id_origen);
      console.log('  idIpress:', dataToSend.idIpress);
      console.log('  cenateIpress:', cenateIpress);
      
      // ⚠️ VALIDACIÓN: Si es INTERNO pero no tiene idIpress, intentar asignar CENATE
      if (formData.tipo_personal === '1' && !dataToSend.idIpress) {
        console.warn('⚠️ Usuario INTERNO sin idIpress - Intentando asignar CENATE...');
        if (cenateIpress?.idIpress) {
          dataToSend.idIpress = cenateIpress.idIpress;
          console.log('✅ idIpress de CENATE asignado:', dataToSend.idIpress);
        } else {
          console.error('❌ No se pudo obtener idIpress de CENATE');
          alert('⚠️ Error: No se pudo asignar la IPRESS de CENATE. Por favor intente nuevamente.');
          return;
        }
      }
      
      // ⚠️ VALIDACIÓN: Si es EXTERNO pero no tiene idIpress, mostrar error
      if (formData.tipo_personal === '2' && !dataToSend.idIpress) {
        alert('⚠️ Error: Debe seleccionar una IPRESS para personal externo.');
        return;
      }

      // 🆕 v1.14.0 - FIRMA DIGITAL (solo para INTERNOS con régimen CAS/728)
      if (formData.tipo_personal === '1' && formData.id_regimen_laboral) {
        const regimenSeleccionado = regimenesLaborales.find(r =>
          r.idRegLab === parseInt(formData.id_regimen_laboral)
        );
        const descRegimen = regimenSeleccionado?.descRegLab?.toUpperCase() || '';
        const requiereFirmaDigital = descRegimen.includes('CAS') || descRegimen.includes('728');

        if (requiereFirmaDigital && formData.entrego_token) {
          dataToSend.firmaDigital = {
            entregoToken: formData.entrego_token === 'SI',
            numeroSerieToken: formData.numero_serie_token || null,
            fechaEntregaToken: formData.entrego_token === 'SI' && formData.fecha_entrega_token ? formatDateForBackend(formData.fecha_entrega_token) : (formData.entrego_token === 'SI' ? formatDateForBackend(new Date()) : null),
            fechaInicioCertificado: formatDateForBackend(formData.fecha_inicio_certificado),
            fechaVencimientoCertificado: formatDateForBackend(formData.fecha_vencimiento_certificado),
            motivoSinToken: formData.motivo_sin_token || null,
            observaciones: formData.observaciones_firma || null
          };
          console.log('🖋️ Firma digital agregada:', dataToSend.firmaDigital);
        }
      }

      const isSuperAdmin = currentUserRoles.includes('SUPERADMIN');
      const hasPrivilegedRoles = formData.roles.some(r => ['ADMIN', 'SUPERADMIN'].includes(r));
      const endpoint = (isSuperAdmin && hasPrivilegedRoles)
        ? '/usuarios/crear-con-roles'
        : '/usuarios/crear';

      console.log('🚀 Creando usuario con endpoint:', endpoint);
      console.log('📦 Datos a enviar:', JSON.stringify(dataToSend, null, 2));

      const response = await api.post(endpoint, dataToSend);
      
      console.log('✅ Usuario creado exitosamente');
      
      // Obtener el ID del usuario creado
      const userId = response?.id_user || response?.idUser || response?.id;
      
      // Si hay foto seleccionada y se obtuvo el ID del usuario, subir la foto
      if (fotoSeleccionada && userId) {
        try {
          console.log('📸 Subiendo foto para usuario ID:', userId);
          await api.uploadFile(`/personal/foto/${userId}`, fotoSeleccionada);
          console.log('✅ Foto subida exitosamente');
        } catch (error) {
          console.error('⚠️ Error al subir la foto:', error);
          // No bloquear el flujo si falla la subida de foto
          alert(
            `✅ Usuario creado exitosamente\n\n` +
            `⚠️ Advertencia: No se pudo subir la foto. Puedes subirla más tarde editando el usuario.\n\n` +
            `📧 Se envió un correo de activación a:\n` +
            `   ${formData.correo_personal}\n\n` +
            `Username: ${username}\n` +
            `Roles: ${formData.roles.join(', ')}`
          );
          onSuccess();
          onClose();
          return;
        }
      }
      
      alert(
        `✅ Usuario creado exitosamente${fotoSeleccionada ? ' con foto' : ''}\n\n` +
        `🆕 Flujo Seguro de Activación:\n\n` +
        `📧 Se envió un correo a:\n` +
        `   ${formData.correo_personal}\n\n` +
        `El usuario debe:\n` +
        `1. Revisar su correo (bandeja de entrada o spam)\n` +
        `2. Hacer clic en el enlace "Activar mi Cuenta"\n` +
        `3. Establecer su propia contraseña\n` +
        `4. El enlace expira en 24 horas\n\n` +
        `Username: ${username}\n` +
        `Roles: ${formData.roles.join(', ')}`
      );
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error al crear usuario:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error al crear el usuario';
      
      // Verificar si es un error de usuario existente
      if (errorMessage.toLowerCase().includes('ya existe') || errorMessage.toLowerCase().includes('already exists')) {
        setUsuarioExistenteModal({
          open: true,
          username: username,
          mensaje: errorMessage
        });
      } else {
        alert(`❌ Error: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-4 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 to-emerald-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                <UserPlus className="w-6 h-6 text-white" />
              </div>
              <div className="text-white">
                <h2 className="text-xl font-bold">Nuevo Usuario</h2>
                <p className="text-emerald-100 text-sm">Completa los datos para crear un nuevo usuario</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 text-white rounded-xl transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs - 4 PESTAÑAS */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setSelectedTab('personal')}
              className={`px-4 py-2 font-medium text-sm rounded-t-xl transition-all ${
                selectedTab === 'personal'
                  ? 'bg-white text-emerald-900'
                  : 'bg-emerald-800/40 text-emerald-100 hover:bg-emerald-800/60'
              }`}
            >
              Datos Personales
            </button>

            {/* Solo mostrar "Datos Profesionales" y "Datos Laborales" para personal INTERNO */}
            {formData.tipo_personal !== '2' && (
              <>
                <button
                  onClick={() => setSelectedTab('profesionales')}
                  className={`px-4 py-2 font-medium text-sm rounded-t-xl transition-all ${
                    selectedTab === 'profesionales'
                      ? 'bg-white text-emerald-900'
                      : 'bg-emerald-800/40 text-emerald-100 hover:bg-emerald-800/60'
                  }`}
                >
                  Datos Profesionales
                </button>
                <button
                  onClick={() => setSelectedTab('laborales')}
                  className={`px-4 py-2 font-medium text-sm rounded-t-xl transition-all ${
                    selectedTab === 'laborales'
                      ? 'bg-white text-emerald-900'
                      : 'bg-emerald-800/40 text-emerald-100 hover:bg-emerald-800/60'
                  }`}
                >
                  Datos Laborales
                </button>

                {/* 🆕 v1.14.0 - Tab Firma Digital (solo usuarios internos) */}
                <button
                  onClick={() => setSelectedTab('firma')}
                  className={`px-4 py-2 font-medium text-sm rounded-t-xl transition-all ${
                    selectedTab === 'firma'
                      ? 'bg-white text-emerald-900'
                      : 'bg-emerald-800/40 text-emerald-100 hover:bg-emerald-800/60'
                  }`}
                >
                  Firma Digital
                </button>
              </>
            )}

            <button
              onClick={() => setSelectedTab('roles')}
              className={`px-4 py-2 font-medium text-sm rounded-t-xl transition-all ${
                selectedTab === 'roles'
                  ? 'bg-white text-emerald-900'
                  : 'bg-emerald-800/40 text-emerald-100 hover:bg-emerald-800/60'
              }`}
            >
              Roles del Sistema
            </button>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleNextOrSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto flex-1">
            {selectedTab === 'personal' && (
              <div className="space-y-6">
                {/* Información Personal */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-emerald-600" />
                    Información Personal
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SelectField
                      label="Tipo de Documento"
                      name="tipo_documento"
                      required
                      value={formData.tipo_documento}
                      onChange={handleChange}
                      errors={errors}
                      options={[
                        { value: 'DNI', label: 'DNI' },
                        { value: 'C.E./PAS', label: 'Carnet de Extranjería / Pasaporte' },
                        { value: 'PASAPORT', label: 'Pasaporte' }
                      ]}
                    />
                    <div>
                      <label htmlFor="numero_documento" className="block text-sm font-medium text-gray-700 mb-2">
                        Número de Documento <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="numero_documento"
                        name="numero_documento"
                        type="text"
                        required
                        value={formData.numero_documento}
                        onChange={handleDocumentoChange}
                        placeholder={
                          formData.tipo_documento === 'DNI' ? 'Ej: 12345678' :
                          formData.tipo_documento === 'C.E./PAS' ? 'Ej: 001234567890' :
                          'Ej: ABC123456'
                        }
                        className={`w-full px-4 py-2 border-2 rounded-xl transition-all focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                          errors.numero_documento ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {
                          formData.tipo_documento === 'DNI' ? '8 dígitos numéricos' :
                          formData.tipo_documento === 'C.E./PAS' ? 'Hasta 20 dígitos numéricos' :
                          'Hasta 20 caracteres alfanuméricos'
                        }
                        {formData.numero_documento && ` (${formData.numero_documento.length}/${
                          formData.tipo_documento === 'DNI' ? '8' : '20'
                        })`}
                      </p>
                      {errors.numero_documento && (
                        <p className="text-red-500 text-sm mt-1">{errors.numero_documento}</p>
                      )}
                    </div>
                    <FormField
                      label="Nombres"
                      name="nombres"
                      required
                      value={formData.nombres}
                      onChange={handleChange}
                      errors={errors}
                      placeholder="Ej: Juan Carlos"
                    />
                    <FormField
                      label="Apellido Paterno"
                      name="apellido_paterno"
                      required
                      value={formData.apellido_paterno}
                      onChange={handleChange}
                      errors={errors}
                      placeholder="Ej: García"
                    />
                    <FormField
                      label="Apellido Materno"
                      name="apellido_materno"
                      required
                      value={formData.apellido_materno}
                      onChange={handleChange}
                      errors={errors}
                      placeholder="Ej: López"
                    />
                    <SelectField
                      label="Género"
                      name="genero"
                      required
                      value={formData.genero}
                      onChange={handleChange}
                      errors={errors}
                      options={[
                        { value: 'M', label: 'Masculino' },
                        { value: 'F', label: 'Femenino' },
                        { value: 'OTRO', label: 'Otro' }
                      ]}
                    />
                    <FormField
                      label="Fecha de Nacimiento"
                      name="fecha_nacimiento"
                      type="date"
                      required
                      value={formData.fecha_nacimiento}
                      onChange={handleChange}
                      errors={errors}
                    />
                  </div>
                </div>

                {/* Campo de Foto */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Camera className="w-5 h-5 text-emerald-600" />
                    Foto de Perfil
                  </h3>
                  <div className="space-y-4">
                    {/* Vista previa de la foto */}
                    {fotoPreview && (
                      <div className="relative inline-block">
                        <div className="w-32 h-32 rounded-xl overflow-hidden border-2 border-emerald-300 shadow-md">
                          <img
                            src={fotoPreview}
                            alt="Vista previa"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleEliminarFoto}
                          className="absolute -top-2 -right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-all"
                          title="Eliminar foto"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                        {fotoSeleccionada && (
                          <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                            <p className="text-xs font-medium text-emerald-900">
                              📷 Foto seleccionada: {fotoSeleccionada.name}
                            </p>
                            <p className="text-xs text-emerald-700 mt-1">
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
                          fotoPreview
                            ? 'border-emerald-300 bg-emerald-50'
                            : 'border-gray-300 bg-gray-50 hover:border-emerald-400 hover:bg-emerald-50'
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
                          {fotoPreview ? (
                            <>
                              <ImageIcon className="w-8 h-8 text-emerald-600 mb-2" />
                              <p className="text-sm font-medium text-emerald-700">
                                Cambiar foto
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
                        La foto es opcional y se puede agregar más tarde
                      </p>
                    </div>
                  </div>
                </div>

                {/* Información de Contacto */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-emerald-600" />
                    Información de Contacto
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      label="Correo Personal"
                      name="correo_personal"
                      type="email"
                      required
                      value={formData.correo_personal}
                      onChange={handleChange}
                      errors={errors}
                      placeholder="usuario@gmail.com"
                    />
                    <FormField
                      label="Correo Institucional"
                      name="correo_institucional"
                      type="email"
                      value={formData.correo_institucional}
                      onChange={handleChange}
                      errors={errors}
                      placeholder="usuario@essalud.gob.pe (opcional)"
                    />
                    <div>
                      <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-2">
                        Teléfono <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="telefono"
                        name="telefono"
                        type="text"
                        required
                        value={formData.telefono}
                        onChange={handleTelefonoChange}
                        placeholder="Ej: 987654321"
                        className={`w-full px-4 py-2 border-2 rounded-xl transition-all focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                          errors.telefono ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        9 dígitos numéricos
                        {formData.telefono && ` (${formData.telefono.length}/9)`}
                      </p>
                      {errors.telefono && (
                        <p className="text-red-500 text-sm mt-1">{errors.telefono}</p>
                      )}
                    </div>
                    <SelectField
                      label="Tipo de Personal"
                      name="tipo_personal"
                      required
                      value={formData.tipo_personal}
                      onChange={handleChange}
                      errors={errors}
                      options={[
                        { value: '2', label: 'Externo' },
                        { value: '1', label: 'Interno - Centro Nacional de Telemedicina' }
                      ]}
                    />
                    {formData.tipo_personal === '1' && cenateIpress && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          IPRESS Asignada Automáticamente
                        </label>
                        <div className="w-full px-4 py-3 border-2 border-emerald-300 bg-emerald-50 rounded-xl">
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center">
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-emerald-900 text-sm">
                                {cenateIpress.codIpress || ''} - {cenateIpress.descIpress || 'Centro Nacional de Telemedicina'}
                              </p>
                              <p className="text-xs text-emerald-700">✅ Asignación automática para personal INTERNO</p>
                            </div>
                            <div className="px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-full">
                              ✓ CENATE
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {formData.tipo_personal === '2' && (
                      <>
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
                                // Buscar macroregión de la red seleccionada
                                const redSel = redes.find(r => (r.id || r.idRed) === redId);
                                setRedSeleccionada(redSel);
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
                      </>
                    )}
                  </div>
                </div>

                {/* Credenciales */}
                <div className="bg-gradient-to-br from-teal-50 to-emerald-100 rounded-xl p-5 border-2 border-teal-300 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-teal-900">Credenciales de Acceso</h3>
                      <p className="text-xs text-teal-700">Generadas automáticamente</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-teal-900 mb-1.5">
                        Usuario
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={username || 'Se generará automáticamente...'}
                          readOnly
                          className="flex-1 px-3 py-2 bg-white border-2 border-teal-200 rounded-lg text-teal-900 font-mono font-semibold text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (username) {
                              navigator.clipboard.writeText(username);
                              alert('✅ Usuario copiado al portapapeles');
                            }
                          }}
                          disabled={!username}
                          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Copiar
                        </button>
                      </div>
                      <p className="text-xs text-teal-600 mt-1">
                        Fórmula: Número de documento de identidad
                      </p>
                    </div>

                    {/* 🆕 v1.18.0 - REMOVIDO: Campo de contraseña temporal
                        El backend ahora genera automáticamente una contraseña
                        y envía un email con token al usuario para que establezca
                        su propia contraseña. Ver UsuarioServiceImpl.createUser() */}
                  </div>
                </div>
              </div>
            )}

            {/* PESTAÑA: DATOS PROFESIONALES - Solo para personal INTERNO */}
            {selectedTab === 'profesionales' && formData.tipo_personal !== '2' && (
              <div className="space-y-6">
                {/* Información Profesional */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-emerald-600" />
                    Información Profesional
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Completa estos campos solo si el usuario es personal médico/profesional de salud
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Campo Profesión - SIEMPRE VISIBLE */}
                    <div>
                      <label htmlFor="id_profesion" className="block text-sm font-medium text-gray-700 mb-2">
                        Profesión
                      </label>
                      {loadingCatalogos ? (
                        <div className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl bg-gray-50 flex items-center justify-center">
                          <div className="inline-block w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                          <span className="text-sm text-gray-500">Cargando...</span>
                        </div>
                      ) : (
                        <select
                          id="id_profesion"
                          name="id_profesion"
                          value={formData.id_profesion || ''}
                          onChange={(e) => {
                            const newProfId = e.target.value ? parseInt(e.target.value) : null;
                            const profesionSeleccionada = profesiones.find(p => p.idProf === newProfId);
                            const esOtro = profesionSeleccionada?.descProf?.toUpperCase().includes('OTRO');
                            const esMedicina = profesionSeleccionada?.descProf?.toUpperCase().includes('MEDICINA');
                            
                            setFormData(prev => ({ 
                              ...prev, 
                              id_profesion: newProfId,
                              // Limpiar campo de especificación si no es OTRO
                              desc_prof_otro: esOtro ? prev.desc_prof_otro : '',
                              // Limpiar colegiatura si no es medicina
                              colegiatura: esMedicina ? prev.colegiatura : '',
                              // Limpiar campos de especialidad médica si no es medicina
                              tiene_especialidad_medica: esMedicina ? prev.tiene_especialidad_medica : '',
                              id_especialidad: esMedicina ? prev.id_especialidad : null,
                              rne: esMedicina ? prev.rne : ''
                            }));
                          }}
                          className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl transition-all focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        >
                          <option value="">Seleccione una profesión...</option>
                          {profesiones.map(prof => (
                            <option key={prof.idProf} value={prof.idProf}>
                              {prof.descProf}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    {/* Campo ESPECIFICAR PROFESIÓN - Solo visible cuando se selecciona OTRO */}
                    {formData.id_profesion && profesiones.find(p => p.idProf === parseInt(formData.id_profesion))?.descProf?.toUpperCase().includes('OTRO') && (
                      <div>
                        <label htmlFor="desc_prof_otro" className="block text-sm font-medium text-gray-700 mb-2">
                          Especificar Profesión <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="desc_prof_otro"
                          name="desc_prof_otro"
                          type="text"
                          required
                          value={formData.desc_prof_otro}
                          onChange={handleChange}
                          placeholder="Ej: Arquitecto, Contador, Ingeniero Ambiental, etc."
                          className={`w-full px-4 py-2 border-2 rounded-xl transition-all focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                            errors.desc_prof_otro ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.desc_prof_otro && (
                          <p className="text-red-500 text-sm mt-1">{errors.desc_prof_otro}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          ⚠️ Por favor especifique la profesión exacta
                        </p>
                      </div>
                    )}

                    {/* Campo Colegiatura - Obligatorio si es MEDICINA */}
                    {formData.id_profesion && profesiones.find(p => p.idProf === parseInt(formData.id_profesion))?.descProf?.toUpperCase().includes('MEDICINA') ? (
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
                          className={`w-full px-4 py-2 border-2 rounded-xl transition-all focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                            errors.colegiatura ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.colegiatura && (
                          <p className="text-red-500 text-sm mt-1">{errors.colegiatura}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          ⚠️ Campo obligatorio para profesionales de medicina
                        </p>
                      </div>
                    ) : (
                      <FormField
                        label="Colegiatura"
                        name="colegiatura"
                        value={formData.colegiatura}
                        onChange={handleChange}
                        errors={errors}
                        placeholder="Ej: CMP 12345, CEP 56789, CIP 14802, etc."
                      />
                    )}

                    {/* Campo ¿Tiene Especialidad Médica? - Solo visible cuando se selecciona MEDICINA */}
                    {formData.id_profesion && profesiones.find(p => p.idProf === parseInt(formData.id_profesion))?.descProf?.toUpperCase().includes('MEDICINA') && (
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
                              // Limpiar campos si selecciona NO
                              id_especialidad: valor === 'SI' ? prev.id_especialidad : null,
                              rne: valor === 'SI' ? prev.rne : ''
                            }));
                          }}
                          className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl transition-all focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        >
                          <option value="">Seleccione una opción...</option>
                          <option value="SI">Sí</option>
                          <option value="NO">No</option>
                        </select>
                      </div>
                    )}

                    {/* Campos MÉDICOS - Solo visible cuando tiene_especialidad_medica es 'SI' */}
                    {formData.id_profesion && 
                     profesiones.find(p => p.idProf === parseInt(formData.id_profesion))?.descProf?.toUpperCase().includes('MEDICINA') && 
                     formData.tiene_especialidad_medica === 'SI' && (
                      <>
                        <div>
                          <label htmlFor="id_especialidad" className="block text-sm font-medium text-gray-700 mb-2">
                            Especialidad <span className="text-red-500">*</span>
                          </label>
                          {loadingCatalogos ? (
                            <div className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl bg-gray-50 flex items-center justify-center">
                              <div className="inline-block w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                              <span className="text-sm text-gray-500">Cargando...</span>
                            </div>
                          ) : (
                            <select
                              id="id_especialidad"
                              name="id_especialidad"
                              required
                              value={formData.id_especialidad || ''}
                              onChange={(e) => setFormData(prev => ({ ...prev, id_especialidad: e.target.value ? parseInt(e.target.value) : null }))}
                              className={`w-full px-4 py-2 border-2 rounded-xl transition-all focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                                errors.id_especialidad ? 'border-red-500' : 'border-gray-300'
                              }`}
                            >
                              <option value="">Seleccione una especialidad...</option>
                              {especialidades.map(esp => (
                                <option key={esp.idServicio} value={esp.idServicio}>
                                  {esp.descServicio}
                                </option>
                              ))}
                            </select>
                          )}
                          {errors.id_especialidad && (
                            <p className="text-red-500 text-sm mt-1">{errors.id_especialidad}</p>
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
                            className={`w-full px-4 py-2 border-2 rounded-xl transition-all focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                              errors.rne ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                          {errors.rne && (
                            <p className="text-red-500 text-sm mt-1">{errors.rne}</p>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* NUEVA PESTAÑA: DATOS LABORALES - Solo para personal INTERNO */}
            {selectedTab === 'laborales' && formData.tipo_personal !== '2' && (
              <div className="space-y-6">
                {/* Información Laboral */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-emerald-600" />
                    Información Laboral
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="tipo_personal_readonly" className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de Personal <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="tipo_personal_readonly"
                        value={formData.tipo_personal}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl transition-all bg-gray-100 cursor-not-allowed"
                        disabled
                      >
                        {/* Interno => CENATE - Externo => Externo */}
                        <option value="1">CENATE</option>
                        <option value="2">Externo</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Este campo se configuró en la pestaña anterior</p>
                    </div>
                    <div>
                      <label htmlFor="id_tip_pers" className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de Profesional
                      </label>
                      {loadingCatalogos ? (
                        <div className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl bg-gray-50 flex items-center justify-center">
                          <div className="inline-block w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                          <span className="text-sm text-gray-500">Cargando...</span>
                        </div>
                      ) : (
                        <select
                          id="id_tip_pers"
                          name="id_tip_pers"
                          value={formData.id_tip_pers || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, id_tip_pers: e.target.value ? parseInt(e.target.value) : null }))}
                          className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl transition-all focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        >
                          <option value="">Seleccione un tipo...</option>
                          {tiposProfesional.map(tipo => (
                            <option key={tipo.idTipPers || tipo.id_tip_pers} value={tipo.idTipPers || tipo.id_tip_pers}>
                              {tipo.descTipPers || tipo.desc_tip_pers}
                            </option>
                          ))}
                        </select>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        👨‍💼 Especifica el tipo de profesional según la clasificación institucional
                      </p>
                    </div>
                    <div>
                      <label htmlFor="id_regimen_laboral" className="block text-sm font-medium text-gray-700 mb-2">
                        Régimen Laboral
                      </label>
                      {loadingCatalogos ? (
                        <div className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl bg-gray-50 flex items-center justify-center">
                          <div className="inline-block w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                          <span className="text-sm text-gray-500">Cargando...</span>
                        </div>
                      ) : (
                        <select
                          id="id_regimen_laboral"
                          name="id_regimen_laboral"
                          value={formData.id_regimen_laboral || ''}
                          onChange={(e) => {
                            const newRegimenId = e.target.value ? parseInt(e.target.value) : null;
                            const nuevoRegimen = regimenesLaborales.find(r => r.idRegLab === newRegimenId);
                            const requiere = nuevoRegimen?.descRegLab?.toUpperCase().includes('728') || 
                                            nuevoRegimen?.descRegLab?.toUpperCase().includes('CAS');
                            // Limpiar código de planilla si cambia a un régimen que no lo requiere
                            setFormData(prev => ({ 
                              ...prev, 
                              id_regimen_laboral: newRegimenId,
                              codigo_planilla: requiere ? prev.codigo_planilla : ''
                            }));
                          }}
                          className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl transition-all focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        >
                          <option value="">Seleccione un régimen...</option>
                          {regimenesLaborales.map(reg => (
                            <option key={reg.idRegLab} value={reg.idRegLab}>
                              {reg.descRegLab}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

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
                          className={`w-full px-4 py-2 border-2 rounded-xl transition-all focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                            errors.codigo_planilla ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.codigo_planilla && (
                          <p className="text-red-500 text-sm mt-1">{errors.codigo_planilla}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          ⚠️ Campo obligatorio para régimen {regimenSeleccionado?.descRegLab}
                        </p>
                      </div>
                    )}
                    <div>
                      <label htmlFor="id_area" className="block text-sm font-medium text-gray-700 mb-2">
                        Área de Trabajo
                      </label>
                      {loadingCatalogos ? (
                        <div className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl bg-gray-50 flex items-center justify-center">
                          <div className="inline-block w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                          <span className="text-sm text-gray-500">Cargando...</span>
                        </div>
                      ) : (
                        <select
                          id="id_area"
                          name="id_area"
                          value={formData.id_area || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, id_area: e.target.value ? parseInt(e.target.value) : null }))}
                          className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl transition-all focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        >
                          <option value="">Seleccione un área...</option>
                          {areas.map(area => (
                            <option key={area.idArea} value={area.idArea}>
                              {area.descArea}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                    <MonthYearPicker
                      label="Periodo de Ingreso"
                      value={formData.periodo_ingreso}
                      onChange={(value) => setFormData(prev => ({ ...prev, periodo_ingreso: value }))}
                      variant="emerald"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 🆕 v1.14.0 - FIRMA DIGITAL TAB - Solo para personal INTERNO */}
            {selectedTab === 'firma' && formData.tipo_personal !== '2' && (
              <FirmaDigitalTab
                formData={formData}
                setFormData={setFormData}
                errors={errors}
                handleChange={handleChange}
                regimenLaboral={regimenesLaborales.find(r => r.idRegLab === parseInt(formData.id_regimen_laboral))?.descRegLab || ''}
              />
            )}

            {selectedTab === 'roles' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-600" />
                  Roles del Sistema *
                </h3>

                <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-xl mb-4 flex items-center gap-3">
                  <div className="text-2xl">⚠️</div>
                  <div>
                    <p className="font-semibold text-amber-900">Debe seleccionar al menos un rol para continuar</p>
                    <p className="text-sm text-amber-700">Los roles determinan los permisos y accesos del usuario en el sistema</p>
                  </div>
                </div>

                {loadingRoles ? (
                  <div className="text-center py-8">
                    <div className="inline-block w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <p className="text-sm text-gray-500">Cargando roles...</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      {roles.map(role => {
                        const isPrivileged = ['ADMIN', 'SUPERADMIN'].includes(role.nombreRol);
                        const isSuperAdmin = currentUserRoles.includes('SUPERADMIN');
                        const canSelect = !isPrivileged || isSuperAdmin;
                        const isSelected = formData.roles.includes(role.nombreRol);

                        return (
                          <label
                            key={role.idRol}
                            className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                              isSelected
                                ? 'border-emerald-500 bg-emerald-50'
                                : 'border-gray-200 bg-white hover:border-gray-300'
                            } ${!canSelect ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleRoleToggle(role.nombreRol)}
                              disabled={!canSelect}
                              className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
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
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                        <p className="text-sm font-semibold text-blue-700 mb-2">
                          Roles seleccionados ({formData.roles.length}):
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {formData.roles.map(rol => (
                            <span key={rol} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                              {rol}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {errors.roles && (
                      <p className="text-red-500 text-sm mt-2">{errors.roles}</p>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              <span className="text-red-500">*</span> Campos obligatorios
            </div>
            <div className="flex gap-3">
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
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-white rounded-xl transition-all font-medium shadow-lg disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    {selectedTab === 'personal' ? 'Siguiente →' : 
                     selectedTab === 'profesionales' ? 'Siguiente →' :
                     selectedTab === 'laborales' ? 'Siguiente →' :
                     <><Check className="w-4 h-4" /> Crear Usuario</>}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Modal Usuario Existente - Mejorado */}
      {usuarioExistenteModal.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Usuario Ya Registrado</h3>
                  <p className="text-amber-50 text-sm">El usuario ya existe en el sistema</p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {/* Mensaje principal */}
              <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
                <div className="flex gap-3">
                  <svg className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <p className="font-semibold text-amber-900 text-sm mb-1">No se puede crear la cuenta</p>
                    <p className="text-amber-800 text-sm leading-relaxed">
                      Ya existe un usuario registrado con el documento <strong className="font-bold text-amber-900">{usuarioExistenteModal.username}</strong> en el sistema.
                    </p>
                  </div>
                </div>
              </div>

              {/* Información adicional */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-sm font-semibold text-blue-900 mb-1">¿Qué puedes hacer?</p>
                    <p className="text-xs text-blue-800">
                      Este usuario ya existe en el sistema. Puede que no aparezca en la lista si no tiene datos de personal asociados. Busca al usuario por su username (<strong>{usuarioExistenteModal.username}</strong>) en el campo de búsqueda de la página principal para encontrarlo y actualizar su información.
                    </p>
                  </div>
                </div>
              </div>

              {/* Opciones disponibles */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  Acciones recomendadas:
                </p>
                <div className="space-y-2 pl-1">
                  <div className="flex items-start gap-3 p-3.5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border-2 border-blue-200 hover:border-blue-300 transition-all cursor-default">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">1</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-blue-900 mb-1">Buscar y editar el usuario existente</p>
                      <p className="text-xs text-blue-700 leading-relaxed">
                        Localiza al usuario con el documento <strong>{usuarioExistenteModal.username}</strong> en la lista de usuarios y actualiza su información si es necesario
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3.5 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border-2 border-purple-200 hover:border-purple-300 transition-all cursor-default">
                    <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">2</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-purple-900 mb-1">Validar roles y permisos de acceso</p>
                      <p className="text-xs text-purple-700 leading-relaxed">
                        Verifica que el usuario tenga los roles correctos asignados y los permisos necesarios para acceder al sistema
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3.5 bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg border-2 border-teal-200 hover:border-teal-300 transition-all cursor-default">
                    <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">3</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-teal-900 mb-1">Ayudar al usuario a recuperar acceso</p>
                      <p className="text-xs text-teal-700 leading-relaxed">
                        Si el usuario olvidó su contraseña o tiene problemas para ingresar, puedes asistirlo con la recuperación de su cuenta
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex gap-3">
                <button
                  onClick={() => setUsuarioExistenteModal({ open: false, username: '', mensaje: '' })}
                  className="flex-1 px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 rounded-xl transition-all font-medium shadow-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    setUsuarioExistenteModal({ open: false, username: '', mensaje: '' });
                    onClose();
                    // Aquí podrías agregar lógica adicional para buscar automáticamente al usuario
                    // Por ejemplo: onSearchUser(usuarioExistenteModal.username);
                  }}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white rounded-xl transition-all font-semibold shadow-lg flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Buscar Usuario en la Lista
                </button>
              </div>
              <p className="text-xs text-gray-500 text-center mt-3">
                💡 <strong>Tip:</strong> Usa el buscador en la lista de usuarios para encontrar rápidamente al usuario con el documento {usuarioExistenteModal.username}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrearUsuarioModal;
