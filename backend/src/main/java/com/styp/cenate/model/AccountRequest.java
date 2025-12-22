package com.styp.cenate.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "account_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccountRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_request")
    private Long idRequest;

    @Column(name = "nombre_completo", nullable = false)
    private String nombreCompleto;

    @Column(name = "tipo_usuario")
    private String tipoUsuario; // INTERNO o EXTERNO

    @Column(name = "num_documento", nullable = false)
    private String numDocumento;

    @Column(name = "motivo")
    private String motivo;

    @Column(name = "estado")
    @Builder.Default
    private String estado = "PENDIENTE";

    @Column(name = "observacion_admin")
    private String observacionAdmin;

    @CreationTimestamp
    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_respuesta")
    private LocalDateTime fechaRespuesta;

    @Column(name = "id_admin")
    private Long idAdmin;

    // Campos nuevos
    @Column(name = "tipo_documento")
    private String tipoDocumento;

    @Column(name = "nombres")
    private String nombres;

    @Column(name = "apellido_paterno")
    private String apellidoPaterno;

    @Column(name = "apellido_materno")
    private String apellidoMaterno;

    @Column(name = "genero")
    private String genero;

    @Column(name = "fecha_nacimiento")
    private LocalDate fechaNacimiento;

    @Column(name = "correo_personal")
    private String correoPersonal;

    @Column(name = "correo_institucional")
    private String correoInstitucional;

    @Column(name = "telefono")
    private String telefono;

    @Column(name = "id_ipress")
    private Long idIpress;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public boolean isPendiente() {
        return "PENDIENTE".equalsIgnoreCase(estado);
    }

    public boolean isInterno() {
        return "INTERNO".equalsIgnoreCase(tipoUsuario) || "Interno".equalsIgnoreCase(tipoUsuario);
    }

    public boolean isExterno() {
        return tipoUsuario != null && tipoUsuario.toUpperCase().contains("EXTERNO");
    }

    @PrePersist
    @PreUpdate
    public void sincronizarNombreCompleto() {
        if (nombres != null && apellidoPaterno != null && apellidoMaterno != null) {
            this.nombreCompleto = nombres + " " + apellidoPaterno + " " + apellidoMaterno;
        }
    }
}