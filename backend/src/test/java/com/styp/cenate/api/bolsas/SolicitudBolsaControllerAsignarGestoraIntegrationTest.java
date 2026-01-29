package com.styp.cenate.api.bolsas;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.styp.cenate.repository.bolsas.SolicitudBolsaRepository;
import com.styp.cenate.repository.UsuarioRepository;
import com.styp.cenate.model.bolsas.SolicitudBolsa;
import com.styp.cenate.model.Usuario;
import com.styp.cenate.model.Rol;
import java.util.Set;

/**
 * Tests de integración para endpoint PATCH /api/bolsas/solicitudes/{id}/asignar
 *
 * @version v1.0.0
 * @since 2026-01-29
 */
@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(locations = "classpath:application-test.properties")
@DisplayName("Tests de integración para asignación de gestora")
class SolicitudBolsaControllerAsignarGestoraIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private SolicitudBolsaRepository solicitudRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    private SolicitudBolsa solicitudTest;
    private Usuario gestoraTest;
    private Usuario coordinadorTest;

    @BeforeEach
    void setUp() {
        // Limpiar datos anteriores
        solicitudRepository.deleteAll();
        usuarioRepository.deleteAll();

        // Crear solicitud de prueba
        solicitudTest = new SolicitudBolsa();
        solicitudTest.setNumeroSolicitud("SOL-TEST-001");
        solicitudTest.setPacienteNombre("Paciente Test");
        solicitudTest.setPacienteDni("12345678");
        solicitudTest.setPacienteId("ASE-001");
        solicitudTest.setActivo(true);
        solicitudTest.setEstadoGestionCitasId(1L);
        solicitudTest.setIdBolsa(1L);
        solicitudTest.setIdServicio(1L);
        solicitudTest.setCodigoAdscripcion("021");
        solicitudTest = solicitudRepository.save(solicitudTest);

        // Crear rol GESTOR_DE_CITAS
        Rol rolGestor = new Rol();
        rolGestor.setDescRol("GESTOR_DE_CITAS");

        // Crear gestora de prueba
        gestoraTest = new Usuario();
        gestoraTest.setNameUser("gestora.test");
        gestoraTest.setStatUser("A");
        gestoraTest.setRoles(Set.of(rolGestor));
        gestoraTest = usuarioRepository.save(gestoraTest);

        // Crear coordinador de prueba
        Rol rolCoordinador = new Rol();
        rolCoordinador.setDescRol("COORDINADOR_DE_CITAS");

        coordinadorTest = new Usuario();
        coordinadorTest.setNameUser("coordinador.test");
        coordinadorTest.setStatUser("A");
        coordinadorTest.setRoles(Set.of(rolCoordinador));
        coordinadorTest = usuarioRepository.save(coordinadorTest);
    }

    // ============================================================================
    // TEST 1: Asignación exitosa con usuario autenticado
    // ============================================================================
    @Test
    @WithMockUser(username = "coordinador.test", roles = "COORDINADOR_DE_CITAS")
    @DisplayName("✅ Debe asignar gestora con usuario autenticado")
    void testAsignarGestora_ConUsuarioAutenticado_Exitoso() throws Exception {
        mockMvc.perform(
            patch("/api/bolsas/solicitudes/{id}/asignar", solicitudTest.getIdSolicitud())
                .param("idGestora", gestoraTest.getIdUser().toString())
                .contentType(MediaType.APPLICATION_JSON)
        )
        .andDo(print())
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.mensaje", containsString("Gestora asignada")))
        .andExpect(jsonPath("$.idSolicitud", equalTo(solicitudTest.getIdSolicitud().intValue())))
        .andExpect(jsonPath("$.idGestora", equalTo(gestoraTest.getIdUser().intValue())));
    }

    // ============================================================================
    // TEST 2: Sin autenticación (401 Unauthorized)
    // ============================================================================
    @Test
    @DisplayName("❌ Debe retornar 401 sin autenticación")
    void testAsignarGestora_SinAutenticacion_401() throws Exception {
        mockMvc.perform(
            patch("/api/bolsas/solicitudes/{id}/asignar", solicitudTest.getIdSolicitud())
                .param("idGestora", gestoraTest.getIdUser().toString())
                .contentType(MediaType.APPLICATION_JSON)
        )
        .andExpect(status().isUnauthorized());
    }

    // ============================================================================
    // TEST 3: Solicitud no encontrada (404)
    // ============================================================================
    @Test
    @WithMockUser(username = "coordinador.test", roles = "COORDINADOR_DE_CITAS")
    @DisplayName("❌ Debe retornar 404 si solicitud no existe")
    void testAsignarGestora_SolicitudNoExiste_404() throws Exception {
        mockMvc.perform(
            patch("/api/bolsas/solicitudes/{id}/asignar", 999L)
                .param("idGestora", gestoraTest.getIdUser().toString())
                .contentType(MediaType.APPLICATION_JSON)
        )
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.error", containsString("no encontrada")));
    }

    // ============================================================================
    // TEST 4: Gestora no encontrada (404)
    // ============================================================================
    @Test
    @WithMockUser(username = "coordinador.test", roles = "COORDINADOR_DE_CITAS")
    @DisplayName("❌ Debe retornar 404 si gestora no existe")
    void testAsignarGestora_GestoraNoExiste_404() throws Exception {
        mockMvc.perform(
            patch("/api/bolsas/solicitudes/{id}/asignar", solicitudTest.getIdSolicitud())
                .param("idGestora", "999")
                .contentType(MediaType.APPLICATION_JSON)
        )
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.error", containsString("Usuario 999 no encontrado")));
    }

    // ============================================================================
    // TEST 5: Usuario sin rol GESTOR_DE_CITAS (400)
    // ============================================================================
    @Test
    @WithMockUser(username = "coordinador.test", roles = "COORDINADOR_DE_CITAS")
    @DisplayName("❌ Debe retornar 400 si usuario no es GESTOR_DE_CITAS")
    void testAsignarGestora_UsuarioSinRolGestor_400() throws Exception {
        // Crear usuario sin rol gestor
        Usuario usuarioSinRol = new Usuario();
        usuarioSinRol.setNameUser("usuario.sin.rol");
        usuarioSinRol.setStatUser("A");
        usuarioSinRol.setRoles(Set.of());
        usuarioSinRol = usuarioRepository.save(usuarioSinRol);

        mockMvc.perform(
            patch("/api/bolsas/solicitudes/{id}/asignar", solicitudTest.getIdSolicitud())
                .param("idGestora", usuarioSinRol.getIdUser().toString())
                .contentType(MediaType.APPLICATION_JSON)
        )
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.error", containsString("no tiene el rol GESTOR_DE_CITAS")));
    }

    // ============================================================================
    // TEST 6: Usuario inactivo (400)
    // ============================================================================
    @Test
    @WithMockUser(username = "coordinador.test", roles = "COORDINADOR_DE_CITAS")
    @DisplayName("❌ Debe retornar 400 si gestora está inactiva")
    void testAsignarGestora_GestoraInactiva_400() throws Exception {
        // Desactivar gestora
        gestoraTest.setStatUser("I");
        usuarioRepository.save(gestoraTest);

        mockMvc.perform(
            patch("/api/bolsas/solicitudes/{id}/asignar", solicitudTest.getIdSolicitud())
                .param("idGestora", gestoraTest.getIdUser().toString())
                .contentType(MediaType.APPLICATION_JSON)
        )
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.error", containsString("está inactivo")));
    }

    // ============================================================================
    // TEST 7: Endpoint retorna estructura correcta
    // ============================================================================
    @Test
    @WithMockUser(username = "coordinador.test", roles = "COORDINADOR_DE_CITAS")
    @DisplayName("✅ Debe retornar estructura JSON correcta")
    void testAsignarGestora_EstructuraJSON_Correcta() throws Exception {
        mockMvc.perform(
            patch("/api/bolsas/solicitudes/{id}/asignar", solicitudTest.getIdSolicitud())
                .param("idGestora", gestoraTest.getIdUser().toString())
                .contentType(MediaType.APPLICATION_JSON)
        )
        .andExpect(status().isOk())
        .andExpect(jsonPath("$", hasKey("mensaje")))
        .andExpect(jsonPath("$", hasKey("idSolicitud")))
        .andExpect(jsonPath("$", hasKey("idGestora")));
    }

    // ============================================================================
    // TEST 8: Verificar que la asignación se guardó en BD
    // ============================================================================
    @Test
    @WithMockUser(username = "coordinador.test", roles = "COORDINADOR_DE_CITAS")
    @DisplayName("✅ Debe guardar asignación en BD")
    void testAsignarGestora_DebeGuardarEnBD() throws Exception {
        // Act
        mockMvc.perform(
            patch("/api/bolsas/solicitudes/{id}/asignar", solicitudTest.getIdSolicitud())
                .param("idGestora", gestoraTest.getIdUser().toString())
                .contentType(MediaType.APPLICATION_JSON)
        )
        .andExpect(status().isOk());

        // Assert: Verificar que la BD se actualizó
        SolicitudBolsa solicitudActualizada = solicitudRepository
            .findById(solicitudTest.getIdSolicitud())
            .orElseThrow();

        assertEquals(gestoraTest.getIdUser(), solicitudActualizada.getResponsableGestoraId());
        assertNotNull(solicitudActualizada.getFechaAsignacion());
    }
}
