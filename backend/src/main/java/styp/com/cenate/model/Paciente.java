package styp.com.cenate.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "asegurados")
public class Paciente {

    @Id
    @Column(name = "doc_paciente")
    private String docPaciente;

    @Column(name = "paciente")
    private String nombre;

    @Column(name = "fecnacimpaciente")
    private LocalDate fechaNacimiento;

    @Column(name = "sexo")
    private String sexo;

    // Getters y Setters
    public String getDocPaciente() { return docPaciente; }
    public void setDocPaciente(String docPaciente) { this.docPaciente = docPaciente; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public LocalDate getFechaNacimiento() { return fechaNacimiento; }
    public void setFechaNacimiento(LocalDate fechaNacimiento) { this.fechaNacimiento = fechaNacimiento; }

    public String getSexo() { return sexo; }
    public void setSexo(String sexo) { this.sexo = sexo; }
}
