import React, { useState, useEffect } from "react";
import apiClient from '../../lib/apiClient';
import {
  Shield,
  Lock,
  Check,
  X,
  Database,
  Settings,
  Edit,
  Trash2,
  Plus,
  Users,
  ChevronDown,
  ChevronRight,
  Eye,
  PlusCircle,
  Pencil,
  Trash,
  Download,
  Upload,
  CheckCircle,
  Save,
  RefreshCw,
} from "lucide-react";

export default function MBACControl() {
  const [activeTab, setActiveTab] = useState("config-rol");

  // Estados para módulos
  const [modulos, setModulos] = useState([]);
  const [loadingModulos, setLoadingModulos] = useState(false);
  const [errorModulos, setErrorModulos] = useState(null);

  // Estados para permisos rol-módulo
  const [permisosRolModulo, setPermisosRolModulo] = useState([]);
  const [loadingPermisosRM, setLoadingPermisosRM] = useState(false);
  const [errorPermisosRM, setErrorPermisosRM] = useState(null);

  // Estados para permisos rol-página
  const [permisosRolPagina, setPermisosRolPagina] = useState([]);
  const [loadingPermisosRP, setLoadingPermisosRP] = useState(false);
  const [errorPermisosRP, setErrorPermisosRP] = useState(null);

  // Estados para roles y páginas (necesarios para los selects)
  const [rolesDisponibles, setRolesDisponibles] = useState([]);
  const [paginasDisponibles, setPaginasDisponibles] = useState([]);

  // Estados para filtrado en cascada
  const [moduloSeleccionado, setModuloSeleccionado] = useState("");
  const [paginasFiltradas, setPaginasFiltradas] = useState([]);

  // Modal de módulo
  const [showModuloModal, setShowModuloModal] = useState(false);
  const [newModulo, setNewModulo] = useState({
    nombre: "",
    descripcion: "",
    rutaBase: "",
    activo: true,
    orden: "",
  });

  // Modal de permisos rol-módulo
  const [showPermisoRMModal, setShowPermisoRMModal] = useState(false);
  const [currentPermisoRM, setCurrentPermisoRM] = useState(null);
  const [newPermisoRM, setNewPermisoRM] = useState({
    idRol: "",
    idModulo: "",
    puedeAcceder: false,
    puedeVer: false,
    puedeCrear: false,
    puedeEditar: false,
    puedeEliminar: false,
    puedeExportar: false,
    puedeImportar: false,
    puedeAprobar: false,
    activo: true,
  });

  // Modal de permisos rol-página
  const [showPermisoRPModal, setShowPermisoRPModal] = useState(false);
  const [currentPermisoRP, setCurrentPermisoRP] = useState(null);
  const [newPermisoRP, setNewPermisoRP] = useState({
    idRol: "",
    idModulo: "",
    idPagina: "",
    puedeVer: false,
    puedeCrear: false,
    puedeEditar: false,
    puedeEliminar: false,
    puedeExportar: false,
    puedeImportar: false,
    puedeAprobar: false,
    activo: true,
  });

  // Estados para Personalización de Rol
  const [rolSeleccionadoConfig, setRolSeleccionadoConfig] = useState("");
  const [modulosConPaginas, setModulosConPaginas] = useState([]);
  const [permisosRolConfig, setPermisosRolConfig] = useState({});
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const [expandedModulos, setExpandedModulos] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  // ============================================
  // FUNCIONES PARA MÓDULOS
  // ============================================
  const fetchModulos = async () => {
    try {
      setLoadingModulos(true);
      setErrorModulos(null);
      const response = await apiClient.get(`/mbac/modulos`, true);
      const mapeados = response.map((mod) => ({
        id: mod.idModulo,
        name: mod.nombreModulo,
        description: mod.descripcion,
        route: mod.rutaBase,
        active: mod.activo,
        permissions: 0,
      }));
      setModulos(mapeados);
    } catch (error) {
      console.error("Error cargando módulos:", error);
      setErrorModulos(error.message || "Error al cargar módulos");
    } finally {
      setLoadingModulos(false);
    }
  };

  const openModuloModal = () => {
    setNewModulo({
      nombre: "",
      descripcion: "",
      rutaBase: "",
      activo: true,
      orden: "",
    });
    setShowModuloModal(true);
  };

  const closeModuloModal = () => {
    setShowModuloModal(false);
  };

  const handleModuloChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewModulo((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCreateModulo = async (e) => {
    e.preventDefault();
    if (!newModulo.nombre) {
      alert("Por favor complete los campos obligatorios.");
      return;
    }

    try {
      const datos = {
        idModulo: null,
        nombreModulo: newModulo.nombre,
        descripcion: newModulo.descripcion,
        rutaBase: newModulo.rutaBase,
        activo: newModulo.activo,
        orden: newModulo.orden ? Number(newModulo.orden) : null,
      };

      const data = await apiClient.post("/mbac/modulos", datos, true);

      const nuevo = {
        id: data.idModulo,
        name: data.nombreModulo,
        description: data.descripcion,
        route: data.rutaBase,
        active: data.activo,
        permissions: 0,
      };

      setModulos((prev) => [...prev, nuevo]);
      setShowModuloModal(false);
      
      // Refrescar lista completa
      await fetchModulos();
    } catch (error) {
      console.error("Error creando módulo:", error);
      alert(`Error al guardar módulo: ${error.message}`);
    }
  };

  useEffect(() => {
    fetchModulos();
  }, []);

  // ============================================
  // FUNCIONES PARA PERMISOS ROL-MÓDULO
  // ============================================
  const fetchPermisosRolModulo = async () => {
    try {
      setLoadingPermisosRM(true);
      setErrorPermisosRM(null);
      const response = await apiClient.get("/mbac/permisos-rol-modulo", true);
      setPermisosRolModulo(response);
    } catch (error) {
      console.error("Error cargando permisos rol-módulo:", error);
      setErrorPermisosRM(error.message || "Error al cargar permisos");
    } finally {
      setLoadingPermisosRM(false);
    }
  };

  const openPermisoRMModal = (permiso = null) => {
    if (permiso) {
      setCurrentPermisoRM(permiso);
      setNewPermisoRM({
        idRol: permiso.idRol,
        idModulo: permiso.idModulo,
        puedeAcceder: permiso.puedeAcceder,
        puedeVer: permiso.puedeVer,
        puedeCrear: permiso.puedeCrear,
        puedeEditar: permiso.puedeEditar,
        puedeEliminar: permiso.puedeEliminar,
        puedeExportar: permiso.puedeExportar,
        puedeImportar: permiso.puedeImportar,
        puedeAprobar: permiso.puedeAprobar,
        activo: permiso.activo,
      });
    } else {
      setCurrentPermisoRM(null);
      setNewPermisoRM({
        idRol: "",
        idModulo: "",
        puedeAcceder: false,
        puedeVer: false,
        puedeCrear: false,
        puedeEditar: false,
        puedeEliminar: false,
        puedeExportar: false,
        puedeImportar: false,
        puedeAprobar: false,
        activo: true,
      });
    }
    setShowPermisoRMModal(true);
  };

  const closePermisoRMModal = () => {
    setShowPermisoRMModal(false);
    setCurrentPermisoRM(null);
  };

  const handlePermisoRMChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewPermisoRM((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSavePermisoRM = async (e) => {
    e.preventDefault();
    if (!newPermisoRM.idRol || !newPermisoRM.idModulo) {
      alert("Debe seleccionar un rol y un módulo");
      return;
    }

    try {
      const datos = {
        idPermiso: currentPermisoRM?.idPermiso || null,
        idRol: Number(newPermisoRM.idRol),
        idModulo: Number(newPermisoRM.idModulo),
        puedeAcceder: newPermisoRM.puedeAcceder,
        puedeVer: newPermisoRM.puedeVer,
        puedeCrear: newPermisoRM.puedeCrear,
        puedeEditar: newPermisoRM.puedeEditar,
        puedeEliminar: newPermisoRM.puedeEliminar,
        puedeExportar: newPermisoRM.puedeExportar,
        puedeImportar: newPermisoRM.puedeImportar,
        puedeAprobar: newPermisoRM.puedeAprobar,
        activo: newPermisoRM.activo,
      };

      if (currentPermisoRM) {
        await apiClient.put(`/mbac/permisos-rol-modulo/${currentPermisoRM.idPermiso}`, datos, true);
      } else {
        await apiClient.post("/mbac/permisos-rol-modulo", datos, true);
      }

      closePermisoRMModal();
      
      // ⬅️ IMPORTANTE: Refrescar la lista completa para obtener los nombres
      await fetchPermisosRolModulo();
    } catch (error) {
      console.error("Error guardando permiso:", error);
      alert(`Error al guardar permiso: ${error.message}`);
    }
  };

  const handleDeletePermisoRM = async (idPermiso) => {
    if (!window.confirm("¿Está seguro de eliminar este permiso?")) return;

    try {
      await apiClient.delete(`/mbac/permisos-rol-modulo/${idPermiso}`, true);
      await fetchPermisosRolModulo();
    } catch (error) {
      console.error("Error eliminando permiso:", error);
      alert(`Error al eliminar permiso: ${error.message}`);
    }
  };

  useEffect(() => {
    if (activeTab === "permisos-crud") {
      fetchPermisosRolModulo();
    }
  }, [activeTab]);

  // ============================================
  // FUNCIONES PARA PERMISOS ROL-PÁGINA
  // ============================================
  const fetchPermisosRolPagina = async () => {
    try {
      setLoadingPermisosRP(true);
      setErrorPermisosRP(null);
      const response = await apiClient.get("/mbac/permisos-rol-pagina", true);
      setPermisosRolPagina(response);
    } catch (error) {
      console.error("Error cargando permisos rol-página:", error);
      setErrorPermisosRP(error.message || "Error al cargar permisos");
    } finally {
      setLoadingPermisosRP(false);
    }
  };

  const handleModuloChangeForPagina = (idModulo) => {
    setModuloSeleccionado(idModulo);
    setNewPermisoRP((prev) => ({
      ...prev,
      idModulo: idModulo,
      idPagina: "", // Resetear la página seleccionada
    }));

    // Filtrar páginas del módulo seleccionado
    if (idModulo) {
      const paginasDelModulo = paginasDisponibles.filter(
        (pag) => pag.idModulo === Number(idModulo)
      );
      setPaginasFiltradas(paginasDelModulo);
    } else {
      setPaginasFiltradas([]);
    }
  };

  const openPermisoRPModal = (permiso = null) => {
    if (permiso) {
      setCurrentPermisoRP(permiso);
      setNewPermisoRP({
        idRol: permiso.idRol,
        idModulo: permiso.idModulo,
        idPagina: permiso.idPagina,
        puedeVer: permiso.puedeVer,
        puedeCrear: permiso.puedeCrear,
        puedeEditar: permiso.puedeEditar,
        puedeEliminar: permiso.puedeEliminar,
        puedeExportar: permiso.puedeExportar,
        puedeImportar: permiso.puedeImportar,
        puedeAprobar: permiso.puedeAprobar,
        activo: permiso.activo,
      });

      // Cargar el módulo y filtrar páginas si está editando
      setModuloSeleccionado(permiso.idModulo);
      const paginasDelModulo = paginasDisponibles.filter(
        (pag) => pag.idModulo === permiso.idModulo
      );
      setPaginasFiltradas(paginasDelModulo);
    } else {
      setCurrentPermisoRP(null);
      setNewPermisoRP({
        idRol: "",
        idModulo: "",
        idPagina: "",
        puedeVer: false,
        puedeCrear: false,
        puedeEditar: false,
        puedeEliminar: false,
        puedeExportar: false,
        puedeImportar: false,
        puedeAprobar: false,
        activo: true,
      });
      setModuloSeleccionado("");
      setPaginasFiltradas([]);
    }
    setShowPermisoRPModal(true);
  };

  const closePermisoRPModal = () => {
    setShowPermisoRPModal(false);
    setCurrentPermisoRP(null);
    setModuloSeleccionado("");
    setPaginasFiltradas([]);
  };

  const handlePermisoRPChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewPermisoRP((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSavePermisoRP = async (e) => {
    e.preventDefault();

    if (!newPermisoRP.idRol) {
      alert("Debe seleccionar un rol");
      return;
    }
    if (!moduloSeleccionado) {
      alert("Debe seleccionar un módulo");
      return;
    }
    if (!newPermisoRP.idPagina) {
      alert("Debe seleccionar una página");
      return;
    }

    try {
      const datos = {
        idPermiso: currentPermisoRP?.idPermiso || null,
        idRol: Number(newPermisoRP.idRol),
        idPagina: Number(newPermisoRP.idPagina),
        puedeVer: newPermisoRP.puedeVer,
        puedeCrear: newPermisoRP.puedeCrear,
        puedeEditar: newPermisoRP.puedeEditar,
        puedeEliminar: newPermisoRP.puedeEliminar,
        puedeExportar: newPermisoRP.puedeExportar,
        puedeImportar: newPermisoRP.puedeImportar,
        puedeAprobar: newPermisoRP.puedeAprobar,
        activo: newPermisoRP.activo,
      };

      if (currentPermisoRP) {
        await apiClient.put(`/mbac/permisos-rol-pagina/${currentPermisoRP.idPermiso}`, datos, true);
      } else {
        await apiClient.post("/mbac/permisos-rol-pagina", datos, true);
      }

      closePermisoRPModal();
      
      // ⬅️ IMPORTANTE: Refrescar la lista completa para obtener los nombres
      await fetchPermisosRolPagina();
    } catch (error) {
      console.error("Error guardando permiso:", error);
      alert(`Error al guardar permiso: ${error.message}`);
    }
  };

  const handleDeletePermisoRP = async (idPermiso) => {
    if (!window.confirm("¿Está seguro de eliminar este permiso?")) return;

    try {
      await apiClient.delete(`/mbac/permisos-rol-pagina/${idPermiso}`, true);
      await fetchPermisosRolPagina();
    } catch (error) {
      console.error("Error eliminando permiso:", error);
      alert(`Error al eliminar permiso: ${error.message}`);
    }
  };

  useEffect(() => {
    if (activeTab === "permisos-crud") {
      fetchPermisosRolPagina();
    }
  }, [activeTab]);

  // Cargar roles y páginas para los selects
  useEffect(() => {
    const fetchRolesYPaginas = async () => {
      try {
        const [rolesRes, paginasRes] = await Promise.all([
          apiClient.get("/mbac/roles", true),
          apiClient.get("/mbac/paginas", true),
        ]);
        // Ordenar roles alfabéticamente por descRol
        const rolesOrdenados = rolesRes.sort((a, b) =>
          (a.descRol || '').localeCompare(b.descRol || '')
        );
        setRolesDisponibles(rolesOrdenados);
        setPaginasDisponibles(paginasRes);
      } catch (error) {
        console.error("Error cargando roles y páginas:", error);
      }
    };
    if (activeTab === "permisos-crud" || activeTab === "config-rol") {
      fetchRolesYPaginas();
    }
  }, [activeTab]);

  // ============================================
  // FUNCIONES PARA PERSONALIZACIÓN DE ROL
  // ============================================

  // Cargar módulos con sus páginas
  const fetchModulosConPaginas = async () => {
    try {
      const [modulosRes, paginasRes] = await Promise.all([
        apiClient.get("/mbac/modulos", true),
        apiClient.get("/mbac/paginas", true),
      ]);

      // Agrupar páginas por módulo y ordenar alfabéticamente
      const modulosAgrupados = modulosRes
        .map(mod => ({
          ...mod,
          paginas: paginasRes.filter(pag => pag.idModulo === mod.idModulo)
        }))
        .sort((a, b) => (a.nombreModulo || '').localeCompare(b.nombreModulo || '', 'es'));

      setModulosConPaginas(modulosAgrupados);
    } catch (error) {
      console.error("Error cargando módulos con páginas:", error);
    }
  };

  // Cargar permisos actuales del rol seleccionado
  const cargarPermisosDelRol = async (idRol) => {
    if (!idRol) {
      setPermisosRolConfig({});
      return;
    }

    try {
      setLoadingConfig(true);
      const permisos = await apiClient.get("/mbac/permisos-rol-pagina", true);

      // Filtrar por el rol seleccionado y crear un mapa
      const permisosDelRol = {};
      permisos
        .filter(p => p.idRol === Number(idRol))
        .forEach(p => {
          permisosDelRol[p.idPagina] = {
            idPermiso: p.idPermiso,
            puedeVer: p.puedeVer || false,
            puedeCrear: p.puedeCrear || false,
            puedeEditar: p.puedeEditar || false,
            puedeEliminar: p.puedeEliminar || false,
            puedeExportar: p.puedeExportar || false,
            puedeImportar: p.puedeImportar || false,
            puedeAprobar: p.puedeAprobar || false,
            activo: p.activo !== false,
          };
        });

      setPermisosRolConfig(permisosDelRol);
      setHasChanges(false);
    } catch (error) {
      console.error("Error cargando permisos del rol:", error);
    } finally {
      setLoadingConfig(false);
    }
  };

  // Manejar cambio de rol seleccionado
  const handleRolConfigChange = (idRol) => {
    if (hasChanges) {
      if (!window.confirm("Tienes cambios sin guardar. ¿Deseas continuar?")) {
        return;
      }
    }
    setRolSeleccionadoConfig(idRol);
    cargarPermisosDelRol(idRol);
  };

  // Toggle expandir/colapsar módulo
  const toggleModuloExpanded = (idModulo) => {
    setExpandedModulos(prev => ({
      ...prev,
      [idModulo]: !prev[idModulo]
    }));
  };

  // Expandir todos los módulos
  const expandirTodos = () => {
    const expanded = {};
    modulosConPaginas.forEach(mod => {
      expanded[mod.idModulo] = true;
    });
    setExpandedModulos(expanded);
  };

  // Colapsar todos los módulos
  const colapsarTodos = () => {
    setExpandedModulos({});
  };

  // Actualizar un permiso específico
  const actualizarPermiso = (idPagina, campo, valor) => {
    setPermisosRolConfig(prev => ({
      ...prev,
      [idPagina]: {
        ...(prev[idPagina] || {
          puedeVer: false,
          puedeCrear: false,
          puedeEditar: false,
          puedeEliminar: false,
          puedeExportar: false,
          puedeImportar: false,
          puedeAprobar: false,
          activo: true,
        }),
        [campo]: valor,
      }
    }));
    setHasChanges(true);
  };

  // Dar acceso completo a una página
  const darAccesoCompleto = (idPagina) => {
    setPermisosRolConfig(prev => ({
      ...prev,
      [idPagina]: {
        ...(prev[idPagina] || {}),
        puedeVer: true,
        puedeCrear: true,
        puedeEditar: true,
        puedeEliminar: true,
        puedeExportar: true,
        puedeImportar: true,
        puedeAprobar: true,
        activo: true,
      }
    }));
    setHasChanges(true);
  };

  // Quitar todos los permisos de una página
  const quitarAcceso = (idPagina) => {
    setPermisosRolConfig(prev => ({
      ...prev,
      [idPagina]: {
        ...(prev[idPagina] || {}),
        puedeVer: false,
        puedeCrear: false,
        puedeEditar: false,
        puedeEliminar: false,
        puedeExportar: false,
        puedeImportar: false,
        puedeAprobar: false,
        activo: false,
      }
    }));
    setHasChanges(true);
  };

  // Dar acceso completo a todo el módulo
  const darAccesoModulo = (idModulo) => {
    const modulo = modulosConPaginas.find(m => m.idModulo === idModulo);
    if (!modulo) return;

    const nuevosPermisos = { ...permisosRolConfig };
    modulo.paginas.forEach(pag => {
      nuevosPermisos[pag.idPagina] = {
        ...(nuevosPermisos[pag.idPagina] || {}),
        puedeVer: true,
        puedeCrear: true,
        puedeEditar: true,
        puedeEliminar: true,
        puedeExportar: true,
        puedeImportar: true,
        puedeAprobar: true,
        activo: true,
      };
    });
    setPermisosRolConfig(nuevosPermisos);
    setHasChanges(true);
  };

  // Quitar acceso a todo el módulo
  const quitarAccesoModulo = (idModulo) => {
    const modulo = modulosConPaginas.find(m => m.idModulo === idModulo);
    if (!modulo) return;

    const nuevosPermisos = { ...permisosRolConfig };
    modulo.paginas.forEach(pag => {
      nuevosPermisos[pag.idPagina] = {
        ...(nuevosPermisos[pag.idPagina] || {}),
        puedeVer: false,
        puedeCrear: false,
        puedeEditar: false,
        puedeEliminar: false,
        puedeExportar: false,
        puedeImportar: false,
        puedeAprobar: false,
        activo: false,
      };
    });
    setPermisosRolConfig(nuevosPermisos);
    setHasChanges(true);
  };

  // Guardar todos los cambios
  const guardarConfiguracion = async () => {
    if (!rolSeleccionadoConfig) {
      alert("Seleccione un rol primero");
      return;
    }

    try {
      setSavingConfig(true);

      // Preparar los datos para guardar
      const permisosAGuardar = [];

      modulosConPaginas.forEach(modulo => {
        modulo.paginas.forEach(pagina => {
          const permisoActual = permisosRolConfig[pagina.idPagina];
          if (permisoActual) {
            permisosAGuardar.push({
              idPermiso: permisoActual.idPermiso || null,
              idRol: Number(rolSeleccionadoConfig),
              idPagina: pagina.idPagina,
              puedeVer: permisoActual.puedeVer || false,
              puedeCrear: permisoActual.puedeCrear || false,
              puedeEditar: permisoActual.puedeEditar || false,
              puedeEliminar: permisoActual.puedeEliminar || false,
              puedeExportar: permisoActual.puedeExportar || false,
              puedeImportar: permisoActual.puedeImportar || false,
              puedeAprobar: permisoActual.puedeAprobar || false,
              activo: permisoActual.activo !== false,
            });
          }
        });
      });

      // Guardar cada permiso (crear o actualizar)
      for (const permiso of permisosAGuardar) {
        if (permiso.idPermiso) {
          await apiClient.put(`/mbac/permisos-rol-pagina/${permiso.idPermiso}`, permiso, true);
        } else {
          await apiClient.post("/mbac/permisos-rol-pagina", permiso, true);
        }
      }

      alert("Configuración guardada exitosamente");
      setHasChanges(false);

      // Recargar permisos
      await cargarPermisosDelRol(rolSeleccionadoConfig);
    } catch (error) {
      console.error("Error guardando configuración:", error);
      alert(`Error al guardar: ${error.message}`);
    } finally {
      setSavingConfig(false);
    }
  };

  // Cargar datos cuando se activa la pestaña
  useEffect(() => {
    if (activeTab === "config-rol") {
      fetchModulosConPaginas();
    }
  }, [activeTab]);

  // Verificar si una página tiene algún permiso activo
  const tieneAlgunPermiso = (idPagina) => {
    const p = permisosRolConfig[idPagina];
    if (!p) return false;
    return p.puedeVer || p.puedeCrear || p.puedeEditar || p.puedeEliminar || p.puedeExportar || p.puedeAprobar;
  };

  // Contar permisos activos en un módulo
  const contarPermisosModulo = (idModulo) => {
    const modulo = modulosConPaginas.find(m => m.idModulo === idModulo);
    if (!modulo) return { total: 0, conAcceso: 0 };

    let conAcceso = 0;
    modulo.paginas.forEach(pag => {
      if (tieneAlgunPermiso(pag.idPagina)) conAcceso++;
    });

    return { total: modulo.paginas.length, conAcceso };
  };

  const tabs = [
    { id: "config-rol", label: "Personalización de Rol", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Sistema General de Gestión de Módulos</h1>
            <p className="text-gray-600 mt-1">Gestión de Módulos y Permisos del Sistema</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all border-b-2 whitespace-nowrap ${
                      activeTab === tab.id
                        ? "text-blue-600 border-blue-600 bg-blue-50"
                        : "text-gray-600 border-transparent hover:text-blue-600 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-6">
            {/* TAB: MÓDULOS */}
            {activeTab === "modulos" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">Módulos del Sistema</h2>
                  <button
                    onClick={openModuloModal}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Database className="w-5 h-5" />
                    Crear Módulo
                  </button>
                </div>

                {loadingModulos && <p className="text-gray-500 text-sm">Cargando módulos...</p>}

                {errorModulos && <p className="text-red-600 text-sm">Error: {errorModulos}</p>}

                {!loadingModulos && !errorModulos && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">ID</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                            Nombre
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                            Descripción
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Ruta</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                            Permisos
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                            Estado
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {modulos.map((mod) => (
                          <tr key={mod.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 font-semibold">#{mod.id}</td>
                            <td className="px-6 py-4 font-semibold text-gray-800">{mod.name}</td>
                            <td className="px-6 py-4 text-gray-600">{mod.description}</td>
                            <td className="px-6 py-4">
                              <code className="px-2 py-1 bg-gray-100 rounded text-sm">{mod.route}</code>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                {mod.permissions} permisos
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`px-3 py-1 rounded-full text-sm ${
                                  mod.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {mod.active ? "Activo" : "Inactivo"}
                              </span>
                            </td>
                          </tr>
                        ))}

                        {modulos.length === 0 && (
                          <tr>
                            <td colSpan={6} className="px-6 py-4 text-center text-gray-500 text-sm">
                              No hay módulos configurados.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB: PERMISOS CRUD */}
            {activeTab === "permisos-crud" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Mantenimiento de Permisos</h2>

                {/* SECCIÓN: PERMISOS ROL-MÓDULO */}
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-xl border border-purple-200">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Lock className="w-5 h-5 text-purple-600" />
                        Permisos Rol-Módulo
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Gestiona los permisos de roles a nivel de módulo completo
                      </p>
                    </div>
                    <button
                      onClick={() => openPermisoRMModal()}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Nuevo Permiso
                    </button>
                  </div>

                  {loadingPermisosRM && <p className="text-gray-500 text-sm">Cargando permisos...</p>}

                  {errorPermisosRM && <p className="text-red-600 text-sm">Error: {errorPermisosRM}</p>}

                  {!loadingPermisosRM && !errorPermisosRM && (
                    <div className="overflow-x-auto bg-white rounded-lg">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">ID</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Rol</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                              Módulo
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                              Acceder
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                              Ver
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                              Crear
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                              Editar
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                              Eliminar
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                              Estado
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                              Acciones
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {permisosRolModulo.map((permiso) => (
                            <tr key={permiso.idPermiso} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm font-semibold text-gray-700">
                                #{permiso.idPermiso}
                              </td>
                              <td className="px-4 py-3">
                                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                                  {permiso.nombreRol || `Rol ID: ${permiso.idRol}`}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                                  {permiso.nombreModulo || `Módulo ID: ${permiso.idModulo}`}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                {permiso.puedeAcceder ? (
                                  <Check className="w-4 h-4 text-green-600 mx-auto" />
                                ) : (
                                  <X className="w-4 h-4 text-gray-300 mx-auto" />
                                )}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {permiso.puedeVer ? (
                                  <Check className="w-4 h-4 text-green-600 mx-auto" />
                                ) : (
                                  <X className="w-4 h-4 text-gray-300 mx-auto" />
                                )}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {permiso.puedeCrear ? (
                                  <Check className="w-4 h-4 text-green-600 mx-auto" />
                                ) : (
                                  <X className="w-4 h-4 text-gray-300 mx-auto" />
                                )}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {permiso.puedeEditar ? (
                                  <Check className="w-4 h-4 text-green-600 mx-auto" />
                                ) : (
                                  <X className="w-4 h-4 text-gray-300 mx-auto" />
                                )}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {permiso.puedeEliminar ? (
                                  <Check className="w-4 h-4 text-green-600 mx-auto" />
                                ) : (
                                  <X className="w-4 h-4 text-gray-300 mx-auto" />
                                )}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs ${
                                    permiso.activo
                                      ? "bg-green-100 text-green-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {permiso.activo ? "Activo" : "Inactivo"}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex justify-center gap-2">
                                  <button
                                    onClick={() => openPermisoRMModal(permiso)}
                                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                    title="Editar"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeletePermisoRM(permiso.idPermiso)}
                                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                                    title="Eliminar"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {permisosRolModulo.length === 0 && (
                            <tr>
                              <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                                No hay permisos rol-módulo configurados
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* SECCIÓN: PERMISOS ROL-PÁGINA */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-green-600" />
                        Permisos Rol-Página
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Gestiona los permisos de roles a nivel de página específica
                      </p>
                    </div>
                    <button
                      onClick={() => openPermisoRPModal()}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Nuevo Permiso
                    </button>
                  </div>

                  {loadingPermisosRP && <p className="text-gray-500 text-sm">Cargando permisos...</p>}

                  {errorPermisosRP && <p className="text-red-600 text-sm">Error: {errorPermisosRP}</p>}

                  {!loadingPermisosRP && !errorPermisosRP && (
                    <div className="overflow-x-auto bg-white rounded-lg">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">ID</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Rol</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                              Página
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                              Ver
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                              Crear
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                              Editar
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                              Eliminar
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                              Estado
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                              Acciones
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {permisosRolPagina.map((permiso) => (
                            <tr key={permiso.idPermiso} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm font-semibold text-gray-700">
                                #{permiso.idPermiso}
                              </td>
                              <td className="px-4 py-3">
                                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                                  {permiso.nombreRol || `Rol ID: ${permiso.idRol}`}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex flex-col gap-1">
                                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                                    {permiso.nombrePagina || `Página ID: ${permiso.idPagina}`}
                                  </span>
                                  {permiso.nombreModulo && (
                                    <span className="text-xs text-gray-500">
                                      📁 {permiso.nombreModulo}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-center">
                                {permiso.puedeVer ? (
                                  <Check className="w-4 h-4 text-green-600 mx-auto" />
                                ) : (
                                  <X className="w-4 h-4 text-gray-300 mx-auto" />
                                )}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {permiso.puedeCrear ? (
                                  <Check className="w-4 h-4 text-green-600 mx-auto" />
                                ) : (
                                  <X className="w-4 h-4 text-gray-300 mx-auto" />
                                )}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {permiso.puedeEditar ? (
                                  <Check className="w-4 h-4 text-green-600 mx-auto" />
                                ) : (
                                  <X className="w-4 h-4 text-gray-300 mx-auto" />
                                )}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {permiso.puedeEliminar ? (
                                  <Check className="w-4 h-4 text-green-600 mx-auto" />
                                ) : (
                                  <X className="w-4 h-4 text-gray-300 mx-auto" />
                                )}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs ${
                                    permiso.activo
                                      ? "bg-green-100 text-green-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {permiso.activo ? "Activo" : "Inactivo"}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex justify-center gap-2">
                                  <button
                                    onClick={() => openPermisoRPModal(permiso)}
                                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                    title="Editar"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeletePermisoRP(permiso.idPermiso)}
                                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                                    title="Eliminar"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {permisosRolPagina.length === 0 && (
                            <tr>
                              <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                                No hay permisos rol-página configurados
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: PERSONALIZACIÓN DE ROL */}
            {activeTab === "config-rol" && (
              <div className="space-y-6">
                {/* Header con selector de rol */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-200">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="max-w-2xl">
                      <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Users className="w-6 h-6 text-indigo-600" />
                        Personalización de Permisos por Rol
                      </h2>
                      <p className="text-sm text-gray-600 mt-2">
                        Estandarice los permisos predeterminados para cada rol del sistema. Cuando un usuario sea asignado a un rol,
                        heredará automáticamente estos permisos como base, agilizando la gestión de accesos.
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700">Seleccionar Rol:</label>
                      <select
                        value={rolSeleccionadoConfig}
                        onChange={(e) => handleRolConfigChange(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-w-[200px]"
                      >
                        <option value="">-- Seleccione un rol --</option>
                        {rolesDisponibles.map((rol) => (
                          <option key={rol.idRol} value={rol.idRol}>
                            {rol.descRol || `Rol ${rol.idRol}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Acciones rápidas */}
                  {rolSeleccionadoConfig && (
                    <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-indigo-200">
                      <button
                        onClick={expandirTodos}
                        className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-1"
                      >
                        <ChevronDown className="w-4 h-4" />
                        Expandir todos
                      </button>
                      <button
                        onClick={colapsarTodos}
                        className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-1"
                      >
                        <ChevronRight className="w-4 h-4" />
                        Colapsar todos
                      </button>
                      <div className="flex-1" />
                      {hasChanges && (
                        <span className="text-sm text-amber-600 font-medium">
                          * Tienes cambios sin guardar
                        </span>
                      )}
                      <button
                        onClick={() => cargarPermisosDelRol(rolSeleccionadoConfig)}
                        disabled={loadingConfig}
                        className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-1"
                      >
                        <RefreshCw className={`w-4 h-4 ${loadingConfig ? 'animate-spin' : ''}`} />
                        Recargar
                      </button>
                      <button
                        onClick={guardarConfiguracion}
                        disabled={savingConfig || !hasChanges}
                        className={`px-4 py-1.5 text-sm rounded-lg flex items-center gap-1 ${
                          hasChanges
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <Save className={`w-4 h-4 ${savingConfig ? 'animate-pulse' : ''}`} />
                        {savingConfig ? 'Guardando...' : 'Guardar cambios'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Contenido principal */}
                {!rolSeleccionadoConfig ? (
                  <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600">Seleccione un rol</h3>
                    <p className="text-gray-500 mt-2">
                      Elija un rol del menú superior para configurar sus permisos predeterminados
                    </p>
                  </div>
                ) : loadingConfig ? (
                  <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
                    <RefreshCw className="w-12 h-12 text-indigo-400 mx-auto mb-4 animate-spin" />
                    <p className="text-gray-600">Cargando configuración...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Leyenda */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Leyenda de permisos:</h4>
                      <div className="flex flex-wrap gap-4 text-xs">
                        <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5 text-blue-500" /> Ver</span>
                        <span className="flex items-center gap-1"><PlusCircle className="w-3.5 h-3.5 text-green-500" /> Crear</span>
                        <span className="flex items-center gap-1"><Pencil className="w-3.5 h-3.5 text-amber-500" /> Editar</span>
                        <span className="flex items-center gap-1"><Trash className="w-3.5 h-3.5 text-red-500" /> Eliminar</span>
                        <span className="flex items-center gap-1"><Download className="w-3.5 h-3.5 text-purple-500" /> Exportar</span>
                        <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-teal-500" /> Aprobar</span>
                      </div>
                    </div>

                    {/* Lista de módulos y páginas */}
                    {modulosConPaginas.map((modulo) => {
                      const stats = contarPermisosModulo(modulo.idModulo);
                      const isExpanded = expandedModulos[modulo.idModulo];

                      return (
                        <div key={modulo.idModulo} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                          {/* Header del módulo */}
                          <div
                            className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${
                              stats.conAcceso > 0 ? 'bg-indigo-50 hover:bg-indigo-100' : 'bg-gray-50 hover:bg-gray-100'
                            }`}
                            onClick={() => toggleModuloExpanded(modulo.idModulo)}
                          >
                            <div className="flex items-center gap-3">
                              {isExpanded ? (
                                <ChevronDown className="w-5 h-5 text-gray-500" />
                              ) : (
                                <ChevronRight className="w-5 h-5 text-gray-500" />
                              )}
                              <Database className={`w-5 h-5 ${stats.conAcceso > 0 ? 'text-indigo-600' : 'text-gray-400'}`} />
                              <div>
                                <h3 className="font-semibold text-gray-800">
                                  {modulo.nombreModulo}
                                </h3>
                                <p className="text-xs text-gray-500">
                                  {stats.conAcceso} de {stats.total} páginas con acceso
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => darAccesoModulo(modulo.idModulo)}
                                className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                              >
                                Dar acceso total
                              </button>
                              <button
                                onClick={() => quitarAccesoModulo(modulo.idModulo)}
                                className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                              >
                                Quitar acceso
                              </button>
                            </div>
                          </div>

                          {/* Páginas del módulo */}
                          {isExpanded && modulo.paginas.length > 0 && (
                            <div className="border-t border-gray-200">
                              <table className="w-full">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Página</th>
                                    <th className="px-2 py-2 text-center text-xs font-semibold text-gray-600 w-12">
                                      <Eye className="w-4 h-4 mx-auto text-blue-500" title="Ver" />
                                    </th>
                                    <th className="px-2 py-2 text-center text-xs font-semibold text-gray-600 w-12">
                                      <PlusCircle className="w-4 h-4 mx-auto text-green-500" title="Crear" />
                                    </th>
                                    <th className="px-2 py-2 text-center text-xs font-semibold text-gray-600 w-12">
                                      <Pencil className="w-4 h-4 mx-auto text-amber-500" title="Editar" />
                                    </th>
                                    <th className="px-2 py-2 text-center text-xs font-semibold text-gray-600 w-12">
                                      <Trash className="w-4 h-4 mx-auto text-red-500" title="Eliminar" />
                                    </th>
                                    <th className="px-2 py-2 text-center text-xs font-semibold text-gray-600 w-12">
                                      <Download className="w-4 h-4 mx-auto text-purple-500" title="Exportar" />
                                    </th>
                                    <th className="px-2 py-2 text-center text-xs font-semibold text-gray-600 w-12">
                                      <CheckCircle className="w-4 h-4 mx-auto text-teal-500" title="Aprobar" />
                                    </th>
                                    <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600">Acciones</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                  {modulo.paginas.map((pagina) => {
                                    const permisos = permisosRolConfig[pagina.idPagina] || {};
                                    const tieneAcceso = tieneAlgunPermiso(pagina.idPagina);
                                    // Contar cuántos permisos tiene activos
                                    const permisosActivos = ['puedeVer', 'puedeCrear', 'puedeEditar', 'puedeEliminar', 'puedeExportar', 'puedeAprobar']
                                      .filter(campo => permisos[campo]).length;

                                    return (
                                      <tr
                                        key={pagina.idPagina}
                                        className={`transition-colors ${tieneAcceso ? 'bg-green-50 border-l-4 border-l-green-500' : 'bg-gray-50/50 border-l-4 border-l-gray-300'}`}
                                      >
                                        <td className="px-4 py-3">
                                          <div className="flex items-center gap-3">
                                            {/* Indicador de estado */}
                                            <div className={`flex-shrink-0 px-2 py-1 rounded-full text-xs font-semibold ${
                                              tieneAcceso
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-200 text-gray-500'
                                            }`}>
                                              {tieneAcceso ? `${permisosActivos}/6` : 'Sin acceso'}
                                            </div>
                                            <div>
                                              <span className={`font-medium text-sm ${tieneAcceso ? 'text-gray-900' : 'text-gray-500'}`}>
                                                {pagina.nombrePagina}
                                              </span>
                                              <p className="text-xs text-gray-400">{pagina.rutaPagina}</p>
                                            </div>
                                          </div>
                                        </td>
                                        {['puedeVer', 'puedeCrear', 'puedeEditar', 'puedeEliminar', 'puedeExportar', 'puedeAprobar'].map((campo) => (
                                          <td key={campo} className="px-2 py-3 text-center">
                                            <input
                                              type="checkbox"
                                              checked={permisos[campo] || false}
                                              onChange={(e) => actualizarPermiso(pagina.idPagina, campo, e.target.checked)}
                                              className={`h-5 w-5 rounded cursor-pointer ${
                                                permisos[campo]
                                                  ? 'text-green-600 border-green-400 focus:ring-green-500'
                                                  : 'text-gray-400 border-gray-300 focus:ring-gray-400'
                                              }`}
                                            />
                                          </td>
                                        ))}
                                        <td className="px-4 py-3">
                                          <div className="flex justify-center gap-1">
                                            <button
                                              onClick={() => darAccesoCompleto(pagina.idPagina)}
                                              className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 font-medium"
                                              title="Dar acceso completo"
                                            >
                                              Todo
                                            </button>
                                            <button
                                              onClick={() => quitarAcceso(pagina.idPagina)}
                                              className="px-2 py-1 text-xs bg-gray-400 text-white rounded hover:bg-gray-500 font-medium"
                                              title="Quitar acceso"
                                            >
                                              Ninguno
                                            </button>
                                          </div>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          )}

                          {isExpanded && modulo.paginas.length === 0 && (
                            <div className="p-4 text-center text-gray-500 text-sm border-t border-gray-200">
                              Este módulo no tiene páginas configuradas
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {modulosConPaginas.length === 0 && (
                      <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
                        <Database className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No hay módulos configurados en el sistema</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* MODAL: CREAR/EDITAR MÓDULO */}
        {showModuloModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Crear nuevo módulo</h2>
                <button onClick={closeModuloModal} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateModulo} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del módulo<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={newModulo.nombre}
                    onChange={handleModuloChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej. Gestión de Citas"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <textarea
                    name="descripcion"
                    value={newModulo.descripcion}
                    onChange={handleModuloChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe brevemente el propósito del módulo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ruta base</label>
                  <input
                    type="text"
                    name="rutaBase"
                    value={newModulo.rutaBase}
                    onChange={handleModuloChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="/roles/citas/"
                  />
                  <p className="text-xs text-gray-500 mt-1">Ruta base del módulo en el frontend (opcional).</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Orden</label>
                    <input
                      type="number"
                      name="orden"
                      value={newModulo.orden}
                      onChange={handleModuloChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ej. 1"
                    />
                  </div>
                  <div className="flex items-center mt-6">
                    <input
                      id="modulo-activo"
                      type="checkbox"
                      name="activo"
                      checked={newModulo.activo}
                      onChange={handleModuloChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                    <label htmlFor="modulo-activo" className="ml-2 text-sm text-gray-700">
                      Módulo activo
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-4">
                  <button
                    type="button"
                    onClick={closeModuloModal}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Guardar módulo
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: CREAR/EDITAR PERMISO ROL-MÓDULO */}
        {showPermisoRMModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  {currentPermisoRM ? "Editar" : "Crear"} Permiso Rol-Módulo
                </h2>
                <button onClick={closePermisoRMModal} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSavePermisoRM} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rol<span className="text-red-500">*</span>
                    </label>
                    <select
                      name="idRol"
                      value={newPermisoRM.idRol}
                      onChange={handlePermisoRMChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      disabled={!!currentPermisoRM}
                    >
                      <option value="">Seleccione un rol</option>
                      {rolesDisponibles.map((rol) => (
                        <option key={rol.idRol} value={rol.idRol}>
                          {rol.descRol || `Rol ${rol.idRol}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Módulo<span className="text-red-500">*</span>
                    </label>
                    <select
                      name="idModulo"
                      value={newPermisoRM.idModulo}
                      onChange={handlePermisoRMChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      disabled={!!currentPermisoRM}
                    >
                      <option value="">Seleccione un módulo</option>
                      {modulos.map((mod) => (
                        <option key={mod.id} value={mod.id}>
                          {mod.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Permisos</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { name: "puedeAcceder", label: "Acceder", icon: "🚪" },
                      { name: "puedeVer", label: "Ver", icon: "👁️" },
                      { name: "puedeCrear", label: "Crear", icon: "➕" },
                      { name: "puedeEditar", label: "Editar", icon: "✏️" },
                      { name: "puedeEliminar", label: "Eliminar", icon: "🗑️" },
                      { name: "puedeExportar", label: "Exportar", icon: "📥" },
                      { name: "puedeImportar", label: "Importar", icon: "📤" },
                      { name: "puedeAprobar", label: "Aprobar", icon: "✅" },
                    ].map((perm) => (
                      <div key={perm.name} className="flex items-center">
                        <input
                          id={`rm-${perm.name}`}
                          type="checkbox"
                          name={perm.name}
                          checked={newPermisoRM[perm.name]}
                          onChange={handlePermisoRMChange}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                        <label htmlFor={`rm-${perm.name}`} className="ml-2 text-sm text-gray-700">
                          {perm.icon} {perm.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center pt-2">
                  <input
                    id="rm-activo"
                    type="checkbox"
                    name="activo"
                    checked={newPermisoRM.activo}
                    onChange={handlePermisoRMChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label htmlFor="rm-activo" className="ml-2 text-sm text-gray-700 font-medium">
                    Permiso activo
                  </label>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                  <button
                    type="button"
                    onClick={closePermisoRMModal}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Guardar permiso
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: CREAR/EDITAR PERMISO ROL-PÁGINA */}
        {showPermisoRPModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  {currentPermisoRP ? "Editar" : "Crear"} Permiso Rol-Página
                </h2>
                <button onClick={closePermisoRPModal} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSavePermisoRP} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  {/* ROL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rol<span className="text-red-500">*</span>
                    </label>
                    <select
                      name="idRol"
                      value={newPermisoRP.idRol}
                      onChange={handlePermisoRPChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      disabled={!!currentPermisoRP}
                    >
                      <option value="">Seleccione un rol</option>
                      {rolesDisponibles.map((rol) => (
                        <option key={rol.idRol} value={rol.idRol}>
                          {rol.descRol || `Rol ${rol.idRol}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* MÓDULO */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Módulo<span className="text-red-500">*</span>
                    </label>
                    <select
                      value={moduloSeleccionado}
                      onChange={(e) => handleModuloChangeForPagina(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      disabled={!!currentPermisoRP}
                    >
                      <option value="">Seleccione un módulo</option>
                      {modulos.map((mod) => (
                        <option key={mod.id} value={mod.id}>
                          {mod.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* PÁGINA */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Página<span className="text-red-500">*</span>
                    </label>
                    <select
                      name="idPagina"
                      value={newPermisoRP.idPagina}
                      onChange={handlePermisoRPChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                      required
                      disabled={!moduloSeleccionado || !!currentPermisoRP}
                    >
                      <option value="">
                        {moduloSeleccionado ? "Seleccione una página" : "Primero seleccione un módulo"}
                      </option>
                      {paginasFiltradas.map((pag) => (
                        <option key={pag.idPagina} value={pag.idPagina}>
                          {pag.nombrePagina || `Página ${pag.idPagina}`}
                        </option>
                      ))}
                    </select>
                    {moduloSeleccionado && paginasFiltradas.length === 0 && (
                      <p className="text-xs text-amber-600 mt-1">
                        ⚠️ No hay páginas disponibles para este módulo
                      </p>
                    )}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Permisos</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { name: "puedeVer", label: "Ver", icon: "👁️" },
                      { name: "puedeCrear", label: "Crear", icon: "➕" },
                      { name: "puedeEditar", label: "Editar", icon: "✏️" },
                      { name: "puedeEliminar", label: "Eliminar", icon: "🗑️" },
                      { name: "puedeExportar", label: "Exportar", icon: "📥" },
                      { name: "puedeImportar", label: "Importar", icon: "📤" },
                      { name: "puedeAprobar", label: "Aprobar", icon: "✅" },
                    ].map((perm) => (
                      <div key={perm.name} className="flex items-center">
                        <input
                          id={`rp-${perm.name}`}
                          type="checkbox"
                          name={perm.name}
                          checked={newPermisoRP[perm.name]}
                          onChange={handlePermisoRPChange}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                        <label htmlFor={`rp-${perm.name}`} className="ml-2 text-sm text-gray-700">
                          {perm.icon} {perm.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center pt-2">
                  <input
                    id="rp-activo"
                    type="checkbox"
                    name="activo"
                    checked={newPermisoRP.activo}
                    onChange={handlePermisoRPChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label htmlFor="rp-activo" className="ml-2 text-sm text-gray-700 font-medium">
                    Permiso activo
                  </label>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                  <button
                    type="button"
                    onClick={closePermisoRPModal}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Guardar permiso
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}