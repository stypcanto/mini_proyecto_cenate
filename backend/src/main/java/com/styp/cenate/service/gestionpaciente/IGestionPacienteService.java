package com.styp.cenate.service.gestionpaciente;

import com.styp.cenate.dto.GestionPacienteDTO;

import java.util.List;
import java.util.Optional;

public interface IGestionPacienteService {

    // CRUD básico
    GestionPacienteDTO guardar(GestionPacienteDTO dto);
    GestionPacienteDTO actualizar(Long id, GestionPacienteDTO dto);
    void eliminar(Long id);

    // Consultas
    List<GestionPacienteDTO> listar();
    Optional<GestionPacienteDTO> buscarPorId(Long id);
    List<GestionPacienteDTO> buscarPorNumDoc(String numDoc);
    List<GestionPacienteDTO> buscarPorCondicion(String condicion);
    List<GestionPacienteDTO> buscarPorGestora(String gestora);
    List<GestionPacienteDTO> buscarPorIpress(String codIpress);

    // Gestión de telemedicina
    List<GestionPacienteDTO> listarSeleccionadosTelemedicina();
    GestionPacienteDTO seleccionarParaTelemedicina(Long id, Boolean seleccionado);
    List<GestionPacienteDTO> seleccionarMultiplesParaTelemedicina(List<Long> ids, Boolean seleccionado);

    // Actualización de condición
    GestionPacienteDTO actualizarCondicion(Long id, String condicion, String observaciones);

    // Buscar asegurado por DNI (para agregar a gestión)
    Optional<GestionPacienteDTO> buscarAseguradoPorDni(String dni);

    // Pacientes asignados al médico
    List<GestionPacienteDTO> obtenerPacientesDelMedicoActual();
}
