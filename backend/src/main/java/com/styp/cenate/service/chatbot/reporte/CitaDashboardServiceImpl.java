package com.styp.cenate.service.chatbot.reporte;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.styp.cenate.dto.chatbot.reporte.CitaBusquedaDto;
import com.styp.cenate.dto.chatbot.reporte.DashboardKpiDto;
import com.styp.cenate.dto.chatbot.reporte.LabelTotalProjection;
import com.styp.cenate.dto.chatbot.reporte.LabelValueDto;
import com.styp.cenate.model.chatbot.VwSolicitudCitaDet;
import com.styp.cenate.repository.chatbot.reporte.VwSolicitudCitaDetRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CitaDashboardServiceImpl implements CitaDashboardService {

    private final VwSolicitudCitaDetRepository repo;

    @Override
    public DashboardKpiDto kpis(LocalDate fi, LocalDate ff, String areaHosp, String servicio) {
        Object[] row = repo.kpis(fi, ff, areaHosp, servicio);

        // row : total, hoy, atendidas, canceladas, pendientes
        long total = ((Number) row[0]).longValue();
        long hoy = ((Number) row[1]).longValue();
        long atendidas = ((Number) row[2]).longValue();
        long canceladas = ((Number) row[3]).longValue();
        long pendientes = ((Number) row[4]).longValue();

        return new DashboardKpiDto(total, hoy, atendidas, canceladas, pendientes);
    }

    @Override
    public List<LabelValueDto> estadoPaciente(LocalDate fi, LocalDate ff, String areaHosp, String servicio) {
        return map(repo.estadoPaciente(fi, ff, areaHosp, servicio));
    }

    @Override
    public List<LabelValueDto> topServicios(LocalDate fi, LocalDate ff, String areaHosp) {
        return map(repo.topServicios(fi, ff, areaHosp));
    }

    @Override
    public List<LabelValueDto> evolucion(LocalDate fi, LocalDate ff, String areaHosp, String servicio) {
        return map(repo.evolucion(fi, ff, areaHosp, servicio));
    }

    @Override
    public List<LabelValueDto> topProfesionales(LocalDate fi, LocalDate ff, String areaHosp, String servicio) {
        return map(repo.topProfesionales(fi, ff, areaHosp, servicio));
    }

    @Override
    public List<CitaBusquedaDto> buscar(LocalDate fi, LocalDate ff, String periodo, String docPaciente, String numDocPers,
                                       String areaHosp, String servicio, String estadoPaciente) {

        List<VwSolicitudCitaDet> list = repo.buscar(fi, ff, periodo, docPaciente, numDocPers, areaHosp, servicio, estadoPaciente);

        return list.stream().map(v -> {
            CitaBusquedaDto dto = new CitaBusquedaDto();
            dto.setIdSolicitud(v.getIdSolicitud());
            dto.setPeriodo(v.getPeriodo());

            dto.setProfesional(v.getProfesional());
            dto.setNumDocPers(v.getNumDocPers());

            dto.setAreaHospitalaria(v.getAreaHospitalaria());

            dto.setIdServicio(v.getIdServicio());
            dto.setCodServicio(v.getCodServicio());
            dto.setDescServicio(v.getDescServicio());

            dto.setDescActividad(v.getDescActividad());
            dto.setDescSubactividad(v.getDescSubactividad());

            dto.setFechaCita(v.getFechaCita());
            dto.setHoraCita(v.getHoraCita());

            dto.setDocPaciente(v.getDocPaciente());
            dto.setNombresPaciente(v.getNombresPaciente());

            dto.setDescEstadoPaciente(v.getDescEstadoPaciente());
            dto.setFechaSolicitud(v.getFechaSolicitud());
            dto.setDescEstadoBackoffice(v.getDescEstadoBackoffice());

            dto.setBloqueaSlot(v.getBloqueaSlot());
            dto.setEsFinal(v.getEsFinal());
            return dto;
        }).toList();
    }

    private List<LabelValueDto> map(List<LabelTotalProjection> rows){
        return rows.stream()
                .map(r -> new LabelValueDto(r.getLabel(), r.getTotal() == null ? 0 : r.getTotal()))
                .toList();
    }
}
