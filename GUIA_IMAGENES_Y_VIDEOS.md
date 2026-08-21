# 📖 Guía para Personalizar Imágenes y Videos en EQUILIBRA

Esta guía te muestra con precisión en qué archivos y carpetas colocar tus propias fotos, logotipos y videos de la clínica.

---

## 🎯 1. Dónde colocar tus archivos de imágenes y videos

La carpeta recomendada para almacenar tus archivos multimedia es `/public/`:

```text
/public/
  ├── images/
  │   ├── logo.png                      <-- Tu logotipo oficial
  │   ├── fachada-sede.jpg              <-- Foto de la sede de Sabana Grande
  │   ├── fisioterapia-general.jpg      <-- Foto del servicio
  │   ├── fisioterapia-deportiva.jpg
  │   ├── traumatologia.jpg
  │   └── especialistas/
  │       ├── mariana-valdes.jpg        <-- Fotos del equipo
  │       └── alejandro-rivas.jpg
  │
  └── videos/
      ├── fisioterapia-general.mp4      <-- Videos demostrativos en MP4
      ├── nutricion-clinica.mp4
      └── entrenamiento.mp4
```

> **Nota:** Todos los archivos dentro de `/public/` están disponibles directamente en la web. Por ejemplo, si guardas un archivo en `/public/images/logo.png`, su ruta en la página es simplemente `/images/logo.png`.

---

## ⚙️ 2. Dónde editar las rutas en el código

Hemos centralizado toda la configuración en un solo archivo fácil de modificar:

📁 **`src/config/mediaAssets.ts`**

### Ejemplo para cambiar una imagen:
```typescript
// En src/config/mediaAssets.ts
services: {
  'fisioterapia-general': {
    id: 'fisioterapia-general',
    serviceTitle: 'Fisioterapia General',
    // Coloca tu archivo local o un enlace web:
    image: '/images/fisioterapia-general.jpg',
    ...
  }
}
```

### Ejemplo para colocar un Video de YouTube o Vimeo:
```typescript
// En src/config/mediaAssets.ts
services: {
  'fisioterapia-general': {
    ...
    // Pega cualquier enlace de YouTube o Vimeo:
    videoUrl: 'https://www.youtube.com/watch?v=TU_ID_DE_VIDEO',
    // O un archivo MP4 local:
    // videoUrl: '/videos/fisioterapia-general.mp4',
  }
}
```

> 💡 **Simulador Clínico Automático:** Si dejas `videoUrl: ''` vacío, la plataforma activará automáticamente el reproductor con simulación clínica 3D/2D interactiva, capítulos paso a paso y métricas de recuperación.

---

## 🚀 3. Conexión en Tiempo Real a través de Internet

La aplicación incluye un servidor backend Node.js / Express con endpoints REST:
- `GET /api/appointments` - Consulta de citas agendadas en tiempo real.
- `POST /api/appointments` - Agendamiento instantáneo de citas desde la web o móvil.
- `PATCH /api/appointments/:id` - Actualización de estado en vivo (Confirmada, En Atención, Finalizada).
- `GET /api/patients` & `POST /api/patients` - Sincronización clínica.
- `POST /api/chat` - Mensajería instantánea de staff.

Cualquier cita reservada por un paciente desde su teléfono o computadora se sincroniza de forma inmediata en la nube y aparece en segundos en el **Panel Staff / Administradores**.

---

## 📱 4. Cómo Descargar e Instalar la App en Móvil o Computadora

La app está equipada como una **PWA (Progressive Web App)**:
1. **En Celulares Android (Chrome / Brave / Edge):**
   - Pulsa el botón flotante **"Descargar / Instalar App"** en pantalla o pulsa los 3 puntos del navegador y selecciona **"Instalar aplicación"** / **"Añadir a la pantalla de inicio"**.
2. **En iPhone / iPad (Safari):**
   - Pulsa el botón **Compartir** (icono de cuadro con flecha hacia arriba) y selecciona **"Añadir a pantalla de inicio"** (Add to Home Screen).
3. **En Computadoras (Windows / Mac):**
   - Haz clic en el icono de instalación en la barra de direcciones de Google Chrome o en el botón **"Instalar App"** de la página.
