package com.styp.cenate.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import com.styp.cenate.model.PersonalProf;
import com.styp.cenate.model.id.PersonalProfId;

import java.util.List;
import java.util.Optional;

/**
 * 📚 Repositorio JPA para la tabla dim_personal_prof.
 * Administra la relación entre el personal CNT y sus profesiones.
 */
@Repository
public interface PersonalProfRepository extends JpaRepository<PersonalProf, PersonalProfId> {

    /** 🔍 Obtiene todas las profesiones asociadas a un personal CNT. */
    List<PersonalProf> findByPersonal_IdPers(Long idPers);

    /** 🔍 Verifica si un personal ya tiene asignada una profesión específica. */
    Optional<PersonalProf> findByPersonal_IdPersAndProfesion_IdProf(Long idPers, Long idProf);

    /** 🗑️ Elimina todas las profesiones de un personal CNT. */
    @Transactional
    @Modifying
    void deleteByPersonal_IdPers(Long idPers);

    /** 📊 Cuenta cuántas profesiones tiene un personal. */
    long countByPersonal_IdPers(Long idPers);

    /** 🚀 Carga profesiones con sus datos completos, evitando LazyInitializationException. */
    @Query("""
        SELECT pp
        FROM PersonalProf pp
        JOIN FETCH pp.profesion prof
        WHERE pp.personal.idPers = :idPers
    """)
    List<PersonalProf> findAllWithProfesionByPersonal(Long idPers);

    /** 🎯 Retorna solo los nombres (desc_prof) de las profesiones asociadas a un personal CNT. */
    @Query("""
        SELECT prof.descProf
        FROM PersonalProf pp
        JOIN pp.profesion prof
        WHERE pp.personal.idPers = :idPers
    """)
    List<String> findProfesionesByPersonalId(Long idPers);
}