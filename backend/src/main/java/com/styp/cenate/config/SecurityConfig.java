package com.styp.cenate.config;

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
import com.styp.cenate.security.filter.JwtAuthenticationFilter;
import com.styp.cenate.security.service.UserDetailsServiceImpl;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

/**
 * ============================================================================
 * 🔐 CONFIGURACIÓN CENTRAL DE SEGURIDAD DEL SISTEMA CENATE
 * ============================================================================
 * Define:
 *  - Autenticación mediante JWT
 *  - Autorización basada en roles/permisos
 *  - CORS global
 *  - Manejo personalizado de errores 401 y 403
 * ============================================================================
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final UserDetailsServiceImpl userDetailsService;

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
                        .accessDeniedHandler(accessDeniedHandler())
                )
                .authorizeHttpRequests(auth -> auth

                        // =====================================================
                        // 🔓 ENDPOINTS PÚBLICOS
                        // =====================================================
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
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
                        // 🩺 ENDPOINTS DE SOLO LECTURA (CATÁLOGOS)
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
                        // 🧩 MÓDULO DE ADMINISTRACIÓN Y GESTIÓN
                        // =====================================================
                        .requestMatchers(
                                "/api/admin/permisos/**",
                                "/api/admin/areas/**",
                                "/api/area/**",               // ✅ añadido explícitamente
                                "/api/admin/**",
                                "/api/roles/**",
                                "/api/usuarios/**"
                        ).hasAnyRole("SUPERADMIN", "ADMIN")

                        // =====================================================
                        // 🧰 MÓDULO MBAC Y SEGURIDAD INTERNA
                        // =====================================================
                        .requestMatchers(
                                "/api/mbac/**",
                                "/api/permisos/**",
                                "/api/permiso/**"
                        ).hasAnyAuthority(
                                "ROLE_SUPERADMIN", "ROLE_ADMIN",
                                "GESTIONAR_MODULOS", "GESTIONAR_PERMISOS",
                                "EDITAR_PERMISOS", "CREAR_PERMISOS", "VER_PERMISOS"
                        )

                        // =====================================================
                        // 👩‍⚕️ PERSONAL CNT
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
                                "ROLE_SUPERADMIN", "ROLE_ADMIN", "GESTIONAR_PERSONAL_EXTERNOS"
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
                        // 🔒 Cualquier otro endpoint requiere autenticación
                        // =====================================================
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
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
            """.formatted(LocalDateTime.now(), request.getRequestURI());
            response.getWriter().write(message);
        };
    }

    // ============================================================
    // 🌍 CONFIGURACIÓN GLOBAL CORS
    // ============================================================
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(Arrays.asList(
                "http://localhost",
                "http://localhost:80",
                "http://localhost:5173",
                "http://127.0.0.1",
                "http://127.0.0.1:5173",
                "http://10.0.89.13",
                "http://10.0.89.239",
                "http://10.0.89.239:5173"
        ));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("Authorization"));
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
    // 🔑 PASSWORD ENCODER
    // ============================================================
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);
    }
}