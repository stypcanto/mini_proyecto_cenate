package com.styp.cenate.repository.solicitudturnoipress;
import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.styp.cenate.dto.solicitudturno.FormServicioRow;

@Repository
public class FormServiciosRepository {

    private final JdbcTemplate jdbc;

    public FormServiciosRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    
    public List<FormServicioRow> cargarNew(String codIpress) {
        String sql = """
            WITH ip AS (
              SELECT di.id_ipress
              FROM public.dim_ipress di
              WHERE di.cod_ipress = ?::text
                AND di.stat_ipress = 'A'
              LIMIT 1
            )
            SELECT
              s.id_servicio,
              s.desc_servicio,
              COALESCE(cfgd.teleconsulta, FALSE)    AS teleconsulta_activo,
              COALESCE(cfgd.teleconsultorio, FALSE) AS teleconsultorio_activo
            FROM ip
            CROSS JOIN public.dim_servicio_essi s
            LEFT JOIN public.cfg_ipress_servicios c
              ON c.id_ipress = ip.id_ipress AND c.estado='A'
            LEFT JOIN public.cfg_ipress_servicio_det cfgd
              ON cfgd.id_cfg_ipress = c.id_cfg_ipress
             AND cfgd.id_servicio   = s.id_servicio
             AND cfgd.estado = 'A'
            WHERE s.estado = 'A'
              AND s.es_cenate = TRUE
            ORDER BY s.desc_servicio
        """;

        return jdbc.query(sql, ps -> ps.setString(1, codIpress),
                (rs, rowNum) -> new FormServicioRow(
                        rs.getLong("id_servicio"),
                        rs.getString("desc_servicio"),
                        rs.getBoolean("teleconsulta_activo"),
                        rs.getBoolean("teleconsultorio_activo")
                )
        );
    }

    // EDIT: valida idSolicitud (si no existe => 0 filas)
    public List<FormServicioRow> cargarEdit(Integer idSolicitud) {
        String sql = """
            WITH sol AS (
              SELECT st.id_solicitud, p.id_ipress
              FROM public.solicitud_turno_ipress st
              JOIN public.dim_personal_cnt p ON p.id_pers = st.id_pers
              WHERE st.id_solicitud = ?::int
              LIMIT 1
            )
            SELECT
              s.id_servicio,
              s.desc_servicio,
              COALESCE(dst.teleconsulta_activo, cfgd.teleconsulta, FALSE)        AS teleconsulta_activo,
              COALESCE(dst.teleconsultorio_activo, cfgd.teleconsultorio, FALSE)  AS teleconsultorio_activo
            FROM sol
            CROSS JOIN public.dim_servicio_essi s
            LEFT JOIN public.detalle_solicitud_turno dst
              ON dst.id_solicitud = sol.id_solicitud
             AND dst.id_servicio  = s.id_servicio
            LEFT JOIN public.cfg_ipress_servicios c
              ON c.id_ipress = sol.id_ipress AND c.estado='A'
            LEFT JOIN public.cfg_ipress_servicio_det cfgd
              ON cfgd.id_cfg_ipress = c.id_cfg_ipress
             AND cfgd.id_servicio   = s.id_servicio
             AND cfgd.estado='A'
            WHERE s.estado = 'A'
              AND s.es_cenate = TRUE
            ORDER BY s.desc_servicio
        """;

        return jdbc.query(sql, ps -> ps.setInt(1, idSolicitud),
                (rs, rowNum) -> new FormServicioRow(
                        rs.getLong("id_servicio"),
                        rs.getString("desc_servicio"),
                        rs.getBoolean("teleconsulta_activo"),
                        rs.getBoolean("teleconsultorio_activo")
                )
        );
    }
}
