package com.styp.cenate.service.dengue.impl;

import com.styp.cenate.dto.dengue.DengueExcelRowDTO;
import com.styp.cenate.dto.dengue.DengueImportResultDTO;
import com.styp.cenate.model.bolsas.SolicitudBolsa;
import com.styp.cenate.repository.bolsas.SolicitudBolsaRepository;
import com.styp.cenate.service.dengue.DengueExcelParserService;
import com.styp.cenate.service.dengue.DengueService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Optional;

/**
 * Implementación del servicio Dengue con las 5 vinculaciones
 *
 * @version 1.0.0
 * @since 2026-01-29
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class DengueServiceImpl implements DengueService {

    private final SolicitudBolsaRepository solicitudRepository;
    private final DengueExcelParserService excelParser;

    @Override
    public DengueImportResultDTO cargarExcelDengue(MultipartFile archivo, Long usuarioId) {
        log.info("📥 Iniciando carga de Excel Dengue: {} - Usuario: {}", archivo.getOriginalFilename(), usuarioId);

        Long inicioTime = System.currentTimeMillis();
        DengueImportResultDTO resultado = DengueImportResultDTO.builder()
                .exitoso(true)
                .totalProcesados(0)
                .insertados(0)
                .actualizados(0)
                .errores(0)
                .build();

        try {
            log.info("📄 Parseando Excel...");
            var filas = excelParser.parsearExcel(archivo);
            resultado.setTotalProcesados(filas.size());
            log.info("✅ Excel parseado: {} filas", filas.size());

            for (DengueExcelRowDTO fila : filas) {
                try {
                    procesarFilaDengue(fila, resultado);
                } catch (Exception e) {
                    log.error("❌ Error procesando fila DNI {}: {}", fila.getDni(), e.getMessage());
                    resultado.setErrores(resultado.getErrores() + 1);
                    resultado.agregarError(String.format("Fila DNI %s: %s", fila.getDni(), e.getMessage()));
                }
            }

            Long tiempoMs = System.currentTimeMillis() - inicioTime;
            resultado.setTiempoMs(tiempoMs);
            log.info("⏱️  Carga completada en {}ms", tiempoMs);

            return resultado;

        } catch (IOException e) {
            log.error("❌ Error leyendo Excel", e);
            resultado.setExitoso(false);
            resultado.agregarError("Error: " + e.getMessage());
            return resultado;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SolicitudBolsa> listarCasosDengue(Pageable pageable) {
        log.info("📋 Listando casos dengue - página: {}", pageable.getPageNumber());
        return solicitudRepository.findAllDengueCasos(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SolicitudBolsa> buscarCasosDengue(String dni, String dxMain, Pageable pageable) {
        log.info("🔍 Buscando dengue: dni={}, dxMain={}", dni, dxMain);
        return solicitudRepository.buscarDengueCasos(dni, dxMain, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public SolicitudBolsa obtenerCasoDengue(Long idSolicitud) {
        return solicitudRepository.findById(idSolicitud)
                .orElseThrow(() -> {
                    log.error("❌ Caso dengue no encontrado: {}", idSolicitud);
                    return new RuntimeException("Caso dengue no encontrado: " + idSolicitud);
                });
    }

    /**
     * Procesa una fila del Excel aplicando las 5 vinculaciones
     * Deduplicación por: idBolsa + pacienteDni (ya existe constraint en DB)
     */
    private void procesarFilaDengue(DengueExcelRowDTO fila, DengueImportResultDTO resultado) {
        // 1️⃣ Normalizar DNI
        String dniNormalizado = normalizarDni(fila.getDni());
        
        // 2️⃣ Validar CIE-10
        validarYVincularCIE10(fila.getDxMain());

        // 3️⃣ Verificar duplicado por DNI (constraint: id_bolsa + paciente_id)
        // Usando existsByIdBolsaAndPacienteIdAndIdServicioAndActivoTrue
        boolean yaExiste = solicitudRepository.existsByIdBolsaAndPacienteIdAndIdServicioAndActivoTrue(
                2L,  // id_bolsa = DENGUE
                dniNormalizado,
                1L   // id_servicio default
        );

        if (yaExiste) {
            // UPDATE - Buscar y actualizar
            var existentes = solicitudRepository.findByIdBolsaAndPacienteIdAndIdServicio(
                    2L, dniNormalizado, 1L
            );
            if (!existentes.isEmpty()) {
                SolicitudBolsa caso = existentes.get(0);
                caso.setDxMain(fila.getDxMain());
                caso.setCenasicod(fila.getCenasicod());
                caso.setFechaSintomas(fila.getFechaSt());
                caso.setSemanaEpidem(fila.getSemana());
                solicitudRepository.save(caso);
                resultado.setActualizados(resultado.getActualizados() + 1);
                log.debug("🔄 Caso actualizado: {}", dniNormalizado);
            }
        } else {
            // INSERT - Crear nuevo
            SolicitudBolsa caso = SolicitudBolsa.builder()
                    .numeroSolicitud("DENGUE-" + System.nanoTime())
                    // Datos Paciente
                    .pacienteId(dniNormalizado)
                    .pacienteDni(dniNormalizado)
                    .pacienteNombre(fila.getNombre() != null ? fila.getNombre().toUpperCase() : "")
                    .pacienteSexo(fila.getSexo())
                    .pacienteTelefono(fila.getTelefFijo())
                    .pacienteTelefonoAlterno(fila.getTelefMovil())
                    // IPRESS
                    .codigoAdscripcion(fila.getIpress() != null ? fila.getIpress().toUpperCase() : "DENGUE")
                    // Campos Dengue
                    .dxMain(fila.getDxMain())
                    .cenasicod(fila.getCenasicod())
                    .fechaSintomas(fila.getFechaSt())
                    .semanaEpidem(fila.getSemana())
                    // Referencias
                    .idBolsa(2L)  // BOLSA_DENGUE
                    .idServicio(1L)  // Default
                    .estado("PENDIENTE")
                    .activo(true)
                    .estadoGestionCitasId(1L)
                    .build();

            solicitudRepository.save(caso);
            resultado.setInsertados(resultado.getInsertados() + 1);
            log.debug("➕ Caso insertado: {}", dniNormalizado);
        }
    }

    /**
     * Validar CIE-10: solo A97.0, A97.1, A97.2
     */
    private void validarYVincularCIE10(String dxMain) {
        if (dxMain == null || dxMain.isEmpty()) {
            throw new RuntimeException("dx_main no puede estar vacío");
        }

        if (!dxMain.matches("A97\\.[012]")) {
            throw new RuntimeException("CIE-10 inválido: " + dxMain + " (solo A97.0, A97.1, A97.2 aceptados)");
        }
    }

    /**
     * Normalizar DNI a 8 dígitos
     */
    private String normalizarDni(Object dni) {
        if (dni == null) {
            throw new RuntimeException("DNI no puede ser nulo");
        }

        String limpio = dni.toString().replaceAll("[^0-9]", "");

        if (limpio.isEmpty()) {
            throw new RuntimeException("DNI no contiene dígitos");
        }

        try {
            long dniNumerico = Long.parseLong(limpio);
            return String.format("%08d", dniNumerico);
        } catch (NumberFormatException e) {
            throw new RuntimeException("DNI no es numérico válido: " + limpio);
        }
    }
}
