package com.styp.cenate.service.tipodocumento;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.styp.cenate.dto.TipoDocumentoResponse;
import com.styp.cenate.model.TipoDocumento;
import com.styp.cenate.repository.TipoDocumentoRepository;
import com.styp.cenate.exception.ResourceNotFoundException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Data
public class TipoDocumentoService {

    private final TipoDocumentoRepository tipoDocumentoRepository;

    @Transactional(readOnly = true)
    public List<TipoDocumentoResponse> getAllTiposDocumento() {
        log.info("📄 Obteniendo todos los tipos de documento");
        return tipoDocumentoRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TipoDocumentoResponse> getTiposDocumentoActivos() {
        log.info("📋 Obteniendo tipos de documento activos (stat_tip_doc = 'A')");
        return tipoDocumentoRepository.findByStatTipDoc("A")
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TipoDocumentoResponse getTipoDocumentoById(Long id) {
        log.info("🔍 Buscando tipo de documento con ID: {}", id);
        TipoDocumento tipoDoc = tipoDocumentoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tipo de documento no encontrado con ID: " + id));
        return convertToResponse(tipoDoc);
    }

    @Transactional
    public TipoDocumentoResponse createTipoDocumento(String desc, String stat) {
        log.info("🟢 Creando nuevo tipo de documento: {}", desc);

        if (desc == null || desc.trim().isEmpty()) {
            throw new IllegalArgumentException("La descripción del tipo de documento no puede estar vacía");
        }

        boolean exists = tipoDocumentoRepository.existsByDescTipDocIgnoreCase(desc.trim());
        if (exists) {
            throw new IllegalArgumentException("Ya existe un tipo de documento con esa descripción");
        }

        TipoDocumento tipoDoc = TipoDocumento.builder()
                .descTipDoc(desc.trim())
                .statTipDoc(stat != null ? stat.trim().toUpperCase() : "A")
                .build();

        TipoDocumento saved = tipoDocumentoRepository.save(tipoDoc);
        log.info("✅ Tipo de documento creado con ID: {}", saved.getIdTipDoc());
        return convertToResponse(saved);
    }

    @Transactional
    public TipoDocumentoResponse updateTipoDocumento(Long id, String desc, String stat) {
        log.info("✏️ Actualizando tipo de documento con ID: {}", id);
        TipoDocumento tipoDoc = tipoDocumentoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tipo de documento no encontrado con ID: " + id));

        if (desc != null && !desc.trim().isEmpty()) tipoDoc.setDescTipDoc(desc.trim());
        if (stat != null && !stat.trim().isEmpty()) tipoDoc.setStatTipDoc(stat.trim().toUpperCase());

        TipoDocumento updated = tipoDocumentoRepository.save(tipoDoc);
        log.info("✅ Tipo de documento actualizado: {}", updated.getDescTipDoc());
        return convertToResponse(updated);
    }

    @Transactional
    public void deleteTipoDocumento(Long id) {
        log.warn("🗑️ Eliminando tipo de documento con ID: {}", id);
        if (!tipoDocumentoRepository.existsById(id)) {
            throw new ResourceNotFoundException("No existe un tipo de documento con el ID proporcionado: " + id);
        }
        tipoDocumentoRepository.deleteById(id);
        log.info("✅ Tipo de documento eliminado correctamente");
    }

    private TipoDocumentoResponse convertToResponse(TipoDocumento tipoDoc) {
        return TipoDocumentoResponse.builder()
                .idTipDoc(tipoDoc.getIdTipDoc())
                .descTipDoc(tipoDoc.getDescTipDoc())
                .statTipDoc(tipoDoc.getStatTipDoc())
                .createAt(tipoDoc.getCreateAt())
                .updateAt(tipoDoc.getUpdateAt())
                .build();
    }
}
