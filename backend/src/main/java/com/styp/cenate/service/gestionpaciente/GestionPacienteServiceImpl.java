package com.styp.cenate.service.gestionpaciente;

import com.styp.cenate.dto.GestionPacienteDTO;
import com.styp.cenate.model.Asegurado;
import com.styp.cenate.model.GestionPaciente;
import com.styp.cenate.model.Ipress;
import com.styp.cenate.repository.AseguradoRepository;
import com.styp.cenate.repository.GestionPacienteRepository;
import com.styp.cenate.repository.IpressRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class GestionPacienteServiceImpl implements IGestionPacienteService {

    private final GestionPacienteRepository repository;
    private final AseguradoRepository aseguradoRepository;
    private final IpressRepository ipressRepository;

    @Override
    @Transactional
    public GestionPacienteDTO guardar(GestionPacienteDTO dto) {
        log.info("Guardando gestión para asegurado: {}", dto.getPkAsegurado());

        // Buscar el asegurado
        Asegurado asegurado = aseguradoRepository.findById(dto.getPkAsegurado())
            .orElseThrow(() -> new RuntimeException("Asegurado no encontrado: " + dto.getPkAsegurado()));

        // Verificar si ya existe una gestión para este asegurado
        if (repository.existsByAsegurado_PkAsegurado(dto.getPkAsegurado())) {
            throw new RuntimeException("Ya existe una gestión para el asegurado: " + dto.getPkAsegurado());
        }

        GestionPaciente entity = GestionPaciente.builder()
            .asegurado(asegurado)
            .condicion(dto.getCondicion())
            .gestora(dto.getGestora())
            .observaciones(dto.getObservaciones())
            .origen(dto.getOrigen())
            .seleccionadoTelemedicina(dto.getSeleccionadoTelemedicina())
            .build();

        GestionPaciente saved = repository.save(entity);
        log.info("Gestión guardada con ID: {}", saved.getIdGestion());

        return toDto(saved);
    }

    @Override
    @Transactional
    public GestionPacienteDTO actualizar(Long id, GestionPacienteDTO dto) {
        log.info("Actualizando gestión con ID: {}", id);

        GestionPaciente existing = repository.findById(id)
            .orElseThrow(() -> new RuntimeException("Gestión no encontrada con ID: " + id));

        // Solo actualizar campos de gestión (no datos del asegurado)
        existing.setCondicion(dto.getCondicion());
        existing.setGestora(dto.getGestora());
        existing.setObservaciones(dto.getObservaciones());
        existing.setOrigen(dto.getOrigen());
        existing.setSeleccionadoTelemedicina(dto.getSeleccionadoTelemedicina());

        GestionPaciente updated = repository.save(existing);
        log.info("Gestión actualizada: {}", updated.getIdGestion());

        return toDto(updated);
    }

    @Override
    @Transactional
    public void eliminar(Long id) {
        log.info("Eliminando gestión con ID: {}", id);

        if (!repository.existsById(id)) {
            throw new RuntimeException("Gestión no encontrada con ID: " + id);
        }

        repository.deleteById(id);
        log.info("Gestión eliminada: {}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<GestionPacienteDTO> listar() {
        log.info("Listando todas las gestiones");
        return repository.findAll().stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<GestionPacienteDTO> buscarPorId(Long id) {
        log.info("Buscando gestión por ID: {}", id);
        return repository.findById(id).map(this::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<GestionPacienteDTO> buscarPorNumDoc(String numDoc) {
        log.info("Buscando gestiones por documento: {}", numDoc);
        return repository.findByNumDoc(numDoc).stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<GestionPacienteDTO> buscarPorCondicion(String condicion) {
        log.info("Buscando gestiones por condición: {}", condicion);
        return repository.findByCondicion(condicion).stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<GestionPacienteDTO> buscarPorGestora(String gestora) {
        log.info("Buscando gestiones por gestora: {}", gestora);
        return repository.findByGestora(gestora).stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<GestionPacienteDTO> buscarPorIpress(String codIpress) {
        log.info("Buscando gestiones por IPRESS: {}", codIpress);
        return repository.findByIpress(codIpress).stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<GestionPacienteDTO> listarSeleccionadosTelemedicina() {
        log.info("Listando gestiones seleccionadas para telemedicina");
        return repository.findBySeleccionadoTelemedicina(true).stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public GestionPacienteDTO seleccionarParaTelemedicina(Long id, Boolean seleccionado) {
        log.info("Actualizando selección telemedicina para ID: {} a {}", id, seleccionado);

        GestionPaciente existing = repository.findById(id)
            .orElseThrow(() -> new RuntimeException("Gestión no encontrada con ID: " + id));

        existing.setSeleccionadoTelemedicina(seleccionado);

        GestionPaciente updated = repository.save(existing);
        return toDto(updated);
    }

    @Override
    @Transactional
    public List<GestionPacienteDTO> seleccionarMultiplesParaTelemedicina(List<Long> ids, Boolean seleccionado) {
        log.info("Actualizando selección telemedicina para {} gestiones", ids.size());

        List<GestionPaciente> gestiones = repository.findAllById(ids);

        gestiones.forEach(g -> g.setSeleccionadoTelemedicina(seleccionado));

        List<GestionPaciente> updated = repository.saveAll(gestiones);

        return updated.stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public GestionPacienteDTO actualizarCondicion(Long id, String condicion, String observaciones) {
        log.info("Actualizando condición para ID: {} a {}", id, condicion);

        GestionPaciente existing = repository.findById(id)
            .orElseThrow(() -> new RuntimeException("Gestión no encontrada con ID: " + id));

        existing.setCondicion(condicion);
        if (observaciones != null) {
            existing.setObservaciones(observaciones);
        }

        GestionPaciente updated = repository.save(existing);
        return toDto(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<GestionPacienteDTO> buscarAseguradoPorDni(String dni) {
        log.info("Buscando asegurado por DNI: {}", dni);

        return aseguradoRepository.findByDocPaciente(dni)
            .map(this::aseguradoToDto);
    }

    // ========================================================================
    // Métodos de conversión
    // ========================================================================

    private GestionPacienteDTO toDto(GestionPaciente entity) {
        if (entity == null) return null;

        Asegurado asegurado = entity.getAsegurado();
        String ipressNombre = obtenerNombreIpress(asegurado.getCasAdscripcion());

        return GestionPacienteDTO.builder()
            .idGestion(entity.getIdGestion())
            .pkAsegurado(asegurado.getPkAsegurado())
            // Datos del asegurado (tabla asegurados)
            .numDoc(asegurado.getDocPaciente())
            .apellidosNombres(asegurado.getPaciente())
            .sexo(asegurado.getSexo())
            .edad(calcularEdad(asegurado.getFecnacimpaciente()))
            .telefono(asegurado.getTelFijo())
            .tipoPaciente(asegurado.getTipoPaciente())
            .tipoSeguro(asegurado.getTipoSeguro())
            .ipress(ipressNombre)
            // Datos de gestión
            .condicion(entity.getCondicion())
            .gestora(entity.getGestora())
            .observaciones(entity.getObservaciones())
            .origen(entity.getOrigen())
            .seleccionadoTelemedicina(entity.getSeleccionadoTelemedicina())
            .fechaCreacion(entity.getFechaCreacion())
            .fechaActualizacion(entity.getFechaActualizacion())
            .build();
    }

    private GestionPacienteDTO aseguradoToDto(Asegurado asegurado) {
        if (asegurado == null) return null;

        String ipressNombre = obtenerNombreIpress(asegurado.getCasAdscripcion());

        return GestionPacienteDTO.builder()
            .pkAsegurado(asegurado.getPkAsegurado())
            .numDoc(asegurado.getDocPaciente())
            .apellidosNombres(asegurado.getPaciente())
            .sexo(asegurado.getSexo())
            .edad(calcularEdad(asegurado.getFecnacimpaciente()))
            .telefono(asegurado.getTelFijo())
            .tipoPaciente(asegurado.getTipoPaciente())
            .tipoSeguro(asegurado.getTipoSeguro())
            .ipress(ipressNombre)
            .build();
    }

    private String obtenerNombreIpress(String codIpress) {
        if (codIpress == null) return null;
        try {
            return ipressRepository.findByCodIpress(codIpress)
                .map(Ipress::getDescIpress)
                .orElse(codIpress);
        } catch (Exception e) {
            log.warn("No se pudo obtener el nombre de IPRESS para código: {}", codIpress);
            return codIpress;
        }
    }

    private Integer calcularEdad(LocalDate fechaNacimiento) {
        if (fechaNacimiento == null) return null;
        return Period.between(fechaNacimiento, LocalDate.now()).getYears();
    }
}
