package com.styp.cenate.dto.bolsas;

import com.styp.cenate.model.bolsas.TipoErrorImportacion;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.Map;

/**
 * ✅ v1.20.0: DTO para consulta de errores de importación
 * Expone estructura de auditoría a través de API REST
 *
 * @since 2026-01-28
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditErrorDTO {

    private Long idError;

    private Long idCargaHistorial;

    private Integer numeroFila;

    private String dniPaciente;

    private String nombrePaciente;

    private String especialidad;

    private String ipress;

    private TipoErrorImportacion tipoError;

    private String descripcionError;

    private Map<String, Object> datosExcelJson;

    private OffsetDateTime fechaCreacion;
}
