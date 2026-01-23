package com.styp.cenate.repository.ipress;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.styp.cenate.dto.ipress.ServicioCfgRequest;

@Repository
public class IpressServicioConfigWriteRepository {

	  private final JdbcTemplate jdbc;

	    public IpressServicioConfigWriteRepository(JdbcTemplate jdbc) {
	        this.jdbc = jdbc;
	    }

	    /** 0) Resolver id_ipress desde cod_ipress (mantiene ceros a la izquierda) */
	    public Long obtenerIdIpressPorCodigo(String codIpress) {
	        return jdbc.queryForObject("""
	            SELECT di.id_ipress
	            FROM public.dim_ipress di
	            WHERE di.cod_ipress = ?
	              AND di.stat_ipress = 'A'
	            LIMIT 1
	        """, Long.class, codIpress);
	    }

	    /** 1) Obtener o crear cabecera cfg */
	    public Long obtenerOCrearCfg(Long idIpress) {
	        var list = jdbc.query("""
	            SELECT id_cfg_ipress
	            FROM public.cfg_ipress_servicios
	            WHERE id_ipress = ? AND estado = 'A'
	            LIMIT 1
	        """, (rs, rowNum) -> rs.getLong("id_cfg_ipress"), idIpress);

	        if (!list.isEmpty()) return list.get(0);

	        return jdbc.queryForObject("""
	            INSERT INTO public.cfg_ipress_servicios (id_ipress, estado, created_at, updated_at)
	            VALUES (?, 'A', now(), now())
	            RETURNING id_cfg_ipress
	        """, Long.class, idIpress);
	    }

	    /** 2) UPSERT detalle */
	    public void upsertDetalle(Long idCfg, ServicioCfgRequest s) {
	        jdbc.update("""
	            INSERT INTO public.cfg_ipress_servicio_det
	                (id_cfg_ipress, id_servicio, teleconsulta, teleconsultorio, estado, created_at, updated_at)
	            VALUES (?, ?, ?, ?, 'A', now(), now())
	            ON CONFLICT (id_cfg_ipress, id_servicio)
	            DO UPDATE SET
	                teleconsulta = EXCLUDED.teleconsulta,
	                teleconsultorio = EXCLUDED.teleconsultorio,
	                estado = 'A',
	                updated_at = now()
	        """, idCfg, s.idServicio(), s.teleconsulta(), s.teleconsultorio());
	    }

	    /** 3) DELETE detalle si ambos false */
	    public void deleteDetalle(Long idCfg, Long idServicio) {
	        jdbc.update("""
	            DELETE FROM public.cfg_ipress_servicio_det
	            WHERE id_cfg_ipress = ?
	              AND id_servicio = ?
	        """, idCfg, idServicio);
	    }
}
