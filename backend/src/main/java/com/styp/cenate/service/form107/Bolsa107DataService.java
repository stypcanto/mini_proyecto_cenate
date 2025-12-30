package com.styp.cenate.service.form107;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.styp.cenate.repository.form107.Bolsa107ErrorRepository;
import com.styp.cenate.repository.form107.Bolsa107ItemRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class Bolsa107DataService {

	private final Bolsa107ItemRepository itemRepository;
	private final Bolsa107ErrorRepository errorRepository;

	public Map<String, Object> obtenerDatosCarga(Long idCarga) {
		Map<String, Object> resultado = new HashMap<>();

		// Obtener items
		List<Map<String, Object>> items = itemRepository.findAllByIdCarga(idCarga);
		resultado.put("items", items);
		resultado.put("total_items", items.size());

		// Obtener errores
		List<Map<String, Object>> errores = errorRepository.findAllByIdCarga(idCarga);
		resultado.put("errores", errores);
		resultado.put("total_errores", errores.size());

		return resultado;
	}
}