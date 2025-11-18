package com.styp.cenate.service.personal;

import org.springframework.web.multipart.MultipartFile;
import com.styp.cenate.dto.PersonalRequest;
import com.styp.cenate.dto.PersonalResponse;

import java.util.List;

/**
 * 🧩 Interfaz de servicio para la gestión del personal CNT (interno). Define
 * las operaciones CRUD, búsqueda, filtrado y manejo de archivos.
 */
public interface PersonalCntService {

	// ==========================================================
	// 🔹 CRUD Básico
	// ==========================================================

	/** Obtiene el listado completo del personal CNT. */
	List<PersonalResponse> getAllPersonalCnt();

	/** Obtiene un personal CNT por su ID. */
	PersonalResponse getPersonalCntById(Long id);

	/** Crea un nuevo registro de personal CNT. */
	PersonalResponse createPersonalCnt(PersonalRequest request);

	/** Actualiza un registro de personal CNT existente. */
	PersonalResponse updatePersonalCnt(Long id, PersonalRequest request);

	/** Elimina completamente un personal CNT y sus relaciones asociadas. */
	void deletePersonalCnt(Long id);

	// ==========================================================
	// 🔹 Búsquedas y Filtros
	// ==========================================================

	/** Busca personal CNT por un término (nombre, documento, etc.). */
	List<PersonalResponse> searchPersonalCnt(String searchTerm);

	/** Obtiene el personal CNT asociado a un área específica. */
	List<PersonalResponse> getPersonalCntByArea(Long idArea);

	/** Obtiene el personal CNT filtrado por régimen laboral. */
	List<PersonalResponse> getPersonalCntByRegimenLaboral(Long idRegimenLaboral);

	/** Obtiene el personal CNT vinculado a un usuario del sistema. */
	PersonalResponse getPersonalCntByUsuario(Long idUsuario);

	/** Obtiene únicamente el personal CNT activo. */
	List<PersonalResponse> getPersonalCntActivo();

	/** Obtiene únicamente el personal CNT inactivo. */
	List<PersonalResponse> getPersonalCntInactivo();

	// ==========================================================
	// 🔹 Gestión de Foto
	// ==========================================================

	/**
	 * Sube y asocia una foto al personal CNT especificado.
	 * 
	 * @param id   ID del personal CNT
	 * @param file Archivo de imagen (JPG/PNG)
	 * @return DTO actualizado del personal con la nueva foto
	 */
	PersonalResponse uploadFoto(Long id, MultipartFile file);

	/**
	 * Elimina la foto asociada al personal CNT (si existe).
	 * 
	 * @param id ID del personal CNT
	 */
	void deleteFoto(Long id);

	boolean existsByEmailCorpPers(String emailCorpPers);
	Long getUsuarioXCorreo(String correo);
}
