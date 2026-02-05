package com.styp.cenate.repository;

import com.styp.cenate.model.EmailAuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 📧 Repositorio para EmailAuditLog
 *
 * Proporciona acceso a los registros de auditoría de correos
 */
@Repository
public interface EmailAuditLogRepository extends JpaRepository<EmailAuditLog, Long> {

    /**
     * Buscar registros por destinatario
     */
    List<EmailAuditLog> findByDestinatario(String destinatario);

    /**
     * Buscar registros por estado
     */
    List<EmailAuditLog> findByEstado(String estado);

    /**
     * Buscar registros por username del usuario
     */
    List<EmailAuditLog> findByUsername(String username);

    /**
     * Buscar registros por tipo de correo
     */
    List<EmailAuditLog> findByTipoCorreo(String tipoCorreo);

    /**
     * Buscar registros fallidos
     */
    @Query("SELECT e FROM EmailAuditLog e WHERE e.estado = 'FALLIDO' ORDER BY e.fechaEnvio DESC")
    List<EmailAuditLog> findFallidos(Pageable pageable);

    /**
     * Buscar correos no entregados en un rango de fechas
     */
    @Query("SELECT e FROM EmailAuditLog e WHERE e.estado != 'ENVIADO' " +
           "AND e.fechaEnvio BETWEEN :inicio AND :fin ORDER BY e.fechaEnvio DESC")
    List<EmailAuditLog> findNoEntregados(@Param("inicio") LocalDateTime inicio,
                                         @Param("fin") LocalDateTime fin);

    /**
     * Buscar últimos correos de un usuario
     */
    @Query("SELECT e FROM EmailAuditLog e WHERE e.idUsuario = :idUsuario " +
           "ORDER BY e.fechaEnvio DESC")
    Page<EmailAuditLog> findByIdUsuario(@Param("idUsuario") Long idUsuario, Pageable pageable);

    /**
     * Contar correos enviados en un período
     */
    @Query("SELECT COUNT(e) FROM EmailAuditLog e WHERE e.estado = 'ENVIADO' " +
           "AND e.fechaEnvio BETWEEN :inicio AND :fin")
    long countEnviadosEnPeriodo(@Param("inicio") LocalDateTime inicio,
                                @Param("fin") LocalDateTime fin);

    /**
     * Encontrar por token asociado
     */
    Optional<EmailAuditLog> findByTokenAsociado(String tokenAsociado);

    /**
     * Buscar registros por tipo y estado
     */
    @Query("SELECT e FROM EmailAuditLog e WHERE e.tipoCorreo = :tipo AND e.estado = :estado " +
           "ORDER BY e.fechaEnvio DESC")
    List<EmailAuditLog> findByTipoAndEstado(@Param("tipo") String tipo,
                                            @Param("estado") String estado,
                                            Pageable pageable);

    /**
     * Buscar correos con errores de conexión
     */
    @Query("SELECT e FROM EmailAuditLog e WHERE e.estado = 'FALLIDO' " +
           "AND e.errorMensaje LIKE '%Connection%' ORDER BY e.fechaEnvio DESC")
    List<EmailAuditLog> findConErroresConexion(Pageable pageable);
}
