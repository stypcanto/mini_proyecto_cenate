package styp.com.cenate.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AreaResponse {
    private Long idArea;
    private String descArea;
    private String statArea;
    private LocalDateTime createAt;
    private LocalDateTime updateAt;
}
