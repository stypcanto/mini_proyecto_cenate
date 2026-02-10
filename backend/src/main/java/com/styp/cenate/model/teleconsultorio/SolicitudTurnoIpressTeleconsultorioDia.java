package com.styp.cenate.model.teleconsultorio;

import java.time.OffsetDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.styp.cenate.model.SolicitudTurnoIpress;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

/**
 * Entidad que representa los días de atención de teleconsultorio para una solicitud de turnos.
 * Tabla: solicitud_turno_ipress_teleconsultorio_dia
 */
@Entity
@Table(name = "solicitud_turno_ipress_teleconsultorio_dia", schema = "public",
       uniqueConstraints = @UniqueConstraint(columnNames = {"id_solicitud", "dia_semana"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"solicitud"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class SolicitudTurnoIpressTeleconsultorioDia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    @Column(name = "id_dia")
    private Long idDia;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_solicitud", nullable = false)
    private SolicitudTurnoIpress solicitud;

    @Column(name = "dia_semana", nullable = false)
    private Integer diaSemana; // 1=LUN, 2=MAR, ..., 7=DOM

    @Column(name = "activo", nullable = false)
    @Builder.Default
    private Boolean activo = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime updatedAt;

    // ==========================================================
    // Métodos utilitarios
    // ==========================================================

    /**
     * Convierte el número de día de semana a string
     */
    public String getDiaSemanaString() {
        switch (diaSemana) {
            case 1: return "LUN";
            case 2: return "MAR";
            case 3: return "MIE";
            case 4: return "JUE";
            case 5: return "VIE";
            case 6: return "SAB";
            case 7: return "DOM";
            default: return "DESCONOCIDO";
        }
    }

    /**
     * Convierte el string de día de semana a número
     */
    public static Integer stringToDiaSemana(String dia) {
        switch (dia.toUpperCase()) {
            case "LUN": return 1;
            case "MAR": return 2;
            case "MIE": return 3;
            case "JUE": return 4;
            case "VIE": return 5;
            case "SAB": return 6;
            case "DOM": return 7;
            default: throw new IllegalArgumentException("Día de semana inválido: " + dia);
        }
    }
}