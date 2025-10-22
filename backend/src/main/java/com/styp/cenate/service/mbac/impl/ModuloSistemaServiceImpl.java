package com.styp.cenate.service.mbac.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.styp.cenate.dto.mbac.ModuloSistemaResponse;
import com.styp.cenate.dto.mbac.PaginaModuloResponse;
import com.styp.cenate.model.ModuloSistema;
import com.styp.cenate.model.PaginaModulo;
import com.styp.cenate.repository.mbac.ModuloSistemaRepository;
import com.styp.cenate.repository.mbac.PaginaModuloRepository;
import com.styp.cenate.service.mbac.ModuloSistemaService;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * 📦 Implementación del servicio para la gestión de módulos del sistema MBAC.
 * Mapea entidades a DTOs y evita problemas de lazy initialization.
 *
 * @author CENATE
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ModuloSistemaServiceImpl implements ModuloSistemaService {

    private final ModuloSistemaRepository moduloRepo;
    private final PaginaModuloRepository paginaRepo;

    // ============================================================
    // 🔹 OBTENER TODOS LOS MÓDULOS
    // ============================================================
    @Override
    @Transactional(readOnly = true)
    public List<ModuloSistemaResponse> obtenerTodosLosModulos() {
        log.info("📦 Obteniendo todos los módulos activos con sus páginas...");

        List<ModuloSistema> modulos = moduloRepo.findAllWithPaginasAndPermisos();

        return modulos.stream()
                .map(this::mapearAModuloResponse)
                .collect(Collectors.toList());
    }

    // ============================================================
    // 🔹 OBTENER PÁGINAS POR MÓDULO
    // ============================================================
    @Override
    @Transactional(readOnly = true)
    public List<PaginaModuloResponse> obtenerPaginasPorModulo(Integer idModulo) {
        log.info("📄 Obteniendo páginas activas del módulo ID: {}", idModulo);

        List<PaginaModulo> paginas = paginaRepo.findByModuloIdWithPermisos(idModulo);

        return paginas.stream()
                .map(this::mapearAPaginaResponse)
                .collect(Collectors.toList());
    }

    // ============================================================
    // 🔹 BUSCAR PÁGINA POR RUTA
    // ============================================================
    @Override
    @Transactional(readOnly = true)
    public Optional<PaginaModuloResponse> buscarPaginaPorRuta(String ruta) {
        log.info("🔍 Buscando página por ruta: {}", ruta);

        return paginaRepo.findByRutaPaginaWithModuloAndPermisos(ruta)
                .map(this::mapearAPaginaResponse);
    }

    // ============================================================
    // 🔹 MÉTODOS DE MAPEADO A DTO
    // ============================================================
    private ModuloSistemaResponse mapearAModuloResponse(ModuloSistema modulo) {
        return ModuloSistemaResponse.builder()
                .idModulo(modulo.getIdModulo())
                .nombreModulo(modulo.getNombreModulo())
                // 🔻 Se eliminaron campos que no existen en tu DTO (createdAt, updatedAt, etc.)
                .build();
    }

    private PaginaModuloResponse mapearAPaginaResponse(PaginaModulo pagina) {
        return PaginaModuloResponse.builder()
                .idPagina(pagina.getIdPagina())
                .nombrePagina(pagina.getNombrePagina())
                .rutaPagina(pagina.getRutaPagina())
                // 🔻 También se quitaron campos no definidos (descripcion, activo, permisos)
                .build();
    }
}