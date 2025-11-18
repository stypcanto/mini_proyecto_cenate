// ============================================================================
// 🧩 PersonalTipoRepository.java – Repositorio JPA (CENATE 2025)
// ----------------------------------------------------------------------------
// Gestiona la relación entre el personal CNT y sus tipos (interno, externo,
// contratado, etc.), basada en la entidad PersonalTipo y su clave compuesta
// PersonalTipoId.
// ============================================================================

package com.styp.cenate.repository;

import com.styp.cenate.model.PersonalTipo;
import com.styp.cenate.model.id.PersonalTipoId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface PersonalTipoRepository extends JpaRepository<PersonalTipo, PersonalTipoId> {

    // =========================================================================
    // 🔹 CONSULTAS CRUD BÁSICAS
    // =========================================================================

    /** 🔍 Obtiene todos los tipos asociados a un personal CNT. */
    List<PersonalTipo> findByPersonal_IdPers(Long idPers);

    /** 🔍 Busca si un personal tiene un tipo específico asignado. */
    Optional<PersonalTipo> findByPersonal_IdPersAndTipoPersonal_IdTipPers(Long idPers, Long idTipPers);

    /** 🗑️ Elimina todos los tipos de personal asociados a un ID. */
    @Transactional
    @Modifying
    void deleteByPersonal_IdPers(Long idPers);

    /** 📊 Cuenta cuántos tipos de personal tiene un ID. */
    long countByPersonal_IdPers(Long idPers);

    // =========================================================================
    // 🔹 CONSULTAS PERSONALIZADAS JPQL
    // =========================================================================

    /**
     * 🚀 Carga los tipos de personal junto con su descripción completa.
     */
    @Query("""
        SELECT pt
        FROM PersonalTipo pt
        JOIN FETCH pt.tipoPersonal tp
        WHERE pt.personal.idPers = :idPers
    """)
    List<PersonalTipo> findAllWithTipoByPersonal(@Param("idPers") Long idPers);

    /**
     * 🎯 Retorna solo las descripciones (descTipPers) de los tipos asociados al personal CNT.
     */
    @Query("""
        SELECT tp.descTipPers
        FROM PersonalTipo pt
        JOIN pt.tipoPersonal tp
        WHERE pt.personal.idPers = :idPers
    """)
    List<String> findTiposByPersonalId(@Param("idPers") Long idPers);
}