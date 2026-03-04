// ========================================================================
// 🔍 BuscarAsegurado.jsx – Lista de Asegurados (CENATE 2025)
// ------------------------------------------------------------------------
// Lista completa de asegurados con paginación desde el backend
// Búsqueda unificada por DNI o nombre
// ========================================================================

import React, { useState, useEffect } from "react";
import {
  Search,
  Users,
  IdCard,
  Phone,
  Mail,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader,
  User,
  Shield,
  Eye,
  X,
  Building2,
  MapPinned,
  Network,
  Cake,
  Edit,
  Plus,
  Save,
  Trash2,
  FileText,
  Activity,
  CheckCircle,
  XCircle,
  Globe
} from "lucide-react";
import { apiClient } from '../../lib/apiClient';
import toast from "react-hot-toast";
import TrazabilidadClinicaTabs from "../../components/trazabilidad/TrazabilidadClinicaTabs";
import { usePermisos } from '../../context/PermisosContext';

// ── Clasificar documento usando idTipDoc primero, luego por formato ──
function clasificarDoc(doc, idTipDoc) {
  if (!doc || doc.trim() === '') return { label: '—', cls: 'bg-slate-100 text-slate-400' };
  // Si tiene tipo de documento explícito, usarlo como prioridad
  if (idTipDoc === 2 || idTipDoc === '2') return { label: 'C.E./Pas.', cls: 'bg-blue-100 text-blue-700' };
  if (idTipDoc === 1 || idTipDoc === '1') return { label: 'DNI',       cls: 'bg-emerald-100 text-emerald-700' };
  // Fallback: inferir por formato
  const v = doc.trim();
  if (/^\d{8}$/.test(v))        return { label: 'DNI',       cls: 'bg-emerald-100 text-emerald-700' };
  if (/^[A-Za-z0-9]{6,12}$/.test(v) && /[A-Za-z]/.test(v))
                                 return { label: 'C.E./Pas.', cls: 'bg-blue-100 text-blue-700' };
  if (/^\d{9,}$/.test(v))       return { label: 'Cód. Seg.', cls: 'bg-amber-100 text-amber-700' };
  if (/^\d{1,7}$/.test(v))      return { label: 'Incompleto',cls: 'bg-red-100 text-red-600' };
  return                                { label: 'Inválido',  cls: 'bg-red-100 text-red-600' };
}

