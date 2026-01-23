package com.styp.cenate.service.solicitudturno.impl;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.styp.cenate.dto.solicitudturno.FormServicioRow;
import com.styp.cenate.repository.solicitudturnoipress.FormServiciosRepository;
import com.styp.cenate.service.solicitudturno.FormServiciosService;

@Service
public class FormServiciosServiceImpl implements  FormServiciosService {

    private final FormServiciosRepository repo;

    public FormServiciosServiceImpl(FormServiciosRepository repo) {
        this.repo = repo;
    }

    /**
     * Si idSolicitud != null => modo EDIT (prioriza dst, fallback cfg)
     * Si idSolicitud == null => modo NEW (cfg, fallback false)
     * Valida existencia:
     *  - Si no existe solicitud => 404
     *  - Si no existe codIpress => 404
     */
    @Override
    public List<FormServicioRow> cargarFormulario(String codIpress, Integer idSolicitud) {

        List<FormServicioRow> rows = (idSolicitud != null)
                ? repo.cargarEdit(idSolicitud)
                : repo.cargarNew(codIpress);

        if (rows.isEmpty()) {
            if (idSolicitud != null) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Solicitud no existe: " + idSolicitud);
            }
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "IPRESS no existe o está inactiva: " + codIpress);
        }

        return rows;
    }
}
