package com.styp.cenate.api.chatbot;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.styp.cenate.dto.chatbot.reporte.CitaBusquedaDto;
import com.styp.cenate.dto.chatbot.reporte.DashboardKpiDto;
import com.styp.cenate.dto.chatbot.reporte.LabelValueDto;
import com.styp.cenate.service.chatbot.reporte.CitaDashboardService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/chatbot/reportes")
@RequiredArgsConstructor
public class CitaDashboardController {

    private final CitaDashboardService service;

    // ---------- DASHBOARD ----------
    @GetMapping("/dashboard/kpis")
    public DashboardKpiDto kpis(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fi,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate ff,
            @RequestParam(required = false) String areaHosp,
            @RequestParam(required = false) String servicio
    ) {
        return service.kpis(fi, ff, areaHosp, servicio);
    }

    @GetMapping("/dashboard/estado-paciente")
    public List<LabelValueDto> estadoPaciente(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fi,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate ff,
            @RequestParam(required = false) String areaHosp,
            @RequestParam(required = false) String servicio
    ) {
        return service.estadoPaciente(fi, ff, areaHosp, servicio);
    }

    @GetMapping("/dashboard/top-servicios")
    public List<LabelValueDto> topServicios(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fi,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate ff,
            @RequestParam(required = false) String areaHosp
    ) {
        return service.topServicios(fi, ff, areaHosp);
    }

    @GetMapping("/dashboard/evolucion")
    public List<LabelValueDto> evolucion(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fi,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate ff,
            @RequestParam(required = false) String areaHosp,
            @RequestParam(required = false) String servicio
    ) {
        return service.evolucion(fi, ff, areaHosp, servicio);
    }

    @GetMapping("/dashboard/top-profesionales")
    public List<LabelValueDto> topProfesionales(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fi,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate ff,
            @RequestParam(required = false) String areaHosp,
            @RequestParam(required = false) String servicio
    ) {
        return service.topProfesionales(fi, ff, areaHosp, servicio);
    }

    // ---------- BÚSQUEDA ----------
    @GetMapping("/citas/buscar")
    public List<CitaBusquedaDto> buscar(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fi,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate ff,
            @RequestParam(required = false) String periodo,
            @RequestParam(required = false) String docPaciente,
            @RequestParam(required = false) String numDocPers,
            @RequestParam(required = false) String areaHosp,
            @RequestParam(required = false) String servicio,
            @RequestParam(required = false) String estadoPaciente
    ) {
        return service.buscar(fi, ff, periodo, docPaciente, numDocPers, areaHosp, servicio, estadoPaciente);
    }
}
