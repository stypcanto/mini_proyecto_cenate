package com.styp.cenate.dto.chatbot.reporte;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LabelValueDto {
    private String label;
    private long total;
}
