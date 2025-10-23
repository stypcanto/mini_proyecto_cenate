package com.styp.cenate.service.mbac.impl;
import lombok.Data;

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
 * 📦 Servicio de gestión de módulos del sistema (MBAC).
 * Mapea entidades a DTOs y evita problemas de LazyInitializationException.
 *
 * Responsable de devolver módulos activos y sus páginas asociadas.
 *
 * @author
 *   CENATE Development Team
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Data
public class ModuloSistemaServiceImpl implements ModuloSistemaService {

    private final ModuloSistemaRepository moduloRepo;
    private final PaginaModuloRepository paginaRepo;

    // ============================================================
    // 🔹 OBTENER TODOS LOS MÓDULOS ACTIVOS CON SUS PÁGINAS
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
    // 🔹 OBTENER PÁGINAS ACTIVAS POR MÓDULO
    // ============================================================
    @Override
    @Transactional(readOnly = true)
    public List<PaginaModuloResponse> obtenerPaginasPorModulo(Integer idModulo) {
        log.info("📄 Obteniendo páginas activas del módulo ID: {}", idModulo);

        List<PaginaModulo> paginas = paginaRepo.findByModuloIdWithPermisos(idModulo);

        return paginas.stream()
                .filter(PaginaModulo::getActivo) // ✅ solo páginas activas
                .map(this::mapearAPaginaResponse)
                .collect(Collectors.toList());
    }

    // ============================================================
    // 🔹 BUSCAR PÁGINA POR RUTA (con módulo y permisos)
    // ============================================================
    @Override
    @Transactional(readOnly = true)
    public Optional<PaginaModuloResponse> buscarPaginaPorRuta(String ruta) {
        log.info("🔍 Buscando página por ruta: {}", ruta);

        return paginaRepo.findByRutaPaginaWithModuloAndPermisos(ruta)
                .filter(PaginaModulo::getActivo)
                .map(this::mapearAPaginaResponse);
    }

    // ============================================================
    // 🔹 MÉTODOS DE MAPEADO A DTO
    // ============================================================
    private ModuloSistemaResponse mapearAModuloResponse(ModuloSistema modulo) {
        return ModuloSistemaResponse.builder()
                .idModulo(modulo.getIdModulo())
                .nombreModulo(modulo.getNombreModulo())
                .paginas(
                        modulo.getPaginas() != null
                                ? modulo.getPaginas().stream()
                                .filter(PaginaModulo::getActivo)
                                .map(this::mapearAPaginaResponse)
                                .collect(Collectors.toList())
                                : null
                )
                .build();
    }

    private PaginaModuloResponse mapearAPaginaResponse(PaginaModulo pagina) {
        return PaginaModuloResponse.builder()
                .idPagina(pagina.getIdPagina())
                .nombrePagina(pagina.getNombrePagina())
                .rutaPagina(pagina.getRutaPagina())
                .descripcion(pagina.getDescripcion())
                .activo(pagina.getActivo())
                .build();
    }
}