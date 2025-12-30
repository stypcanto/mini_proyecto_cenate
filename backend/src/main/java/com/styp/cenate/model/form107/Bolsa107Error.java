package com.styp.cenate.model.form107;

import java.time.OffsetDateTime;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "bolsa_107_error", schema = "public")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Bolsa107Error {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_error")
    private Long idError;

    @Column(name = "id_carga", nullable = false)
    private Long idCarga;

    @Column(name = "id_raw")
    private Long idRaw;

    @Column(name = "registro")
    private String registro;

    @Column(name = "codigo_error", nullable = false)
    private String codigoError;

    @Column(name = "detalle_error")
    private String detalleError;

    @Column(name = "columnas_error")
    private String columnasError;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "raw_json", columnDefinition = "jsonb")
    private String rawJson;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;
}