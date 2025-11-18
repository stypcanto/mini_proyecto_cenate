package com.styp.cenate.config;
import lombok.Data;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * 📘 Configuración de Swagger / OpenAPI 3 para el sistema CENATE.
 *
 * Permite documentar y probar todos los endpoints del backend,
 * incluyendo módulos de autenticación, gestión de personal y permisos.
 *
 * ✅ Incluye soporte para autenticación JWT (Bearer Token)
 * accesible desde el botón "Authorize" en Swagger UI.
 */
@Configuration
@Data
public class SwaggerConfig {

    private static final String SECURITY_SCHEME_NAME = "bearerAuth";

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                // 📋 Información general de la API
                .info(new Info()
                        .title("🩺 API CENATE - Sistema de Gestión de Servicios Médicos")
                        .version("v1.0.0")
                        .description("""
                                Este backend expone los endpoints principales del sistema CENATE,
                                incluyendo módulos de autenticación, gestión de personal, entidades clínicas,
                                procedimientos médicos, redes y transferencia de imágenes diagnósticas.
                                                                
                                🔐 *Para probar endpoints protegidos, agrega un JWT en el botón “Authorize”*.
                                """)
                        .contact(new Contact()
                                .name("Equipo de Desarrollo CENATE")
                                .email("soporte@cenate.gob.pe")
                                .url("https://cenate.gob.pe"))
                        .license(new License()
                                .name("Licencia Interna ESSALUD")
                                .url("https://www.essalud.gob.pe"))
                )
                // 🔒 Configuración de seguridad (JWT)
                .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME_NAME))
                .components(new Components()
                        .addSecuritySchemes(SECURITY_SCHEME_NAME,
                                new SecurityScheme()
                                        .name(SECURITY_SCHEME_NAME)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("""
                                                Ingresa tu token JWT generado desde el endpoint `/api/auth/login`.
                                                Ejemplo:
                                                ```
                                                Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
                                                ```
                                                """)));
    }
}