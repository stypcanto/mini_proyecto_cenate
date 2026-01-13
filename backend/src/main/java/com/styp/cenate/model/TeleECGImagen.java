package com.styp.cenate.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Entidad para almacenar electrocardiogramas enviados por IPRESS externas
 *
 * Características:
 * - Almacenamiento de imágenes JPEG/PNG en formato BYTEA (máximo 5MB)
 * - Retención automática: 30 días desde fecha de envío
 * - Vinculación con pacientes (asegurados) por DNI
 * - Auditoría completa de accesos y cambios
 * - Integración MBAC (permisos por rol)
 *
 * Estados posibles:
 * - PENDIENTE: Recibida, esperando procesamiento
 * - PROCESADA: Revisada y aceptada por personal CENATE
 * - RECHAZADA: Rechazada por mala calidad
 * - VINCULADA: Vinculada a un usuario del sistema
 *
 * @author Styp Canto Rondón
 * @version 1.0.0
 * @since 2026-01-13
 */
@Entity
@Table(name = "tele_ecg_imagenes", indexes = {
    @Index(name = "idx_tele_ecg_num_doc", columnList = "num_doc_paciente"),
    @Index(name = "idx_tele_ecg_estado", columnList = "estado"),
    @Index(name = "idx_tele_ecg_fecha_expiracion", columnList = "fecha_expiracion"),
    @Index(name = "idx_tele_ecg_ipress", columnList = "id_ipress_origen"),
    @Index(name = "idx_tele_ecg_compuesto_busqueda", columnList = "num_doc_paciente,estado,fecha_envio"),
    @Index(name = "idx_tele_ecg_limpieza", columnList = "stat_imagen,fecha_expiracion")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeleECGImagen {

    /**
     * ID único de la imagen (Auto-incremental)
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_imagen")
    private Long idImagen;

    /**
     * Número de documento del paciente (DNI/CE/Pasaporte)
     * Puede no estar vinculado a un usuario del sistema inicialmente
     */
    @Column(name = "num_doc_paciente", nullable = false, length = 20)
    private String numDocPaciente;

    /**
     * Nombres del paciente (desde IPRESS)
     */
    @Column(name = "nombres_paciente", length = 100)
    private String nombresPaciente;

    /**
     * Apellidos del paciente (desde IPRESS)
     */
    @Column(name = "apellidos_paciente", length = 100)
    private String apellidosPaciente;

    /**
     * Referencia a usuario del sistema si está vinculado
     * FK a dim_usuarios (tabla de usuarios CENATE)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario_paciente", nullable = true)
    private Usuario usuarioPaciente;

    /**
     * CONTENIDO BINARIO DE LA IMAGEN
     * Almacena la imagen JPEG/PNG en formato BYTEA (bytes)
     * Máximo: 5MB (5242880 bytes)
     * Las constraints CHECK en BD validan el tamaño
     */
    @Column(name = "contenido_imagen", nullable = false, columnDefinition = "bytea")
    private byte[] contenidoImagen;

    /**
     * Nombre original del archivo JPEG/PNG
     * Ej: "paciente_12345678_20260113.jpg"
     */
    @Column(name = "nombre_archivo", nullable = false, length = 255)
    private String nombreArchivo;

    /**
     * Tipo MIME del archivo
     * Valores válidos: image/jpeg, image/png
     * Validado tanto en frontend como en backend
     */
    @Column(name = "tipo_contenido", nullable = false, length = 50)
    private String tipoContenido;

    /**
     * Tamaño del archivo en bytes
     * Máximo permitido: 5242880 bytes (5MB)
     */
    @Column(name = "tamanio_bytes")
    private Long tamanioByte;

    /**
     * Hash SHA256 del archivo
     * Útil para:
     * - Verificar integridad del archivo
     * - Detectar duplicados
     * - Auditoría criptográfica
     */
    @Column(name = "hash_archivo", length = 64)
    private String hashArchivo;

    /**
     * IPRESS que envió el ECG
     * FK a tabla ipress
     * Requerido: Toda imagen debe venir de una IPRESS
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_ipress_origen", nullable = false)
    private Ipress ipressOrigen;

    /**
     * Código de IPRESS (denormalizado para queries rápidas)
     * Sin JOIN a tabla ipress
     */
    @Column(name = "codigo_ipress", length = 20)
    private String codigoIpress;

    /**
     * Nombre de IPRESS (denormalizado para reportes)
     */
    @Column(name = "nombre_ipress", length = 255)
    private String nombreIpress;

    /**
     * Usuario que procesó/revisó el ECG (Personal CENATE)
     * FK a dim_usuarios
     * Puede ser NULL si está en estado PENDIENTE
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario_receptor", nullable = true)
    private Usuario usuarioReceptor;

    /**
     * FECHA Y HORA de envío
     * Se establece automáticamente al crear el registro
     * No se puede cambiar después
     */
    @Column(name = "fecha_envio", nullable = false)
    private LocalDateTime fechaEnvio;

    /**
     * FECHA Y HORA de recepción/procesamiento
     * Se establece cuando el personal CENATE procesa la imagen
     */
    @Column(name = "fecha_recepcion")
    private LocalDateTime fechaRecepcion;

    /**
     * FECHA Y HORA de expiración
     * Automáticamente: fecha_envio + 30 días
     * Después de esta fecha, se marca como inactivo (stat_imagen = 'I')
     * Trigger en BD valida esto automáticamente
     */
    @Column(name = "fecha_expiracion")
    private LocalDateTime fechaExpiracion;

    /**
     * ESTADO del ECG
     * PENDIENTE: Recibida, esperando revisión
     * PROCESADA: Aceptada y procesada
     * RECHAZADA: Rechazada por mala calidad/formato
     * VINCULADA: Vinculada a un usuario del sistema
     */
    @Column(name = "estado", nullable = false, length = 20)
    private String estado = "PENDIENTE";

    /**
     * Razón del rechazo (si estado = RECHAZADA)
     * Ej: "Imagen borrosa", "Formato inválido"
     */
    @Column(name = "motivo_rechazo", columnDefinition = "TEXT")
    private String motivoRechazo;

    /**
     * Observaciones o notas adicionales
     * Campo libre para personal CENATE
     */
    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;

    /**
     * STATUS DE LA IMAGEN EN SISTEMA
     * A = ACTIVA (vigente, < 30 días)
     * I = INACTIVA (vencida, >= 30 días, marcada por limpieza automática)
     *
     * La limpieza automática (2am) busca imágenes donde:
     * - stat_imagen = 'A' AND fecha_expiracion < CURRENT_TIMESTAMP
     * - Y marca automáticamente como I (inactiva)
     */
    @Column(name = "stat_imagen", nullable = false, length = 1)
    private String statImagen = "A";

    /**
     * USUARIO que creó el registro
     * FK a dim_usuarios
     * Típicamente el sistema o usuario que ejecutó la carga
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = true)
    private Usuario createdBy;

    /**
     * TIMESTAMP de creación del registro
     * Se establece automáticamente en BD (DEFAULT CURRENT_TIMESTAMP)
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * USUARIO que modificó el registro por última vez
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by", nullable = true)
    private Usuario updatedBy;

    /**
     * TIMESTAMP de última actualización
     * Se actualiza automáticamente (trigger en BD)
     */
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * IP desde la cual se envió el ECG
     * Para auditoría y detección de anomalías
     * Ej: "192.168.1.100" o "2001:db8::1"
     */
    @Column(name = "ip_origen", length = 45)
    private String ipOrigen;

    /**
     * User-Agent del navegador/dispositivo que envió
     * Para auditoría de dispositivos
     */
    @Column(name = "navegador", length = 255)
    private String navegador;

    /**
     * Ruta/endpoint desde donde se envió
     * Típicamente: "/api/teleekgs/upload"
     */
    @Column(name = "ruta_acceso", length = 255)
    private String rutaAcceso;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.fechaEnvio = LocalDateTime.now();
        if (this.estado == null) {
            this.estado = "PENDIENTE";
        }
        if (this.statImagen == null) {
            this.statImagen = "A";
        }
        // Fecha de expiración automáticamente 30 días desde ahora
        if (this.fechaExpiracion == null) {
            this.fechaExpiracion = LocalDateTime.now().plusDays(30);
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
