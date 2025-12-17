package com.styp.cenate.service.chatbot.reporte;

import java.time.LocalDate;
import java.util.List;

import com.styp.cenate.dto.chatbot.reporte.CitaBusquedaDto;
import com.styp.cenate.dto.chatbot.reporte.DashboardKpiDto;
import com.styp.cenate.dto.chatbot.reporte.LabelValueDto;

public interface CitaDashboardService {

    DashboardKpiDto kpis(LocalDate fi, LocalDate ff, String areaHosp, String servicio);

    List<LabelValueDto> estadoPaciente(LocalDate fi, LocalDate ff, String areaHosp, String servicio);

    List<LabelValueDto> topServicios(LocalDate fi, LocalDate ff, String areaHosp);

    List<LabelValueDto> evolucion(LocalDate fi, LocalDate ff, String areaHosp, String servicio);

    List<LabelValueDto> topProfesionales(LocalDate fi, LocalDate ff, String areaHosp, String servicio);

    List<CitaBusquedaDto> buscar(LocalDate fi, LocalDate ff, String periodo, String docPaciente, String numDocPers,
                                 String areaHosp, String servicio, String estadoPaciente);
}
