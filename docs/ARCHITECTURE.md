# Arquitectura y operación

## Visión general

El repositorio contiene dos clientes para el mismo dominio de negocio:

| Cliente | Tecnología | Entrada | Persistencia principal |
| --- | --- | --- | --- |
| Web raíz | React 18 + TypeScript + Vite + Tailwind | `src/App.tsx` | `localStorage` y Supabase opcional |
| Android | Kotlin + Jetpack Compose + Material 3 | `aplicacion/app/src/main/.../MainActivity.kt` | Room y Supabase |

`aplicacion/src` contiene además una SPA React con su propia composición de panel. No debe asumirse que cada componente de esa SPA es idéntico al cliente web raíz.

## Web raíz

`src/App.tsx` compone la navegación pública: encabezado, hero, información de la clínica, servicios, equipo, especialidades, filosofía, propuesta de valor, evaluación interactiva, reservas, testimonios, FAQ y contacto.

El flujo de reserva recibe un servicio preseleccionado desde cualquier sección. La UI de reserva controla fecha, horario, datos de contacto y primera visita. Los servicios y contenido editorial están en `src/data`; los tipos están en `src/types`.

La configuración pública de Supabase se lee desde `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`. El cliente raíz mantiene un módulo ligero en `src/lib/supabaseClient.ts`; el panel híbrido incluido en `aplicacion/src/lib/supabase.ts` contiene las operaciones más completas de citas y mensajes.

## Web administrativa híbrida

El panel de `aplicacion/src` mantiene el estado en `aplicacion/src/App.tsx` y delega acceso a datos en `aplicacion/src/lib/supabase.ts`.

### Lectura

1. Se buscan credenciales personalizadas en `localStorage`.
2. Si no existen, se revisan las variables Vite.
3. Si hay cliente Supabase, se consultan las tablas.
4. Ante ausencia de conexión o error, se usa el caché local.
5. Sin datos conectados, se cargan datos semilla para mostrar un panel demostrable.

### Escritura

Las citas y mensajes se guardan primero en `localStorage`. Cuando existe cliente Supabase, también se intenta insertar, actualizar o eliminar en la nube. Un fallo remoto no invalida la operación local, pero puede producir divergencia: la aplicación registra el aviso en consola y no implementa una cola formal de reintentos.

### Realtime

La web se suscribe a cambios de `public.appointments` con el canal `admin-appointments`. La suscripción vuelve a cargar la agenda cuando recibe un evento.

## Android

La app nativa usa una separación ViewModel, repositorio y fuentes de datos:

- Compose observa `StateFlow` y dibuja cada módulo.
- `AdminViewModel` controla navegación, filtros, modales, notificaciones y CRUD.
- `EquilibraViewModel` controla catálogo, evaluación y reservas públicas.
- `AppointmentRepository` encapsula DAO y Room.
- `SupabaseAppointmentsDataSource` convierte DTOs remotos en `AppointmentEntity` y expone PostgREST/Realtime.

Al arrancar, el panel intenta traer citas y mensajes desde Supabase, inserta las citas en Room y conecta Realtime. Room conserva las citas para que la agenda pueda renderizarse sin depender de una consulta en cada recomposición.

## Modelo de datos compartido

### `appointments`

Campos funcionales: `id`, `code`, `service_id`, `service_title`, `fecha`, `hora`, `nombre`, `apellido`, `telefono`, `email`, `motivo` o `motivo_consulta` según cliente, `primera_visita`, `status`, `specialist_id`, `specialist_name`, `notes`, `payment_status`, `amount` y `created_at`.

### `contact_messages`

Campos funcionales: identificador, nombre, correo, teléfono, asunto, mensaje, estado, notas administrativas y fecha de creación. La SPA web usa nombres de columnas como `name`, `phone`, `message` y `admin_notes`, mientras algunos mapeos de citas usan `motivo_consulta`. Antes de integrar ambos clientes en un mismo proyecto Supabase, verifica que el esquema y los nombres de columnas coincidan con todos los adaptadores.

## Configuración de Supabase

El SQL incorporado en `aplicacion/src/lib/supabase.ts` es una base de demostración. Su secuencia es:

1. Crear `appointments`.
2. Crear `contact_messages`.
3. Activar RLS.
4. Crear políticas de acceso.
5. Añadir `appointments` a la publicación Realtime.

Las políticas incluidas permiten `FOR ALL` a `public` y, por tanto, no son suficientes para datos clínicos reales. Una configuración de producción debería separar al menos:

- escritura pública limitada para solicitudes de reserva/contacto;
- lectura y modificación de citas para usuarios autenticados autorizados;
- acceso administrativo a mensajes y notas;
- validación de estados, importes y especialistas en servidor.

## Flujos operativos

### Reserva

1. El usuario selecciona un servicio.
2. El cliente calcula o consulta las franjas disponibles.
3. Se validan nombre, apellido, teléfono, correo, fecha y hora.
4. Se genera una cita y un código `EQ-XXXX`.
5. Se persiste localmente y se intenta sincronizar con Supabase.
6. Se muestra un comprobante o modal de éxito.

### Gestión administrativa

El personal puede crear citas, filtrar la agenda, modificar estados, abrir el expediente resumido por paciente, revisar mensajes y exportar información. La web permite exportación CSV y respaldo JSON; la app Android ofrece acciones equivalentes dentro de su panel según el módulo disponible.

## Riesgos y límites conocidos

- Las políticas SQL públicas exponen operaciones que deben restringirse.
- La persistencia offline de web y Android no tiene una cola de sincronización con resolución de conflictos.
- Existen contratos de nombres de columna que deben normalizarse antes de compartir una base de datos entre clientes.
- Hay datos semilla destinados a demo; deben retirarse en una instalación real.
- Parte del contenido y las imágenes se encuentra hardcodeada y requiere una nueva compilación para actualizarse.
- El acceso al panel Android no muestra en la entrada revisada una capa de autenticación propia; debe añadirse antes de desplegarlo con datos reales.

## Checklist de puesta en producción

- [ ] Configurar variables de entorno fuera del control de versiones.
- [ ] Crear el esquema con nombres de columnas unificados.
- [ ] Diseñar y probar políticas RLS con usuarios reales y anónimos.
- [ ] Activar autenticación y autorización administrativa.
- [ ] Desactivar datos semilla.
- [ ] Probar pérdida de red, reintentos, duplicados y conflictos.
- [ ] Cubrir validación de reservas y permisos con pruebas automatizadas.
- [ ] Revisar privacidad, retención y respaldos de datos clínicos.