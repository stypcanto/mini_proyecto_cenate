package com.styp.cenate.repository;

import com.styp.cenate.model.AccountRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRequestRepository extends JpaRepository<AccountRequest, Long> {

    Optional<AccountRequest> findByNumDocumento(String numDocumento);

    boolean existsByNumDocumento(String numDocumento);

    /** Verifica si existe una solicitud ACTIVA (PENDIENTE o APROBADO) con este documento */
    @Query("SELECT COUNT(a) > 0 FROM AccountRequest a WHERE a.numDocumento = :numDoc AND a.estado IN ('PENDIENTE', 'APROBADO')")
    boolean existsSolicitudActivaByNumDocumento(@org.springframework.data.repository.query.Param("numDoc") String numDocumento);

    /** Verifica si existe una solicitud ACTIVA (PENDIENTE o APROBADO) con este correo */
    @Query("SELECT COUNT(a) > 0 FROM AccountRequest a WHERE a.correoPersonal = :correo AND a.estado IN ('PENDIENTE', 'APROBADO')")
    boolean existsSolicitudActivaByCorreoPersonal(@org.springframework.data.repository.query.Param("correo") String correoPersonal);

    boolean existsByCorreoPersonal(String correoPersonal);

    List<AccountRequest> findByEstadoOrderByFechaCreacionDesc(String estado);

    @Query("SELECT a FROM AccountRequest a WHERE a.estado = 'PENDIENTE' ORDER BY a.fechaCreacion DESC")
    List<AccountRequest> findSolicitudesPendientes();

    long countByEstado(String estado);

    List<AccountRequest> findAllByOrderByFechaCreacionDesc();
}