package com.styp.cenate.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

/**
 * 🧾 Representa una solicitud de creación de cuenta.
 * Revisada y aprobada o rechazada por el administrador.
 */
@Entity
@Table(name = "account_requests", schema = "public")
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

    @Column(name = "tipo_usuario", nullable = false)
    private String tipoUsuario; // INTERNO / EXTERNO

    @Column(name = "num_documento", nullable = false)
    private String numDocumento;

    @Column(name = "motivo")
    private String motivo;

    @Builder.Default
    @Column(name = "estado", nullable = false)
    private String estado = "PENDIENTE"; // PENDIENTE / APROBADO / RECHAZADO

    @Column(name = "observacion_admin")
    private String observacionAdmin;

    @CreationTimestamp
    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_respuesta")
    private LocalDateTime fechaRespuesta;

    @Column(name = "id_admin")
    private Long idAdmin;
}