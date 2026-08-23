# EQUILIBRA

Plataforma digital para EQUILIBRA, centro de fisioterapia, salud integral y movimiento en Caracas, Venezuela. El repositorio reúne dos clientes que comparten el dominio funcional y el backend opcional de Supabase:

- **Web:** SPA responsiva para pacientes y gestión administrativa.
- **Android:** aplicación nativa en Kotlin y Jetpack Compose con experiencia de reserva y panel administrativo.

## Índice

- [Qué incluye](#qué-incluye)
- [Estructura del repositorio](#estructura-del-repositorio)
- [Aplicación web](#aplicación-web)
- [Aplicación Android](#aplicación-android)
- [Supabase y persistencia](#supabase-y-persistencia)
- [Datos y privacidad](#datos-y-privacidad)
- [Calidad y validación](#calidad-y-validación)
- [Estado del proyecto](#estado-del-proyecto)
- [Documentación técnica](docs/ARCHITECTURE.md)

## Qué incluye

La experiencia de EQUILIBRA permite:

- Explorar nueve servicios de fisioterapia, medicina, bienestar y movimiento.
- Consultar especialistas, especialidades, beneficios, metodología, duración y tarifas.
- Usar una guía interactiva que orienta hacia un servicio.
- Reservar una cita indicando servicio, fecha, horario y datos del paciente.
- Consultar el código de reserva y las citas registradas en el dispositivo.
- Contactar a la sede por teléfono o correo.
- Administrar citas, pacientes, especialistas, servicios, mensajes y configuración desde el panel.
- Cambiar entre modo claro y oscuro.
- Exportar citas a CSV y realizar respaldos JSON desde el panel web.

## Estructura del repositorio

```text
.
├── src/                    # Cliente web React + TypeScript
│   ├── components/         # Secciones públicas, modales y panel administrativo
│   ├── data/               # Servicios, equipo, FAQ, testimonios e imágenes
│   ├── lib/                # Cliente y operaciones de Supabase
│   └── types/              # Contratos TypeScript
├── public/imagenes/        # Recursos estáticos de la web
├── aplicacion/             # Proyecto Android y su cliente web asociado
│   ├── app/src/main/       # Kotlin, Compose, Room y ViewModels
│   ├── src/                # SPA React alternativa incluida en el proyecto Android
│   └── gradle/             # Wrapper y catálogo de versiones Gradle
├── docs/                   # Arquitectura y operación técnica
├── package.json            # Scripts del cliente web raíz
└── vite.config.ts         # Configuración Vite del cliente web raíz
```

Las carpetas `build/`, `app/build/` y otros artefactos generados no forman parte de la arquitectura fuente y no deben editarse manualmente.

## Aplicación web

### Requisitos

- Node.js 18 o superior recomendado.
- npm.
- Opcional: proyecto Supabase.

### Instalación y ejecución

Desde la raíz del repositorio:

```bash
npm install
npm run dev
```

La aplicación se sirve con Vite. Para generar y previsualizar una compilación:

```bash
npm run build
npm run preview
```

Scripts disponibles en el paquete raíz:

- `npm run dev`: servidor de desarrollo.
- `npm run build`: comprobación TypeScript y compilación Vite.
- `npm run preview`: servidor local para la compilación.

### Variables de entorno web

Crea `.env.local` en la raíz cuando quieras conectar Supabase:

```dotenv
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anon-publica
```

No publiques claves `service_role` ni credenciales privadas en el cliente. La aplicación usa la clave anon pública y la seguridad debe recaer en RLS.

### Flujo de la web

`src/App.tsx` compone la experiencia pública y conecta las secciones con el flujo de reservas. `src/lib/supabaseClient.ts` expone la configuración básica del cliente público; la implementación del panel y su fallback híbrido se encuentra en `aplicacion/src/lib/supabase.ts`.

## Aplicación Android

La aplicación nativa vive en `aplicacion/` y requiere Android Studio, JDK 21 y Android SDK 35. El módulo Android tiene `minSdk 26`, `targetSdk 35` y usa el namespace `com.example.equilibra`.

Desde `aplicacion/`:

```bash
./gradlew assembleDebug
./gradlew test
./gradlew connectedAndroidTest
```

En Windows, usa `gradlew.bat` en lugar de `./gradlew`.

La entrada nativa es `app/src/main/java/com/example/equilibra/MainActivity.kt`. La interfaz se construye con Compose Material 3; `EquilibraViewModel` controla la experiencia de pacientes y `AdminViewModel` controla el panel, filtros, CRUD y sincronización.

Para configurar Supabase en Android, crea `aplicacion/.env` con las mismas variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`. Gradle las convierte en campos de `BuildConfig` durante la compilación.

## Supabase y persistencia

El esquema de referencia está definido en `aplicacion/src/lib/supabase.ts` y contiene:

- `appointments`: citas, paciente, servicio, horario, especialista, estado, pago y notas.
- `contact_messages`: consultas recibidas desde la web y su estado administrativo.
- Realtime para cambios de `appointments`.

La web usa `localStorage` como respaldo para citas y mensajes. Si Supabase no está configurado o falla la red, la interfaz continúa trabajando localmente. Android usa Room con la tabla local `appointments` y consulta Supabase mediante PostgREST y Realtime.

Consulta [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) para el flujo detallado y la configuración de seguridad.

## Datos y privacidad

El sistema maneja nombres, teléfonos, correos, motivos de consulta y notas clínicas. Antes de usarlo con pacientes reales:

- Configura RLS con políticas mínimas por rol y elimina las políticas públicas permisivas del SQL de demostración.
- Define autenticación y autorización para el panel administrativo.
- Evita incluir datos reales en `sampleAdminData.ts` o en respaldos compartidos.
- Protege `.env`, `.env.local` y cualquier archivo con credenciales.
- Define retención, borrado y exportación conforme a la normativa aplicable.

## Calidad y validación

Validación web recomendada:

```bash
npm run build
```

Validación Android recomendada:

```bash
cd aplicacion
gradlew.bat assembleDebug
gradlew.bat test
```

El repositorio no incluye actualmente una suite completa de pruebas de negocio para reservas, permisos RLS o sincronización offline; esos escenarios deben cubrirse antes de producción.

## Estado del proyecto

El código contiene una base funcional de demostración con datos semilla, integración opcional con Supabase y clientes web/Android en evolución. La carpeta `aplicacion` conserva además una SPA React propia; al desarrollar, confirma si el cambio corresponde al cliente web raíz, a la SPA incluida en `aplicacion/src` o a la aplicación Android nativa.

## Documentación técnica

- [Arquitectura, flujos y operación](docs/ARCHITECTURE.md)
- [Guía Android](aplicacion/README.md)
<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/f4fa3691-77fa-47cd-954c-3452be86304d

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
