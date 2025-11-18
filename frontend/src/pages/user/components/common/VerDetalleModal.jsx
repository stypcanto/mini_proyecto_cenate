// src/pages/admin/users/components/modals/VerDetalleModal.jsx
import React, { useMemo, useState } from 'react';
import { getFotoUrl as buildFotoUrl } from '../../../../utils/apiUrlHelper';
import { 
  X, User, Mail, Building2, CalendarDays,
  Hash, Clock, Shield, Briefcase, IdCard, GraduationCap,
  Stethoscope, Award, UserCog, BadgeCheck,
  Cake, MapPin, PhoneCall, AtSign, FolderKanban,
  ClipboardList, Calendar, Barcode
} from 'lucide-react';

const VerDetalleModal = ({ user, onClose }) => {
  const [selectedTab, setSelectedTab] = useState('personal');
  const [fotoError, setFotoError] = useState(false);
  
  // Log para debug
  React.useEffect(() => {
    if (user) {
      console.log('👤 Datos del usuario en VerDetalleModal:', user);
      console.log('📸 Campos de foto disponibles:', {
        foto_url: user.foto_url,
        foto_pers: user.foto_pers,
        foto: user.foto
      });
    }
  }, [user]);
  
  // Obtener URL de la foto
  const getFotoUrl = () => {
    if (!user) return null;
    
    const fotoUrl = user.foto_url || user.foto_pers || user.foto;
    if (!fotoUrl || fotoUrl.trim() === '') return null;
    
    // Si es una URL completa, usarla directamente
    if (fotoUrl.startsWith('http') || fotoUrl.startsWith('/')) {
      return fotoUrl;
    }
    
    // Si es solo el nombre del archivo, construir la URL completa
    // Usar helper centralizado para consistencia
    const url = buildFotoUrl(fotoUrl);
    console.log('📸 URL de foto construida:', url, 'desde:', fotoUrl);
    return url;
  };
  
  const fotoUrl = getFotoUrl();

  // Función para obtener las iniciales del usuario
  const getInitials = (nombreCompleto) => {
    if (!nombreCompleto) return user.username?.charAt(0).toUpperCase() || '?';
    const names = nombreCompleto.trim().split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  // Calcular edad
  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return null;
    try {
      let date;
      if (typeof fechaNacimiento === 'string') {
        date = new Date(fechaNacimiento);
      } else if (Array.isArray(fechaNacimiento)) {
        date = new Date(fechaNacimiento[0], fechaNacimiento[1] - 1, fechaNacimiento[2]);
      } else {
        date = new Date(fechaNacimiento);
      }
      
      if (isNaN(date.getTime())) return null;
      
      const hoy = new Date();
      let edad = hoy.getFullYear() - date.getFullYear();
      const mes = hoy.getMonth() - date.getMonth();
      if (mes < 0 || (mes === 0 && hoy.getDate() < date.getDate())) {
        edad--;
      }
      return edad;
    } catch (e) {
      return null;
    }
  };

  // Formatear fecha de cumpleaños
  const formatearCumpleanos = (fechaNacimiento) => {
    if (!fechaNacimiento) return '—';
    try {
      let date;
      if (typeof fechaNacimiento === 'string') {
        date = new Date(fechaNacimiento);
      } else if (Array.isArray(fechaNacimiento)) {
        date = new Date(fechaNacimiento[0], fechaNacimiento[1] - 1, fechaNacimiento[2]);
      } else {
        date = new Date(fechaNacimiento);
      }
      
      if (isNaN(date.getTime())) return '—';
      
      const dia = date.getDate();
      const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                     'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      const mes = meses[date.getMonth()];
      return `${dia} de ${mes}`;
    } catch (e) {
      return '—';
    }
  };

  // Formatear fecha completa
  const formatearFechaCompleta = (fecha) => {
    if (!fecha) return '—';
    try {
      let date;
      if (typeof fecha === 'string') {
        date = new Date(fecha);
      } else if (Array.isArray(fecha)) {
        date = new Date(fecha[0], fecha[1] - 1, fecha[2]);
      } else {
        date = new Date(fecha);
      }
      
      if (isNaN(date.getTime())) return '—';
      
      return date.toLocaleDateString('es-PE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (e) {
      return '—';
    }
  };

  // Formatear periodo (de YYYYMM a "Mes Año")
  const formatearPeriodo = (periodo) => {
    if (!periodo) return '—';
    try {
      const periodoStr = String(periodo);
      if (periodoStr.length !== 6) return periodo;
      
      const year = periodoStr.substring(0, 4);
      const month = periodoStr.substring(4, 6);
      
      const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                     'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      const monthIndex = parseInt(month) - 1;
      
      if (monthIndex < 0 || monthIndex > 11) return periodo;
      
      return `${meses[monthIndex]} ${year}`;
    } catch (e) {
      return periodo;
    }
  };

  // Formatear fecha y hora
  const formatearFechaHora = (fechaHora) => {
    if (!fechaHora) return '—';
    try {
      const date = new Date(fechaHora);
      if (isNaN(date.getTime())) return '—';
      
      return date.toLocaleString('es-PE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    } catch (e) {
      return '—';
    }
  };

  const edad = useMemo(() => calcularEdad(user.fecha_nacimiento), [user.fecha_nacimiento]);
  const cumpleanos = useMemo(() => formatearCumpleanos(user.fecha_nacimiento), [user.fecha_nacimiento]);

  // Badge de estado - diseño profesional (colores que combinan con fondo morado)
  const getEstadoBadge = (estado) => {
    if (estado === 'ACTIVO' || estado === 'A') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/20 text-white border border-white/30 backdrop-blur-sm">
          <div className="w-2 h-2 rounded-full bg-green-400"></div>
          ACTIVO
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/20 text-white border border-white/30 backdrop-blur-sm">
        <div className="w-2 h-2 rounded-full bg-red-400"></div>
        INACTIVO
      </span>
    );
  };

  // Badge de tipo personal - diseño profesional (colores que combinan con fondo morado)
  const getTipoBadge = (tipo) => {
    if (tipo === 'INTERNO') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/20 text-white border border-white/30 backdrop-blur-sm">
          INTERNO
        </span>
      );
    }
    if (tipo === 'EXTERNO') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/20 text-white border border-white/30 backdrop-blur-sm">
          EXTERNO
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/20 text-white border border-white/30 backdrop-blur-sm">
        {tipo || 'SIN DATOS'}
      </span>
    );
  };

  // Badge de rol - diseño profesional (colores que combinan con fondo morado)
  const getRolBadge = (rol) => {
    // Si roles es un array, tomar el primer elemento
    const rolTexto = Array.isArray(rol) ? rol[0] : rol;
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/25 text-white border border-white/40 backdrop-blur-sm shadow-sm">
        {rolTexto || 'USER'}
      </span>
    );
  };

  // Componente de campo de información - diseño profesional
  const InfoField = ({ icon: Icon, label, value, fullWidth = false }) => (
    <div className={`${fullWidth ? 'col-span-2' : ''}`}>
      <label className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-600 uppercase tracking-wider">
        {Icon && <Icon className="w-3.5 h-3.5 text-slate-500" />}
        {label}
      </label>
      <div className="px-4 py-3 text-sm font-medium text-slate-900 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
        {value || <span className="text-slate-400 italic">No especificado</span>}
      </div>
    </div>
  );

  // Verificar si hay datos profesionales
  const tieneDatosProfesionales = user.nombre_profesion || user.colegiatura || user.nombre_especialidad || user.rne;
  
  // Verificar si hay datos laborales adicionales
  const tieneDatosLaboralesAdicionales = user.nombre_area || user.nombre_regimen || user.codigo_planilla || user.periodo_ingreso;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-5xl bg-white shadow-2xl rounded-3xl overflow-hidden my-8 flex flex-col max-h-[90vh]">
        {/* Header con foto y badges - diseño profesional con fondo morado oscuro */}
        <div className="relative bg-gradient-to-br from-[#6D28D9] via-[#5B21B6] to-[#0F172A] px-8 py-8">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-white hover:bg-white/20 rounded-xl transition-all backdrop-blur-sm z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-6">
            {/* Avatar - diseño profesional mejorado con foto más grande y prominente */}
            <div className="relative flex-shrink-0">
              <div className="w-32 h-32 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-bold text-4xl shadow-2xl border-4 border-white/40 overflow-hidden relative ring-4 ring-white/20">
                {fotoUrl && !fotoError ? (
                  <img
                    src={fotoUrl}
                    alt={user.nombre_completo || 'Foto de perfil'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('❌ Error al cargar foto:', fotoUrl, e);
                      setFotoError(true);
                    }}
                    onLoad={() => {
                      console.log('✅ Foto cargada exitosamente:', fotoUrl);
                      setFotoError(false);
                    }}
                  />
                ) : (
                  <span className="text-4xl font-bold">{getInitials(user.nombre_completo)}</span>
                )}
              </div>
              {/* Indicador de verificación de foto */}
              {fotoUrl && !fotoError && (
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            {/* Info del usuario */}
            <div className="flex-1 pt-2">
              <h2 className="text-3xl font-bold text-white mb-2 leading-tight">
                {user.nombre_completo || 'Usuario sin nombre'}
              </h2>
              <p className="text-purple-100 text-base font-medium mb-3">@{user.username}</p>
              
              {/* Información adicional si está disponible */}
              {user.nombre_profesion && (
                <p className="text-purple-200 text-sm mb-1 flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {user.nombre_profesion}
                  {user.nombre_especialidad && ` - ${user.nombre_especialidad}`}
                </p>
              )}
            </div>
          </div>

          {/* Badges - diseño profesional */}
          <div className="flex flex-wrap gap-2.5 mt-4">
            {getEstadoBadge(user.estado_usuario)}
            {getTipoBadge(user.tipo_personal)}
            {getRolBadge(user.roles)}
          </div>

          {/* Tabs - 4 PESTAÑAS - diseño profesional con fondo morado */}
          <div className="flex gap-2 mt-5 border-b border-white/20">
            <button
              onClick={() => setSelectedTab('personal')}
              className={`px-5 py-3 font-semibold text-sm rounded-t-xl transition-all relative ${
                selectedTab === 'personal'
                  ? 'bg-white text-[#6D28D9] shadow-lg'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              Datos Personales
              {selectedTab === 'personal' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></div>
              )}
            </button>
            <button
              onClick={() => setSelectedTab('profesionales')}
              className={`px-5 py-3 font-semibold text-sm rounded-t-xl transition-all relative ${
                selectedTab === 'profesionales'
                  ? 'bg-white text-[#6D28D9] shadow-lg'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              Datos Profesionales
              {selectedTab === 'profesionales' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></div>
              )}
            </button>
            <button
              onClick={() => setSelectedTab('laborales')}
              className={`px-5 py-3 font-semibold text-sm rounded-t-xl transition-all relative ${
                selectedTab === 'laborales'
                  ? 'bg-white text-[#6D28D9] shadow-lg'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              Datos Laborales
              {selectedTab === 'laborales' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></div>
              )}
            </button>
            <button
              onClick={() => setSelectedTab('roles')}
              className={`px-5 py-3 font-semibold text-sm rounded-t-xl transition-all relative ${
                selectedTab === 'roles'
                  ? 'bg-white text-[#6D28D9] shadow-lg'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              Roles del Sistema
              {selectedTab === 'roles' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></div>
              )}
            </button>
          </div>
        </div>

        {/* Contenido por pestañas */}
        <div className="p-8 overflow-y-auto flex-1 bg-gradient-to-br from-slate-50 to-white">
          {/* PESTAÑA: DATOS PERSONALES */}
          {selectedTab === 'personal' && (
            <div className="space-y-8">
              {/* Información Personal */}
              <div>
                <div className="flex items-center gap-3 mb-6 pb-3 border-b-2 border-slate-200">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <User className="w-5 h-5 text-[#0A5BA9]" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 uppercase tracking-wide">
                    Información Personal
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <InfoField 
                    icon={IdCard}
                    label="Documento" 
                    value={`${user.tipo_documento || 'DNI'}: ${user.numero_documento || '—'}`} 
                  />
                  <InfoField 
                    icon={User}
                    label="Nombres" 
                    value={user.nombres} 
                  />
                  <InfoField 
                    icon={User}
                    label="Apellido Paterno" 
                    value={user.apellido_paterno} 
                  />
                  <InfoField 
                    icon={User}
                    label="Apellido Materno" 
                    value={user.apellido_materno} 
                  />
                  <InfoField 
                    icon={User}
                    label="Género" 
                    value={user.genero === 'M' ? 'Masculino' : user.genero === 'F' ? 'Femenino' : user.genero} 
                  />
                  <InfoField 
                    icon={CalendarDays}
                    label="Fecha de Nacimiento" 
                    value={formatearFechaCompleta(user.fecha_nacimiento)} 
                  />
                  <InfoField 
                    icon={User}
                    label="Edad" 
                    value={edad ? `${edad} años` : '—'} 
                  />
                  <InfoField 
                    icon={Cake}
                    label="Cumpleaños" 
                    value={cumpleanos} 
                  />
                </div>
              </div>

              {/* Información de Contacto */}
              <div>
                <div className="flex items-center gap-3 mb-6 pb-3 border-b-2 border-slate-200">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Mail className="w-5 h-5 text-[#0A5BA9]" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 uppercase tracking-wide">
                    Información de Contacto
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <InfoField 
                    icon={AtSign}
                    label="Correo Institucional" 
                    value={user.correo_institucional || user.correo_corporativo} 
                  />
                  <InfoField 
                    icon={Mail}
                    label="Correo Personal" 
                    value={user.correo_personal} 
                  />
                  <InfoField 
                    icon={PhoneCall}
                    label="Teléfono" 
                    value={user.telefono} 
                  />
                  <InfoField 
                    icon={MapPin}
                    label="Dirección" 
                    value={user.direccion} 
                  />
                </div>
              </div>
            </div>
          )}

          {/* PESTAÑA: DATOS PROFESIONALES */}
          {selectedTab === 'profesionales' && (
            <div className="space-y-8">
              <div>
                <div className="flex items-center gap-3 mb-6 pb-3 border-b-2 border-slate-200">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <GraduationCap className="w-5 h-5 text-[#0A5BA9]" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 uppercase tracking-wide">
                    Información Profesional
                  </h3>
                </div>
                
                {/* Verificar si hay información profesional */}
                {!tieneDatosProfesionales ? (
                  <div className="p-8 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 border border-blue-200/50 rounded-2xl shadow-sm">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-100/80 flex items-center justify-center shadow-sm">
                        <GraduationCap className="w-8 h-8 text-blue-600" />
                      </div>
                      <h4 className="text-lg font-semibold text-slate-800 mb-2">
                        No hay información profesional registrada
                      </h4>
                      <p className="text-sm text-slate-600">
                        Este usuario no completó sus datos profesionales durante la creación de cuenta.
                      </p>
                      <p className="text-xs text-slate-500 mt-3">
                        <strong>Nota:</strong> Estos campos son opcionales y pueden ser completados más tarde si es necesario.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <InfoField 
                      icon={GraduationCap}
                      label="Profesión" 
                      value={user.nombre_profesion} 
                    />
                    <InfoField 
                      icon={Award}
                      label="Colegiatura" 
                      value={user.colegiatura} 
                    />
                    <InfoField 
                      icon={Stethoscope}
                      label="Especialidad" 
                      value={user.nombre_especialidad} 
                    />
                    <InfoField 
                      icon={BadgeCheck}
                      label="RNE" 
                      value={user.rne} 
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PESTAÑA: DATOS LABORALES */}
          {selectedTab === 'laborales' && (
            <div className="space-y-8">
              <div>
                <div className="flex items-center gap-3 mb-6 pb-3 border-b-2 border-slate-200">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Briefcase className="w-5 h-5 text-[#0A5BA9]" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 uppercase tracking-wide">
                    Información Laboral
                  </h3>
                </div>
                
                {/* Siempre mostrar IPRESS y Tipo de Personal (datos básicos) */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wide flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#0A5BA9]" />
                    Información Básica Laboral
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <InfoField 
                      icon={Building2}
                      label="IPRESS" 
                      value={user.nombre_ipress} 
                    />
                    <InfoField 
                      icon={UserCog}
                      label="Tipo de Personal" 
                      value={user.tipo_personal || user.tipo_personal_detalle || (user.id_ipress === 2 ? 'INTERNO' : 'EXTERNO')} 
                    />
                  </div>
                </div>
                
                {/* Datos adicionales (opcionales) */}
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wide flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-[#0A5BA9]" />
                    Información Laboral Adicional
                  </h4>
                  {!tieneDatosLaboralesAdicionales ? (
                    <div className="p-8 bg-gradient-to-br from-amber-50/50 to-orange-50/50 border border-amber-200/50 rounded-2xl shadow-sm">
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-100/80 flex items-center justify-center shadow-sm">
                          <Briefcase className="w-8 h-8 text-amber-600" />
                        </div>
                        <h4 className="text-lg font-semibold text-slate-800 mb-2">
                          No hay información laboral adicional
                        </h4>
                        <p className="text-sm text-slate-600">
                          Este usuario no completó los datos de área, régimen laboral, código de planilla o periodo de ingreso.
                        </p>
                        <p className="text-xs text-slate-500 mt-3">
                          <strong>Nota:</strong> Estos campos son opcionales y pueden ser completados más tarde si es necesario.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <InfoField 
                        icon={FolderKanban}
                        label="Área" 
                        value={user.nombre_area || user.area_trabajo} 
                      />
                      <InfoField 
                        icon={UserCog}
                        label="Tipo de Profesional" 
                        value={user.nombre_tipo_profesional || user.tipo_profesional_desc || user.desc_tip_pers} 
                      />
                      <InfoField 
                        icon={ClipboardList}
                        label="Régimen Laboral" 
                        value={user.nombre_regimen || user.regimen_laboral} 
                      />
                      <InfoField 
                        icon={Barcode}
                        label="Código de Planilla" 
                        value={user.codigo_planilla} 
                      />
                      <InfoField 
                        icon={Calendar}
                        label="Periodo de Ingreso" 
                        value={formatearPeriodo(user.periodo_ingreso)} 
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* PESTAÑA: ROLES DEL SISTEMA */}
          {selectedTab === 'roles' && (
            <div className="space-y-8">
              <div>
                <div className="flex items-center gap-3 mb-6 pb-3 border-b-2 border-slate-200">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Shield className="w-5 h-5 text-[#0A5BA9]" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 uppercase tracking-wide">
                    Información del Sistema
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <InfoField 
                    icon={User}
                    label="Usuario" 
                    value={user.username} 
                  />
                  <InfoField 
                    icon={Shield}
                    label="Roles" 
                    value={Array.isArray(user.roles) ? user.roles.join(', ') : user.roles} 
                  />
                  <InfoField 
                    icon={Hash}
                    label="ID de Usuario" 
                    value={user.id_user || user.id_usuario} 
                  />
                  <InfoField 
                    icon={Shield}
                    label="Estado" 
                    value={user.estado_usuario} 
                  />
                  <InfoField 
                    icon={Clock}
                    label="Fecha de Registro" 
                    value={formatearFechaHora(user.create_at || user.created_at)} 
                  />
                  <InfoField 
                    icon={Clock}
                    label="Última Actualización" 
                    value={formatearFechaHora(user.update_at || user.updated_at)} 
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer - diseño profesional */}
        <div className="px-8 py-5 bg-gradient-to-r from-slate-50 to-white border-t border-slate-200 flex justify-between items-center">
          <div className="text-xs text-slate-500 font-medium">
            ID: <span className="text-slate-700 font-semibold">{user.id_user || user.id_usuario || user.id_personal}</span>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gradient-to-r from-[#6D28D9] to-[#5B21B6] hover:from-[#7C3AED] hover:to-[#6D28D9] text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerDetalleModal;
