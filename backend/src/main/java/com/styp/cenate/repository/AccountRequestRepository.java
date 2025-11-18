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

    List<AccountRequest> findByEstadoOrderByFechaCreacionDesc(String estado);

    @Query("SELECT a FROM AccountRequest a WHERE a.estado = 'PENDIENTE' ORDER BY a.fechaCreacion DESC")
    List<AccountRequest> findSolicitudesPendientes();

    long countByEstado(String estado);

    List<AccountRequest> findAllByOrderByFechaCreacionDesc();
}