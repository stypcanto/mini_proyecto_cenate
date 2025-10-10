package styp.com.cenate.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import styp.com.cenate.model.Ipress;

import java.util.List;
import java.util.Optional;

@Repository
public interface IpressRepository extends JpaRepository<Ipress, Long> {  // ✅ Cambiado a Long
    
    /**
     * Buscar IPRESS por código
     */
    Optional<Ipress> findByCodIpress(String codIpress);
    
    /**
     * Buscar IPRESS activas
     */
    List<Ipress> findByStatIpress(String estado);
    
    /**
     * Buscar IPRESS por nombre (búsqueda parcial)
     */
    List<Ipress> findByDescIpressContainingIgnoreCase(String nombre);
    
    /**
     * Verificar si existe IPRESS con ese código
     */
    boolean existsByCodIpress(String codIpress);
}
