package styp.com.cenate.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import styp.com.cenate.model.PersonalExterno;

import java.util.List;
import java.util.Optional;

@Repository
public interface PersonalExternoRepository extends JpaRepository<PersonalExterno, Long> {  // ✅ Cambiado a Long
    
    /**
     * Buscar personal externo por número de documento
     */
    Optional<PersonalExterno> findByNumDocExt(String numDocExt);
    
    /**
     * Verificar si existe personal externo con ese número de documento
     */
    boolean existsByNumDocExt(String numDocExt);
    
    /**
     * Buscar por email
     */
    Optional<PersonalExterno> findByEmailPersExt(String emailPersExt);
    
    /**
     * Buscar por institución (legacy)
     */
    List<PersonalExterno> findByInstExtContainingIgnoreCase(String institucion);
    
    /**
     * Buscar por nombre completo (búsqueda parcial)
     */
    List<PersonalExterno> findByNomExtContainingIgnoreCaseOrApePaterExtContainingIgnoreCaseOrApeMaterExtContainingIgnoreCase(
            String nombre, String apellidoPaterno, String apellidoMaterno);
}
