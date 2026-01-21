package com.styp.cenate.model;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;

import com.styp.cenate.model.solicitudturnoipress.DetalleSolicitudTurnoFecha;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

/**
 * Entidad que representa el detalle de turnos solicitados por especialidad.
 * Cada registro indica cuantos turnos solicita una IPRESS para una especialidad especifica.
 * Tabla: detalle_solicitud_turno
 */
@Entity
@Table(name = "detalle_solicitud_turno", schema = "public")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"solicitud", "especialidad"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class DetalleSolicitudTurno {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    //@EqualsAndHashCode.Include
    @Column(name = "id_detalle")
    private Long idDetalle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_solicitud", nullable = false)
    private SolicitudTurnoIpress solicitud;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_servicio", nullable = false)
    private DimServicioEssi especialidad;

    @Column(name = "turnos_solicitados")
    @Builder.Default
    private Integer turnosSolicitados = 0;

    @Column(name = "turno_preferente", length = 100)
    private String turnoPreferente; // "Manana", "Tarde", "Noche"

    @Column(name = "dia_preferente", length = 200)
    private String diaPreferente; // "Lunes, Miercoles, Viernes"

    @Column(name = "observacion", columnDefinition = "TEXT")
    private String observacion;
    
    
    /* INICIO CAMPOS NUEVOS AGREGADOS*/
    
    // =========================
    // MAÑANA
    // =========================
    @Column(name = "manana_activa", nullable = false)
    @Builder.Default
    private Boolean mananaActiva = false;

    /**
     * Ej: "Lun,Mar,Mie"
     */
    @Column(name = "dias_manana", length = 100)
    private String diasManana;

    // =========================
    // TARDE
    // =========================
    @Column(name = "tarde_activa", nullable = false)
    @Builder.Default
    private Boolean tardeActiva = false;

    /**
     * Ej: "Jue,Vie"
     */
    @Column(name = "dias_tarde", length = 100)
    private String diasTarde;
    
    @Column(name = "requiere", nullable = false)
    @Builder.Default
    private Boolean requiere = false;
    
    /* FIN CAMPOS NUEVOS AGREGADOS*/
    
    
    
    
    @Column(name = "turnos_tm", nullable = false)
    @Builder.Default
    private Integer turnosTm = 0; // JSON: turnoTM

    @Column(name = "turnos_manana", nullable = false)
    @Builder.Default
    private Integer turnosManana = 0; // JSON: turnoManana

    @Column(name = "turnos_tarde", nullable = false)
    @Builder.Default
    private Integer turnosTarde = 0; // JSON: turnoTarde

    @Column(name = "teleconsultorio_activo", nullable = false)
    @Builder.Default
    private Boolean teleconsultorioActivo = false; // JSON: tc

    @Column(name = "teleconsulta_activo", nullable = false)
    @Builder.Default
    private Boolean teleconsultaActivo = false; // JSON: tl

    @Column(name = "estado", nullable = false, length = 30)
    @Builder.Default
    private String estado = "PENDIENTE";

    // =========================
    // RELACIÓN A FECHAS
    // =========================
    @OneToMany(mappedBy = "detalle", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<DetalleSolicitudTurnoFecha> fechasDetalle = new ArrayList<>();
    
    
    
    
    
    
    
    
    

    @CreationTimestamp
    @Column(name = "created_at", updatable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime createdAt;

    // ==========================================================
    // Metodos utilitarios
    // ==========================================================

    /**
     * Obtiene el nombre de la especialidad
     */
    public String getNombreEspecialidad() {
        return especialidad != null ? especialidad.getDescServicio() : null;
    }

    /**
     * Obtiene el codigo de la especialidad
     */
    public String getCodigoEspecialidad() {
        return especialidad != null ? especialidad.getCodServicio() : null;
    }

    /**
     * Indica si hay turnos solicitados
     */
    public boolean tieneTurnosSolicitados() {
        return turnosSolicitados != null && turnosSolicitados > 0;
    }
}
