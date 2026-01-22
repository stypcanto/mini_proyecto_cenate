package com.styp.cenate.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.styp.cenate.dto.filtros.IpressOptionDTO;
import com.styp.cenate.model.Ipress;

@Repository
public interface IpressRepository extends JpaRepository<Ipress, Long> {
    
    /**
     * Buscar IPRESS por código
     */
    Optional<Ipress> findByCodIpress(String codIpress);
    
    /**
     * Buscar IPRESS activas
     */
    List<Ipress> findByStatIpress(String estado);
    
    /**
     * Buscar IPRESS por nombre (búsqueda parcial)
     */
    List<Ipress> findByDescIpressContainingIgnoreCase(String nombre);
    
    /**
     * Verificar si existe IPRESS con ese código
     */
    boolean existsByCodIpress(String codIpress);
    
    /**
     * Buscar IPRESS activas ordenadas por descripción
     */
    @Query("SELECT i FROM Ipress i WHERE i.statIpress = :estado ORDER BY i.descIpress ASC")
    List<Ipress> findByStatIpressOrderByDescIpressAsc(@Param("estado") String estado);
    
    /**
     * Buscar IPRESS por distrito
     */
    @Query("SELECT i FROM Ipress i WHERE i.idDist = :idDistrito AND i.statIpress = :estado ORDER BY i.descIpress ASC")
    List<Ipress> findByIdDistAndStatIpressOrderByDescIpressAsc(@Param("idDistrito") Long idDistrito, @Param("estado") String estado);

    /**
     * Buscar IPRESS por RED y estado
     */
    List<Ipress> findByRed_IdAndStatIpress(Long idRed, String estado);

    /**
     * Contar IPRESS por Red
     */
    Long countByRed_Id(Long idRed);
    
    
    @Query("""
            SELECT new com.styp.cenate.dto.filtros.IpressOptionDTO(
                i.idIpress,
                i.codIpress,
                i.descIpress,
                i.red.id
            )
            FROM Ipress i
            WHERE i.red.id = :redId
            ORDER BY i.descIpress
        """)
        List<IpressOptionDTO> listarPorRed(@Param("redId") Long redId);
    
    
}
