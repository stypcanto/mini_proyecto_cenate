package com.styp.cenate.util;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * Utilidad para capturar contexto HTTP de las peticiones
 * Usado principalmente para auditoría (IP, User-Agent, etc.)
 *
 * @author Styp Canto Rondón
 * @version 1.0.0
 * @since 2025-12-29
 */
@Component
public class RequestContextUtil {

    /**
     * Obtiene la IP real del cliente (considerando proxies y load balancers)
     *
     * @return IP del cliente o "INTERNAL" si no hay contexto HTTP
     */
    public static String getClientIp() {
        try {
            ServletRequestAttributes attributes =
                (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();

            if (attributes == null) {
                return "INTERNAL";
            }

            HttpServletRequest request = attributes.getRequest();

            // Intentar obtener IP real desde headers (si hay proxy/load balancer)
            String ip = request.getHeader("X-Forwarded-For");
            if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
                ip = request.getHeader("X-Real-IP");
            }
            if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
                ip = request.getHeader("Proxy-Client-IP");
            }
            if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
                ip = request.getHeader("WL-Proxy-Client-IP");
            }
            if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
                ip = request.getRemoteAddr();
            }

            // Si hay múltiples IPs (proxy chain), tomar la primera
            if (ip != null && ip.contains(",")) {
                ip = ip.split(",")[0].trim();
            }

            return ip != null ? ip : "UNKNOWN";
        } catch (Exception e) {
            return "ERROR";
        }
    }

    /**
     * Obtiene el User-Agent del navegador/dispositivo
     *
     * @return User-Agent o "INTERNAL" si no hay contexto HTTP
     */
    public static String getUserAgent() {
        try {
            ServletRequestAttributes attributes =
                (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();

            if (attributes == null) {
                return "INTERNAL";
            }

            HttpServletRequest request = attributes.getRequest();
            String userAgent = request.getHeader("User-Agent");

            return userAgent != null ? userAgent : "UNKNOWN";
        } catch (Exception e) {
            return "ERROR";
        }
    }

    /**
     * Obtiene contexto completo para auditoría (IP + User-Agent)
     *
     * @return Objeto AuditContext con IP y User-Agent
     */
    public static AuditContext getAuditContext() {
        return new AuditContext(getClientIp(), getUserAgent());
    }

    /**
     * Clase interna para encapsular el contexto de auditoría
     */
    public static class AuditContext {
        private final String ip;
        private final String userAgent;

        public AuditContext(String ip, String userAgent) {
            this.ip = ip;
            this.userAgent = userAgent;
        }

        public String getIp() {
            return ip;
        }

        public String getUserAgent() {
            return userAgent;
        }

        @Override
        public String toString() {
            return String.format("IP: %s, User-Agent: %s", ip, userAgent);
        }
    }

    /**
     * Parsea el User-Agent para extraer información del dispositivo, navegador y OS
     * Implementación básica - puede mejorarse con librerías como ua-parser
     *
     * @param userAgent User-Agent string
     * @return Objeto UserAgentInfo con información parseada
     */
    public static UserAgentInfo parseUserAgent(String userAgent) {
        if (userAgent == null || userAgent.isEmpty()) {
            return new UserAgentInfo("UNKNOWN", "UNKNOWN", "UNKNOWN");
        }

        String deviceType = "DESKTOP";
        String browser = "UNKNOWN";
        String os = "UNKNOWN";

        // Detectar tipo de dispositivo
        if (userAgent.toLowerCase().contains("mobile")) {
            deviceType = "MOBILE";
        } else if (userAgent.toLowerCase().contains("tablet") || userAgent.toLowerCase().contains("ipad")) {
            deviceType = "TABLET";
        }

        // Detectar navegador
        if (userAgent.contains("Chrome") && !userAgent.contains("Edg")) {
            browser = "CHROME";
        } else if (userAgent.contains("Firefox")) {
            browser = "FIREFOX";
        } else if (userAgent.contains("Safari") && !userAgent.contains("Chrome")) {
            browser = "SAFARI";
        } else if (userAgent.contains("Edg")) {
            browser = "EDGE";
        } else if (userAgent.contains("MSIE") || userAgent.contains("Trident")) {
            browser = "IE";
        } else if (userAgent.contains("Opera") || userAgent.contains("OPR")) {
            browser = "OPERA";
        }

        // Detectar sistema operativo
        if (userAgent.contains("Windows")) {
            os = "WINDOWS";
        } else if (userAgent.contains("Mac OS X")) {
            os = "MACOS";
        } else if (userAgent.contains("Linux")) {
            os = "LINUX";
        } else if (userAgent.contains("Android")) {
            os = "ANDROID";
        } else if (userAgent.contains("iOS") || userAgent.contains("iPhone") || userAgent.contains("iPad")) {
            os = "IOS";
        }

        return new UserAgentInfo(deviceType, browser, os);
    }

    /**
     * Clase interna para información parseada del User-Agent
     */
    public static class UserAgentInfo {
        private final String deviceType;
        private final String browser;
        private final String os;

        public UserAgentInfo(String deviceType, String browser, String os) {
            this.deviceType = deviceType;
            this.browser = browser;
            this.os = os;
        }

        public String getDeviceType() {
            return deviceType;
        }

        public String getBrowser() {
            return browser;
        }

        public String getOs() {
            return os;
        }

        @Override
        public String toString() {
            return String.format("%s - %s - %s", deviceType, browser, os);
        }
    }
}
