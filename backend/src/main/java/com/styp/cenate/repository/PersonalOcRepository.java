// ============================================================================
// 🧩 PersonalOcRepository.java – Repositorio JPA (CENATE 2025)
// ----------------------------------------------------------------------------
// Gestiona la relación entre el personal CNT y sus órdenes de contrato (OC).
// Basado en la entidad PersonalOc y su clave compuesta PersonalOcId.
// ============================================================================

package com.styp.cenate.repository;

import com.styp.cenate.model.PersonalOc;
import com.styp.cenate.model.id.PersonalOcId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface PersonalOcRepository extends JpaRepository<PersonalOc, PersonalOcId> {

    // =========================================================================
    // 🔹 CONSULTAS CRUD BÁSICAS
    // =========================================================================

    /** 🔍 Obtiene todas las órdenes de contrato asociadas a un personal CNT. */
    List<PersonalOc> findByPersonal_IdPers(Long idPers);

    /** 🔍 Busca una OC específica asignada a un personal CNT. */
    Optional<PersonalOc> findByPersonal_IdPersAndId_IdOc(Long idPers, Long idOc);

    /** 🗑️ Elimina todas las órdenes de contrato asociadas a un personal CNT. */
    @Transactional
    @Modifying
    void deleteByPersonal_IdPers(Long idPers);

    /** 📊 Cuenta cuántas órdenes de contrato tiene un personal CNT. */
    long countByPersonal_IdPers(Long idPers);

    // =========================================================================
    // 🔹 CONSULTAS PERSONALIZADAS JPQL
    // =========================================================================

    /**
     * 🚀 Carga todas las OCs con sus datos asociados al personal CNT.
     */
    @Query("""
        SELECT poc
        FROM PersonalOc poc
        WHERE poc.personal.idPers = :idPers
    """)
    List<PersonalOc> findAllWithOcByPersonal(@org.springframework.data.repository.query.Param("idPers") Long idPers);

    /**
     * 🎯 Retorna solo las descripciones (descOc) de las OCs asociadas al personal CNT.
     */
    @Query("""
        SELECT poc.descOc
        FROM PersonalOc poc
        WHERE poc.personal.idPers = :idPers
    """)
    List<String> findOCsByPersonalId(@org.springframework.data.repository.query.Param("idPers") Long idPers);
}