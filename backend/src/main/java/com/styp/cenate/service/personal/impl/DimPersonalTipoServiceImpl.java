package com.styp.cenate.service.personal.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.styp.cenate.dto.DimPersonalTipoDTO;
import com.styp.cenate.exception.ResourceNotFoundException;
import com.styp.cenate.mapper.DimPersonalTipoMapper;
import com.styp.cenate.model.*;
import com.styp.cenate.repository.DimPersonalTipoRepository;
import com.styp.cenate.repository.DimTipoPersonalRepository;
import com.styp.cenate.repository.PersonalCntRepository;
import com.styp.cenate.service.personal.DimPersonalTipoService;

@Service
@Transactional
public class DimPersonalTipoServiceImpl implements DimPersonalTipoService {

    private final DimPersonalTipoRepository repo;
    private final PersonalCntRepository personalRepo;
    private final DimTipoPersonalRepository tipoRepo;

    public DimPersonalTipoServiceImpl(DimPersonalTipoRepository repo,
                                      PersonalCntRepository personalRepo,
                                      DimTipoPersonalRepository tipoRepo) {
        this.repo = repo;
        this.personalRepo = personalRepo;
        this.tipoRepo = tipoRepo;
    }

    @Override
    @Transactional(readOnly = true)
    public List<DimPersonalTipoDTO> listarTodos() {
        return DimPersonalTipoMapper.toDtoList(repo.findAll());
    }

    @Override
    @Transactional(readOnly = true)
    public List<DimPersonalTipoDTO> listarPorPersonal(Long idPers) {
        return DimPersonalTipoMapper.toDtoList(repo.findByIdIdPers(idPers));
    }

    @Override
    @Transactional(readOnly = true)
    public List<DimPersonalTipoDTO> listarPorTipo(Long idTipoPers) {
        return DimPersonalTipoMapper.toDtoList(repo.findByIdIdTipoPers(idTipoPers));
    }

    @Override
    public DimPersonalTipoDTO crear(DimPersonalTipoDTO dto) {
        PersonalCnt personal = personalRepo.findById(dto.getIdPers())
                .orElseThrow(() -> new ResourceNotFoundException("Personal no encontrado"));

        DimTipoPersonal tipo = tipoRepo.findById(dto.getIdTipoPers())
                .orElseThrow(() -> new ResourceNotFoundException("Tipo personal no encontrado"));

        DimPersonalTipoId id = DimPersonalTipoId.builder()
                .idPers(dto.getIdPers())
                .idTipoPers(dto.getIdTipoPers())
                .build();
        System.out.println(id.toString());
        DimPersonalTipo entity = DimPersonalTipo.builder()
                .id(id)
                .personal(personal)
                .tipoPersonal(tipo)
                .build();
        System.out.println(entity.toString());

        DimPersonalTipo guardado = repo.save(entity);
        return DimPersonalTipoMapper.toDto(guardado);
    }

    @Override
    public void eliminar(Long idPers, Long idTipoPers) {
        DimPersonalTipoId id = new DimPersonalTipoId(idPers, idTipoPers);
        if (!repo.existsById(id)) {
            throw new ResourceNotFoundException("Relación personal-tipo no encontrada");
        }
        repo.deleteById(id);
    }
}
