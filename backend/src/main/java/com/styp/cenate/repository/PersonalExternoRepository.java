package com.styp.cenate.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.styp.cenate.model.PersonalExterno;

import java.util.List;
import java.util.Optional;

/**
 * 🧩 Repositorio JPA para gestionar el personal externo del sistema CENATE.
 * Mapea la entidad {@link PersonalExterno}.
 */
@Repository
public interface PersonalExternoRepository extends JpaRepository<PersonalExterno, Long> {

	/**
	 * 🔍 Buscar personal externo por número de documento.
	 */
	Optional<PersonalExterno> findByNumDocExt(String numDocExt);

	/**
	 * ✅ Verificar si ya existe un registro con ese número de documento.
	 */
	boolean existsByNumDocExt(String numDocExt);

	/**
	 * 🔍 Buscar por email personal.
	 */
	Optional<PersonalExterno> findByEmailPersExt(String emailPersExt);

	/**
	 * 🏢 Buscar por nombre parcial de institución (ej. "Universidad", "Clínica").
	 */
	List<PersonalExterno> findByInstExtContainingIgnoreCase(String instExt);

	/**
	 * 🧑 Buscar coincidencias parciales por nombres o apellidos. Ideal para
	 * buscadores de personal externo (ej. “Pérez”, “Juan”).
	 */
	List<PersonalExterno> findByNomExtContainingIgnoreCaseOrApePaterExtContainingIgnoreCaseOrApeMaterExtContainingIgnoreCase(
			String nom, String apePat, String apeMat);

	/**
	 * 🏥 Buscar personal externo asociado a una IPRESS específica.
	 */
	List<PersonalExterno> findByIpress_IdIpress(Long idIpress);

	/**
	 * 👤 Buscar personal externo vinculado a un usuario del sistema.
	 */
	Optional<PersonalExterno> findByIdUser(Long idUser);

	// logica para recuperacion de contrasena
	Optional<PersonalExterno> findByEmailCorpExt(String correo);

	boolean existsByEmailCorpExt(String correo);

}