package com.styp.cenate.dto.chatbot.reporte;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DashboardKpiDto {
    private long total;
    private long hoy;
    private long atendidas;
    private long canceladas;
    private long pendientes;
}
