package styp.com.cenate.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO de respuesta para IPRESS (Instituciones Prestadoras de Servicios de Salud)
 * 
 * ⚠️ DTO ACTUALIZADO para coincidir con la estructura REAL de la base de datos
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IpressResponse {
    private Long idIpress;
    private String codIpress;
    private String descIpress;
    
    // Relaciones (IDs)
    private Long idRed;
    private Long idNivAten;
    private Long idModAten;
    private Long idTipIpress;
    private Long idDist;
    
    // Información geográfica
    private String direcIpress;
    private BigDecimal latIpress;
    private BigDecimal longIpress;
    private String gmapsUrlIpress;
    
    // Estado y auditoría
    private String statIpress;
    private LocalDateTime createAt;
    private LocalDateTime updateAt;
    
    /**
     * Verifica si la IPRESS está activa
     */
    public boolean isActiva() {
        return "A".equalsIgnoreCase(statIpress);
    }
}
