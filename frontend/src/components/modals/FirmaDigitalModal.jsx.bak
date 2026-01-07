// ========================================================================
// MODAL DE FIRMA DIGITAL - CENATE
// ========================================================================
// Modal para firmar documentos con DNIe/Token USB o firma electronica simple
// ========================================================================

import React, { useState, useEffect } from 'react';
import {
  X,
  Shield,
  CheckCircle,
  AlertCircle,
  Loader2,
  Key,
  FileCheck,
  User,
  CreditCard,
  Lock,
  Usb,
  Fingerprint
} from 'lucide-react';
import firmaDigitalService from '../../services/firmaDigitalService';

// ========================================================================
// COMPONENTE PRINCIPAL
// ========================================================================

const FirmaDigitalModal = ({
  isOpen,
  onClose,
  onFirmaExitosa,
  idFormulario,
  pdfBase64,
  datosUsuario
}) => {
  // Estados del proceso de firma
  const [paso, setPaso] = useState(1); // 1: Seleccion, 2: PIN/Confirmar, 3: Firmando, 4: Resultado
  const [tipoFirma, setTipoFirma] = useState(null); // 'fortify' o 'simple'
  const [fortifyDisponible, setFortifyDisponible] = useState(false);
  const [certificados, setCertificados] = useState([]);
  const [certificadoSeleccionado, setCertificadoSeleccionado] = useState(null);
  const [pin, setPin] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [progreso, setProgreso] = useState(0);

  // Verificar disponibilidad de Fortify al abrir
  useEffect(() => {
    if (isOpen) {
      verificarFortify();
      setPaso(1);
      setTipoFirma(null);
      setError(null);
      setResultado(null);
      setPin('');
      setProgreso(0);
    }
  }, [isOpen]);

  // Verificar si Fortify esta disponible
  const verificarFortify = async () => {
    try {
      const resultado = await firmaDigitalService.verificarFortifyDisponible();
      setFortifyDisponible(resultado.disponible);
    } catch {
      setFortifyDisponible(false);
    }
  };

  // Cargar certificados cuando se selecciona Fortify
  const cargarCertificados = async () => {
    setCargando(true);
    setError(null);
    try {
      const certs = await firmaDigitalService.obtenerCertificados();
      setCertificados(certs);
      if (certs.length === 0) {
        setError('No se encontraron certificados. Conecte su DNIe o token USB.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  // Seleccionar tipo de firma
  const seleccionarTipoFirma = async (tipo) => {
    setTipoFirma(tipo);
    if (tipo === 'fortify') {
      await cargarCertificados();
    }
    setPaso(2);
  };

  // Ejecutar firma
  const ejecutarFirma = async () => {
    setPaso(3);
    setCargando(true);
    setError(null);
    setProgreso(10);

    try {
      let firmaData;

      if (tipoFirma === 'fortify') {
        // Firma con Fortify (DNIe/Token)
        setProgreso(20);
        const firmaResult = await firmaDigitalService.firmarDocumento(
          certificadoSeleccionado.id,
          certificadoSeleccionado.providerId,
          pdfBase64,
          pin
        );

        setProgreso(50);

        firmaData = {
          pdfBase64,
          firmaDigital: firmaResult.firma,
          certificado: certificadoSeleccionado.raw,
          hashDocumento: firmaResult.hashDocumento,
          dniFirmante: datosUsuario.dni,
          nombreFirmante: datosUsuario.nombreCompleto,
          algoritmoFirma: firmaResult.algoritmo
        };
      } else {
        // Firma electronica simple
        setProgreso(30);
        firmaData = await firmaDigitalService.firmarDocumentoSimplificado(pdfBase64, datosUsuario);
        setProgreso(50);
      }

      // Enviar al backend
      setProgreso(70);
      const response = await firmaDigitalService.enviarFormularioFirmado(idFormulario, firmaData);
      setProgreso(100);

      if (response.exitoso) {
        setResultado({
          exitoso: true,
          mensaje: 'Documento firmado exitosamente',
          detalles: response
        });
        setPaso(4);
        if (onFirmaExitosa) {
          onFirmaExitosa(response);
        }
      } else {
        throw new Error(response.mensaje || 'Error al firmar el documento');
      }

    } catch (err) {
      setError(err.message);
      setPaso(4);
      setResultado({
        exitoso: false,
        mensaje: err.message
      });
    } finally {
      setCargando(false);
    }
  };

  // Cerrar modal
  const handleClose = () => {
    if (!cargando) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-lg">
          <div className="flex items-center gap-2 text-white">
            <Shield className="w-6 h-6" />
            <h2 className="text-lg font-semibold">Firma Digital</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={cargando}
            className="text-white hover:bg-white/20 rounded p-1 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6">
          {/* Paso 1: Seleccion de tipo de firma */}
          {paso === 1 && (
            <div className="space-y-4">
              <p className="text-gray-600 text-sm mb-4">
                Seleccione el metodo de firma para el documento:
              </p>

              {/* Opcion Fortify/DNIe */}
              <button
                onClick={() => seleccionarTipoFirma('fortify')}
                disabled={!fortifyDisponible}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                  fortifyDisponible
                    ? 'border-blue-200 hover:border-blue-500 hover:bg-blue-50'
                    : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${fortifyDisponible ? 'bg-blue-100' : 'bg-gray-200'}`}>
                    <Usb className={`w-6 h-6 ${fortifyDisponible ? 'text-blue-600' : 'text-gray-400'}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-medium ${fortifyDisponible ? 'text-gray-900' : 'text-gray-500'}`}>
                      DNIe / Token USB
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Firma con certificado digital (DNI electronico o token USB)
                    </p>
                    {!fortifyDisponible && (
                      <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Fortify no detectado. Instale el middleware.
                      </p>
                    )}
                  </div>
                  {fortifyDisponible && <CheckCircle className="w-5 h-5 text-green-500" />}
                </div>
              </button>

              {/* Opcion Firma Simple */}
              <button
                onClick={() => seleccionarTipoFirma('simple')}
                className="w-full p-4 rounded-lg border-2 border-green-200 hover:border-green-500 hover:bg-green-50 text-left transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-green-100">
                    <Fingerprint className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      Firma Electronica Simple
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Firma con validacion de identidad del usuario autenticado
                    </p>
                    <p className="text-xs text-green-600 mt-2">
                      Recomendado para uso interno
                    </p>
                  </div>
                </div>
              </button>

              {/* Info del usuario */}
              <div className="mt-6 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-2">Firmante:</p>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">
                    {datosUsuario?.nombreCompleto || 'Usuario'}
                  </span>
                </div>
                {datosUsuario?.dni && (
                  <div className="flex items-center gap-2 mt-1">
                    <CreditCard className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">DNI: {datosUsuario.dni}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Paso 2: Seleccion de certificado o confirmacion */}
          {paso === 2 && (
            <div className="space-y-4">
              {tipoFirma === 'fortify' ? (
                <>
                  <p className="text-gray-600 text-sm">
                    Seleccione el certificado para firmar:
                  </p>

                  {cargando && (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                      <span className="ml-2 text-gray-600">Cargando certificados...</span>
                    </div>
                  )}

                  {error && (
                    <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  {!cargando && certificados.length > 0 && (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {certificados.map((cert, index) => (
                        <button
                          key={index}
                          onClick={() => setCertificadoSeleccionado(cert)}
                          className={`w-full p-3 rounded-lg border text-left transition-all ${
                            certificadoSeleccionado?.id === cert.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-blue-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{cert.subject}</p>
                              <p className="text-xs text-gray-500">{cert.providerName}</p>
                            </div>
                            {certificadoSeleccionado?.id === cert.id && (
                              <CheckCircle className="w-5 h-5 text-blue-500" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {certificadoSeleccionado && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Lock className="w-4 h-4 inline mr-1" />
                        PIN del certificado
                      </label>
                      <input
                        type="password"
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        placeholder="Ingrese su PIN"
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="text-center py-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Fingerprint className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="font-medium text-gray-900 mb-2">Confirmar Firma Electronica</h3>
                    <p className="text-sm text-gray-600">
                      Se registrara su firma electronica simple asociada a su cuenta de usuario.
                    </p>
                  </div>

                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="text-sm text-amber-800">
                      <strong>Declaracion:</strong> Al firmar este documento, declaro que la informacion
                      contenida es veraz y asumo responsabilidad por su contenido.
                    </p>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium">{datosUsuario?.nombreCompleto}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">DNI: {datosUsuario?.dni}</span>
                    </div>
                  </div>
                </>
              )}

              {/* Botones */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setPaso(1)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Volver
                </button>
                <button
                  onClick={ejecutarFirma}
                  disabled={
                    (tipoFirma === 'fortify' && (!certificadoSeleccionado || !pin)) ||
                    cargando
                  }
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Key className="w-4 h-4" />
                  Firmar Documento
                </button>
              </div>
            </div>
          )}

          {/* Paso 3: Firmando */}
          {paso === 3 && (
            <div className="text-center py-8">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
              <h3 className="font-medium text-gray-900 mb-2">Firmando documento...</h3>
              <p className="text-sm text-gray-600 mb-4">Por favor espere</p>

              {/* Barra de progreso */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progreso}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">{progreso}%</p>
            </div>
          )}

          {/* Paso 4: Resultado */}
          {paso === 4 && resultado && (
            <div className="text-center py-6">
              {resultado.exitoso ? (
                <>
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileCheck className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="font-medium text-green-700 text-lg mb-2">
                    Documento Firmado Exitosamente
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    El formulario ha sido firmado y enviado correctamente.
                  </p>

                  {resultado.detalles && (
                    <div className="text-left p-4 bg-gray-50 rounded-lg space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Firmante:</span>
                        <span className="font-medium">{resultado.detalles.nombreFirmante}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">DNI:</span>
                        <span className="font-medium">{resultado.detalles.dniFirmante}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Fecha:</span>
                        <span className="font-medium">
                          {resultado.detalles.fechaFirma
                            ? new Date(resultado.detalles.fechaFirma).toLocaleString()
                            : new Date().toLocaleString()}
                        </span>
                      </div>
                      {resultado.detalles.hashDocumento && (
                        <div className="pt-2 border-t">
                          <span className="text-gray-500 text-xs">Hash SHA-256:</span>
                          <p className="font-mono text-xs break-all text-gray-600 mt-1">
                            {resultado.detalles.hashDocumento.substring(0, 32)}...
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="font-medium text-red-700 text-lg mb-2">
                    Error al Firmar
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {resultado.mensaje}
                  </p>
                </>
              )}

              <button
                onClick={handleClose}
                className={`w-full mt-4 px-4 py-2 rounded-lg font-medium ${
                  resultado.exitoso
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                {resultado.exitoso ? 'Cerrar' : 'Reintentar'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FirmaDigitalModal;
