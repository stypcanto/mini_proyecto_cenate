package com.styp.cenate.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import com.styp.cenate.model.TipoDocumento;

import java.util.List;

@Repository
public interface TipoDocumentoRepository extends JpaRepository<TipoDocumento, Long> {

    // 📄 Obtiene los tipos de documento por estado exacto (A/I)
    List<TipoDocumento> findByStatTipDoc(String status);

    // 🧠 Variante que ignora mayúsculas/minúsculas
    List<TipoDocumento> findAllByStatTipDocIgnoreCase(String status);

    // ✅ Verifica si ya existe un tipo de documento con la misma descripción (ignora mayúsculas)
    boolean existsByDescTipDocIgnoreCase(String descTipDoc);
    
    // 🔍 Busca un tipo de documento por su descripción exacta
    java.util.Optional<TipoDocumento> findByDescTipDoc(String descTipDoc);
    
    // 🔍 Busca un tipo de documento por su descripción ignorando mayúsculas/minúsculas
    java.util.Optional<TipoDocumento> findByDescTipDocIgnoreCase(String descTipDoc);
    
    // 📋 Obtiene tipos de documento activos ordenados por descripción
    @Query("SELECT t FROM TipoDocumento t WHERE t.statTipDoc = ?1 ORDER BY t.descTipDoc ASC")
    List<TipoDocumento> findByStatTipDocOrderedByDesc(String status);
}