/**
 * 🌐 WebSocket Service - Real-time Sync para TeleEKG
 * Maneja conexión y mensajes de WebSocket para sincronización instantánea
 */

class WebSocketService {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 3000; // 3 segundos
    this.messageHandlers = {};
  }

  /**
   * Conectar a WebSocket
   */
  connect(onOpen, onMessage, onError, onClose) {
    try {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${wsProtocol}//${window.location.host}/ws/teleekgs`;

      console.log(`🔗 Conectando a WebSocket: ${wsUrl}`);

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log("✅ WebSocket conectado");
        this.reconnectAttempts = 0;
        if (onOpen) onOpen();
      };

      this.ws.onmessage = (event) => {
        console.log("📨 Mensaje WebSocket recibido:", event.data);
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
          if (onMessage) onMessage(data);
        } catch (error) {
          console.error("Error parseando mensaje:", error);
        }
      };

      this.ws.onerror = (error) => {
        console.error("❌ Error WebSocket:", error);
        if (onError) onError(error);
      };

      this.ws.onclose = () => {
        console.log("🔌 WebSocket desconectado");
        if (onClose) onClose();
        this.attemptReconnect(onOpen, onMessage, onError, onClose);
      };
    } catch (error) {
      console.error("No se pudo conectar a WebSocket:", error);
    }
  }

  /**
   * Intentar reconectar
   */
  attemptReconnect(onOpen, onMessage, onError, onClose) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 Reintentando conexión (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

      setTimeout(() => {
        this.connect(onOpen, onMessage, onError, onClose);
      }, this.reconnectInterval * this.reconnectAttempts);
    } else {
      console.error("❌ Máximo número de intentos de reconexión alcanzado");
    }
  }

  /**
   * Registrar handler para tipo de mensaje
   */
  onMessageType(type, handler) {
    if (!this.messageHandlers[type]) {
      this.messageHandlers[type] = [];
    }
    this.messageHandlers[type].push(handler);
  }

  /**
   * Manejar mensaje y ejecutar handlers registrados
   */
  handleMessage(data) {
    const handlers = this.messageHandlers[data.type] || [];
    handlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error("Error en handler:", error);
      }
    });
  }

  /**
   * Enviar mensaje al servidor
   */
  send(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
      console.log("📤 Mensaje enviado:", message);
    } else {
      console.warn("⚠️ WebSocket no está conectado");
    }
  }

  /**
   * Desconectar
   */
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.messageHandlers = {};
  }

  /**
   * Verificar si está conectado
   */
  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }
}

export default new WebSocketService();
