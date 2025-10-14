package styp.com.cenate.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import styp.com.cenate.model.PersonalOc;
import styp.com.cenate.model.id.PersonalOcId;

import java.util.List;
import java.util.Optional;

/**
 * 📚 Repositorio JPA para la tabla dim_personal_oc.
 * Administra la relación entre el personal CNT y sus órdenes de contrato (OC).
 */
@Repository
public interface PersonalOcRepository extends JpaRepository<PersonalOc, PersonalOcId> {

    /** 🔍 Obtiene todas las órdenes de contrato de un personal CNT. */
    List<PersonalOc> findByPersonal_IdPers(Long idPers);

    /** 🔍 Verifica si un personal tiene una OC específica asignada. */
    Optional<PersonalOc> findByPersonal_IdPersAndId_IdOc(Long idPers, Long idOc);

    /** 🗑️ Elimina todas las órdenes de contrato asociadas a un personal CNT. */
    @Transactional
    @Modifying
    void deleteByPersonal_IdPers(Long idPers);

    /** 📊 Cuenta cuántas órdenes de contrato tiene un personal CNT. */
    long countByPersonal_IdPers(Long idPers);

    /**
     * 🚀 Carga las OCs con todos sus datos asociados al personal CNT.
     * (No hay entidad “oc”, se accede directamente a los campos de PersonalOc)
     */
    @Query("""
        SELECT poc
        FROM PersonalOc poc
        WHERE poc.personal.idPers = :idPers
    """)
    List<PersonalOc> findAllWithOcByPersonal(Long idPers);

    /**
     * 🎯 Retorna solo las descripciones (desc_oc) de las OCs asociadas al personal CNT.
     */
    @Query("""
        SELECT poc.descOc
        FROM PersonalOc poc
        WHERE poc.personal.idPers = :idPers
    """)
    List<String> findOCsByPersonalId(Long idPers);
}