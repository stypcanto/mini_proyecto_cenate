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
                // 🔐 Desactiva CSRF y activa CORS global
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // ⚠️ Manejadores personalizados para errores
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(new Http403ForbiddenEntryPoint())
                        .accessDeniedHandler(accessDeniedHandler())
                )

                // 🛡️ Autorización por rutas
                .authorizeHttpRequests(auth -> auth

                        // ✅ Endpoints públicos
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

                        // ✅ Datos generales (acceso libre GET)
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

                        // 👨‍⚕️ Personal CNT (acceso controlado)
                        .requestMatchers("/api/personal-cnt/**").hasAnyAuthority(
                                "ROLE_SUPERADMIN", "ROLE_ADMIN",
                                "GESTIONAR_PERSONAL_CNT", "VER_PERSONAL_CNT",
                                "CREAR_PERSONAL_CNT", "EDITAR_PERSONAL_CNT", "ELIMINAR_PERSONAL_CNT"
                        )

                        // 👩‍⚕️ Personal Externo
                        .requestMatchers("/api/personal-externo/**").hasAnyAuthority(
                                "ROLE_SUPERADMIN", "ROLE_ADMIN", "GESTIONAR_PERSONAL_EXTERNOS"
                        )

                        // 🧰 Administración
                        .requestMatchers("/api/admin/**", "/api/usuarios/**").hasAnyAuthority(
                                "ROLE_SUPERADMIN", "ROLE_ADMIN"
                        )

                        // 📊 Dashboard
                        .requestMatchers("/api/dashboard/**").hasAnyAuthority(
                                "ROLE_SUPERADMIN", "ROLE_ADMIN", "VER_REPORTES"
                        )

                        // 🔒 Todo lo demás requiere autenticación
                        .anyRequest().authenticated()
                )

                // 🚫 Sin sesiones (JWT stateless)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // 🔧 Configura proveedor de autenticación
                .authenticationProvider(authenticationProvider())

                // 🧩 Filtro JWT
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // ⚠️ Manejador personalizado para errores 403
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

    // 🌍 CORS global
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(Arrays.asList(
                "http://localhost:5173",
                "http://localhost:3000",
                "http://127.0.0.1:5173",
                "http://10.0.89.13:5173",
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

    // 🔐 Proveedor de autenticación (DaoAuthenticationProvider)
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    // ⚙️ Manager para AuthController
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    // 🔑 PasswordEncoder con BCrypt
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);
    }
}