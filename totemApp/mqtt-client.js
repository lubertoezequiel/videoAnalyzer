// mqtt-client.js — publica alertas del tótem al broker MQTT por WebSocket.
// El navegador no puede hablar MQTT por TCP, así que usamos mqtt.js sobre WS
// (listener :9001 de mosquitto). Si mqtt.js o el broker no están disponibles,
// degrada en silencio: el tótem sigue mostrando la simulación local igual.
//
// Contrato de mensajes (lo consume la central de monitoreo, dashboardApp):
//   topic:   totem/<TOTEM_ID>/emergency
//   payload: { type:"panic"|"panic_cancel", totem_id, branch, location,
//              status:"active"|"cancelled", ts:<epoch_ms>, time:"HH:MM:SS" }

window.TOTEM_MQTT_CONFIG = window.TOTEM_MQTT_CONFIG || {
  url: "ws://localhost:9001", // WebSocket del broker. En kiosko real: ws://<IP-broker>:9001
  totemId: "GAL-1042",
  branch: "Sucursal Centro",
  topicBase: "totem",
};

window.TotemMQTT = {
  _client: null,
  _connecting: false,

  _topic() {
    const c = window.TOTEM_MQTT_CONFIG;
    return c.topicBase + "/" + c.totemId + "/emergency";
  },

  // Conexión perezosa y reutilizable. Devuelve el client o null si no se puede.
  _ensure() {
    if (this._client) return this._client;
    if (typeof window.mqtt === "undefined") {
      console.warn("[TotemMQTT] mqtt.js no está cargado; alerta solo local.");
      return null;
    }
    if (this._connecting) return null;
    this._connecting = true;
    const c = window.TOTEM_MQTT_CONFIG;
    try {
      this._client = window.mqtt.connect(c.url, {
        clientId: "totem-" + c.totemId + "-" + Math.random().toString(16).slice(2, 8),
        reconnectPeriod: 3000,
        connectTimeout: 4000,
        // Last Will: si el tótem se desconecta sin avisar, el broker publica esto.
        will: {
          topic: this._topic(),
          payload: JSON.stringify({ type: "offline", totem_id: c.totemId, status: "offline" }),
          qos: 1, retain: false,
        },
      });
      this._client.on("connect", () => console.info("[TotemMQTT] conectado a", c.url));
      this._client.on("error", (e) => console.warn("[TotemMQTT] error:", e && e.message));
    } catch (e) {
      console.warn("[TotemMQTT] no se pudo conectar:", e && e.message);
      this._client = null;
    } finally {
      this._connecting = false;
    }
    return this._client;
  },

  _publish(payload) {
    const client = this._ensure();
    if (!client) return false;
    try {
      client.publish(this._topic(), JSON.stringify(payload), { qos: 1, retain: false });
      return true;
    } catch (e) {
      console.warn("[TotemMQTT] publish falló:", e && e.message);
      return false;
    }
  },

  _base(extra) {
    const c = window.TOTEM_MQTT_CONFIG;
    return Object.assign({
      totem_id: c.totemId,
      branch: c.branch,
      location: c.branch,
      ts: Date.now(),
      time: new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    }, extra || {});
  },

  // Botón de pánico presionado.
  publishPanic(info) {
    return this._publish(this._base({ type: "panic", status: "active", time: (info && info.time) || undefined }));
  },

  // Alerta cancelada desde el tótem.
  publishCancel(info) {
    return this._publish(this._base({ type: "panic_cancel", status: "cancelled", time: (info && info.time) || undefined }));
  },
};
