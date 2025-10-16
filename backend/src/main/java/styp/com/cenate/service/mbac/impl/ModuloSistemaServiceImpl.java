package styp.com.cenate.service.mbac.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import styp.com.cenate.dto.mbac.ModuloSistemaResponse;
import styp.com.cenate.dto.mbac.PaginaModuloResponse;
import styp.com.cenate.dto.mbac.PermisoModularResponse;
import styp.com.cenate.model.ModuloSistema;
import styp.com.cenate.model.PaginaModulo;
import styp.com.cenate.model.PermisoModular;
import styp.com.cenate.repository.mbac.ModuloSistemaRepository;
import styp.com.cenate.repository.mbac.PaginaModuloRepository;
import styp.com.cenate.service.mbac.ModuloSistemaService;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Implementación del servicio para la gestión de módulos del sistema MBAC.
 * Maneja el mapeo de entidades a DTOs para evitar problemas de lazy initialization.
 * 
 * @author CENATE Development Team
 * @version 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ModuloSistemaServiceImpl implements ModuloSistemaService {

    private final ModuloSistemaRepository moduloRepo;
    private final PaginaModuloRepository paginaRepo;

    @Override
    @Transactional(readOnly = true)
    public List<ModuloSistemaResponse> obtenerTodosLosModulos() {
        log.info("📦 Obteniendo todos los módulos activos con sus páginas");
        
        List<ModuloSistema> modulos = moduloRepo.findAllWithPaginasAndPermisos();
        
        return modulos.stream()
                .map(this::mapearAModuloResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaginaModuloResponse> obtenerPaginasPorModulo(Integer idModulo) {
        log.info("📄 Obteniendo páginas activas del módulo ID: {}", idModulo);
        
        List<PaginaModulo> paginas = paginaRepo.findByModuloIdWithPermisos(idModulo);
        
        return paginas.stream()
                .map(this::mapearAPaginaResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<PaginaModuloResponse> buscarPaginaPorRuta(String ruta) {
        log.info("🔍 Buscando página por ruta: {}", ruta);
        
        return paginaRepo.findByRutaPaginaWithModuloAndPermisos(ruta)
                .map(this::mapearAPaginaResponse);
    }

    // =========================================================================================
    // 🔹 Métodos de mapeo privados
    // =========================================================================================

    private ModuloSistemaResponse mapearAModuloResponse(ModuloSistema modulo) {
        return ModuloSistemaResponse.builder()
                .idModulo(modulo.getIdModulo())
                .nombreModulo(modulo.getNombreModulo())
                .descripcion(modulo.getDescripcion())
                .icono(modulo.getIcono())
                .rutaBase(modulo.getRutaBase())
                .activo(modulo.getActivo())
                .createdAt(modulo.getCreatedAt())
                .updatedAt(modulo.getUpdatedAt())
                .paginas(modulo.getPaginas().stream()
                        .map(this::mapearAPaginaResponse)
                        .collect(Collectors.toList()))
                .build();
    }

    private PaginaModuloResponse mapearAPaginaResponse(PaginaModulo pagina) {
        return PaginaModuloResponse.builder()
                .idPagina(pagina.getIdPagina())
                .nombrePagina(pagina.getNombrePagina())
                .rutaPagina(pagina.getRutaPagina())
                .descripcion(pagina.getDescripcion())
                .activo(pagina.getActivo())
                .permisos(pagina.getPermisos().stream()
                        .map(this::mapearAPermisoResponse)
                        .collect(Collectors.toList()))
                .build();
    }

    private PermisoModularResponse mapearAPermisoResponse(PermisoModular permiso) {
        return PermisoModularResponse.builder()
                .idPermisoMod(permiso.getIdPermisoMod())
                .nombreRol(permiso.getRol().getDescRol())
                .puedeVer(permiso.getPuedeVer())
                .puedeCrear(permiso.getPuedeCrear())
                .puedeEditar(permiso.getPuedeEditar())
                .puedeEliminar(permiso.getPuedeEliminar())
                .puedeExportar(permiso.getPuedeExportar())
                .puedeAprobar(permiso.getPuedeAprobar())
                .activo(permiso.getActivo())
                .build();
    }
}
