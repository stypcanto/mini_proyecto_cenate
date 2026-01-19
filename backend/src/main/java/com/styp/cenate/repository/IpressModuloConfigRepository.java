package com.styp.cenate.repository;

import com.styp.cenate.model.IpressModuloConfig;
import com.styp.cenate.model.Ipress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 🔍 Repository para gestionar configuración de módulos por IPRESS
 */
@Repository
public interface IpressModuloConfigRepository extends JpaRepository<IpressModuloConfig, Long> {

    /**
     * Obtener todos los módulos habilitados para una IPRESS
     */
    @Query("SELECT c FROM IpressModuloConfig c WHERE c.ipress.idIpress = :idIpress AND c.habilitado = true ORDER BY c.orden ASC")
    List<IpressModuloConfig> findModulosHabilitados(@Param("idIpress") Long idIpress);

    /**
     * Obtener todos los módulos (habilitados y deshabilitados) para una IPRESS
     */
    @Query("SELECT c FROM IpressModuloConfig c WHERE c.ipress.idIpress = :idIpress ORDER BY c.orden ASC")
    List<IpressModuloConfig> findAllByIpress(@Param("idIpress") Long idIpress);

    /**
     * Obtener un módulo específico para una IPRESS
     */
    Optional<IpressModuloConfig> findByIpressIdIpressAndModuloCodigo(Long idIpress, String moduloCodigo);

    /**
     * Verificar si un módulo está habilitado para una IPRESS
     */
    @Query("SELECT COUNT(c) > 0 FROM IpressModuloConfig c WHERE c.ipress.idIpress = :idIpress AND c.moduloCodigo = :moduloCodigo AND c.habilitado = true")
    boolean isModuloHabilitado(@Param("idIpress") Long idIpress, @Param("moduloCodigo") String moduloCodigo);

    /**
     * Obtener módulos de una IPRESS específica
     */
    List<IpressModuloConfig> findByIpress(Ipress ipress);
}
