package com.styp.cenate.service.medicamento;

import com.styp.cenate.dto.MedicamentoResponse;
import org.springframework.data.domain.Page;
import java.util.List;

public interface MedicamentoService {
    List<MedicamentoResponse> listar();

    Page<MedicamentoResponse> listarPaginado(int page, int size, String sortBy, String direction);

    Page<MedicamentoResponse> buscar(int page, int size, String sortBy, String direction, String codMedicamento, String descMedicamento);

    MedicamentoResponse obtenerPorId(Long id);

    MedicamentoResponse crear(MedicamentoResponse dto);

    MedicamentoResponse actualizar(Long id, MedicamentoResponse dto);

    void eliminar(Long id);
}
