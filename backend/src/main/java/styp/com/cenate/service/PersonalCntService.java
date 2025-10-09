package styp.com.cenate.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import styp.com.cenate.dto.AreaResponse;
import styp.com.cenate.dto.PersonalCntRequest;
import styp.com.cenate.dto.PersonalCntResponse;
import styp.com.cenate.dto.RegimenLaboralResponse;
import styp.com.cenate.dto.TipoDocumentoResponse;
import styp.com.cenate.model.Area;
import styp.com.cenate.model.PersonalCnt;
import styp.com.cenate.model.RegimenLaboral;
import styp.com.cenate.model.TipoDocumento;
import styp.com.cenate.repository.AreaRepository;
import styp.com.cenate.repository.PersonalCntRepository;
import styp.com.cenate.repository.RegimenLaboralRepository;
import styp.com.cenate.repository.TipoDocumentoRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PersonalCntService {
    
    private final PersonalCntRepository personalCntRepository;
    private final TipoDocumentoRepository tipoDocumentoRepository;
    private final AreaRepository areaRepository;
    private final RegimenLaboralRepository regimenLaboralRepository;
    
    @Transactional(readOnly = true)
    public List<PersonalCntResponse> getAllPersonal() {
        log.info("Obteniendo todo el personal");
        return personalCntRepository.findAll().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public PersonalCntResponse getPersonalById(Long id) {
        log.info("Obteniendo personal con ID: {}", id);
        PersonalCnt personal = personalCntRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Personal no encontrado"));
        return convertToResponse(personal);
    }
    
    @Transactional
    public PersonalCntResponse createPersonal(PersonalCntRequest request) {
        log.info("Creando nuevo personal: {}", request.getPerPers());
        
        TipoDocumento tipoDoc = tipoDocumentoRepository.findById(request.getIdTipDoc())
                .orElseThrow(() -> new RuntimeException("Tipo de documento no encontrado"));
        
        PersonalCnt personal = new PersonalCnt();
        personal.setTipoDocumento(tipoDoc);
        personal.setNumDocPers(request.getNumDocPers());
        personal.setPerPers(request.getPerPers());
        personal.setStatPers(request.getStatPers());
        personal.setFechNaciPers(request.getFechNaciPers());
        personal.setGenPers(request.getGenPers());
        personal.setMovilPers(request.getMovilPers());
        personal.setEmailPers(request.getEmailPers());
        personal.setEmailCorpPers(request.getEmailCorpPers());
        personal.setCmp(request.getCmp());
        personal.setCodPlanRem(request.getCodPlanRem());
        personal.setDirecPers(request.getDirecPers());
        
        if (request.getIdRegLab() != null) {
            RegimenLaboral regimen = regimenLaboralRepository.findById(request.getIdRegLab())
                    .orElseThrow(() -> new RuntimeException("Régimen laboral no encontrado"));
            personal.setRegimenLaboral(regimen);
        }
        
        if (request.getIdArea() != null) {
            Area area = areaRepository.findById(request.getIdArea())
                    .orElseThrow(() -> new RuntimeException("Área no encontrada"));
            personal.setArea(area);
        }
        
        personal.setIdUsuario(request.getIdUsuario());
        
        PersonalCnt saved = personalCntRepository.save(personal);
        return convertToResponse(saved);
    }
    
    @Transactional
    public PersonalCntResponse updatePersonal(Long id, PersonalCntRequest request) {
        log.info("Actualizando personal con ID: {}", id);
        
        PersonalCnt personal = personalCntRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Personal no encontrado"));
        
        TipoDocumento tipoDoc = tipoDocumentoRepository.findById(request.getIdTipDoc())
                .orElseThrow(() -> new RuntimeException("Tipo de documento no encontrado"));
        
        personal.setTipoDocumento(tipoDoc);
        personal.setNumDocPers(request.getNumDocPers());
        personal.setPerPers(request.getPerPers());
        personal.setStatPers(request.getStatPers());
        personal.setFechNaciPers(request.getFechNaciPers());
        personal.setGenPers(request.getGenPers());
        personal.setMovilPers(request.getMovilPers());
        personal.setEmailPers(request.getEmailPers());
        personal.setEmailCorpPers(request.getEmailCorpPers());
        personal.setCmp(request.getCmp());
        personal.setCodPlanRem(request.getCodPlanRem());
        personal.setDirecPers(request.getDirecPers());
        
        if (request.getIdRegLab() != null) {
            RegimenLaboral regimen = regimenLaboralRepository.findById(request.getIdRegLab())
                    .orElseThrow(() -> new RuntimeException("Régimen laboral no encontrado"));
            personal.setRegimenLaboral(regimen);
        } else {
            personal.setRegimenLaboral(null);
        }
        
        if (request.getIdArea() != null) {
            Area area = areaRepository.findById(request.getIdArea())
                    .orElseThrow(() -> new RuntimeException("Área no encontrada"));
            personal.setArea(area);
        } else {
            personal.setArea(null);
        }
        
        personal.setIdUsuario(request.getIdUsuario());
        
        PersonalCnt updated = personalCntRepository.save(personal);
        return convertToResponse(updated);
    }
    
    @Transactional
    public void deletePersonal(Long id) {
        log.info("Eliminando personal con ID: {}", id);
        personalCntRepository.deleteById(id);
    }
    
    private PersonalCntResponse convertToResponse(PersonalCnt personal) {
        PersonalCntResponse response = new PersonalCntResponse();
        response.setIdPers(personal.getIdPers());
        
        if (personal.getTipoDocumento() != null) {
            TipoDocumentoResponse tipoDocResp = new TipoDocumentoResponse();
            tipoDocResp.setIdTipDoc(personal.getTipoDocumento().getIdTipDoc());
            tipoDocResp.setDescTipDoc(personal.getTipoDocumento().getDescTipDoc());
            tipoDocResp.setStatTipDoc(personal.getTipoDocumento().getStatTipDoc());
            response.setTipoDocumento(tipoDocResp);
        }
        
        response.setNumDocPers(personal.getNumDocPers());
        response.setPerPers(personal.getPerPers());
        response.setStatPers(personal.getStatPers());
        response.setFechNaciPers(personal.getFechNaciPers());
        response.setGenPers(personal.getGenPers());
        response.setMovilPers(personal.getMovilPers());
        response.setEmailPers(personal.getEmailPers());
        response.setEmailCorpPers(personal.getEmailCorpPers());
        response.setCmp(personal.getCmp());
        response.setCodPlanRem(personal.getCodPlanRem());
        response.setDirecPers(personal.getDirecPers());
        
        if (personal.getRegimenLaboral() != null) {
            RegimenLaboralResponse regimenResp = new RegimenLaboralResponse();
            regimenResp.setIdRegLab(personal.getRegimenLaboral().getIdRegLab());
            regimenResp.setDescRegLab(personal.getRegimenLaboral().getDescRegLab());
            regimenResp.setStatRegLab(personal.getRegimenLaboral().getStatRegLab());
            response.setRegimenLaboral(regimenResp);
        }
        
        if (personal.getArea() != null) {
            AreaResponse areaResp = new AreaResponse();
            areaResp.setIdArea(personal.getArea().getIdArea());
            areaResp.setDescArea(personal.getArea().getDescArea());
            areaResp.setStatArea(personal.getArea().getStatArea());
            response.setArea(areaResp);
        }
        
        response.setIdUsuario(personal.getIdUsuario());
        response.setCreateAt(personal.getCreateAt());
        response.setUpdateAt(personal.getUpdateAt());
        
        return response;
    }
}
