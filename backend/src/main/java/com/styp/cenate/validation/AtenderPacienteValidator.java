package com.styp.cenate.validation;

import com.styp.cenate.dto.AtenderPacienteRequest;
import org.springframework.stereotype.Component;
import org.springframework.validation.Errors;
import org.springframework.validation.Validator;

/**
 * ✅ v1.47.0: Validación condicional para AtenderPacienteRequest
 * - Especialidad solo requerida si tieneInterconsulta es true
 * - Enfermedades opcionales si esCronico es true
 */
@Component
public class AtenderPacienteValidator implements Validator {

    @Override
    public boolean supports(Class<?> clazz) {
        return AtenderPacienteRequest.class.isAssignableFrom(clazz);
    }

    @Override
    public void validate(Object target, Errors errors) {
        AtenderPacienteRequest request = (AtenderPacienteRequest) target;

        // ✅ Validación condicional: Especialidad solo si tieneInterconsulta es true
        if (Boolean.TRUE.equals(request.getTieneInterconsulta())) {
            if (request.getInterconsultaEspecialidad() == null ||
                request.getInterconsultaEspecialidad().isBlank()) {
                errors.rejectValue("interconsultaEspecialidad",
                    "validation.interconsulta.especialidad.required",
                    "Especialidad requerida para interconsulta");
            }
        }

        // ✅ Validación condicional: Enfermedades solo si esCronico es true
        if (Boolean.TRUE.equals(request.getEsCronico())) {
            if (request.getEnfermedades() == null || request.getEnfermedades().isEmpty()) {
                errors.rejectValue("enfermedades",
                    "validation.cronico.enfermedades.required",
                    "Debe seleccionar al menos una enfermedad crónica");
            }
        }
    }
}
