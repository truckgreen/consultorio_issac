# EQUILIBRA Android

Aplicación Android nativa para EQUILIBRA, centro de fisioterapia, traumatología, nutrición, psicología y entrenamiento funcional en Caracas, Venezuela.

## Alcance

La aplicación ofrece dos experiencias dentro del mismo cliente:

### Experiencia de pacientes

- Catálogo de nueve servicios con descripción, beneficios, metodología, duración y tarifa.
- Equipo multidisciplinario y detalle de especialistas.
- Guía interactiva de recomendación.
- Reserva directa con selección de servicio, fecha y franja horaria.
- Validación de datos y comprobante con código `EQ-XXXX`.
- Consulta y eliminación local de citas registradas.
- Modo claro/oscuro y acciones de llamada y correo.

### Panel administrativo

- Dashboard con resumen de agenda y mensajes.
- Agenda con búsqueda y filtros por fecha y estado.
- Directorio de pacientes basado en citas.
- Gestión de especialistas y servicios.
- Bandeja de mensajes y leads.
- Creación, actualización de estado y eliminación de citas.
- Notificaciones, menú inferior adaptable y ajustes de datos.

## Arquitectura

```text
MainActivity
└── AdminMainScreen
	├── AdminViewModel
	├── UI Compose: dashboard, citas, pacientes, staff, servicios, mensajes
	└── AppointmentRepository
		├── Room / AppDatabase
		└── SupabaseAppointmentsDataSource
			├── PostgREST
			└── Realtime
```

Piezas principales:

- `app/src/main/java/com/example/equilibra/MainActivity.kt`: entrada y composición de la pantalla administrativa.
- `ui/viewmodel/EquilibraViewModel.kt`: estado y acciones de la experiencia pública.
- `ui/viewmodel/AdminViewModel.kt`: estado del panel y operaciones CRUD.
- `data/repository/EquilibraDataRepository.kt`: catálogo, equipo, sede y disponibilidad base.
- `data/local/AppointmentEntity.kt`: modelo Room de una cita.
- `data/local/AppDatabase.kt`: base de datos local `equilibra_database`.
- `data/remote/SupabaseAppointmentsDataSource.kt`: DTOs, PostgREST y Realtime.
- `ui/theme/`: tema Material 3 y paleta EQUILIBRA.

## Requisitos

- Android Studio reciente.
- JDK 21.
- Android SDK 35.
- Dispositivo o emulador con API 26 o superior.
- Acceso a internet para sincronización remota y carga de imágenes.

## Configuración de Supabase

Crea `aplicacion/.env` con:

```dotenv
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anon-publica
```

El archivo `app/build.gradle.kts` lee esas variables y las expone como `BuildConfig.SUPABASE_URL` y `BuildConfig.SUPABASE_ANON_KEY`. Usa únicamente la clave anon pública en la aplicación; nunca incluyas una `service_role`.

El esquema SQL de referencia está disponible en `src/lib/supabase.ts` y crea `appointments`, `contact_messages`, RLS y Realtime. Debes revisar las políticas antes de producción: el esquema de demostración permite operaciones a `public`.

## Compilación y pruebas

Desde `aplicacion/`:

```bash
# Windows
gradlew.bat assembleDebug
gradlew.bat test
gradlew.bat connectedAndroidTest

# macOS/Linux
./gradlew assembleDebug
./gradlew test
./gradlew connectedAndroidTest
```

El APK de debug se genera en `app/build/outputs/apk/debug/`.

## Persistencia y sincronización

Room es la fuente local de citas. Al iniciar, `AdminViewModel` carga datos remotos disponibles y los inserta en Room; después intenta conectarse a Realtime para observar cambios de `appointments`. Las operaciones remotas registran errores sin bloquear la interfaz local.

Los mensajes se consultan desde `contact_messages` en Supabase. La implementación Android no replica actualmente el fallback de mensajes a Room que sí existe para citas; considera este comportamiento al diseñar modo offline.

## Notas de mantenimiento

- No edites `app/build/`, `app/build/generated/` ni caches de Gradle.
- Mantén los estados de cita consistentes entre Android y Supabase: Android usa valores en minúsculas internamente y normaliza `PENDIENTE` a `pendiente_validacion`.
- Los datos de catálogo están hardcodeados en `EquilibraDataRepository`; un cambio de servicios o tarifas requiere recompilar la app.
- Las imágenes del catálogo y del equipo usan URLs remotas y requieren conectividad.
<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Equilibra - Fisioterapia & Bienestar Integral

Aplicación Android nativa desarrollada en Kotlin y Jetpack Compose para **EQUILIBRA**, centro especializado en fisioterapia avanzada, medicina traumatológica, nutrición, psicología y entrenamiento funcional en Caracas, Venezuela.

## Características Principales

- **Catálogo Completo de Servicios:** 9 especialidades clínicas y de movimiento con descripción detallada, metodología, beneficios, tarifas y duración.
- **Equipo Multidisciplinario:** Perfiles profesionales con credenciales, biografía y especialidades.
- **Guía Interactiva de Recomendación:** Cuestionario de orientación rápida para encontrar el tratamiento idóneo.
- **Sistema de Reservas en Línea:** Selector de calendario con disponibilidad de horarios en tiempo real (Disponible, Por confirmar, Ocupado) y validación de datos.
- **Persistencia Local con Room Database:** Almacenamiento seguro de citas agendadas en el dispositivo con generación de códigos de comprobante (`EQ-XXXX`).
- **Modo Oscuro Dinámico:** Interfaz diseñada con Material 3 y paleta personalizada en tonos ámbar y slate.
- **Acciones Rápidas:** Marcación directa de llamadas a la clínica y soporte para envío de correos.

## Tecnologías Utilizadas

- **Kotlin** & **Jetpack Compose** (Material 3)
- **Room Database** con KSP
- **Coil** para carga reactiva de imágenes
- **ViewModel** & **Coroutines / StateFlow**
- **Adaptive Layouts** & **Edge-to-Edge**

