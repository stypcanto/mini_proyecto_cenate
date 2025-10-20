package com.styp.cenate.service.auditlog;

import com.styp.cenate.model.AuditLog;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.Page;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public interface AuditLogService {

    // 🔍 Consultas
    Page<AuditLog> obtenerLogs(int page, int size, String sortBy, String direction);
    Page<AuditLog> buscarPorUsuario(String username, int page, int size);
    Page<AuditLog> buscarPorFechas(LocalDateTime inicio, LocalDateTime fin, int page, int size);
    List<AuditLog> obtenerUltimosLogs();
    Map<String, Object> obtenerEstadisticas();
    Page<AuditLog> busquedaAvanzada(String usuario, String action, String modulo, String nivel, String estado,
                                    LocalDateTime inicio, LocalDateTime fin, int page, int size);

    // 🧾 Registro de eventos genéricos
    void registrarEvento(String usuario, String action, String modulo, String detalle, String nivel, String estado);

    // 👇 Métodos usados en AuthController y otros servicios
    void registrarLogin(String username, HttpServletRequest request);
    void registrarAccion(String action, String modulo, String detalle, String nivel, HttpServletRequest request);
    void registrarError(String action, String modulo, String mensaje, HttpServletRequest request);
}
