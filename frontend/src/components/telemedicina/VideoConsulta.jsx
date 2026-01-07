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
    token, // Token JWT para autenticación Jitsi
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
            
            // Función para solicitar permisos de dispositivos (no bloquea si falla)
            const requestMediaPermissions = async () => {
                try {
                    // Verificar si la API está disponible
                    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                        console.warn('⚠️ API de medios no disponible en este navegador');
                        return false;
                    }

                    // Solicitar permisos de audio y video explícitamente
                    const stream = await navigator.mediaDevices.getUserMedia({
                        audio: {
                            echoCancellation: true,
                            noiseSuppression: true,
                            autoGainControl: true
                        },
                        video: {
                            width: { ideal: 1280 },
                            height: { ideal: 720 },
                            facingMode: 'user'
                        }
                    });
                    // Detener el stream inmediatamente, solo queríamos los permisos
                    stream.getTracks().forEach(track => {
                        track.stop();
                        console.log('🛑 Track detenido:', track.kind);
                    });
                    console.log('✅ Permisos de dispositivos otorgados');
                    return true;
                } catch (error) {
                    console.warn('⚠️ Error al solicitar permisos (no crítico):', error.name, error.message);
                    // No mostramos error aquí, Jitsi puede solicitar permisos después
                    // Solo registramos para debugging
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

                // Intentar solicitar permisos antes de inicializar (no bloquea si falla)
                // Jitsi puede solicitar permisos después cuando el usuario intente unirse
                requestMediaPermissions().then(hasPermissions => {
                    if (hasPermissions) {
                        console.log('✅ Permisos obtenidos previamente');
                    } else {
                        console.log('ℹ️ Permisos se solicitarán cuando el usuario se una a la sala');
                    }
                }).catch(err => {
                    console.warn('⚠️ Error al solicitar permisos previamente:', err);
                });

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

                // Usar el token JWT pasado como prop, o intentar extraerlo de la URL como fallback
                let jwtToken = token || null;
                if (!jwtToken && roomUrl && roomUrl.includes('jwt=')) {
                    jwtToken = roomUrl.split('jwt=')[1].split('&')[0];
                    console.log('✅ Token JWT extraído de la URL (fallback)');
                }
                if (jwtToken) {
                    console.log('✅ Token JWT disponible para autenticación');
                } else {
                    console.warn('⚠️ No se encontró token JWT - la autenticación puede fallar');
                }
                const options = {
                    roomName: roomName,
                    parentNode: jitsiContainerRef.current,
                    configOverwrite: {
                        startWithAudioMuted: false,
                        startWithVideoMuted: false,
                        enableWelcomePage: false, // Deshabilitar página de bienvenida, usar prejoin
                        enableClosePage: false,
                        disableDeepLinking: true,
                        defaultLanguage: 'es',
                        prejoinPageEnabled: true, // Habilitar página de prejoin para configurar dispositivos
                        enableLayerSuspension: true,
                        enableNoAudioDetection: true,
                        enableNoisyMicDetection: true,
                        enableRemb: true,
                        enableTcc: true,
                        // Configuración de permisos
                        requireDisplayName: false,
                        enableInsecureRoomNameWarning: false,
                        constraints: {
                            video: {
                                height: { ideal: 720, max: 720, min: 180 },
                                width: { ideal: 1280, max: 1280, min: 320 },
                                facingMode: 'user'
                            },
                            audio: {
                                autoGainControl: true,
                                echoCancellation: true,
                                noiseSuppression: true,
                                sampleRate: 48000
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

                // Agregar JWT solo si está disponible (requerido para Jitsi JaaS)
                if (jwtToken) {
                    options.jwt = jwtToken;
                    console.log('✅ JWT configurado en opciones de Jitsi (longitud:', jwtToken.length, ')');
                } else {
                    console.error('❌ No se encontró token JWT - la autenticación Jitsi fallará');
                    toast.error('Error: No se pudo obtener el token de autenticación. Por favor, intenta de nuevo.', {
                        duration: 5000
                    });
                }

                try {
                    console.log('🔧 Opciones de Jitsi:', { domain, roomName, hasJWT: !!options.jwt });
                    const jitsiApi = new window.JitsiMeetExternalAPI(domain, options);
                    setApi(jitsiApi);
                    console.log('✅ Instancia de Jitsi creada exitosamente');

                    // 🎬 Agregar atributo 'allow' al iframe de Jitsi para permitir micrófono y cámara
                    // Esperar a que el iframe se cree (normalmente ocurre inmediatamente)
                    const allowMediaInIframe = () => {
                        const iframes = jitsiContainerRef.current?.querySelectorAll('iframe');
                        if (iframes && iframes.length > 0) {
                            iframes.forEach((iframe, index) => {
                                const allowAttr = 'microphone; camera; display-capture; fullscreen; autoplay; geolocation; accelerometer; gyroscope; magnetometer; usb; payment';
                                iframe.setAttribute('allow', allowAttr);
                                console.log(`✅ Atributo 'allow' agregado al iframe ${index}:`, allowAttr);
                            });
                        } else {
                            // Si los iframes no se han creado aún, intentar de nuevo en 100ms
                            setTimeout(allowMediaInIframe, 100);
                        }
                    };

                    // Dar un poco de tiempo para que el iframe se cree
                    setTimeout(allowMediaInIframe, 500);

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

                    jitsiApi.addEventListener('mediaDevicesPermissionDenied', (event) => {
                        console.error('❌ Permisos de dispositivos denegados:', event);
                        toast.error('Permisos de micrófono y cámara denegados. Por favor, permite el acceso en la configuración del navegador y recarga la página.', {
                            duration: 8000
                        });
                    });

                    jitsiApi.addEventListener('deviceListChanged', (devices) => {
                        console.log('📱 Dispositivos disponibles:', devices);
                    });

                    jitsiApi.addEventListener('participantKickedOut', (event) => {
                        console.warn('⚠️ Participante expulsado:', event);
                        if (event.kicked?.local) {
                            toast.error('Has sido expulsado de la videollamada');
                            handleClose();
                        }
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

            // Función para cargar el script de Jitsi
            const loadJitsiScript = (domain) => {
                return new Promise((resolve, reject) => {
                    // Verificar si ya existe un script con el mismo dominio
                    const existingScript = document.querySelector(`script[src*="${domain}/external_api.js"]`);
                    if (existingScript) {
                        // Si el script ya existe, esperar a que se cargue
                        let attempts = 0;
                        const checkInterval = setInterval(() => {
                            attempts++;
                            if (window.JitsiMeetExternalAPI) {
                                clearInterval(checkInterval);
                                console.log('✅ Jitsi API disponible después de esperar');
                                resolve();
                            } else if (attempts > 20) { // Esperar hasta 2 segundos (20 * 100ms)
                                clearInterval(checkInterval);
                                console.warn('⚠️ Script existe pero API no se cargó, intentando recargar...');
                                // Remover el script existente y cargar uno nuevo
                                existingScript.remove();
                                loadNewScript(domain, resolve, reject);
                            }
                        }, 100);
                    } else {
                        loadNewScript(domain, resolve, reject);
                    }
                });
            };

            // Función para cargar un nuevo script
            const loadNewScript = (domain, resolve, reject) => {
                const script = document.createElement('script');
                script.src = `https://${domain}/external_api.js`;
                script.async = true;
                script.onload = () => {
                    console.log('✅ Script de Jitsi cargado exitosamente desde', domain);
                    // Esperar un poco más para asegurar que la API esté disponible
                    setTimeout(() => {
                        if (window.JitsiMeetExternalAPI) {
                            resolve();
                        } else {
                            reject(new Error('API no disponible después de cargar el script'));
                        }
                    }, 200);
                };
                script.onerror = () => {
                    console.error('❌ Error al cargar script de Jitsi desde', domain);
                    reject(new Error(`Error al cargar script desde ${domain}`));
                };
                document.body.appendChild(script);
            };

            // Extraer el dominio de la roomUrl
            let scriptDomain = '8x8.vc';
            if (roomUrl) {
                try {
                    const url = new URL(roomUrl);
                    scriptDomain = url.hostname;
                    console.log('🌐 Dominio extraído para script:', scriptDomain);
                } catch (error) {
                    console.warn('⚠️ No se pudo extraer dominio para el script, usando por defecto');
                }
            }

            // Verificar si Jitsi ya está cargado
            if (window.JitsiMeetExternalAPI) {
                console.log('✅ Jitsi API ya está cargado');
                initializeJitsi().catch(error => {
                    console.error('❌ Error al inicializar Jitsi:', error);
                    toast.error('Error al inicializar la videollamada');
                });
            } else {
                console.log('📥 Cargando script de Jitsi desde', scriptDomain);
                loadJitsiScript(scriptDomain)
                    .then(() => {
                        console.log('✅ Script cargado, inicializando Jitsi...');
                        initializeJitsi().catch(error => {
                            console.error('❌ Error al inicializar Jitsi:', error);
                            toast.error('Error al inicializar la videollamada');
                        });
                    })
                    .catch(error => {
                        console.error('❌ Error al cargar script de Jitsi:', error);
                        toast.error('Error al cargar Jitsi Meet. Por favor, recarga la página.');
                    });
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
