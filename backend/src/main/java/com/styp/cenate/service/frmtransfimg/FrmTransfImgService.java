package com.styp.cenate.service.frmtransfimg;

import com.styp.cenate.dto.FrmTransfImgRequest;
import com.styp.cenate.dto.FrmTransfImgResponse;
import java.util.List;

public interface FrmTransfImgService {
    List<FrmTransfImgResponse> listar();
    FrmTransfImgResponse obtenerPorId(Long id);
    FrmTransfImgResponse crear(FrmTransfImgRequest request);
    FrmTransfImgResponse actualizar(Long id, FrmTransfImgRequest request);
    void eliminar(Long id);
}