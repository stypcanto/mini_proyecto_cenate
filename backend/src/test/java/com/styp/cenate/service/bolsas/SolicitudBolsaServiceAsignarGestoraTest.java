package com.styp.cenate.service.bolsas;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.styp.cenate.exception.ResourceNotFoundException;
import com.styp.cenate.exception.ValidationException;
import com.styp.cenate.model.Rol;
import com.styp.cenate.model.Usuario;
import com.styp.cenate.model.bolsas.SolicitudBolsa;
import com.styp.cenate.repository.UsuarioRepository;
import com.styp.cenate.repository.bolsas.SolicitudBolsaRepository;

/**
 * Tests unitarios para asignarGestora() en SolicitudBolsaService
 *
 * @version v1.0.0
 * @since 2026-01-29
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("Tests para asignación de gestora de citas")
class SolicitudBolsaServiceAsignarGestoraTest {

    @Mock
    private SolicitudBolsaRepository solicitudRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private SolicitudBolsaServiceImpl service;

    private SolicitudBolsa solicitudMock;
    private Usuario gestoraMock;
    private Rol rolGestor;

    @BeforeEach
    void setUp() {
        // Setup solicitud mock
        solicitudMock = new SolicitudBolsa();
        solicitudMock.setIdSolicitud(1L);
        solicitudMock.setNumeroSolicitud("SOL-001");
        solicitudMock.setPacienteNombre("Juan Pérez");
        solicitudMock.setActivo(true);

        // Setup rol GESTOR_DE_CITAS
        rolGestor = new Rol();
        rolGestor.setDescRol("GESTOR_DE_CITAS");

        // Setup gestora mock
        gestoraMock = new Usuario();
        gestoraMock.setIdUser(100L);
        gestoraMock.setNameUser("maria.gestor");
        gestoraMock.setStatUser("A"); // Activo
        gestoraMock.setRoles(Set.of(rolGestor));
    }

    // ============================================================================
    // TEST 1: Asignación exitosa
    // ============================================================================
    @Test
    @DisplayName("✅ Debe asignar gestora cuando todos los datos son válidos")
    void testAsignarGestora_ConDatosValidos_DebeAsignar() {
        // Arrange
        when(solicitudRepository.findById(1L)).thenReturn(Optional.of(solicitudMock));
        when(usuarioRepository.findById(100L)).thenReturn(Optional.of(gestoraMock));

        // Act
        assertDoesNotThrow(() -> service.asignarGestora(1L, 100L));

        // Assert
        ArgumentCaptor<SolicitudBolsa> captor = ArgumentCaptor.forClass(SolicitudBolsa.class);
        verify(solicitudRepository).save(captor.capture());

        SolicitudBolsa solicitudGuardada = captor.getValue();
        assertEquals(100L, solicitudGuardada.getResponsableGestoraId());
        assertNotNull(solicitudGuardada.getFechaAsignacion());
    }

    // ============================================================================
    // TEST 2: Solicitud no encontrada
    // ============================================================================
    @Test
    @DisplayName("❌ Debe lanzar ResourceNotFoundException si solicitud no existe")
    void testAsignarGestora_SolicitudNoExiste_LanzaExcepcion() {
        // Arrange
        when(solicitudRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(
            ResourceNotFoundException.class,
            () -> service.asignarGestora(999L, 100L)
        );

        assertTrue(exception.getMessage().contains("Solicitud 999 no encontrada"));
        verify(solicitudRepository, never()).save(any());
    }

    // ============================================================================
    // TEST 3: Solicitud inactiva
    // ============================================================================
    @Test
    @DisplayName("❌ Debe lanzar ValidationException si solicitud está inactiva")
    void testAsignarGestora_SolicitudInactiva_LanzaExcepcion() {
        // Arrange
        solicitudMock.setActivo(false);
        when(solicitudRepository.findById(1L)).thenReturn(Optional.of(solicitudMock));

        // Act & Assert
        ValidationException exception = assertThrows(
            ValidationException.class,
            () -> service.asignarGestora(1L, 100L)
        );

        assertTrue(exception.getMessage().contains("solicitud inactiva"));
        verify(solicitudRepository, never()).save(any());
    }

    // ============================================================================
    // TEST 4: Usuario gestora no encontrado
    // ============================================================================
    @Test
    @DisplayName("❌ Debe lanzar ResourceNotFoundException si gestora no existe")
    void testAsignarGestora_GestoraNoExiste_LanzaExcepcion() {
        // Arrange
        when(solicitudRepository.findById(1L)).thenReturn(Optional.of(solicitudMock));
        when(usuarioRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(
            ResourceNotFoundException.class,
            () -> service.asignarGestora(1L, 999L)
        );

        assertTrue(exception.getMessage().contains("Usuario 999 no encontrado"));
        verify(solicitudRepository, never()).save(any());
    }

    // ============================================================================
    // TEST 5: Usuario sin rol GESTOR_DE_CITAS
    // ============================================================================
    @Test
    @DisplayName("❌ Debe lanzar ValidationException si usuario no tiene rol GESTOR_DE_CITAS")
    void testAsignarGestora_SinRolGestor_LanzaExcepcion() {
        // Arrange
        Usuario usuarioSinRol = new Usuario();
        usuarioSinRol.setIdUser(100L);
        usuarioSinRol.setNameUser("maria.otro");
        usuarioSinRol.setStatUser("A");
        usuarioSinRol.setRoles(new HashSet<>()); // Sin rol

        when(solicitudRepository.findById(1L)).thenReturn(Optional.of(solicitudMock));
        when(usuarioRepository.findById(100L)).thenReturn(Optional.of(usuarioSinRol));

        // Act & Assert
        ValidationException exception = assertThrows(
            ValidationException.class,
            () -> service.asignarGestora(1L, 100L)
        );

        assertTrue(exception.getMessage().contains("no tiene el rol GESTOR_DE_CITAS"));
        verify(solicitudRepository, never()).save(any());
    }

    // ============================================================================
    // TEST 6: Usuario inactivo
    // ============================================================================
    @Test
    @DisplayName("❌ Debe lanzar ValidationException si usuario está inactivo")
    void testAsignarGestora_UsuarioInactivo_LanzaExcepcion() {
        // Arrange
        gestoraMock.setStatUser("I"); // Inactivo
        when(solicitudRepository.findById(1L)).thenReturn(Optional.of(solicitudMock));
        when(usuarioRepository.findById(100L)).thenReturn(Optional.of(gestoraMock));

        // Act & Assert
        ValidationException exception = assertThrows(
            ValidationException.class,
            () -> service.asignarGestora(1L, 100L)
        );

        assertTrue(exception.getMessage().contains("está inactivo"));
        verify(solicitudRepository, never()).save(any());
    }

    // ============================================================================
    // TEST 7: Reasignación (cambio de gestora)
    // ============================================================================
    @Test
    @DisplayName("✅ Debe permitir reasignar a una gestora diferente")
    void testAsignarGestora_Reasignacion_DebeActualizar() {
        // Arrange
        solicitudMock.setResponsableGestoraId(50L); // Ya tiene una gestora anterior
        when(solicitudRepository.findById(1L)).thenReturn(Optional.of(solicitudMock));
        when(usuarioRepository.findById(100L)).thenReturn(Optional.of(gestoraMock));

        // Act
        assertDoesNotThrow(() -> service.asignarGestora(1L, 100L));

        // Assert
        ArgumentCaptor<SolicitudBolsa> captor = ArgumentCaptor.forClass(SolicitudBolsa.class);
        verify(solicitudRepository).save(captor.capture());

        SolicitudBolsa solicitudGuardada = captor.getValue();
        assertEquals(100L, solicitudGuardada.getResponsableGestoraId());
        assertNotNull(solicitudGuardada.getFechaAsignacion());
    }

    // ============================================================================
    // TEST 8: Timestamp se establece correctamente
    // ============================================================================
    @Test
    @DisplayName("✅ Debe establecer fecha_asignacion con timestamp actual")
    void testAsignarGestora_DebeEstablecerFechaAsignacion() {
        // Arrange
        OffsetDateTime antesDeAsignar = OffsetDateTime.now();
        when(solicitudRepository.findById(1L)).thenReturn(Optional.of(solicitudMock));
        when(usuarioRepository.findById(100L)).thenReturn(Optional.of(gestoraMock));

        // Act
        service.asignarGestora(1L, 100L);
        OffsetDateTime despuesDeAsignar = OffsetDateTime.now();

        // Assert
        ArgumentCaptor<SolicitudBolsa> captor = ArgumentCaptor.forClass(SolicitudBolsa.class);
        verify(solicitudRepository).save(captor.capture());

        SolicitudBolsa solicitudGuardada = captor.getValue();
        assertNotNull(solicitudGuardada.getFechaAsignacion());
        assertTrue(
            solicitudGuardada.getFechaAsignacion().isAfter(antesDeAsignar) ||
            solicitudGuardada.getFechaAsignacion().isEqual(antesDeAsignar)
        );
        assertTrue(
            solicitudGuardada.getFechaAsignacion().isBefore(despuesDeAsignar) ||
            solicitudGuardada.getFechaAsignacion().isEqual(despuesDeAsignar)
        );
    }
}
