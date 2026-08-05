# SpaceIA Caseta Web

Portal operativo para el control de accesos de SpaceIA. Es una SPA Angular para guardias: autentica contra SmartSpaces, lee el QR emitido por la aplicación móvil, consulta los datos reales del estudiante y registra la decisión de acceso.

> La interfaz no contiene arreglos mock. Tarjetas, tabla, gráfica, perfil y resultados del escaneo se alimentan de la API. Los únicos datos iniciales son las semillas reproducibles del backend.

## Funcionalidades

- Inicio de sesión exclusivo para el rol `Caseta`, con JWT, expiración y cierre automático ante `401`.
- Inicio con estado del servicio, resumen del día y accesos recientes.
- Lector QR con cámara trasera preferida, selección de dispositivo, pausa al cambiar de pestaña, vibración y captura manual de respaldo.
- Modal responsivo después de cada lectura: muestra nombre, matrícula, grupo, caseta y hora del alumno recuperado de la base de datos.
- Acciones `Autorizar` y `Rechazar`; la API persiste `AUTHORIZED` o `ACCESS_DENIED_BY_GUARD` y el modal comunica el resultado.
- Bitácora diaria con búsqueda, horario, grupo, orden y paginación reales del servidor.
- Dashboard general de accesos del campus para hoy, 7 o 30 días, con una sola gráfica conmutable entre día y hora.
- Perfil del guardia, caseta asignada, tema claro/oscuro y cambio seguro de contraseña.
- Navegación adaptativa: sidebar en laptop, riel en tableta y barra inferior en móvil.

## Flujo QR

1. La app móvil solicita `GET /api/auth/qr/{userId}` y muestra el token vigente.
2. El lector captura el token sin descifrarlo en el navegador.
3. Angular llama `POST /api/gate-access/preview`; el backend valida token, expiración, alumno activo y caseta.
4. El guardia confirma en el modal con `POST /api/gate-access/decision`.
5. La respuesta se muestra y el registro queda disponible en bitácora y estadísticas.

## Stack y estructura

- Angular 22 standalone, TypeScript estricto y SCSS.
- `@zxing/browser` para QR, Chart.js/ng2-charts para la gráfica y Lucide para iconos.
- Vitest y Angular TestBed para pruebas.

```text
src/app/
├── core/       modelos, sesión, API, interceptor y guards
├── features/   landing, login, inicio, escáner, bitácora, dashboard y perfil
├── layout/     shell responsive autenticado
└── shared/     iconografía, avisos y diálogos
```

## Requisitos y ejecución

- Node.js 22+ y npm 10+.
- API SmartSpaces y PostgreSQL migrado.

```powershell
npm ci
npm start
```

La aplicación se abre en `http://localhost:4200`. Para levantar la API:

```powershell
dotnet run --project SmartSpaces.API/SmartSpaces.API.csproj
```

## Usuarios de ejemplo (solo Development)

`DevelopmentGateSeeder` crea cinco casetas y cinco cuentas de guardia de forma idempotente. Todas tienen la contraseña temporal `Caseta#2026!` y deben cambiarla desde Perfil. El seeder no se ejecuta en producción.

| Usuario | Correo | Folio | Caseta |
|---|---|---|---|
| Guardia Principal | `caseta1@spaceai.local` | `CASETA-001` | Caseta Principal |
| Guardia Norte | `caseta2@spaceai.local` | `CASETA-002` | Caseta Norte |
| Guardia Sur | `caseta3@spaceai.local` | `CASETA-003` | Caseta Sur |
| Guardia Estacionamiento | `caseta4@spaceai.local` | `CASETA-004` | Caseta Estacionamiento |
| Guardia Administrativo | `caseta5@spaceai.local` | `CASETA-005` | Caseta Administrativa |

El mismo backend contiene estudiantes semilla para emitir QRs: `alumno@utl.edu.mx`, `juan.rea@utl.edu.mx`, `maria.gomez@utl.edu.mx` y `carlos.lopez@utl.edu.mx`. Su contraseña semilla es `SpaceIA2026!`. `lucia.torres@utl.edu.mx` está inactiva para validar el rechazo de acceso. Estas credenciales son únicamente para desarrollo.

## Configuración de API

| Archivo | Entorno | URL |
|---|---|---|
| `src/environments/environment.ts` | Desarrollo | `http://localhost:5043/api` |
| `src/environments/environment.production.ts` | Producción | `https://app-spaceia-api-core.azurewebsites.net/api` |

No guardar secretos, tokens ni credenciales reales en archivos de entorno.

## Contrato consumido

| Método | Ruta | Uso |
|---|---|---|
| `POST` | `/api/gate-auth/login` | Inicio de sesión de guardia |
| `GET` | `/api/gate-auth/me` | Perfil y caseta actuales |
| `POST` | `/api/gate-auth/change-password` | Cambio de contraseña |
| `GET` | `/api/gates/my-gate` | Caseta asignada |
| `POST` | `/api/gate-access/preview` | Validar QR sin registrar |
| `POST` | `/api/gate-access/decision` | Autorizar o rechazar |
| `POST` | `/api/gate-access/scan` | Compatibilidad con flujo legado |
| `GET` | `/api/gate-access/recent` | Accesos recientes |
| `GET` | `/api/gate-access/today` | Bitácora paginada |
| `GET` | `/api/gate-access/summary` | Resumen del día |
| `GET` | `/api/gate-dashboard/overview` | Agregados generales |

Todos salvo login requieren `Authorization: Bearer <JWT>`. La API obtiene guardia y caseta desde el JWT y la asignación persistida.

## Cámara, seguridad y producción

`getUserMedia` requiere HTTPS o `localhost`. En una tableta/teléfono, servir el frontend por HTTPS y usar una API alcanzable desde el dispositivo. Configurar `AllowedOrigins`, migraciones PostgreSQL, secretos JWT y conexión en el almacén de secretos de la plataforma. Publicar `dist/space-ai-caseta-web/browser` con fallback SPA a `index.html`.

## Verificación

```powershell
npm run lint
npm test -- --watch=false
npm run build
```

Documentación adicional: [docs/ANALISIS_TECNICO.md](docs/ANALISIS_TECNICO.md), [docs/REPORTE_FINAL.md](docs/REPORTE_FINAL.md) y [docs/REPORTE_REDISENO.md](docs/REPORTE_REDISENO.md).
