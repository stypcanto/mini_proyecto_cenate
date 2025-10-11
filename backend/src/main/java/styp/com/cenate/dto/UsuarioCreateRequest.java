package styp.com.cenate.dto;

import lombok.Data;

import java.util.Set;

@Data
public class UsuarioCreateRequest {

    private String username;
    private String password;
    private String estado;
    private Set<Integer> roleIds; // Ids de los roles asignados
}
