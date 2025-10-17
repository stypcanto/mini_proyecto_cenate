package com.styp.cenate.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.styp.cenate.model.PersonalCnt;

import java.util.List;
import java.util.Optional;

/**
 * 📚 Repositorio JPA para gestionar el personal CNT.
 *
 * Proporciona operaciones CRUD y consultas personalizadas
 * para búsqueda, filtrado y relaciones con usuarios, áreas
 * y regímenes laborales.
 */
@Repository
public interface PersonalCntRepository extends JpaRepository<PersonalCnt, Long> {

    /**
     * Verifica si existe un registro de personal CNT con el número de documento especificado.
     *
     * @param numDocPers número de documento del personal
     * @return true si existe, false en caso contrario
     */
    boolean existsByNumDocPers(String numDocPers);

    /**
     * Obtiene el registro de personal CNT asociado a un usuario específico.
     *
     * @param idUser identificador del usuario en dim_usuarios
     * @return Optional con el registro si existe
     */
    Optional<PersonalCnt> findByUsuario_IdUser(Long idUser);

    /**
     * Busca personal CNT por coincidencia parcial en nombres o apellidos.
     *
     * @param nomPers       nombre
     * @param apePaterPers  apellido paterno
     * @param apeMaterPers  apellido materno
     * @return lista de coincidencias
     */
    List<PersonalCnt> findByNomPersContainingIgnoreCaseOrApePaterPersContainingIgnoreCaseOrApeMaterPersContainingIgnoreCase(
            String nomPers, String apePaterPers, String apeMaterPers
    );

    /**
     * Obtiene el personal CNT perteneciente a un área específica.
     *
     * @param idArea identificador del área
     * @return lista de personal CNT del área
     */
    List<PersonalCnt> findByArea_IdArea(Long idArea);

    /**
     * Obtiene el personal CNT asociado a un régimen laboral específico.
     *
     * @param idRegLab identificador del régimen laboral
     * @return lista de personal CNT
     */
    List<PersonalCnt> findByRegimenLaboral_IdRegLab(Long idRegLab);

    /**
     * Filtra el personal CNT por estado (Activo/Inactivo).
     *
     * @param statPers estado del personal (A = Activo, I = Inactivo)
     * @return lista filtrada por estado
     */
    List<PersonalCnt> findByStatPers(String statPers);
}