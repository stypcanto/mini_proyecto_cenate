package com.styp.cenate.service.chatbot;

import org.springframework.stereotype.Service;

import com.styp.cenate.dto.ChatBotDocumentoDTO;
import com.styp.cenate.exception.AseguradoNoEncontradoException;
import com.styp.cenate.mapper.AseguradoMapper;
import com.styp.cenate.repository.AseguradoRepository;
import com.styp.cenate.utils.ConstantesMensajes;

@Service
public class ChatBotServiceImpl implements IChatBotService {

	private final AseguradoRepository repositorioAsegurado;

	public ChatBotServiceImpl(AseguradoRepository repositorioAsegurado) {
		this.repositorioAsegurado = repositorioAsegurado;
	}

	@Override
	public ChatBotDocumentoDTO consultarPaciente(String documento) {
		if (documento == null || documento.isBlank()) {
			throw new IllegalArgumentException(ConstantesMensajes.MENSAJE_CHATBOT_RPTA_DNI_OBLIGATORIO);
		}

		var dataAsegurado = repositorioAsegurado.findByDocPaciente(documento);
		if (dataAsegurado.isPresent()) {
			return AseguradoMapper.toDto(dataAsegurado.get());
		} else {
			throw new AseguradoNoEncontradoException(ConstantesMensajes.MENSAJE_CHATBOT_RPTA_DNI_NOT_FOUND);
		}
	}

}
