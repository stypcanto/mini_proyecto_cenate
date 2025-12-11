package com.styp.cenate.repository.chatbot;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.styp.cenate.model.chatbot.VwSlotsDisponiblesChatbot;

public interface VwSlotsDisponiblesChatbotRepository
        extends JpaRepository<VwSlotsDisponiblesChatbot, String> {

    List<VwSlotsDisponiblesChatbot> findByFechaCitaAndCodServicio(
            LocalDate fechaCita,
            String codServicio
    );
}
