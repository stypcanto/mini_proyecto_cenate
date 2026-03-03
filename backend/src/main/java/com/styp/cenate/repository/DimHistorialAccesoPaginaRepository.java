package com.styp.cenate.repository;

import com.styp.cenate.entity.DimHistorialAccesoPagina;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DimHistorialAccesoPaginaRepository extends JpaRepository<DimHistorialAccesoPagina, Long> {

  /**
   * Obtener historial de accesos de un usuario
   */
  List<DimHistorialAccesoPagina> findByIdUsuarioOrderByCreatedAtDesc(Integer idUsuario);

  /**
   * Obtener accesos a una página específica
   */
  List<DimHistorialAccesoPagina> findByIdPaginaOrderByCreatedAtDesc(Integer idPagina);

  /**
   * Obtener accesos por rango de fechas
   */
  @Query("SELECT ha FROM DimHistorialAccesoPagina ha WHERE ha.createdAt BETWEEN :inicio AND :fin ORDER BY ha.createdAt DESC")
  List<DimHistorialAccesoPagina> findByRangoFechas(
    @Param("inicio") LocalDateTime inicio,
    @Param("fin") LocalDateTime fin
  );

  /**
   * Obtener accesos por usuario en rango de fechas
   */
  @Query("SELECT ha FROM DimHistorialAccesoPagina ha WHERE ha.idUsuario = :idUsuario AND ha.createdAt BETWEEN :inicio AND :fin ORDER BY ha.createdAt DESC")
  List<DimHistorialAccesoPagina> findByUsuarioYRangoFechas(
    @Param("idUsuario") Integer idUsuario,
    @Param("inicio") LocalDateTime inicio,
    @Param("fin") LocalDateTime fin
  );

  /**
   * Contar accesos totales por usuario
   */
  Long countByIdUsuario(Integer idUsuario);
}
