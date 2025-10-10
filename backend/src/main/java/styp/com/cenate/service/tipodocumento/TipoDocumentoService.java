package styp.com.cenate.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import styp.com.cenate.dto.TipoDocumentoResponse;
import styp.com.cenate.model.TipoDocumento;
import styp.com.cenate.repository.TipoDocumentoRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TipoDocumentoService {
    
    private final TipoDocumentoRepository tipoDocumentoRepository;
    
    @Transactional(readOnly = true)
    public List<TipoDocumentoResponse> getAllTiposDocumento() {
        log.info("Obteniendo todos los tipos de documento");
        return tipoDocumentoRepository.findAll().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public TipoDocumentoResponse getTipoDocumentoById(Long id) {
        log.info("Obteniendo tipo de documento con ID: {}", id);
        TipoDocumento tipoDoc = tipoDocumentoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tipo de documento no encontrado"));
        return convertToResponse(tipoDoc);
    }
    
    @Transactional
    public TipoDocumentoResponse createTipoDocumento(String desc, String stat) {
        log.info("Creando nuevo tipo de documento: {}", desc);
        TipoDocumento tipoDoc = new TipoDocumento();
        tipoDoc.setDescTipDoc(desc);
        tipoDoc.setStatTipDoc(stat);
        TipoDocumento saved = tipoDocumentoRepository.save(tipoDoc);
        return convertToResponse(saved);
    }
    
    @Transactional
    public TipoDocumentoResponse updateTipoDocumento(Long id, String desc, String stat) {
        log.info("Actualizando tipo de documento con ID: {}", id);
        TipoDocumento tipoDoc = tipoDocumentoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tipo de documento no encontrado"));
        tipoDoc.setDescTipDoc(desc);
        tipoDoc.setStatTipDoc(stat);
        TipoDocumento updated = tipoDocumentoRepository.save(tipoDoc);
        return convertToResponse(updated);
    }
    
    @Transactional
    public void deleteTipoDocumento(Long id) {
        log.info("Eliminando tipo de documento con ID: {}", id);
        tipoDocumentoRepository.deleteById(id);
    }
    
    private TipoDocumentoResponse convertToResponse(TipoDocumento tipoDoc) {
        TipoDocumentoResponse response = new TipoDocumentoResponse();
        response.setIdTipDoc(tipoDoc.getIdTipDoc());
        response.setDescTipDoc(tipoDoc.getDescTipDoc());
        response.setStatTipDoc(tipoDoc.getStatTipDoc());
        response.setCreateAt(tipoDoc.getCreateAt());
        response.setUpdateAt(tipoDoc.getUpdateAt());
        return response;
    }
}
