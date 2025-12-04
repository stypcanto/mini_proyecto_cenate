package com.styp.cenate.utils;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * Clase de utilidad para generar hash BCrypt de contraseñas.
 * ✅ Se puede ejecutar directamente con main()
 */
public class GenerarHash {

    public static void main(String[] args) {
        // Inicializa el encoder BCrypt con fuerza 12 (igual que SecurityConfig)
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);

        // Cambia esta contraseña por la que quieras generar el hash
        String password = "@Rodrigo28";

        // Genera el hash
        String hashed = encoder.encode(password);

        // Imprime resultados en consola
        System.out.println("Password original: " + password);
        System.out.println("Hash BCrypt generado: " + hashed);
        System.out.println("\n-- SQL para actualizar:");
        System.out.println("UPDATE dim_usuarios SET pass_user = '" + hashed + "' WHERE name_user = '44914706';");
    }
}