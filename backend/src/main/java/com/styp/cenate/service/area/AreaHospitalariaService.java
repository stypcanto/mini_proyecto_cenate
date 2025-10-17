package com.styp.cenate.service.area;

import com.styp.cenate.model.AreaHospitalaria;
import java.util.List;

public interface AreaHospitalariaService {
    List<AreaHospitalaria> listar();
    AreaHospitalaria obtenerPorId(Long id);
    AreaHospitalaria crear(AreaHospitalaria area);
    AreaHospitalaria actualizar(Long id, AreaHospitalaria area);
    void eliminar(Long id);
}