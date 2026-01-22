package com.styp.cenate.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

/**
 * Entidad para almacenar electrocardiogramas enviados por IPRESS externas
 *
 * Características:
 * - Almacenamiento de imágenes JPEG/PNG en filesystem (/opt/cenate/teleekgs/)
 * - Metadata de almacenamiento: storage_tipo, storage_ruta, sha256, etc
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
 * @version 2.0.0 - Migración a Filesystem Storage
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
     * CONTENIDO BINARIO DE LA IMAGEN (v1.22.0 - BYTEA Storage)
     * Almacena la imagen ECG directamente en PostgreSQL como BYTEA
     * Máximo: 5MB (5242880 bytes)
     * Formatos: JPEG, PNG
     */
    @JdbcTypeCode(SqlTypes.BINARY)
    @Column(name = "contenido_imagen")
    private byte[] contenidoImagen;

    /**
     * TIPO DE ALMACENAMIENTO
     * DATABASE: Almacenamiento en PostgreSQL como BYTEA (v1.22.0 - Default)
     * FILESYSTEM: Almacenamiento local en /opt/cenate/teleekgs/ (legacy)
     * S3: Amazon S3 (futuro)
     * MINIO: MinIO compatible S3 (futuro)
     */
    @Column(name = "storage_tipo", nullable = false, length = 20)
    private String storageTipo = "DATABASE";

    /**
     * RUTA COMPLETA DEL ARCHIVO
     * Ejemplo: /opt/cenate/teleekgs/2026/01/13/IPRESS_001/12345678_20260113_143052_a7f3.jpg
     * Estructura: {basePath}/YYYY/MM/DD/IPRESS_XXX/DNI_YYYYMMDD_HHMMSS_XXXX.ext
     */
    @Column(name = "storage_ruta", nullable = false, length = 500)
    private String storageRuta;

    /**
     * BUCKET para S3/MinIO (NULL para FILESYSTEM local)
     */
    @Column(name = "storage_bucket", length = 100)
    private String storageBucket;

    /**
     * NOMBRE DEL ARCHIVO GENERADO
     * Formato: DNI_YYYYMMDD_HHMMSS_XXXX.ext
     * Ejemplo: 12345678_20260113_143052_a7f3.jpg
     */
    @Column(name = "nombre_archivo", nullable = false, length = 255)
    private String nombreArchivo;

    /**
     * NOMBRE ORIGINAL del archivo como fue subido por IPRESS
     * Ejemplo: paciente_juan_ecg.jpg
     */
    @Column(name = "nombre_original", length = 255)
    private String nombreOriginal;

    /**
     * EXTENSIÓN del archivo (sin punto)
     * Valores: jpg, png
     */
    @Column(name = "extension", length = 10)
    private String extension;

    /**
     * TIPO MIME del archivo
     * Valores válidos: image/jpeg, image/png
     */
    @Column(name = "mime_type", nullable = false, length = 50)
    private String mimeType;

    /**
     * TAMAÑO DEL ARCHIVO en bytes
     * Máximo permitido: 5242880 bytes (5MB)
     */
    @Column(name = "size_bytes", nullable = false)
    private Long sizeBytes;

    /**
     * HASH SHA256 del archivo (64 caracteres hexadecimales)
     * Útil para:
     * - Verificar integridad del archivo
     * - Detectar duplicados
     * - Auditoría criptográfica
     */
    @Column(name = "sha256", nullable = false, length = 64)
    private String sha256;

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
     * ESTADO del ECG (v3.0.0)
     * ENVIADA: Recibida por CENATE, esperando revisión
     * OBSERVADA: Revisada pero con observaciones/problemas
     * ATENDIDA: Aceptada y completada
     *
     * Nota: En API se transforma según rol:
     * - Usuario EXTERNO: ENVIADA → ENVIADA, OBSERVADA → RECHAZADA, ATENDIDA → ATENDIDA
     * - CENATE: ENVIADA → PENDIENTE, OBSERVADA → OBSERVADA, ATENDIDA → ATENDIDA
     */
    @Column(name = "estado", nullable = false, length = 20)
    private String estado = "ENVIADA";

    /**
     * REFERENCIA A IMAGEN ANTERIOR (para subsanamiento)
     * Cuando un usuario reenvía una imagen rechazada, se crea:
     * - Nueva imagen (ENVIADA)
     * - Con id_imagen_anterior = ID de imagen anterior
     * - La anterior se marca como fue_subsanado = TRUE
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_imagen_anterior", nullable = true)
    private TeleECGImagen imagenAnterior;

    /**
     * BANDERA: ¿Fue subsanada?
     * TRUE: Esta imagen fue corregida/resubida (hay una nueva imagen que la reemplaza)
     * FALSE: Es la imagen más reciente o no fue rechazada
     */
    @Column(name = "fue_subsanado", nullable = false)
    private Boolean fueSubsanado = false;

    /**
     * @deprecated Usar campo 'observaciones' en su lugar
     * Razón del rechazo (si estado = OBSERVADA)
     */
    @Deprecated(since = "3.0.0", forRemoval = true)
    @Column(name = "motivo_rechazo", columnDefinition = "TEXT")
    private String motivoRechazo;

    /**
     * Observaciones o notas adicionales
     * Campo libre para personal CENATE
     */
    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;

    /**
     * EVALUACIÓN MÉDICA DEL ECG (v3.0.0 - Nuevo)
     * NORMAL: El ECG se ve normal, sin hallazgos relevantes
     * ANORMAL: El ECG presenta anomalías/hallazgos clínicos
     * SIN_EVALUAR: Aún no ha sido evaluado
     *
     * Este campo será usado para entrenar modelos de ML posteriormente
     */
    @Column(name = "evaluacion", length = 20)
    private String evaluacion = "SIN_EVALUAR";

    /**
     * DESCRIPCIÓN DE LA EVALUACIÓN (v3.0.0 - Nuevo)
     * Texto libre que explica POR QUÉ se marcó como NORMAL o ANORMAL
     * Ejemplos:
     * - "Normal: ritmo sinusal regular, sin arritmias, QT normal"
     * - "Anormal: taquicardia sinusal, posibles cambios isquémicos en derivaciones anteriores"
     *
     * Máximo 1000 caracteres para mantener estructurado
     * Este texto + imagen = dataset de entrenamiento para ML
     */
    @Column(name = "descripcion_evaluacion", columnDefinition = "TEXT", length = 1000)
    private String descripcionEvaluacion;

    /**
     * USUARIO QUE REALIZÓ LA EVALUACIÓN (v3.0.0 - Nuevo)
     * FK a dim_usuarios
     * Típicamente: Médico de CENATE que evaluó el ECG
     * NULL si evaluacion = SIN_EVALUAR
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario_evaluador", nullable = true)
    private Usuario usuarioEvaluador;

    /**
     * FECHA Y HORA DE LA EVALUACIÓN (v3.0.0 - Nuevo)
     * Se establece cuando el médico guarda la evaluación
     * NULL si evaluacion = SIN_EVALUAR
     */
    @Column(name = "fecha_evaluacion")
    private LocalDateTime fechaEvaluacion;

    /**
     * FECHA Y HORA DEL RECHAZO (v3.1.0 - Pendiente)
     * Se establece cuando el médico rechaza por mala calidad
     * NULL si estado != RECHAZADA
     * Auditoría de cuándo se rechazó la imagen
     *
     * @deprecated: Campo no implementado aún en la BD.
     * Usar @Transient para evitar que Hibernate intente consultarlo
     */
    @Transient
    private LocalDateTime fechaRechazo;

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

    // ════════════════════════════════════════════════════════════════
    // NOTA CLÍNICA (v3.0.0 - NUEVO)
    // ════════════════════════════════════════════════════════════════

    /**
     * HALLAZGOS CLÍNICOS (v3.0.0 - Nuevo)
     * JSON Array de checkboxes seleccionados
     * Estructura: {"ritmo": true, "frecuencia": false, "intervaloPR": true, ...}
     * Campos posibles: ritmo, frecuencia, intervaloPR, duracionQRS, segmentoST, ondaT, eje
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "nota_clinica_hallazgos", columnDefinition = "jsonb")
    private String notaClinicaHallazgos;

    /**
     * OBSERVACIONES CLÍNICAS (v3.0.0 - Nuevo)
     * Campo texto libre para notas adicionales del médico
     * Máximo: 2000 caracteres
     */
    @Column(name = "nota_clinica_observaciones", columnDefinition = "TEXT", length = 2000)
    private String notaClinicaObservaciones;

    /**
     * PLAN DE SEGUIMIENTO (v3.0.0 - Nuevo)
     * JSON con plan de seguimiento del paciente
     * Estructura:
     * {
     *   "seguimientoMeses": true,
     *   "seguimientoDias": 6,
     *   "derivarCardiologo": false,
     *   "hospitalizar": true,
     *   "medicamentos": false,
     *   "otrosPlan": "Descripción adicional"
     * }
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "nota_clinica_plan_seguimiento", columnDefinition = "jsonb")
    private String notaClinicaPlanSeguimiento;

    /**
     * USUARIO QUE CREÓ LA NOTA CLÍNICA (v3.0.0 - Nuevo)
     * FK a dim_usuarios
     * Típicamente: Médico de CENATE que completó la nota clínica
     * NULL si no hay nota clínica registrada
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario_nota_clinica", nullable = true)
    private Usuario usuarioNotaClinica;

    /**
     * FECHA Y HORA DE LA NOTA CLÍNICA (v3.0.0 - Nuevo)
     * Se establece cuando el médico guarda la nota clínica
     * NULL si no hay nota clínica registrada
     */
    @Column(name = "fecha_nota_clinica")
    private LocalDateTime fechaNotaClinica;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.fechaEnvio = LocalDateTime.now();
        if (this.estado == null) {
            this.estado = "ENVIADA";  // v3.0.0: Default ENVIADA en lugar de PENDIENTE
        }
        if (this.statImagen == null) {
            this.statImagen = "A";
        }
        if (this.fueSubsanado == null) {
            this.fueSubsanado = false;
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
