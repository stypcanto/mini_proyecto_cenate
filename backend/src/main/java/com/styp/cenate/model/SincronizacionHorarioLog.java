package com.styp.cenate.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

/**
 * 📝 Entidad que registra el log de sincronizaciones disponibilidad → horario.
 * Tabla: sincronizacion_horario_log
 *
 * Cada registro es una auditoría de sincronización que documenta:
 * - Qué disponibilidad se sincronizó
 * - A qué horario se sincronizó (si fue exitoso)
 * - Tipo de operación (CREACION/ACTUALIZACION)
 * - Resultado (EXITOSO/FALLIDO/PARCIAL)
 * - Detalles en formato JSON
 * - Errores encontrados
 *
 * IMPORTANTE: Campo detalles_operacion es JSONB para almacenar:
 * - Mapeo de turnos realizados
 * - Detalles del personal/servicio/área
 * - Resumen de horas generadas
 * - Diferencias en caso de ACTUALIZACION
 *
 * @author Ing. Styp Canto Rondón
 * @version 1.0.0
 * @since 2026-01-03
 */
@Entity
@Table(name = "sincronizacion_horario_log")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(exclude = {"disponibilidad"})
public class SincronizacionHorarioLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    @Column(name = "id_sincronizacion")
    private Long idSincronizacion;

    /**
     * Disponibilidad médica origen de la sincronización
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_disponibilidad", nullable = false)
    private DisponibilidadMedica disponibilidad;

    /**
     * Horario generado/actualizado (NULL si sincronización falló)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_ctr_horario")
    private CtrHorario ctrHorario;

    /**
     * Tipo de operación realizada
     * Valores permitidos: CREACION, ACTUALIZACION
     */
    @Column(name = "tipo_operacion", nullable = false, length = 20)
    private String tipoOperacion;

    /**
     * Resultado de la sincronización
     * Valores permitidos: EXITOSO, FALLIDO, PARCIAL
     */
    @Column(name = "resultado", nullable = false, length = 20)
    private String resultado;

    /**
     * Detalles de la operación en formato JSON
     * Ejemplo:
     * {
     *   "personal": "Dr. Juan Pérez",
     *   "periodo": "202601",
     *   "area": "Medicina General",
     *   "turnos_mapeados": [
     *     {"fecha": "2026-01-05", "turno": "MT", "horario_id": 158},
     *     ...
     *   ],
     *   "totales": {
     *     "turnos": 18,
     *     "horas": 180,
     *     "detalles_creados": 18
     *   }
     * }
     */
    @Column(name = "detalles_operacion", columnDefinition = "jsonb")
    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.JSON)
    private String detallesOperacion;

    /**
     * Usuario que ejecutó la sincronización
     * Ejemplo: "44914706" (DNI del coordinador)
     */
    @Column(name = "usuario_sincronizacion", nullable = false, length = 50)
    private String usuarioSincronizacion;

    /**
     * Fecha y hora de la sincronización
     */
    @Column(name = "fecha_sincronizacion")
    private OffsetDateTime fechaSincronizacion;

    /**
     * Errores encontrados durante la sincronización (si resultado = FALLIDO/PARCIAL)
     * Ejemplo: "Error al mapear turno MT para régimen 728: horario no encontrado"
     */
    @Column(name = "errores", columnDefinition = "TEXT")
    private String errores;

    // ==========================================================
    // 🛠️ Métodos de utilidad
    // ==========================================================

    /**
     * Verifica si la sincronización fue exitosa
     */
    public boolean isExitoso() {
        return "EXITOSO".equals(this.resultado);
    }

    /**
     * Verifica si la sincronización falló
     */
    public boolean isFallido() {
        return "FALLIDO".equals(this.resultado);
    }

    /**
     * Verifica si la sincronización fue parcial
     */
    public boolean isParcial() {
        return "PARCIAL".equals(this.resultado);
    }

    /**
     * Verifica si fue una creación
     */
    public boolean isCreacion() {
        return "CREACION".equals(this.tipoOperacion);
    }

    /**
     * Verifica si fue una actualización
     */
    public boolean isActualizacion() {
        return "ACTUALIZACION".equals(this.tipoOperacion);
    }

    /**
     * Obtiene resumen de la operación
     */
    public String getResumen() {
        String tipo = isCreacion() ? "Creación" : "Actualización";
        String estado = isExitoso() ? "exitosa" : (isFallido() ? "fallida" : "parcial");
        Long idDisp = disponibilidad != null ? disponibilidad.getIdDisponibilidad() : null;
        Long idHor = ctrHorario != null ? ctrHorario.getIdCtrHorario() : null;

        return String.format("%s %s - Disp #%d → Horario #%s",
            tipo, estado, idDisp, idHor != null ? idHor : "N/A");
    }

    /**
     * Callback antes de persistir: establecer fecha si no existe
     */
    @PrePersist
    private void prePersist() {
        if (this.fechaSincronizacion == null) {
            this.fechaSincronizacion = OffsetDateTime.now();
        }
    }
}
