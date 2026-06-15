# App de Cámara (cameraApp)

Captura la webcam con `getUserMedia`, detecta objetos **en el navegador** con
[TensorFlow.js + COCO-SSD](https://github.com/tensorflow/tfjs-models/tree/master/coco-ssd)
(sin GPU) y publica las "situaciones" al broker MQTT. Es la alternativa
multiplataforma a Frigate: **funciona en cualquier SO y con cualquier cámara**,
porque el navegador abstrae el acceso a la webcam.

No requiere build: HTML + JS vanilla, todo por CDN.

## Cómo correrlo

Levantá el stack (`docker compose up -d`) y abrí **http://localhost:8082**.
Tocá **Iniciar cámara** y aceptá el permiso de webcam.

> Atajo: `http://localhost:8082/?broker=ws://localhost:9001&cam=webcam-mac`.
> La cámara necesita **contexto seguro**: `http://localhost` sirve; por IP usá HTTPS.

## Qué publica

| Situación | Tópico | Payload |
|---|---|---|
| Aparece/desaparece un objeto | `camera/<camId>/events` | JSON `{ type:"new"\|"end", after:{ camera, label, score, start_time } }` |
| Captura al detectar | `camera/<camId>/<label>/snapshot` | imagen JPEG (binario) |

El formato espeja el de Frigate (`after.{camera,label,score}`), así la **central
de monitoreo** (`dashboardApp`) las muestra con el mismo código. El dashboard ya
está suscrito a `camera/#`.
