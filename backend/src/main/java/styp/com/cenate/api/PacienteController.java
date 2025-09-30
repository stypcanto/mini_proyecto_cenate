package styp.com.cenate.api;

import org.springframework.web.bind.annotation.*;
import styp.com.cenate.model.Paciente;
import styp.com.cenate.repository.PacienteRepository;

import java.util.List;

@RestController
@RequestMapping("/api/pacientes")
public class PacienteController {

    private final PacienteRepository pacienteRepository;

    public PacienteController(PacienteRepository pacienteRepository) {
        this.pacienteRepository = pacienteRepository;
    }

    // Obtener paciente por documento
    @GetMapping("/{doc}")
    public Paciente getPaciente(@PathVariable String doc) {
        return pacienteRepository.findByDocPaciente(doc)
                .orElseThrow(() -> new RuntimeException("Paciente no encontrado"));
    }

    // Listar primeros 20 pacientes
    @GetMapping
    public List<Paciente> listPacientes() {
        return pacienteRepository.findAll().stream().limit(20).toList();
    }
}
