package com.styp.cenate.service.frmtransfimg.impl;

import lombok.Data;
import lombok.extern.slf4j.Slf4j;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.styp.cenate.dto.FrmTransfImgRequest;
import com.styp.cenate.dto.FrmTransfImgResponse;
import com.styp.cenate.exception.ResourceNotFoundException;
import com.styp.cenate.model.*;
import com.styp.cenate.repository.*;
import com.styp.cenate.service.frmtransfimg.FrmTransfImgService;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
@Data
public class FrmTransfImgServiceImpl implements FrmTransfImgService {

        private final FrmTransfImgRepository repository;
        private final IpressRepository ipressRepo;
        private final RedRepository redRepo;
        private final ProcedimientoRepository procedRepo;
        // TipoProcedimiento eliminado - CPMS removido del sistema
        // private final TipoProcedimientoRepository tipoRepo;
        private final NivelAtencionRepository nivelRepo;
        private final AreaHospitalariaRepository areaRepo;

        // ============================================================
        @Override
        public List<FrmTransfImgResponse> listar() {
                log.info("Listando todos los formularios de transferencia de imágenes");
                return repository.findAll()
                                .stream()
                                .map(this::toResponse)
                                .collect(Collectors.toList());
        }

        // ============================================================
        @Override
        public FrmTransfImgResponse obtenerPorId(Long id) {
                FrmTransfImg entity = repository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Formulario no encontrado con ID: " + id));
                return toResponse(entity);
        }

        // ============================================================
        @Override
        public FrmTransfImgResponse crear(FrmTransfImgRequest request) {
                log.info("Creando nuevo formulario de transferencia de imágenes...");

                // 🔹 Validar entidades relacionadas
                Ipress ipress = ipressRepo.findById(request.getIdIpress())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "IPRESS no encontrada con ID: " + request.getIdIpress()));

                Red red = redRepo.findById(ipress.getIdRed())
                                .orElseThrow(() -> new ResourceNotFoundException("Red no encontrada para IPRESS"));

                Procedimiento proc = procedRepo.findById(request.getIdProced())
                                .orElseThrow(() -> new ResourceNotFoundException("Procedimiento no encontrado"));

                // TipoProcedimiento eliminado - CPMS removido del sistema
                // Usar valores por defecto o del request
                Long idTipProced = request.getIdTipProced() != null ? request.getIdTipProced() : 0L;
                String descTipProced = request.getIdTipProced() != null ? "N/A" : "No especificado";

                NivelAtencion nivel = nivelRepo.findById(ipress.getIdNivAten())
                                .orElseThrow(() -> new ResourceNotFoundException("Nivel de atención no encontrado"));

                AreaHospitalaria area = areaRepo.findById(request.getIdAreaHosp())
                                .orElseThrow(() -> new ResourceNotFoundException("Área hospitalaria no encontrada"));

                // 🔹 Crear nuevo registro con relaciones correctas
                FrmTransfImg nuevo = FrmTransfImg.builder()
                                .idRed(red.getId())
                                .descRed(red.getDescripcion())
                                .ipress(ipress) // ✅ relación ManyToOne con la entidad Ipress
                                .descIpress(ipress.getDescIpress())
                                .idNivel(nivel.getId())
                                .descNivelIpress(nivel.getDescripcion())
                                .idAreaHosp(area.getId())
                                .descAreaHosp(area.getDescripcion())
                                .idTipProced(idTipProced)
                                .descTipProced(descTipProced)
                                .idProced(proc.getIdProced())
                                .codProced(proc.getCodProced())
                                .descProced(proc.getDescProced())
                                .estado("A")
                                .requiereReferencia(request.isRequiereReferencia())
                                .codRefe(request.getCodRefe())
                                .descRefe(request.getDescRefe())
                                .build();

                FrmTransfImg guardado = repository.save(nuevo);
                return toResponse(guardado);
        }

        // ============================================================
        @Override
        public FrmTransfImgResponse actualizar(Long id, FrmTransfImgRequest request) {
                FrmTransfImg existente = repository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Formulario no encontrado con ID: " + id));

                existente.setRequiereReferencia(request.isRequiereReferencia());
                existente.setCodRefe(request.getCodRefe());
                existente.setDescRefe(request.getDescRefe());
                existente.setEstado(request.getEstado());

                FrmTransfImg actualizado = repository.save(existente);
                return toResponse(actualizado);
        }

        // ============================================================
        @Override
        public void eliminar(Long id) {
                if (!repository.existsById(id))
                        throw new ResourceNotFoundException("Formulario no encontrado con ID: " + id);

                repository.deleteById(id);
                log.info("Formulario eliminado con ID: {}", id);
        }

        // ============================================================
        @Transactional(readOnly = true)
        public List<FrmTransfImgResponse> obtenerPorIpress(Long idIpress) {
                log.info("Obteniendo formularios por ID de IPRESS: {}", idIpress);
                return repository.findByIpress_IdIpress(idIpress)
                                .stream()
                                .map(this::toResponse)
                                .collect(Collectors.toList());
        }

        // ============================================================
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
