package com.styp.cenate.service.tipos_bolsas.impl;

import com.styp.cenate.dto.TipoBolsaResponse;
import com.styp.cenate.model.TipoBolsa;
import com.styp.cenate.repository.TipoBolsaRepository;
import com.styp.cenate.service.tipos_bolsas.TipoBolsaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 📋 Servicio de Tipos de Bolsas - Implementación
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class TipoBolsaServiceImpl implements TipoBolsaService {

    private final TipoBolsaRepository tipoBolsaRepository;

    @Override
    public List<TipoBolsaResponse> obtenerTodosTiposBolsasActivos() {
        log.info("📋 Obteniendo todos los tipos de bolsas activos");
        return tipoBolsaRepository.findByStatTipoBolsaOrderByDescTipoBolsaAsc("A")
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public TipoBolsaResponse obtenerTipoBolsaPorId(Long idTipoBolsa) {
        log.info("🔍 Obteniendo tipo de bolsa ID: {}", idTipoBolsa);
        TipoBolsa tipoBolsa = tipoBolsaRepository.findById(idTipoBolsa)
                .orElseThrow(() -> new RuntimeException("Tipo de bolsa no encontrado con ID: " + idTipoBolsa));
        return mapToResponse(tipoBolsa);
    }

    @Override
    public TipoBolsaResponse obtenerTipoBolsaPorCodigo(String codigo) {
        log.info("🔍 Obteniendo tipo de bolsa: {}", codigo);
        TipoBolsa tipoBolsa = tipoBolsaRepository.findByCodTipoBolsa(codigo)
                .orElseThrow(() -> new RuntimeException("Tipo de bolsa no encontrado: " + codigo));
        return mapToResponse(tipoBolsa);
    }

    @Override
    public Page<TipoBolsaResponse> buscarTiposBolsas(String busqueda, String estado, Pageable pageable) {
        log.info("🔎 Buscando tipos de bolsas: busqueda={}, estado={}", busqueda, estado);
        return tipoBolsaRepository.buscarTiposBolsas(busqueda, estado, pageable)
                .map(this::mapToResponse);
    }

    @Override
    @Transactional
    public TipoBolsaResponse crearTipoBolsa(TipoBolsaRequest request) {
        log.info("✏️ Creando nuevo tipo de bolsa: {}", request.codTipoBolsa());

        // Verificar si ya existe un tipo de bolsa con el mismo código
        if (tipoBolsaRepository.findByCodTipoBolsaIgnoreCase(request.codTipoBolsa()).isPresent()) {
            throw new RuntimeException("Ya existe un tipo de bolsa con el código: " + request.codTipoBolsa());
        }

        TipoBolsa tipoBolsa = TipoBolsa.builder()
                .codTipoBolsa(request.codTipoBolsa())
                .descTipoBolsa(request.descTipoBolsa())
                .statTipoBolsa("A")
                .build();

        TipoBolsa tipoGuardado = tipoBolsaRepository.save(tipoBolsa);
        return mapToResponse(tipoGuardado);
    }

    @Override
    @Transactional
    public TipoBolsaResponse actualizarTipoBolsa(Long idTipoBolsa, TipoBolsaRequest request) {
        log.info("✏️ Actualizando tipo de bolsa ID: {}", idTipoBolsa);

        TipoBolsa tipoBolsa = tipoBolsaRepository.findById(idTipoBolsa)
                .orElseThrow(() -> new RuntimeException("Tipo de bolsa no encontrado con ID: " + idTipoBolsa));

        tipoBolsa.setDescTipoBolsa(request.descTipoBolsa());
        TipoBolsa tipoActualizado = tipoBolsaRepository.save(tipoBolsa);

        return mapToResponse(tipoActualizado);
    }

    @Override
    @Transactional
    public TipoBolsaResponse cambiarEstadoTipoBolsa(Long idTipoBolsa, String nuevoEstado) {
        log.info("🔄 Cambiando estado de tipo de bolsa ID: {} a {}", idTipoBolsa, nuevoEstado);

        TipoBolsa tipoBolsa = tipoBolsaRepository.findById(idTipoBolsa)
                .orElseThrow(() -> new RuntimeException("Tipo de bolsa no encontrado con ID: " + idTipoBolsa));

        if (!nuevoEstado.matches("A|I")) {
            throw new RuntimeException("Estado inválido: " + nuevoEstado);
        }

        tipoBolsa.setStatTipoBolsa(nuevoEstado);
        TipoBolsa tipoActualizado = tipoBolsaRepository.save(tipoBolsa);

        return mapToResponse(tipoActualizado);
    }

    @Override
    @Transactional
    public void eliminarTipoBolsa(Long idTipoBolsa) {
        log.warn("🗑️ Eliminando tipo de bolsa ID: {}", idTipoBolsa);

        TipoBolsa tipoBolsa = tipoBolsaRepository.findById(idTipoBolsa)
                .orElseThrow(() -> new RuntimeException("Tipo de bolsa no encontrado con ID: " + idTipoBolsa));

        tipoBolsa.setStatTipoBolsa("I");
        tipoBolsaRepository.save(tipoBolsa);
    }

    @Override
    public EstadisticasTiposBolsasDTO obtenerEstadisticas() {
        log.info("📊 Calculando estadísticas de tipos de bolsas");

        Long totalTipos = tipoBolsaRepository.count();
        Long tiposActivos = tipoBolsaRepository.countByStatTipoBolsa("A");
        Long tiposInactivos = tipoBolsaRepository.countByStatTipoBolsa("I");

        return new EstadisticasTiposBolsasDTO(totalTipos, tiposActivos, tiposInactivos);
    }

    /**
     * Mapea entidad TipoBolsa a DTO
     */
    private TipoBolsaResponse mapToResponse(TipoBolsa tipoBolsa) {
        return TipoBolsaResponse.builder()
                .idTipoBolsa(tipoBolsa.getIdTipoBolsa())
                .codTipoBolsa(tipoBolsa.getCodTipoBolsa())
                .descTipoBolsa(tipoBolsa.getDescTipoBolsa())
                .statTipoBolsa(tipoBolsa.getStatTipoBolsa())
                .createdAt(tipoBolsa.getCreatedAt())
                .updatedAt(tipoBolsa.getUpdatedAt())
                .build();
    }
}
