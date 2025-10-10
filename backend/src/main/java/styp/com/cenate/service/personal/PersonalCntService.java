package styp.com.cenate.service.personal;

import org.springframework.web.multipart.MultipartFile;
import styp.com.cenate.dto.PersonalRequest;
import styp.com.cenate.dto.PersonalResponse;

import java.io.IOException;
import java.util.List;

/**
 * Servicio para gestión de Personal CNT (pertenece a CENATE)
 */
public interface PersonalCntService {
    
    /**
     * Obtiene todo el personal CNT
     */
    List<PersonalResponse> getAllPersonalCnt();
    
    /**
     * Obtiene personal CNT por ID
     */
    PersonalResponse getPersonalCntById(Long id);
    
    /**
     * Crea un nuevo personal CNT
     */
    PersonalResponse createPersonalCnt(PersonalRequest request);
    
    /**
     * Actualiza un personal CNT existente
     */
    PersonalResponse updatePersonalCnt(Long id, PersonalRequest request);
    
    /**
     * Elimina un personal CNT
     */
    void deletePersonalCnt(Long id);
    
    /**
     * Busca personal CNT por nombre, apellido paterno o materno
     */
    List<PersonalResponse> searchPersonalCnt(String searchTerm);
    
    /**
     * Obtiene personal CNT por área
     */
    List<PersonalResponse> getPersonalCntByArea(Long idArea);
    
    /**
     * Obtiene personal CNT por régimen laboral
     */
    List<PersonalResponse> getPersonalCntByRegimenLaboral(Long idRegimenLaboral);
    
    /**
     * Obtiene personal CNT por usuario
     */
    PersonalResponse getPersonalCntByUsuario(Long idUsuario);
    
    /**
     * Sube la foto del personal CNT
     */
    PersonalResponse uploadFoto(Long id, MultipartFile file) throws IOException;
    
    /**
     * Elimina la foto del personal CNT
     */
    void deleteFoto(Long id) throws IOException;
    
    /**
     * Obtiene personal CNT activo
     */
    List<PersonalResponse> getPersonalCntActivo();
    
    /**
     * Obtiene personal CNT inactivo
     */
    List<PersonalResponse> getPersonalCntInactivo();
}
