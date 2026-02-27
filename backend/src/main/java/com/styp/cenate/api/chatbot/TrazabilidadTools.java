package com.styp.cenate.api.chatbot;

import com.styp.cenate.model.DimBolsa;
import com.styp.cenate.model.GestionPaciente;
import com.styp.cenate.model.PersonalCnt;
import com.styp.cenate.model.Usuario;
import com.styp.cenate.repository.AseguradoRepository;
import com.styp.cenate.repository.BolsaRepository;
import com.styp.cenate.repository.GestionPacienteRepository;
import com.styp.cenate.repository.PersonalCntRepository;
import com.styp.cenate.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * ============================================================
 * 🔧 TrazabilidadTools — Spring AI Tools (v1.70.0)
 * ============================================================
 * Herramientas que consultan la BD PostgreSQL en tiempo real
 * para que el LLM pueda responder preguntas de trazabilidad.
 *
 * Cada método anotado con @Tool es invocado automáticamente
 * por Claude cuando lo considera necesario para responder.
 * ============================================================
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class TrazabilidadTools {

    private final BolsaRepository bolsaRepository;
    private final GestionPacienteRepository gestionPacienteRepository;
    private final AseguradoRepository aseguradoRepository;
    private final UsuarioRepository usuarioRepository;
    private final PersonalCntRepository personalCntRepository;

    // ============================================================
    // 🔍 HISTORIAL DE SOLICITUDES EN BOLSA
    // ============================================================

    @Tool(description = """
            Busca el historial de solicitudes en bolsa de un paciente por DNI.
            Devuelve especialidad, estado de la solicitud, responsable asignado,
            código IPRESS y tipo de cita. Usa esto para rastrear al paciente en CENATE.
            """)
    public String buscarHistorialPaciente(String dni) {
        log.info("[Trazabilidad] buscarHistorialPaciente({})", dni);
        try {
            List<DimBolsa> bolsas = bolsaRepository.findByPacienteDni(dni);
            if (bolsas.isEmpty()) {
                return "No se encontraron solicitudes en bolsa para el DNI: " + dni;
            }
            String resumen = bolsas.stream()
                    .map(b -> String.format(
                            "ID=%d | Especialidad=%s | Estado=%s | Responsable=%s | IPRESS=%s | TipoCita=%s",
                            b.getIdSolicitud(),
                            b.getEspecialidadNombre() != null ? b.getEspecialidadNombre() : "N/A",
                            b.getEstado() != null ? b.getEstado() : "N/A",
                            b.getResponsableNombre() != null ? b.getResponsableNombre() : "Sin asignar",
                            b.getCodigoIpress() != null ? b.getCodigoIpress() : "N/A",
                            b.getTipoCita() != null ? b.getTipoCita() : "N/A"))
                    .collect(Collectors.joining("\n"));
            return "Paciente: " + (bolsas.get(0).getPacienteNombre() != null ? bolsas.get(0).getPacienteNombre() : dni)
                    + " | Total registros: " + bolsas.size() + "\n" + resumen;
        } catch (Exception e) {
            log.error("[Trazabilidad] Error buscarHistorialPaciente: {}", e.getMessage());
            return "Error al consultar historial: " + e.getMessage();
        }
    }

    // ============================================================
    // ✅ VERIFICAR SI PUEDE CREAR CITA
    // ============================================================

    @Tool(description = """
            Verifica si un paciente puede recibir una nueva cita en CENATE.
            Analiza sus solicitudes activas en bolsa y su historial de gestión.
            Devuelve un diagnóstico con alertas si ya tiene citas activas.
            """)
    public String verificarPuedeCrearCita(String dni) {
        log.info("[Trazabilidad] verificarPuedeCrearCita({})", dni);
        try {
            List<DimBolsa> bolsas = bolsaRepository.findByPacienteDni(dni);
            List<GestionPaciente> gestiones = gestionPacienteRepository.findByNumDoc(dni);
            boolean existeAsegurado = aseguradoRepository.findByDocPaciente(dni).isPresent();

            StringBuilder sb = new StringBuilder();
            sb.append("=== Diagnóstico DNI ").append(dni).append(" ===\n");

            if (!existeAsegurado) {
                sb.append("❌ DNI no encontrado en la base de asegurados.\n");
                return sb.toString();
            }
            sb.append("✅ Asegurado registrado en el sistema.\n");

            List<DimBolsa> activas = bolsas.stream()
                    .filter(b -> b.getEstado() != null && b.getActivo() != null && b.getActivo()
                            && !b.getEstado().equalsIgnoreCase("CERRADA")
                            && !b.getEstado().equalsIgnoreCase("INACTIVA"))
                    .collect(Collectors.toList());

            sb.append("Total solicitudes en bolsa: ").append(bolsas.size()).append("\n");
            sb.append("Solicitudes activas: ").append(activas.size()).append("\n");
            sb.append("Registros de gestión: ").append(gestiones.size()).append("\n");

            if (!activas.isEmpty()) {
                sb.append("⚠️ Tiene ").append(activas.size()).append(" solicitud(es) activa(s):\n");
                activas.forEach(b -> sb.append("  → ID=").append(b.getIdSolicitud())
                        .append(" | ").append(b.getEspecialidadNombre())
                        .append(" | Estado=").append(b.getEstado()).append("\n"));
            } else {
                sb.append("✅ Sin solicitudes activas. Puede crear nueva cita.\n");
            }
            return sb.toString();
        } catch (Exception e) {
            log.error("[Trazabilidad] Error verificarPuedeCrearCita: {}", e.getMessage());
            return "Error al verificar: " + e.getMessage();
        }
    }

    // ============================================================
    // 🔍 DETECTAR INCONSISTENCIAS
    // ============================================================

    @Tool(description = """
            Detecta inconsistencias en los datos de un paciente en CENATE:
            - Solicitudes sin responsable asignado
            - Registros activos duplicados en la misma especialidad
            - Paciente sin registro en la tabla de asegurados
            Devuelve lista detallada de los problemas encontrados.
            """)
    public String detectarInconsistencias(String dni) {
        log.info("[Trazabilidad] detectarInconsistencias({})", dni);
        try {
            List<DimBolsa> bolsas = bolsaRepository.findByPacienteDni(dni);
            StringBuilder sb = new StringBuilder();
            sb.append("=== Inconsistencias DNI ").append(dni).append(" ===\n");
            boolean hayProblemas = false;

            if (!aseguradoRepository.findByDocPaciente(dni).isPresent()) {
                sb.append("❌ DNI no existe en la tabla de asegurados.\n");
                return sb.toString();
            }

            for (DimBolsa b : bolsas) {
                if (b.getResponsableNombre() == null || b.getResponsableNombre().isBlank()) {
                    sb.append("⚠️ Solicitud ID=").append(b.getIdSolicitud())
                      .append(" (").append(b.getEspecialidadNombre()).append(")")
                      .append(": sin responsable asignado. Estado=").append(b.getEstado()).append("\n");
                    hayProblemas = true;
                }
            }

            // Duplicados activos por especialidad
            bolsas.stream()
                    .filter(b -> b.getEspecialidadNombre() != null
                            && b.getActivo() != null && b.getActivo())
                    .collect(Collectors.groupingBy(DimBolsa::getEspecialidadNombre))
                    .forEach((esp, lista) -> {
                        if (lista.size() > 1) {
                            sb.append("❌ Especialidad '").append(esp).append("': ")
                              .append(lista.size()).append(" registros activos (posible duplicado).\n");
                        }
                    });

            if (!hayProblemas && sb.toString().endsWith("===\n")) {
                sb.append("✅ No se detectaron inconsistencias.\n");
            }
            return sb.toString();
        } catch (Exception e) {
            log.error("[Trazabilidad] Error detectarInconsistencias: {}", e.getMessage());
            return "Error al detectar inconsistencias: " + e.getMessage();
        }
    }

    // ============================================================
    // 👨‍⚕️ BUSCAR PROFESIONAL
    // ============================================================

    @Tool(description = """
            Busca un profesional de salud del equipo CENATE por DNI exacto o nombre parcial.
            Devuelve nombre completo, DNI, área de trabajo y estado laboral.
            Útil para verificar si un médico o enfermero existe y está activo.
            """)
    public String buscarProfesional(String dniONombre) {
        log.info("[Trazabilidad] buscarProfesional({})", dniONombre);
        try {
            // Búsqueda por nombre (mutable para poder agregar por DNI)
            List<PersonalCnt> porNombre = new ArrayList<>(personalCntRepository
                    .findByNomPersContainingIgnoreCaseOrApePaterPersContainingIgnoreCaseOrApeMaterPersContainingIgnoreCase(
                            dniONombre, dniONombre, dniONombre));

            // También buscar por DNI exacto si es numérico
            if (dniONombre.matches("\\d+") && porNombre.isEmpty()) {
                personalCntRepository.findAll().stream()
                        .filter(p -> dniONombre.equals(p.getNumDocPers()))
                        .findFirst()
                        .ifPresent(porNombre::add);
            }

            if (porNombre.isEmpty()) {
                return "No se encontró profesional con criterio: " + dniONombre;
            }

            return porNombre.stream()
                    .map(p -> String.format(
                            "DNI=%s | Nombre=%s %s %s | Área=%s | Estado=%s",
                            p.getNumDocPers() != null ? p.getNumDocPers() : "N/A",
                            p.getNomPers() != null ? p.getNomPers() : "",
                            p.getApePaterPers() != null ? p.getApePaterPers() : "",
                            p.getApeMaterPers() != null ? p.getApeMaterPers() : "",
                            p.getArea() != null ? p.getArea().getDescArea() : "N/A",
                            p.getStatPers() != null ? p.getStatPers() : "N/A"))
                    .collect(Collectors.joining("\n"));
        } catch (Exception e) {
            log.error("[Trazabilidad] Error buscarProfesional: {}", e.getMessage());
            return "Error al buscar profesional: " + e.getMessage();
        }
    }

    // ============================================================
    // 👤 BUSCAR USUARIO CENATE
    // ============================================================

    @Tool(description = """
            Busca usuarios del sistema CENATE por nombre de usuario (login) o parte del nombre.
            Devuelve username, roles asignados y estado de la cuenta (Activo/Inactivo).
            Útil para diagnosticar problemas de acceso o permisos de un usuario.
            """)
    public String buscarUsuarioCENATE(String criterio) {
        log.info("[Trazabilidad] buscarUsuarioCENATE({})", criterio);
        try {
            List<Usuario> usuarios = usuarioRepository.findAll();
            List<Usuario> encontrados = usuarios.stream()
                    .filter(u -> u.getNameUser() != null &&
                            u.getNameUser().toLowerCase().contains(criterio.toLowerCase()))
                    .collect(Collectors.toList());

            if (encontrados.isEmpty()) {
                return "No se encontraron usuarios con criterio: " + criterio;
            }

            return encontrados.stream()
                    .map(u -> {
                        String roles = u.getRoles() != null
                                ? u.getRoles().stream()
                                        .map(r -> r.getDescRol())
                                        .collect(Collectors.joining(", "))
                                : "Sin roles";
                        return String.format("Usuario=%s | Roles=[%s] | Estado=%s",
                                u.getNameUser(), roles, u.getStatUser());
                    })
                    .collect(Collectors.joining("\n"));
        } catch (Exception e) {
            log.error("[Trazabilidad] Error buscarUsuarioCENATE: {}", e.getMessage());
            return "Error al buscar usuario: " + e.getMessage();
        }
    }
}
