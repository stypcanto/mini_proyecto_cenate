import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  Download,
  RefreshCw,
  UserPlus,
  X,
  Save,
  Upload,
  Camera
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('view');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/personal/total', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const viewDetails = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/personal/detalle/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSelectedUser(data);
        setModalMode('view');
        setShowModal(true);
      }
    } catch (error) {
      console.error('Error al cargar detalles:', error);
      toast.error('Error al cargar detalles');
    }
  };

  const editUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/personal/detalle/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSelectedUser(data);
        setModalMode('edit');
        setShowModal(true);
      }
    } catch (error) {
      console.error('Error al cargar usuario:', error);
      toast.error('Error al cargar usuario');
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('¿Estás seguro de eliminar este usuario?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/usuarios/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        toast.success('Usuario eliminado correctamente');
        fetchUsers();
      } else {
        toast.error('Error al eliminar usuario');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al eliminar usuario');
    }
  };

  const filteredUsers = users.filter(user =>
    user.nombre_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.numero_documento?.includes(searchTerm)
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="px-8 py-4">
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
            <p className="text-sm text-gray-500 mt-1">
              Lista completa de usuarios del sistema
            </p>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar por nombre, usuario o documento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={fetchUsers}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <RefreshCw size={18} />
                  Actualizar
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <RefreshCw className="w-8 h-8 animate-spin text-teal-600 mx-auto mb-4" />
                <p className="text-gray-500">Cargando usuarios...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Usuario</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Nombre Completo</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Documento</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Rol</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Estado</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.id_user} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white font-bold">
                              {user.username?.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-gray-900">{user.username}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {user.nombre_completo || 'Sin nombre'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {user.numero_documento || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-700">
                            {user.roles}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            user.estado_usuario === 'ACTIVO'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {user.estado_usuario}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => viewDetails(user.id_user)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Ver detalles"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={() => editUser(user.id_user)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => deleteUser(user.id_user)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredUsers.length === 0 && (
                  <div className="p-12 text-center text-gray-500">
                    No se encontraron usuarios
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Mostrando {filteredUsers.length} de {users.length} usuarios
          </div>
        </main>
      </div>

      {showModal && selectedUser && (
        modalMode === 'view' ? (
          <UserDetailModal
            user={selectedUser}
            onClose={() => {
              setShowModal(false);
              setSelectedUser(null);
            }}
            onEdit={() => setModalMode('edit')}
          />
        ) : (
          <UserEditModal
            user={selectedUser}
            onClose={() => {
              setShowModal(false);
              setSelectedUser(null);
            }}
            onSave={() => {
              fetchUsers();
              setShowModal(false);
              setSelectedUser(null);
            }}
          />
        )
      )}
    </div>
  );
}

