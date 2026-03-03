package com.styp.cenate.api;

import com.styp.cenate.entity.DimHistorialAccesoPagina;
import com.styp.cenate.service.auditoria.AuditoriaService;
import com.styp.cenate.security.service.JwtUtil;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

/**
 * HistorialAccesoController - Endpoints para rastreo de accesos a páginas
 * Base: /api/historial-accesos
 */
@Slf4j
@RestController
@RequestMapping("/api/historial-accesos")
@RequiredArgsConstructor
public class HistorialAccesoController {

  private final AuditoriaService auditoriaService;
  private final JwtUtil jwtUtil;

  /**
   * POST /api/historial-accesos/acceso-paginas
   * Registrar acceso a una página
   * Body: { idPagina, nombrePagina, tipoAcceso? }
   * El idUsuario se extrae del JWT token automáticamente
   */
  @PostMapping("/acceso-paginas")
  public ResponseEntity<?> registrarAccesoPagina(
    @RequestBody Map<String, Object> payload,
    @RequestHeader(value = "Authorization", required = false) String authHeader
  ) {
    try {
      // Obtener parámetros del payload
      Integer idPagina = ((Number) payload.get("idPagina")).intValue();
      String nombrePagina = (String) payload.get("nombrePagina");
      String tipoAcceso = payload.getOrDefault("tipoAcceso", "CLICK_MENU").toString();

      // Extraer idUsuario e idPersonal del JWT token
      Integer idUsuario = null;
      Integer idPersonal = null;
      String username = null;

      if (authHeader != null && authHeader.startsWith("Bearer ")) {
        String token = authHeader.substring(7); // Remover "Bearer "
        
        try {
          Claims claims = jwtUtil.extractAllClaims(token);
          
          // Obtener id_user del JWT claim (NO id_usuario)
          Object idUserObj = claims.get("id_user");
          if (idUserObj != null) {
            idUsuario = ((Number) idUserObj).intValue();
          }
          
          // Obtener idPers del JWT claim
          Object idPersObj = claims.get("idPers");
          if (idPersObj != null) {
            idPersonal = ((Number) idPersObj).intValue();
          }
          
          // Obtener username (subject)
          username = claims.getSubject();
          
          log.debug("📍 JWT claims extraídos - Usuario: {}, IdUsuario: {}, IdPersonal: {}", username, idUsuario, idPersonal);
        } catch (Exception e) {
          log.warn("⚠️ Error extrayendo claims del JWT: {}", e.getMessage());
        }
      }

      // Log del registro
      log.info("📍 Rastreando acceso - Usuario: {}, IdUsuario: {}, IdPersonal: {}, Página: {}, IdPágina: {}",
        username, idUsuario, idPersonal, nombrePagina, idPagina);

      // Registrar en la base de datos
      auditoriaService.registrarAccesoPagina(
        idUsuario,
        idPagina,
        nombrePagina,
        tipoAcceso,
        idPersonal
      );

      return ResponseEntity.ok(Map.of(
        "success", true,
        "message", "Acceso registrado exitosamente",
        "idUsuario", idUsuario,
        "usuario", username
      ));
    } catch (Exception e) {
      log.error("❌ Error registrando acceso: {}", e.getMessage(), e);
      return ResponseEntity.badRequest().body(Map.of(
        "success", false,
        "error", e.getMessage()
      ));
    }
  }

  /**
   * GET /api/auditoria/historial-usuario/{idUsuario}
   * Obtener historial de accesos de un usuario
   */
  @GetMapping("/historial-usuario/{idUsuario}")
  public ResponseEntity<?> obtenerHistorialUsuario(
    @PathVariable Integer idUsuario,
    @RequestParam(required = false) Integer limite
  ) {
    try {
      List<DimHistorialAccesoPagina> accesos = auditoriaService.obtenerHistorialUsuario(idUsuario, limite != null ? limite : 100);
      return ResponseEntity.ok(Map.of(
        "success", true,
        "data", accesos,
        "total", accesos.size()
      ));
    } catch (Exception e) {
      log.error("Error obteniendo historial: {}", e.getMessage());
      return ResponseEntity.badRequest().body(Map.of(
        "success", false,
        "error", e.getMessage()
      ));
    }
  }

  /**
   * GET /api/auditoria/accesos-pagina
   * Obtener accesos a una página específica
   */
  @GetMapping("/accesos-pagina")
  public ResponseEntity<?> obtenerAccesosPagina(
    @RequestParam Integer idPagina
  ) {
    try {
      List<DimHistorialAccesoPagina> accesos = auditoriaService.obtenerAccesosPorPagina(idPagina);
      return ResponseEntity.ok(Map.of(
        "success", true,
        "data", accesos,
        "total", accesos.size()
      ));
    } catch (Exception e) {
      log.error("Error obteniendo accesos por página: {}", e.getMessage());
      return ResponseEntity.badRequest().body(Map.of(
        "success", false,
        "error", e.getMessage()
      ));
    }
  }

  /**
   * GET /api/auditoria/estadisticas/accesos-usuario/{idUsuario}
   * Contar accesos totales de un usuario
   */
  @GetMapping("/estadisticas/accesos-usuario/{idUsuario}")
  public ResponseEntity<?> obtenerEstadisticasUsuario(
    @PathVariable Integer idUsuario
  ) {
    try {
      Long totalAccesos = auditoriaService.contarAccesosUsuario(idUsuario);
      return ResponseEntity.ok(Map.of(
        "success", true,
        "idUsuario", idUsuario,
        "totalAccesos", totalAccesos
      ));
    } catch (Exception e) {
      log.error("Error obteniendo estadísticas: {}", e.getMessage());
      return ResponseEntity.badRequest().body(Map.of(
        "success", false,
        "error", e.getMessage()
      ));
    }
  }
}
