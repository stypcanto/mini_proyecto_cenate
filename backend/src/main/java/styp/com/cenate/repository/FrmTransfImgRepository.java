package styp.com.cenate.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import styp.com.cenate.model.FrmTransfImg;

import java.util.List;

@Repository
public interface FrmTransfImgRepository extends JpaRepository<FrmTransfImg, Long> {

    /**
     * Busca formularios por estado (A=Activo, I=Inactivo)
     */
    List<FrmTransfImg> findByEstado(String estado);

    /**
     * Busca formularios por id de IPRESS
     */
    List<FrmTransfImg> findByIpress_IdIpress(Long idIpress);

    /**
     * Busca formularios que requieren referencia
     */
    List<FrmTransfImg> findByRequiereReferenciaTrue();
}