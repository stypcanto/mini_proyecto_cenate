package com.styp.cenate.repository.segu;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.styp.cenate.dto.segu.MenuUsuarioProjection;
import com.styp.cenate.model.segu.MenuUsuario;

public interface MenuUsuarioRepository 
	extends JpaRepository<MenuUsuario, Long>
{
	
	@Query(
			value = """
			select  id_modulo as idModulo,
					nombre_modulo as nombreModulo,
					descripcion as descripcion,
					icono as icono,
					ruta_base as rutaBase,
					orden as orden,
					paginas as paginas
					from public.fn_seguridad_obtener_menu_usuario_vf(:idUser)
					""",
					nativeQuery = true
			)
	List<MenuUsuarioProjection> obtenerMenuPorUsuario(@Param("idUser") Long idUser);

}
