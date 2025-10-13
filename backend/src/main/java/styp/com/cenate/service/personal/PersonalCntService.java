package styp.com.cenate.service.personal;

import org.springframework.web.multipart.MultipartFile;
import styp.com.cenate.dto.PersonalRequest;
import styp.com.cenate.dto.PersonalResponse;

import java.io.IOException;
import java.util.List;

/**
 * Interfaz de servicio para gestión del personal CNT
 */
public interface PersonalCntService {

    List<PersonalResponse> getAllPersonalCnt();

    PersonalResponse getPersonalCntById(Long id);

    PersonalResponse createPersonalCnt(PersonalRequest request);

    PersonalResponse updatePersonalCnt(Long id, PersonalRequest request);

    void deletePersonalCnt(Long id);

    List<PersonalResponse> searchPersonalCnt(String searchTerm);

    List<PersonalResponse> getPersonalCntByArea(Long idArea);

    List<PersonalResponse> getPersonalCntByRegimenLaboral(Long idRegimenLaboral);

    PersonalResponse getPersonalCntByUsuario(Long idUsuario);

    PersonalResponse uploadFoto(Long id, MultipartFile file) throws IOException;

    // ✅ Corrigido: sin throws IOException, coincide con implementación
    void deleteFoto(Long id);

    List<PersonalResponse> getPersonalCntActivo();

    List<PersonalResponse> getPersonalCntInactivo();
}