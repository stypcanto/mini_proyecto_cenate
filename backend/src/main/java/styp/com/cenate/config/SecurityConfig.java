package styp.com.cenate.config;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.authentication.Http403ForbiddenEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import styp.com.cenate.security.filter.JwtAuthenticationFilter;
import styp.com.cenate.security.service.UserDetailsServiceImpl;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

/**
 * ============================================================================
 * 🔐 CONFIGURACIÓN CENTRAL DE SEGURIDAD DEL SISTEMA CENATE
 * ============================================================================
 *
 * Este archivo define la configuración de seguridad principal:
 *  - Autenticación mediante JWT (stateless)
 *  - Autorización granular por roles y permisos MBAC
 *  - CORS global para frontend (React, Nginx, Docker)
 *  - Manejadores personalizados para errores 401 y 403
 *
 * Compatible con:
 *  ✅ Spring Boot 3.5.x
 *  ✅ Java 17+
 *  ✅ Frontend en React/Vite/Nginx
 * ============================================================================
 */

@Configuration
@EnableWebSecurity
@EnableMethodSecurity // Permite el uso de @PreAuthorize en controladores si se necesita
@RequiredArgsConstructor
public class SecurityConfig {

    // =========================================================================
    // 🧩 Dependencias inyectadas
    // =========================================================================
    private final JwtAuthenticationFilter jwtAuthFilter;
    private final UserDetailsServiceImpl userDetailsService;

    // =========================================================================
    // 🚧 Filtro principal de seguridad (SecurityFilterChain)
    // =========================================================================
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // 🔒 Desactiva CSRF (ya que usamos JWT) y habilita CORS global
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // ⚠️ Manejo personalizado de errores 401 y 403
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(new Http403ForbiddenEntryPoint()) // 401 → No autenticado
                        .accessDeniedHandler(accessDeniedHandler()) // 403 → Acceso denegado
                )

                // 🧭 Configura las reglas de autorización por rutas
                .authorizeHttpRequests(auth -> auth

                        // =====================================================
                        // 🔓 ENDPOINTS PÚBLICOS (no requieren autenticación)
                        // =====================================================
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() // Preflight requests (CORS)
                        .requestMatchers(
                                "/api/auth/**",
                                "/api/public/**",
                                "/api/account-requests",
                                "/error",
                                "/actuator/**",
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html"
                        ).permitAll()

                        // =====================================================
                        // 📘 ENDPOINTS DE DATOS GENERALES (solo lectura)
                        // =====================================================
                        .requestMatchers(HttpMethod.GET,
                                "/api/ipress/**",
                                "/api/tipo-ipress/**",
                                "/api/area-hospitalaria/**",
                                "/api/redes/**",
                                "/api/niveles/**",
                                "/api/procedimientos/**",
                                "/api/tipo-procedimientos/**",
                                "/api/frm-transf-img/**"
                        ).permitAll()

                        // =====================================================
                        // 👩‍⚕️ PERSONAL CNT (solo roles autorizados)
                        // =====================================================
                        .requestMatchers("/api/personal-cnt/**").hasAnyAuthority(
                                "ROLE_SUPERADMIN", "ROLE_ADMIN",
                                "GESTIONAR_PERSONAL_CNT", "VER_PERSONAL_CNT",
                                "CREAR_PERSONAL_CNT", "EDITAR_PERSONAL_CNT", "ELIMINAR_PERSONAL_CNT"
                        )

                        // =====================================================
                        // 👨‍⚕️ PERSONAL EXTERNO
                        // =====================================================
                        .requestMatchers("/api/personal-externo/**").hasAnyAuthority(
                                "ROLE_SUPERADMIN", "ROLE_ADMIN",
                                "GESTIONAR_PERSONAL_EXTERNOS"
                        )

                        // =====================================================
                        // 🧩 MÓDULO MBAC (permisos, auditorías, módulos)
                        // =====================================================
                        .requestMatchers("/api/mbac/**", "/api/permisos/**", "/api/permiso/**").hasAnyAuthority(
                                "ROLE_SUPERADMIN", "ROLE_ADMIN",
                                "GESTIONAR_MODULOS", "VER_PERMISOS",
                                "EDITAR_PERMISOS", "CREAR_PERMISOS"
                        )

                        // =====================================================
                        // 🧰 ADMINISTRACIÓN Y USUARIOS
                        // =====================================================
                        .requestMatchers("/api/admin/**", "/api/usuarios/**", "/api/roles/**").hasAnyAuthority(
                                "ROLE_SUPERADMIN", "ROLE_ADMIN"
                        )

                        // =====================================================
                        // 📊 DASHBOARD Y REPORTES
                        // =====================================================
                        .requestMatchers("/api/dashboard/**").hasAnyAuthority(
                                "ROLE_SUPERADMIN", "ROLE_ADMIN", "VER_REPORTES"
                        )

                        // =====================================================
                        // 👩‍⚕️ PACIENTES / ASEGURADOS
                        // =====================================================
                        .requestMatchers("/api/pacientes/**").hasAnyAuthority(
                                "ROLE_SUPERADMIN", "ROLE_ADMIN", "VER_PACIENTES"
                        )

                        // =====================================================
                        // 🔒 TODO LO DEMÁS: requiere autenticación
                        // =====================================================
                        .anyRequest().authenticated()
                )

                // =============================================================
                // 🚫 Sin sesiones (modo stateless por uso de JWT)
                // =============================================================
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // =============================================================
                // ⚙️ Proveedor de autenticación y filtro JWT
                // =============================================================
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // =========================================================================
    // ⚠️ Manejador personalizado para respuestas HTTP 403 (acceso denegado)
    // =========================================================================
    @Bean
    public AccessDeniedHandler accessDeniedHandler() {
        return (request, response, accessDeniedException) -> {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("application/json");
            String message = """
            {
                "status": 403,
                "timestamp": "%s",
                "path": "%s",
                "message": "🚫 Acceso restringido: no tienes permisos para realizar esta acción.",
                "tip": "Si crees que esto es un error, contacta al administrador del sistema."
            }
            """.formatted(LocalDateTime.now(), request.getRequestURI());
            response.getWriter().write(message);
        };
    }

    // =========================================================================
    // 🌍 Configuración CORS GLOBAL
    // =========================================================================
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // 🌐 Dominios permitidos (local + LAN + Docker)
        config.setAllowedOrigins(Arrays.asList(
                "http://localhost",
                "http://localhost:80",
                "http://localhost:5173",
                "http://localhost:3000",
                "http://127.0.0.1",
                "http://127.0.0.1:5173",
                "http://10.0.89.13",
                "http://10.0.89.239",
                "http://10.0.89.239:5173"
        ));

        // ✅ Métodos HTTP y cabeceras
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("Authorization"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L); // 1 hora

        // 🔁 Registro global
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    // =========================================================================
    // 🔐 Proveedor de autenticación (DaoAuthenticationProvider)
    // =========================================================================
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService); // usa UserDetailsServiceImpl
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    // =========================================================================
    // ⚙️ Manager de autenticación (para AuthController)
    // =========================================================================
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    // =========================================================================
    // 🔑 Codificador de contraseñas (BCrypt)
    // =========================================================================
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10); // fuerza 10 → seguro y razonablemente rápido
    }
}