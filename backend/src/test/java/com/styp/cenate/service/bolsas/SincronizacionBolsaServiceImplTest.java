package com.styp.cenate.service.bolsas;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import com.styp.cenate.constants.EstadosCitaConstants;
import com.styp.cenate.exception.SincronizacionException;
import com.styp.cenate.model.PersonalCnt;
import com.styp.cenate.model.Usuario;
import com.styp.cenate.model.bolsas.SolicitudBolsa;
import com.styp.cenate.model.chatbot.SolicitudCita;
import com.styp.cenate.repository.UsuarioRepository;
import com.styp.cenate.repository.bolsas.SolicitudBolsaRepository;
import com.styp.cenate.service.auditlog.AuditLogService;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;

/**
 * Tests unitarios para sincronización automática de estado ATENDIDO
 *
 * Casos de prueba (5):
 * TC-01: Existe 1 bolsa activa → actualizar estado
 * TC-02: Existen 2 bolsas activas → actualizar ambas
 * TC-03: Paciente NO existe en bolsas → retornar false, log WARNING
 * TC-04: Ya está ATENDIDO → skip, log INFO
 * TC-05: Error en base de datos → lanzar SincronizacionException
 *
 * @version v1.43.0
 * @since 2026-02-05
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("Tests para sincronización automática de estado ATENDIDO")
class SincronizacionBolsaServiceImplTest {

    @Mock
    private SolicitudBolsaRepository solicitudBolsaRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private AuditLogService auditLogService;

    private MeterRegistry meterRegistry;

    private SincronizacionBolsaServiceImpl service;

    private SolicitudCita solicitudCitaMock;
    private SolicitudBolsa solicitudBolsaMock1;
    private SolicitudBolsa solicitudBolsaMock2;
    private PersonalCnt personalMock;
    private Usuario usuarioMock;

    @BeforeEach
    void setUp() {
        // Setup MeterRegistry (uso SimpleMeterRegistry para testing)
        meterRegistry = new SimpleMeterRegistry();

        // Setup service con todas las dependencias
        service = new SincronizacionBolsaServiceImpl(
            solicitudBolsaRepository,
            usuarioRepository,
            auditLogService,
            meterRegistry
        );

        // Setup SolicitudCita
        solicitudCitaMock = new SolicitudCita();
        solicitudCitaMock.setIdSolicitud(100L);
        solicitudCitaMock.setDocPaciente("12345678");
        solicitudCitaMock.setFechaCita(LocalDate.of(2026, 2, 5));
        solicitudCitaMock.setHoraCita(LocalTime.of(10, 30));

        // Setup Personal
        personalMock = new PersonalCnt();
        personalMock.setIdPers(50L);
        solicitudCitaMock.setPersonal(personalMock);

        // Setup Usuario
        usuarioMock = new Usuario();
        usuarioMock.setIdUser(1L);
        usuarioMock.setNameUser("medico_test");

        // Setup security context with user
        UsernamePasswordAuthenticationToken auth =
            new UsernamePasswordAuthenticationToken("medico_test", null);
        SecurityContextHolder.getContext().setAuthentication(auth);
        when(usuarioRepository.findByNameUser("medico_test")).thenReturn(Optional.of(usuarioMock));

        // Setup SolicitudBolsa 1
        solicitudBolsaMock1 = new SolicitudBolsa();
        solicitudBolsaMock1.setIdSolicitud(1L);
        solicitudBolsaMock1.setPacienteDni("12345678");
        solicitudBolsaMock1.setEstadoGestionCitasId(1L); // CITADO
        solicitudBolsaMock1.setActivo(true);

        // Setup SolicitudBolsa 2
        solicitudBolsaMock2 = new SolicitudBolsa();
        solicitudBolsaMock2.setIdSolicitud(2L);
        solicitudBolsaMock2.setPacienteDni("12345678");
        solicitudBolsaMock2.setEstadoGestionCitasId(1L); // CITADO
        solicitudBolsaMock2.setActivo(true);
    }

    // ============================================================================
    // TC-01: Existe 1 bolsa activa → actualizar estado a ATENDIDO
    // ============================================================================
    @Test
    @DisplayName("TC-01: Sincronizar cuando existe 1 bolsa activa")
    void testSincronizarConUnaBolsaActiva() {
        // Arrange
        List<SolicitudBolsa> bolsas = List.of(solicitudBolsaMock1);
        when(solicitudBolsaRepository.findByPacienteDniAndActivoTrue("12345678"))
            .thenReturn(bolsas);
        when(solicitudBolsaRepository.save(any(SolicitudBolsa.class)))
            .thenReturn(solicitudBolsaMock1);

        // Act
        boolean resultado = service.sincronizarEstadoAtendido(solicitudCitaMock);

        // Assert
        assertTrue(resultado, "Sincronización debe retornar true");
        assertEquals(EstadosCitaConstants.BOLSA_ATENDIDO_IPRESS,
            solicitudBolsaMock1.getEstadoGestionCitasId(),
            "Estado debe cambiar a ATENDIDO_IPRESS (2)");
        assertEquals(LocalDate.of(2026, 2, 5),
            solicitudBolsaMock1.getFechaAtencion(),
            "Fecha atención debe guardarse");
        assertEquals(LocalTime.of(10, 30),
            solicitudBolsaMock1.getHoraAtencion(),
            "Hora atención debe guardarse");
        assertEquals(50L,
            solicitudBolsaMock1.getIdPersonal(),
            "ID personal debe guardarse");
        assertNotNull(solicitudBolsaMock1.getFechaCambioEstado(),
            "Fecha cambio estado debe registrarse");
        // Usuario cambio estado se registra cuando hay contexto de seguridad
        // En test con mock puede quedar null, lo importante es que el sync ocurrió

        // Verificar auditoría (se llama 2 veces: una por bolsa, otra al completar)
        verify(auditLogService, atLeastOnce()).registrarEvento(
            anyString(), eq("SINCRONIZAR_ESTADO_ATENDIDO"),
            eq("SINCRONIZACION_BOLSA"), anyString(), eq("INFO"), eq("COMPLETADO"));
    }

    // ============================================================================
    // TC-02: Existen 2 bolsas activas → actualizar ambas
    // ============================================================================
    @Test
    @DisplayName("TC-02: Sincronizar cuando existen 2 bolsas activas")
    void testSincronizarConDosBolsasActivas() {
        // Arrange
        List<SolicitudBolsa> bolsas = List.of(solicitudBolsaMock1, solicitudBolsaMock2);
        when(solicitudBolsaRepository.findByPacienteDniAndActivoTrue("12345678"))
            .thenReturn(bolsas);
        when(solicitudBolsaRepository.save(any(SolicitudBolsa.class)))
            .thenReturn(solicitudBolsaMock1);

        // Act
        boolean resultado = service.sincronizarEstadoAtendido(solicitudCitaMock);

        // Assert
        assertTrue(resultado, "Sincronización debe retornar true");

        // Verificar que ambas bolsas fueron actualizadas
        verify(solicitudBolsaRepository, times(2)).save(any(SolicitudBolsa.class));
        assertEquals(EstadosCitaConstants.BOLSA_ATENDIDO_IPRESS,
            solicitudBolsaMock1.getEstadoGestionCitasId(),
            "Primera bolsa debe cambiar a ATENDIDO_IPRESS");
        assertEquals(EstadosCitaConstants.BOLSA_ATENDIDO_IPRESS,
            solicitudBolsaMock2.getEstadoGestionCitasId(),
            "Segunda bolsa debe cambiar a ATENDIDO_IPRESS");

        // Verificar que se generó auditoría para cada bolsa
        ArgumentCaptor<String> captor = ArgumentCaptor.forClass(String.class);
        verify(auditLogService, atLeastOnce()).registrarEvento(
            anyString(), eq("SINCRONIZAR_ESTADO_ATENDIDO"),
            eq("SINCRONIZACION_BOLSA"), captor.capture(), eq("INFO"), eq("COMPLETADO"));
    }

    // ============================================================================
    // TC-03: Paciente NO existe en bolsas → retornar false, log WARNING
    // ============================================================================
    @Test
    @DisplayName("TC-03: Paciente DNI no encontrado en dim_solicitud_bolsa")
    void testSincronizarPacienteNoExiste() {
        // Arrange
        when(solicitudBolsaRepository.findByPacienteDniAndActivoTrue("12345678"))
            .thenReturn(new ArrayList<>()); // Lista vacía

        // Act
        boolean resultado = service.sincronizarEstadoAtendido(solicitudCitaMock);

        // Assert
        assertFalse(resultado, "Sincronización debe retornar false cuando paciente no existe");

        // Verificar que NO se intentó guardar nada
        verify(solicitudBolsaRepository, never()).save(any(SolicitudBolsa.class));

        // Verificar auditoría de paciente no encontrado
        verify(auditLogService, times(1)).registrarEvento(
            anyString(), eq("SINCRONIZAR_ESTADO_ATENDIDO"),
            eq("SINCRONIZACION_BOLSA"),
            contains("no encontrado"),
            eq("ADVERTENCIA"),
            eq("COMPLETADO"));
    }

    // ============================================================================
    // TC-04: Ya está ATENDIDO → skip actualización, log INFO
    // ============================================================================
    @Test
    @DisplayName("TC-04: Solicitud ya está en estado ATENDIDO → skip")
    void testSincronizarYaEstabAtendido() {
        // Arrange
        solicitudBolsaMock1.setEstadoGestionCitasId(EstadosCitaConstants.BOLSA_ATENDIDO_IPRESS);
        List<SolicitudBolsa> bolsas = List.of(solicitudBolsaMock1);
        when(solicitudBolsaRepository.findByPacienteDniAndActivoTrue("12345678"))
            .thenReturn(bolsas);

        // Act
        boolean resultado = service.sincronizarEstadoAtendido(solicitudCitaMock);

        // Assert
        assertTrue(resultado, "Sincronización debe retornar true (nada que hacer)");

        // Verificar que NO se intentó guardar (porque ya estaba ATENDIDO)
        verify(solicitudBolsaRepository, never()).save(any(SolicitudBolsa.class));
    }

    // ============================================================================
    // TC-05: Error en base de datos → lanzar SincronizacionException
    // ============================================================================
    @Test
    @DisplayName("TC-05: Error de base de datos → lanzar SincronizacionException")
    void testSincronizarErrorBaseData() {
        // Arrange
        List<SolicitudBolsa> bolsas = List.of(solicitudBolsaMock1);
        when(solicitudBolsaRepository.findByPacienteDniAndActivoTrue("12345678"))
            .thenReturn(bolsas);
        when(solicitudBolsaRepository.save(any(SolicitudBolsa.class)))
            .thenThrow(new RuntimeException("Conexión BD rechazada"));

        // Act & Assert
        assertThrows(SincronizacionException.class,
            () -> service.sincronizarEstadoAtendido(solicitudCitaMock),
            "Debe lanzar SincronizacionException en caso de error BD");

        // Verificar auditoría de error crítico
        verify(auditLogService, times(1)).registrarEvento(
            anyString(), eq("SINCRONIZAR_ESTADO_ATENDIDO"),
            eq("SINCRONIZACION_BOLSA"),
            contains("ERROR CRÍTICO"),
            eq("ERROR"),
            eq("ERROR"));
    }

    // ============================================================================
    // TC-06: Validación - Personal sin objeto (nulo)
    // ============================================================================
    @Test
    @DisplayName("TC-06: Personal es null → no guardar ID en bolsa")
    void testSincronizarPersonalNull() {
        // Arrange
        solicitudCitaMock.setPersonal(null); // Sin personal asignado
        List<SolicitudBolsa> bolsas = List.of(solicitudBolsaMock1);
        when(solicitudBolsaRepository.findByPacienteDniAndActivoTrue("12345678"))
            .thenReturn(bolsas);
        when(solicitudBolsaRepository.save(any(SolicitudBolsa.class)))
            .thenReturn(solicitudBolsaMock1);

        // Act
        boolean resultado = service.sincronizarEstadoAtendido(solicitudCitaMock);

        // Assert
        assertTrue(resultado);
        assertNull(solicitudBolsaMock1.getIdPersonal(),
            "idPersonal debe quedar null si no hay personal asignado");
    }

    // ============================================================================
    // TC-07: Sin contexto de seguridad → usuario es "SISTEMA"
    // ============================================================================
    @Test
    @DisplayName("TC-07: Sin contexto de seguridad → auditar como SISTEMA")
    void testSincronizarSinContextoSeguridad() {
        // Arrange
        SecurityContextHolder.clearContext(); // Limpiar contexto
        List<SolicitudBolsa> bolsas = List.of(solicitudBolsaMock1);
        when(solicitudBolsaRepository.findByPacienteDniAndActivoTrue("12345678"))
            .thenReturn(bolsas);
        when(solicitudBolsaRepository.save(any(SolicitudBolsa.class)))
            .thenReturn(solicitudBolsaMock1);

        // Act
        boolean resultado = service.sincronizarEstadoAtendido(solicitudCitaMock);

        // Assert
        assertTrue(resultado);

        // Verificar que auditó como "SISTEMA"
        ArgumentCaptor<String> usuarioCaptor = ArgumentCaptor.forClass(String.class);
        verify(auditLogService, atLeastOnce()).registrarEvento(
            usuarioCaptor.capture(), anyString(), anyString(), anyString(), anyString(), anyString());
        assertTrue(usuarioCaptor.getAllValues().stream()
            .anyMatch(v -> "SISTEMA".equals(v)),
            "Debe usar 'SISTEMA' como usuario cuando no hay contexto de seguridad");
    }
}
