package com.styp.cenate.config;

import lombok.Data;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
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
import com.styp.cenate.security.filter.JwtAuthenticationFilter;
import com.styp.cenate.security.service.UserDetailsServiceImpl;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

/**
 * ============================================================================
 * 🔐 CONFIGURACIÓN CENTRAL DE SEGURIDAD DEL SISTEMA CENATE
 * ============================================================================
 * Incluye:
 * - Autenticación mediante JWT
 * - Autorización basada en roles (Spring) y permisos (MBAC)
 * - CORS global
 * - Manejo personalizado de errores 401 / 403
 * ============================================================================
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
@Data
public class SecurityConfig {

        private final JwtAuthenticationFilter jwtAuthFilter;
        private final UserDetailsServiceImpl userDetailsService;

        // SEC-004: CORS configurable por ambiente
        @Value("${cors.allowed-origins:http://localhost:3000}")
        private String corsAllowedOrigins;

        // ============================================================
        // 🔰 CADENA PRINCIPAL DE FILTROS DE SEGURIDAD
        // ============================================================
        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
                http
                                .csrf(AbstractHttpConfigurer::disable)
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                                .exceptionHandling(ex -> ex
                                                .authenticationEntryPoint(new Http403ForbiddenEntryPoint())
                                                .accessDeniedHandler(accessDeniedHandler()))
                                .authorizeHttpRequests(auth -> auth

                                                // =====================================================
                                                // 🔓 ENDPOINTS PÚBLICOS
                                                // =====================================================
                                                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                                                .requestMatchers(
                                                                "/api/auth/**",
                                                                "/api/usuarios/auth/**",
                                                                "/api/public/**",
                                                                "/api/account-requests",
                                                                "/error",
                                                                "/api-docs/**",
                                                                "/actuator/health", // SEC-006: Solo health publico
                                                                "/v3/api-docs/**",
                                                                "/swagger-ui/**",
                                                                "/swagger-ui.html",
                                                                "/api/sesion/**")
                                                .permitAll()

                                                // SEC-006: Otros endpoints de actuator requieren SUPERADMIN
                                                .requestMatchers("/actuator/**").hasRole("SUPERADMIN")

                                                // =====================================================
                                                // ENDPOINTS DE CITA (POST/PUT) -Inicio CHATBOT
                                                // =====================================================

                                                // .requestMatchers(HttpMethod.POST, "/api/solicitud").permitAll()
                                                // .requestMatchers(HttpMethod.PUT, "/api/solicitud/**").permitAll()

                                                // Consulta de Paciente
                                                .requestMatchers(HttpMethod.GET, "/api/chatbot").permitAll()

                                                // Disponibilidad
                                                .requestMatchers(HttpMethod.GET, "/api/v1/chatbot/disponibilidad/**")
                                                .permitAll()
                                                .requestMatchers(HttpMethod.GET, "/api/v2/chatbot/disponibilidad/**")
                                                .permitAll()
                                                // Solicitud de Cita
                                                .requestMatchers(HttpMethod.POST, "/api/v1/chatbot/solicitud")
                                                .permitAll()

                                                // =====================================================
                                                // ENDPOINTS DE CITA (POST/PUT) -Fin CHATBOT
                                                // =====================================================

                                                // =====================================================
                                                // ENDPOINTS DE CITA (POST/PUT) -Inicio CHATBOT WEB
                                                // =====================================================
                                                .requestMatchers("/api/v1/chatbot/**").permitAll()

                                                // =====================================================
                                                // ENDPOINTS DE CITA (POST/PUT) -Inicio CHATBOT WEB
                                                // =====================================================

                                                // =====================================================
                                                // 🩺 ENDPOINTS DE SOLO LECTURA (CATÁLOGOS) - PÚBLICOS
                                                // =====================================================
                                                .requestMatchers(HttpMethod.GET,
                                                                "/api/ipress/**",
                                                                "/api/tipo-ipress/**",
                                                                "/api/area-hospitalaria/**",
                                                                "/api/redes/**",
                                                                "/api/niveles/**",
                                                                "/api/procedimientos/**",
                                                                "/api/tipo-procedimientos/**",
                                                                "/api/frm-transf-img/**",
                                                                "/api/profesiones/**",
                                                                "/api/tipos-documento/**",
                                                                "/api/regimenes/**",
                                                                "/api/regimenes-laborales",
                                                                "/api/ubicacion/**",
                                                                "/api/especialidad/**", // Especialidades médicas
                                                                                        // (singular - legacy)
                                                                "/api/especialidades/**", // Especialidades médicas
                                                                                          // (plural)
                                                                "/api/chatbot/**", // Agregando chatbot-ini
                                                                "/api/asegurados/**", // Agregando asegurados - PÚBLICO
                                                                "/api/disponibilidad/**",
                                                                "/api/servicio-essi/**",
                                                                "/api/admin/dashboard-medico/cards/activas", // ✅ Cards
                                                                                                             // activas
                                                                                                             // del
                                                                                                             // dashboard
                                                                                                             // médico
                                                                                                             // (público)
                                                                "/api/modalidades-atencion/**", // ✅ Modalidades de
                                                                                                // atención (público
                                                                                                // para dropdowns)
                                                                "/api/admin/estrategias-institucionales/activas", // ✅
                                                                                                                  // Estrategias
                                                                                                                  // institucionales
                                                                                                                  // activas
                                                                                                                  // (público
                                                                                                                  // para
                                                                                                                  // dropdowns)
                                                                "/api/admin/tipos-atencion-telemedicina/activos" // ✅
                                                // Tipos
                                                // de
                                                // atención
                                                // telemedicina
                                                // activos
                                                // (público)
                                                ).permitAll()

                                                // =====================================================
                                                // INI PERMISOS DEL USUARIO (solo autenticado)
                                                // =====================================================
                                                .requestMatchers("/api/permisos/usuario/**").authenticated()

                                                // =====================================================
                                                // FIN PERMISOS DEL USUARIO (solo autenticado)
                                                // =====================================================

                                                // =====================================================
                                                // 🧩 ADMINISTRACIÓN GENERAL
                                                // =====================================================
                                                // ⚠️ Usuarios: permitir GET para autenticados, resto solo ADMIN
                                                .requestMatchers(HttpMethod.GET, "/api/usuarios/**").authenticated()
                                                .requestMatchers(HttpMethod.POST, "/api/usuarios/**")
                                                .hasAnyRole("SUPERADMIN", "ADMIN")
                                                .requestMatchers(HttpMethod.PUT, "/api/usuarios/**")
                                                .hasAnyRole("SUPERADMIN", "ADMIN")
                                                .requestMatchers(HttpMethod.DELETE, "/api/usuarios/**")
                                                .hasAnyRole("SUPERADMIN", "ADMIN")

                                                // Otros endpoints de administración - Solo ADMIN/SUPERADMIN
                                                .requestMatchers(
                                                                "/api/admin/permisos/**",
                                                                "/api/admin/areas/**",
                                                                "/api/area/**",
                                                                "/api/admin/**",
                                                                "/api/roles/**")
                                                .hasAnyRole("SUPERADMIN", "ADMIN")

                                                // =====================================================
                                                // 🧠 MBAC (Módulo de permisos y control interno)
                                                // =====================================================
                                                .requestMatchers(
                                                                "/api/mbac/**",
                                                                "/api/permisos/**",
                                                                "/api/permiso/**")
                                                .hasAnyRole("SUPERADMIN", "ADMIN")

                                                // =====================================================
                                                // 👨‍⚕️ PERSONAL (CNT + EXTERNO) - ✅ CONTROL DE ACCESO
                                                // =====================================================
                                                // ⚠️ IMPORTANTE: Ordenar de más específico a más general

                                                // 1️⃣ Fotos públicas para todos (sin autenticación)
                                                .requestMatchers("/api/personal/foto/**").permitAll()

                                                // 2️⃣ Solo ADMIN/SUPERADMIN pueden CREAR, ACTUALIZAR, ELIMINAR
                                                .requestMatchers(HttpMethod.POST, "/api/personal/**")
                                                .hasAnyRole("SUPERADMIN", "ADMIN")
                                                .requestMatchers(HttpMethod.PUT, "/api/personal/**")
                                                .hasAnyRole("SUPERADMIN", "ADMIN")
                                                .requestMatchers(HttpMethod.DELETE, "/api/personal/**")
                                                .hasAnyRole("SUPERADMIN", "ADMIN")

                                                // 3️⃣ Cualquier usuario autenticado puede VER datos personales (GET)
                                                .requestMatchers(HttpMethod.GET, "/api/personal/**").authenticated()

                                                // Personal CNT y Externo - Solo ADMIN/SUPERADMIN
                                                .requestMatchers("/api/personal-cnt/**")
                                                .hasAnyRole("SUPERADMIN", "ADMIN")
                                                .requestMatchers("/api/personal-externo/**")
                                                .hasAnyRole("SUPERADMIN", "ADMIN")

                                                // =====================================================
                                                // 📊 DASHBOARD Y REPORTES
                                                // =====================================================
                                                .requestMatchers("/api/dashboard/**").hasAnyRole("SUPERADMIN", "ADMIN")

                                                // =====================================================
                                                // 👩‍⚕️ PACIENTES / ASEGURADOS
                                                // =====================================================
                                                .requestMatchers("/api/pacientes/**").hasAnyRole("SUPERADMIN", "ADMIN")

                                                // SEC-005: Import Excel protegido (antes era permitAll)
                                                // .requestMatchers(HttpMethod.POST, "/api/import-excel/**")
                                                // .hasAnyRole("SUPERADMIN", "ADMIN")
                                                
                                              //******************************************************************
                                              //******************************************************************
                                              // SOLO PARA PRUEBAS RAPIDAS
                                                
                                                // MODULO 107
                                                .requestMatchers(HttpMethod.GET, "/api/import-excel/**").permitAll()
                                                .requestMatchers(HttpMethod.POST, "/api/import-excel/**").permitAll()
                                                
                                                // MODULO PROGRAMACION DE HORARIO DE PROFESIONAL ASISTENCIAL
                                                .requestMatchers("/api/horarios/**").permitAll()

                                              //******************************************************************
                                              //******************************************************************
                                              //******************************************************************
                                                
                                                // =====================================================
                                                // 🔒 Cualquier otro endpoint requiere autenticación
                                                // =====================================================
                                                .anyRequest().authenticated())
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .authenticationProvider(authenticationProvider())
                                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }

        // ============================================================
        // ⚠️ HANDLER DE ACCESO DENEGADO (403)
        // ============================================================
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
                                        """
                                        .formatted(LocalDateTime.now(), request.getRequestURI());
                        response.getWriter().write(message);
                };
        }

        // ============================================================
        // SEC-004: CORS configurable por ambiente
        // ============================================================
        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration config = new CorsConfiguration();

                // Usar origenes desde application.properties/application-prod.properties
                List<String> origins = Arrays.asList(corsAllowedOrigins.split(","));
                config.setAllowedOrigins(origins);

                config.setAllowedMethods(Arrays.asList(
                                "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));

                config.setAllowedHeaders(Arrays.asList("*"));
                config.setExposedHeaders(Arrays.asList(
                                "Authorization",
                                "Content-Disposition"));

                config.setAllowCredentials(true);
                config.setMaxAge(3600L);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", config);
                return source;
        }

        // ============================================================
        // 🔐 PROVEEDOR DE AUTENTICACIÓN
        // ============================================================
        @Bean
        public AuthenticationProvider authenticationProvider() {
                DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
                provider.setUserDetailsService(userDetailsService);
                provider.setPasswordEncoder(passwordEncoder());
                return provider;
        }

        // ============================================================
        // ⚙️ AUTH MANAGER
        // ============================================================
        @Bean
        public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
                return config.getAuthenticationManager();
        }

        // ============================================================
        // 🔑 PASSWORD ENCODER - BCrypt con strength 12 (MÁS SEGURO)
        // ============================================================
        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder(12);
        }
}
