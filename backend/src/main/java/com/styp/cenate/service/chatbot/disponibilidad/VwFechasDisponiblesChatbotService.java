package com.styp.cenate.service.chatbot.disponibilidad;

import java.util.List;

import org.springframework.stereotype.Service;

import com.styp.cenate.dto.chatbot.VwFechasDisponiblesChatbotDto;
import com.styp.cenate.model.chatbot.VwFechasDisponiblesChatbot;
import com.styp.cenate.repository.chatbot.VwFechasDisponiblesChatbotRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class VwFechasDisponiblesChatbotService {

    private final VwFechasDisponiblesChatbotRepository repo;

    public List<VwFechasDisponiblesChatbotDto> buscar(Integer idServicio, String codServicio) {

        List<VwFechasDisponiblesChatbot> lista;

        if (idServicio != null && codServicio != null) {
            lista = repo.findByIdServicioAndCodServicio(idServicio, codServicio);
        } else if (idServicio != null) {
            lista = repo.findByIdServicio(idServicio);
        } else if (codServicio != null) {
            lista = repo.findByCodServicio(codServicio);
        } else {
            lista = repo.findAll(); 
        }

        return lista.stream()
                .map(this::toDto)
                .toList();
    }

    private VwFechasDisponiblesChatbotDto toDto(VwFechasDisponiblesChatbot entity) {
        VwFechasDisponiblesChatbotDto dto = new VwFechasDisponiblesChatbotDto();
        dto.setPkFecha(entity.getPkFecha());
        dto.setPeriodo(entity.getPeriodo());
        dto.setIdServicio(entity.getIdServicio());
        dto.setServicio(entity.getServicio());
        dto.setFechaCita(entity.getFechaCita());
        dto.setIdTipTurno(entity.getIdTipTurno());
        dto.setTipoTurno(entity.getTipoTurno());
        dto.setDescTipTurno(entity.getDescTipTurno());
        dto.setCodServicio(entity.getCodServicio());
        return dto;
    }
}
