# 🌿 Equilibra Fisioterapia - Guía de Despliegue en Render & Conexión con App Android

Este repositorio (`https://github.com/truckgreen/consultorio_issac`) contiene:
1. **App Android Nativa (Kotlin + Jetpack Compose + Room + Notificaciones)** en `/app`.
2. **Servidor Backend & Portal Web de Reservas en Vivo (Node.js + Express + HTML5)** en `/backend`.
3. **Configuración de Despliegue Automático para Render** en `/render.yaml`.

---

## 🚀 Paso a Paso: Cómo Subir y Desplegar en Render (100% Gratis)

### Paso 1: Subir los cambios a tu repositorio de GitHub
Asegúrate de que los nuevos archivos estén subidos a tu repositorio:
```bash
git add .
git commit -m "Agregar backend web y configuracion de Render para Equilibra"
git push origin main
```

---

### Paso 2: Crear tu cuenta y conectar con Render
1. Ve a [https://render.com](https://render.com) e inicia sesión (puedes registrarte gratis con tu cuenta de GitHub).
2. En el panel principal de Render (*Dashboard*), haz clic en el botón azul **"New +"** (arriba a la derecha).
3. Selecciona **"Web Service"**.

---

### Paso 3: Conectar tu repositorio de GitHub
1. Selecciona la opción **"Build and deploy from a Git repository"** y haz clic en *Next*.
2. Busca tu repositorio `truckgreen/consultorio_issac` y presiona **"Connect"**.

---

### Paso 4: Configurar el Servicio Web en Render
Completa los siguientes campos:
- **Name:** `equilibra-fisioterapia` (o el nombre que prefieras).
- **Language / Runtime:** `Node`.
- **Region:** Selecciona la más cercana (ej. *Oregon (US West)* o *Frankfurt (EU)*).
- **Branch:** `main` (o `master`).
- **Root Directory:** `backend` *(¡Muy importante! Indicar `backend` para que Render ejecute directamente el servidor Node.js)*.
- **Build Command:** `npm install`
- **Start Command:** `node server.js`
- **Instance Type:** Selecciona **Free ($0/month)**.

---

### Paso 5: Desplegar (*Deploy*)
1. Haz clic en el botón **"Create Web Service"** al final de la página.
2. Render comenzará a compilar e instalar las dependencias automáticamente. En 1-2 minutos verás en los logs:
   ```text
   🌿 Equilibra Fisioterapia - Servidor Activo
   🚀 Puerto: 10000
   📡 URL API Health: http://localhost:10000/api/health
   ==> Your service is live 🎉
   ```
3. Copia tu URL pública proporcionada por Render arriba a la izquierda, por ejemplo:
   `https://equilibra-fisioterapia.onrender.com`

---

## 📱 Cómo Conectar tu URL de Render con la App Android

1. Abre la aplicación **Equilibra** en tu teléfono móvil o emulador.
2. En la pantalla principal (**Dashboard**), presiona el banner **"Conexión Página Web ↔ App"** o el botón **"Configurar"**.
3. En la pestaña **"Conexión & Test"**, ingresa la URL de tu Render seguida de `/api/health`:
   ```text
   https://tu-servicio-en-render.onrender.com/api/health
   ```
4. Presiona el botón **"Verificar Conexión"**.
5. La app enviará una solicitud HTTPS en tiempo real y te mostrará la tarjeta verde con el código **HTTP 200 OK** y el tiempo de respuesta.

---

## 🌐 Endpoints de la API disponibles

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/` | Página web pública con el formulario interactivo de reserva de turnos |
| `GET` | `/api/health` | Verificación de estado del servidor y salud del servicio |
| `GET` | `/api/appointments` | Lista todos los turnos agendados (permite filtrar por `?date=YYYY-MM-DD`) |
| `POST` | `/api/appointments` | Registra una nueva solicitud de turno desde la web |
| `PATCH` | `/api/appointments/:id` | Actualiza estado de un turno (`CONFIRMADO`, `CANCELADO`, `isPaid`) |
| `DELETE` | `/api/appointments/:id` | Elimina un turno |
