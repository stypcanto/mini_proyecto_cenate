package com.styp.cenate.security.filter;

import com.styp.cenate.security.service.JwtUtil;
import com.styp.cenate.security.service.UserDetailsServiceImpl;
import com.styp.cenate.service.security.TokenBlacklistService;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * ========================================================================
 * 🔐 JwtAuthenticationFilter – Filtro de autenticación JWT
 * ------------------------------------------------------------------------
 * - Intercepta las peticiones HTTP
 * - Extrae el token del encabezado Authorization
 * - Valida y establece el usuario autenticado en el contexto
 * ========================================================================
 */
@Slf4j
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsServiceImpl userDetailsService;
    private final TokenBlacklistService tokenBlacklistService;

    public JwtAuthenticationFilter(JwtUtil jwtUtil,
                                   UserDetailsServiceImpl userDetailsService,
                                   TokenBlacklistService tokenBlacklistService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
        this.tokenBlacklistService = tokenBlacklistService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String token = authHeader.substring(7);

        // SEC-003: Verificar si el token esta en blacklist
        if (tokenBlacklistService.isBlacklisted(token)) {
            log.warn("Token en blacklist rechazado");
            filterChain.doFilter(request, response);
            return;
        }

        try {
            final String username = jwtUtil.extractUsername(token);

            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                if (jwtUtil.validateToken(token, userDetails.getUsername())) {
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    log.debug("JWT valido para usuario: {}", username);
                } else {
                    log.warn("Token JWT invalido o expirado para usuario: {}", username);
                }
            }
        } catch (ExpiredJwtException e) {
            log.warn("Token JWT expirado: {}", e.getMessage());
        } catch (JwtException e) {
            log.warn("Token JWT invalido: {}", e.getMessage());
        } catch (Exception e) {
            log.warn("Error procesando token JWT: {}", e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}