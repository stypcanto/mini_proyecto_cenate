package com.styp.cenate.mapper;

import com.styp.cenate.dto.AseguradoDTO;
import com.styp.cenate.dto.ChatBotDocumentoDTO;
import com.styp.cenate.model.Asegurado;

import java.time.LocalDate;
import java.time.Period;

public class AseguradoMapper {
	
	/**
	 * Convierte una entidad Asegurado a DTO para el chatbot
	 */
	public static ChatBotDocumentoDTO toDto(Asegurado asegurado) {
		return new ChatBotDocumentoDTO(
			asegurado.getDocPaciente(), 
			asegurado.getPaciente(), 
			asegurado.getSexo(),
			asegurado.getFecnacimpaciente(),
			asegurado.getTelFijo()
		);	
	}
	
	/**
	 * Calcula la edad a partir de la fecha de nacimiento
	 * @param fechaNacimiento Fecha de nacimiento del paciente
	 * @return Edad en años, o null si la fecha es nula
	 */
	private static Integer calcularEdad(LocalDate fechaNacimiento) {
		if (fechaNacimiento == null) {
			return null;
		}
		return Period.between(fechaNacimiento, LocalDate.now()).getYears();
	}
	
	/**
	 * Convierte una entidad Asegurado a AseguradoDTO completo
	 */
	public static AseguradoDTO toAseguradoDTO(Asegurado asegurado) {
		return AseguradoDTO.builder()
			.pkAsegurado(asegurado.getPkAsegurado())
			.docPaciente(asegurado.getDocPaciente())
			.paciente(asegurado.getPaciente())
			.fecnacimpaciente(asegurado.getFecnacimpaciente())
			.edad(calcularEdad(asegurado.getFecnacimpaciente()))  // ✅ Cálculo de edad
			.sexo(asegurado.getSexo())
			.tipoPaciente(asegurado.getTipoPaciente())
			.telFijo(asegurado.getTelFijo())
			.tipoSeguro(asegurado.getTipoSeguro())
			.casAdscripcion(asegurado.getCasAdscripcion())
			.periodo(asegurado.getPeriodo())
			.build();
	}
	
	/**
	 * Convierte un AseguradoDTO a entidad Asegurado
	 */
	public static Asegurado toEntity(AseguradoDTO dto) {
		Asegurado asegurado = new Asegurado();
		asegurado.setPkAsegurado(dto.getPkAsegurado());
		asegurado.setDocPaciente(dto.getDocPaciente());
		asegurado.setPaciente(dto.getPaciente());
		asegurado.setFecnacimpaciente(dto.getFecnacimpaciente());
		asegurado.setSexo(dto.getSexo());
		asegurado.setTipoPaciente(dto.getTipoPaciente());
		asegurado.setTelFijo(dto.getTelFijo());
		asegurado.setTipoSeguro(dto.getTipoSeguro());
		asegurado.setCasAdscripcion(dto.getCasAdscripcion());
		asegurado.setPeriodo(dto.getPeriodo());
		return asegurado;
	}
}
