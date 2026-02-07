package com.styp.cenate.security.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * 🎬 Filter para permitir acceso a micrófono y cámara en iframes embebidos (Jitsi)
 *
 * Añade headers HTTP que permiten a las iframes embebidas:
 * - Acceder al micrófono
 * - Acceder a la cámara
 * - Mostrar en pantalla completa
 *
 * @author Claude Code
 * @version 1.0.0
 * @since 2026-01-07
 */
@Slf4j
@Component
public class PermissionsPolicyFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        // 🎬 Permissions-Policy: Permite micrófono, cámara y otros permisos en embedded contexts
        // Formato: directiva=() o directiva=(self) o directiva=(* "dominio") o directiva=*
        // * = permite a cualquier origen (incluyendo iframes)
        response.setHeader("Permissions-Policy",
            "microphone=*, " +                      // Permitir micrófono en iframes
            "camera=*, " +                          // Permitir cámara en iframes
            "geolocation=*, " +
            "display-capture=*, " +                 // Permitir captura de pantalla
            "accelerometer=*, " +
            "gyroscope=*, " +
            "magnetometer=*, " +
            "usb=*, " +
            "payment=*, " +
            "ambient-light-sensor=*");

        // 🎬 Feature-Policy: Versión deprecada pero aún soportada en algunos navegadores
        response.setHeader("Feature-Policy",
            "microphone 'self' *; " +
            "camera 'self' *; " +
            "geolocation 'self' *; " +
            "display-capture 'self' *; " +
            "accelerometer 'self' *; " +
            "gyroscope 'self' *; " +
            "magnetometer 'self' *; " +
            "usb 'self' *; " +
            "payment 'self' *; " +
            "ambient-light-sensor 'self' *");

        // ✅ X-Frame-Options: ALLOWALL para permitir ser embebida en iframes
        // Esto permite que el frontend pueda ser embebido si es necesario
        response.setHeader("X-Frame-Options", "ALLOWALL");

        // 📝 Headers adicionales útiles
        response.setHeader("Access-Control-Allow-Credentials", "true");

        filterChain.doFilter(request, response);
    }
}
