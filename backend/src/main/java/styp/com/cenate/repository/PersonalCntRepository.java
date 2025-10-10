package styp.com.cenate.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import styp.com.cenate.model.PersonalCnt;

import java.util.List;
import java.util.Optional;

@Repository
public interface PersonalCntRepository extends JpaRepository<PersonalCnt, Integer> {
    
    /**
     * Buscar personal por estado
     */
    List<PersonalCnt> findByStatPers(String status);
    
    /**
     * Buscar personal por número de documento
     */
    Optional<PersonalCnt> findByNumDocPers(String numDoc);
    
    /**
     * Verificar si existe personal con ese número de documento
     */
    boolean existsByNumDocPers(String numDoc);
    
    /**
     * Buscar personal por área
     */
    List<PersonalCnt> findByAreaIdArea(Integer idArea);
    
    /**
     * Buscar personal por régimen laboral
     */
    List<PersonalCnt> findByRegimenLaboralIdRegLab(Integer idRegLab);
    
    /**
     * Buscar personal por nombre completo (búsqueda parcial en cualquier campo de nombre)
     */
    List<PersonalCnt> findByNomPersContainingIgnoreCaseOrApePaterPersContainingIgnoreCaseOrApeMaterPersContainingIgnoreCase(
            String nombre, String apellidoPaterno, String apellidoMaterno);
    
    /**
     * Buscar personal por email
     */
    Optional<PersonalCnt> findByEmailPers(String email);
    
    /**
     * Buscar personal por email corporativo
     */
    Optional<PersonalCnt> findByEmailCorpPers(String emailCorp);
}
