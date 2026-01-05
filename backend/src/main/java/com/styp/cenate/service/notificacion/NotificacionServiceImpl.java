// ============================================================================
// 🔔 NotificacionServiceImpl.java – Implementación de Notificaciones
// ----------------------------------------------------------------------------
// Lógica de negocio para notificaciones del sistema
// ============================================================================

package com.styp.cenate.service.notificacion;

import com.styp.cenate.dto.NotificacionResponse;
import com.styp.cenate.model.PersonalCnt;
import com.styp.cenate.repository.PersonalCntRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificacionServiceImpl implements NotificacionService {

    private final PersonalCntRepository personalCntRepository;

    @Override
    public List<NotificacionResponse> obtenerCumpleanosHoy() {
        log.info("🎂 Buscando médicos que cumplen años hoy");

        LocalDate hoy = LocalDate.now();
        int diaHoy = hoy.getDayOfMonth();
        int mesHoy = hoy.getMonthValue();

        log.info("📅 Fecha de hoy: {}/{}", diaHoy, mesHoy);

        // Obtener personal médico activo
        List<PersonalCnt> personalMedico = personalCntRepository.findAll().stream()
                .filter(p -> p.getStatPers() != null &&
                           (p.getStatPers().equalsIgnoreCase("A") ||
                            p.getStatPers().equalsIgnoreCase("ACTIVO")))
                .filter(p -> p.getFechNaciPers() != null)
                .filter(p -> {
                    LocalDate fechaNac = p.getFechNaciPers();
                    return fechaNac.getDayOfMonth() == diaHoy &&
                           fechaNac.getMonthValue() == mesHoy;
                })
                .collect(Collectors.toList());

        log.info("✅ Encontrados {} cumpleaños para hoy", personalMedico.size());

        // Convertir a NotificacionResponse
        return personalMedico.stream()
                .map(this::convertirACumpleanos)
                .collect(Collectors.toList());
    }

    @Override
    public int contarCumpleanosHoy() {
        return obtenerCumpleanosHoy().size();
    }

    /**
     * Convierte PersonalCnt a NotificacionResponse de cumpleaños
     */
    private NotificacionResponse convertirACumpleanos(PersonalCnt personal) {
        // Calcular edad
        int edad = LocalDate.now().getYear() - personal.getFechNaciPers().getYear();

        // Construir nombre completo
        String nombreCompleto = String.format("%s %s %s",
                personal.getNomPers() != null ? personal.getNomPers() : "",
                personal.getApePaterPers() != null ? personal.getApePaterPers() : "",
                personal.getApeMaterPers() != null ? personal.getApeMaterPers() : ""
        ).trim();

        // Formatear fecha
        String fechaFormateada = personal.getFechNaciPers()
                .format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));

        return NotificacionResponse.builder()
                .tipo("CUMPLEANOS")
                .titulo("¡Feliz Cumpleaños! 🎂")
                .mensaje(String.format("%s cumple %d años hoy", nombreCompleto, edad))
                .idPersonal(personal.getIdPers())
                .nombreCompleto(nombreCompleto)
                .profesion(obtenerProfesion(personal))
                .fecha(personal.getFechNaciPers())
                .fotoUrl(personal.getFotoPers())
                .icono("🎂")
                .build();
    }

    /**
     * Obtiene la profesión del personal (simplificado)
     */
    private String obtenerProfesion(PersonalCnt personal) {
        // TODO: Integrar con dim_personal_prof si es necesario
        return "Personal médico";
    }
}
