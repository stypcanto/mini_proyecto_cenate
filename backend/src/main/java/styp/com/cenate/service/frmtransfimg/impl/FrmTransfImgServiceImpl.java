package styp.com.cenate.service.frmtransfimg.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import styp.com.cenate.dto.FrmTransfImgRequest;
import styp.com.cenate.dto.FrmTransfImgResponse;
import styp.com.cenate.exception.ResourceNotFoundException;
import styp.com.cenate.model.*;
import styp.com.cenate.repository.*;
import styp.com.cenate.service.frmtransfimg.FrmTransfImgService;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class FrmTransfImgServiceImpl implements FrmTransfImgService {

    private final FrmTransfImgRepository repository;
    private final IpressRepository ipressRepo;
    private final RedRepository redRepo;
    private final ProcedimientoRepository procedRepo;
    private final TipoProcedimientoRepository tipoRepo;
    private final NivelAtencionRepository nivelRepo;
    private final AreaHospitalariaRepository areaRepo;

    @Override
    public List<FrmTransfImgResponse> listar() {
        return repository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public FrmTransfImgResponse obtenerPorId(Long id) {
        FrmTransfImg entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Formulario no encontrado con ID: " + id));
        return toResponse(entity);
    }

    @Override
    public FrmTransfImgResponse crear(FrmTransfImgRequest request) {
        Ipress ipress = ipressRepo.findById(request.getIdIpress())
                .orElseThrow(() -> new ResourceNotFoundException("IPRESS no encontrada"));
        Red red = redRepo.findById(ipress.getIdRed())
                .orElseThrow(() -> new ResourceNotFoundException("Red no encontrada"));
        Procedimiento proc = procedRepo.findById(request.getIdProced())
                .orElseThrow(() -> new ResourceNotFoundException("Procedimiento no encontrado"));
        TipoProcedimiento tipo = tipoRepo.findById(request.getIdTipProced())
                .orElseThrow(() -> new ResourceNotFoundException("Tipo de procedimiento no encontrado"));
        NivelAtencion nivel = nivelRepo.findById(ipress.getIdNivAten())
                .orElseThrow(() -> new ResourceNotFoundException("Nivel de atención no encontrado"));
        AreaHospitalaria area = areaRepo.findById(request.getIdAreaHosp())
                .orElseThrow(() -> new ResourceNotFoundException("Área hospitalaria no encontrada"));

        FrmTransfImg nuevo = FrmTransfImg.builder()
                .idRed(red.getId())
                .descRed(red.getDescripcion())
                .idIpress(ipress.getIdIpress())
                .descIpress(ipress.getDescIpress())
                .idNivel(nivel.getId())
                .descNivelIpress(nivel.getDescripcion())
                .idAreaHosp(area.getId())
                .descAreaHosp(area.getDescripcion())
                .idTipProced(tipo.getId())
                .descTipProced(tipo.getDescripcion())
                .idProced(proc.getId())
                .codProced(proc.getCodigo())
                .descProced(proc.getDescripcion())
                .estado("A")
                .requiereReferencia(request.isRequiereReferencia())
                .codRefe(request.getCodRefe())
                .descRefe(request.getDescRefe())
                .build();

        return toResponse(repository.save(nuevo));
    }

    @Override
    public FrmTransfImgResponse actualizar(Long id, FrmTransfImgRequest request) {
        FrmTransfImg existente = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Formulario no encontrado con ID: " + id));

        existente.setRequiereReferencia(request.isRequiereReferencia());
        existente.setCodRefe(request.getCodRefe());
        existente.setDescRefe(request.getDescRefe());
        existente.setEstado(request.getEstado());

        return toResponse(repository.save(existente));
    }

    @Override
    public void eliminar(Long id) {
        if (!repository.existsById(id))
            throw new ResourceNotFoundException("Formulario no encontrado con ID: " + id);
        repository.deleteById(id);
    }

    private FrmTransfImgResponse toResponse(FrmTransfImg f) {
        return FrmTransfImgResponse.builder()
                .id(f.getId())
                .descRed(f.getDescRed())
                .descIpress(f.getDescIpress())
                .descNivelIpress(f.getDescNivelIpress())
                .descAreaHosp(f.getDescAreaHosp())
                .descTipProced(f.getDescTipProced())
                .codProced(f.getCodProced())
                .descProced(f.getDescProced())
                .estado(f.getEstado())
                .requiereReferencia(f.isRequiereReferencia())
                .codRefe(f.getCodRefe())
                .descRefe(f.getDescRefe())
                .build();
    }
}