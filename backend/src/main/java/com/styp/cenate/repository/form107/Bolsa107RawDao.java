package com.styp.cenate.repository.form107;
import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.styp.cenate.dto.form107.Bolsa107RawRow;

@Repository
public class Bolsa107RawDao {

  private final JdbcTemplate jdbc;
  private final ObjectMapper om = new ObjectMapper();

  public Bolsa107RawDao(JdbcTemplate jdbc) {
    this.jdbc = jdbc;
  }

  public void insertBatch(List<Bolsa107RawRow> rows) {
    if (rows == null || rows.isEmpty()) return;

    String sql = """
      INSERT INTO staging.bolsa_107_raw (
        id_carga, fila_excel,
        registro, opcion_ingreso, telefono,
        tipo_documento, numero_documento,
        apellidos_nombres, sexo, fecha_nacimiento,
        departamento, provincia, distrito,
        motivo_llamada, afiliacion, derivacion_interna,
        observacion, raw_json
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?::jsonb)
      """;

    jdbc.batchUpdate(sql, rows, 500, (ps, r) -> {
      ps.setLong(1, r.idCarga());
      ps.setObject(2, r.filaExcel());

      ps.setString(3, r.registro());
      ps.setString(4, r.opcionIngreso());
      ps.setString(5, r.telefono());

      ps.setString(6, r.tipoDocumento());
      ps.setString(7, r.numeroDocumento());

      ps.setString(8, r.apellidosNombres());
      ps.setString(9, r.sexo());
      ps.setString(10, r.fechaNacimiento());

      ps.setString(11, r.departamento());
      ps.setString(12, r.provincia());
      ps.setString(13, r.distrito());

      ps.setString(14, r.motivoLlamada());
      ps.setString(15, r.afiliacion());
      ps.setString(16, r.derivacionInterna());

      ps.setString(17, r.observacion());

      // raw_json: guardamos el JSON string
      ps.setString(18, r.rawJson());
    });
  }

  // helper para construir raw_json desde un Map
  public String toJson(Map<String, Object> m) {
    try {
      return om.writeValueAsString(m);
    } catch (Exception e) {
      return "{}";
    }
  }
}
