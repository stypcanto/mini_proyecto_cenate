import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import disponibilidadService from '../../../services/disponibilidadService';

const useSolicitudesDisponibilidad = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentSolicitud, setCurrentSolicitud] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [periodo, setPeriodo] = useState(null);
  const [selectedDates, setSelectedDates] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const loadSolicitudes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await disponibilidadService.getSolicitudes();
      setSolicitudes(data);
    } catch (err) {
      console.error('Error cargando solicitudes:', err);
      setError('Error al cargar las solicitudes');
      message.error('No se pudieron cargar las solicitudes');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPeriodoActual = useCallback(async () => {
    try {
      const data = await disponibilidadService.getPeriodoActual();
      setPeriodo(data);
    } catch (err) {
      console.error('Error cargando período actual:', err);
      message.warning('No se pudo cargar el período actual');
    }
  }, []);

  const handleNuevaSolicitud = () => {
    setCurrentSolicitud({
      id: null,
      estado: 'BORRADOR',
      detalles: [],
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString()
    });
    setSelectedDates([]);
    setModalVisible(true);
  };

  const handleEditarSolicitud = (solicitud) => {
    if (solicitud.estado === 'APROBADO' || solicitud.estado === 'RECHAZADO') {
      message.warning('No se puede editar una solicitud ya revisada');
      return;
    }
    
    setCurrentSolicitud(solicitud);
    setSelectedDates(solicitud.detalles.map(d => d.fecha));
    setModalVisible(true);
  };

  const handleVerSolicitud = (solicitud) => {
    setCurrentSolicitud(solicitud);
    setSelectedDates(solicitud.detalles.map(d => d.fecha));
    setModalVisible(true);
  };

  const handleDateToggle = (date) => {
    setSelectedDates(prev => {
      const dateStr = new Date(date).toISOString().split('T')[0];
      if (prev.includes(dateStr)) {
        return prev.filter(d => d !== dateStr);
      } else {
        return [...prev, dateStr];
      }
    });
  };

  const handleSubmit = async () => {
    if (!currentSolicitud) return;
    
    try {
      setSubmitting(true);
      const solicitudData = {
        ...currentSolicitud,
        detalles: selectedDates.map(fecha => ({
          fecha,
          estado: 'PROPUESTO',
          turno: 'T' // Turno por defecto, se puede modificar según necesidad
        }))
      };

      let result;
      if (solicitudData.id) {
        result = await disponibilidadService.updateSolicitud(solicitudData.id, solicitudData);
      } else {
        result = await disponibilidadService.createSolicitud(solicitudData);
      }

      message.success('Solicitud guardada correctamente');
      setModalVisible(false);
      loadSolicitudes();
      return result;
    } catch (err) {
      console.error('Error guardando solicitud:', err);
      message.error('Error al guardar la solicitud');
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const handleEnviarSolicitud = async () => {
    if (!currentSolicitud) return;
    
    try {
      setSubmitting(true);
      const solicitudData = {
        ...currentSolicitud,
        estado: 'ENVIADO',
        detalles: selectedDates.map(fecha => ({
          fecha,
          estado: 'PROPUESTO',
          turno: 'T' // Turno por defecto
        }))
      };

      let result;
      if (solicitudData.id) {
        result = await disponibilidadService.updateSolicitud(solicitudData.id, solicitudData);
      } else {
        result = await disponibilidadService.createSolicitud(solicitudData);
      }

      message.success('Solicitud enviada correctamente');
      setModalVisible(false);
      loadSolicitudes();
      return result;
    } catch (err) {
      console.error('Error enviando solicitud:', err);
      message.error('Error al enviar la solicitud');
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    loadSolicitudes();
    loadPeriodoActual();
  }, [loadSolicitudes, loadPeriodoActual]);

  return {
    solicitudes,
    loading,
    error,
    currentSolicitud,
    modalVisible,
    periodo,
    selectedDates,
    submitting,
    setModalVisible,
    handleNuevaSolicitud,
    handleEditarSolicitud,
    handleVerSolicitud,
    handleDateToggle,
    handleSubmit,
    handleEnviarSolicitud,
    setSelectedDates
  };
};

export default useSolicitudesDisponibilidad;
