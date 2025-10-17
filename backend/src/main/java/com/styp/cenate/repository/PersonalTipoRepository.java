package com.styp.cenate.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import com.styp.cenate.model.PersonalTipo;
import com.styp.cenate.model.id.PersonalTipoId;

import java.util.List;
import java.util.Optional;

/**
 * 📚 Repositorio JPA para la tabla dim_personal_tipo.
 * Administra la relación entre personal CNT y su tipo (interno, externo, contratado, etc.).
 */
@Repository
public interface PersonalTipoRepository extends JpaRepository<PersonalTipo, PersonalTipoId> {

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

    /** 🚀 Carga los tipos de personal junto con su descripción completa. */
    @Query("""
        SELECT pt
        FROM PersonalTipo pt
        JOIN FETCH pt.tipoPersonal tp
        WHERE pt.personal.idPers = :idPers
    """)
    List<PersonalTipo> findAllWithTipoByPersonal(Long idPers);

    /** 🎯 Retorna solo las descripciones de tipos de personal asociadas a un personal CNT. */
    @Query("""
        SELECT tp.descTipPers
        FROM PersonalTipo pt
        JOIN pt.tipoPersonal tp
        WHERE pt.personal.idPers = :idPers
    """)
    List<String> findTiposByPersonalId(Long idPers);
}