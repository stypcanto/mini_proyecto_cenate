package com.styp.cenate.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;


public record AtencionDisponibilidadDTO(

        /** Clave única generada en la vista (text). */
        String pkDisponibilidad,

        /** Periodo de atención (yyyyMM). */
        String periodo,

        /** Área o unidad funcional. */
        String area,

        /** Nombre del servicio (ej. ENFERMERIA, MEDICINA INTERNA). */
        String servicio,

        /** Actividad principal asociada al servicio. */
        String actividad,

        /** Subactividad o detalle adicional. */
        String subactividad,

        /** Número de documento del personal profesional. */
        String numDocPers,

        /** Nombre completo del profesional. */
        String profesional,

        /** Turno asignado (Mañana, Tarde, Noche). */
        String turno,

        /** Fecha programada de la cita. */
        LocalDate fechaCita,

        /** Hora programada de la cita. */
        LocalTime horaCita,

        /** Estado de la atención o cita (ej. DISPONIBLE, OCUPADO). */
        String estado,

        /** Documento de identidad del paciente. */
        String docPaciente,

        /** Nombres completos del paciente. */
        String nombresPaciente,

        /** Sexo del paciente (M/F). */
        String sexo,

        /** Edad del paciente. */
        Integer edad,

        /** Teléfono del paciente (opcional). */
        String telefono,

        /** Fecha en que se registró la solicitud. */
        OffsetDateTime fechaSolicitud,

        /** Fecha en que se actualizó el registro. */
        OffsetDateTime fechaActualiza,

        /** ID del personal profesional. */
        Long idPers,

        /** ID del servicio (referencia a dim_servicio_essi). */
        Long idServicio,

        /** ID de la actividad. */
        Long idActividad,

        /** ID de la subactividad. */
        Long idSubactividad

) {}
