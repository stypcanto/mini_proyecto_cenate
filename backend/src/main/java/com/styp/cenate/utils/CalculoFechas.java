package com.styp.cenate.utils;

import java.time.LocalDate;
import java.time.Period;

public class CalculoFechas {
	
	
	  public static int calcularEdad(LocalDate fechaNacimiento) {
	        if (fechaNacimiento == null) {
	            throw new IllegalArgumentException("La fecha de nacimiento no puede ser nula");
	        }
	        return Period.between(fechaNacimiento, LocalDate.now()).getYears();
	    }

}
