import React, { useState, useEffect } from 'react';
import { Plus, FolderOpen } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import ListHeader from '../../components/ListHeader';

/**
 * 📋 PLANTILLA: Página Mínima para Cargar Datos de Pacientes
 *
 * Este es un ejemplo mínimo de estructura de página que sigue el patrón de diseño CENATE.
 * Copia este archivo y adapta para tu caso de uso específico.
 *
 * v1.0.0 - 2026-01-22
 */

export default function PaginaMinima() {
  // ================== STATE ==================
  const [pacientes, setPacientes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtros, setFiltros] = useState({
    categoria: 'todas',
    red: 'todas'
  });

  // ================== EFECTOS ==================
  useEffect(() => {
    cargarPacientes();
  }, []);

  // ================== CARGA DE DATOS ==================
  const cargarPacientes = async () => {
    setIsLoading(true);
    try {
      // TODO: Reemplaza esto con tu API call real
      // const response = await pacientesService.obtenerTodos();
      // setPacientes(response.data);

      // Mock data - Reemplaza con datos reales de tu API
      setPacientes([
        {
          id: 1,
          dni: '12345678',
          nombre: 'María Gonzales Flores',
          telefono: '+51 987654321',
          especialidad: 'Nutrición',
          red: 'Red Centro',
          ipress: 'Essalud Lima',
          categoria: 'BOLSA_107',
          estado: 'pendiente'
        },
        {
          id: 2,
          dni: '23456789',
          nombre: 'Juan Pérez Rivera',
          telefono: '+51 912345678',
          especialidad: 'Psicología',
          red: 'Red Norte',
          ipress: 'Essalud Arequipa',
          categoria: 'BOLSA_DENGUE',
          estado: 'citado'
        },
        {
          id: 3,
          dni: '34567890',
          nombre: 'Ana Martínez Soto',
          telefono: '+51 998765432',
          especialidad: 'Medicina General',
          red: 'Red Sur',
          ipress: 'Essalud Trujillo',
          categoria: 'BOLSA_DENGUE',
          estado: 'atendido'
        }
      ]);
    } catch (error) {
      console.error('Error cargando pacientes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ================== ESTADÍSTICAS ==================
  const estadisticas = {
    total: pacientes.length,
    pendientes: pacientes.filter(p => p.estado === 'pendiente').length,
    citados: pacientes.filter(p => p.estado === 'citado').length,
    atendidos: pacientes.filter(p => p.estado === 'atendido').length
  };

  // ================== FILTRADO ==================
  const pacientesFiltrados = pacientes.filter(p => {
    const matchBusqueda = p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.dni.includes(searchTerm) ||
                         p.ipress.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategoria = filtros.categoria === 'todas' || p.categoria === filtros.categoria;
    const matchRed = filtros.red === 'todas' || p.red === filtros.red;

    return matchBusqueda && matchCategoria && matchRed;
  });

  // ================== VALORES ÚNICOS ==================
  const redesUnicas = [...new Set(pacientes.map(p => p.red))].sort();
  const categoriasUnicas = [...new Set(pacientes.map(p => p.categoria))].sort();

  // ================== RENDER ==================
  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="w-full max-w-7xl mx-auto">

        {/* ========== 1. HEADER ========== */}
        <PageHeader
          badge={{
            label: "Mi Módulo",
            bgColor: "bg-blue-100 text-blue-700",
            icon: FolderOpen
          }}
          title="Título de Página"
          primaryAction={{
            label: "Agregar Paciente",
            onClick: () => console.log('Agregar')
          }}
          subtitle="Descripción opcional"
        />

        {/* ========== 2. ESTADÍSTICAS ========== */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Pacientes"
            value={estadisticas.total}
            borderColor="border-blue-500"
            textColor="text-blue-600"
            icon="👥"
          />
          <StatCard
            label="Pendientes"
            value={estadisticas.pendientes}
            borderColor="border-orange-500"
            textColor="text-orange-600"
            icon="⏳"
          />
          <StatCard
            label="Citados"
            value={estadisticas.citados}
            borderColor="border-purple-500"
            textColor="text-purple-600"
            icon="📞"
          />
          <StatCard
            label="Atendidos"
            value={estadisticas.atendidos}
            borderColor="border-green-500"
            textColor="text-green-600"
            icon="✓"
          />
        </div>

        {/* ========== 3. TABLA CON FILTROS ========== */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <ListHeader
            title="Lista de Pacientes"
            searchPlaceholder="Buscar por nombre, DNI o IPRESS..."
            searchValue={searchTerm}
            onSearchChange={(e) => setSearchTerm(e.target.value)}
            filters={[
              {
                name: "Categoría",
                value: filtros.categoria,
                onChange: (e) => setFiltros({...filtros, categoria: e.target.value}),
                options: [
                  { label: "Todas las categorías", value: "todas" },
                  ...categoriasUnicas.map(cat => ({ label: cat, value: cat }))
                ]
              },
              {
                name: "Red",
                value: filtros.red,
                onChange: (e) => setFiltros({...filtros, red: e.target.value}),
                options: [
                  { label: "Todas las redes", value: "todas" },
                  ...redesUnicas.map(red => ({ label: red, value: red }))
                ]
              }
            ]}
          />

          {/* TABLA */}
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : pacientesFiltrados.length > 0 ? (
              <table className="w-full text-sm">
                <thead className="bg-[#0D5BA9] text-white sticky top-0">
                  <tr>
                    <th className="px-6 py-4 text-left font-bold uppercase">DNI</th>
                    <th className="px-6 py-4 text-left font-bold uppercase">Nombre</th>
                    <th className="px-6 py-4 text-left font-bold uppercase">Teléfono</th>
                    <th className="px-6 py-4 text-left font-bold uppercase">Especialidad</th>
                    <th className="px-6 py-4 text-left font-bold uppercase">Red</th>
                    <th className="px-6 py-4 text-left font-bold uppercase">IPRESS</th>
                    <th className="px-6 py-4 text-left font-bold uppercase">Categoría</th>
                    <th className="px-6 py-4 text-left font-bold uppercase">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {pacientesFiltrados.map((paciente) => (
                    <tr key={paciente.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4 font-semibold text-blue-600">{paciente.dni}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">{paciente.nombre}</td>
                      <td className="px-6 py-4 text-gray-700">{paciente.telefono}</td>
                      <td className="px-6 py-4 text-gray-900">{paciente.especialidad}</td>
                      <td className="px-6 py-4 text-gray-900">{paciente.red}</td>
                      <td className="px-6 py-4 text-gray-900">{paciente.ipress}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-semibold">
                          {paciente.categoria}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          defaultValue={paciente.estado}
                          className="px-3 py-1 border border-gray-300 rounded-md text-xs font-semibold cursor-pointer"
                        >
                          <option value="pendiente">Pendiente</option>
                          <option value="citado">Citado</option>
                          <option value="atendido">Atendido</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center">
                <p className="text-gray-600 font-semibold text-lg">
                  {searchTerm || (filtros.categoria !== 'todas' || filtros.red !== 'todas')
                    ? "No hay resultados con los filtros aplicados"
                    : "No hay pacientes para mostrar"
                  }
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
