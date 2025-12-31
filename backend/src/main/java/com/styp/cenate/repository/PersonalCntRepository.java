package com.styp.cenate.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import com.styp.cenate.model.PersonalCnt;

import java.util.List;
import java.util.Optional;

/**
 * 📚 Repositorio JPA para gestionar el personal CNT.
 *
 * Proporciona operaciones CRUD y consultas personalizadas para búsqueda,
 * filtrado y relaciones con usuarios, áreas y regímenes laborales.
 */
@Repository
public interface PersonalCntRepository extends JpaRepository<PersonalCnt, Long> {

	/**
	 * Verifica si existe un registro de personal CNT con el número de documento
	 * especificado.
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
	 * @param nomPers      nombre
	 * @param apePaterPers apellido paterno
	 * @param apeMaterPers apellido materno
	 * @return lista de coincidencias
	 */
	List<PersonalCnt> findByNomPersContainingIgnoreCaseOrApePaterPersContainingIgnoreCaseOrApeMaterPersContainingIgnoreCase(
			String nomPers, String apePaterPers, String apeMaterPers);

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

	/**
	 * Obtiene el registro de personal CNT asociado a un usuario específico (por
	 * objeto Usuario).
	 *
	 * @param usuario objeto Usuario
	 * @return Optional con el registro si existe
	 */
	Optional<PersonalCnt> findByUsuario(com.styp.cenate.model.Usuario usuario);

	// Logica para recuperacion de contraseña
	Optional<PersonalCnt> findByEmailCorpPers(String correo);

	boolean existsByEmailCorpPers(String emailCorpPers);

	// Búsqueda por correo personal (para recuperación de contraseña)
	Optional<PersonalCnt> findByEmailPers(String emailPers);

	boolean existsByEmailPers(String emailPers);

	/**
	 * Obtiene todo el personal con las relaciones necesarias cargadas (optimizado para getAllPersonal).
	 * Evita queries N+1 al cargar todas las relaciones en una sola query.
	 */
	@EntityGraph(attributePaths = {
			"usuario", "usuario.roles", "tipoDocumento", "regimenLaboral", 
			"area", "ipress", "profesiones", "profesiones.profesion",
			"profesiones.servicioEssi", // ✅ Incluir especialidad/servicio ESSI
			"tipos", "tipos.tipoPersonal" // ✅ Incluir tipos de profesional
	})
	@Query("SELECT p FROM PersonalCnt p")
	List<PersonalCnt> findAllWithRelations();

	/**
	 * Obtiene el personal con relaciones cargadas y paginación (optimizado).
	 * Evita queries N+1 y permite paginación eficiente.
	 */
	@EntityGraph(attributePaths = {
			"usuario", "usuario.roles", "tipoDocumento", "regimenLaboral",
			"area", "ipress", "profesiones", "profesiones.profesion",
			"profesiones.servicioEssi", // ✅ Incluir especialidad/servicio ESSI
			"tipos", "tipos.tipoPersonal" // ✅ Incluir tipos de profesional
	})
	@Query("SELECT p FROM PersonalCnt p")
	Page<PersonalCnt> findAllWithRelations(Pageable pageable);

	/**
	 * Obtiene todo el personal asistencial de CENATE (CAS y 728) con servicioEssi y profesiones cargados.
	 *
	 * Optimizado para el módulo de Firma Digital:
	 * - Filtra personal activo (stat_pers = 'A')
	 * - Solo de CENATE (id_ipress = 2)
	 * - Solo regímenes CAS y 728
	 * - LEFT JOIN FETCH para cargar servicioEssi, profesiones y relaciones en una sola query
	 *
	 * @return Lista de personal CENATE con servicioEssi y profesiones cargados
	 */
	@Query("SELECT DISTINCT p FROM PersonalCnt p " +
	       "LEFT JOIN FETCH p.servicioEssi " +
	       "LEFT JOIN FETCH p.regimenLaboral " +
	       "LEFT JOIN FETCH p.ipress " +
	       "LEFT JOIN FETCH p.profesiones pp " +
	       "LEFT JOIN FETCH pp.profesion " +
	       "WHERE p.statPers = 'A' " +
	       "AND p.ipress.idIpress = 2 " +
	       "AND (UPPER(p.regimenLaboral.descRegLab) LIKE '%CAS%' OR UPPER(p.regimenLaboral.descRegLab) LIKE '%728%')")
	List<PersonalCnt> findAllCENATEPersonalWithServicio();

}