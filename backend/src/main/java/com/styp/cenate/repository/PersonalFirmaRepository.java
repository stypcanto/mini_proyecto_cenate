// ============================================================================
// 🧩 PersonalFirmaRepository.java – Repositorio JPA (CENATE 2025)
// ----------------------------------------------------------------------------
// Gestiona las firmas digitales asociadas al personal CNT.
// Basado en la entidad PersonalFirma y su clave compuesta PersonalFirmaId.
// ============================================================================

package com.styp.cenate.repository;

import com.styp.cenate.model.PersonalFirma;
import com.styp.cenate.model.id.PersonalFirmaId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface PersonalFirmaRepository extends JpaRepository<PersonalFirma, PersonalFirmaId> {

    // =========================================================================
    // 🔹 CONSULTAS CRUD BÁSICAS
    // =========================================================================

    /** 🔍 Obtiene todas las firmas asociadas a un personal CNT. */
    List<PersonalFirma> findByPersonal_IdPers(Long idPers);

    /** 🔍 Busca si un personal tiene una firma digital específica. */
    Optional<PersonalFirma> findByPersonal_IdPersAndFirmaDigital_IdFirmDig(Long idPers, Long idFirmDig);

    /** 🗑️ Elimina todas las firmas digitales asociadas a un personal CNT. */
    @Transactional
    @Modifying
    void deleteByPersonal_IdPers(Long idPers);

    /** 📊 Cuenta cuántas firmas digitales tiene un personal CNT. */
    long countByPersonal_IdPers(Long idPers);

    // =========================================================================
    // 🔹 CONSULTAS PERSONALIZADAS JPQL
    // =========================================================================

    /**
     * 🚀 Carga todas las firmas de un personal junto con los datos completos de la firma digital.
     */
    @Query("""
        SELECT pf
        FROM PersonalFirma pf
        JOIN FETCH pf.firmaDigital f
        WHERE pf.personal.idPers = :idPers
    """)
    List<PersonalFirma> findAllWithFirmaByPersonal(@Param("idPers") Long idPers);

    /**
     * 🎯 Retorna solo las series (serieFirmDig) de las firmas digitales asociadas al personal CNT.
     */
    @Query("""
        SELECT f.serieFirmDig
        FROM PersonalFirma pf
        JOIN pf.firmaDigital f
        WHERE pf.personal.idPers = :idPers
    """)
    List<String> findFirmasByPersonalId(@Param("idPers") Long idPers);
}