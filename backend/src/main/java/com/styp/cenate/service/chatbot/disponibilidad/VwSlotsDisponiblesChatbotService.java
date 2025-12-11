package com.styp.cenate.service.chatbot.disponibilidad;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.styp.cenate.dto.chatbot.VwSlotsDisponiblesChatbotDto;
import com.styp.cenate.model.chatbot.VwSlotsDisponiblesChatbot;
import com.styp.cenate.repository.chatbot.VwSlotsDisponiblesChatbotRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class VwSlotsDisponiblesChatbotService {

    private final VwSlotsDisponiblesChatbotRepository repo;

    public List<VwSlotsDisponiblesChatbotDto> buscarPorFechaYCodServicio(
            LocalDate fechaCita,
            String codServicio
    ) {
        // aquí se asume que ambos son obligatorios, ya validados en el controller
        return repo.findByFechaCitaAndCodServicio(fechaCita, codServicio)
                   .stream()
                   .map(this::toDto)
                   .toList();
    }

    private VwSlotsDisponiblesChatbotDto toDto(VwSlotsDisponiblesChatbot e) {
        VwSlotsDisponiblesChatbotDto dto = new VwSlotsDisponiblesChatbotDto();
        dto.setPkSlot(e.getPkSlot());
        dto.setPeriodo(e.getPeriodo());
        dto.setIdAreaHosp(e.getIdAreaHosp());
        dto.setArea(e.getArea());
        dto.setIdServicio(e.getIdServicio());
        dto.setServicio(e.getServicio());
        dto.setIdActividad(e.getIdActividad());
        dto.setActividad(e.getActividad());
        dto.setIdSubactividad(e.getIdSubactividad());
        dto.setSubactividad(e.getSubactividad());
        dto.setIdTipTurno(e.getIdTipTurno());
        dto.setTipoTurno(e.getTipoTurno());
        dto.setIdPers(e.getIdPers());
        dto.setNumDocPers(e.getNumDocPers());
        dto.setProfesional(e.getProfesional());
        dto.setTurno(e.getTurno());
        dto.setFechaCita(e.getFechaCita());
        dto.setHoraCita(e.getHoraCita());
        dto.setCodServicio(e.getCodServicio());
        return dto;
    }
}
