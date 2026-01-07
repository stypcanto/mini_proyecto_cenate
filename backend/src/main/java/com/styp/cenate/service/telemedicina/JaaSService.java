package com.styp.cenate.service.telemedicina;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;

import com.styp.cenate.dto.telemedicina.TokenResponse;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import lombok.extern.slf4j.Slf4j;

/**
 * Servicio para generar tokens JWT para Jitsi JaaS
 */
@Slf4j
@Service
public class JaaSService {

    @Value("${jitsi.jaas.app-id:vpaas-magic-cookie-c0d9ddbe35d14e2893148b58009721f6}")
    private String appId;

    @Value("${jitsi.jaas.key-id:vpaas-magic-cookie-c0d9ddbe35d14e2893148b58009721f6/d1d7fc}")
    private String keyId;

    @Value("${jitsi.jaas.domain:8x8.vc}")
    private String domain;

    /**
     * Construye la URL de la sala con el tenant
     * Para Jitsi JaaS, la URL debe incluir el tenant (appId) como subdominio
     */
    private String buildRoomUrl(String roomName) {
        // Formato requerido: https://{tenant}.8x8.vc/{roomName}
        // El tenant es el appId
        return String.format("https://%s.%s/%s", appId, domain, roomName);
    }

    @Value("${jitsi.jaas.private-key-path:classpath:keys/jaas-private.pk}")
    private String privateKeyPath;

    private final ResourceLoader resourceLoader;
    private PrivateKey privateKey;

    public JaaSService(ResourceLoader resourceLoader) {
        this.resourceLoader = resourceLoader;
    }

    /**
     * Carga la clave privada desde el archivo
     */
    private PrivateKey loadPrivateKey() throws IOException {
        if (privateKey != null) {
            return privateKey;
        }

        try {
            Resource resource = resourceLoader.getResource(privateKeyPath);
            if (!resource.exists()) {
                throw new IOException("No se encontró el archivo de clave privada en: " + privateKeyPath);
            }
            String keyContent = new String(Files.readAllBytes(Paths.get(resource.getURI())));
            
            // Remover headers y footers
            keyContent = keyContent
                    .replace("-----BEGIN PRIVATE KEY-----", "")
                    .replace("-----END PRIVATE KEY-----", "")
                    .replaceAll("\\s", "");

            byte[] keyBytes = Base64.getDecoder().decode(keyContent);
            log.debug("🔑 Tamaño de clave decodificada: {} bytes", keyBytes.length);
            
            PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(keyBytes);
            KeyFactory keyFactory = KeyFactory.getInstance("RSA");
            privateKey = keyFactory.generatePrivate(keySpec);
            
            log.info("✅ Clave privada Jitsi cargada correctamente desde: {}", privateKeyPath);
            log.info("🔑 Algoritmo de la clave: {} - Formato: PKCS#8", privateKey.getAlgorithm());
            return privateKey;
        } catch (IOException | java.security.GeneralSecurityException e) {
            log.error("❌ Error al cargar la clave privada Jitsi: {}", e.getMessage(), e);
            throw new IOException("No se pudo cargar la clave privada Jitsi", e);
        }
    }

