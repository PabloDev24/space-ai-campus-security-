# Reporte de entrega — Portal SpaceIA Caseta

Fecha de validación: 4 de agosto de 2026, zona `America/Mexico_City`.

## Resultado

Se implementó un portal Angular completo conectado al backend .NET y compatible con el QR real de la app Kotlin. No se añadieron mocks al frontend. El backend conserva sus rutas móviles, suma un módulo aislado de casetas y aplica una migración aditiva sobre PostgreSQL.

## Entregables

- Portal Angular responsive con landing, login, inicio, escáner, bitácora, dashboard y perfil.
- Autorización por rol `Caseta` y asignación obligatoria de caseta.
- Validación QR exacta, registro de guardia/caseta/resultado y hash SHA-256 del token en lugar del token original.
- Prevención persistente de reutilización del mismo QR en la misma caseta y dirección.
- Agregados y paginación ejecutados en base de datos.
- Auditoría para intentos inválidos y cambios de contraseña.
- Cinco casetas, cinco guardias y historial de desarrollo idempotentes, solo en entorno `Development`.
- Migración EF Core `20260805021902_AddGatePortal`.
- Pruebas automatizadas de backend y frontend.

## Matriz de integración verificada

| Caso | Resultado |
|---|---|
| Login de `caseta1@spaceai.local` | `200`, rol `Caseta`, Caseta Principal |
| Contraseña incorrecta | `401` |
| Alumno intenta login de caseta | `401` |
| Endpoint protegido sin JWT | `401` |
| QR emitido por `/api/auth/qr/{userId}` | Token AES URL-safe, vigencia de 15 minutos |
| Primer escaneo del QR | `AUTHORIZED`, acceso persistido |
| Segundo escaneo del mismo token | `ACCESS_DUPLICATE` |
| Contenido no SpaceIA | `QR_INVALID` |
| Bitácora y resumen | Datos reales del día devueltos por PostgreSQL |
| Dashboard | Agregados reales por hora, fecha, grupo y caseta |
| Cambio de contraseña | `204`; el JWT anterior pasa a `401` |
| Escaneo móvil heredado `/api/access/scan` | Sigue concediendo y registrando acceso |

Los casos de QR expirado, token alterado, cuenta inactiva, paginación, dashboard y revocación también están cubiertos por pruebas automatizadas con reloj controlado o base SQLite en memoria.

## Verificaciones ejecutadas

### Backend

```text
dotnet test SmartSpaces.slnx --no-restore
22 superadas, 0 fallidas, 0 omitidas
```

Se aplicó el historial completo de migraciones contra la base PostgreSQL aislada `smartspaces_gate_e2e`. Durante esa prueba se corrigió la serialización PostgreSQL de `DayOfWeek` en una migración preexistente; no se eliminó ni reordenó historial.

### Frontend

```text
npm run lint
npm test -- --watch=false
npm run build
```

La inspección visual se realiza con la API real en `localhost:5043` y Angular en `localhost:4200`, incluyendo escritorio y viewport móvil. La prueba automatizada de cámara física depende del permiso y hardware del dispositivo final; el manejo de permiso denegado, falta de HTTPS, cambio de cámara y pausa de pestaña está implementado.

## Seguridad aplicada

- Contraseñas con BCrypt; la API nunca devuelve el hash.
- Regla nueva: mínimo 10 caracteres, mayúscula, minúscula, número y símbolo.
- Revocación de todas las sesiones activas al cambiar contraseña.
- JWT validado además contra la sesión persistida en cada petición.
- Rate limit de 60 escaneos por minuto por guardia o IP.
- Token QR almacenado únicamente como SHA-256 para detectar duplicados.
- La API deriva guardia y caseta de la identidad autenticada.
- Límites temporales del día calculados en `America/Mexico_City` y consultados como UTC.
- Semillas de guardias e historial deshabilitadas fuera de `Development`.

## Operación de la migración

Antes de aplicar en un ambiente compartido:

```powershell
pg_dump --format=custom --file=smartspaces-pre-gate.backup <nombre_base>
dotnet ef database update --project SmartSpaces.Infrastructure --startup-project SmartSpaces.API
```

Restauración de emergencia en una base limpia:

```powershell
createdb <nombre_base_restaurada>
pg_restore --clean --if-exists --dbname=<nombre_base_restaurada> smartspaces-pre-gate.backup
```

La migración agrega columnas, relaciones, índices y la tabla de auditoría. El método `Down` revierte esas adiciones, aunque en producción se recomienda restaurar el backup si ya hubo tráfico.

## Observaciones no bloqueantes

- `npm audit` informa seis avisos moderados en herramientas de desarrollo transitivas de Angular CLI/MCP; no hay avisos altos o críticos y no se aplicó el downgrade disruptivo que propone `--force`.
- La lectura de cámara debe validarse una vez en la tableta física y bajo el dominio HTTPS definitivo.
- Los logs de desarrollo de acceso sirven para comprobar dashboards; nunca se generan en producción.
