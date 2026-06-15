# Central de Monitoreo (dashboardApp)

App web que se suscribe al broker MQTT (mosquitto) por **WebSocket** y muestra en
vivo las señales del sistema:

- 🚨 **Pánico** del tótem (`totem/<id>/emergency`) — alerta roja + sonido.
- 📷 **Eventos de Frigate** (`frigate/events`) — cámara, objeto, confianza.
- 🖼️ **Snapshots** de Frigate (`frigate/<cam>/<obj>/snapshot`) — la imagen capturada.
- Panel de **entradas crudas** con cada mensaje que llega al broker.

No requiere build: es HTML + JS vanilla + [mqtt.js](https://github.com/mqttjs/MQTT.js) por CDN.

## Cómo correrlo

1. Levantá el stack (incluye mosquitto con listener WebSocket en `:9001`):
   ```bash
   docker compose up -d
   ```
2. Serví esta carpeta por HTTP (cualquier server estático):
   ```bash
   cd dashboardApp && python3 -m http.server 8080
   ```
3. Abrí `http://localhost:8080`, poné la URL del broker (`ws://localhost:9001`) y
   tocá **Conectar**. Atajo: `http://localhost:8080/?broker=ws://localhost:9001&autoconnect=1`.

> Desde otra máquina de la red, usá la IP del host del broker: `ws://<IP>:9001`.

## Esquema de tópicos

| Origen | Tópico | Payload |
|---|---|---|
| Tótem | `totem/<TOTEM_ID>/emergency` | JSON `{ type:"panic"\|"panic_cancel", totem_id, branch, location, status, ts, time }` |
| Frigate | `frigate/events` | JSON de evento (`after.camera`, `after.label`, `after.score`, …) |
| Frigate | `frigate/<cam>/<obj>/snapshot` | imagen JPEG (binario) |

El tótem publica con `totemApp/mqtt-client.js` (configurable en `window.TOTEM_MQTT_CONFIG`).
