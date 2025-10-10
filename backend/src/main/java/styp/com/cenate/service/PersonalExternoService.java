package styp.com.cenate.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import styp.com.cenate.dto.IpressResponse;
import styp.com.cenate.dto.PersonalExternoRequest;
import styp.com.cenate.dto.PersonalExternoResponse;
import styp.com.cenate.dto.TipoDocumentoResponse;
import styp.com.cenate.model.Ipress;
import styp.com.cenate.model.PersonalExterno;
import styp.com.cenate.model.TipoDocumento;
import styp.com.cenate.repository.IpressRepository;
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
    private final IpressRepository ipressRepository;
    
    @Transactional(readOnly = true)
    public List<PersonalExternoResponse> getAllPersonalExterno() {
        log.info("Obteniendo todo el personal externo");
        return personalExternoRepository.findAll().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public PersonalExternoResponse getPersonalExternoById(Long id) {
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
        
        PersonalExterno.PersonalExternoBuilder personalBuilder = PersonalExterno.builder()
                .tipoDocumento(tipoDoc)
                .numDocExt(request.getNumDocExt())
                .nomExt(request.getNomExt())
                .apePaterExt(request.getApePaterExt())
                .apeMaterExt(request.getApeMaterExt())
                .fechNaciExt(request.getFechNaciExt())
                .genExt(request.getGenExt())
                .movilExt(request.getMovilExt())
                .emailPersExt(request.getEmailPersExt())
                .idUser(request.getIdUser());
        
        // Asignar IPRESS si se proporciona
        if (request.getIdIpress() != null) {
            Ipress ipress = ipressRepository.findById(request.getIdIpress())
                    .orElseThrow(() -> new RuntimeException("IPRESS no encontrada con ID: " + request.getIdIpress()));
            personalBuilder.ipress(ipress);
        }
        
        PersonalExterno personal = personalBuilder.build();
        PersonalExterno saved = personalExternoRepository.save(personal);
        
        log.info("Personal externo creado exitosamente con ID: {}", saved.getIdPersExt());
        return convertToResponse(saved);
    }
    
    @Transactional
    public PersonalExternoResponse updatePersonalExterno(Long id, PersonalExternoRequest request) {
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
        personal.setEmailPersExt(request.getEmailPersExt());
        personal.setIdUser(request.getIdUser());
        
        // Actualizar IPRESS
        if (request.getIdIpress() != null) {
            Ipress ipress = ipressRepository.findById(request.getIdIpress())
                    .orElseThrow(() -> new RuntimeException("IPRESS no encontrada con ID: " + request.getIdIpress()));
            personal.setIpress(ipress);
        } else {
            personal.setIpress(null);
        }
        
        PersonalExterno updated = personalExternoRepository.save(personal);
        log.info("Personal externo actualizado exitosamente");
        return convertToResponse(updated);
    }
    
    @Transactional
    public void deletePersonalExterno(Long id) {
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
                .edad(personal.getEdad())
                .genExt(personal.getGenExt())
                .movilExt(personal.getMovilExt())
                .emailPersExt(personal.getEmailPersExt())
                .idUser(personal.getIdUser())
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
        
        // Incluir información de IPRESS
        if (personal.getIpress() != null) {
            IpressResponse ipressResp = IpressResponse.builder()
                    .idIpress(personal.getIpress().getIdIpress())
                    .codIpress(personal.getIpress().getCodIpress())
                    .descIpress(personal.getIpress().getDescIpress())
                    .idRed(personal.getIpress().getIdRed())
                    .idNivAten(personal.getIpress().getIdNivAten())
                    .idModAten(personal.getIpress().getIdModAten())
                    .direcIpress(personal.getIpress().getDirecIpress())
                    .idTipIpress(personal.getIpress().getIdTipIpress())
                    .idDist(personal.getIpress().getIdDist())
                    .latIpress(personal.getIpress().getLatIpress())
                    .longIpress(personal.getIpress().getLongIpress())
                    .gmapsUrlIpress(personal.getIpress().getGmapsUrlIpress())
                    .statIpress(personal.getIpress().getStatIpress())
                    .createAt(personal.getIpress().getCreateAt())
                    .updateAt(personal.getIpress().getUpdateAt())
                    .build();
            builder.ipress(ipressResp);
            builder.nombreInstitucion(personal.getIpress().getDescIpress());
        }
        
        return builder.build();
    }
}
