package com.styp.cenate.security.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class JwtService {

    private final JwtUtil jwtUtil;

    public String generateToken(Map<String, Object> claims, UserDetails userDetails) {
        return jwtUtil.generateToken(claims, userDetails.getUsername());
    }

    public String extractUsername(String token) {
        return jwtUtil.extractUsername(token);
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        return jwtUtil.isTokenValid(token, userDetails.getUsername());
    }
}