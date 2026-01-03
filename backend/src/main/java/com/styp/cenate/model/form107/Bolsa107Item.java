package com.styp.cenate.model.form107;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZonedDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "bolsa_107_item", schema = "public")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Bolsa107Item {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_item")
    private Long idItem;

    @Column(name = "id_carga", nullable = false)
    private Long idCarga;

    @Column(name = "fecha_reporte", nullable = false)
    private LocalDate fechaReporte;

    @Column(name = "registro", nullable = false)
    private String registro;

    @Column(name = "tipo_documento", length = 10)
    private String tipoDocumento;

    @Column(name = "numero_documento", length = 20)
    private String numeroDocumento;

    @Column(name = "paciente")
    private String paciente;

    @Column(name = "sexo", length = 1)
    private String sexo;

    @Column(name = "fecha_nacimiento")
    private LocalDate fechaNacimiento;

    @Column(name = "telefono", length = 30)
    private String telefono;

    @Column(name = "tel_celular", length = 30)
    private String telCelular;

    @Column(name = "correo_electronico", length = 100)
    private String correoElectronico;

    @Column(name = "cod_ipress", length = 10)
    private String codIpress;

    @Column(name = "opcion_ingreso")
    private String opcionIngreso;

    @Column(name = "motivo_llamada")
    private String motivoLlamada;

    @Column(name = "afiliacion")
    private String afiliacion;

    @Column(name = "derivacion_interna")
    private String derivacionInterna;

    @Column(name = "id_servicio_essi")
    private Integer idServicioEssi;

    @Column(name = "cod_servicio_essi", length = 30)
    private String codServicioEssi;

    @Column(name = "departamento")
    private String departamento;

    @Column(name = "provincia")
    private String provincia;

    @Column(name = "distrito")
    private String distrito;

    @Column(name = "observacion_origen")
    private String observacionOrigen;

    @Column(name = "id_estado", nullable = false)
    private Integer idEstado;

    @Column(name = "rol_asignado")
    private String rolAsignado;

    @Column(name = "usuario_asignado")
    private String usuarioAsignado;

    @Column(name = "observacion_gestion")
    private String observacionGestion;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @Column(name = "id_admisionista_asignado")
    private Long idAdmisionistaAsignado;

    @Column(name = "fecha_asignacion_admisionista")
    private ZonedDateTime fechaAsignacionAdmisionista;

    @Column(name = "id_gestor_asignado")
    private Long idGestorAsignado;

    @Column(name = "fecha_asignacion_gestor")
    private ZonedDateTime fechaAsignacionGestor;

    @Column(name = "tipo_apoyo")
    private String tipoApoyo;

    @Column(name = "fecha_programacion")
    private java.time.LocalDate fechaProgramacion;

    @Column(name = "turno", length = 20)
    private String turno;

    @Column(name = "profesional", length = 200)
    private String profesional;

    @Column(name = "dni_profesional", length = 20)
    private String dniProfesional;

    @Column(name = "especialidad", length = 100)
    private String especialidad;
}