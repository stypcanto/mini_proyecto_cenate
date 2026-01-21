package com.styp.cenate.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDateTime;

/**
 * Entidad para auditoría detallada de accesos y cambios en ECGs
 *
 * Registra TODAS las acciones realizadas sobre cada imagen:
 * - Quién accedió (usuario, rol)
 * - Cuándo (timestamp)
 * - Qué hizo (acción: CARGADA, DESCARGADA, PROCESADA, RECHAZADA, etc)
 * - Desde dónde (IP, navegador)
 * - Resultado (exitosa, fallida, sospechosa)
 *
 * Cumple con requisitos de auditoría corporativa de EsSalud
 * Retención: Mínimo 3 años (configurables)
 *
 * Acciones auditadas:
 * - CARGADA: Imagen cargada en el sistema
 * - DESCARGADA: Usuario descargó la imagen
 * - VISUALIZADA: Imagen vista en pantalla
 * - PROCESADA: Personal CENATE aceptó la imagen
 * - RECHAZADA: Personal CENATE rechazó la imagen
 * - VINCULADA: Imagen vinculada a un usuario
 * - MODIFICADA: Cambios en metadatos
 * - ELIMINADA: Imagen eliminada (solo admin)
 *
 * @author Styp Canto Rondón
 * @version 1.0.0
 * @since 2026-01-13
 */
@Entity
@Table(name = "tele_ecg_auditoria", indexes = {
    @Index(name = "idx_tele_ecg_auditoria_imagen", columnList = "id_imagen"),
    @Index(name = "idx_tele_ecg_auditoria_usuario", columnList = "id_usuario"),
    @Index(name = "idx_tele_ecg_auditoria_fecha", columnList = "fecha_accion"),
    @Index(name = "idx_tele_ecg_auditoria_accion", columnList = "accion")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeleECGAuditoria {

    /**
     * ID único del registro de auditoría
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_auditoria")
    private Long idAuditoria;

    /**
     * Referencia a la imagen ECG
     * FK a tele_ecg_imagenes
     * Si se elimina la imagen, se elimina toda su auditoría
     * cascade=ALL: Propagar cambios a nivel Hibernate
     * @OnDelete: Trigger ON DELETE CASCADE en base de datos
     */
    @ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "id_imagen", nullable = false, foreignKey = @ForeignKey(name = "fk_auditoria_imagen"))
    @OnDelete(action = OnDeleteAction.CASCADE)
    private TeleECGImagen imagen;

    /**
     * Usuario que realizó la acción
     * FK a dim_usuarios
     * Quién ejecutó la acción auditada
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    /**
     * Nombre del usuario (denormalizado para queries rápidas)
     * Sin necesidad de JOIN a dim_usuarios
     */
    @Column(name = "nombre_usuario", length = 100)
    private String nombreUsuario;

    /**
     * Rol del usuario en el momento de la acción
     * Ej: INSTITUCION_EX, MEDICO, COORDINADOR, ADMIN
     * Denormalizado para auditoría histórica
     * (si un usuario cambia de rol, se conserva el rol al momento)
     */
    @Column(name = "rol_usuario", length = 50)
    private String rolUsuario;

    /**
     * TIPO DE ACCIÓN REALIZADA
     * Valores válidos (enum):
     * - CARGADA: Imagen subida a sistema
     * - DESCARGADA: Usuario descargó archivo
     * - VISUALIZADA: Imagen mostrada en pantalla
     * - PROCESADA: Personal CENATE aceptó imagen
     * - RECHAZADA: Personal CENATE rechazó imagen
     * - VINCULADA: Vinculada a usuario asegurado
     * - MODIFICADA: Cambios en metadatos/estado
     * - ELIMINADA: Eliminada del sistema (solo admin)
     */
    @Column(name = "accion", nullable = false, length = 50)
    private String accion;

    /**
     * DESCRIPCIÓN DETALLADA DE LA ACCIÓN
     * Información contextual específica
     * Ej para RECHAZADA: "Imagen borrosa, calidad < 70%"
     * Ej para VINCULADA: "Vinculada a usuario 12345"
     */
    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    /**
     * DIRECCIÓN IP DEL CLIENTE
     * Formato IPv4: "192.168.1.100"
     * Formato IPv6: "2001:db8::1"
     * Para detección de accesos desde ubicaciones inusuales
     */
    @Column(name = "ip_usuario", length = 45)
    private String ipUsuario;

    /**
     * USER-AGENT completo del navegador/dispositivo
     * Ej: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)..."
     * Para auditoría de dispositivos
     */
    @Column(name = "navegador", length = 255)
    private String navegador;

    /**
     * RUTA/ENDPOINT solicitado
     * Ej: "/api/teleekgs/upload"
     * "/api/teleekgs/123/descargar"
     * "/api/teleekgs/123/procesar"
     */
    @Column(name = "ruta_solicitada", length = 255)
    private String rutaSolicitada;

    /**
     * TIMESTAMP EXACTO de la acción
     * Se registra automáticamente al momento de la acción
     * Fundamental para auditoría temporal
     */
    @Column(name = "fecha_accion", nullable = false)
    private LocalDateTime fechaAccion;

    /**
     * RESULTADO DE LA ACCIÓN
     * EXITOSA: Acción completada exitosamente
     * FALLIDA: Error en la ejecución (validación, etc)
     * SOSPECHOSA: Intento malicioso detectado
     * Útil para análisis de seguridad
     */
    @Column(name = "resultado", length = 20)
    private String resultado = "EXITOSA";

    /**
     * CÓDIGO DE ERROR (si aplica)
     * Ej: "MIME_TYPE_INVALID", "FILE_SIZE_EXCEEDED"
     * Para diagnóstico y análisis de fallos
     */
    @Column(name = "codigo_error", length = 100)
    private String codigoError;

    /**
     * DATOS ADICIONALES (JSON opcional)
     * Información contextual en formato libre
     * Ej: {"cantidad_archivos": 1, "tiempo_procesamiento_ms": 234}
     * Útil para analytics y debugging
     */
    @Column(name = "datos_adicionales", columnDefinition = "TEXT")
    private String datosAdicionales;

    @PrePersist
    protected void onCreate() {
        if (this.fechaAccion == null) {
            this.fechaAccion = LocalDateTime.now();
        }
        if (this.resultado == null) {
            this.resultado = "EXITOSA";
        }
    }
}
