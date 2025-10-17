package com.styp.cenate.model;

import jakarta.persistence.*;
import java.time.LocalDate;

/**
 * 🩺 Entidad JPA que representa a un paciente asegurado en el sistema CENATE.
 * Mapea la tabla "asegurados" de la base de datos PostgreSQL.
 *
 * 🔹 Notas técnicas:
 *  - Usa el campo "doc_paciente" como clave primaria.
 *  - Compatible con Hibernate (Spring Data JPA).
 *  - Incluye anotaciones @Column explícitas para mantener consistencia con la BD.
 */
@Entity
@Table(name = "asegurados")
public class Paciente {

    // ------------------------------------------------------------------------
    // 🆔 Clave primaria
    // ------------------------------------------------------------------------
    @Id
    @Column(name = "doc_paciente", nullable = false, length = 20)
    private String docPaciente;

    // ------------------------------------------------------------------------
    // 👤 Datos personales
    // ------------------------------------------------------------------------
    @Column(name = "paciente", nullable = false, length = 150)
    private String nombre;

    @Column(name = "fecnacimpaciente")
    private LocalDate fechaNacimiento;

    @Column(name = "sexo", length = 1)
    private String sexo; // Ejemplo: "M", "F", "O"

    // ------------------------------------------------------------------------
    // ⚙️ Constructores
    // ------------------------------------------------------------------------
    public Paciente() {
        // Constructor vacío obligatorio para JPA
    }

    public Paciente(String docPaciente, String nombre, LocalDate fechaNacimiento, String sexo) {
        this.docPaciente = docPaciente;
        this.nombre = nombre;
        this.fechaNacimiento = fechaNacimiento;
        this.sexo = sexo;
    }

    // ------------------------------------------------------------------------
    // 🧩 Getters y Setters
    // ------------------------------------------------------------------------
    public String getDocPaciente() {
        return docPaciente;
    }

    public void setDocPaciente(String docPaciente) {
        this.docPaciente = docPaciente;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public LocalDate getFechaNacimiento() {
        return fechaNacimiento;
    }

    public void setFechaNacimiento(LocalDate fechaNacimiento) {
        this.fechaNacimiento = fechaNacimiento;
    }

    public String getSexo() {
        return sexo;
    }

    public void setSexo(String sexo) {
        this.sexo = sexo;
    }

    // ------------------------------------------------------------------------
    // 🧠 Métodos utilitarios (opcionales)
    // ------------------------------------------------------------------------
    @Override
    public String toString() {
        return "Paciente{" +
                "docPaciente='" + docPaciente + '\'' +
                ", nombre='" + nombre + '\'' +
                ", fechaNacimiento=" + fechaNacimiento +
                ", sexo='" + sexo + '\'' +
                '}';
    }
}