package com.styp.cenate.dto.dengue;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * DTO para mapear cada fila del Excel de Dengue
 *
 * VINCULACIONES:
 * 1️⃣  dni → Normalizar a 8 dígitos + buscar en asegurados
 * 2️⃣  dx_main → Validar CIE-10 (A97.0, A97.1, A97.2)
 * 3️⃣  cenasicod → Lookup IPRESS + red asistencial
 * 4️⃣  fecha_aten → Usar como campo existing fecha_atencion
 * 5️⃣  fecha_st + semana → Guardar en BD
 *
 * @version 1.0.0
 * @since 2026-01-29
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DengueExcelRowDTO {

    // PACIENTE (Columnas 1-4)
    private Object dni;                   // Columna A: DNI (puede ser String o número)
    private String sexo;                  // Columna B: Sexo (M/F)
    private Integer edad;                 // Columna C: Edad
    private LocalDate fechaAten;          // Columna D: Fecha Atención

    // UBICACIÓN/INFRAESTRUCTURA (Columnas 5-7)
    private Integer cenasicod;            // Columna E: CAS (Código Cenasi)
    private String dxMain;                // Columna F: CIE-10 (Diagnóstico principal)
    private String servicio;              // Columna G: Servicio de atención

    // IPRESS (Columnas 8-9)
    private String ipress;                // Columna H: Nombre IPRESS
    private String red;                   // Columna I: Red Asistencial

    // PACIENTE INFO (Columnas 10-12)
    private String nombre;                // Columna J: Nombre completo paciente
    private String telefFijo;             // Columna K: Teléfono fijo
    private String telefMovil;            // Columna L: Teléfono móvil

    // DENGUE SPECIFIC (Columnas 13-14)
    private LocalDate fechaSt;            // Columna M: Fecha de síntomas
    private String semana;                // Columna N: Semana epidemiológica (ej: 2025SE25)

    public boolean esValida() {
        return dni != null && fechaAten != null && dxMain != null;
    }

    @Override
    public String toString() {
        return "DengueExcelRowDTO{" +
                "dni=" + dni +
                ", nombre='" + nombre + '\'' +
                ", dxMain='" + dxMain + '\'' +
                ", fechaAten=" + fechaAten +
                '}';
    }
}
