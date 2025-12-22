package com.styp.cenate.service.personal;

import com.styp.cenate.dto.PersonalRequest;
import com.styp.cenate.dto.PersonalResponse;

import java.util.List;

/**
 * 🧩 Servicio para la gestión del Personal Externo del sistema CENATE. Este
 * personal pertenece a instituciones aliadas o externas al CENATE.
 */
public interface PersonalExternoService {

	/** 🔹 Obtiene todos los registros de personal externo */
	List<PersonalResponse> getAllPersonalExterno();

	/** 🔹 Obtiene un registro de personal externo por su ID */
	PersonalResponse getPersonalExternoById(Long id);

	/** 🔹 Crea un nuevo registro de personal externo */
	PersonalResponse createPersonalExterno(PersonalRequest request);

	/** 🔹 Actualiza un registro existente de personal externo */
	PersonalResponse updatePersonalExterno(Long id, PersonalRequest request);

	/** 🔹 Elimina un registro de personal externo */
	void deletePersonalExterno(Long id);

	/**
	 * 🔹 Busca personal externo por nombre o apellidos (búsqueda parcial,
	 * case-insensitive)
	 */
	List<PersonalResponse> searchPersonalExterno(String searchTerm);

	/** 🔹 Obtiene el personal externo vinculado a una IPRESS específica */
	List<PersonalResponse> getPersonalExternoByIpress(Long idIpress);

	/** 🔹 Obtiene el personal externo asociado a un usuario del sistema */
	PersonalResponse getPersonalExternoByUsuario(Long idUsuario);

	/** 🔹 Obtiene todo el personal externo activo */
	List<PersonalResponse> getPersonalExternoActivo();

	/** 🔹 Obtiene todo el personal externo inactivo */
	List<PersonalResponse> getPersonalExternoInactivo();

	Long getUsuarioXCorreo(String correo);

	boolean existsByEmailCorpExt(String emailCorpPers);

	// Búsqueda por correo personal (recuperación de contraseña)
	boolean existsByEmailPersExt(String emailPersExt);
	Long getUsuarioXCorreoPersonal(String correo);
	String getCorreoPersonalDeUsuario(Long idUsuario);

}