package com.styp.cenate.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.styp.cenate.model.FrmTransfImg;
import com.styp.cenate.model.Ipress;
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