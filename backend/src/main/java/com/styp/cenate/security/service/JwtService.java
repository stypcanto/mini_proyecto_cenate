package com.styp.cenate.security.service;
import lombok.Data;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

/**
 * 🔐 Servicio responsable de la generación, validación y decodificación de tokens JWT.
 * Compatible con JJWT 0.12.x y Spring Boot 3.5.x.
 */
@Service
@Data
public class JwtService {

    // 🔑 Clave secreta en Base64 (mínimo 256 bits)
    @Value("${jwt.secret.key:404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970}")
    private String secretKey;

    // ⏰ Tiempo de expiración del token (por defecto 24 horas)
    @Value("${jwt.expiration:86400000}")
    private long jwtExpiration;

    // ======================================================
    // ✅ EXTRACCIÓN DE DATOS DESDE EL TOKEN
    // ======================================================

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> resolver) {
        final Claims claims = extractAllClaims(token);
        return resolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        // ⚠️ Versión compatible con jjwt 0.12+
        return Jwts.parser()
                .verifyWith(getSignInKey()) // Verifica la firma con la clave
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    // ======================================================
    // ✅ GENERACIÓN DE TOKEN
    // ======================================================

    public String generateToken(UserDetails userDetails) {
        return generateToken(new HashMap<>(), userDetails);
    }

    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        return buildToken(extraClaims, userDetails, jwtExpiration);
    }

    private String buildToken(Map<String, Object> extraClaims, UserDetails userDetails, long expiration) {
        return Jwts.builder()
                .claims(extraClaims)
                .subject(userDetails.getUsername())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSignInKey(), Jwts.SIG.HS256) // ✅ nueva forma de firmar
                .compact();
    }

    // ======================================================
    // ✅ VALIDACIÓN DEL TOKEN
    // ======================================================

    public boolean isTokenValid(String token, UserDetails userDetails) {
        try {
            final String username = extractUsername(token);
            return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    // ======================================================
    // 🔒 UTILITARIOS
    // ======================================================

    private SecretKey getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}