    /**
     * Genera un token JWT para Jitsi JaaS
     * 
     * @param roomName Nombre de la sala
     * @param userName Nombre del usuario
     * @param userEmail Email del usuario (opcional)
     * @param isModerator Si el usuario es moderador
     * @param expirationHours Horas de expiración del token
     * @return TokenResponse con el token y la URL de la sala
     */
    public TokenResponse generarToken(
            String roomName,
            String userName,
            String userEmail,
            boolean isModerator,
            int expirationHours
    ) {
        try {
            PrivateKey key = loadPrivateKey();
            Instant now = Instant.now();
            Instant expiration = now.plus(expirationHours, ChronoUnit.HOURS);

            // Construir el payload del JWT según especificación Jitsi JaaS
            // Formato basado en: https://github.com/8x8/jaas_demo/tree/main/jaas-jwt-samples/java
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("id", userEmail != null ? userEmail : userName);
            userMap.put("name", userName);
            userMap.put("email", userEmail != null ? userEmail : "");
            userMap.put("moderator", isModerator);
            userMap.put("hidden-from-recorder", false);  // Opcional según ejemplo
            
            Map<String, Object> featuresMap = new HashMap<>();
            // Features según ejemplo de Jitsi JaaS
            featuresMap.put("livestreaming", false);
            featuresMap.put("file-upload", false);
            featuresMap.put("outbound-call", false);
            featuresMap.put("sip-outbound-call", false);
            featuresMap.put("transcription", false);
            featuresMap.put("list-visitors", false);
            featuresMap.put("recording", false);
            featuresMap.put("flip", false);
            
            Map<String, Object> context = new HashMap<>();
            context.put("user", userMap);
            context.put("features", featuresMap);

            // El kid debe ser el keyId completo según especificación Jitsi JaaS
            log.info("🔑 Generando JWT - AppID: {} - Key ID: {}", appId, keyId);
            log.info("🔑 Clave privada cargada: {} - Algoritmo: RSA", key != null ? "Sí" : "No");
            
            // Construir el JWT según especificación Jitsi JaaS
            // Según documentación: iss="chat", aud="jitsi", sub=AppID, room=nombreSala
            // IMPORTANTE: El kid debe ser exactamente el keyId completo sin espacios
            String cleanKeyId = keyId.trim();
            log.info("🔑 Key ID limpio: '{}' (longitud: {})", cleanKeyId, cleanKeyId.length());
            
            // Construir el JWT según el formato exacto del ejemplo de Jitsi JaaS
            // Header: alg=RS256, typ=JWT, kid=keyId completo
            // Payload: aud=jitsi, iss=chat, sub=appId, room=roomName, context={user, features}
            // Incluir nbf (not before) = iat - 5 segundos según ejemplo
            Instant nbf = now.minus(5, ChronoUnit.SECONDS);
            
            String token = Jwts.builder()
                    .setHeaderParam("alg", "RS256")
                    .setHeaderParam("typ", "JWT")
                    .setHeaderParam("kid", cleanKeyId)  // Key ID completo, sin espacios
                    .setIssuer("chat")     // Issuer debe ser "chat" según Jitsi JaaS
                    .setAudience("jitsi")  // Audience debe ser "jitsi"
                    .setSubject(appId)     // Subject debe ser el AppID
                    .setIssuedAt(Date.from(now))
                    .setExpiration(Date.from(expiration))
                    .setNotBefore(Date.from(nbf))  // Not Before: iat - 5 segundos
                    .claim("room", roomName)  // Nombre específico de la sala
                    .claim("context", context)
                    .signWith(key, SignatureAlgorithm.RS256)
                    .compact();
            
            log.info("✅ JWT generado exitosamente. Longitud del token: {}", token.length());

            // Construir la URL con el tenant (appId como subdominio)
            String roomUrl = buildRoomUrl(roomName);
            log.debug("🌐 URL de sala generada: {} (tenant: {})", roomUrl, appId);

            log.info("✅ Token Jitsi generado para sala: {} - Usuario: {} - AppID: {} - KID: {}", 
                    roomName, userName, appId, keyId);

            return TokenResponse.builder()
                    .token(token)
                    .roomName(roomName)
                    .roomUrl(roomUrl)
                    .expiraEn(expirationHours * 3600L)
                    .build();

        } catch (IOException e) {
            log.error("❌ Error al generar token Jitsi (IO): {}", e.getMessage(), e);
            throw new RuntimeException("Error al generar token Jitsi: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("❌ Error al generar token Jitsi: {}", e.getMessage(), e);
            throw new RuntimeException("Error al generar token Jitsi: " + e.getMessage(), e);
        }
    }

    /**
     * Genera un nombre único para la sala
     */
    public String generarNombreSala(String dniPaciente, Long idUsuarioMedico) {
        String timestamp = String.valueOf(System.currentTimeMillis());
        String hash = String.format("%s-%d-%s", dniPaciente, idUsuarioMedico, timestamp.substring(timestamp.length() - 6));
        return "cenate-" + hash.toLowerCase().replaceAll("[^a-z0-9-]", "");
    }
}
