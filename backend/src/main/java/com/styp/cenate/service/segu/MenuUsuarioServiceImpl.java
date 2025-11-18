package com.styp.cenate.service.segu;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.styp.cenate.dto.segu.MenuUsuarioDTO;
import com.styp.cenate.dto.segu.MenuUsuarioProjection;
import com.styp.cenate.dto.segu.PaginaMenuDTO;
import com.styp.cenate.repository.segu.MenuUsuarioRepository;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class MenuUsuarioServiceImpl implements MenuUsuarioService {

	private final MenuUsuarioRepository repositorioMenu;
	private final ObjectMapper mapper;

	public MenuUsuarioServiceImpl(MenuUsuarioRepository repositorioMenu, ObjectMapper mapper) {
		this.repositorioMenu = repositorioMenu;
		this.mapper = mapper;
	}

	@Override
	public List<MenuUsuarioDTO> obtenerMenuUsuario(Long idUser) {

		List<MenuUsuarioProjection> filas = repositorioMenu.obtenerMenuPorUsuario(idUser);
		List<MenuUsuarioDTO> resultado = new ArrayList<>();
		for (MenuUsuarioProjection fila : filas) {

			List<PaginaMenuDTO> paginas = parsePaginas(fila.getPaginas());

			MenuUsuarioDTO dto = new MenuUsuarioDTO(fila.getIdModulo(), fila.getNombreModulo(), fila.getDescripcion(),
					fila.getDescripcion(), fila.getRutaBase(), fila.getOrden(), paginas);
			resultado.add(dto);
		}
		return resultado;
	}

	@Override
	public List<PaginaMenuDTO> parsePaginas(String json) {

		List<PaginaMenuDTO> paginas = new ArrayList<>();
		if (json == null || json.isBlank())
			return paginas;

		try {
			JsonNode jsonNodo = mapper.readTree(json);

			for (JsonNode nodo : jsonNodo) {
				PaginaMenuDTO pagina = new PaginaMenuDTO(

						nodo.path("ruta").asText(null),
						nodo.path("orden").isMissingNode() ? null : nodo.path("orden").asInt(),
						nodo.path("nombre").asText(null),
						nodo.path("id_pagina").isMissingNode() ? null : nodo.path("id_pagina").asInt(),
						nodo.path("puede_ver").asBoolean(false), 
						nodo.path("puede_crear").asBoolean(false),
						nodo.path("puede_editar").asBoolean(false), 
						nodo.path("puede_eliminar").asBoolean(false),
						nodo.path("puede_exportar").asBoolean(false)

				);
				paginas.add(pagina);
			}

		} catch (Exception e) {
			log.error("parsePaginas()- Error : Error parseando el Json");
		}
		return paginas;
	}

}
