package com.styp.cenate.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.styp.cenate.model.ActividadEssi;

public interface ActividadEssiRepository extends JpaRepository<ActividadEssi, Long>
{
    List<ActividadEssi> findByEstadoAndEsCenate(String estado, boolean esCenate);

}
