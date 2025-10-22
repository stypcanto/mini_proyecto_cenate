package com.styp.cenate.model;
import lombok.Data;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "solicitudes_cuenta")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class SolicitudCuenta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombreCompleto;
    private String email;
    private String motivo;
    private String areaSolicitante;

    @Column(nullable = false)
    private String estado; // PENDIENTE | APROBADA | RECHAZADA

    // ✅ Fecha con valor por defecto y sin warnings
    @Builder.Default
    private LocalDateTime fechaSolicitud = LocalDateTime.now();
}
