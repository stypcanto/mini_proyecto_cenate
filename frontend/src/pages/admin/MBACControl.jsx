import React, { useState, useEffect } from "react";
import apiClient from "../../lib/apiClient";
import {
  Shield,
  Lock,
  Unlock,
  AlertCircle,
  Check,
  X,
  Search,
  Filter,
  Download,
  RefreshCw,
  Users,
  Database,
  Activity,
  Settings,
  Edit,
  Trash2,
  Plus,
} from "lucide-react";

export default function MBACControl() {
  const [activeTab, setActiveTab] = useState("permisos");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

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
        setRolesDisponibles(rolesRes);
        setPaginasDisponibles(paginasRes);
      } catch (error) {
        console.error("Error cargando roles y páginas:", error);
      }
    };
    if (activeTab === "permisos-crud") {
      fetchRolesYPaginas();
    }
  }, [activeTab]);

  // Datos de ejemplo (mantengo los originales)
  const mbacPermissions = [
    {
      id: "p001",
      code: "VIEW_DASHBOARD",
      name: "Ver Dashboard",
      description: "Permite visualizar el panel principal del sistema",
      category: "Dashboard",
      roles: ["Administrador", "Médico", "Enfermera"],
      critical: false,
      active: true,
    },
    {
      id: "p002",
      code: "VIEW_PATIENTS",
      name: "Ver Pacientes",
      description: "Permite visualizar la lista y detalles de pacientes",
      category: "Pacientes",
      roles: ["Administrador", "Médico", "Enfermera"],
      critical: false,
      active: true,
    },
    {
      id: "p003",
      code: "CREATE_PATIENT",
      name: "Crear Paciente",
      description: "Permite registrar nuevos pacientes en el sistema",
      category: "Pacientes",
      roles: ["Administrador", "Médico", "Recepcionista"],
      critical: false,
      active: true,
    },
    {
      id: "p004",
      code: "EDIT_PATIENT",
      name: "Editar Paciente",
      description: "Permite modificar información de pacientes existentes",
      category: "Pacientes",
      roles: ["Administrador", "Médico"],
      critical: false,
      active: true,
    },
    {
      id: "p005",
      code: "DELETE_PATIENT",
      name: "Eliminar Paciente",
      description: "Permite eliminar registros de pacientes",
      category: "Pacientes",
      roles: ["Administrador"],
      critical: true,
      active: true,
    },
    {
      id: "p006",
      code: "MANAGE_USERS",
      name: "Gestionar Usuarios",
      description: "Permite crear, editar y eliminar usuarios del sistema",
      category: "Administración",
      roles: ["Administrador"],
      critical: true,
      active: true,
    },
  ];

  const roles = [
    { id: 1, name: "Administrador", users: 3, permissions: 25, level: 1, active: true },
    { id: 2, name: "Médico", users: 12, permissions: 18, level: 2, active: true },
    { id: 3, name: "Enfermera", users: 20, permissions: 15, level: 3, active: true },
    { id: 4, name: "Recepcionista", users: 5, permissions: 8, level: 4, active: true },
  ];

  const usuarios = [
    {
      id: 1,
      name: "Juan Pérez",
      email: "juan@hospital.com",
      role: "Administrador",
      status: "active",
      lastLogin: "2024-01-15",
    },
    {
      id: 2,
      name: "María García",
      email: "maria@hospital.com",
      role: "Médico",
      status: "active",
      lastLogin: "2024-01-15",
    },
    {
      id: 3,
      name: "Carlos López",
      email: "carlos@hospital.com",
      role: "Enfermera",
      status: "active",
      lastLogin: "2024-01-14",
    },
    {
      id: 4,
      name: "Ana Martínez",
      email: "ana@hospital.com",
      role: "Recepcionista",
      status: "inactive",
      lastLogin: "2024-01-10",
    },
  ];

  const auditLogs = [
    {
      id: 1,
      user: "Juan Pérez",
      action: "Asignó permiso VIEW_PATIENTS",
      role: "Médico",
      timestamp: "2024-01-15 10:30:00",
      type: "permission",
    },
    {
      id: 2,
      user: "María García",
      action: "Editó expediente #1234",
      resource: "Expediente",
      timestamp: "2024-01-15 09:15:00",
      type: "edit",
    },
    {
      id: 3,
      user: "Juan Pérez",
      action: "Creó rol Supervisor",
      role: "Supervisor",
      timestamp: "2024-01-14 16:45:00",
      type: "create",
    },
    {
      id: 4,
      user: "Carlos López",
      action: "Inició sesión",
      resource: "Sistema",
      timestamp: "2024-01-14 08:00:00",
      type: "login",
    },
  ];

  const categories = ["Dashboard", "Pacientes", "Citas", "Expedientes", "Administración"];

  const filteredPermissions = mbacPermissions.filter((perm) => {
    const matchesSearch =
      perm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      perm.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      perm.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || perm.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPermissions = mbacPermissions.length;
  const activePermissions = mbacPermissions.filter((p) => p.active).length;
  const criticalPermissions = mbacPermissions.filter((p) => p.critical).length;

  const tabs = [
    { id: "permisos", label: "Permisos", icon: Shield },
    { id: "roles", label: "Roles", icon: Users },
    { id: "modulos", label: "Módulos", icon: Database },
    { id: "permisos-crud", label: "Permisos CRUD", icon: Settings },
    { id: "usuarios", label: "Usuarios", icon: Users },
    { id: "auditoria", label: "Auditoría", icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Control MBAC</h1>
            <p className="text-gray-600 mt-1">Control de Acceso Basado en Modelo - Gestión de Permisos</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl shadow-lg transition-all duration-200">
              <Download className="w-5 h-5" />
              Exportar
            </button>
            <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl shadow-lg transition-all duration-200">
              <RefreshCw className="w-5 h-5" />
              Sincronizar
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Total Permisos</p>
                <p className="text-3xl font-bold mt-1">{totalPermissions}</p>
              </div>
              <Shield className="w-12 h-12 opacity-30" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Permisos Activos</p>
                <p className="text-3xl font-bold mt-1">{activePermissions}</p>
              </div>
              <Check className="w-12 h-12 opacity-30" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">Permisos Críticos</p>
                <p className="text-3xl font-bold mt-1">{criticalPermissions}</p>
              </div>
              <AlertCircle className="w-12 h-12 opacity-30" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Roles Activos</p>
                <p className="text-3xl font-bold mt-1">{roles.length}</p>
              </div>
              <Users className="w-12 h-12 opacity-30" />
            </div>
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
            {/* TAB: PERMISOS (Original) */}
            {activeTab === "permisos" && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Buscar permiso..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="relative">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="pl-12 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white cursor-pointer"
                    >
                      <option value="all">Todas las categorías</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                          Permiso
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                          Código
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                          Categoría
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Roles</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Nivel</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                          Estado
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredPermissions.map((perm) => (
                        <tr key={perm.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-semibold text-gray-800 flex items-center gap-2">
                                {perm.critical && <AlertCircle className="w-4 h-4 text-red-500" />}
                                {perm.name}
                              </p>
                              <p className="text-sm text-gray-500 mt-1">{perm.description}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <code className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">{perm.code}</code>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                              {perm.category}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {perm.roles.map((role, idx) => (
                                <span key={idx} className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs">
                                  {role}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {perm.critical ? (
                              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm flex items-center gap-1 w-fit">
                                <Lock className="w-4 h-4" />
                                Crítico
                              </span>
                            ) : (
                              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center gap-1 w-fit">
                                <Unlock className="w-4 h-4" />
                                Normal
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {perm.active ? (
                              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center gap-1 w-fit">
                                <Check className="w-4 h-4" />
                                Activo
                              </span>
                            ) : (
                              <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm flex items-center gap-1 w-fit">
                                <X className="w-4 h-4" />
                                Inactivo
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: ROLES */}
            {activeTab === "roles" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">Gestión de Roles</h2>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Crear Rol
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {roles.map((rol) => (
                    <div
                      key={rol.id}
                      className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">{rol.name}</h3>
                          <p className="text-sm text-gray-600">Nivel jerárquico: {rol.level}</p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${
                            rol.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {rol.active ? "Activo" : "Inactivo"}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-2xl font-bold text-blue-600">{rol.users}</p>
                          <p className="text-sm text-gray-600">Usuarios asignados</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-purple-600">{rol.permissions}</p>
                          <p className="text-sm text-gray-600">Permisos totales</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

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

            {/* TAB: USUARIOS */}
            {activeTab === "usuarios" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">Gestión de Usuarios</h2>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Crear Usuario
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">ID</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Nombre</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Rol</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                          Último Acceso
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {usuarios.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-semibold">#{user.id}</td>
                          <td className="px-6 py-4 font-semibold text-gray-800">{user.name}</td>
                          <td className="px-6 py-4 text-gray-600">{user.email}</td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-600">{user.lastLogin}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-sm ${
                                user.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {user.status === "active" ? "Activo" : "Inactivo"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: AUDITORÍA */}
            {activeTab === "auditoria" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">Registro de Auditoría</h2>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    Exportar Logs
                  </button>
                </div>
                <div className="space-y-3">
                  {auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-all"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <Activity className="w-5 h-5 text-blue-600" />
                            <div>
                              <p className="font-semibold text-gray-800">{log.user}</p>
                              <p className="text-sm text-gray-600">{log.action}</p>
                              {log.role && (
                                <span className="inline-block mt-1 px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                                  {log.role}
                                </span>
                              )}
                              {log.resource && (
                                <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                  {log.resource}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">{log.timestamp}</p>
                          <span
                            className={`inline-block mt-1 px-2 py-1 rounded text-xs ${
                              log.type === "permission"
                                ? "bg-green-100 text-green-800"
                                : log.type === "edit"
                                ? "bg-yellow-100 text-yellow-800"
                                : log.type === "create"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {log.type}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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