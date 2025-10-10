package styp.com.cenate.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
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
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import styp.com.cenate.security.JwtAuthenticationFilter;
import styp.com.cenate.security.UserDetailsServiceImpl;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final UserDetailsServiceImpl userDetailsService;

    // ===========================================================
    // 🔐 CONFIGURACIÓN DE SEGURIDAD PRINCIPAL
    // ===========================================================
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // 🚫 Desactivar CSRF (ya que usamos JWT)
                .csrf(AbstractHttpConfigurer::disable)

                // 🌐 Habilitar configuración CORS personalizada
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // 🧭 Configurar rutas públicas y protegidas
                .authorizeHttpRequests(auth -> auth

                        // Endpoints públicos
                        .requestMatchers(
                                "/api/auth/**",
                                "/api/public/**",
                                "/error",
                                "/hello"
                        ).permitAll()

                        // 👑 SuperAdmin
                        .requestMatchers("/api/admin/**").hasRole("SUPERADMIN")

                        // 👥 Gestión de usuarios
                        .requestMatchers("/api/usuarios/**").hasAnyRole("SUPERADMIN", "ADMIN")

                        // 🩺 Áreas médicas
                        .requestMatchers("/api/medico/**").hasAnyRole("SUPERADMIN", "ADMIN", "MEDICO", "ENFERMERIA", "OBSTETRA")

                        // 🧪 Diagnóstico y farmacia
                        .requestMatchers("/api/laboratorio/**").hasAnyRole("SUPERADMIN", "ADMIN", "LABORATORIO")
                        .requestMatchers("/api/radiologia/**").hasAnyRole("SUPERADMIN", "ADMIN", "RADIOLOGIA")
                        .requestMatchers("/api/farmacia/**").hasAnyRole("SUPERADMIN", "ADMIN", "FARMACIA")

                        // 🧠 Psicología, terapias y nutrición
                        .requestMatchers("/api/psicologia/**").hasAnyRole("SUPERADMIN", "ADMIN", "PSICOLOGO")
                        .requestMatchers("/api/terapia/**").hasAnyRole("SUPERADMIN", "ADMIN", "TERAPISTA_FISI", "TERAPISTA_LENG")
                        .requestMatchers("/api/nutricion/**").hasAnyRole("SUPERADMIN", "ADMIN", "NUTRICION")

                        // 📋 Áreas administrativas
                        .requestMatchers("/api/admisiones/**").hasAnyRole("SUPERADMIN", "ADMIN", "ADMISION", "FACTURACION_SE")
                        .requestMatchers("/api/transferencias/**").hasAnyRole("SUPERADMIN", "ADMIN", "COORDINACION", "COORD_TRANSFER")
                        .requestMatchers("/api/auditoria/**").hasAnyRole("SUPERADMIN", "ADMIN", "AUDITOR_CLINIC")
                        .requestMatchers("/api/externos/**").hasAnyRole("SUPERADMIN", "ADMIN", "INSTITUCION_EX", "ASEGURADORA", "REGULADOR")
                        .requestMatchers("/api/soporte/**").hasAnyRole("SUPERADMIN", "SOPORTE_TI")
                        .requestMatchers("/api/personal-externo/**").hasAnyRole("SUPERADMIN", "INSTITUCION_EX")

                        // ✅ Todo lo demás requiere autenticación
                        .anyRequest().authenticated()
                )

                // 🧩 Usar JWT sin sesiones
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // 🔑 Autenticación y filtro JWT
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // ===========================================================
    // 🌍 CONFIGURACIÓN GLOBAL DE CORS
    // ===========================================================
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // 🔧 Lista de orígenes permitidos
        config.setAllowedOrigins(Arrays.asList(
                "http://localhost",           // 🔥 agregado: frontend en docker/nginx
                "http://localhost:3000",
                "http://127.0.0.1:3000",
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "http://10.0.89.13:3000",
                "http://10.0.89.13:5173",
                "http://10.0.89.239"
        ));

        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("Authorization"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    // ===========================================================
    // 🧱 CONFIGURACIÓN DE AUTENTICACIÓN
    // ===========================================================
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
        return new BCryptPasswordEncoder();
    }
}
