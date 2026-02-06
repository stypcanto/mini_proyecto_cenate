package com.styp.cenate.utils;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

/**
 * Utilidad para generar mensajes de cita formateados para pacientes
 * Formato: Mensaje completo con emojis, datos médicos y legalese
 *
 * @version v1.0.0 (2026-02-06)
 * @since 2026-02-06
 */
public class MensajeCitaFormatter {

    // Locales y formatos
    private static final Locale LOCALE_PE = new Locale("es", "PE");
    private static final DateTimeFormatter FECHA_FORMATTER =
        DateTimeFormatter.ofPattern("EEEE, dd 'de' MMMM", LOCALE_PE);
    private static final DateTimeFormatter HORA_FORMATTER =
        DateTimeFormatter.ofPattern("HH:mm", LOCALE_PE);

    /**
     * Genera el mensaje completo de cita para enviar al paciente
     *
     * @param nombrePaciente    Nombre del paciente (ej: "HUAMAN ROMERO EZEQUIEL")
     * @param nombreMedico      Nombre del médico (ej: "Dr. ALEGRIA EDMUNDO")
     * @param especialidad      Especialidad (ej: "MED.INTERNA")
     * @param fechaAtencion     Fecha de la cita (ej: 2026-02-07)
     * @param horaAtencion      Hora de inicio (ej: 10:00)
     * @param horaFin           Hora de fin (ej: 11:55) - opcional
     * @return                  Mensaje formateado con emojis y legalese
     */
    public static String generarMensajeCita(
            String nombrePaciente,
            String nombreMedico,
            String especialidad,
            LocalDate fechaAtencion,
            LocalTime horaAtencion,
            LocalTime horaFin) {

        // Calcular hora fin si no se proporciona (30 minutos después)
        if (horaFin == null) {
            horaFin = horaAtencion.plusMinutes(55);
        }

        // Formatear fecha en formato legible
        String fechaFormato = fechaAtencion.format(FECHA_FORMATTER);
        String horaInicio = horaAtencion.format(HORA_FORMATTER);
        String horaFinStr = horaFin.format(HORA_FORMATTER);

        // Capitalizar primer nombre del médico para la salutación formal
        String saludoMedico = formatearNombreMedico(nombreMedico);

        // Construir mensaje con formato profesional
        StringBuilder mensaje = new StringBuilder();

        mensaje.append("Estimado asegurado(a): ").append(nombrePaciente).append("\n");
        mensaje.append("Recuerde estar pendiente 30 minutos antes de su cita virtual:\n");
        mensaje.append("\n");

        // Datos de la cita con emojis
        mensaje.append("👩🏻 MEDICO/LICENCIADO: ").append(saludoMedico).append("\n");
        mensaje.append("⚕️ ESPECIALIDAD: ").append(especialidad).append("\n");
        mensaje.append("🗓️ DIA: ").append(fechaFormato).append("\n");
        mensaje.append("⏰ HORA REFERENCIAL: ").append(horaInicio).append(" a ").append(horaFinStr).append("\n");
        mensaje.append("\n");

        // Información legal
        mensaje.append("IMPORTANTE: Usted va a ser atendido por el Centro Nacional de Telemedicina (CENATE) - ESSALUD, ");
        mensaje.append("por su seguridad las atenciones están siendo grabadas.\n");
        mensaje.append("*Usted autoriza el tratamiento de sus datos personales afines a su atención por Telemedicina.\n");
        mensaje.append("*Recuerde que se le llamará hasta 24 horas antes para confirmar su cita.\n");
        mensaje.append("*Recuerde estar pendiente media hora antes de su cita.\n");
        mensaje.append("\n");

        // Teléfono de contacto
        mensaje.append("El profesional se comunicará con usted a través del siguiente número: 01 2118830\n");
        mensaje.append("\n");

        // Firma
        mensaje.append("Atte. Centro Nacional de Telemedicina\n");
        mensaje.append("CENATE de Essalud");

        return mensaje.toString();
    }

    /**
     * Sobrecarga simplificada: calcula hora fin automáticamente (55 minutos después)
     */
    public static String generarMensajeCita(
            String nombrePaciente,
            String nombreMedico,
            String especialidad,
            LocalDate fechaAtencion,
            LocalTime horaAtencion) {
        return generarMensajeCita(
            nombrePaciente,
            nombreMedico,
            especialidad,
            fechaAtencion,
            horaAtencion,
            null  // horaFin se calcula automáticamente
        );
    }

    /**
     * Formatea el nombre del médico agregando "Dr." o "Dra." según corresponda
     * Si ya tiene título, lo respeta
     */
    private static String formatearNombreMedico(String nombreMedico) {
        if (nombreMedico == null || nombreMedico.trim().isEmpty()) {
            return "Por asignar";
        }

        String nombre = nombreMedico.trim();

        // Si ya tiene título, devolverlo tal cual
        if (nombre.startsWith("Dr.") || nombre.startsWith("Dra.") ||
            nombre.startsWith("Dr ") || nombre.startsWith("Dra ")) {
            return nombre;
        }

        // Agregar título según género (si es posible inferir)
        // Por ahora asumimos "Dr." para mantener consistencia con tu ejemplo
        return "Dr. " + nombre;
    }

    /**
     * Versión para envío por WhatsApp (puede incluir formato especial)
     * Útil si necesitas agregar caracteres de formato de WhatsApp
     */
    public static String generarMensajeCitaWhatsApp(
            String nombrePaciente,
            String nombreMedico,
            String especialidad,
            LocalDate fechaAtencion,
            LocalTime horaAtencion,
            LocalTime horaFin) {

        // Por ahora, es igual al mensaje normal
        // Se puede customizar si WhatsApp requiere formato especial
        return generarMensajeCita(
            nombrePaciente,
            nombreMedico,
            especialidad,
            fechaAtencion,
            horaAtencion,
            horaFin
        );
    }

    /**
     * Genera solo la sección de datos de cita (sin encabezado ni legalese)
     * Útil para APIs que necesitan componentes modulares
     */
    public static String generarSeccionCita(
            String nombreMedico,
            String especialidad,
            LocalDate fechaAtencion,
            LocalTime horaAtencion,
            LocalTime horaFin) {

        if (horaFin == null) {
            horaFin = horaAtencion.plusMinutes(55);
        }

        String fechaFormato = fechaAtencion.format(FECHA_FORMATTER);
        String horaInicio = horaAtencion.format(HORA_FORMATTER);
        String horaFinStr = horaFin.format(HORA_FORMATTER);
        String saludoMedico = formatearNombreMedico(nombreMedico);

        StringBuilder seccion = new StringBuilder();
        seccion.append("👩🏻 MEDICO/LICENCIADO: ").append(saludoMedico).append("\n");
        seccion.append("⚕️ ESPECIALIDAD: ").append(especialidad).append("\n");
        seccion.append("🗓️ DIA: ").append(fechaFormato).append("\n");
        seccion.append("⏰ HORA REFERENCIAL: ").append(horaInicio).append(" a ").append(horaFinStr).append("\n");

        return seccion.toString();
    }
}
