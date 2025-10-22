package com.styp.cenate.api.seguridad;
import lombok.extern.slf4j.Slf4j;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.styp.cenate.dto.*;
import com.styp.cenate.service.account.AccountRequestService;

import java.util.List;

/**
 * 🌍 Controlador REST para gestionar las solicitudes de creación de cuentas.
 *
 * Flujo completo:
 * <ol>
 *     <li>📝 Usuario solicita una cuenta → <b>POST /api/account-requests</b></li>
 *     <li>🔍 Administrador revisa pendientes → <b>GET /api/account-requests/pendientes</b></li>
 *     <li>✅ Aprobar solicitud → <b>PUT /api/account-requests/{id}/aprobar</b></li>
 *     <li>❌ Rechazar solicitud → <b>PUT /api/account-requests/{id}/rechazar</b></li>
 * </ol>
 *
 * <p>Al aprobar, se crea automáticamente un usuario con roles asignados y contraseña temporal.</p>
 *
 * @author Styp
 * @since 2025
 */
@RestController
@RequestMapping("/api/account-requests")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {
        "http://localhost",
        "http://localhost:3000",
        "http://localhost:5173",
        "http://10.0.89.13:3000",
        "http://10.0.89.13:5173"
})
public class AccountRequestController {

    private final AccountRequestService accountRequestService;

    // ============================================================
    // 1️⃣ Crear solicitud de cuenta (Público)
    // ============================================================
    @PostMapping
    public ResponseEntity<AccountRequestResponse> createRequest(
            @RequestBody AccountRequestCreateRequest request
    ) {
        log.info("📩 Nueva solicitud de cuenta recibida: {} (DNI: {})",
                request.getNombreCompleto(), request.getNumDocumento());

        AccountRequestResponse response = accountRequestService.createRequest(request);
        return ResponseEntity.ok(response);
    }

    // ============================================================
    // 2️⃣ Listar solicitudes pendientes (Solo ADMIN / SUPERADMIN)
    // ============================================================
    @GetMapping("/pendientes")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<List<AccountRequestResponse>> getPendingRequests() {
        log.info("📋 Consultando solicitudes pendientes de aprobación...");
        List<AccountRequestResponse> pendientes = accountRequestService.getPendingRequests();
        return ResponseEntity.ok(pendientes);
    }

    // ============================================================
    // 3️⃣ Aprobar solicitud (Crea el usuario y asigna roles)
    // ============================================================
    @PutMapping("/{id}/aprobar")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<UsuarioResponse> approveRequest(
            @PathVariable Long id,
            @RequestBody AccountRequestReviewRequest review
    ) {
        log.info("✅ Aprobando solicitud de cuenta con ID: {}", id);
        UsuarioResponse response = accountRequestService.approveRequest(id, review);
        return ResponseEntity.ok(response);
    }

    // ============================================================
    // 4️⃣ Rechazar solicitud
    // ============================================================
    @PutMapping("/{id}/rechazar")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<AccountRequestResponse> rejectRequest(
            @PathVariable Long id,
            @RequestBody AccountRequestReviewRequest review
    ) {
        log.info("🚫 Rechazando solicitud de cuenta con ID: {}", id);
        AccountRequestResponse response = accountRequestService.rejectRequest(id, review);
        return ResponseEntity.ok(response);
    }
}
