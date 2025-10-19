package com.styp.cenate.security.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import com.styp.cenate.security.service.JwtService;
import com.styp.cenate.security.service.UserDetailsServiceImpl;

import java.io.IOException;

/**
 * 🔒 Filtro que intercepta cada solicitud HTTP y valida el token JWT.
 * Si el token es válido, autentica al usuario dentro del contexto de Spring Security.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsServiceImpl userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        final String path = request.getServletPath();

        // ============================================================
        // 🔓 EXCLUSIÓN DE RUTAS PÚBLICAS (NO REQUIEREN TOKEN)
        // ============================================================
        if (path.startsWith("/api/auth")
                || path.startsWith("/api/public")
                || path.startsWith("/actuator")
                || path.startsWith("/swagger")
                || path.startsWith("/v3/api-docs")
                || path.startsWith("/error")) {

            log.debug("➡️ Ruta pública detectada: {}, se omite filtro JWT", path);
            filterChain.doFilter(request, response);
            return;
        }

        // ============================================================
        // 🔑 VALIDACIÓN DE TOKEN JWT
        // ============================================================
        final String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.trace("🚫 No se encontró encabezado Authorization en la solicitud.");
            filterChain.doFilter(request, response);
            return;
        }

        final String jwt = authHeader.substring(7);

        try {
            final String username = jwtService.extractUsername(jwt);

            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {

                UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                // ✅ Validar token y establecer contexto de seguridad
                if (jwtService.isTokenValid(jwt, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );

                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);

                    log.debug("✅ JWT válido para usuario: {}", username);
                } else {
                    log.warn("⚠️ Token JWT inválido o expirado para usuario: {}", username);
                }
            }

        } catch (Exception e) {
            log.error("❌ Error al procesar JWT: {}", e.getMessage(), e);

            // 🔄 Limpiar contexto de seguridad y devolver error
            SecurityContextHolder.clearContext();
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("""
            {
              "status": 401,
              "message": "Token inválido o expirado.",
              "error": "%s"
            }
            """.formatted(e.getMessage()));
            return;
        }

        // ============================================================
        // Continuar con la cadena de filtros
        // ============================================================
        filterChain.doFilter(request, response);
    }
}