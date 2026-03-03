-- V6_8_0: Crear tabla de auditoría para eliminación de asegurados
-- El trigger audit_asegurados_delete() ya existe en BD pero faltaba esta tabla

CREATE TABLE IF NOT EXISTS audit_asegurados_deletes (
    id          SERIAL PRIMARY KEY,
    pk_asegurado VARCHAR(255),
    paciente     VARCHAR(255),
    doc_paciente VARCHAR(20),
    deleted_by   VARCHAR(255),
    operation    VARCHAR(20) DEFAULT 'DELETE',
    deleted_at   TIMESTAMP   DEFAULT NOW()
);

COMMENT ON TABLE audit_asegurados_deletes IS
    'Auditoría de asegurados eliminados — disparado por trigger audit_asegurados_delete()';
