package com.styp.cenate.service.account.impl;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.styp.cenate.dto.*;
import com.styp.cenate.model.*;
import com.styp.cenate.repository.*;
import com.styp.cenate.service.account.AccountRequestService;
import com.styp.cenate.service.auditlog.AuditLogService;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Data
public class AccountRequestServiceImpl implements AccountRequestService {

    private final AccountRequestRepository accountRequestRepository;
    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    // =====================================================
    // 🟢 Crear una solicitud de cuenta
    // =====================================================
    @Override
    @Transactional
    public AccountRequestResponse createRequest(AccountRequestCreateRequest request) {
        if (usuarioRepository.existsByNameUser(request.getNumDocumento()))
            throw new IllegalArgumentException("⚠️ Ya existe un usuario con este número de documento.");

        if (accountRequestRepository.findByNumDocumento(request.getNumDocumento()).isPresent())
            throw new IllegalArgumentException("⚠️ Ya existe una solicitud pendiente para este documento.");

        AccountRequest entity = AccountRequest.builder()
                .nombreCompleto(request.getNombreCompleto())
                .tipoUsuario(request.getTipoUsuario())
                .numDocumento(request.getNumDocumento())
                .motivo(request.getMotivo())
                .estado("PENDIENTE")
                .fechaCreacion(LocalDateTime.now())
                .build();

        accountRequestRepository.save(entity);
        log.info("📩 Nueva solicitud de cuenta creada para {} ({})",
                request.getNombreCompleto(), request.getNumDocumento());

        return toResponse(entity);
    }

    // =====================================================
    // 🟢 Listar solicitudes pendientes
    // =====================================================
    @Override
    public List<AccountRequestResponse> getPendingRequests() {
        return accountRequestRepository.findByEstado("PENDIENTE")
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // =====================================================
    // 🟢 Aprobar solicitud -> crear usuario + asignar roles
    // =====================================================
    @Override
    @Transactional
    public UsuarioResponse approveRequest(Long id, AccountRequestReviewRequest review) {
        AccountRequest solicitud = accountRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada."));

        if (!"PENDIENTE".equalsIgnoreCase(solicitud.getEstado()))
            throw new IllegalStateException("La solicitud ya fue procesada.");

        Usuario nuevo = new Usuario();
        nuevo.setNameUser(solicitud.getNumDocumento());
        nuevo.setPassUser(passwordEncoder.encode("Temporal123*"));
        nuevo.setStatUser("ACTIVO");
        nuevo.setCreateAt(LocalDateTime.now());

        // ✅ Conversión Long → Integer corregida
        if (review.getRoles() != null && !review.getRoles().isEmpty()) {
            Set<Integer> roleIds = review.getRoles().stream()
                    .map(Long::intValue)
                    .collect(Collectors.toSet());

            Set<Rol> roles = new HashSet<>(rolRepository.findAllById(roleIds));
            nuevo.setRoles(roles);
        }

        usuarioRepository.save(nuevo);

        solicitud.setEstado("APROBADO");
        solicitud.setObservacionAdmin(review.getComentario());
        solicitud.setFechaRespuesta(LocalDateTime.now());
        accountRequestRepository.save(solicitud);

        auditLogService.registrarAccion(
                "ACCOUNT_APPROVED", "AUTH",
                "Solicitud aprobada: " + solicitud.getNombreCompleto(),
                "INFO", null
        );

        log.info("✅ Solicitud aprobada y usuario creado: {}", nuevo.getNameUser());

        return UsuarioResponse.builder()
                .idUser(nuevo.getIdUser())
                .username(nuevo.getNameUser())
                .roles(Optional.ofNullable(nuevo.getRoles())
                        .orElse(Set.of())
                        .stream()
                        .map(Rol::getDescRol)
                        .collect(Collectors.toSet()))
                .message("Usuario creado exitosamente con roles asignados.")
                .build();
    }

    // =====================================================
    // 🟡 Rechazar solicitud
    // =====================================================
    @Override
    @Transactional
    public AccountRequestResponse rejectRequest(Long id, AccountRequestReviewRequest review) {
        AccountRequest solicitud = accountRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada."));

        solicitud.setEstado("RECHAZADO");
        solicitud.setObservacionAdmin(review.getComentario());
        solicitud.setFechaRespuesta(LocalDateTime.now());
        accountRequestRepository.save(solicitud);

        auditLogService.registrarAccion(
                "ACCOUNT_REJECTED", "AUTH",
                "Solicitud rechazada: " + solicitud.getNombreCompleto(),
                "WARN", null
        );

        log.info("❌ Solicitud rechazada para {}", solicitud.getNombreCompleto());
        return toResponse(solicitud);
    }

    // =====================================================
    // 🧩 Conversión Entity → DTO
    // =====================================================
    private AccountRequestResponse toResponse(AccountRequest entity) {
        return AccountRequestResponse.builder()
                .id(entity.getIdRequest())
                .nombreCompleto(entity.getNombreCompleto()) // ✅ asegúrate que coincida con DTO
                .tipoUsuario(entity.getTipoUsuario())
                .numDocumento(entity.getNumDocumento())
                .motivo(entity.getMotivo())
                .estado(entity.getEstado())
                .observacionAdmin(entity.getObservacionAdmin())
                .fechaCreacion(entity.getFechaCreacion())
                .fechaRespuesta(entity.getFechaRespuesta())
                .build();
    }
}
