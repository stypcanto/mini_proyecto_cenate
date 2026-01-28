package com.styp.cenate.service.bolsas;

import com.styp.cenate.dto.bolsas.AuditErrorDTO;
import com.styp.cenate.dto.bolsas.SolicitudBolsaExcelRowDTO;
import com.styp.cenate.model.bolsas.AuditErrorImportacion;
import com.styp.cenate.model.bolsas.SolicitudBolsa;
import com.styp.cenate.model.bolsas.TipoErrorImportacion;
import com.styp.cenate.repository.bolsas.AuditErroresImportacionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * ✅ v1.20.0: Servicio dedicado para auditoría de errores de importación
 * Responsabilidad única: Gestionar registros de auditoría
 *
 * ARQUITECTURA:
 * - Transacciones INDEPENDIENTES (@Transactional(REQUIRES_NEW))
 * - Fallo de auditoría NO afecta importación principal
 * - Reusable para Form107, Tele-ECG, otros módulos
 *
 * @since 2026-01-28
 * @version v1.20.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuditErrorImportacionService {

    private final AuditErroresImportacionRepository auditErrorRepository;

    /**
     * ✅ TRANSACCIÓN INDEPENDIENTE: REQUIRES_NEW
     * Si esta transacción falla, NO rollback de la importación principal
     *
     * Registra un error de importación en la tabla de auditoría
     * con datos completos para debugging y compliance
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void registrarError(
            Long idHistorial,
            int numeroFila,
            SolicitudBolsaExcelRowDTO rowDTO,
            TipoErrorImportacion tipoError,
            String descripcionError,
            SolicitudBolsa solicitud) {

        try {
            // Construir mapa con datos del Excel (snapshot)
            Map<String, Object> datosExcelJson = construirDatosExcelJson(rowDTO);

            // Crear registro de auditoría
            AuditErrorImportacion auditError = AuditErrorImportacion.builder()
                    .idCargaHistorial(idHistorial)
                    .numeroFila(numeroFila)
                    .dniPaciente(rowDTO.dni())
                    .nombrePaciente(rowDTO.nombreCompleto())
                    .especialidad(solicitud != null ? solicitud.getEspecialidad() : rowDTO.tipoCita())
                    .ipress(rowDTO.codigoIpress())
                    .tipoError(tipoError)
                    .descripcionError(descripcionError)
                    .datosExcelJson(datosExcelJson)
                    .build();

            // Persistir en BD (transacción independiente)
            auditErrorRepository.save(auditError);

            log.debug("✅ [AUDITORÍA] Error registrado - Fila: {}, Tipo: {}, DNI: {}",
                    numeroFila, tipoError, rowDTO.dni());

        } catch (Exception e) {
            // ⚠️ LOG del error PERO NO relanzar excepción
            // La auditoría NO debe bloquear la importación principal
            log.error("❌ [AUDITORÍA CRÍTICA] Fallo al registrar error (Fila {}): {} | Tipo: {}",
                    numeroFila, e.getMessage(), tipoError);
            log.error("Stack trace:", e);
            // Continuar sin relanzar - la importación debe terminar normalmente
        }
    }

    /**
     * Obtiene todos los errores de una importación específica
     */
    public List<AuditErrorDTO> obtenerErroresPorCarga(Long idCarga) {
        try {
            return auditErrorRepository.findByIdCargaHistorial(idCarga)
                    .stream()
                    .map(this::mapToDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error obteniendo errores para carga {}: {}", idCarga, e.getMessage());
            return new ArrayList<>();
        }
    }

    /**
     * Obtiene TODOS los errores de TODAS las importaciones
     * ✅ Endpoint para page ErroresImportacion
     */
    public List<AuditErrorDTO> obtenerTodosLosErrores() {
        try {
            return auditErrorRepository.findAll()
                    .stream()
                    .map(this::mapToDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error obteniendo todos los errores: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    /**
     * Cuenta errores agrupados por tipo (para resumen en dashboard)
     */
    public Map<String, Long> contarErroresPorTipo(Long idCarga) {
        try {
            return auditErrorRepository.contarErroresPorTipo(idCarga)
                    .stream()
                    .collect(Collectors.toMap(
                            m -> (String) m.get("tipo"),
                            m -> ((Number) m.get("cantidad")).longValue()
                    ));
        } catch (Exception e) {
            log.error("Error contando errores por tipo para carga {}: {}", idCarga, e.getMessage());
            return new HashMap<>();
        }
    }

    /**
     * Construye mapa JSON con datos de la fila Excel para almacenamiento
     * Útil para debugging y auditoría forense
     */
    private Map<String, Object> construirDatosExcelJson(SolicitudBolsaExcelRowDTO rowDTO) {
        Map<String, Object> datos = new HashMap<>();
        datos.put("fecha_preferida", rowDTO.fechaPreferidaNoAtendida());
        datos.put("tipo_documento", rowDTO.tipoDocumento());
        datos.put("dni", rowDTO.dni());
        datos.put("nombre_completo", rowDTO.nombreCompleto());
        datos.put("sexo", rowDTO.sexo());
        datos.put("fecha_nacimiento", rowDTO.fechaNacimiento());
        datos.put("telefono_principal", rowDTO.telefonoPrincipal());
        datos.put("telefono_alterno", rowDTO.telefonoAlterno());
        datos.put("correo", rowDTO.correo());
        datos.put("codigo_ipress", rowDTO.codigoIpress());
        datos.put("tipo_cita", rowDTO.tipoCita());
        return datos;
    }

    /**
     * Mapea entidad JPA a DTO para exposición en API
     */
    private AuditErrorDTO mapToDTO(AuditErrorImportacion entity) {
        return AuditErrorDTO.builder()
                .idError(entity.getIdError())
                .idCargaHistorial(entity.getIdCargaHistorial())
                .numeroFila(entity.getNumeroFila())
                .dniPaciente(entity.getDniPaciente())
                .nombrePaciente(entity.getNombrePaciente())
                .especialidad(entity.getEspecialidad())
                .ipress(entity.getIpress())
                .tipoError(entity.getTipoError())
                .descripcionError(entity.getDescripcionError())
                .datosExcelJson(entity.getDatosExcelJsonImmutable())
                .fechaCreacion(entity.getFechaCreacion())
                .build();
    }
}
