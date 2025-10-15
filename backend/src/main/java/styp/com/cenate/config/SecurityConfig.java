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

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final UserDetailsServiceImpl userDetailsService;

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
                        // ✅ Endpoints públicos generales
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(
                                "/api/auth/**",
                                "/api/public/**",
                                "/api/account-requests",
                                "/error",
                                "/health",
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html"
                        ).permitAll()

                        // ✅ Nuevos módulos de datos básicos (públicos)
                        .requestMatchers(HttpMethod.GET,
                                "/api/entidad/redes/**",
                                "/api/entidad/niveles/**",
                                "/api/entidad/procedimientos/**",
                                "/api/entidad/tipo-procedimientos/**",
                                "/api/entidad/area-hospitalaria/**",
                                "/api/entidad/ipress/**",
                                "/api/entidad/frm-transf-img/**"
                        ).permitAll()

                        // 👨‍⚕️ Personal CNT
                        .requestMatchers("/api/personal-cnt/**").hasAnyAuthority(
                                "ROLE_SUPERADMIN", "ROLE_ADMIN",
                                "VER_PERSONAL", "CREAR_PERSONAL", "EDITAR_PERSONAL", "ELIMINAR_PERSONAL"
                        )

                        // 🔐 Administración
                        .requestMatchers("/api/admin/**").hasAuthority("ROLE_SUPERADMIN")
                        .requestMatchers("/api/usuarios/**").hasAnyAuthority("ROLE_SUPERADMIN", "ROLE_ADMIN")

                        // 👨‍⚕️ Áreas médicas
                        .requestMatchers("/api/medico/**", "/api/laboratorio/**", "/api/radiologia/**")
                        .hasAnyAuthority("ROLE_SUPERADMIN", "ROLE_ADMIN", "ROLE_MEDICO", "ROLE_LABORATORIO", "ROLE_RADIOLOGIA")

                        // 🧠 Psicología y terapias
                        .requestMatchers("/api/psicologia/**", "/api/terapia/**", "/api/nutricion/**")
                        .hasAnyAuthority("ROLE_SUPERADMIN", "ROLE_ADMIN", "ROLE_PSICOLOGO", "ROLE_TERAPISTA_FISI", "ROLE_TERAPISTA_LENG", "ROLE_NUTRICION")

                        // 🏢 Áreas administrativas
                        .requestMatchers("/api/transferencias/**", "/api/auditoria/**", "/api/externos/**")
                        .hasAnyAuthority("ROLE_SUPERADMIN", "ROLE_ADMIN")

                        // 🔒 Todo lo demás requiere autenticación
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // ⚠️ Manejador personalizado para respuestas 403
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
                "message": "🚫 Acceso restringido: no tienes los permisos necesarios para realizar esta acción.",
                "tip": "Si crees que esto es un error, contacta al administrador del sistema o revisa tus credenciales."
            }
            """.formatted(LocalDateTime.now(), request.getRequestURI());
            response.getWriter().write(message);
        };
    }

    // 🌍 Configuración CORS global
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(Arrays.asList(
                "http://localhost:5173",
                "http://localhost:3000",
                "http://127.0.0.1:5173",
                "http://10.0.89.13:5173",
                "http://10.0.89.239"
        ));
        config.addAllowedOriginPattern("*");
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("Authorization"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    // 🧱 Configuración de autenticación y encriptación
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config)
            throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);
    }
}