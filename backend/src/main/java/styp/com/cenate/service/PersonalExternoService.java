package styp.com.cenate.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import styp.com.cenate.dto.PersonalExternoRequest;
import styp.com.cenate.dto.PersonalExternoResponse;
import styp.com.cenate.dto.TipoDocumentoResponse;
import styp.com.cenate.model.PersonalExterno;
import styp.com.cenate.model.TipoDocumento;
import styp.com.cenate.repository.PersonalExternoRepository;
import styp.com.cenate.repository.TipoDocumentoRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PersonalExternoService {
    
    private final PersonalExternoRepository personalExternoRepository;
    private final TipoDocumentoRepository tipoDocumentoRepository;
    
    @Transactional(readOnly = true)
    public List<PersonalExternoResponse> getAllPersonalExterno() {
        log.info("Obteniendo todo el personal externo");
        return personalExternoRepository.findAll().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public PersonalExternoResponse getPersonalExternoById(Integer id) {
        log.info("Obteniendo personal externo con ID: {}", id);
        PersonalExterno personal = personalExternoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Personal externo no encontrado"));
        return convertToResponse(personal);
    }
    
    @Transactional
    public PersonalExternoResponse createPersonalExterno(PersonalExternoRequest request) {
        log.info("Creando nuevo personal externo: {} {}", request.getNomExt(), request.getApePaterExt());
        
        // Validar que el número de documento no exista
        if (personalExternoRepository.existsByNumDocExt(request.getNumDocExt())) {
            throw new RuntimeException("Ya existe personal externo con ese número de documento");
        }
        
        TipoDocumento tipoDoc = tipoDocumentoRepository.findById(request.getIdTipDoc())
                .orElseThrow(() -> new RuntimeException("Tipo de documento no encontrado"));
        
        PersonalExterno personal = PersonalExterno.builder()
                .tipoDocumento(tipoDoc)
                .numDocExt(request.getNumDocExt())
                .nomExt(request.getNomExt())
                .apePaterExt(request.getApePaterExt())
                .apeMaterExt(request.getApeMaterExt())
                .fechNaciExt(request.getFechNaciExt())
                .genExt(request.getGenExt())
                .movilExt(request.getMovilExt())
                .emailExt(request.getEmailExt())
                .emailCorpExt(request.getEmailCorpExt())
                .instExt(request.getInstExt())
                .idUsuario(request.getIdUsuario())
                .build();
        
        PersonalExterno saved = personalExternoRepository.save(personal);
        log.info("Personal externo creado exitosamente con ID: {}", saved.getIdPersExt());
        return convertToResponse(saved);
    }
    
    @Transactional
    public PersonalExternoResponse updatePersonalExterno(Integer id, PersonalExternoRequest request) {
        log.info("Actualizando personal externo con ID: {}", id);
        
        PersonalExterno personal = personalExternoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Personal externo no encontrado"));
        
        // Validar número de documento si cambió
        if (!personal.getNumDocExt().equals(request.getNumDocExt())) {
            if (personalExternoRepository.existsByNumDocExt(request.getNumDocExt())) {
                throw new RuntimeException("Ya existe personal externo con ese número de documento");
            }
        }
        
        TipoDocumento tipoDoc = tipoDocumentoRepository.findById(request.getIdTipDoc())
                .orElseThrow(() -> new RuntimeException("Tipo de documento no encontrado"));
        
        personal.setTipoDocumento(tipoDoc);
        personal.setNumDocExt(request.getNumDocExt());
        personal.setNomExt(request.getNomExt());
        personal.setApePaterExt(request.getApePaterExt());
        personal.setApeMaterExt(request.getApeMaterExt());
        personal.setFechNaciExt(request.getFechNaciExt());
        personal.setGenExt(request.getGenExt());
        personal.setMovilExt(request.getMovilExt());
        personal.setEmailExt(request.getEmailExt());
        personal.setEmailCorpExt(request.getEmailCorpExt());
        personal.setInstExt(request.getInstExt());
        personal.setIdUsuario(request.getIdUsuario());
        
        PersonalExterno updated = personalExternoRepository.save(personal);
        log.info("Personal externo actualizado exitosamente");
        return convertToResponse(updated);
    }
    
    @Transactional
    public void deletePersonalExterno(Integer id) {
        log.info("Eliminando personal externo con ID: {}", id);
        if (!personalExternoRepository.existsById(id)) {
            throw new RuntimeException("Personal externo no encontrado");
        }
        personalExternoRepository.deleteById(id);
        log.info("Personal externo eliminado exitosamente");
    }
    
    @Transactional(readOnly = true)
    public List<PersonalExternoResponse> searchPersonalExterno(String searchTerm) {
        log.info("Buscando personal externo con término: {}", searchTerm);
        return personalExternoRepository.findByNomExtContainingIgnoreCaseOrApePaterExtContainingIgnoreCaseOrApeMaterExtContainingIgnoreCase(
                searchTerm, searchTerm, searchTerm)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    private PersonalExternoResponse convertToResponse(PersonalExterno personal) {
        PersonalExternoResponse.PersonalExternoResponseBuilder builder = PersonalExternoResponse.builder()
                .idPersExt(personal.getIdPersExt())
                .numDocExt(personal.getNumDocExt())
                .nomExt(personal.getNomExt())
                .apePaterExt(personal.getApePaterExt())
                .apeMaterExt(personal.getApeMaterExt())
                .nombreCompleto(personal.getNombreCompleto())
                .fechNaciExt(personal.getFechNaciExt())
                .genExt(personal.getGenExt())
                .movilExt(personal.getMovilExt())
                .emailExt(personal.getEmailExt())
                .emailCorpExt(personal.getEmailCorpExt())
                .instExt(personal.getInstExt())
                .idUsuario(personal.getIdUsuario())
                .createAt(personal.getCreateAt())
                .updateAt(personal.getUpdateAt());
        
        if (personal.getTipoDocumento() != null) {
            TipoDocumentoResponse tipoDocResp = TipoDocumentoResponse.builder()
                    .idTipDoc(personal.getTipoDocumento().getIdTipDoc())
                    .descTipDoc(personal.getTipoDocumento().getDescTipDoc())
                    .statTipDoc(personal.getTipoDocumento().getStatTipDoc())
                    .build();
            builder.tipoDocumento(tipoDocResp);
        }
        
        return builder.build();
    }
}
