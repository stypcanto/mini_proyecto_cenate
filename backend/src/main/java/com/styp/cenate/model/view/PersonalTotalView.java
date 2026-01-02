package com.styp.cenate.model.view;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Immutable;
import java.time.LocalDate;
import java.math.BigInteger;

@Entity
@Table(name = "vw_personal_total")
@Immutable
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PersonalTotalView {

    @Id
    @Column(name = "id_personal")
    private Long idPersonal;

    @Column(name = "nombres")
    private String nombres;

    @Column(name = "apellido_paterno")
    private String apellidoPaterno;

    @Column(name = "apellido_materno")
    private String apellidoMaterno;

    @Column(name = "numero_documento")
    private String numeroDocumento;

    @Column(name = "tipo_documento")
    private String tipoDocumento;

    @Column(name = "fecha_nacimiento")
    private LocalDate fechaNacimiento;

    @Column(name = "edad")
    private Integer edad;

    @Column(name = "mes_cumpleanos")
    private String mesCumpleanos;

    @Column(name = "cumpleanos_este_anio")
    private LocalDate cumpleanosEsteAnio;

    @Column(name = "genero")
    private String genero;

    @Column(name = "correo_institucional")
    private String correoInstitucional;

    @Column(name = "correo_personal")
    private String correoPersonal;

    @Column(name = "telefono")
    private String telefono;

    @Column(name = "direccion")
    private String direccion;

    @Column(name = "foto_url")
    private String fotoUrl;

    @Column(name = "id_distrito")
    private Long idDistrito;

    @Column(name = "nombre_distrito")
    private String nombreDistrito;

    @Column(name = "nombre_provincia")
    private String nombreProvincia;

    @Column(name = "nombre_departamento")
    private String nombreDepartamento;

    @Column(name = "id_ipress")
    private Long idIpress;

    @Column(name = "nombre_ipress")
    private String nombreIpress;

    @Column(name = "id_area")
    private Long idArea;

    @Column(name = "nombre_area")
    private String nombreArea;

    @Column(name = "id_regimen")
    private Long idRegimen;

    @Column(name = "nombre_regimen")
    private String nombreRegimen;

    @Column(name = "codigo_planilla")
    private String codigoPlanilla;

    @Column(name = "estado")
    private String estado;

    @Column(name = "colegiatura")
    private String colegiatura;

    @Column(name = "id_usuario")
    private Long idUsuario;

    @Column(name = "username")
    private String username;

    @Column(name = "rol_usuario")
    private String rolUsuario;

    @Column(name = "tipo_personal_detalle")
    private String tipoPersonalDetalle;

    @Column(name = "profesion")
    private String profesion;

    @Column(name = "especialidad")
    private String especialidad;

    @Column(name = "rne_especialidad")
    private String rneEspecialidad;

    @Column(name = "tipo_personal")
    private String tipoPersonal;

    @Column(name = "institucion")
    private String institucion;
}
