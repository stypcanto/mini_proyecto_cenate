// src/pages/admin/users/UsersManagement.jsx
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Building } from 'lucide-react';
import api from '../../lib/apiClient';
import TabsNavigation from './components/TabsNavigation';
import FiltersPanel from './components/FiltersPanel';
import UsersTable from './components/UsersTable';
import UsersCards from './components/UsersCards';
import CrearUsuarioModal from './components/common/CrearUsuarioModal';
import ActualizarModel from './components/common/ActualizarModel';
import VerDetalleModal from './components/common/VerDetalleModal';
import ConfirmDeleteModal from './components/common/ConfirmDeleteModal';
import PaginationControls from './components/PaginationControls';
import { useToast } from '../../components/ui/Toast';
import AreasCRUD from '../admin/components/AreasCRUD';
import RegimenesCRUD from '../admin/components/RegimenesCRUD';
import ProfesionesCRUD from '../admin/components/ProfesionesCRUD';
import EspecialidadesCRUD from '../admin/components/EspecialidadesCRUD';
import RolesCRUD from '../admin/components/RolesCRUD';
import TipoProfesionalCRUD from '../admin/components/TipoProfesionalCRUD';
import EstrategiasInstitucionales from '../admin/catalogs/EstrategiasInstitucionales';
import TiposAtencionTelemedicina from '../admin/catalogs/TiposAtencionTelemedicina';
import Procedimientos from '../admin/catalogs/Procedimientos';
import CIE10 from '../admin/catalogs/CIE10';
import Medicamentos from '../admin/catalogs/Medicamentos';
import TiposBolsas from '../admin/catalogs/TiposBolsas';
import EstadosGestionCitas from '../admin/catalogs/EstadosGestionCitas';
import MotivosMesaAyuda from '../admin/catalogs/MotivosMesaAyuda';
import RespuestasMesaAyuda from '../admin/catalogs/RespuestasMesaAyuda';
import MotivosInterconsulta from '../admin/catalogs/MotivosInterconsulta';
import MotivosBajaCenacron from '../admin/catalogs/MotivosBajaCenacron';
import { areaService } from '../../services/areaService';
import { regimenService } from '../../services/regimenService';

// ============================================================
// 🔧 FUNCIÓN: Convierte texto a Title Case (primera letra mayúscula, resto minúscula)
// Ej: "ERICK TEST TEST" → "Erick Test Test"
// ============================================================
const toTitleCase = (str) => {
  if (!str) return str;
  return str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
};

// ============================================================
// 🔧 FUNCIONES AUXILIARES PARA TIPO DE PERSONAL
// ============================================================
const getTipoPersonal = (user) => {
  // La lógica real es basada en el IPRESS donde trabaja
  // INTERNO = trabaja en CENATE (id_ipress === 2)
  // EXTERNO = trabaja en cualquier otro IPRESS
  const idIpress = user.id_ipress || user.idIpress;
  const nombreIpress = user.nombre_ipress || '';

  if (idIpress === 2 || nombreIpress.includes('CENTRO NACIONAL DE TELEMEDICINA')) {
    return 'INTERNO';
  } else if (idIpress && idIpress !== 2) {
    return 'EXTERNO';
  }

  // Fallback: revisar el campo tipo_personal si existe
  return String(
    user.descOrigen ||
    user.desc_origen ||
    user.tipo_personal ||
    user.tipoPersonal ||
    ''
  ).toUpperCase().trim();
};

const esInterno = (user) => {
  const tipo = getTipoPersonal(user);
  return tipo === 'INTERNO';
};

const esExterno = (user) => {
  const tipo = getTipoPersonal(user);
  return tipo === 'EXTERNO';
};

