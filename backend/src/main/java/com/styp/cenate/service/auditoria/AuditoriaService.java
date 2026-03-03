package com.styp.cenate.service.auditoria;

import com.styp.cenate.entity.DimHistorialAccesoPagina;
import com.styp.cenate.repository.DimHistorialAccesoPaginaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditoriaService {

  private final DimHistorialAccesoPaginaRepository historialAccesoRepository;

  /**
   * Registrar acceso a una página
   */
  @Transactional
  public void registrarAccesoPagina(
    Integer idUsuario,
    Integer idPagina,
    String nombrePagina,
    String tipoAcceso,
    Integer idPersonal
  ) {
    try {
      DimHistorialAccesoPagina acceso = DimHistorialAccesoPagina.builder()
        .idUsuario(idUsuario)
        .idPagina(idPagina)
        .nombrePagina(nombrePagina)
        .tipoAcceso(tipoAcceso != null ? tipoAcceso : "CLICK_MENU")
        .idPersonal(idPersonal)
        .build();

      historialAccesoRepository.save(acceso);
      log.info("✅ Acceso registrado: Usuario={}, Página={} (ID={})", idUsuario, nombrePagina, idPagina);
    } catch (Exception e) {
      log.error("❌ Error registrando acceso a página: {}", e.getMessage());
      // No lanzar excepción para no interrumpir el flujo de navegación
    }
  }

  /**
   * Obtener historial de accesos de un usuario
   */
  @Transactional(readOnly = true)
  public List<DimHistorialAccesoPagina> obtenerHistorialUsuario(Integer idUsuario, Integer limiteRegistros) {
    List<DimHistorialAccesoPagina> accesos = historialAccesoRepository.findByIdUsuarioOrderByCreatedAtDesc(idUsuario);
    
    if (limiteRegistros != null && limiteRegistros > 0) {
      return accesos.size() > limiteRegistros ? accesos.subList(0, limiteRegistros) : accesos;
    }
    
    return accesos;
  }

  /**
   * Obtener accesos a una página específica
   */
  @Transactional(readOnly = true)
  public List<DimHistorialAccesoPagina> obtenerAccesosPorPagina(Integer idPagina) {
    return historialAccesoRepository.findByIdPaginaOrderByCreatedAtDesc(idPagina);
  }

  /**
   * Obtener accesos en rango de fechas
   */
  @Transactional(readOnly = true)
  public List<DimHistorialAccesoPagina> obtenerAccesosPorRangoFechas(LocalDateTime inicio, LocalDateTime fin) {
    return historialAccesoRepository.findByRangoFechas(inicio, fin);
  }

  /**
   * Obtener accesos de un usuario en rango de fechas
   */
  @Transactional(readOnly = true)
  public List<DimHistorialAccesoPagina> obtenerAccesosUsuarioRangoFechas(Integer idUsuario, LocalDateTime inicio, LocalDateTime fin) {
    return historialAccesoRepository.findByUsuarioYRangoFechas(idUsuario, inicio, fin);
  }

  /**
   * Contar accesos totales de un usuario
   */
  @Transactional(readOnly = true)
  public Long contarAccesosUsuario(Integer idUsuario) {
    return historialAccesoRepository.countByIdUsuario(idUsuario);
  }
}
