package styp.com.cenate.service.frmtransfimg;

import styp.com.cenate.dto.FrmTransfImgRequest;
import styp.com.cenate.dto.FrmTransfImgResponse;
import java.util.List;

public interface FrmTransfImgService {
    List<FrmTransfImgResponse> listar();
    FrmTransfImgResponse obtenerPorId(Long id);
    FrmTransfImgResponse crear(FrmTransfImgRequest request);
    FrmTransfImgResponse actualizar(Long id, FrmTransfImgRequest request);
    void eliminar(Long id);
}