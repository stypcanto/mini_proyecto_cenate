package com.styp.cenate.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.OffsetDateTime;

/**
 * 📅 Entidad que representa los detalles diarios de un horario.
 * Tabla: ctr_horario_det
 *
 * Cada registro representa un día específico del horario mensual:
 * - Asocia una fecha con un turno específico (dim_horario)
 * - Define el tipo de turno (dim_tipo_turno: TRN_CHATBOT, TRN_MANUAL, etc.)
 * - Permite notas específicas para el día
 *
 * IMPORTANTE: Constraint único (id_ctr_horario, fecha_dia)
 * - Solo puede haber un detalle por horario/día
 *
 * Relación con Disponibilidad:
 * - Durante sincronización, cada DetalleDisponibilidad genera un CtrHorarioDet
 * - El turno (M/T/MT) se mapea a un id_horario específico según régimen
 * - Se marca con id_tip_turno = TRN_CHATBOT para identificar origen
 *
 * @author Ing. Styp Canto Rondón
 * @version 1.0.0
 * @since 2026-01-03
 */
@Entity
@Table(name = "ctr_horario_det")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(exclude = {"horario"})
public class CtrHorarioDet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    @Column(name = "id_ctr_horario_det")
    private Long idCtrHorarioDet;

    /**
     * Horario padre (cabecera mensual)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_ctr_horario", nullable = false)
    private CtrHorario horario;

    /**
     * Fecha del día específico
     * Ejemplo: 2026-01-05, 2026-01-06
     */
    @Column(name = "fecha_dia", nullable = false)
    private LocalDate fechaDia;

    /**
     * Horario asignado para este día (código 158, 131, 200A, etc.)
     * Puede ser NULL si el día no tiene turno asignado
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_horario")
    private DimHorario horarioDia;

    /**
     * Tipo de turno del día
     * CRÍTICO: TRN_CHATBOT para turnos generados desde disponibilidad
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_tip_turno", nullable = false)
    private DimTipoTurno tipoTurno;

    /**
     * Nota específica para este día (opcional)
     * Ejemplos: "Guardia COVID", "Reemplazo Dr. X", "Sin atención"
     */
    @Column(name = "nota_dia", columnDefinition = "TEXT")
    private String notaDia;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    // ==========================================================
    // 🛠️ Métodos de utilidad
    // ==========================================================

    /**
     * Verifica si el detalle tiene horario asignado
     */
    public boolean tieneHorarioAsignado() {
        return this.horarioDia != null && this.horarioDia.getIdHorario() != null;
    }

    /**
     * Verifica si es un turno generado desde chatbot
     */
    public boolean esTurnoChatbot() {
        return this.tipoTurno != null && this.tipoTurno.isTurnoChatbot();
    }

    /**
     * Obtiene código del horario asignado
     * Ejemplo: "158", "131", "200A", null si no tiene
     */
    public String getCodHorario() {
        return this.horarioDia != null ? this.horarioDia.getCodHorario() : null;
    }

    /**
     * Obtiene clave única del día
     * Formato: "{id_ctr_horario}-{fecha}"
     * Ejemplo: "123-2026-01-05"
     */
    public String getClaveUnica() {
        Long idHorario = horario != null ? horario.getIdCtrHorario() : null;
        return idHorario + "-" + fechaDia;
    }
}
