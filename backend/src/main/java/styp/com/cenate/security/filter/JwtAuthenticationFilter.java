package styp.com.cenate.security.filter;

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
import styp.com.cenate.security.service.JwtService;
import styp.com.cenate.security.service.UserDetailsServiceImpl;

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

        final String authHeader = request.getHeader("Authorization");

        // 🚫 Si no hay token JWT, continúa sin autenticación
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String jwt = authHeader.substring(7);

        try {
            // 🔍 Extraer usuario del token
            final String username = jwtService.extractUsername(jwt);

            // ⚙️ Solo autenticar si no existe contexto previo
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

            // 🔄 En caso de error grave, limpiar el contexto de seguridad
            SecurityContextHolder.clearContext();

            // Opcional: devolver 401 si el token está dañado
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

        // Continuar con el resto de filtros
        filterChain.doFilter(request, response);
    }
}