export default function BuscarAsegurado() {
  const { esSuperAdmin, tienePermiso } = usePermisos();
  const puedeCrearAsegurado = esSuperAdmin || tienePermiso('/asegurados/buscar', 'crear');
  const [asegurados, setAsegurados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearchValue, setDebouncedSearchValue] = useState("");

  // Estados para acordeón de filtros
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);

  // ✅ Estados para los filtros
  const [redes, setRedes] = useState([]);
  const [ipress, setIpress] = useState([]);
  const [todasIpress, setTodasIpress] = useState([]);
  const [selectedRed, setSelectedRed] = useState("");
  const [selectedIpress, setSelectedIpress] = useState("");
  const [soloCenacron, setSoloCenacron] = useState(false);
  const [soloMaraton, setSoloMaraton] = useState(false);
  const [soloDniValido, setSoloDniValido] = useState(false);
  const [soloExtranjero, setSoloExtranjero] = useState(false);
  const [loadingFiltros, setLoadingFiltros] = useState(false);

  // 📋 Estados para tipos de documento
  const [tiposDocumento, setTiposDocumento] = useState([]);

  // 🔍 Estados para búsqueda de IPRESS en formulario
  const [ipressSearchText, setIpressSearchText] = useState('');
  const [ipressDropdownOpen, setIpressDropdownOpen] = useState(false);

  // Paginación desde el backend
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 25;

  // Modal de detalles
  const [showModal, setShowModal] = useState(false);
  const [detalleAsegurado, setDetalleAsegurado] = useState(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [tabActiva, setTabActiva] = useState('paciente'); // 'paciente', 'ipress', 'antecedentes'

  // Modal de formulario (crear/editar)
  const [showFormModal, setShowFormModal] = useState(false);
  const [modoFormulario, setModoFormulario] = useState('crear');
  const [formularioData, setFormularioData] = useState({
    docPaciente: '',
    idTipDoc: '1', // 📋 Por defecto DNI
    paciente: '',
    fecnacimpaciente: '',
    sexo: 'M',
    tipoPaciente: 'TITULAR',
    telFijo: '',
    telCelular: '',
    correoElectronico: '',
    tipoSeguro: 'TITULAR',
    casAdscripcion: '',
    periodo: new Date().getFullYear().toString(),
    pacienteCronico: false
  });
  const [loadingForm, setLoadingForm] = useState(false);

  // 🔍 Estados para validación de DNI en tiempo real
  const [dniStatus, setDniStatus] = useState(null); // null, "validando", "disponible", "duplicado"
  const [dniMessage, setDniMessage] = useState("");

  // ✅ Cargar filtros y tipos de documento al iniciar
  useEffect(() => {
    cargarRedes();
    cargarIpress();
    cargarTiposDocumento();
  }, []);

  const cargarTiposDocumento = async () => {
    try {
      const response = await apiClient.get('/asegurados/tipos-documento', true);
      setTiposDocumento(response || []);
    } catch (error) {
      console.error('Error al cargar tipos de documento:', error);
      // Si falla, usar por defecto
      setTiposDocumento([{ id_tip_doc: 1, desc_tip_doc: 'DNI' }]);
    }
  };

  // ✅ Cargar IPRESS cuando cambia la Red seleccionada
  useEffect(() => {
    if (selectedRed) {
      cargarIpress(selectedRed);
      setSelectedIpress("");
    } else {
      cargarIpress();
      setSelectedIpress("");
    }
  }, [selectedRed]);

  // ✅ Resetear página cuando cambian los filtros
  useEffect(() => {
    if (selectedRed || selectedIpress || soloCenacron || soloMaraton || soloDniValido || soloExtranjero) {
      setCurrentPage(0);
    }
  }, [selectedRed, selectedIpress, soloCenacron, soloMaraton, soloDniValido, soloExtranjero]);

  // ✅ Debounce para la búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchValue(searchValue);
      if (searchValue.trim()) {
        setCurrentPage(0);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchValue]);

  // Cargar asegurados con paginación
  useEffect(() => {
    cargarAsegurados();
  }, [currentPage, debouncedSearchValue, selectedRed, selectedIpress, soloCenacron, soloMaraton, soloDniValido, soloExtranjero]);

  // 🔍 Validar DNI en tiempo real cuando tiene 8 dígitos (solo cuando está creando)
  useEffect(() => {
    if (modoFormulario !== 'crear') {
      setDniStatus(null);
      setDniMessage("");
      return;
    }

    const dni = formularioData.docPaciente?.trim();

    // Si está vacío o tiene menos de 8 dígitos, limpiar estado
    if (!dni || dni.length < 8) {
      setDniStatus(null);
      setDniMessage("");
      return;
    }

    // Solo validar si tiene exactamente 8 dígitos y son todos numéricos
    if (dni.length !== 8 || !/^\d+$/.test(dni)) {
      return;
    }

    const abortController = new AbortController();
    let isMounted = true;

    const validarDniEnTiempoReal = async () => {
      try {
        setDniStatus("validando");
        const response = await fetch(`/api/asegurados/validar-dni/${dni}`, {
          signal: abortController.signal
        });
        const data = await response.json();

        // Solo actualizar si este componente sigue montado y el DNI no ha cambiado
        if (!isMounted || formularioData.docPaciente?.trim() !== dni) {
          return;
        }

        console.log("🔍 Respuesta validación DNI:", data);

        if (data.disponible) {
          setDniStatus("disponible");
          setDniMessage(data.mensaje || "✅ Este DNI está disponible");
        } else {
          setDniStatus("duplicado");
          setDniMessage(data.mensaje || "❌ Este DNI ya está registrado");
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log("⏹️ Validación cancelada para DNI:", dni);
          return;
        }
        console.error("❌ Error validando DNI:", error);
        setDniStatus(null);
        setDniMessage("");
      }
    };

    const timeout = setTimeout(validarDniEnTiempoReal, 500);

    return () => {
      isMounted = false;
      clearTimeout(timeout);
      abortController.abort();
    };
  }, [formularioData.docPaciente, modoFormulario]);

  const cargarAsegurados = async () => {
    try {
      setLoading(true);

      let response;

      if (debouncedSearchValue.trim()) {
        let params = `q=${encodeURIComponent(debouncedSearchValue)}&page=${currentPage}&size=${pageSize}`;
        if (selectedRed) params += `&idRed=${selectedRed}`;
        if (selectedIpress) params += `&codIpress=${encodeURIComponent(selectedIpress)}`;
        if (soloCenacron) params += `&cenacron=true`;
        if (soloMaraton) params += `&maraton=true`;
        if (soloDniValido) params += `&soloDniValido=true`;
        if (soloExtranjero) params += `&soloExtranjero=true`;

        response = await apiClient.get(`/asegurados/buscar?${params}`, true);
      } else {
        let params = `page=${currentPage}&size=${pageSize}`;
        if (soloCenacron) params += `&cenacron=true`;
        if (soloMaraton) params += `&maraton=true`;
        if (soloDniValido) params += `&soloDniValido=true`;
        if (soloExtranjero) params += `&soloExtranjero=true`;
        response = await apiClient.get(`/asegurados?${params}`, true);
      }

      setAsegurados(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);

      if (currentPage === 0 && debouncedSearchValue.trim()) {
        toast.success(`${response.totalElements || 0} resultados encontrados`);
      }
    } catch (error) {
      console.error("Error al cargar asegurados:", error);
      toast.error("Error al cargar la lista de asegurados");
      setAsegurados([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  const cargarRedes = async () => {
    try {
      setLoadingFiltros(true);
      const response = await apiClient.get('/asegurados/filtros/redes', true);
      setRedes(response || []);
    } catch (error) {
      console.error('Error al cargar redes:', error);
      toast.error('Error al cargar las redes');
    } finally {
      setLoadingFiltros(false);
    }
  };

  const cargarIpress = async (idRed = null) => {
    try {
      setLoadingFiltros(true);
      const url = idRed ? `/asegurados/filtros/ipress?idRed=${idRed}` : '/asegurados/filtros/ipress';
      const response = await apiClient.get(url, true);

      if (idRed) {
        setIpress(response || []);
      } else {
        setIpress(response || []);
        setTodasIpress(response || []);
      }
    } catch (error) {
      console.error('Error al cargar IPRESS:', error);
      toast.error('Error al cargar las IPRESS');
    } finally {
      setLoadingFiltros(false);
    }
  };

  const limpiarFiltros = () => {
    setSelectedRed("");
    setSelectedIpress("");
    setSoloCenacron(false);
    setSoloMaraton(false);
    setSoloDniValido(false);
    setSoloExtranjero(false);
    setSearchValue("");
    setCurrentPage(0);
  };

  const aseguradosFiltrados = asegurados;

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const obtenerDetalles = async (pkAsegurado) => {
    try {
      setLoadingDetalle(true);
      const response = await apiClient.get(`/asegurados/detalle/${pkAsegurado}`, true);
      setDetalleAsegurado(response);
      setShowModal(true);
    } catch (error) {
      console.error("Error al obtener detalles:", error);
      toast.error("Error al cargar los detalles del asegurado");
    } finally {
      setLoadingDetalle(false);
    }
  };

  const cerrarModal = () => {
    setShowModal(false);
    setDetalleAsegurado(null);
    setTabActiva('paciente'); // Reset tab al cerrar
  };

  const abrirFormularioCrear = () => {
    setModoFormulario('crear');
    setFormularioData({
      docPaciente: '',
      idTipDoc: '1', // 📋 Por defecto DNI
      paciente: '',
      fecnacimpaciente: '',
      sexo: 'M',
      tipoPaciente: 'TITULAR',
      telFijo: '',
      telCelular: '',
      correoElectronico: '',
      tipoSeguro: 'TITULAR',
      casAdscripcion: '',
      periodo: new Date().getFullYear().toString(),
      pacienteCronico: false
    });
    setDniStatus(null);
    setDniMessage("");
    setIpressSearchText('');
    setIpressDropdownOpen(false);
    if (todasIpress.length === 0) {
      cargarIpress();
    }
    setShowFormModal(true);
  };

  const abrirFormularioEditar = async (pkAsegurado) => {
    try {
      setLoadingDetalle(true);

      if (todasIpress.length === 0) {
        await cargarIpress();
      }

      const response = await apiClient.get(`/asegurados/detalle/${pkAsegurado}`, true);

      let fechaFormateada = '';
      if (response.asegurado.fecnacimpaciente) {
        const fecha = new Date(response.asegurado.fecnacimpaciente);
        const offsetMs = fecha.getTimezoneOffset() * 60 * 1000;
        const fechaLocal = new Date(fecha.getTime() + offsetMs);
        fechaFormateada = fechaLocal.toISOString().split('T')[0];
      }

      setModoFormulario('editar');
      setFormularioData({
        pkAsegurado: response.asegurado.pkAsegurado,
        docPaciente: response.asegurado.docPaciente || '',
        idTipDoc: response.asegurado.idTipDoc?.toString() || '1', // 📋 Tipo de documento
        paciente: response.asegurado.paciente || '',
        fecnacimpaciente: fechaFormateada,
        sexo: response.asegurado.sexo || 'M',
        tipoPaciente: response.asegurado.tipoPaciente || 'TITULAR',
        telFijo: response.asegurado.telFijo || '',
        telCelular: response.asegurado.telCelular || '',
        correoElectronico: response.asegurado.correoElectronico || '',
        tipoSeguro: response.asegurado.tipoSeguro || 'TITULAR',
        casAdscripcion: response.asegurado.casAdscripcion || '',
        periodo: response.asegurado.periodo || new Date().getFullYear().toString(),
        pacienteCronico: Boolean(response.asegurado.pacienteCronico)
      });
      setIpressSearchText('');
      setIpressDropdownOpen(false);
      setShowFormModal(true);
    } catch (error) {
      console.error("Error al cargar datos del asegurado:", error);
      toast.error("Error al cargar los datos del asegurado");
    } finally {
      setLoadingDetalle(false);
    }
  };

  const cerrarFormulario = () => {
    setShowFormModal(false);
    setFormularioData({
      docPaciente: '',
      idTipDoc: '1', // 📋 Por defecto DNI
      paciente: '',
      fecnacimpaciente: '',
      sexo: 'M',
      tipoPaciente: 'TITULAR',
      telFijo: '',
      telCelular: '',
      correoElectronico: '',
      tipoSeguro: 'TITULAR',
      casAdscripcion: '',
      periodo: new Date().getFullYear().toString(),
      pacienteCronico: false
    });
    setDniStatus(null);
    setDniMessage("");
    setIpressSearchText('');
    setIpressDropdownOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const finalValue = name === 'paciente' ? value.toUpperCase() : value;

    setFormularioData(prev => ({
      ...prev,
      [name]: finalValue
    }));

    // 🔍 Si cambiamos el DNI, limpiar validación anterior inmediatamente
    if (name === 'docPaciente') {
      setDniStatus(null);
      setDniMessage("");
    }
  };

  const guardarAsegurado = async (e) => {
    e.preventDefault();

    if (!formularioData.docPaciente || !formularioData.paciente ||
      !formularioData.fecnacimpaciente || !formularioData.telFijo ||
      !formularioData.casAdscripcion || !formularioData.periodo) {
      toast.error('Por favor completa todos los campos obligatorios (marcados con *)');
      return;
    }

    // 🔒 Validar que DNI no esté duplicado (solo en modo crear)
    if (modoFormulario === 'crear') {
      if (dniStatus === "duplicado") {
        toast.error("❌ Este DNI ya está registrado en el sistema. No se puede crear un duplicado.");
        return;
      }

      // 🔒 Esperar validación del DNI
      if (dniStatus === "validando") {
        toast.error("⏳ Aguarde a que se valide el DNI...");
        return;
      }
    }

    try {
      setLoadingForm(true);

      if (modoFormulario === 'crear') {
        await apiClient.post('/asegurados', formularioData, true);
        toast.success('Asegurado creado exitosamente');
      } else {
        await apiClient.put(`/asegurados/${formularioData.pkAsegurado}`, formularioData, true);
        toast.success('Asegurado actualizado exitosamente');
      }

      cerrarFormulario();
      cargarAsegurados();
    } catch (error) {
      console.error('Error al guardar asegurado:', error);

      // Detectar error de DNI duplicado
      const errorMessage = error.message || error.toString();
      if (errorMessage.includes('duplicate key') && errorMessage.includes('doc_paciente')) {
        toast.error(`❌ El DNI ${formularioData.docPaciente} ya está registrado en el sistema`);
      } else {
        const errorMsg = error.response?.data?.message || error.message || 'Error al guardar el asegurado';
        toast.error(errorMsg);
      }
    } finally {
      setLoadingForm(false);
    }
  };

  const eliminarAsegurado = async (pkAsegurado, nombrePaciente) => {
    if (!window.confirm(`¿Estás seguro de eliminar al asegurado ${nombrePaciente}?`)) {
      return;
    }

    try {
      await apiClient.delete(`/asegurados/${pkAsegurado}`, true);
      toast.success('Asegurado eliminado exitosamente');
      cargarAsegurados();
    } catch (error) {
      console.error('Error al eliminar asegurado:', error);
      toast.error('Error al eliminar el asegurado');
    }
  };

  const startIndex = currentPage * pageSize + 1;
  const endIndex = Math.min((currentPage + 1) * pageSize, totalElements);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-50 px-1 py-3">
      <div className="w-full space-y-3">
        {/* Header */ }
        <div className="flex items-center justify-between px-3">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 p-2 rounded-lg">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Lista de Asegurados
              </h1>
              <p className="text-sm text-slate-600">
                Total: { totalElements.toLocaleString() } registrados
              </p>
            </div>
          </div>

          <div className="flex gap-2 flex-shrink-0">
            { puedeCrearAsegurado && (
              <button
                onClick={ abrirFormularioCrear }
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg
                         text-sm font-medium transition-all shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Agregar
              </button>
            ) }
            <button
              onClick={ cargarAsegurados }
              disabled={ loading }
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg 
                       text-sm font-medium transition-all shadow-md hover:shadow-lg disabled:opacity-50"
            >
              { loading ? "Cargando..." : "Actualizar" }
            </button>
          </div>
        </div>

        {/* Filtros Colapsables */ }
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <button
            onClick={ () => setFiltrosAbiertos(!filtrosAbiertos) }
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Network className="w-4 h-4 text-emerald-600" />
              <h3 className="text-base font-semibold text-slate-900">
                Filtros y Búsqueda
              </h3>
              { (selectedRed || selectedIpress || searchValue || soloCenacron || soloMaraton || soloExtranjero) && (
                <span className="bg-emerald-100 text-emerald-800 text-xs font-medium px-2 py-0.5 rounded-full">
                  Activos
                </span>
              ) }
            </div>
            <div className="flex items-center gap-2">
              { (selectedRed || selectedIpress || searchValue || soloCenacron || soloMaraton || soloExtranjero) && (
                <span
                  onClick={ (e) => {
                    e.stopPropagation();
                    limpiarFiltros();
                  } }
                  role="button"
                  tabIndex={ 0 }
                  onKeyDown={ (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.stopPropagation();
                      limpiarFiltros();
                    }
                  } }
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-medium px-2 py-1 hover:bg-emerald-50 rounded cursor-pointer"
                >
                  Limpiar
                </span>
              ) }
              <ChevronRight
                className={ `w-5 h-5 text-slate-400 transition-transform ${filtrosAbiertos ? 'rotate-90' : ''
                  }` }
              />
            </div>
          </button>

          { filtrosAbiertos && (
            <div className="px-4 py-3 border-t border-slate-100 space-y-2">
              {/* Fila 1: Red · IPRESS · CENACRON */}
              <div className="flex flex-wrap items-end gap-3">
                <div className="flex-1 min-w-[160px]">
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    <Network className="w-3 h-3 inline mr-1" />Red
                  </label>
                  <select
                    value={ selectedRed }
                    onChange={ (e) => setSelectedRed(e.target.value) }
                    disabled={ loadingFiltros }
                    className="w-full px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg text-slate-900
                             focus:outline-none focus:border-emerald-500 transition-all disabled:opacity-50"
                  >
                    <option value="">Todas las redes</option>
                    { redes.map((red) => (
                      <option key={ red.idRed } value={ red.idRed }>{ red.descRed }</option>
                    )) }
                  </select>
                </div>

                <div className="flex-1 min-w-[180px]">
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    <Building2 className="w-3 h-3 inline mr-1" />IPRESS
                  </label>
                  <select
                    value={ selectedIpress }
                    onChange={ (e) => setSelectedIpress(e.target.value) }
                    disabled={ !selectedRed || loadingFiltros }
                    className="w-full px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg text-slate-900
                             focus:outline-none focus:border-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">{ selectedRed ? 'Todas las IPRESS' : 'Selecciona una red' }</option>
                    { ipress.map((i) => (
                      <option key={ i.codIpress } value={ i.codIpress }>
                        { i.descIpress } ({ i.codIpress })
                      </option>
                    )) }
                  </select>
                </div>

                <div className="flex-shrink-0 pb-0.5 flex gap-2">
                  <button
                    type="button"
                    onClick={ () => { setSoloCenacron(v => !v); setCurrentPage(0); } }
                    className={ `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold border-2 transition-all whitespace-nowrap
                      ${soloCenacron
                        ? 'bg-purple-600 border-purple-600 text-white'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-purple-400 hover:text-purple-600'
                      }` }
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                    Solo CENACRON
                  </button>
                  <button
                    type="button"
                    onClick={ () => { setSoloMaraton(v => !v); setCurrentPage(0); } }
                    className={ `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold border-2 transition-all whitespace-nowrap
                      ${soloMaraton
                        ? 'bg-orange-600 border-orange-600 text-white'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-orange-400 hover:text-orange-600'
                      }` }
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                    </svg>
                    Solo MARATÓN
                  </button>
                  <button
                    type="button"
                    onClick={ () => { setSoloDniValido(v => !v); setCurrentPage(0); } }
                    className={ `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold border-2 transition-all whitespace-nowrap
                      ${soloDniValido
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-400 hover:text-emerald-600'
                      }` }
                  >
                    <IdCard className="w-3.5 h-3.5" />
                    Solo DNI válido
                  </button>
                  <button
                    type="button"
                    onClick={ () => { setSoloExtranjero(v => !v); setCurrentPage(0); } }
                    className={ `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold border-2 transition-all whitespace-nowrap
                      ${soloExtranjero
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600'
                      }` }
                  >
                    <Globe className="w-3.5 h-3.5" />
                    Solo Extranjeros
                  </button>
                </div>
              </div>

              {/* Fila 2: Buscador */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={ searchValue }
                  onChange={ (e) => setSearchValue(e.target.value) }
                  placeholder="Buscar por DNI o nombre completo..."
                  className="w-full pl-10 pr-8 py-1.5 text-sm border border-slate-200 rounded-lg text-slate-900
                           focus:outline-none focus:border-emerald-500 transition-all"
                />
                { searchValue !== debouncedSearchValue && searchValue.trim()
                  ? <Loader className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600 animate-spin" />
                  : searchValue && (
                    <button onClick={ () => setSearchValue('') } className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )
                }
              </div>
            </div>
          ) }
        </div>

        {/* Tabla de asegurados */ }
        { loading ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
            <Loader className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
            <p className="text-slate-600 font-medium">Cargando asegurados...</p>
          </div>
        ) : aseguradosFiltrados.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
            <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              No se encontraron asegurados
            </h3>
            <p className="text-slate-600">
              { searchValue
                ? "No se encontraron resultados. Intenta con otro término de búsqueda."
                : "No hay asegurados registrados" }
            </p>
          </div>
        ) : (
          <>
            {/* Tabla */ }
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full" style={{ tableLayout: 'auto' }}>
                  <thead>
                    <tr className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white border-b-2 border-emerald-800">
                      <th className="px-2.5 py-3 text-center text-xs font-bold uppercase tracking-wider whitespace-nowrap" style={{ width: '50px' }}>
                        N°
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider whitespace-nowrap" style={{ width: '90px' }}>
                        Tipo Doc
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider whitespace-nowrap" style={{ width: '110px' }}>
                        Documento
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                        Nombre
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider whitespace-nowrap" style={{ width: '140px' }}>
                        Teléfono
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                        IPRESS Adscripción
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                        IPRESS Atención
                      </th>
                      <th className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wider whitespace-nowrap" style={{ width: '100px' }}>
                        ACC
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    { aseguradosFiltrados.map((asegurado, index) => {
                      const globalIndex = currentPage * pageSize + index + 1;
                      return (
                        <tr
                          key={ asegurado.pkAsegurado || index }
                          className="hover:bg-emerald-50 transition-colors"
                        >
                          <td className="px-2.5 py-3 text-xs text-slate-600 text-center font-medium" style={{ width: '50px' }}>
                            { globalIndex }
                          </td>
                          <td className="px-3 py-3 text-sm" style={{ width: '90px' }}>
                            {(() => {
                              const { label, cls } = clasificarDoc(asegurado.docPaciente, asegurado.idTipDoc);
                              return (
                                <span className={`inline-block px-1.5 py-0.5 rounded text-[11px] font-semibold ${cls}`}>
                                  {label}
                                </span>
                              );
                            })()}
                          </td>
                          <td className="px-3 py-3 text-sm text-slate-900 font-mono" style={{ width: '110px' }}>
                            { asegurado.docPaciente || "-" }
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm text-slate-900 font-medium" title={ asegurado.paciente }>
                                { asegurado.paciente || "-" }
                              </span>
                              { (asegurado.pacienteCronico || asegurado.esCenacronPe) && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-600 text-white leading-none">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                                  CENACRON
                                </span>
                              ) }
                              { asegurado.esMaraton && (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '1px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '700', background: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d', lineHeight: 1.4 }}>
                                  🏃 MARATÓN
                                </span>
                              ) }
                            </div>
                            <div className="text-xs text-slate-500 mt-1">
                              { asegurado.sexo === 'M' ? '👨 M' :
                                asegurado.sexo === 'F' ? '👩 F' : '?' }
                              { asegurado.tipoPaciente && (
                                <span className="ml-2 bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded text-xs font-medium">
                                  { asegurado.tipoPaciente.substring(0, 3) }
                                </span>
                              ) }
                            </div>
                          </td>
                          <td className="px-3 py-3 text-sm text-slate-900" style={{ width: '140px' }}>
                            { asegurado.telFijo || "-" }
                          </td>
                          <td className="px-3 py-3">
                            <div className="text-sm">
                              <div className="font-medium text-slate-900" title={ asegurado.nombreIpress }>
                                { asegurado.nombreIpress || "-" }
                              </div>
                              <div className="text-xs text-slate-500 mt-1">
                                Cód: <span className="font-mono">{ asegurado.casAdscripcion || "N/A" }</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <div className="text-sm">
                              { asegurado.nombreIpressAtencion ? (
                                <>
                                  <div className="font-medium text-slate-900" title={ asegurado.nombreIpressAtencion }>
                                    { asegurado.nombreIpressAtencion }
                                  </div>
                                  <div className="text-xs text-slate-500 mt-1">
                                    Cód: <span className="font-mono">{ asegurado.codIpressAtencion || "N/A" }</span>
                                  </div>
                                </>
                              ) : (
                                <span className="text-slate-400 text-xs">Sin bolsa</span>
                              ) }
                            </div>
                          </td>
                          <td className="px-2.5 py-3" style={{ width: '110px' }}>
                            <div className="flex items-center justify-center gap-1.5">
                              {/* Botón Ver */}
                              <div className="relative group">
                                <button
                                  onClick={ () => obtenerDetalles(asegurado.pkAsegurado) }
                                  disabled={ loadingDetalle }
                                  className="w-8 h-8 flex items-center justify-center rounded-lg
                                           bg-emerald-50 text-emerald-600 border border-emerald-200
                                           hover:bg-emerald-500 hover:text-white hover:border-emerald-500
                                           shadow-sm hover:shadow-md transition-all duration-200
                                           disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
                                  Ver detalle
                                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                                </div>
                              </div>

                              {/* Botón Editar — solo roles autorizados */}
                              { puedeCrearAsegurado && (
                                <div className="relative group">
                                  <button
                                    onClick={ () => abrirFormularioEditar(asegurado.pkAsegurado) }
                                    disabled={ loadingDetalle }
                                    className="w-8 h-8 flex items-center justify-center rounded-lg
                                             bg-blue-50 text-blue-600 border border-blue-200
                                             hover:bg-blue-500 hover:text-white hover:border-blue-500
                                             shadow-sm hover:shadow-md transition-all duration-200
                                             disabled:opacity-40 disabled:cursor-not-allowed"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
                                    Editar asegurado
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                                  </div>
                                </div>
                              ) }

                              {/* Botón Eliminar — solo SUPERADMIN */}
                              { esSuperAdmin && (
                                <div className="relative group">
                                  <button
                                    onClick={ () => eliminarAsegurado(asegurado.pkAsegurado, asegurado.paciente) }
                                    className="w-8 h-8 flex items-center justify-center rounded-lg
                                             bg-red-50 text-red-500 border border-red-200
                                             hover:bg-red-500 hover:text-white hover:border-red-500
                                             shadow-sm hover:shadow-md transition-all duration-200"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
                                    Eliminar asegurado
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                                  </div>
                                </div>
                              ) }
                            </div>
                          </td>
                        </tr>
                      );
                    }) }
                  </tbody>
                </table>
              </div>
            </div>

            {/* Controles de paginación */ }
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-600">
                  Mostrando{ " " }
                  <span className="font-semibold text-slate-900">
                    { startIndex }
                  </span>{ " " }
                  -{ " " }
                  <span className="font-semibold text-slate-900">
                    { endIndex }
                  </span>{ " " }
                  de{ " " }
                  <span className="font-semibold text-slate-900">
                    { totalElements.toLocaleString() }
                  </span>{ " " }
                  asegurados
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={ handlePreviousPage }
                    disabled={ currentPage === 0 }
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 
                             text-slate-700 font-medium transition-all
                             hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Anterior
                  </button>

                  <div className="flex items-center gap-1">
                    <span className="px-4 py-2 text-sm font-medium text-slate-900">
                      Página { currentPage + 1 } de { totalPages }
                    </span>
                  </div>

                  <button
                    onClick={ handleNextPage }
                    disabled={ currentPage >= totalPages - 1 }
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 
                             text-slate-700 font-medium transition-all
                             hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </>
        ) }
      </div>

      {/* Modal de Detalles */ }
      { showModal && detalleAsegurado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <User className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Detalles del Asegurado</h2>
              </div>
              <button
                onClick={ cerrarModal }
                className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-all"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Navegación de Tabs */ }
            <div className="border-b border-slate-200 bg-slate-50">
              <div className="px-6">
                <div className="grid grid-cols-3 gap-0">
                  <button
                    onClick={ () => setTabActiva('paciente') }
                    className={ `flex items-center justify-center gap-2 px-4 py-4 text-sm font-semibold transition-all border-b-2 ${tabActiva === 'paciente'
                      ? 'border-emerald-500 text-emerald-700 bg-white'
                      : 'border-transparent text-slate-600 hover:text-emerald-600 hover:bg-emerald-50'
                      }` }
                  >
                    <User className="w-4 h-4" />
                    Información del Paciente
                  </button>
                  <button
                    onClick={ () => setTabActiva('ipress') }
                    className={ `flex items-center justify-center gap-2 px-4 py-4 text-sm font-semibold transition-all border-b-2 ${tabActiva === 'ipress'
                      ? 'border-emerald-500 text-emerald-700 bg-white'
                      : 'border-transparent text-slate-600 hover:text-emerald-600 hover:bg-emerald-50'
                      }` }
                  >
                    <Building2 className="w-4 h-4" />
                    Centro de Adscripción
                  </button>
                  <button
                    onClick={ () => setTabActiva('antecedentes') }
                    className={ `flex items-center justify-center gap-2 px-4 py-4 text-sm font-semibold transition-all border-b-2 ${tabActiva === 'antecedentes'
                      ? 'border-emerald-500 text-emerald-700 bg-white'
                      : 'border-transparent text-slate-600 hover:text-emerald-600 hover:bg-emerald-50'
                      }` }
                  >
                    <Activity className="w-4 h-4" />
                    Antecedentes Clínicos
                  </button>
                </div>
              </div>
            </div>

            {/* Contenido de los Tabs */ }
            <div className="p-6">
              {/* Tab 1: Información del Paciente */ }
              { tabActiva === 'paciente' && (
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <IdCard className="w-5 h-5 text-emerald-600" />
                    Información de Paciente
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-600">📋 Tipo de Documento</label>
                      <p className="text-lg font-semibold text-slate-900 mt-1">
                        {tiposDocumento.find(t => t.id_tip_doc === parseInt(detalleAsegurado.asegurado.idTipDoc || '1'))?.desc_tip_doc || 'DNI'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Documento</label>
                      <p className="text-lg font-semibold text-slate-900 mt-1">
                        { detalleAsegurado.asegurado.docPaciente || "No registrado" }
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Nombre Completo</label>
                      <p className="text-lg font-semibold text-slate-900 mt-1">
                        { detalleAsegurado.asegurado.paciente || "No especificado" }
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Fecha de Nacimiento</label>
                      <p className="text-base text-slate-900 mt-1">
                        { detalleAsegurado.asegurado.fecnacimpaciente
                          ? new Date(detalleAsegurado.asegurado.fecnacimpaciente).toLocaleDateString('es-PE', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric'
                          })
                          : "No registrado" }
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Edad</label>
                      <p className="text-base text-slate-900 mt-1">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          <Cake className="w-4 h-4 mr-1" />
                          { detalleAsegurado.asegurado.edad ? `${detalleAsegurado.asegurado.edad} años` : "No calculado" }
                        </span>
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Sexo</label>
                      <p className="text-base text-slate-900 mt-1">
                        { detalleAsegurado.asegurado.sexo === 'M' ? '👨 Masculino' :
                          detalleAsegurado.asegurado.sexo === 'F' ? '👩 Femenino' : 'No especificado' }
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Teléfono móvil principal</label>
                      <p className="text-base text-slate-900 mt-1 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-emerald-600" />
                        { detalleAsegurado.asegurado.telFijo || "No registrado" }
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Teléfono celular o fijo alterno</label>
                      <p className="text-base text-slate-900 mt-1 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-indigo-600" />
                        { detalleAsegurado.asegurado.telCelular || "No registrado" }
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Correo Electrónico</label>
                      <p className="text-base text-slate-900 mt-1 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-blue-600" />
                        { detalleAsegurado.asegurado.correoElectronico || "No registrado" }
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Tipo de Paciente</label>
                      <p className="text-base text-slate-900 mt-1">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-200 text-slate-800">
                          { detalleAsegurado.asegurado.tipoPaciente || "No especificado" }
                        </span>
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Tipo de Seguro</label>
                      <p className="text-base text-slate-900 mt-1">
                        <span className={ `inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${detalleAsegurado.asegurado.tipoSeguro === 'TITULAR'
                          ? 'bg-blue-100 text-blue-800'
                          : detalleAsegurado.asegurado.tipoSeguro === 'CONYUGE'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-slate-100 text-slate-800'
                          }` }>
                          { detalleAsegurado.asegurado.tipoSeguro || "No especificado" }
                        </span>
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Periodo</label>
                      <p className="text-base text-slate-900 mt-1">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800">
                          { detalleAsegurado.asegurado.periodo || "No especificado" }
                        </span>
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Programa CENACRON</label>
                      <p className="text-base text-slate-900 mt-1">
                        { detalleAsegurado.asegurado.pacienteCronico ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-purple-600 text-white shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                            CENACRON
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-500">
                            No pertenece
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ) }

              {/* Tab 2: Centro de Adscripción */ }
              { tabActiva === 'ipress' && (
                <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-200">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-emerald-600" />
                    Información de IPRESS (Centro de Adscripción)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-600">Código de Adscripción</label>
                      <p className="text-lg font-semibold text-slate-900 mt-1">
                        { detalleAsegurado.ipress.codAdscripcion || "No registrado" }
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Nombre de IPRESS</label>
                      <p className="text-lg font-semibold text-slate-900 mt-1">
                        { detalleAsegurado.ipress.nombreIpress || "No registrado" }
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                        <MapPinned className="w-4 h-4 text-emerald-600" />
                        Dirección
                      </label>
                      <p className="text-base text-slate-900 mt-1">
                        { detalleAsegurado.ipress.direccionIpress || "No registrado" }
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Tipo de IPRESS</label>
                      <p className="text-base text-slate-900 mt-1">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          { detalleAsegurado.ipress.tipoIpress || "No especificado" }
                        </span>
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Nivel de Atención</label>
                      <p className="text-base text-slate-900 mt-1">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                          { detalleAsegurado.ipress.nivelAtencion || "No especificado" }
                        </span>
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                        <Network className="w-4 h-4 text-emerald-600" />
                        Red Asistencial
                      </label>
                      <p className="text-base text-slate-900 mt-1">
                        { detalleAsegurado.ipress.nombreRed || "No registrado" }
                      </p>
                    </div>
                  </div>
                </div>
              ) }

              {/* Tab 3: Antecedentes Clínicos */ }
              { tabActiva === 'antecedentes' && (
                <TrazabilidadClinicaTabs pkAsegurado={ detalleAsegurado.asegurado.pkAsegurado } />
              ) }
            </div>

            <div className="sticky bottom-0 bg-slate-50 px-6 py-4 rounded-b-2xl border-t border-slate-200 flex justify-end">
              <button
                onClick={ cerrarModal }
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg 
                         font-medium transition-all shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cerrar
              </button>
            </div>
          </div>
        </div>
      ) }

      {/* Modal de Formulario (Crear/Editar) */ }
      { showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  { modoFormulario === 'crear' ? (
                    <Plus className="w-6 h-6 text-white" />
                  ) : (
                    <Edit className="w-6 h-6 text-white" />
                  ) }
                </div>
                <h2 className="text-2xl font-bold text-white">
                  { modoFormulario === 'crear' ? 'Agregar Nuevo Asegurado' : 'Editar Asegurado' }
                </h2>
              </div>
              <button
                onClick={ cerrarFormulario }
                className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-all"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <form onSubmit={ guardarAsegurado } className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 📋 Tipo de Documento PRIMERO */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    📋 Tipo de Documento <span className="text-red-600">*</span>
                  </label>
                  <select
                    name="idTipDoc"
                    value={ formularioData.idTipDoc }
                    onChange={ handleInputChange }
                    required
                    disabled={ modoFormulario === 'editar' && !esSuperAdmin }
                    className={`w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg text-slate-900
                             focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100
                             transition-all ${modoFormulario === 'editar' && !esSuperAdmin ? 'bg-slate-100 cursor-not-allowed' : ''}`}
                  >
                    <option value="">-- Selecciona tipo --</option>
                    {tiposDocumento && Array.isArray(tiposDocumento) && tiposDocumento.length > 0 ? (
                      tiposDocumento.map((tipo) => (
                        <option key={ tipo.id_tip_doc } value={ tipo.id_tip_doc }>
                          { tipo.desc_tip_doc }
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="1">DNI</option>
                        <option value="2">C.E./PAS</option>
                        <option value="3">PASAPORT</option>
                      </>
                    )}
                  </select>
                  <p className="text-xs text-slate-500 mt-1">
                    { modoFormulario === 'editar' && !esSuperAdmin
                      ? 'No se puede cambiar el tipo de documento después de crear'
                      : 'Selecciona el tipo de documento' }
                  </p>
                </div>

                {/* DNI / Documento */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    <IdCard className="w-4 h-4 inline mr-1" />
                    Documento <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="docPaciente"
                      value={ formularioData.docPaciente }
                      onChange={ handleInputChange }
                      required
                      maxLength="20"
                      disabled={ loadingForm || (modoFormulario === 'editar' && !esSuperAdmin) }
                      className={`w-full px-4 py-2.5 border-2 rounded-lg text-slate-900 transition-all ${
                        modoFormulario === 'editar' && !esSuperAdmin
                          ? 'border-slate-200 bg-slate-100 cursor-not-allowed'
                          : dniStatus === "disponible"
                          ? "border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-100 focus:outline-none"
                          : dniStatus === "duplicado"
                          ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 focus:outline-none"
                          : dniStatus === "validando"
                          ? "border-yellow-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100 focus:outline-none"
                          : "border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none"
                      }`}
                      placeholder="12345678"
                    />
                    {/* Indicador de estado */}
                    { modoFormulario === 'crear' && dniStatus === "disponible" && (
                      <CheckCircle className="absolute right-3 top-2.5 w-5 h-5 text-green-600" />
                    ) }
                    { modoFormulario === 'crear' && dniStatus === "duplicado" && (
                      <XCircle className="absolute right-3 top-2.5 w-5 h-5 text-red-600" />
                    ) }
                    { modoFormulario === 'crear' && dniStatus === "validando" && (
                      <Loader className="absolute right-3 top-2.5 w-5 h-5 text-yellow-600 animate-spin" />
                    ) }
                  </div>

                  {/* Mensaje de validación */}
                  { modoFormulario === 'crear' && dniMessage && (
                    <p className={`text-sm mt-1 ${ dniStatus === "disponible" ? "text-green-600" : "text-red-600" }`}>
                      { dniMessage }
                    </p>
                  ) }
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    <User className="w-4 h-4 inline mr-1" />
                    Nombre Completo <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="paciente"
                    value={ formularioData.paciente }
                    onChange={ handleInputChange }
                    required
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg text-slate-900
                             focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100
                             transition-all"
                    placeholder="Juan Pérez García"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Fecha de Nacimiento <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    name="fecnacimpaciente"
                    value={ formularioData.fecnacimpaciente }
                    onChange={ handleInputChange }
                    required
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg text-slate-900
                             focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100
                             transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Sexo <span className="text-red-600">*</span>
                  </label>
                  <select
                    name="sexo"
                    value={ formularioData.sexo }
                    onChange={ handleInputChange }
                    required
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg text-slate-900
                             focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100
                             transition-all"
                  >
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    <User className="w-4 h-4 inline mr-1" />
                    Tipo de Paciente <span className="text-red-600">*</span>
                  </label>
                  <select
                    name="tipoPaciente"
                    value={ formularioData.tipoPaciente }
                    onChange={ handleInputChange }
                    required
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg text-slate-900
                             focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100
                             transition-all"
                  >
                    <option value="TITULAR">Titular</option>
                    <option value="DEPENDIENTE">Dependiente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Teléfono móvil principal <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="telFijo"
                    value={ formularioData.telFijo }
                    onChange={ handleInputChange }
                    required
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg text-slate-900
                             focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100
                             transition-all"
                    placeholder="999888777"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Teléfono celular o fijo alterno
                  </label>
                  <input
                    type="text"
                    name="telCelular"
                    value={ formularioData.telCelular }
                    onChange={ handleInputChange }
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg text-slate-900
                             focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100
                             transition-all"
                    placeholder="987654321"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    name="correoElectronico"
                    value={ formularioData.correoElectronico }
                    onChange={ handleInputChange }
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg text-slate-900
                             focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100
                             transition-all"
                    placeholder="ejemplo@correo.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    <Shield className="w-4 h-4 inline mr-1" />
                    Tipo de Seguro <span className="text-red-600">*</span>
                  </label>
                  <select
                    name="tipoSeguro"
                    value={ formularioData.tipoSeguro }
                    onChange={ handleInputChange }
                    required
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg text-slate-900
                             focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100
                             transition-all"
                  >
                    <option value="TITULAR">Titular</option>
                    <option value="CONYUGE">Cónyuge</option>
                    <option value="HIJO">Hijo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    <Building2 className="w-4 h-4 inline mr-1" />
                    IPRESS <span className="text-red-600">*</span>
                  </label>
                  {/* Combobox con búsqueda de IPRESS */}
                  <div className="relative">
                    <input
                      type="text"
                      value={ ipressSearchText || (formularioData.casAdscripcion
                        ? (() => {
                            const found = todasIpress.find(i => i.codIpress === formularioData.casAdscripcion);
                            return found ? `${found.descIpress} - Cód: ${found.codIpress}` : formularioData.casAdscripcion;
                          })()
                        : '') }
                      onChange={ (e) => {
                        setIpressSearchText(e.target.value);
                        setIpressDropdownOpen(true);
                        if (!e.target.value) {
                          setFormularioData(prev => ({ ...prev, casAdscripcion: '' }));
                        }
                      } }
                      onFocus={ () => {
                        setIpressSearchText('');
                        setIpressDropdownOpen(true);
                      } }
                      onBlur={ () => setTimeout(() => setIpressDropdownOpen(false), 200) }
                      placeholder="Escribe para buscar IPRESS..."
                      className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg text-slate-900
                               focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100
                               transition-all"
                      autoComplete="off"
                    />
                    { ipressDropdownOpen && (
                      <div className="absolute z-50 w-full mt-1 bg-white border-2 border-blue-200 rounded-lg shadow-xl max-h-56 overflow-y-auto">
                        { (() => {
                            const texto = ipressSearchText.toLowerCase().trim();
                            const filtradas = todasIpress
                              .filter(i => !texto || i.descIpress.toLowerCase().includes(texto) || i.codIpress.toLowerCase().includes(texto))
                              .sort((a, b) => a.descIpress.localeCompare(b.descIpress, 'es'));
                            if (filtradas.length === 0) {
                              return <div className="px-4 py-3 text-sm text-slate-500 text-center">Sin resultados</div>;
                            }
                            return filtradas.map(i => (
                              <div
                                key={ i.codIpress }
                                onMouseDown={ () => {
                                  setFormularioData(prev => ({ ...prev, casAdscripcion: i.codIpress }));
                                  setIpressSearchText('');
                                  setIpressDropdownOpen(false);
                                } }
                                className={ `px-4 py-2.5 text-sm cursor-pointer hover:bg-blue-50 transition-colors ${
                                  formularioData.casAdscripcion === i.codIpress ? 'bg-blue-100 font-semibold text-blue-800' : 'text-slate-800'
                                }` }
                              >
                                <span className="font-medium">{ i.descIpress }</span>
                                <span className="text-slate-500 ml-1">- Cód: { i.codIpress }</span>
                              </div>
                            ));
                          })()
                        }
                      </div>
                    ) }
                  </div>
                  { /* Campo oculto para validación HTML required */ }
                  <input type="hidden" name="casAdscripcion" value={ formularioData.casAdscripcion } required />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Periodo <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="periodo"
                    value={ formularioData.periodo }
                    onChange={ handleInputChange }
                    required
                    maxLength="4"
                    pattern="[0-9]{4}"
                    disabled={ modoFormulario === 'editar' && !esSuperAdmin }
                    className={ `w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg text-slate-900
                             focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100
                             transition-all ${modoFormulario === 'editar' && !esSuperAdmin ? 'bg-slate-100 cursor-not-allowed' : ''}` }
                    placeholder="2025"
                    title={ modoFormulario === 'editar' && !esSuperAdmin ? 'El periodo no se puede modificar' : 'Ingresa el año (4 dígitos). Ejemplo: 2025' }
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    { modoFormulario === 'editar' && !esSuperAdmin
                      ? 'El periodo no se puede modificar después de crear el asegurado'
                      : 'Ingresa solo el año (4 dígitos). Ejemplo: 2025' }
                  </p>
                </div>
              </div>

              {/* 🏥 CENACRON */}
              <div className="border-2 border-slate-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">
                      🏥 Paciente CENACRON
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Indica si el asegurado pertenece al programa de pacientes crónicos CENACRON
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={ () => setFormularioData(prev => ({ ...prev, pacienteCronico: !prev.pacienteCronico })) }
                    className={ `relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none
                      ${ formularioData.pacienteCronico ? 'bg-blue-600' : 'bg-slate-300' }` }
                    aria-pressed={ formularioData.pacienteCronico }
                  >
                    <span
                      className={ `inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform
                        ${ formularioData.pacienteCronico ? 'translate-x-8' : 'translate-x-1' }` }
                    />
                  </button>
                </div>
                { formularioData.pacienteCronico && (
                  <p className="text-xs text-blue-600 font-medium mt-2">
                    ✅ El asegurado pertenece a CENACRON
                  </p>
                ) }
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={ cerrarFormulario }
                  className="px-6 py-2.5 border-2 border-slate-300 text-slate-700 rounded-lg 
                           font-medium transition-all hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={ loadingForm || (modoFormulario === 'crear' && (dniStatus === "duplicado" || dniStatus === "validando")) }
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg
                           font-medium transition-all shadow-md hover:shadow-lg flex items-center gap-2
                           disabled:opacity-50 disabled:cursor-not-allowed"
                  title={ modoFormulario === 'crear' && dniStatus === "duplicado" ? "❌ Este DNI ya está registrado" : "" }
                >
                  { loadingForm ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      { modoFormulario === 'crear' ? 'Crear Asegurado' : 'Guardar Cambios' }
                    </>
                  ) }
                </button>
              </div>
            </form>
          </div>
        </div>
      ) }
    </div>
  );
}
// Force reload Fri Nov  7 22:57:06 -05 2025
