import React from 'react';
import { X, User, Mail, Phone, MapPin, Briefcase, Calendar, Cake, Building2 } from 'lucide-react';

/**
 * Modal CORREGIDO para ver detalle de usuario
 * Mapea correctamente los campos de vw_personal_total
 */
const VerDetalleModal = ({ user, onClose }) => {
  if (!user) return null;

  console.log('📋 Datos del usuario recibidos:', user);

  // Helper para calcular edad si no viene del backend
  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return null;
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  // Helper para formatear fecha
  const formatFecha = (fecha) => {
    if (!fecha) return null;
    try {
      const date = new Date(fecha);
      return date.toLocaleDateString('es-PE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return fecha;
    }
  };

  // Helper para formatear fecha y hora
  const formatFechaHora = (fecha) => {
    if (!fecha) return null;
    try {
      const date = new Date(fecha);
      return date.toLocaleString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return fecha;
    }
  };

  // Helper para obtener mes en español
  const getMesEspanol = (mes) => {
    const meses = {
      'January': 'Enero', 'February': 'Febrero', 'March': 'Marzo',
      'April': 'Abril', 'May': 'Mayo', 'June': 'Junio',
      'July': 'Julio', 'August': 'Agosto', 'September': 'Septiembre',
      'October': 'Octubre', 'November': 'Noviembre', 'December': 'Diciembre'
    };
    return meses[mes] || mes;
  };

  // Componente de tarjeta de información
  const InfoCard = ({ label, value, icon: Icon }) => (
    <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-blue-300 transition-all duration-200">
      <div className="flex items-center gap-2 mb-2">
        {Icon && <Icon className="w-4 h-4 text-blue-600" />}
        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">{label}</p>
      </div>
      <p className="text-sm font-semibold text-gray-900 break-words leading-relaxed">
        {value || <span className="text-gray-400 text-xs italic font-normal">No especificado</span>}
      </p>
    </div>
  );

  // Componente de sección
  const Section = ({ title, icon: Icon, children }) => (
    <div className="space-y-4">
      <div className="flex items-center gap-3 pb-3 border-b-2 border-blue-500">
        {Icon && <Icon className="w-5 h-5 text-blue-600" />}
        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">{title}</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {children}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col">
        
        {/* Header mejorado */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg border-2 border-white/30">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {user.nombre_completo || `${user.nombres || ''} ${user.apellido_paterno || ''} ${user.apellido_materno || ''}`.trim() || user.username}
                </h2>
                <p className="text-blue-100 text-sm mt-1">@{user.username || user.name_user}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => alert('Función de exportar PDF próximamente')}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Exportar PDF
              </button>
              <button
                onClick={onClose}
                className="p-2.5 hover:bg-white/20 text-white rounded-xl transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Badges de estado */}
        <div className="px-8 py-4 bg-gray-50 border-b border-gray-200 flex items-center gap-3">
          <span className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-sm ${
            user.estado_usuario === 'ACTIVO' || user.estado === 'ACTIVO' || user.stat_user === 'ACTIVO'
              ? 'bg-green-100 text-green-700 border-2 border-green-300' 
              : 'bg-red-100 text-red-700 border-2 border-red-300'
          }`}>
            {user.estado_usuario || user.estado || user.stat_user || 'DESCONOCIDO'}
          </span>
          <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700 border-2 border-purple-300 shadow-sm">
            {user.roles || user.rol || user.rol_usuario || 'USER'}
          </span>
          <span className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-sm ${
            user.tipo_personal === 'CENATE'
              ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
              : user.tipo_personal === 'EXTERNO'
              ? 'bg-orange-100 text-orange-700 border-2 border-orange-300'
              : 'bg-gray-100 text-gray-700 border-2 border-gray-300'
          }`}>
            {user.tipo_personal || user.tipo_personal_detalle || 'Sin clasificar'}
          </span>
        </div>

        {/* Content con scroll */}
        <div className="p-8 overflow-y-auto flex-1 bg-gradient-to-b from-gray-50 to-white">
          <div className="space-y-8">
            
            {/* Información Personal */}
            <Section title="Información Personal" icon={User}>
              <InfoCard 
                label="Documento" 
                value={user.numero_documento ? `${user.tipo_documento || 'DNI'}: ${user.numero_documento}` : null} 
              />
              <InfoCard label="Nombres" value={user.nombres} />
              <InfoCard label="Apellido Paterno" value={user.apellido_paterno} />
              <InfoCard label="Apellido Materno" value={user.apellido_materno} />
              <InfoCard 
                label="Género" 
                value={user.genero === 'M' ? 'Masculino' : user.genero === 'F' ? 'Femenino' : user.genero} 
              />
              <InfoCard 
                label="Fecha de Nacimiento" 
                value={formatFecha(user.fecha_nacimiento)} 
                icon={Calendar}
              />
              <InfoCard 
                label="Edad" 
                value={user.edad ? `${user.edad} años` : calcularEdad(user.fecha_nacimiento) ? `${calcularEdad(user.fecha_nacimiento)} años` : null} 
              />
              <InfoCard 
                label="Cumpleaños" 
                value={user.mes_cumpleanos ? `15 de ${getMesEspanol(user.mes_cumpleanos)}` : null}
                icon={Cake}
              />
            </Section>

            {/* Información de Contacto */}
            <Section title="Información de Contacto" icon={Mail}>
              <InfoCard 
                label="Correo Institucional" 
                value={user.correo_institucional} 
                icon={Mail}
              />
              <InfoCard 
                label="Correo Personal" 
                value={user.correo_personal} 
                icon={Mail}
              />
              <InfoCard 
                label="Teléfono" 
                value={user.telefono} 
                icon={Phone}
              />
              <InfoCard 
                label="Dirección" 
                value={user.direccion} 
                icon={MapPin}
              />
              <InfoCard label="Distrito" value={user.nombre_distrito || user.distrito} />
              <InfoCard label="Provincia" value={user.nombre_provincia || user.provincia} />
              <InfoCard label="Departamento" value={user.nombre_departamento || user.departamento} />
            </Section>

            {/* Información Laboral */}
            <Section title="Información Laboral" icon={Briefcase}>
              <InfoCard 
                label="IPRESS" 
                value={user.nombre_ipress || user.ipress_asignada} 
                icon={Building2}
              />
              <InfoCard label="Área" value={user.nombre_area || user.area} />
              <InfoCard label="Régimen Laboral" value={user.regimen_laboral || user.nombre_regimen} />
              <InfoCard label="Código de Planilla" value={user.codigo_planilla} />
              <InfoCard label="Colegiatura" value={user.colegiatura} />
              <InfoCard label="Periodo de Ingreso" value={user.periodo_ingreso} icon={Calendar} />
              <InfoCard label="Tipo de Personal" value={user.tipo_personal || user.tipo_personal_detalle} />
              {user.institucion && <InfoCard label="Institución" value={user.institucion} />}
            </Section>

            {/* Información Profesional (si aplica) */}
            {(user.profesion || user.especialidad || user.rne_especialidad) && (
              <Section title="Información Profesional" icon={Briefcase}>
                <InfoCard label="Profesión" value={user.profesion} />
                <InfoCard label="Especialidad" value={user.especialidad} />
                <InfoCard label="RNE" value={user.rne_especialidad} />
              </Section>
            )}

            {/* Información del Sistema */}
            <Section title="Información del Sistema" icon={User}>
              <InfoCard label="Usuario" value={user.username || user.name_user} />
              <InfoCard label="ID de Usuario" value={user.id_user?.toString() || user.id_usuario?.toString()} />
              <InfoCard 
                label="Fecha de Registro" 
                value={formatFechaHora(user.fecha_creacion_usuario || user.created_at)} 
                icon={Calendar}
              />
              <InfoCard 
                label="Última Actualización" 
                value={formatFechaHora(user.ultima_actualizacion_usuario || user.updated_at)} 
                icon={Calendar}
              />
            </Section>

            {/* Observaciones (si existen) */}
            {user.observaciones && (
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
                <h3 className="text-sm font-bold text-yellow-800 uppercase mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Observaciones
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">{user.observaciones}</p>
              </div>
            )}

          </div>
        </div>

        {/* Footer */}
        <div className="bg-white border-t-2 border-gray-200 px-8 py-4 flex justify-between items-center">
          <p className="text-xs text-gray-500 font-medium">ID: {user.id_user || user.id_usuario || user.id_personal}</p>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors text-sm font-semibold shadow-sm hover:shadow-md"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerDetalleModal;
