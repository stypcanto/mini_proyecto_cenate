package com.styp.cenate.dto.enfermeria;

import java.time.LocalDateTime;
import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NursingAttendRequest {

    private Long idPaciente;

    // Origen (Uno de los dos debe venir)
    private Long idAtencionMedicaRef;
    private Long idCitaRef;

    private String motivoConsulta;
    private String observaciones;

    // Signos Vitales (JSON)
    // { "pa": "120/80", "fc": 72, "spo2": 98, "temp": 36.5, "peso": 70, "talla":
    // 170 }
    private Map<String, Object> signosVitales;

    private Long idUsuarioEnfermera; // ID del personal que atiende

    // Interconsulta
    private boolean derivaInterconsulta;
    private String especialidadInterconsulta;
    private String motivoInterconsulta;
}
