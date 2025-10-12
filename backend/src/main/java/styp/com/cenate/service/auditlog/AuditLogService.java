package styp.com.cenate.service.auditlog;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.Page;
import styp.com.cenate.model.AuditLog;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public interface AuditLogService {

    void registrarAccion(String action, String modulo, String detalle, String nivel, HttpServletRequest request);

    void registrarLogin(String usuario, HttpServletRequest request);

    void registrarLogout(String usuario, HttpServletRequest request);

    void registrarError(String action, String modulo, String detalle, HttpServletRequest request);

    Page<AuditLog> obtenerLogs(int page, int size, String sortBy, String direction);

    Page<AuditLog> buscarPorUsuario(String usuario, int page, int size);

    Page<AuditLog> buscarPorFechas(LocalDateTime inicio, LocalDateTime fin, int page, int size);

    List<AuditLog> obtenerUltimosLogs();

    Map<String, Object> obtenerEstadisticas();

    Page<AuditLog> busquedaAvanzada(
            String usuario, String action, String modulo, String nivel, String estado,
            LocalDateTime fechaInicio, LocalDateTime fechaFin, int page, int size
    );
}