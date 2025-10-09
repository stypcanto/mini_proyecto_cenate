package styp.com.cenate.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegimenLaboralResponse {
    private Long idRegLab;
    private String descRegLab;
    private String statRegLab;
    private LocalDateTime createAt;
    private LocalDateTime updateAt;
}
