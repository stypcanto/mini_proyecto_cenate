package styp.com.cenate.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import styp.com.cenate.model.FrmTransfImg;
import styp.com.cenate.model.Ipress;
import java.util.List;

@Repository
public interface FrmTransfImgRepository extends JpaRepository<FrmTransfImg, Long> {

    List<FrmTransfImg> findByEstado(String estado);

    // 🔹 Usa la relación con la entidad Ipress
    List<FrmTransfImg> findByIpress(Ipress ipress);

    // 🔹 Alternativamente, si necesitas buscar por el id de la IPRESS:
    List<FrmTransfImg> findByIpress_IdIpress(Long idIpress);

    List<FrmTransfImg> findByRequiereReferenciaTrue();
}