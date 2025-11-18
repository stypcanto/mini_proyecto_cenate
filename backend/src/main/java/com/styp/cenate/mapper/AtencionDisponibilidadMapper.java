package com.styp.cenate.mapper;

import com.styp.cenate.dto.AtencionDisponibilidadDTO;
import com.styp.cenate.model.VWDisponibilidadAtenciones;


public class AtencionDisponibilidadMapper {

    public static AtencionDisponibilidadDTO toDTO(VWDisponibilidadAtenciones entity) {
        if (entity == null) {
            return null;
        }

        return new AtencionDisponibilidadDTO(
            entity.getPkDisponibilidad(),
            entity.getPeriodo(),
            entity.getArea(),
            entity.getServicio(),
            entity.getActividad(),
            entity.getSubactividad(),
            entity.getNumDocPers(),
            entity.getProfesional(),
            entity.getTurno(),
            entity.getFechaCita(),
            entity.getHoraCita(),
            entity.getEstado(),
            entity.getDocPaciente(),
            entity.getNombresPaciente(),
            entity.getSexo(),
            entity.getEdad(),
            entity.getTelefono(),
            entity.getFechaSolicitud(),
            entity.getFechaActualiza(),
            entity.getIdPers(),
            entity.getIdServicio(),
            entity.getIdActividad(),
            entity.getIdSubactividad()
        );
    }

 
}
