package com.styp.cenate.dto.dengue;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * DTO que mapea una fila del Excel de Dengue
 *
 * Representa los 14 campos del archivo:
 * "Atendidos Dengue CENATE 2026-01-27.xlsx"
 *
 * @version 1.0.0
 * @since 2026-01-29
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DengueExcelRowDTO {

    // 📋 Campos del Excel (14 columnas)

    private String dni;                 // Column 1: dni → paciente_dni (normalizar a 8 dígitos)
    private String sexo;                // Column 2: sexo → paciente_sexo
    private Integer edad;               // Column 3: edad → paciente_edad
    private LocalDate fechaAten;        // Column 4: fec_aten → fecha_atencion
    private Integer cenasicod;          // Column 5: cenasicod → LOOKUP a dim_ipress
    private String dxMain;              // Column 6: dx_main → VALIDAR contra CIE-10
    private String servicio;            // Column 7: servicio (informativo)
    private String ipress;              // Column 8: ipress → LOOKUP a dim_ipress por cenasicod
    private String red;                 // Column 9: red → LOOKUP a dim_ipress por cenasicod
    private String nombre;              // Column 10: nombre → LOOKUP en asegurados o directamente
    private String telefFijo;           // Column 11: telef_fijo → paciente_telefono
    private String telefMovil;          // Column 12: telef_movil → paciente_telefono_alterno
    private LocalDate fechaSt;          // Column 13: fec_st → fecha_sintomas (GUARDAR, no mostrar)
    private String semana;              // Column 14: semana → semana_epidem (GUARDAR, no mostrar)

}
