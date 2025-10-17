package com.styp.cenate.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.styp.cenate.model.AccountRequest;

import java.util.List;
import java.util.Optional;

/**
 * 📦 Repositorio para manejar las solicitudes de creación de cuenta.
 */
@Repository
public interface AccountRequestRepository extends JpaRepository<AccountRequest, Long> {

    /**
     * Busca una solicitud por número de documento (único por usuario).
     *
     * @param numDocumento número de documento del solicitante
     * @return Optional con la solicitud si existe
     */
    Optional<AccountRequest> findByNumDocumento(String numDocumento);

    /**
     * Lista todas las solicitudes con un estado determinado.
     * Ejemplo: "PENDIENTE", "APROBADO", "RECHAZADO"
     */
    List<AccountRequest> findByEstado(String estado);
}