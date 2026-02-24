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
	 * Fase 1: Obtiene personal filtrado con paginación real en BD.
	 * Usa @EntityGraph con SOLO @ManyToOne (sin colecciones) para evitar paginación en memoria.
	 * Los filtros son opcionales: si el parámetro es NULL, la condición no aplica.
	 */
	@EntityGraph(attributePaths = {
			"usuario", "tipoDocumento", "regimenLaboral", "area", "ipress", "servicioEssi"
	})
	@Query(value =
			"SELECT DISTINCT p FROM PersonalCnt p " +
			"LEFT JOIN p.usuario u " +
			"LEFT JOIN u.roles r " +
			"LEFT JOIN p.area a " +
			"LEFT JOIN p.ipress ip " +
			"LEFT JOIN ip.red rd " +
			"LEFT JOIN p.regimenLaboral rl " +
			"LEFT JOIN p.servicioEssi se " +
			"LEFT JOIN p.profesiones ppRef " +
			"LEFT JOIN ppRef.profesion pf " +
			"WHERE " +
			"  (:busqueda IS NULL OR (" +
			"    LOWER(CONCAT(COALESCE(p.nomPers,''), ' ', COALESCE(p.apePaterPers,''), ' ', COALESCE(p.apeMaterPers,''))) LIKE LOWER(CONCAT('%', :busqueda, '%')) " +
			"    OR LOWER(COALESCE(p.numDocPers,'')) LIKE LOWER(CONCAT('%', :busqueda, '%')))) " +
			"  AND (:rol IS NULL OR LOWER(r.descRol) = LOWER(:rol)) " +
			"  AND (:statPers IS NULL OR p.statPers = :statPers) " +
			"  AND (:descArea IS NULL OR LOWER(COALESCE(a.descArea,'')) LIKE LOWER(CONCAT('%', :descArea, '%'))) " +
			"  AND (:descIpress IS NULL OR LOWER(COALESCE(ip.descIpress,'')) LIKE LOWER(CONCAT('%', :descIpress, '%'))) " +
			"  AND (:descRed IS NULL OR LOWER(COALESCE(rd.descripcion,'')) = LOWER(:descRed)) " +
			"  AND (:descRegimen IS NULL OR LOWER(COALESCE(rl.descRegLab,'')) LIKE LOWER(CONCAT('%', :descRegimen, '%'))) " +
			"  AND (:descProfesion IS NULL OR LOWER(COALESCE(pf.descProf,'')) LIKE LOWER(CONCAT('%', :descProfesion, '%'))) " +
			"  AND (:descEspecialidad IS NULL OR LOWER(COALESCE(se.descServicio,'')) LIKE LOWER(CONCAT('%', :descEspecialidad, '%'))) " +
			"  AND (:mesNacimiento IS NULL OR EXTRACT(MONTH FROM p.fechNaciPers) = :mesNacimiento) " +
			"  AND (:createdAtFrom IS NULL OR p.createdAt >= :createdAtFrom) " +
			"  AND (:createdAtTo IS NULL OR p.createdAt <= :createdAtTo)",
			countQuery =
			"SELECT COUNT(DISTINCT p) FROM PersonalCnt p " +
			"LEFT JOIN p.usuario u " +
			"LEFT JOIN u.roles r " +
			"LEFT JOIN p.area a " +
			"LEFT JOIN p.ipress ip " +
			"LEFT JOIN ip.red rd " +
			"LEFT JOIN p.regimenLaboral rl " +
			"LEFT JOIN p.servicioEssi se " +
			"LEFT JOIN p.profesiones ppRef " +
			"LEFT JOIN ppRef.profesion pf " +
			"WHERE " +
			"  (:busqueda IS NULL OR (" +
			"    LOWER(CONCAT(COALESCE(p.nomPers,''), ' ', COALESCE(p.apePaterPers,''), ' ', COALESCE(p.apeMaterPers,''))) LIKE LOWER(CONCAT('%', :busqueda, '%')) " +
			"    OR LOWER(COALESCE(p.numDocPers,'')) LIKE LOWER(CONCAT('%', :busqueda, '%')))) " +
			"  AND (:rol IS NULL OR LOWER(r.descRol) = LOWER(:rol)) " +
			"  AND (:statPers IS NULL OR p.statPers = :statPers) " +
			"  AND (:descArea IS NULL OR LOWER(COALESCE(a.descArea,'')) LIKE LOWER(CONCAT('%', :descArea, '%'))) " +
			"  AND (:descIpress IS NULL OR LOWER(COALESCE(ip.descIpress,'')) LIKE LOWER(CONCAT('%', :descIpress, '%'))) " +
			"  AND (:descRed IS NULL OR LOWER(COALESCE(rd.descripcion,'')) = LOWER(:descRed)) " +
			"  AND (:descRegimen IS NULL OR LOWER(COALESCE(rl.descRegLab,'')) LIKE LOWER(CONCAT('%', :descRegimen, '%'))) " +
			"  AND (:descProfesion IS NULL OR LOWER(COALESCE(pf.descProf,'')) LIKE LOWER(CONCAT('%', :descProfesion, '%'))) " +
			"  AND (:descEspecialidad IS NULL OR LOWER(COALESCE(se.descServicio,'')) LIKE LOWER(CONCAT('%', :descEspecialidad, '%'))) " +
			"  AND (:mesNacimiento IS NULL OR EXTRACT(MONTH FROM p.fechNaciPers) = :mesNacimiento) " +
			"  AND (:createdAtFrom IS NULL OR p.createdAt >= :createdAtFrom) " +
			"  AND (:createdAtTo IS NULL OR p.createdAt <= :createdAtTo)")
	Page<PersonalCnt> findAllWithFilters(
			@org.springframework.data.repository.query.Param("busqueda") String busqueda,
			@org.springframework.data.repository.query.Param("rol") String rol,
			@org.springframework.data.repository.query.Param("statPers") String statPers,
			@org.springframework.data.repository.query.Param("descArea") String descArea,
			@org.springframework.data.repository.query.Param("descIpress") String descIpress,
			@org.springframework.data.repository.query.Param("descRed") String descRed,
			@org.springframework.data.repository.query.Param("descRegimen") String descRegimen,
			@org.springframework.data.repository.query.Param("descProfesion") String descProfesion,
			@org.springframework.data.repository.query.Param("descEspecialidad") String descEspecialidad,
			@org.springframework.data.repository.query.Param("mesNacimiento") Integer mesNacimiento,
			@org.springframework.data.repository.query.Param("createdAtFrom") java.time.OffsetDateTime createdAtFrom,
			@org.springframework.data.repository.query.Param("createdAtTo") java.time.OffsetDateTime createdAtTo,
			org.springframework.data.domain.Pageable pageable);

	/**
	 * Fase 2: Carga entidades completas (con colecciones) para IDs específicos.
	 * No usa paginación, por lo que @EntityGraph con colecciones no causa problemas.
	 */
	@EntityGraph(attributePaths = {
			"usuario", "usuario.roles", "tipoDocumento", "regimenLaboral",
			"area", "ipress", "profesiones", "profesiones.profesion",
			"profesiones.servicioEssi", "tipos", "tipos.tipoPersonal"
	})
	@Query("SELECT p FROM PersonalCnt p WHERE p.idPers IN :ids")
	List<PersonalCnt> findByIdsWithRelations(
			@org.springframework.data.repository.query.Param("ids") List<Long> ids);

	/**
	 * Obtiene todos los médicos asociados a un servicio (especialidad) específico.
	 *
	 * @param idServicio identificador del servicio ESSI
	 * @return lista de personal CNT asociado al servicio
	 */
	List<PersonalCnt> findByServicioEssi_IdServicio(Long idServicio);

	/**
	 * Obtiene todos los médicos asistenciales activos (sin especialidad específica)
	 * Utilizado para TeleECG que no tiene especialidad asignada
	 *
	 * Filtra por:
	 * - Estado activo (stat_pers = 'A')
	 * - Tipo de profesional = 'ASISTENCIAL'
	 *
	 * @return lista de personal ASISTENCIAL activo
	 */
	@Query("SELECT DISTINCT p FROM PersonalCnt p " +
	       "LEFT JOIN FETCH p.tipos pt " +
	       "LEFT JOIN FETCH pt.tipoPersonal dtp " +
	       "LEFT JOIN FETCH p.servicioEssi " +
	       "LEFT JOIN FETCH p.area " +
	       "WHERE p.statPers = 'A' " +
	       "AND EXISTS (SELECT 1 FROM p.tipos pt2 " +
	       "            LEFT JOIN pt2.tipoPersonal dtp2 " +
	       "            WHERE dtp2.descTipPers = 'ASISTENCIAL' " +
	       "            AND dtp2.statTipPers = 'A')")
	List<PersonalCnt> findAsistencialesActivos();

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

	/**
	 * Busca personal activo cuya profesión (per_pers) contiene el texto dado.
	 * Utilizado como fallback cuando la búsqueda por id_servicio no retorna resultados.
	 * Ejemplo: buscarPorProfesion("NUTRICION") encuentra registros con per_pers = 'NUTRICIONISTA'
	 *
	 * @param profesion texto a buscar (case-insensitive, búsqueda contains)
	 * @return lista de personal activo cuya profesión contiene el texto
	 */
	@Query("SELECT p FROM PersonalCnt p " +
	       "LEFT JOIN FETCH p.servicioEssi " +
	       "LEFT JOIN FETCH p.area " +
	       "WHERE p.statPers = 'A' " +
	       "AND UPPER(COALESCE(p.perPers, '')) LIKE UPPER(CONCAT('%', :profesion, '%'))")
	List<PersonalCnt> findActivosByPerPersContaining(@org.springframework.data.repository.query.Param("profesion") String profesion);

}