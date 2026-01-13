package com.styp.cenate.model;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

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
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

/**
 * Entidad que representa una solicitud de turnos enviada por un usuario IPRESS.
 * Los datos de Red, IPRESS, email, nombre y telefono se obtienen via JOINs desde PersonalCnt.
 * Tabla: solicitud_turno_ipress
 */
@Entity
@Table(name = "solicitud_turno_ipress", schema = "public",
       uniqueConstraints = @UniqueConstraint(columnNames = {"id_periodo", "id_pers"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"periodo", "personal", "detalles"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class SolicitudTurnoIpress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    @Column(name = "id_solicitud")
    private Long idSolicitud;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_periodo", nullable = false)
    private PeriodoSolicitudTurno periodo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_pers", nullable = false)
    private PersonalCnt personal;

    @Column(name = "estado", length = 20)
    @Builder.Default
    private String estado = "BORRADOR"; // BORRADOR, ENVIADO, REVISADO, APROBADA, RECHAZADA

    @Column(name = "fecha_envio", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime fechaEnvio;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime updatedAt;
    
    @Column(name = "motivo_rechazo", columnDefinition = "text")
    private String motivoRechazo;

    // ==========================================================
    // Relaciones
    // ==========================================================
    @Builder.Default
    @OneToMany(mappedBy = "solicitud", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<DetalleSolicitudTurno> detalles = new ArrayList<>();

    // ==========================================================
    // Metodos utilitarios
    // ==========================================================
    public boolean isEnviado() {
        return "ENVIADO".equalsIgnoreCase(estado);
    }

    public boolean isRevisado() {
        return "REVISADO".equalsIgnoreCase(estado);
    }

    public boolean isBorrador() {
        return "BORRADOR".equalsIgnoreCase(estado);
    }

    /**
     * Obtiene el nombre de la Red desde la IPRESS del personal
     */
    public String getNombreRed() {
        if (personal != null && personal.getIpress() != null && personal.getIpress().getRed() != null) {
            return personal.getIpress().getRed().getDescripcion();
        }
        return null;
    }

    /**
     * Obtiene el nombre de la IPRESS del personal
     */
    public String getNombreIpress() {
        if (personal != null && personal.getIpress() != null) {
            return personal.getIpress().getDescIpress();
        }
        return null;
    }

    /**
     * Obtiene el email de contacto del personal
     */
    public String getEmailContacto() {
        if (personal != null) {
            return personal.getEmailCorpPers() != null ?
                   personal.getEmailCorpPers() : personal.getEmailPers();
        }
        return null;
    }

    /**
     * Obtiene el nombre completo del personal
     */
    public String getNombreCompleto() {
        if (personal != null) {
            return personal.getNombreCompleto();
        }
        return null;
    }

    /**
     * Obtiene el telefono del personal
     */
    public String getTelefono() {
        if (personal != null) {
            return personal.getMovilPers();
        }
        return null;
    }

    /**
     * Marca la solicitud como enviada
     */
    public void enviar() {
        this.estado = "ENVIADO";
        this.fechaEnvio = OffsetDateTime.now();
    }

    /**
     * Marca la solicitud como revisada
     */
    public void marcarRevisada() {
        this.estado = "REVISADO";
    }
}
