// ========================================================================
// 📹 VideoConsulta.jsx - Componente de Videollamada con Jitsi JaaS
// ========================================================================
// Componente para iniciar videollamadas usando Jitsi Meet
// ========================================================================

import React, { useEffect, useRef, useState } from 'react';
import { Video, PhoneOff, Mic, MicOff, VideoIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const VideoConsulta = ({ 
    isOpen, 
    onClose, 
    roomUrl, 
    roomName,
    nombrePaciente,
    nombreMedico,
    onCallEnd,
    registroContent = null // Contenido del formulario de registro
}) => {
    const jitsiContainerRef = useRef(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [participants, setParticipants] = useState(0);
    const [api, setApi] = useState(null);

    useEffect(() => {
        if (isOpen && roomUrl && jitsiContainerRef.current) {
            console.log('📹 Inicializando videollamada:', { roomUrl, roomName, nombrePaciente, nombreMedico });
            
            // Función para solicitar permisos de dispositivos
            const requestMediaPermissions = async () => {
                try {
                    // Solicitar permisos de audio y video explícitamente
                    const stream = await navigator.mediaDevices.getUserMedia({
                        audio: true,
                        video: true
                    });
                    // Detener el stream inmediatamente, solo queríamos los permisos
                    stream.getTracks().forEach(track => track.stop());
                    console.log('✅ Permisos de dispositivos otorgados');
                    return true;
                } catch (error) {
                    console.error('❌ Error al solicitar permisos:', error);
                    if (error.name === 'NotAllowedError') {
                        toast.error('Permisos denegados. Por favor, permite el acceso a micrófono y cámara en la configuración del navegador.', {
                            duration: 6000
                        });
                    } else if (error.name === 'NotFoundError') {
                        toast.error('No se encontraron dispositivos de audio/video. Verifica que estén conectados.', {
                            duration: 5000
                        });
                    } else {
                        toast.error('Error al acceder a los dispositivos: ' + error.message, {
                            duration: 5000
                        });
                    }
                    return false;
                }
            };

            // Función para inicializar Jitsi
            const initializeJitsi = async () => {
                if (!window.JitsiMeetExternalAPI) {
                    console.error('❌ Jitsi Meet API no está disponible');
                    toast.error('Error al cargar Jitsi Meet. Por favor, recarga la página.');
                    return;
                }

                console.log('✅ Jitsi Meet API disponible, inicializando...');

                // Solicitar permisos antes de inicializar
                const hasPermissions = await requestMediaPermissions();
                if (!hasPermissions) {
                    console.warn('⚠️ Permisos no otorgados, pero continuando con la inicialización...');
                    // Continuamos de todas formas, Jitsi puede manejar esto
                }

                // Extraer el dominio completo de la URL (incluyendo el tenant)
                let domain = '8x8.vc'; // Valor por defecto
                if (roomUrl) {
                    try {
                        const url = new URL(roomUrl);
                        domain = url.hostname; // Esto incluirá el tenant: vpaas-magic-cookie-...8x8.vc
                        console.log('✅ Dominio extraído de la URL:', domain);
                    } catch (error) {
                        console.warn('⚠️ No se pudo parsear la URL, usando dominio por defecto:', error);
                    }
                }

                // Extraer el token JWT de la URL si está presente
                let jwtToken = null;
                if (roomUrl && roomUrl.includes('jwt=')) {
                    jwtToken = roomUrl.split('jwt=')[1].split('&')[0];
                    console.log('✅ Token JWT extraído de la URL');
                }
                const options = {
                    roomName: roomName,
                    parentNode: jitsiContainerRef.current,
                    configOverwrite: {
                        startWithAudioMuted: false,
                        startWithVideoMuted: false,
                        enableWelcomePage: true, // Habilitar página de bienvenida para solicitar permisos
                        enableClosePage: false,
                        disableDeepLinking: true,
                        defaultLanguage: 'es',
                        prejoinPageEnabled: true, // Habilitar página de prejoin para configurar dispositivos
                        enableLayerSuspension: true,
                        constraints: {
                            video: {
                                height: { ideal: 720, max: 720, min: 180 },
                                width: { ideal: 1280, max: 1280, min: 320 }
                            },
                            audio: {
                                autoGainControl: true,
                                echoCancellation: true,
                                noiseSuppression: true
                            }
                        },
                        toolbarButtons: [
                            'microphone',
                            'camera',
                            'closedcaptions',
                            'desktop',
                            'fullscreen',
                            'fodeviceselection',
                            'hangup',
                            'profile',
                            'chat',
                            'recording',
                            'livestreaming',
                            'settings',
                            'videoquality',
                            'filmstrip',
                            'invite',
                            'feedback',
                            'stats',
                            'shortcuts'
                        ]
                    },
                    interfaceConfigOverwrite: {
                        TOOLBAR_BUTTONS: [
                            'microphone',
                            'camera',
                            'closedcaptions',
                            'desktop',
                            'fullscreen',
                            'fodeviceselection',
                            'hangup',
                            'profile',
                            'chat',
                            'recording',
                            'livestreaming',
                            'settings',
                            'videoquality',
                            'filmstrip',
                            'invite',
                            'feedback',
                            'stats',
                            'shortcuts'
                        ],
                        SETTINGS_SECTIONS: ['devices', 'language', 'moderator', 'profile'],
                        DEFAULT_BACKGROUND: '#0A5BA9',
                        BRAND_WATERMARK_LINK: '',
                        SHOW_JITSI_WATERMARK: false,
                        SHOW_WATERMARK_FOR_GUESTS: false,
                        SHOW_BRAND_WATERMARK: false,
                        SHOW_POWERED_BY: false
                    },
                    userInfo: {
                        displayName: nombreMedico || 'Médico CENATE',
                        email: ''
                    }
                };

                // Agregar JWT solo si está disponible
                if (jwtToken) {
                    options.jwt = jwtToken;
                    console.log('✅ JWT configurado en opciones de Jitsi');
                } else {
                    console.warn('⚠️ No se encontró token JWT en la URL');
                }

                try {
                    console.log('🔧 Opciones de Jitsi:', { domain, roomName, hasJWT: !!options.jwt });
                    const jitsiApi = new window.JitsiMeetExternalAPI(domain, options);
                    setApi(jitsiApi);
                    console.log('✅ Instancia de Jitsi creada exitosamente');

                    // Event listeners
                    jitsiApi.addEventListener('videoConferenceJoined', (event) => {
                        console.log('✅ Usuario se unió a la videollamada', event);
                        toast.success('Conectado a la videollamada');
                    });

                    jitsiApi.addEventListener('participantJoined', (event) => {
                        console.log('👤 Participante se unió:', event);
                        setParticipants(prev => prev + 1);
                    });

                    jitsiApi.addEventListener('participantLeft', (event) => {
                        console.log('👋 Participante salió:', event);
                        setParticipants(prev => Math.max(0, prev - 1));
                    });

                    jitsiApi.addEventListener('errorOccurred', (error) => {
                        console.error('❌ Error en Jitsi:', error);
                        const errorMsg = error.error || error.message || 'Error desconocido';
                        
                        // Manejar errores de permisos específicamente
                        if (errorMsg.includes('Permission denied') || errorMsg.includes('NotAllowedError')) {
                            toast.error('Por favor, permite el acceso a tu micrófono y cámara en la configuración del navegador', {
                                duration: 5000
                            });
                        } else {
                            toast.error('Error en la videollamada: ' + errorMsg);
                        }
                    });

                    jitsiApi.addEventListener('deviceListChanged', (devices) => {
                        console.log('📱 Dispositivos disponibles:', devices);
                    });

                    jitsiApi.addEventListener('mediaDevicesPermissionDenied', () => {
                        console.error('❌ Permisos de dispositivos denegados');
                        toast.error('Permisos de micrófono y cámara denegados. Por favor, permite el acceso en la configuración del navegador.', {
                            duration: 6000
                        });
                    });


                    jitsiApi.addEventListener('videoConferenceLeft', () => {
                        console.log('👋 Usuario salió de la videollamada');
                        if (onCallEnd) {
                            onCallEnd();
                        }
                        handleClose();
                    });

                    jitsiApi.addEventListener('audioMuteStatusChanged', (event) => {
                        setIsMuted(event.muted);
                    });

                    jitsiApi.addEventListener('videoMuteStatusChanged', (event) => {
                        setIsVideoOff(event.muted);
                    });

                    jitsiApi.addEventListener('readyToClose', () => {
                        handleClose();
                    });

                } catch (error) {
                    console.error('❌ Error al inicializar Jitsi:', error);
                    toast.error('Error al iniciar la videollamada');
                }
            };

            // Verificar si Jitsi ya está cargado
            if (window.JitsiMeetExternalAPI) {
                console.log('✅ Jitsi API ya está cargado');
                initializeJitsi().catch(error => {
                    console.error('❌ Error al inicializar Jitsi:', error);
                    toast.error('Error al inicializar la videollamada');
                });
            } else {
                console.log('📥 Cargando script de Jitsi...');
                // Cargar el script de Jitsi si no está cargado
                const existingScript = document.querySelector('script[src*="external_api.js"]');
                if (existingScript) {
                    console.log('✅ Script de Jitsi ya existe en el DOM');
                    // Esperar un momento y verificar si se cargó
                    setTimeout(() => {
                        if (window.JitsiMeetExternalAPI) {
                            initializeJitsi().catch(error => {
                                console.error('❌ Error al inicializar Jitsi:', error);
                                toast.error('Error al inicializar la videollamada');
                            });
                        } else {
                            console.error('❌ Script existe pero API no está disponible');
                            toast.error('Error al cargar Jitsi Meet. Por favor, recarga la página.');
                        }
                    }, 500);
                } else {
                    // Extraer el dominio de la roomUrl para cargar el script correcto
                    let scriptDomain = '8x8.vc';
                    if (roomUrl) {
                        try {
                            const url = new URL(roomUrl);
                            scriptDomain = url.hostname;
                        } catch (error) {
                            console.warn('⚠️ No se pudo extraer dominio para el script, usando por defecto');
                        }
                    }
                    const script = document.createElement('script');
                    script.src = `https://${scriptDomain}/external_api.js`;
                    script.async = true;
                    script.onload = () => {
                        console.log('✅ Script de Jitsi cargado exitosamente');
                        setTimeout(() => {
                            initializeJitsi().catch(error => {
                                console.error('❌ Error al inicializar Jitsi:', error);
                                toast.error('Error al inicializar la videollamada');
                            });
                        }, 100);
                    };
                    script.onerror = () => {
                        console.error('❌ Error al cargar script de Jitsi');
                        toast.error('Error al cargar Jitsi Meet. Verifica tu conexión a internet.');
                    };
                    document.body.appendChild(script);
                }
            }
        }

        // Cleanup
        return () => {
            if (api) {
                try {
                    console.log('🧹 Limpiando instancia de Jitsi...');
                    api.dispose();
                    setApi(null);
                } catch (error) {
                    console.error('Error al limpiar Jitsi API:', error);
                }
            }
        };
    }, [isOpen, roomUrl, roomName, nombrePaciente, nombreMedico]);

    const handleClose = () => {
        if (api) {
            try {
                api.executeCommand('hangup');
                api.dispose();
            } catch (error) {
                console.error('Error al cerrar videollamada:', error);
            }
        }
        setApi(null);
        onClose();
    };

    const toggleMute = () => {
        if (api) {
            api.executeCommand('toggleAudio');
        }
    };

    const toggleVideo = () => {
        if (api) {
            api.executeCommand('toggleVideo');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 text-white shadow-lg bg-gradient-to-r from-blue-900 to-blue-800">
                <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-white/20">
                        <Video className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold">Videollamada - CENATE</h2>
                        <p className="text-sm text-white/80">
                            {nombrePaciente && `Paciente: ${nombrePaciente}`}
                            {participants > 0 && ` • ${participants} participante(s)`}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleMute}
                        className={`p-2 rounded-lg transition-all ${
                            isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-white/20 hover:bg-white/30'
                        }`}
                        title={isMuted ? 'Activar micrófono' : 'Silenciar micrófono'}
                    >
                        {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>
                    <button
                        onClick={toggleVideo}
                        className={`p-2 rounded-lg transition-all ${
                            isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-white/20 hover:bg-white/30'
                        }`}
                        title={isVideoOff ? 'Activar cámara' : 'Desactivar cámara'}
                    >
                        {isVideoOff ? <VideoIcon className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                    </button>
                    <button
                        onClick={handleClose}
                        className="p-2 transition-all bg-red-500 rounded-lg hover:bg-red-600"
                        title="Finalizar videollamada"
                    >
                        <PhoneOff className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Contenedor dividido: Jitsi a la izquierda, Registro a la derecha */}
            <div className="relative flex flex-1">
                {/* Mitad izquierda: Jitsi */}
                <div className={`relative ${registroContent ? 'w-1/2' : 'w-full'} border-r border-gray-700`}>
                    <div 
                        ref={jitsiContainerRef} 
                        className="w-full h-full"
                        style={{ minHeight: '600px' }}
                    />
                    
                    {/* Loading overlay */}
                    {!api && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                            <div className="text-center text-white">
                                <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                                <p className="text-lg font-semibold">Iniciando videollamada...</p>
                                <p className="mt-2 text-sm text-gray-400">Por favor espere</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Mitad derecha: Contenido completo del Modal con todas las pestañas */}
                {registroContent && (
                    <div className="flex flex-col w-1/2 overflow-hidden bg-white">
                        {registroContent}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoConsulta;
