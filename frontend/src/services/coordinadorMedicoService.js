import apiClient from './apiClient';

/**
 * Servicio para operaciones del Coordinador Médico
 * v1.63.0 - Dashboard de Supervisión Médica
 */
const coordinadorMedicoService = {
    /**
     * Obtener estadísticas de todos los médicos del área
     */
    obtenerEstadisticasMedicos: async (fechaDesde = null, fechaHasta = null) => {
        const params = {};
        if (fechaDesde) params.fechaDesde = fechaDesde;
        if (fechaHasta) params.fechaHasta = fechaHasta;

        return await apiClient.get('/coordinador-medico/estadisticas/medicos', { params });
    },

    /**
     * Obtener KPIs consolidados del área
     */
    obtenerKpis: async (fechaDesde = null, fechaHasta = null) => {
        const params = {};
        if (fechaDesde) params.fechaDesde = fechaDesde;
        if (fechaHasta) params.fechaHasta = fechaHasta;

        return await apiClient.get('/coordinador-medico/kpis', { params });
    },

    /**
     * Obtener evolución temporal de atenciones
     */
    obtenerEvolucionTemporal: async (fechaDesde = null, fechaHasta = null) => {
        const params = {};
        if (fechaDesde) params.fechaDesde = fechaDesde;
        if (fechaHasta) params.fechaHasta = fechaHasta;

        return await apiClient.get('/coordinador-medico/evolucion-temporal', { params });
    },

    /**
     * Reasignar paciente a otro médico
     */
    reasignarPaciente: async (idSolicitud, nuevoMedicoId) => {
        return await apiClient.post('/coordinador-medico/reasignar-paciente', {
            idSolicitud,
            nuevoMedicoId
        });
    },

    /**
     * Exportar estadísticas a Excel
     */
    exportarExcel: (estadisticas) => {
        import('xlsx').then(XLSX => {
            const ws = XLSX.utils.json_to_sheet(
                estadisticas.map(est => ({
                    'Médico': est.nombreMedico,
                    'Email': est.email,
                    'Total Asignados': est.totalAsignados,
                    'Atendidos': est.totalAtendidos,
                    'Pendientes': est.totalPendientes,
                    'Deserciones': est.totalDeserciones,
                    'Crónicos': est.totalCronicos,
                    'Recitas': est.totalRecitas,
                    'Interconsultas': est.totalInterconsultas,
                    'Horas Promedio': est.horasPromedioAtencion?.toFixed(2) || '—',
                    '% Atención': est.porcentajeAtencion?.toFixed(2) || '—',
                    'Tasa Deserción': est.tasaDesercion?.toFixed(2) || '—'
                }))
            );
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Estadísticas Médicos');
            XLSX.writeFile(wb, `estadisticas_medicos_${new Date().toISOString().split('T')[0]}.xlsx`);
        });
    }
};

export default coordinadorMedicoService;
