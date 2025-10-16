// ========================================================================
// 🎨 PersonalDetailCard.jsx - Tarjeta de Detalle Estilo Apple
// ========================================================================
// Componente que muestra el detalle completo de un miembro del personal
// con diseño minimalista inspirado en Apple Card View
// ========================================================================

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Building2,
  Calendar,
  Shield,
  Award,
  FileText,
  Users,
  Cake,
} from 'lucide-react';

const PersonalDetailCard = ({ personal, onClose }) => {
  if (!personal || !personal.personal) return null;

  const data = personal.personal;
  const isCenate = data.laboral?.area !== undefined;

  // Construir URL de la foto
  const getFotoUrl = () => {
    if (!data.foto) return null;
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';
    if (isCenate) {
      return `${baseUrl}/api/personal-cnt/${data.id_personal}/foto`;
    }
    return null; // Personal externo no tiene foto por ahora
  };

  const fotoUrl = getFotoUrl();

  // Formatear fecha
  const formatFecha = (fecha) => {
    if (!fecha) return 'N/A';
    try {
      return new Date(fecha).toLocaleDateString('es-PE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return fecha;
    }
  };

  // Formatear cumpleaños
  const formatCumpleanos = () => {
    if (!data.cumpleanos) return null;
    const { mes, dia } = data.cumpleanos;
    return `${dia} de ${mes}`;
  };

  // Renderizar campo con ícono
  const Campo = ({ icon: Icon, label, value, highlight = false }) => {
    if (!value || value === 'N/A' || value === 'null' || value === null) return null;
    
    return (
      <div className={`flex items-start space-x-3 py-3 ${highlight ? 'bg-blue-50 -mx-4 px-4 rounded-lg' : ''}`}>
        <div className="mt-0.5">
          <Icon className="w-5 h-5 text-gray-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-0.5">
            {label}
          </p>
          <p className="text-sm text-gray-900 break-words">
            {value}
          </p>
        </div>
      </div>
    );
  };

  // Renderizar badge de rol
  const RolBadge = ({ rol }) => (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
      {rol}
    </span>
  );

  // Obtener valores seguros
  const contacto = data.contacto || {};
  const direccion = data.direccion || {};
  const laboral = data.laboral || {};
  const roles = personal.roles || [];

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-40 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden bg-white rounded-2xl shadow-2xl"
        >
          {/* Header */}
          <div className="relative bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-8 pb-20">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white bg-opacity-20 backdrop-blur-md hover:bg-opacity-30 transition-all duration-200"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            <div className="flex flex-col items-center">
              {/* Foto */}
              <div className="relative">
                {fotoUrl ? (
                  <motion.img
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    src={fotoUrl}
                    alt={data.nombre_completo}
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div
                  className={`w-32 h-32 rounded-full bg-white bg-opacity-20 backdrop-blur-md flex items-center justify-center border-4 border-white shadow-xl ${fotoUrl ? 'hidden' : 'flex'}`}
                  style={{ display: fotoUrl ? 'none' : 'flex' }}
                >
                  <User className="w-16 h-16 text-white" />
                </div>
              </div>

              {/* Nombre y tipo */}
              <motion.h2
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="mt-4 text-2xl font-bold text-white text-center"
              >
                {data.nombre_completo}
              </motion.h2>
              
              <motion.span
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mt-2 px-3 py-1 rounded-full text-xs font-semibold bg-white bg-opacity-20 backdrop-blur-md text-white"
              >
                Personal {isCenate ? 'CENATE' : 'EXTERNO'}
              </motion.span>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 pb-8 -mt-12 overflow-y-auto max-h-[calc(90vh-200px)]">
            {/* Roles */}
            {roles && roles.length > 0 && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="bg-white rounded-xl shadow-lg p-6 mb-6"
              >
                <div className="flex items-center space-x-2 mb-4">
                  <Shield className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Roles del Sistema</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {roles.map((rol, idx) => (
                    <RolBadge key={idx} rol={rol} />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Información Personal */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-lg p-6 mb-6"
            >
              <div className="flex items-center space-x-2 mb-4">
                <User className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-semibold text-gray-900">Información Personal</h3>
              </div>
              <div className="space-y-1">
                <Campo
                  icon={FileText}
                  label="Documento de Identidad"
                  value={`${data.tipo_documento || 'DNI'} - ${data.numero_documento}`}
                  highlight
                />
                <Campo
                  icon={User}
                  label="Género"
                  value={data.genero === 'M' ? 'Masculino' : data.genero === 'F' ? 'Femenino' : data.genero}
                />
                <Campo
                  icon={Calendar}
                  label="Fecha de Nacimiento"
                  value={formatFecha(data.fecha_nacimiento)}
                />
                <Campo
                  icon={Cake}
                  label="Cumpleaños"
                  value={formatCumpleanos()}
                />
                <Campo
                  icon={Calendar}
                  label="Edad Actual"
                  value={data.edad_actual ? `${data.edad_actual} años` : null}
                />
              </div>
            </motion.div>

            {/* Información de Contacto */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="bg-white rounded-xl shadow-lg p-6 mb-6"
            >
              <div className="flex items-center space-x-2 mb-4">
                <Mail className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-semibold text-gray-900">Contacto</h3>
              </div>
              <div className="space-y-1">
                <Campo
                  icon={Mail}
                  label="Correo Corporativo"
                  value={contacto.correo_corporativo}
                  highlight
                />
                <Campo
                  icon={Mail}
                  label="Correo Personal"
                  value={contacto.correo_personal}
                />
                <Campo
                  icon={Phone}
                  label="Teléfono"
                  value={contacto.telefono}
                />
                <Campo
                  icon={MapPin}
                  label="Dirección"
                  value={direccion.domicilio}
                />
                <Campo
                  icon={MapPin}
                  label="Distrito"
                  value={direccion.distrito}
                />
                <Campo
                  icon={MapPin}
                  label="Provincia"
                  value={direccion.provincia}
                />
                <Campo
                  icon={MapPin}
                  label="Departamento"
                  value={direccion.departamento}
                />
              </div>
            </motion.div>

            {/* Información Laboral */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl shadow-lg p-6 mb-6"
            >
              <div className="flex items-center space-x-2 mb-4">
                <Briefcase className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-semibold text-gray-900">Información Laboral</h3>
              </div>
              <div className="space-y-1">
                <Campo
                  icon={Building2}
                  label="IPRESS Asignada"
                  value={data.ipress}
                  highlight
                />
                
                {isCenate && (
                  <>
                    <Campo
                      icon={Users}
                      label="Área"
                      value={laboral.area}
                    />
                    <Campo
                      icon={Award}
                      label="Profesión"
                      value={laboral.profesion}
                    />
                    <Campo
                      icon={Award}
                      label="Régimen Laboral"
                      value={laboral.regimen_laboral}
                    />
                    <Campo
                      icon={FileText}
                      label="Código de Planilla"
                      value={laboral.codigo_planilla}
                    />
                    <Campo
                      icon={FileText}
                      label="Número de Colegiatura"
                      value={laboral.numero_colegiatura}
                    />
                    <Campo
                      icon={FileText}
                      label="RNE Especialista"
                      value={laboral.rne_especialista}
                    />
                    {laboral.especialidades && laboral.especialidades.length > 0 && (
                      <div className="flex items-start space-x-3 py-3 bg-indigo-50 -mx-4 px-4 rounded-lg">
                        <div className="mt-0.5">
                          <Award className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                            Especialidades
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {laboral.especialidades.map((esp, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                              >
                                {esp}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>

            {/* Usuario del Sistema */}
            {personal.username && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.45 }}
                className="bg-white rounded-xl shadow-lg p-6 mb-6"
              >
                <div className="flex items-center space-x-2 mb-4">
                  <Shield className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Cuenta de Usuario</h3>
                </div>
                <div className="space-y-1">
                  <Campo
                    icon={User}
                    label="Nombre de Usuario"
                    value={personal.username}
                    highlight
                  />
                  <Campo
                    icon={Shield}
                    label="Estado de Cuenta"
                    value={personal.estado_usuario}
                  />
                  {personal.fechas && (
                    <>
                      <Campo
                        icon={Calendar}
                        label="Fecha de Registro"
                        value={formatFecha(personal.fechas.fecha_registro)}
                      />
                      <Campo
                        icon={Calendar}
                        label="Última Actualización"
                        value={formatFecha(personal.fechas.ultima_actualizacion)}
                      />
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PersonalDetailCard;
