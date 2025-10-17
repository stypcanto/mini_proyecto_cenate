package com.styp.cenate.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import com.styp.cenate.model.PersonalFirma;
import com.styp.cenate.model.id.PersonalFirmaId;

import java.util.List;
import java.util.Optional;

/**
 * 📚 Repositorio JPA para la tabla dim_personal_firma.
 * Administra las firmas digitales asociadas al personal CNT.
 */
@Repository
public interface PersonalFirmaRepository extends JpaRepository<PersonalFirma, PersonalFirmaId> {

    /** 🔍 Obtiene todas las firmas asociadas a un personal CNT. */
    List<PersonalFirma> findByPersonal_IdPers(Long idPers);

    /** 🔍 Busca si un personal tiene una firma digital específica. */
    Optional<PersonalFirma> findByPersonal_IdPersAndFirmaDigital_IdFirmDig(Long idPers, Long idFirmDig);

    /** 🗑️ Elimina todas las firmas digitales asociadas a un personal. */
    @Transactional
    @Modifying
    void deleteByPersonal_IdPers(Long idPers);

    /** 📊 Cuenta cuántas firmas digitales tiene un personal. */
    long countByPersonal_IdPers(Long idPers);

    /** 🚀 Carga firmas con sus datos completos (firma digital incluida). */
    @Query("""
        SELECT pf
        FROM PersonalFirma pf
        JOIN FETCH pf.firmaDigital f
        WHERE pf.personal.idPers = :idPers
    """)
    List<PersonalFirma> findAllWithFirmaByPersonal(Long idPers);

    /** 🎯 Retorna solo las series de las firmas digitales asociadas. */
    @Query("""
        SELECT f.serieFirmDig
        FROM PersonalFirma pf
        JOIN pf.firmaDigital f
        WHERE pf.personal.idPers = :idPers
    """)
    List<String> findFirmasByPersonalId(Long idPers);
}