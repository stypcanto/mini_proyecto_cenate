package com.styp.cenate.model;
import lombok.Data;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Arrays;
import java.util.stream.Collectors;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;

@Entity
@Table(name = "asegurados")
@Data
public class Asegurado {

    @Id
    @Column(name = "pk_asegurado")
    private String pkAsegurado;

    @Column(name = "doc_paciente")
    private String docPaciente;

    @Column(name = "paciente")
    private String paciente;

    @Column(name = "fecnacimpaciente")
    private LocalDate fecnacimpaciente;

    @Column(name = "sexo")
    private String sexo;

    @Column(name = "tipo_paciente")
    private String tipoPaciente;

    @Column(name = "tel_fijo")
    private String telFijo;

    @Column(name = "tel_celular")
    private String telCelular;

    @Column(name = "tipo_seguro")
    private String tipoSeguro;

    @Column(name = "cas_adscripcion")
    private String casAdscripcion;

    @Column(name = "periodo")
    private String periodo;

    @Column(name = "correo_electronico")
    private String correoElectronico;

    @Column(name = "vigencia", nullable = false)
    private Boolean vigencia;

    // ✅ v1.47.2: Array de enfermedades crónicas (TEXT[] en PostgreSQL)
    @Column(name = "enfermedad_cronica", columnDefinition = "text[]")
    private String[] enfermedadCronica;

    // Getters y Setters
    public String getPkAsegurado() { return pkAsegurado; }
    public void setPkAsegurado(String pkAsegurado) { this.pkAsegurado = pkAsegurado; }

    public String getDocPaciente() { return docPaciente; }
    public void setDocPaciente(String docPaciente) { this.docPaciente = docPaciente; }

    public String getPaciente() { return paciente; }
    public void setPaciente(String paciente) { this.paciente = paciente; }

    public LocalDate getFecnacimpaciente() { return fecnacimpaciente; }
    public void setFecnacimpaciente(LocalDate fecnacimpaciente) { this.fecnacimpaciente = fecnacimpaciente; }

    public String getSexo() { return sexo; }
    public void setSexo(String sexo) { this.sexo = sexo; }

    public String getTipoPaciente() { return tipoPaciente; }
    public void setTipoPaciente(String tipoPaciente) { this.tipoPaciente = tipoPaciente; }

    public String getTelFijo() { return telFijo; }
    public void setTelFijo(String telFijo) { this.telFijo = telFijo; }

    public String getTelCelular() { return telCelular; }
    public void setTelCelular(String telCelular) { this.telCelular = telCelular; }

    public String getTipoSeguro() { return tipoSeguro; }
    public void setTipoSeguro(String tipoSeguro) { this.tipoSeguro = tipoSeguro; }

    public String getCasAdscripcion() { return casAdscripcion; }
    public void setCasAdscripcion(String casAdscripcion) { this.casAdscripcion = casAdscripcion; }

    public String getPeriodo() { return periodo; }
    public void setPeriodo(String periodo) { this.periodo = periodo; }

    public String getCorreoElectronico() { return correoElectronico; }
    public void setCorreoElectronico(String correoElectronico) { this.correoElectronico = correoElectronico; }

    public Boolean getVigencia() { return vigencia; }
    public void setVigencia(Boolean vigencia) { this.vigencia = vigencia; }

    public String[] getEnfermedadCronica() { return enfermedadCronica; }
    public void setEnfermedadCronica(String[] enfermedadCronica) { this.enfermedadCronica = enfermedadCronica; }
}