// Modal de Detalles (solo vista)
function UserDetailModal({ user, onClose, onEdit }) {
  const photoUrl = user.personal?.foto 
    ? `/api/personal/foto/${user.personal.foto}`
    : null;

  const downloadPDF = () => {
    toast.success('Generando PDF...');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 px-8 py-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt="Foto de perfil"
                  className="w-16 h-16 rounded-full border-4 border-white/30 object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className={photoUrl ? '' : 'w-16 h-16 rounded-full border-4 border-white/30 bg-white/20 flex items-center justify-center text-2xl font-bold'}>
                {!photoUrl && user.username?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-bold">Detalles del Usuario</h2>
                <p className="text-teal-100 mt-1">{user.username}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-teal-500">
                Información Personal
              </h3>
              <InfoRow label="Nombre Completo" value={user.personal?.nombre_completo} />
              <InfoRow label="Documento" value={user.personal?.numero_documento} />
              <InfoRow label="Tipo Documento" value={user.personal?.tipo_documento} />
              <InfoRow label="Género" value={user.personal?.genero === 'M' ? 'Masculino' : 'Femenino'} />
              <InfoRow label="Fecha Nacimiento" value={user.personal?.fecha_nacimiento} />
              <InfoRow label="Edad" value={`${user.personal?.edad_actual} años`} />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-teal-500">
                Información Laboral
              </h3>
              <InfoRow label="IPRESS" value={user.personal?.ipress} />
              <InfoRow label="Área" value={user.personal?.laboral?.area} />
              <InfoRow label="Profesión" value={user.personal?.laboral?.profesion} />
              <InfoRow label="Régimen" value={user.personal?.laboral?.regimen_laboral} />
              <InfoRow label="Código Planilla" value={user.personal?.laboral?.codigo_planilla} />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-teal-500">
                Contacto
              </h3>
              <InfoRow label="Teléfono" value={user.personal?.contacto?.telefono} />
              <InfoRow label="Email Personal" value={user.personal?.contacto?.correo_personal} />
              <InfoRow label="Email Corporativo" value={user.personal?.contacto?.correo_corporativo} />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-teal-500">
                Sistema
              </h3>
              <InfoRow label="Usuario" value={user.username} />
              <InfoRow label="Estado" value={user.estado_usuario} />
              <InfoRow label="Roles" value={user.roles?.join(', ')} />
            </div>
          </div>
        </div>

        <div className="px-8 py-4 bg-gray-50 border-t border-gray-200 flex gap-3 justify-end">
          <button
            onClick={downloadPDF}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            <Download size={18} />
            Descargar PDF
          </button>
          <button
            onClick={onEdit}
            className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            <Edit size={18} />
            Editar
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

// Modal de Edición COMPLETO
function UserEditModal({ user, onClose, onSave }) {
  const [formData, setFormData] = useState({
    // Personal
    nombres: user.personal?.nombres || '',
    apellido_paterno: user.personal?.apellido_paterno || '',
    apellido_materno: user.personal?.apellido_materno || '',
    numero_documento: user.personal?.numero_documento || '',
    tipo_documento: user.personal?.tipo_documento || 'DNI',
    genero: user.personal?.genero || 'M',
    fecha_nacimiento: user.personal?.fecha_nacimiento || '',
    // Laboral
    ipress: user.personal?.ipress || '',
    area: user.personal?.laboral?.area || '',
    profesion: user.personal?.laboral?.profesion || '',
    regimen_laboral: user.personal?.laboral?.regimen_laboral || '',
    codigo_planilla: user.personal?.laboral?.codigo_planilla || '',
    // Contacto
    telefono: user.personal?.contacto?.telefono || '',
    correo_personal: user.personal?.contacto?.correo_personal || '',
    correo_corporativo: user.personal?.contacto?.correo_corporativo || '',
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(
    user.personal?.foto ? `/api/personal/foto/${user.personal.foto}` : null
  );

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      
      // Si hay foto, subirla primero
      if (photoFile) {
        const formDataPhoto = new FormData();
        formDataPhoto.append('foto', photoFile);
        
        await fetch(`/api/personal/${user.id_user}/foto`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formDataPhoto
        });
      }
      
      // Actualizar datos del usuario
      const response = await fetch(`/api/personal/${user.id_user}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        toast.success('Usuario actualizado correctamente');
        onSave();
      } else {
        toast.error('Error al actualizar usuario');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al actualizar usuario');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-16 h-16 rounded-full border-4 border-white/30 object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full border-4 border-white/30 bg-white/20 flex items-center justify-center text-2xl font-bold">
                    {user.username?.charAt(0).toUpperCase()}
                  </div>
                )}
                <label className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors shadow-lg">
                  <Camera size={16} className="text-green-600" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
              </div>
              <div>
                <h2 className="text-2xl font-bold">Editar Usuario</h2>
                <p className="text-green-100 mt-1">{user.username}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Información Personal */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-green-500">
              Información Personal
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField label="Nombres" name="nombres" value={formData.nombres} onChange={handleChange} />
              <FormField label="Apellido Paterno" name="apellido_paterno" value={formData.apellido_paterno} onChange={handleChange} />
              <FormField label="Apellido Materno" name="apellido_materno" value={formData.apellido_materno} onChange={handleChange} />
              <FormField label="Documento" name="numero_documento" value={formData.numero_documento} onChange={handleChange} />
              <FormSelect label="Tipo Documento" name="tipo_documento" value={formData.tipo_documento} onChange={handleChange}>
                <option value="DNI">DNI</option>
                <option value="CE">Carnet de Extranjería</option>
                <option value="PASAPORTE">Pasaporte</option>
              </FormSelect>
              <FormSelect label="Género" name="genero" value={formData.genero} onChange={handleChange}>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
              </FormSelect>
              <FormField label="Fecha Nacimiento" name="fecha_nacimiento" type="date" value={formData.fecha_nacimiento} onChange={handleChange} />
            </div>
          </div>

          {/* Información Laboral */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-green-500">
              Información Laboral
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="IPRESS" name="ipress" value={formData.ipress} onChange={handleChange} />
              <FormField label="Área" name="area" value={formData.area} onChange={handleChange} />
              <FormField label="Profesión" name="profesion" value={formData.profesion} onChange={handleChange} />
              <FormField label="Régimen Laboral" name="regimen_laboral" value={formData.regimen_laboral} onChange={handleChange} />
              <FormField label="Código Planilla" name="codigo_planilla" value={formData.codigo_planilla} onChange={handleChange} />
            </div>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-green-500">
              Contacto
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField label="Teléfono" name="telefono" value={formData.telefono} onChange={handleChange} />
              <FormField label="Email Personal" name="correo_personal" type="email" value={formData.correo_personal} onChange={handleChange} />
              <FormField label="Email Corporativo" name="correo_corporativo" type="email" value={formData.correo_corporativo} onChange={handleChange} />
            </div>
          </div>
        </form>

        <div className="px-8 py-4 bg-gray-50 border-t border-gray-200 flex gap-3 justify-end">
          <button
            onClick={onClose}
            type="button"
            className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            type="submit"
            className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            <Save size={18} />
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
}

// Componentes auxiliares
function InfoRow({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase">{label}</p>
      <p className="text-sm text-gray-900 mt-1">{value || 'N/A'}</p>
    </div>
  );
}

function FormField({ label, name, value, onChange, type = 'text' }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
      />
    </div>
  );
}

function FormSelect({ label, name, value, onChange, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
      >
        {children}
      </select>
    </div>
  );
}
