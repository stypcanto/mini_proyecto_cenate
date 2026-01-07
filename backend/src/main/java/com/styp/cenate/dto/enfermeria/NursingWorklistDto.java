package com.styp.cenate.dto.enfermeria;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NursingWorklistDto {
    private Long idOrigen; // ID de Atencion Medica o Cita
    private String tipoOrigen; // "MEDICINA_GENERAL" o "CITA"

    private String pacienteNombre;
    private String pacienteDni; // DNI limpio (sin sufijo de periodo)
    private String pkAsegurado; // PK completo con sufijo (para buscar historial)
    private Integer pacienteEdad;
    private String pacienteSexo;
    private String telefono; // Teléfono principal del paciente

    // Datos Clínicos
    private String diagnostico; // CIE-10 o descripción
    private String tipoAtencion; // "Seguimiento", "Primera Vez", etc.
    private LocalDateTime fechaBase; // Fecha Atención Médica o Fecha Cita

    // Alertas
    private boolean requiereTelemonitoreo;
    private boolean esCronico; // Si cuenta con etiqueta CENACRON

    // Estado Enfermería
    private String estadoEnfermeria; // "PENDIENTE", "ATENDIDO"

    // Semaforización (Solo si PENDIENTE)
    private Long diasTranscurridos;
    private String colorSemaforo; // VERDE, AMARILLO, ROJO, NEGRO

    // Datos si ya fue atendido
    private LocalDateTime fechaAtencionEnfermeria;
    private String usuarioEnfermera;
    
    // IPRESS del paciente
    private String nombreIpress;
}
