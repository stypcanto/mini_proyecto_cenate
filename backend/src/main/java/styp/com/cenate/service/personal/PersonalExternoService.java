package styp.com.cenate.service.personal;

import org.springframework.web.multipart.MultipartFile;
import styp.com.cenate.dto.PersonalRequest;
import styp.com.cenate.dto.PersonalResponse;

import java.io.IOException;
import java.util.List;

/**
 * Servicio para gestión de Personal Externo (no pertenece a CENATE)
 */
public interface PersonalExternoService {
    
    /**
     * Obtiene todo el personal externo
     */
    List<PersonalResponse> getAllPersonalExterno();
    
    /**
     * Obtiene personal externo por ID
     */
    PersonalResponse getPersonalExternoById(Long id);
    
    /**
     * Crea un nuevo personal externo
     */
    PersonalResponse createPersonalExterno(PersonalRequest request);
    
    /**
     * Actualiza un personal externo existente
     */
    PersonalResponse updatePersonalExterno(Long id, PersonalRequest request);
    
    /**
     * Elimina un personal externo
     */
    void deletePersonalExterno(Long id);
    
    /**
     * Busca personal externo por nombre, apellido paterno o materno
     */
    List<PersonalResponse> searchPersonalExterno(String searchTerm);
    
    /**
     * Obtiene personal externo por IPRESS
     */
    List<PersonalResponse> getPersonalExternoByIpress(Long idIpress);
    
    /**
     * Obtiene personal externo por usuario
     */
    PersonalResponse getPersonalExternoByUsuario(Long idUsuario);
}
