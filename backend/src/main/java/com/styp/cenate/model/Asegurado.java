package com.styp.cenate.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "asegurados")
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

    @Column(name = "tipo_seguro")
    private String tipoSeguro;

    @Column(name = "cas_adscripcion")
    private String casAdscripcion;

    @Column(name = "periodo")
    private String periodo;

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

    public String getTipoSeguro() { return tipoSeguro; }
    public void setTipoSeguro(String tipoSeguro) { this.tipoSeguro = tipoSeguro; }

    public String getCasAdscripcion() { return casAdscripcion; }
    public void setCasAdscripcion(String casAdscripcion) { this.casAdscripcion = casAdscripcion; }

    public String getPeriodo() { return periodo; }
    public void setPeriodo(String periodo) { this.periodo = periodo; }
}
