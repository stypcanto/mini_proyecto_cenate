// Modal de Creación/Edición de IPRESS
import React, { useState, useEffect } from 'react';
import { X, Building2, Save, MapPin } from 'lucide-react';
import { ipressService } from '../../../services/ipressService';

const IpressFormModal = ({ ipress = null, redes = [], onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [modalidades, setModalidades] = useState([]);
  const [loadingModalidades, setLoadingModalidades] = useState(false);

  const [formData, setFormData] = useState({
    codIpress: '',
    descIpress: '',
    idRed: '',
    idNivAten: 1,
    idModAten: '',
    direcIpress: '',
    idTipIpress: 1,
    idDist: 1,
    latIpress: '',
    longIpress: '',
    gmapsUrlIpress: '',
    statIpress: 'A',
  });

  const [errors, setErrors] = useState({});

  // Cargar datos de modalidades
  useEffect(() => {
    cargarModalidades();
  }, []);

  // Si es edición, cargar datos del IPRESS
  useEffect(() => {
    if (ipress) {
      setFormData({
        codIpress: ipress.codIpress || '',
        descIpress: ipress.descIpress || '',
        idRed: ipress.idRed || '',
        idNivAten: ipress.idNivAten || 1,
        idModAten: ipress.idModAten || '',
        direcIpress: ipress.direcIpress || '',
        idTipIpress: ipress.idTipIpress || 1,
        idDist: ipress.idDist || 1,
        latIpress: ipress.latIpress || '',
        longIpress: ipress.longIpress || '',
        gmapsUrlIpress: ipress.gmapsUrlIpress || '',
        statIpress: ipress.statIpress || 'A',
      });
    }
  }, [ipress]);

  const cargarModalidades = async () => {
    try {
      setLoadingModalidades(true);
      const data = await ipressService.obtenerModalidadesActivas();
      setModalidades(data);
    } catch (error) {
      console.error('Error al cargar modalidades:', error);
    } finally {
      setLoadingModalidades(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Limpiar error del campo
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.codIpress.trim()) {
      newErrors.codIpress = 'El código es obligatorio';
    }

    if (!formData.descIpress.trim()) {
      newErrors.descIpress = 'El nombre es obligatorio';
    }

    if (!formData.idRed) {
      newErrors.idRed = 'La red asistencial es obligatoria';
    }

    if (!formData.direcIpress.trim()) {
      newErrors.direcIpress = 'La dirección es obligatoria';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setLoading(true);

      // Preparar payload
      const payload = {
        ...formData,
        idRed: parseInt(formData.idRed),
        idNivAten: parseInt(formData.idNivAten),
        idModAten: formData.idModAten ? parseInt(formData.idModAten) : null,
        idTipIpress: parseInt(formData.idTipIpress),
        idDist: parseInt(formData.idDist),
        latIpress: formData.latIpress ? parseFloat(formData.latIpress) : null,
        longIpress: formData.longIpress ? parseFloat(formData.longIpress) : null,
      };

      if (ipress) {
        // Actualizar
        await ipressService.actualizar(ipress.idIpress, payload);
      } else {
        // Crear
        await ipressService.crear(payload);
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error al guardar IPRESS:', error);
      alert(error.message || 'Error al guardar IPRESS');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div className="text-white">
              <h2 className="text-xl font-bold">
                {ipress ? 'Editar IPRESS' : 'Nueva IPRESS'}
              </h2>
              <p className="text-sm text-blue-100">
                {ipress ? 'Actualizar información de la institución' : 'Registrar nueva institución de salud'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Código IPRESS */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Código IPRESS <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="codIpress"
                value={formData.codIpress}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.codIpress
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="Ej: 00012345"
              />
              {errors.codIpress && (
                <p className="mt-1 text-sm text-red-600">{errors.codIpress}</p>
              )}
            </div>

            {/* Nombre IPRESS */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nombre de la Institución <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="descIpress"
                value={formData.descIpress}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.descIpress
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="Ej: Hospital Nacional Edgardo Rebagliati Martins"
              />
              {errors.descIpress && (
                <p className="mt-1 text-sm text-red-600">{errors.descIpress}</p>
              )}
            </div>

            {/* Red Asistencial */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Red Asistencial <span className="text-red-500">*</span>
              </label>
              <select
                name="idRed"
                value={formData.idRed}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.idRed
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
              >
                <option value="">Seleccione una red</option>
                {redes.map((red) => (
                  <option key={red.id || red.idRed} value={red.id || red.idRed}>
                    {red.descripcion || red.descRed}
                  </option>
                ))}
              </select>
              {errors.idRed && (
                <p className="mt-1 text-sm text-red-600">{errors.idRed}</p>
              )}
            </div>

            {/* Modalidad de Atención */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Modalidad de Atención
              </label>
              <select
                name="idModAten"
                value={formData.idModAten}
                onChange={handleChange}
                disabled={loadingModalidades}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sin modalidad especificada</option>
                {modalidades.map((mod) => (
                  <option key={mod.idModAten} value={mod.idModAten}>
                    {mod.descModAten}
                  </option>
                ))}
              </select>
            </div>

            {/* Dirección */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Dirección <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="direcIpress"
                value={formData.direcIpress}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.direcIpress
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="Ej: Av. Edgardo Rebagliati 490, Jesús María"
              />
              {errors.direcIpress && (
                <p className="mt-1 text-sm text-red-600">{errors.direcIpress}</p>
              )}
            </div>

            {/* Coordenadas */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Latitud
              </label>
              <input
                type="number"
                step="0.0000001"
                name="latIpress"
                value={formData.latIpress}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="-12.0463731"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Longitud
              </label>
              <input
                type="number"
                step="0.0000001"
                name="longIpress"
                value={formData.longIpress}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="-77.0509363"
              />
            </div>

            {/* URL Google Maps */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                URL de Google Maps
              </label>
              <input
                type="url"
                name="gmapsUrlIpress"
                value={formData.gmapsUrlIpress}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://maps.google.com/..."
              />
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Estado
              </label>
              <select
                name="statIpress"
                value={formData.statIpress}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="A">Activo</option>
                <option value="I">Inactivo</option>
              </select>
            </div>

          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 rounded-xl transition-all font-medium"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all font-medium shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {ipress ? 'Actualizar IPRESS' : 'Crear IPRESS'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IpressFormModal;
