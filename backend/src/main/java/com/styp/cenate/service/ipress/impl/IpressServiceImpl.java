package com.styp.cenate.service.ipress.impl;

import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.styp.cenate.dto.IpressRequest;
import com.styp.cenate.dto.IpressResponse;
import com.styp.cenate.dto.MacroregionResponse;
import com.styp.cenate.dto.RedResponse;
import com.styp.cenate.model.Ipress;
import com.styp.cenate.model.Macroregion;
import com.styp.cenate.model.ModalidadAtencion;
import com.styp.cenate.model.Red;
import com.styp.cenate.repository.IpressRepository;
import com.styp.cenate.repository.ModalidadAtencionRepository;
import com.styp.cenate.repository.RedRepository;
import com.styp.cenate.service.ipress.IpressService;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 🏥 Servicio para gestionar IPRESS con información de Red y Macroregión
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
@Data
public class IpressServiceImpl implements IpressService {

    private final IpressRepository ipressRepository;
    private final RedRepository redRepository;
    private final ModalidadAtencionRepository modalidadAtencionRepository;

    @Override
    public List<IpressResponse> getAllIpress() {
        log.info("Obteniendo todas las IPRESS");
        return ipressRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<IpressResponse> getIpressActivas() {
        log.info("Obteniendo IPRESS activas");
        return ipressRepository.findByStatIpress("A")
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public IpressResponse getIpressById(Long id) {
        log.info("Obteniendo IPRESS con ID: {}", id);
        Ipress ipress = ipressRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("IPRESS no encontrada"));
        return convertToResponse(ipress);
    }

    @Override
    public List<IpressResponse> searchIpress(String searchTerm) {
        log.info("Buscando IPRESS con término: {}", searchTerm);
        return ipressRepository.findByDescIpressContainingIgnoreCase(searchTerm)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<IpressResponse> getIpressActivasPorRed(Long idRed) {
        log.info("Obteniendo IPRESS activas por RED: {}", idRed);
        return ipressRepository.findByRed_IdAndStatIpress(idRed, "A")
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // ===========================
    // CREAR (CREATE)
    // ===========================
    @Override
    @Transactional
    public IpressResponse createIpress(IpressRequest request) {
        log.info("Creando nueva IPRESS: {}", request.getDescIpress());

        // Validar que la Red existe
        Red red = redRepository.findById(request.getIdRed())
                .orElseThrow(() -> new RuntimeException("Red no encontrada con ID: " + request.getIdRed()));

        // Validar modalidad si se proporciona
        ModalidadAtencion modalidad = null;
        if (request.getIdModAten() != null) {
            modalidad = modalidadAtencionRepository.findById(request.getIdModAten())
                    .orElseThrow(() -> new RuntimeException("Modalidad de atención no encontrada con ID: " + request.getIdModAten()));
        }

        // Construir entidad
        Ipress ipress = Ipress.builder()
                .codIpress(request.getCodIpress())
                .descIpress(request.getDescIpress())
                .red(red)
                .idNivAten(request.getIdNivAten())
                .modalidadAtencion(modalidad)
                .direcIpress(request.getDirecIpress())
                .idTipIpress(request.getIdTipIpress())
                .idDist(request.getIdDist())
                .latIpress(request.getLatIpress())
                .longIpress(request.getLongIpress())
                .gmapsUrlIpress(request.getGmapsUrlIpress())
                .statIpress(request.getStatIpress())
                .build();

        // Guardar
        Ipress saved = ipressRepository.save(ipress);
        log.info("IPRESS creada con ID: {}", saved.getIdIpress());

        return convertToResponse(saved);
    }

    // ===========================
    // ACTUALIZAR (UPDATE)
    // ===========================
    @Override
    @Transactional
    public IpressResponse updateIpress(Long id, IpressRequest request) {
        log.info("Actualizando IPRESS con ID: {}", id);

        // Verificar que existe
        Ipress ipress = ipressRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("IPRESS no encontrada con ID: " + id));

        // Validar que la Red existe
        Red red = redRepository.findById(request.getIdRed())
                .orElseThrow(() -> new RuntimeException("Red no encontrada con ID: " + request.getIdRed()));

        // Validar modalidad si se proporciona
        ModalidadAtencion modalidad = null;
        if (request.getIdModAten() != null) {
            modalidad = modalidadAtencionRepository.findById(request.getIdModAten())
                    .orElseThrow(() -> new RuntimeException("Modalidad de atención no encontrada con ID: " + request.getIdModAten()));
        }

        // Actualizar campos
        ipress.setCodIpress(request.getCodIpress());
        ipress.setDescIpress(request.getDescIpress());
        ipress.setRed(red);
        ipress.setIdNivAten(request.getIdNivAten());
        ipress.setModalidadAtencion(modalidad);
        ipress.setDirecIpress(request.getDirecIpress());
        ipress.setIdTipIpress(request.getIdTipIpress());
        ipress.setIdDist(request.getIdDist());
        ipress.setLatIpress(request.getLatIpress());
        ipress.setLongIpress(request.getLongIpress());
        ipress.setGmapsUrlIpress(request.getGmapsUrlIpress());
        ipress.setStatIpress(request.getStatIpress());

        // Guardar cambios
        Ipress updated = ipressRepository.save(ipress);
        log.info("IPRESS actualizada con éxito: {}", updated.getIdIpress());

        return convertToResponse(updated);
    }

    // ===========================
    // ELIMINAR (DELETE)
    // ===========================
    @Override
    @Transactional
    public void deleteIpress(Long id) {
        log.info("Eliminando IPRESS con ID: {}", id);

        // Verificar que existe
        Ipress ipress = ipressRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("IPRESS no encontrada con ID: " + id));

        // Eliminar
        ipressRepository.delete(ipress);
        log.info("IPRESS eliminada con éxito: {}", id);
    }

    /**
     * 🔄 Convierte entidad Ipress a DTO con Red, Macroregión y Modalidad completas
     */
    private IpressResponse convertToResponse(Ipress ipress) {
        Red red = ipress.getRed();
        Macroregion macro = red != null ? red.getMacroregion() : null;

        // Construir MacroregionResponse
        MacroregionResponse macroResponse = null;
        if (macro != null) {
            macroResponse = MacroregionResponse.builder()
                    .idMacro(macro.getIdMacro())
                    .descMacro(macro.getDescMacro())
                    .statMacro(macro.getStatMacro())
                    .build();
        }

        // Construir RedResponse
        RedResponse redResponse = null;
        if (red != null) {
            redResponse = RedResponse.builder()
                    .idRed(red.getId())
                    .codRed(red.getCodigo())
                    .descRed(red.getDescripcion())
                    .macroregion(macroResponse)
                    .idMacro(macro != null ? macro.getIdMacro() : null)
                    .build();
        }

        // Obtener nombre de la modalidad de atención
        String nombreModalidad = null;
        if (ipress.getModalidadAtencion() != null) {
            nombreModalidad = ipress.getModalidadAtencion().getDescModAten();
        }

        return IpressResponse.builder()
                .idIpress(ipress.getIdIpress())
                .codIpress(ipress.getCodIpress())
                .descIpress(ipress.getDescIpress())
                .red(redResponse)
                .idRed(ipress.getIdRed())
                .idNivAten(ipress.getIdNivAten())
                .idModAten(ipress.getIdModAten())
                .nombreModalidadAtencion(nombreModalidad)
                .direcIpress(ipress.getDirecIpress())
                .idTipIpress(ipress.getIdTipIpress())
                .idDist(ipress.getIdDist())
                .latIpress(ipress.getLatIpress())
                .longIpress(ipress.getLongIpress())
                .gmapsUrlIpress(ipress.getGmapsUrlIpress())
                .statIpress(ipress.getStatIpress())
                .createAt(ipress.getCreateAt())
                .updateAt(ipress.getUpdateAt())
                .build();
    }
}
