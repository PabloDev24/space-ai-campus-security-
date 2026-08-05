# Análisis técnico previo — Portal de Casetas SpaceIA

Fecha del análisis: 4 de agosto de 2026.

## Backend real identificado

La aplicación Android `C:\Proyectos-Universidad\mobile-space-ai` no contiene el backend. Su variante `fullDebug`, salvo override local, y `fullRelease` consumen `https://app-spaceia-api-core.azurewebsites.net/`. Los endpoints Retrofit incluyen el prefijo `api/`.

La solución fuente que coincide con esas rutas, contratos y dominio es `C:\Proyectos-Universidad\C_Sharp\NetSpaceAI\SmartSpaces.slnx`. Es una solución .NET 10 con proyectos API, Application, Domain, Infrastructure, Shared y UnitTests. Usa ASP.NET Core, MediatR, FluentValidation, EF Core 10, PostgreSQL/Npgsql, JWT Bearer, BCrypt, Serilog, Swagger y Redis para presencia activa.

## Aplicación móvil y QR

- Arquitectura: Clean Architecture + MVVM, Jetpack Compose, StateFlow, casos de uso, repositorios y Retrofit/OkHttp con Hilt.
- Generación: `GET /api/auth/qr/{userId}` con Bearer JWT.
- Representación: la app dibuja directamente `qrToken` con ZXing; no agrega un prefijo ni un JSON exterior.
- Contenido interno real: JSON con `Sub` (GUID del usuario), `Role` y `Exp`, cifrado con AES. La clave AES-256 se deriva con SHA-256 del secreto JWT; el IV aleatorio de 16 bytes se antepone al ciphertext y el resultado se codifica como Base64 URL-safe sin padding.
- Vigencia: 15 minutos. La app muestra un contador y solicita otro QR al vencer.
- Validación existente: `POST /api/auth/qr/validate` y `POST /api/access/scan` reutilizan `IQrCodeService`.
- Riesgo detectado: el DTO Android exige `generatedAt` y `expiresAt`, mientras el código fuente actual del API responde `qrToken` y `expiresInSeconds`. El mapper móvil oculta el problema usando `Instant.now()` y 15 minutos cuando faltan las fechas. La corrección debe ser aditiva.
- Riesgo criptográfico: AES-CBC proporciona confidencialidad, pero no autenticación explícita. El endpoint de caseta seguirá siendo compatible y tratará cualquier fallo de descifrado como token inválido/alterado; una evolución futura debería versionar el formato y usar AES-GCM sin romper QRs vigentes.

## Identidad visual obtenida del código móvil

- Primario claro `#0092B8`; primario oscuro `#00D3F2`.
- Fondos `#FFFFFF` y `#0A0A0A`; tarjetas oscuras `#171717`; superficies suaves `#F5F5F5`/`#262626`.
- Éxito esmeralda `#D1FAE5`/`#065F46`; error `#E7000B`, con contenedor `#FEE2E2`.
- Bordes `#E5E5E5` y blanco al 10 % en oscuro.
- Tipografía del sistema, pesos medium/semibold/bold, escala Material 3.
- Radios base de 8, 10 y 16 px; la credencial QR usa tarjetas mayores de 24–32 px.
- Existen esquemas claro, oscuro y alto contraste; Material You está desactivado para preservar la marca.

## Backend, autenticación y datos

- `User` concentra estudiantes y administradores mediante la propiedad textual `Role`; existen `student` y `admin`.
- JWT incluye `sub`, `email`, rol, nombre y folio. Los access tokens duran 60 minutos y el login crea una fila `Session` con refresh token y metadatos del cliente.
- BCrypt.Net-Next es el mecanismo real de contraseñas.
- `AccessPoint` ya modela puntos físicos con nombre, ubicación (`Building`), identificador de lector (`DeviceId`) y estado.
- `AccessLog` ya registra usuario, lector, dirección, resultado y timestamp UTC. Es la entidad compatible que se ampliará.
- PostgreSQL usa `timestamp with time zone`; EF aplica migraciones al arrancar. Hay índices únicos en email, folio y `AccessPoint.DeviceId`, pero faltan índices compuestos para consultas de caseta.
- CORS ya admite `http://localhost:4200`; producción se limita a orígenes configurados.
- Hay manejo global de excepciones, FluentValidation, Serilog, Swagger y rate limiting para otros módulos.
- La zona horaria universitaria no estaba configurada; el portal utilizará `America/Mexico_City`, almacenará UTC y calculará los límites locales en el backend.

## Decisiones de implementación

1. Reutilizar `AccessPoint` como caseta, `AccessLog` como registro y `User` como guardia, agregando relaciones nullable para mantener todos los contratos actuales.
2. Crear rutas nuevas bajo `/api/gate-auth`, `/api/gate-access`, `/api/gate-dashboard` y `/api/gates`, protegidas por el rol exacto `Caseta`.
3. Obtener guardia y caseta exclusivamente del JWT y su asignación persistida; el frontend enviará sólo `qrToken` al escanear.
4. Guardar SHA-256 del token, nunca el token completo. Una restricción única por hash, caseta y dirección evitará relecturas del mismo QR, además de la protección temporal del scanner.
5. Añadir paginación y filtros server-side, consultas `AsNoTracking` y agregaciones SQL. El frontend recibirá series listas para Chart.js.
6. Añadir auditoría de eventos de seguridad para escaneos no atribuibles y cambios de contraseña.
7. Crear las cinco cuentas y datos históricos mediante un seeder idempotente ejecutado sólo en Development. Producción no recibirá contraseñas de prueba.
8. Ampliar la respuesta QR existente con `generatedAt` y `expiresAt`, conservando `expiresInSeconds`.
9. Construir un único Angular 22 standalone, estricto y lazy-loaded en el workspace autorizado `C:\Proyectos-Universidad\Angular-Projects\Space-AI-Caseta`. La ruta originalmente solicitada `C:\Proyectos-Universidad\space-ai-caseta-web` no existía y no es el root autorizado de esta sesión.

## Riesgos y mitigaciones

- El OpenAPI desplegado en Azure no pudo verificarse mediante acceso web durante el análisis; la compatibilidad se comprobará contra el código local y se reportará la prueba remota real si la red lo permite.
- Docker está instalado, pero el engine no estaba iniciado. Se intentará una alternativa PostgreSQL local antes de declarar bloqueada la prueba de integración.
- Las sesiones ya se marcaban activas/inactivas, pero JWT no consultaba ese estado. Se reforzará la validación sin cambiar el formato de login.
- No existe fotografía segura en `User`; el portal no mostrará imágenes ni inventará URLs.
