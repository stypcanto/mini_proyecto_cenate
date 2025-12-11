package com.styp.cenate.repository.chatbot;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.styp.cenate.model.chatbot.VwFechasDisponiblesChatbot;

public interface VwFechasDisponiblesChatbotRepository extends JpaRepository<VwFechasDisponiblesChatbot, String> {

	List<VwFechasDisponiblesChatbot> findByIdServicio(Integer idServicio);

	List<VwFechasDisponiblesChatbot> findByCodServicio(String codServicio);

	List<VwFechasDisponiblesChatbot> findByIdServicioAndCodServicio(Integer idServicio, String codServicio);
}