const UsersManagement = () => {
  // Ref para controlar si los datos de filtros ya fueron cargados
  const filterDataLoadedRef = useRef(false);

  const [activeTab, setActiveTab] = useState('usuarios');
  const [viewMode, setViewMode] = useState('table');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🚀 Estados de paginación
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(27); // Tamaño fijo de página: 27 usuarios por página
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [sortBy, setSortBy] = useState('idPers');
  const [sortDirection, setSortDirection] = useState('asc');

  const [filters, setFilters] = useState({
    rol: '',
    institucion: '',
    estado: '',
    mesCumpleanos: '',
    area: '',
    red: '',          // 🆕 Filtro de RED Asistencial
    ipress: '',
    regimen: '',      // 🆕 Filtro de Régimen Laboral
    profesion: '',    // 🆕 Filtro de Profesión
    especialidad: '', // 🆕 Filtro de Especialidad
    fechaRegistroDesde: '',
    fechaRegistroHasta: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  const [showCrearUsuarioModal, setShowCrearUsuarioModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // 🆕 Estado para selección múltiple
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [areas, setAreas] = useState([]);
  const [regimenes, setRegimenes] = useState([]);        // 🆕 Lista de regímenes
  const [allUsersForFilters, setAllUsersForFilters] = useState([]); // 🆕 Todos los usuarios para generar dropdowns

  // 🆕 Toast para notificaciones
  const { showToast, ToastComponent } = useToast();

  // 🚀 Debounce del searchTerm (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // 🚀 Refs para mantener valores actuales sin causar recargas
  const filtersRef = useRef(filters);
  const searchTermRef = useRef(debouncedSearchTerm);

  useEffect(() => {
    filtersRef.current = filters;
    searchTermRef.current = debouncedSearchTerm;
  }, [filters, debouncedSearchTerm]);

  // ============================================================
  // 🔧 FUNCIÓN AUXILIAR: Generar lista de REDES de usuarios filtrados
  // ============================================================
  const getRedesListFromUsers = useCallback((usersList) => {
    const redesMap = new Map();

    usersList.forEach(user => {
      const nombreRed = user.nombre_red;
      const idRed = user.id_red;

      // Solo agregar si tiene nombre de RED válido
      if (nombreRed && nombreRed.trim() !== '') {
        if (!redesMap.has(nombreRed)) {
          redesMap.set(nombreRed, {
            id_red: idRed,
            nombre_red: nombreRed
          });
        }
      }
    });

    // Convertir a array y ordenar alfabéticamente
    return Array.from(redesMap.values()).sort((a, b) => {
      const nameA = (a.nombre_red || '').toUpperCase();
      const nameB = (b.nombre_red || '').toUpperCase();
      return nameA.localeCompare(nameB);
    });
  }, []);

  // ============================================================
  // 🔧 FUNCIÓN AUXILIAR: Generar lista de IPRESS de usuarios filtrados
  // ============================================================
  const getIpressListFromUsers = useCallback((usersList) => {
    const ipressMap = new Map();

    usersList.forEach(user => {
      const nombreIpress = user.nombre_ipress || user.descIpress;
      const idIpress = user.id_ipress || user.idIpress;

      // Solo agregar si tiene nombre de IPRESS válido
      if (nombreIpress && nombreIpress.trim() !== '') {
        if (!ipressMap.has(nombreIpress)) {
          ipressMap.set(nombreIpress, {
            id_ipress: idIpress,
            desc_ipress: nombreIpress,
            idIpress: idIpress,
            descIpress: nombreIpress
          });
        }
      }
    });

    // Convertir a array y ordenar alfabéticamente
    return Array.from(ipressMap.values()).sort((a, b) => {
      const nameA = (a.desc_ipress || a.descIpress || '').toUpperCase();
      const nameB = (b.desc_ipress || b.descIpress || '').toUpperCase();
      return nameA.localeCompare(nameB);
    });
  }, []);

  // ============================================================
  // 🔧 FUNCIÓN AUXILIAR: Generar lista de PROFESIONES de usuarios filtrados
  // ============================================================
  const getProfesionesListFromUsers = useCallback((usersList) => {
    const profesionesMap = new Map();

    usersList.forEach(user => {
      // 🔍 Usar los campos correctos del backend: nombre_profesion o profesion_principal
      const nombreProfesion = user.nombre_profesion || user.profesion_principal || user.nombreProfesion || user.profesionPrincipal;
      const idProfesion = user.id_profesion || user.idProfesion;

      // Solo agregar si tiene nombre de profesión válido
      if (nombreProfesion && nombreProfesion.trim() !== '') {
        if (!profesionesMap.has(nombreProfesion)) {
          profesionesMap.set(nombreProfesion, {
            id_profesion: idProfesion,
            nombre_profesion: nombreProfesion,
            idProfesion: idProfesion,
            nombreProfesion: nombreProfesion
          });
        }
      }
    });

    // Convertir a array y ordenar alfabéticamente
    return Array.from(profesionesMap.values()).sort((a, b) => {
      const nameA = (a.nombre_profesion || a.nombreProfesion || '').toUpperCase();
      const nameB = (b.nombre_profesion || b.nombreProfesion || '').toUpperCase();
      return nameA.localeCompare(nameB);
    });
  }, []);

  // ============================================================
  // 🔧 FUNCIÓN AUXILIAR: Generar lista de ESPECIALIDADES de usuarios filtrados
  // ============================================================
  const getEspecialidadesListFromUsers = useCallback((usersList) => {
    const especialidadesMap = new Map();

    usersList.forEach(user => {
      // 🔍 Usar los campos correctos del backend: nombre_especialidad
      const nombreEspecialidad = user.nombre_especialidad || user.nombreEspecialidad;
      const idEspecialidad = user.id_especialidad || user.idEspecialidad;

      // Solo agregar si tiene nombre de especialidad válido
      if (nombreEspecialidad && nombreEspecialidad.trim() !== '') {
        if (!especialidadesMap.has(nombreEspecialidad)) {
          especialidadesMap.set(nombreEspecialidad, {
            id_especialidad: idEspecialidad,
            nombre_especialidad: nombreEspecialidad,
            idEspecialidad: idEspecialidad,
            nombreEspecialidad: nombreEspecialidad
          });
        }
      }
    });

    // Convertir a array y ordenar alfabéticamente
    return Array.from(especialidadesMap.values()).sort((a, b) => {
      const nameA = (a.nombre_especialidad || a.nombreEspecialidad || '').toUpperCase();
      const nameB = (b.nombre_especialidad || b.nombreEspecialidad || '').toUpperCase();
      return nameA.localeCompare(nameB);
    });
  }, []);

  // ============================================================
  // 🚀 LISTA DE REDES: Dinámica según filtros activos (SIN filtro de RED ni IPRESS)
  // ============================================================
  const redesList = useMemo(() => {
    const baseUsers = allUsersForFilters.length > 0 ? allUsersForFilters : users;

    // Aplicar TODOS los filtros EXCEPTO el filtro de RED e IPRESS
    let usuariosParaRedes = [...baseUsers];

    // Aplicar filtros de rol, tipo, estado, mes, área, fechas...
    if (filters.rol && filters.rol !== '') {
      usuariosParaRedes = usuariosParaRedes.filter(user => {
        if (!user.roles || !Array.isArray(user.roles)) return false;
        return user.roles.some(rol => rol === filters.rol);
      });
    }

    if (filters.institucion && filters.institucion !== '') {
      usuariosParaRedes = usuariosParaRedes.filter(user => {
        const idIpress = user.id_ipress || user.idIpress;
        const nombreIpress = (user.nombre_ipress || user.descIpress || '').toUpperCase();

        if (filters.institucion === 'Interno') {
          return idIpress === 2 || nombreIpress.includes('CENTRO NACIONAL DE TELEMEDICINA');
        } else if (filters.institucion === 'Externo') {
          return idIpress && idIpress !== 2 && !nombreIpress.includes('CENTRO NACIONAL DE TELEMEDICINA');
        }
        return true;
      });
    }

    if (filters.estado && filters.estado !== '') {
      usuariosParaRedes = usuariosParaRedes.filter(user => {
        const estadoUsuario = user.estado_usuario || user.statPers || '';
        return estadoUsuario.toUpperCase() === filters.estado.toUpperCase();
      });
    }

    if (filters.area && filters.area !== '') {
      usuariosParaRedes = usuariosParaRedes.filter(user => {
        const areaUsuario = user.nombre_area || user.nombreArea || user.desc_area || user.descArea || user.area_trabajo || user.areaTrabajo || user.area || '';
        return areaUsuario.toUpperCase().includes(filters.area.toUpperCase());
      });
    }

    // Generar lista de REDES de los usuarios filtrados
    return getRedesListFromUsers(usuariosParaRedes);
  }, [allUsersForFilters, users, filters.rol, filters.institucion, filters.estado, filters.area, getRedesListFromUsers]);

  // ============================================================
  // 🚀 LISTA DE PROFESIONES: Dinámica según filtros activos (SIN filtro de PROFESIÓN)
  // ============================================================
  const profesionesList = useMemo(() => {
    const baseUsers = allUsersForFilters.length > 0 ? allUsersForFilters : users;

    // Aplicar TODOS los filtros EXCEPTO el filtro de PROFESIÓN
    let usuariosParaProfesiones = [...baseUsers];

    // Aplicar filtros de rol, tipo, estado, mes, área, red, ipress, regimen, especialidad...
    if (filters.rol && filters.rol !== '') {
      usuariosParaProfesiones = usuariosParaProfesiones.filter(user => {
        if (!user.roles || !Array.isArray(user.roles)) return false;
        return user.roles.some(rol => rol === filters.rol);
      });
    }

    if (filters.institucion && filters.institucion !== '') {
      usuariosParaProfesiones = usuariosParaProfesiones.filter(user => {
        const idIpress = user.id_ipress || user.idIpress;
        const nombreIpress = (user.nombre_ipress || user.descIpress || '').toUpperCase();

        if (filters.institucion === 'Interno') {
          return idIpress === 2 || nombreIpress.includes('CENTRO NACIONAL DE TELEMEDICINA');
        } else if (filters.institucion === 'Externo') {
          return idIpress && idIpress !== 2 && !nombreIpress.includes('CENTRO NACIONAL DE TELEMEDICINA');
        }
        return true;
      });
    }

    if (filters.estado && filters.estado !== '') {
      usuariosParaProfesiones = usuariosParaProfesiones.filter(user => {
        const estadoUsuario = user.estado_usuario || user.statPers || '';
        return estadoUsuario.toUpperCase() === filters.estado.toUpperCase();
      });
    }

    if (filters.area && filters.area !== '') {
      usuariosParaProfesiones = usuariosParaProfesiones.filter(user => {
        const areaUsuario = user.nombre_area || user.nombreArea || user.desc_area || user.descArea || user.area_trabajo || user.areaTrabajo || user.area || '';
        return areaUsuario.toUpperCase().includes(filters.area.toUpperCase());
      });
    }

    if (filters.red && filters.red !== '') {
      usuariosParaProfesiones = usuariosParaProfesiones.filter(user => {
        const nombreRed = user.nombre_red || '';
        return nombreRed.toUpperCase() === filters.red.toUpperCase();
      });
    }

    if (filters.ipress && filters.ipress !== '') {
      usuariosParaProfesiones = usuariosParaProfesiones.filter(user => {
        const nombreIpress = user.nombre_ipress || user.descIpress || '';
        return nombreIpress.toUpperCase() === filters.ipress.toUpperCase();
      });
    }

    if (filters.regimen && filters.regimen !== '') {
      usuariosParaProfesiones = usuariosParaProfesiones.filter(user => {
        const regimenUsuario = user.regimen_laboral || user.desc_regimen_laboral || user.descRegLab || '';
        return regimenUsuario.toUpperCase().includes(filters.regimen.toUpperCase());
      });
    }

    if (filters.especialidad && filters.especialidad !== '') {
      usuariosParaProfesiones = usuariosParaProfesiones.filter(user => {
        const especialidadUsuario = user.nombre_especialidad || user.nombreEspecialidad || '';
        return especialidadUsuario.toUpperCase().includes(filters.especialidad.toUpperCase());
      });
    }

    // Generar lista de PROFESIONES de los usuarios filtrados
    return getProfesionesListFromUsers(usuariosParaProfesiones);
  }, [allUsersForFilters, users, filters.rol, filters.institucion, filters.estado, filters.area, filters.red, filters.ipress, filters.regimen, filters.especialidad, getProfesionesListFromUsers]);

  // ============================================================
  // 🚀 LISTA DE ESPECIALIDADES: Dinámica según filtros activos (SIN filtro de ESPECIALIDAD)
  // ============================================================
  const especialidadesList = useMemo(() => {
    const baseUsers = allUsersForFilters.length > 0 ? allUsersForFilters : users;

    // Aplicar TODOS los filtros EXCEPTO el filtro de ESPECIALIDAD
    let usuariosParaEspecialidades = [...baseUsers];

    // Aplicar filtros de rol, tipo, estado, mes, área, red, ipress, regimen, profesion...
    if (filters.rol && filters.rol !== '') {
      usuariosParaEspecialidades = usuariosParaEspecialidades.filter(user => {
        if (!user.roles || !Array.isArray(user.roles)) return false;
        return user.roles.some(rol => rol === filters.rol);
      });
    }

    if (filters.institucion && filters.institucion !== '') {
      usuariosParaEspecialidades = usuariosParaEspecialidades.filter(user => {
        const idIpress = user.id_ipress || user.idIpress;
        const nombreIpress = (user.nombre_ipress || user.descIpress || '').toUpperCase();

        if (filters.institucion === 'Interno') {
          return idIpress === 2 || nombreIpress.includes('CENTRO NACIONAL DE TELEMEDICINA');
        } else if (filters.institucion === 'Externo') {
          return idIpress && idIpress !== 2 && !nombreIpress.includes('CENTRO NACIONAL DE TELEMEDICINA');
        }
        return true;
      });
    }

    if (filters.estado && filters.estado !== '') {
      usuariosParaEspecialidades = usuariosParaEspecialidades.filter(user => {
        const estadoUsuario = user.estado_usuario || user.statPers || '';
        return estadoUsuario.toUpperCase() === filters.estado.toUpperCase();
      });
    }

    if (filters.area && filters.area !== '') {
      usuariosParaEspecialidades = usuariosParaEspecialidades.filter(user => {
        const areaUsuario = user.nombre_area || user.nombreArea || user.desc_area || user.descArea || user.area_trabajo || user.areaTrabajo || user.area || '';
        return areaUsuario.toUpperCase().includes(filters.area.toUpperCase());
      });
    }

    if (filters.red && filters.red !== '') {
      usuariosParaEspecialidades = usuariosParaEspecialidades.filter(user => {
        const nombreRed = user.nombre_red || '';
        return nombreRed.toUpperCase() === filters.red.toUpperCase();
      });
    }

    if (filters.ipress && filters.ipress !== '') {
      usuariosParaEspecialidades = usuariosParaEspecialidades.filter(user => {
        const nombreIpress = user.nombre_ipress || user.descIpress || '';
        return nombreIpress.toUpperCase() === filters.ipress.toUpperCase();
      });
    }

    if (filters.regimen && filters.regimen !== '') {
      usuariosParaEspecialidades = usuariosParaEspecialidades.filter(user => {
        const regimenUsuario = user.regimen_laboral || user.desc_regimen_laboral || user.descRegLab || '';
        return regimenUsuario.toUpperCase().includes(filters.regimen.toUpperCase());
      });
    }

    if (filters.profesion && filters.profesion !== '') {
      usuariosParaEspecialidades = usuariosParaEspecialidades.filter(user => {
        const profesionUsuario = user.nombre_profesion || user.profesion_principal || user.nombreProfesion || user.profesionPrincipal || '';
        return profesionUsuario.toUpperCase().includes(filters.profesion.toUpperCase());
      });
    }

    // Generar lista de ESPECIALIDADES de los usuarios filtrados
    return getEspecialidadesListFromUsers(usuariosParaEspecialidades);
  }, [allUsersForFilters, users, filters.rol, filters.institucion, filters.estado, filters.area, filters.red, filters.ipress, filters.regimen, filters.profesion, getEspecialidadesListFromUsers]);

  // ============================================================
  // 🚀 LISTA DE IPRESS: Dinámica según filtros activos (SIN filtro de IPRESS, pero CON filtro de RED)
  // ============================================================
  const ipressList = useMemo(() => {
    // 🔧 Usar allUsersForFilters si está disponible, si no, usar users
    const baseUsers = allUsersForFilters.length > 0 ? allUsersForFilters : users;

    // Aplicar TODOS los filtros EXCEPTO el filtro de IPRESS
    let usuariosParaIpress = [...baseUsers];

    // 🔍 Filtro por Rol
    if (filters.rol && filters.rol !== '') {
      usuariosParaIpress = usuariosParaIpress.filter(user => {
        if (!user.roles || !Array.isArray(user.roles)) return false;
        return user.roles.some(rol => rol === filters.rol);
      });
    }

    // 🔍 Filtro por Tipo de Personal (Interno/Externo)
    if (filters.institucion && filters.institucion !== '') {
      usuariosParaIpress = usuariosParaIpress.filter(user => {
        const idIpress = user.id_ipress || user.idIpress;
        const nombreIpress = (user.nombre_ipress || user.descIpress || '').toUpperCase();

        if (filters.institucion === 'Interno') {
          return idIpress === 2 || nombreIpress.includes('CENTRO NACIONAL DE TELEMEDICINA');
        } else if (filters.institucion === 'Externo') {
          return idIpress && idIpress !== 2 && !nombreIpress.includes('CENTRO NACIONAL DE TELEMEDICINA');
        }
        return true;
      });
    }

    // 🔍 Filtro por Estado
    if (filters.estado && filters.estado !== '') {
      usuariosParaIpress = usuariosParaIpress.filter(user => {
        const estadoUsuario = user.estado_usuario || user.statPers || '';
        return estadoUsuario.toUpperCase() === filters.estado.toUpperCase();
      });
    }

    // 🔍 Filtro por Mes de Cumpleaños
    if (filters.mesCumpleanos && filters.mesCumpleanos !== '') {
      const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      const mesIndex = meses.indexOf(filters.mesCumpleanos);

      if (mesIndex !== -1) {
        usuariosParaIpress = usuariosParaIpress.filter(user => {
          const fechaNacimiento = user.fecha_nacimiento || user.fech_naci_pers;
          if (!fechaNacimiento) return false;

          try {
            let month;
            if (typeof fechaNacimiento === 'string') {
              const parts = fechaNacimiento.split('T')[0].split('-');
              if (parts.length >= 2) {
                month = parseInt(parts[1], 10) - 1;
              }
            } else if (Array.isArray(fechaNacimiento)) {
              month = fechaNacimiento[1] - 1;
            }

            if (month === undefined || isNaN(month)) return false;
            return month === mesIndex;
          } catch (e) {
            return false;
          }
        });
      }
    }

    // 🔍 Filtro por Área
    if (filters.area && filters.area !== '') {
      usuariosParaIpress = usuariosParaIpress.filter(user => {
        const areaUsuario = user.nombre_area || user.nombreArea || user.desc_area || user.descArea || user.area_trabajo || user.areaTrabajo || user.area || '';
        return areaUsuario.toUpperCase().includes(filters.area.toUpperCase());
      });
    }

    // 🔍 Filtro por RED Asistencial (🆕 NUEVO - Filtro en cascada)
    if (filters.red && filters.red !== '') {
      usuariosParaIpress = usuariosParaIpress.filter(user => {
        const nombreRed = user.nombre_red || '';
        return nombreRed.toUpperCase() === filters.red.toUpperCase();
      });
    }

    // 🔍 Filtro por Fecha de Registro (Desde)
    if (filters.fechaRegistroDesde && filters.fechaRegistroDesde !== '') {
      const fechaDesde = new Date(filters.fechaRegistroDesde);
      fechaDesde.setHours(0, 0, 0, 0);
      usuariosParaIpress = usuariosParaIpress.filter(user => {
        const fechaRegistro = user.create_at || user.created_at || user.createdAt || user.fecha_registro;
        if (!fechaRegistro) return false;

        try {
          let fechaUsuario;
          if (typeof fechaRegistro === 'string') {
            fechaUsuario = new Date(fechaRegistro);
          } else if (Array.isArray(fechaRegistro)) {
            fechaUsuario = new Date(fechaRegistro[0], fechaRegistro[1] - 1, fechaRegistro[2]);
          } else {
            return false;
          }

          if (isNaN(fechaUsuario.getTime())) {
            return false;
          }

          fechaUsuario.setHours(0, 0, 0, 0);
          return fechaUsuario >= fechaDesde;
        } catch (e) {
          return false;
        }
      });
    }

    // 🔍 Filtro por Fecha de Registro (Hasta)
    if (filters.fechaRegistroHasta && filters.fechaRegistroHasta !== '') {
      const fechaHasta = new Date(filters.fechaRegistroHasta);
      fechaHasta.setHours(23, 59, 59, 999);
      usuariosParaIpress = usuariosParaIpress.filter(user => {
        const fechaRegistro = user.create_at || user.created_at || user.createdAt || user.fecha_registro;
        if (!fechaRegistro) return false;

        try {
          let fechaUsuario;
          if (typeof fechaRegistro === 'string') {
            fechaUsuario = new Date(fechaRegistro);
          } else if (Array.isArray(fechaRegistro)) {
            fechaUsuario = new Date(fechaRegistro[0], fechaRegistro[1] - 1, fechaRegistro[2]);
          } else {
            return false;
          }

          if (isNaN(fechaUsuario.getTime())) {
            return false;
          }

          return fechaUsuario <= fechaHasta;
        } catch (e) {
          return false;
        }
      });
    }

    // Generar lista de IPRESS de los usuarios filtrados
    return getIpressListFromUsers(usuariosParaIpress);
  }, [allUsersForFilters, users, filters.rol, filters.institucion, filters.estado, filters.mesCumpleanos, filters.area, filters.red, filters.fechaRegistroDesde, filters.fechaRegistroHasta, getIpressListFromUsers]);

  // ============================================================
  // 🔧 FUNCIÓN AUXILIAR: Aplicar filtros a una lista de usuarios
  // ============================================================
  const applyFilters = useCallback((usersList) => {
    console.log('🔍 applyFilters - Usuarios recibidos:', usersList.length);
    console.log('🔍 applyFilters - Filtros activos:', filters);

    // DEBUG: Mostrar IPRESS de los primeros 5 usuarios
    if (usersList.length > 0) {
      console.log('📊 Primeros 5 usuarios con IPRESS:', usersList.slice(0, 5).map(u => ({
        usuario: u.username,
        nombre_ipress: u.nombre_ipress,
        descIpress: u.descIpress,
        id_ipress: u.id_ipress || u.idIpress
      })));
    }

    let filtered = [...usersList];

    // 🔍 Filtro por Rol
    if (filters.rol && filters.rol !== '') {
      filtered = filtered.filter(user => {
        if (!user.roles || !Array.isArray(user.roles)) return false;
        return user.roles.some(rol => rol === filters.rol);
      });
    }

    // 🔍 Filtro por Tipo de Personal (Interno/Externo)
    if (filters.institucion && filters.institucion !== '') {
      filtered = filtered.filter(user => {
        const idIpress = user.id_ipress || user.idIpress;
        const nombreIpress = (user.nombre_ipress || user.descIpress || '').toUpperCase();

        if (filters.institucion === 'Interno') {
          return idIpress === 2 || nombreIpress.includes('CENTRO NACIONAL DE TELEMEDICINA');
        } else if (filters.institucion === 'Externo') {
          return idIpress && idIpress !== 2 && !nombreIpress.includes('CENTRO NACIONAL DE TELEMEDICINA');
        }
        return true;
      });
    }

    // 🔍 Filtro por Estado
    if (filters.estado && filters.estado !== '') {
      filtered = filtered.filter(user => {
        const estadoUsuario = user.estado_usuario || user.statPers || '';
        return estadoUsuario.toUpperCase() === filters.estado.toUpperCase();
      });
    }

    // 🔍 Filtro por Mes de Cumpleaños
    if (filters.mesCumpleanos && filters.mesCumpleanos !== '') {
      const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      const mesIndex = meses.indexOf(filters.mesCumpleanos);

      if (mesIndex !== -1) {
        filtered = filtered.filter(user => {
          const fechaNacimiento = user.fecha_nacimiento || user.fech_naci_pers;
          if (!fechaNacimiento) return false;

          try {
            let month;
            if (typeof fechaNacimiento === 'string') {
              // Extraer el mes directamente del string para evitar problemas de zona horaria
              const parts = fechaNacimiento.split('T')[0].split('-');
              if (parts.length >= 2) {
                month = parseInt(parts[1], 10) - 1; // Mes es 0-indexado
              }
            } else if (Array.isArray(fechaNacimiento)) {
              month = fechaNacimiento[1] - 1; // Mes es 0-indexado
            }

            if (month === undefined || isNaN(month)) return false;
            return month === mesIndex;
          } catch (e) {
            return false;
          }
        });
      }
    }

    // 🔍 Filtro por Área
    if (filters.area && filters.area !== '') {
      filtered = filtered.filter(user => {
        const areaUsuario = user.nombre_area || user.nombreArea || user.desc_area || user.descArea || user.area_trabajo || user.areaTrabajo || user.area || '';
        return areaUsuario.toUpperCase().includes(filters.area.toUpperCase());
      });
    }

    // 🔍 Filtro por Régimen Laboral
    if (filters.regimen && filters.regimen !== '') {
      filtered = filtered.filter(user => {
        const regimenUsuario = user.regimen_laboral || user.desc_regimen_laboral || user.descRegLab || '';
        return regimenUsuario.toUpperCase().includes(filters.regimen.toUpperCase());
      });
    }

    // 🔍 Filtro por Profesión
    if (filters.profesion && filters.profesion !== '') {
      filtered = filtered.filter(user => {
        const profesionUsuario = user.nombre_profesion || user.profesion_principal || user.nombreProfesion || user.profesionPrincipal || '';
        return profesionUsuario.toUpperCase().includes(filters.profesion.toUpperCase());
      });
    }

    // 🔍 Filtro por Especialidad
    if (filters.especialidad && filters.especialidad !== '') {
      filtered = filtered.filter(user => {
        const especialidadUsuario = user.nombre_especialidad || user.nombreEspecialidad || '';
        return especialidadUsuario.toUpperCase().includes(filters.especialidad.toUpperCase());
      });
    }

    // 🔍 Filtro por RED Asistencial
    if (filters.red && filters.red !== '') {
      filtered = filtered.filter(user => {
        const nombreRed = user.nombre_red || '';
        return nombreRed.toUpperCase() === filters.red.toUpperCase();
      });
    }

    // 🔍 Filtro por IPRESS
    if (filters.ipress && filters.ipress !== '') {
      console.log('🔍 Filtro IPRESS activo:', filters.ipress);
      console.log('🔍 Total usuarios antes de filtrar:', filtered.length);

      // Mostrar las primeras 10 IPRESS únicas de los usuarios
      const ipressEncontradas = [...new Set(filtered.map(u => u.nombre_ipress || u.descIpress).filter(Boolean))];
      console.log('🔍 IPRESS únicas encontradas en usuarios:', ipressEncontradas);

      filtered = filtered.filter(user => {
        const nombreIpress = user.nombre_ipress || user.descIpress || '';
        // Normalizar: eliminar espacios extras y comparar en mayúsculas
        const ipressNormalizada = nombreIpress.trim().toUpperCase().replace(/\s+/g, ' ');
        const filtroNormalizado = filters.ipress.trim().toUpperCase().replace(/\s+/g, ' ');
        const match = ipressNormalizada === filtroNormalizado;

        if (!match && nombreIpress) {
          console.log('❌ No coincide:', {
            usuario: user.username,
            nombreCompleto: user.nombre_completo,
            ipressUsuario: `"${nombreIpress}"`,
            ipressNormalizada: `"${ipressNormalizada}"`,
            ipressFiltro: `"${filters.ipress}"`,
            filtroNormalizado: `"${filtroNormalizado}"`,
            estadoUsuario: user.estado_usuario || user.statPers
          });
        }
        return match;
      });
      console.log('✅ Usuarios después de filtrar por IPRESS:', filtered.length);
    }

    // 🔍 Filtro por Fecha de Registro (Desde)
    if (filters.fechaRegistroDesde && filters.fechaRegistroDesde !== '') {
      const fechaDesde = new Date(filters.fechaRegistroDesde);
      fechaDesde.setHours(0, 0, 0, 0);
      filtered = filtered.filter(user => {
        // Intentar con todos los posibles nombres de campo de fecha
        const fechaRegistro = user.create_at || user.created_at || user.createdAt || user.fecha_registro;
        if (!fechaRegistro) return false;

        try {
          let fechaUsuario;
          if (typeof fechaRegistro === 'string') {
            fechaUsuario = new Date(fechaRegistro);
          } else if (Array.isArray(fechaRegistro)) {
            // Backend puede enviar como array [year, month, day, hour, minute, second]
            fechaUsuario = new Date(fechaRegistro[0], fechaRegistro[1] - 1, fechaRegistro[2]);
          } else {
            return false;
          }

          // Validar que la fecha sea válida
          if (isNaN(fechaUsuario.getTime())) {
            return false;
          }

          fechaUsuario.setHours(0, 0, 0, 0);
          return fechaUsuario >= fechaDesde;
        } catch (e) {
          return false;
        }
      });
    }

    // 🔍 Filtro por Fecha de Registro (Hasta)
    if (filters.fechaRegistroHasta && filters.fechaRegistroHasta !== '') {
      const fechaHasta = new Date(filters.fechaRegistroHasta);
      fechaHasta.setHours(23, 59, 59, 999);
      filtered = filtered.filter(user => {
        // Intentar con todos los posibles nombres de campo de fecha
        const fechaRegistro = user.create_at || user.created_at || user.createdAt || user.fecha_registro;
        if (!fechaRegistro) return false;

        try {
          let fechaUsuario;
          if (typeof fechaRegistro === 'string') {
            fechaUsuario = new Date(fechaRegistro);
          } else if (Array.isArray(fechaRegistro)) {
            // Backend puede enviar como array [year, month, day, hour, minute, second]
            fechaUsuario = new Date(fechaRegistro[0], fechaRegistro[1] - 1, fechaRegistro[2]);
          } else {
            return false;
          }

          // Validar que la fecha sea válida
          if (isNaN(fechaUsuario.getTime())) {
            return false;
          }

          return fechaUsuario <= fechaHasta;
        } catch (e) {
          return false;
        }
      });
    }

    return filtered;
  }, [filters]);

  // ============================================================
  // 🔍 FILTRADO: Aplicar filtros a los usuarios
  // ============================================================
  const filteredUsers = useMemo(() => {
    // Aplicar filtros
    return applyFilters(users);
  }, [users, applyFilters]);

  // ============================================================
  // 🚀 PAGINACIÓN SERVER-SIDE: Los datos ya vienen paginados y filtrados del servidor
  // ============================================================
  const paginatedUsers = useMemo(() => {
    // El backend ya paginó y filtró — simplemente devolver los usuarios actuales
    return filteredUsers;
  }, [filteredUsers]);

  // ============================================================
  // 🔄 CARGA DE USUARIOS Y ROLES (PAGINADO)
  // ============================================================
  const loadUsers = useCallback(async (forceReload = false) => {
    try {
      setLoading(true);
      setError(null);

      // 🔍 Usar valores actuales de los filtros desde las refs
      const currentFilters = filtersRef.current;

      // 🚀 FILTROS SERVER-SIDE: El backend filtra y pagina — sin cargas masivas
      const params = new URLSearchParams({
        page: currentPage.toString(),
        size: pageSize.toString(),
        sortBy: sortBy,
        direction: sortDirection
      });

      // Agregar búsqueda por DNI / CE
      const currentSearch = searchTermRef.current;
      if (currentSearch && currentSearch.trim()) params.append('busqueda', currentSearch.trim());

      // Agregar filtros opcionales (el backend los aplica en la BD)
      if (currentFilters.rol) params.append('rol', currentFilters.rol);
      if (currentFilters.estado) params.append('estado', currentFilters.estado);
      if (currentFilters.area) params.append('area', currentFilters.area);
      if (currentFilters.ipress) params.append('ipress', currentFilters.ipress);
      if (currentFilters.red) params.append('red', currentFilters.red);
      if (currentFilters.regimen) params.append('regimen', currentFilters.regimen);
      if (currentFilters.profesion) params.append('profesion', currentFilters.profesion);
      if (currentFilters.especialidad) params.append('especialidad', currentFilters.especialidad);
      if (currentFilters.institucion) params.append('institucion', currentFilters.institucion);
      if (currentFilters.mesCumpleanos) params.append('mesCumpleanos', currentFilters.mesCumpleanos);
      if (currentFilters.fechaRegistroDesde) params.append('fechaRegistroDesde', currentFilters.fechaRegistroDesde);
      if (currentFilters.fechaRegistroHasta) params.append('fechaRegistroHasta', currentFilters.fechaRegistroHasta);

      console.log('🔄 Cargando usuarios (server-side) - Página:', currentPage, 'Tamaño:', pageSize, 'Params:', params.toString());

      const usersResponse = await api.get(`/usuarios/all-personal?${params.toString()}`, true);

      console.log('📥 Respuesta del servidor (usuarios):', usersResponse);

      // 🔍 DEBUG: Verificar estructura de la respuesta
      if (!usersResponse) {
        console.error('❌ La respuesta de usuarios está vacía o es null');
        setUsers([]);
        setTotalElements(0);
        setTotalPages(0);
        return;
      }

      // Extraer datos paginados - puede venir como objeto con content o como array directo
      let usersData = [];
      let total = 0;
      let totalPagesCount = 0;

      // Normaliza el nombre_completo a Title Case en todos los usuarios
      const normalize = (arr) => arr.map(u => ({
        ...u,
        nombre_completo: toTitleCase(u.nombre_completo)
      }));

      if (Array.isArray(usersResponse)) {
        // Si la respuesta es un array directo (formato antiguo)
        console.warn('⚠️ La respuesta es un array, no un objeto paginado. Usando formato antiguo.');
        usersData = normalize(usersResponse.slice(0, pageSize));
        total = usersResponse.length;
        totalPagesCount = Math.ceil(total / pageSize);
      } else if (usersResponse.content && Array.isArray(usersResponse.content)) {
        // Si la respuesta es un objeto paginado (formato nuevo)
        // Servidor ya filtra y pagina — usar directamente el contenido
        usersData = normalize(usersResponse.content);
        total = usersResponse.totalElements || usersResponse.total || 0;
        totalPagesCount = usersResponse.totalPages || Math.ceil(total / pageSize);
      } else {
        console.error('❌ Formato de respuesta desconocido:', usersResponse);
        setUsers([]);
        setTotalElements(0);
        setTotalPages(0);
        return;
      }

      console.log('✅ Usuarios extraídos (server-side filtrado):', usersData.length, 'de', total, 'total');

      // 🚀 Totales siempre vienen del servidor (filtrado server-side)
      setTotalElements(total);
      setTotalPages(totalPagesCount);
      setUsers(usersData);
    } catch (err) {
      console.error('❌ Error al cargar usuarios:', err);
      console.error('❌ Detalles del error:', err.message, err.stack);
      setError(`Error al cargar los usuarios: ${err.message || 'Error desconocido'}`);
      setUsers([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, sortBy, sortDirection]);

  const loadRoles = useCallback(async () => {
    try {
      const response = await api.get('/admin/roles', true);
      console.log('✅ Roles cargados:', response);
      setRoles(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('❌ Error al cargar roles:', error);
    }
  }, []);

  const loadAreas = useCallback(async () => {
    try {
      const response = await areaService.obtenerActivas();
      console.log('✅ Áreas cargadas:', response);
      // Ordenar alfabéticamente
      const areasOrdenadas = Array.isArray(response)
        ? response.sort((a, b) => (a.descArea || '').localeCompare(b.descArea || '', 'es'))
        : [];
      setAreas(areasOrdenadas);
    } catch (error) {
      console.error('❌ Error al cargar áreas:', error);
    }
  }, []);

  const loadRegimenes = useCallback(async () => {
    try {
      const response = await regimenService.obtenerTodos();
      console.log('✅ Regímenes cargados:', response);
      // Ordenar alfabéticamente por descRegLab
      const regimenesOrdenados = Array.isArray(response)
        ? response.sort((a, b) => (a.descRegLab || '').localeCompare(b.descRegLab || '', 'es'))
        : [];
      setRegimenes(regimenesOrdenados);
    } catch (error) {
      console.error('❌ Error al cargar regímenes:', error);
    }
  }, []);

  // 🆕 Cargar TODOS los usuarios una vez para generar dropdowns de filtros
  const loadAllUsersForFilters = useCallback(async () => {
    try {
      console.log('🔄 Cargando todos los usuarios para filtros...');

      // 🚀 IPRESS ya viene embebido en cada usuario — solo una llamada
      const usersResponse = await api.get('/usuarios/all-personal?page=0&size=2000&sortBy=createdAt&direction=DESC', true);

      // Extraer datos
      let usersData = [];
      if (Array.isArray(usersResponse)) {
        usersData = usersResponse;
      } else if (usersResponse.content && Array.isArray(usersResponse.content)) {
        usersData = usersResponse.content;
      }

      console.log('✅ Cargados', usersData.length, 'usuarios para filtros');
      setAllUsersForFilters(usersData);
    } catch (error) {
      console.error('❌ Error al cargar usuarios para filtros:', error);
    }
  }, []);

  useEffect(() => {
    // Carga prioritaria: tabla principal + datos básicos
    loadUsers();
    loadRoles();
    loadAreas();
    loadRegimenes();
    // Diferir la carga pesada (2000 usuarios para dropdowns) para no bloquear el render inicial
    const timer = setTimeout(() => {
      loadAllUsersForFilters();
    }, 2500);
    return () => clearTimeout(timer);
  }, [loadUsers, loadRoles, loadAreas, loadRegimenes, loadAllUsersForFilters]);

  // 🚀 Resetear a primera página cuando cambian filtros o búsqueda (sin recargar del servidor)
  useEffect(() => {
    if (currentPage > 0) {
      setCurrentPage(0);
    }
  }, [filters, debouncedSearchTerm]);

  // 🚀 FILTROS SERVER-SIDE: Recargar desde BD cuando cambia cualquier filtro o búsqueda (página ya en 0)
  useEffect(() => {
    // El backend aplica los filtros directamente en SQL — no hay carga masiva
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm, filters.rol, filters.institucion, filters.estado, filters.mesCumpleanos, filters.area, filters.red, filters.ipress, filters.regimen, filters.profesion, filters.especialidad, filters.fechaRegistroDesde, filters.fechaRegistroHasta]);

  // 🚀 Función para actualizar manualmente la tabla
  const handleRefresh = useCallback(() => {
    console.log('🔄 Actualizando tabla manualmente...');
    // Resetear página actual a 0 antes de recargar
    setCurrentPage(0);
    loadUsers(true);
  }, [loadUsers]);

  // ============================================================
  // 🚀 HANDLERS DE PAGINACIÓN
  // ============================================================
  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage);
  }, []);

  const handleSort = useCallback((field) => {
    if (sortBy === field) {
      // Cambiar dirección si es el mismo campo
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Nuevo campo, ordenar ascendente por defecto
      setSortBy(field);
      setSortDirection('asc');
    }
    setCurrentPage(0); // Resetear a primera página
  }, [sortBy, sortDirection]);


  // 🚀 Los totales siempre vienen del servidor (server-side filtering eliminó el cálculo local)

  // ============================================================
  // 🆕 SELECCIÓN MÚLTIPLE
  // ============================================================
  const handleSelectAll = useCallback((checked) => {
    if (checked) {
      // Seleccionar todos los usuarios filtrados
      setSelectedUsers(filteredUsers.map(u => u.id_user));
    } else {
      // Deseleccionar todos
      setSelectedUsers([]);
    }
  }, [filteredUsers]);

  const handleSelectUser = useCallback((userId) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        // Deseleccionar
        return prev.filter(id => id !== userId);
      } else {
        // Seleccionar
        return [...prev, userId];
      }
    });
  }, []);

  const handleEliminarSeleccionados = async () => {
    if (selectedUsers.length === 0) {
      alert('⚠️ Debe seleccionar al menos un usuario para eliminar');
      return;
    }

    const confirmacion = window.confirm(
      `¿Está seguro de eliminar ${selectedUsers.length} usuario(s) seleccionado(s)?\n\nEsta acción no se puede deshacer.`
    );

    if (!confirmacion) return;

    try {
      // Eliminar usuarios en paralelo
      await Promise.all(
        selectedUsers.map(userId => api.delete(`/usuarios/id/${userId}`, true))
      );

      alert(`✅ ${selectedUsers.length} usuario(s) eliminado(s) correctamente`);
      setSelectedUsers([]);
      loadUsers();
    } catch (error) {
      console.error('Error al eliminar usuarios:', error);
      alert('❌ Error al eliminar algunos usuarios. Por favor intente nuevamente.');
    }
  };

  // ============================================================
  // 🧩 ACCIONES DE USUARIO
  // ============================================================
  const handleVerDetalle = (user) => {
    setSelectedUser(user);
    setShowDetalleModal(true);
  };

  const handleEditarUsuario = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleEliminarUsuario = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  // 🆕 NUEVA FUNCIÓN: Crear usuario para personal sin cuenta
  const handleCreateUser = (personalData) => {
    console.log('👨 Crear usuario para:', personalData);
    // Pre-cargar el modal con los datos del personal
    setSelectedUser(personalData);
    setShowCrearUsuarioModal(true);
  };

  // 🔓 NUEVA FUNCIÓN: Desbloquear cuenta bloqueada por intentos fallidos
  const handleUnlockUser = async (user) => {
    try {
      console.log(`🔓 Desbloqueando cuenta de ${user.username}...`);

      await api.put(`/usuarios/id/${user.id_user}/unlock`, null, true);

      // Actualizar UI inmediatamente
      setUsers(prevUsers =>
        prevUsers.map(u =>
          u.id_user === user.id_user
            ? {
              ...u,
              account_locked: false,
              accountLocked: false,
              failed_attempts: 0,
              failedAttempts: 0,
              lock_time: null,
              lockTime: null
            }
            : u
        )
      );

      showToast(`Cuenta de ${user.username} desbloqueada exitosamente`, 'success');
      console.log(`✅ Cuenta desbloqueada: ${user.username}`);

    } catch (error) {
      console.error('❌ Error al desbloquear cuenta:', error);
      showToast(
        `Error al desbloquear cuenta: ${error.response?.data?.message || error.message}`,
        'error'
      );
    }
  };

  // ✅ NUEVA FUNCIÓN: Cambiar estado ACTIVO/INACTIVO (con actualización optimista)
  const handleToggleEstado = async (user) => {
    try {
      const nuevoEstado = user.estado_usuario === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
      const accion = nuevoEstado === 'ACTIVO' ? 'activar' : 'desactivar';

      console.log(`🔄 Cambiando estado de ${user.username} a ${nuevoEstado}...`);

      // ✅ ACTUALIZACIÓN INMEDIATA EN LA UI (sin esperar respuesta del servidor)
      // Esto evita que la tabla se reordene mientras esperamos
      setUsers(prevUsers =>
        prevUsers.map(u =>
          u.id_user === user.id_user
            ? {
              ...u,
              estado_usuario: nuevoEstado,
              activo: nuevoEstado === 'ACTIVO',
              estado: nuevoEstado === 'ACTIVO' ? 'A' : 'I'
            }
            : u
        )
      );

      // Llamar al backend para persistir el cambio
      if (nuevoEstado === 'ACTIVO') {
        await api.put(`/usuarios/id/${user.id_user}/activate`, null, true);
      } else {
        await api.put(`/usuarios/id/${user.id_user}/deactivate`, null, true);
      }

      // ✅ Mostrar Toast de éxito
      showToast(
        `Usuario ${user.username} ${accion === 'activar' ? 'activado' : 'desactivado'} exitosamente`,
        'success'
      );

      console.log(`✅ Estado actualizado correctamente: ${user.username} → ${nuevoEstado}`);

    } catch (error) {
      console.error('❌ Error al cambiar estado:', error);

      // ❌ Si falla, revertir el cambio en la UI
      setUsers(prevUsers =>
        prevUsers.map(u =>
          u.id_user === user.id_user
            ? {
              ...u,
              estado_usuario: user.estado_usuario,
              activo: user.estado_usuario === 'ACTIVO',
              estado: user.estado_usuario === 'ACTIVO' ? 'A' : 'I'
            }
            : u
        )
      );

      // ✅ Mostrar Toast de error
      showToast(
        `Error al cambiar estado: ${error.response?.data?.message || error.message}`,
        'error'
      );
    }
  };

  const confirmarEliminar = async () => {
    if (!userToDelete) return;
    try {
      const response = await api.delete(`/usuarios/id/${userToDelete.id_user}`, true);
      console.log('✅ Usuario eliminado:', response);
      showToast('Usuario eliminado correctamente', 'success');
      setShowDeleteModal(false);
      setUserToDelete(null);
      loadUsers();
    } catch (error) {
      console.error('❌ Error al eliminar usuario:', error);
      const errorMsg = error.response?.data?.message || error.message || 'No se pudo eliminar el usuario';
      showToast(`Error: ${errorMsg}`, 'error');
    } finally {
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  };


  // ============================================================
  // 🎨 RENDER
  // ============================================================
  return (
    <>
      { ToastComponent }
      <div className="min-h-screen bg-gray-50">
        <TabsNavigation activeTab={ activeTab } setActiveTab={ setActiveTab } />
        { activeTab === 'usuarios' && (
          <>
            <FiltersPanel
              filters={ filters }
              setFilters={ setFilters }
              searchTerm={ searchTerm }
              setSearchTerm={ setSearchTerm }
              onNewUser={ () => setShowCrearUsuarioModal(true) }
              selectedCount={ selectedUsers.length }
              onDeleteSelected={ handleEliminarSeleccionados }
              viewMode={ viewMode }
              setViewMode={ setViewMode }
              roles={ roles }
              areas={ areas }
              redesList={ redesList }
              ipressList={ ipressList }
              regimenes={ regimenes }
              profesionesList={ profesionesList }
              especialidadesList={ especialidadesList }
              onRefresh={ handleRefresh }
            />

            { viewMode === 'table' ? (
              <>
                <UsersTable
                  users={ paginatedUsers }
                  loading={ loading }
                  onViewDetail={ handleVerDetalle }
                  onEdit={ handleEditarUsuario }
                  onDelete={ handleEliminarUsuario }
                  onToggleEstado={ handleToggleEstado }
                  onUnlockUser={ handleUnlockUser }  // 🔓 Nueva prop para desbloquear
                  onCreateUser={ handleCreateUser }
                  selectedUsers={ selectedUsers }
                  onSelectAll={ handleSelectAll }
                  onSelectUser={ handleSelectUser }
                  showBirthdayColumn={ !!filters.mesCumpleanos }
                  sortBy={ sortBy }
                  sortDirection={ sortDirection }
                  onSort={ handleSort }
                />
                {/* 🚀 Controles de paginación */ }
                <PaginationControls
                  currentPage={ currentPage }
                  totalPages={ totalPages }
                  totalElements={ totalElements }
                  pageSize={ pageSize }
                  onPageChange={ handlePageChange }
                  loading={ loading }
                />
              </>
            ) : (
              <>
                <UsersCards
                  users={ paginatedUsers }
                  loading={ loading }
                  onViewDetail={ handleVerDetalle }
                  onEdit={ handleEditarUsuario }
                  onDelete={ handleEliminarUsuario }
                  onToggleEstado={ handleToggleEstado }  // ✅ Nueva prop
                  onCreateUser={ handleCreateUser }  // 🆕 Nueva prop para crear usuario
                  selectedUsers={ selectedUsers }
                  onSelectUser={ handleSelectUser }
                />
                {/* 🚀 Controles de paginación */ }
                <PaginationControls
                  currentPage={ currentPage }
                  totalPages={ totalPages }
                  totalElements={ totalElements }
                  pageSize={ pageSize }
                  onPageChange={ handlePageChange }
                  loading={ loading }
                />
              </>
            ) }
          </>
        ) }

        { showCrearUsuarioModal && (
          <CrearUsuarioModal
            onClose={ () => setShowCrearUsuarioModal(false) }
            onSuccess={ loadUsers }
            ipressList={ ipressList }
          />
        ) }
        { showEditModal && selectedUser && (
          <ActualizarModel
            user={ selectedUser }
            onClose={ () => setShowEditModal(false) }
            onSuccess={ loadUsers }
          />
        ) }
        { showDetalleModal && selectedUser && (
          <VerDetalleModal
            user={ selectedUser }
            onClose={ () => setShowDetalleModal(false) }
          />
        ) }
        { showDeleteModal && (
          <ConfirmDeleteModal
            user={ userToDelete }
            onConfirm={ confirmarEliminar }
            onCancel={ () => setShowDeleteModal(false) }
          />
        ) }

        {/* Tab de Áreas */ }
        { activeTab === 'areas' && (
          <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
            <AreasCRUD />
          </div>
        ) }

        {/* Tab de Regímenes */ }
        { activeTab === 'regimenes' && (
          <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
            <RegimenesCRUD />
          </div>
        ) }

        {/* Tab de Profesiones */ }
        { activeTab === 'profesion' && (
          <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
            <ProfesionesCRUD />
          </div>
        ) }

        {/* Tab de Especialidades */ }
        { activeTab === 'especialidad' && (
          <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
            <EspecialidadesCRUD />
          </div>
        ) }

        {/* Tab de Roles */ }
        { activeTab === 'roles' && (
          <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
            <RolesCRUD />
          </div>
        ) }

        {/* Tab de Tipo de Profesional */ }
        { activeTab === 'tipoprofesional' && (
          <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
            <TipoProfesionalCRUD />
          </div>
        ) }

        {/* Tab de Estrategias Institucionales */ }
        { activeTab === 'estrategias' && (
          <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
            <EstrategiasInstitucionales />
          </div>
        ) }

        {/* Tab de Tipos de Atención Telemedicina */ }
        { activeTab === 'tiposatencion' && (
          <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
            <TiposAtencionTelemedicina />
          </div>
        ) }

        {/* Tab de Procedimientos */ }
        { activeTab === 'procedimientos' && (
          <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
            <Procedimientos />
          </div>
        ) }

        {/* Tab de CIE10 */ }
        { activeTab === 'cie10' && (
          <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
            <CIE10 />
          </div>
        ) }

        {/* Tab de Medicamentos */ }
        { activeTab === 'medicamentos' && (
          <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
            <Medicamentos />
          </div>
        ) }

        {/* Tab de Tipos de Bolsas */ }
        { activeTab === 'tiposbolsas' && (
          <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
            <TiposBolsas />
          </div>
        ) }

        {/* Tab de Estados Gestión Citas */ }
        { activeTab === 'estadosgestioncitas' && (
          <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
            <EstadosGestionCitas />
          </div>
        ) }

        {/* Tab de Motivos Mesa de Ayuda */ }
        { activeTab === 'motivosmesaayuda' && (
          <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
            <MotivosMesaAyuda />
          </div>
        ) }

        {/* Tab de Respuestas Mesa de Ayuda */ }
        { activeTab === 'respuestasmesaayuda' && (
          <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
            <RespuestasMesaAyuda />
          </div>
        ) }

        {/* Tab de Motivos Interconsulta */ }
        { activeTab === 'motivosinterconsulta' && (
          <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
            <MotivosInterconsulta />
          </div>
        ) }

        {/* Tab de Motivos Baja CENACRON */ }
        { activeTab === 'motivosbajacenacron' && (
          <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
            <MotivosBajaCenacron />
          </div>
        ) }

        {/* Placeholder para otras tabs futuras */ }
        { activeTab !== 'usuarios' && activeTab !== 'areas' && activeTab !== 'regimenes' && activeTab !== 'profesion' && activeTab !== 'especialidad' && activeTab !== 'roles' && activeTab !== 'tipoprofesional' && activeTab !== 'estrategias' && activeTab !== 'tiposatencion' && activeTab !== 'procedimientos' && activeTab !== 'cie10' && activeTab !== 'medicamentos' && activeTab !== 'tiposbolsas' && activeTab !== 'estadosgestioncitas' && activeTab !== 'motivosmesaayuda' && activeTab !== 'respuestasmesaayuda' && activeTab !== 'motivosinterconsulta' && activeTab !== 'motivosbajacenacron' && (
          <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-200">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Building className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Gestión de { activeTab.charAt(0).toUpperCase() + activeTab.slice(1) }
              </h3>
              <p className="text-gray-500 mb-4">
                Módulo en desarrollo
              </p>
            </div>
          </div>
        ) }
      </div>
    </>
  );
};

export default UsersManagement;