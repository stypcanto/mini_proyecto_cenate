package com.styp.cenate.service.ipress.impl;

import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.styp.cenate.dto.IpressResponse;
import com.styp.cenate.dto.MacroregionResponse;
import com.styp.cenate.dto.RedResponse;
import com.styp.cenate.model.Ipress;
import com.styp.cenate.model.Macroregion;
import com.styp.cenate.model.Red;
import com.styp.cenate.repository.IpressRepository;
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

    /**
     * 🔄 Convierte entidad Ipress a DTO con Red y Macroregión completas
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

        return IpressResponse.builder()
                .idIpress(ipress.getIdIpress())
                .codIpress(ipress.getCodIpress())
                .descIpress(ipress.getDescIpress())
                .red(redResponse)
                .idRed(ipress.getIdRed())
                .idNivAten(ipress.getIdNivAten())
                .idModAten(ipress.getIdModAten())
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
