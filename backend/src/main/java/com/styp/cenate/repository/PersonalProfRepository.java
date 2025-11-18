// ============================================================================
// 🧩 PersonalProfRepository.java – Repositorio JPA (CENATE 2025)
// ----------------------------------------------------------------------------
// Gestiona la relación entre el personal CNT y sus profesiones.
// Basado en la entidad PersonalProf y su clave compuesta PersonalProfId.
// ============================================================================

package com.styp.cenate.repository;

import com.styp.cenate.model.PersonalProf;
import com.styp.cenate.model.id.PersonalProfId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface PersonalProfRepository extends JpaRepository<PersonalProf, PersonalProfId> {

    // =========================================================================
    // 🔹 CONSULTAS CRUD BÁSICAS
    // =========================================================================

    /** 🔍 Obtiene todas las profesiones asociadas a un personal CNT. */
    List<PersonalProf> findByPersonal_IdPers(Long idPers);

    /** 🔍 Verifica si un personal ya tiene asignada una profesión específica. */
    Optional<PersonalProf> findByPersonal_IdPersAndProfesion_IdProf(Long idPers, Long idProf);

    /** 🗑️ Elimina todas las profesiones de un personal CNT. */
    @Transactional
    @Modifying
    void deleteByPersonal_IdPers(Long idPers);

    /** 📊 Cuenta cuántas profesiones tiene un personal CNT. */
    long countByPersonal_IdPers(Long idPers);

    // =========================================================================
    // 🔹 CONSULTAS PERSONALIZADAS JPQL
    // =========================================================================

    /**
     * 🚀 Carga profesiones junto con sus datos completos (profesión y especialidad)
     * evitando LazyInitializationException.
     */
//    @Query("""
//        SELECT pp
//        FROM PersonalProf pp
//        JOIN FETCH pp.profesion prof
//        LEFT JOIN FETCH pp.especialidad esp
//        WHERE pp.personal.idPers = :idPers
//    """)
//    List<PersonalProf> findAllWithProfesionByPersonal(@Param("idPers") Long idPers);

    /**
     * 🎯 Retorna solo los nombres (descProf) de las profesiones asociadas a un personal CNT.
     */
    @Query("""
        SELECT prof.descProf
        FROM PersonalProf pp
        JOIN pp.profesion prof
        WHERE pp.personal.idPers = :idPers
    """)
    List<String> findProfesionesByPersonalId(@Param("idPers") Long idPers);
}