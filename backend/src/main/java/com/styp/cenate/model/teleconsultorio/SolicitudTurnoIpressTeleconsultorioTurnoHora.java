package com.styp.cenate.model.teleconsultorio;

import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

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
 * Entidad que representa las horas específicas de atención por turno de teleconsultorio.
 * Tabla: solicitud_turno_ipress_teleconsultorio_turno_hora
 */
@Entity
@Table(name = "solicitud_turno_ipress_teleconsultorio_turno_hora", schema = "public",
       uniqueConstraints = @UniqueConstraint(columnNames = {"id_turno", "hora"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"turno"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class SolicitudTurnoIpressTeleconsultorioTurnoHora {
    
    // Formatter que maneja horas con 1 o 2 dígitos (8:00 o 08:00)
    private static final DateTimeFormatter HOUR_FORMATTER = DateTimeFormatter.ofPattern("[H:mm][HH:mm]");

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    @Column(name = "id_turno_hora")
    private Long idTurnoHora;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_turno", nullable = false)
    private SolicitudTurnoIpressTeleconsultorioTurno turno;

    @Column(name = "hora", nullable = false)
    private LocalTime hora;

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
     * Convierte la hora a string formato HH:mm
     */
    public String getHoraString() {
        return hora != null ? hora.toString() : null;
    }

    /**
     * Verifica si la hora es de turno mañana
     */
    public boolean isHoraManana() {
        if (hora == null) return false;
        return hora.getHour() >= 8 && hora.getHour() < 14;
    }

    /**
     * Verifica si la hora es de turno tarde
     */
    public boolean isHoraTarde() {
        if (hora == null) return false;
        return hora.getHour() >= 14 && hora.getHour() < 20;
    }

    /**
     * Crea una instancia con hora específica
     */
    public static SolicitudTurnoIpressTeleconsultorioTurnoHora crearConHora(String horaString) {
        LocalTime hora = LocalTime.parse(horaString, HOUR_FORMATTER);
        return SolicitudTurnoIpressTeleconsultorioTurnoHora.builder()
                .hora(hora)
                .activo(true)
                .build();
    }

    /**
     * Crea una instancia con hora específica (int)
     */
    public static SolicitudTurnoIpressTeleconsultorioTurnoHora crearConHora(int hora) {
        LocalTime time = LocalTime.of(hora, 0);
        return SolicitudTurnoIpressTeleconsultorioTurnoHora.builder()
                .hora(time)
                .activo(true)
                .build();
    }
}