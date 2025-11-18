package com.styp.cenate.model;


import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;

import org.hibernate.annotations.Immutable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "vw_disponibilidad_chatbot", schema = "public")
@Immutable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VWDisponibilidadAtenciones {
	
	
	@Id
    @Column(name = "pk_disponibilidad")          
    private String pkDisponibilidad;              // text 

    @Column(name = "periodo", length = 6)
    private String periodo;

    @Column(name = "area", length = 255)
    private String area;

    @Column(name = "servicio")                    // text
    private String servicio;

    @Column(name = "actividad")                   // text
    private String actividad;

    @Column(name = "subactividad")                // text
    private String subactividad;

    @Column(name = "num_doc_pers", length = 20)
    private String numDocPers;

    @Column(name = "profesional")                 // text
    private String profesional;

    @Column(name = "turno", length = 20)
    private String turno;

    @Column(name = "fecha_cita")
    private LocalDate fechaCita;

    @Column(name = "hora_cita")
    private LocalTime horaCita;

    @Column(name = "estado")
    private String estado;

    @Column(name = "doc_paciente", length = 15)
    private String docPaciente;

    @Column(name = "nombres_paciente")            // text
    private String nombresPaciente;

    @Column(name = "sexo")                        // char
    private String sexo;

    @Column(name = "edad")
    private Integer edad;

    @Column(name = "telefono", length = 15)
    private String telefono;

    @Column(name = "fecha_solicitud", columnDefinition = "timestamptz")
    private OffsetDateTime fechaSolicitud;

    @Column(name = "fecha_actualiza", columnDefinition = "timestamptz")
    private OffsetDateTime fechaActualiza;

    @Column(name = "id_pers")
    private Long idPers;

    @Column(name = "id_servicio")
    private Long idServicio;

    @Column(name = "id_actividad")
    private Long idActividad;

    @Column(name = "id_subactividad")
    private Long idSubactividad;
	
	
	
	

}
