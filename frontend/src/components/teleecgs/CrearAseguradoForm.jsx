// ========================================================================
// 👤 CrearAseguradoForm.jsx – Formulario para Crear Nuevo Asegurado
// ✅ VERSIÓN 1.0.0 - CENATE 2026
// ========================================================================

import React, { useState } from "react";
import { X, Loader, AlertCircle, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import aseguradosService from "../../services/aseguradosService";

export default function CrearAseguradoForm({
  numDocPaciente,
  nombresPaciente,
  apellidosPaciente,
  onCancel,
  onSuccess
}) {
  const [formData, setFormData] = useState({
    numDoc: numDocPaciente || "",
    nombres: nombresPaciente || "",
    apellidos: apellidosPaciente || "",
    fechaNacimiento: "",
    genero: "M",
    telefono: "",
    email: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };

  const validarFormulario = () => {
    if (!formData.numDoc || formData.numDoc.length !== 8) {
      setError("El DNI debe tener exactamente 8 dígitos");
      return false;
    }
    if (!formData.nombres.trim()) {
      setError("El nombre es requerido");
      return false;
    }
    if (!formData.apellidos.trim()) {
      setError("El apellido es requerido");
      return false;
    }
    if (!formData.fechaNacimiento) {
      setError("La fecha de nacimiento es requerida");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) return;

    try {
      setLoading(true);
      setError(null);

      const payload = {
        numDoc: formData.numDoc,
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        fechaNacimiento: formData.fechaNacimiento,
        genero: formData.genero,
        telefono: formData.telefono || null,
        email: formData.email || null
      };

      await aseguradosService.crearDesdeTelukg(payload);

      toast.success("✅ Asegurado creado correctamente");
      onSuccess?.();

    } catch (error) {
      const mensaje = error.response?.data?.message || "Error al crear el asegurado";
      setError(mensaje);
      toast.error(mensaje);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Crear Nuevo Asegurado</h2>
          <button onClick={onCancel} className="p-2 hover:bg-blue-500 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Mensaje de error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* DNI */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              DNI *
            </label>
            <input
              type="text"
              name="numDoc"
              maxLength="8"
              value={formData.numDoc}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="12345678"
              disabled={loading}
            />
          </div>

          {/* Nombres */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombres *
            </label>
            <input
              type="text"
              name="nombres"
              value={formData.nombres}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Juan"
              disabled={loading}
            />
          </div>

          {/* Apellidos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Apellidos *
            </label>
            <input
              type="text"
              name="apellidos"
              value={formData.apellidos}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Pérez García"
              disabled={loading}
            />
          </div>

          {/* Fecha de Nacimiento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Nacimiento *
            </label>
            <input
              type="date"
              name="fechaNacimiento"
              value={formData.fechaNacimiento}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          {/* Género */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Género *
            </label>
            <select
              name="genero"
              value={formData.genero}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
            </select>
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono (Opcional)
            </label>
            <input
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="987654321"
              disabled={loading}
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email (Opcional)
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="usuario@example.com"
              disabled={loading}
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition ${
                loading
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Crear Asegurado
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
