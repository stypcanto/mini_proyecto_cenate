package styp.com.cenate.config;

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
 * 📘 Configuración de Swagger / OpenAPI 3
 * Permite documentar y probar los endpoints del sistema CENATE
 * Incluye soporte para JWT Authentication (Bearer Token)
 */
@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        final String securitySchemeName = "bearerAuth";

        return new OpenAPI()
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
                // 🔐 Autenticación con JWT
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName,
                                new SecurityScheme()
                                        .name(securitySchemeName)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("""
                                                Ingresa tu token JWT generado desde el endpoint /api/auth/login
                                                Ejemplo:
                                                ```
                                                Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
                                                ```
                                                """)));
    }
}