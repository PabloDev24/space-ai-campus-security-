# Reporte de rediseño corporativo

Fecha de cierre: 4 de agosto de 2026.

## Resultado

El portal de casetas fue rediseñado de extremo a extremo con la identidad visual vigente de SpaceIA, sin sustituir los flujos de autenticación, escaneo QR, bitácora, perfil ni los contratos existentes. La analítica se corrigió además para representar el total general de accesos del campus, no una segmentación por caseta.

## Referencias corporativas auditadas

La fuente primaria fue `SpaceAI-landing/spaceai-landing-web-frontend`: contiene `DESIGN.md`, los tokens OKLCH actuales, el icono oficial, layouts administrativos/clientes y la familia Lucide. Como referencia secundaria se revisó `Space-AI`, útil para patrones operativos anteriores de tablas, perfil y control de acceso.

El diagnóstico anterior al cambio, junto con la comparación visual, está en [ANALISIS_REDISENO_CORPORATIVO.md](ANALISIS_REDISENO_CORPORATIVO.md).

## Sistema visual aplicado

- Tokens globales `--space-*` para primario, secundarios, fondos, superficies, texto, estados, bordes, radios y elevación; se conservaron aliases internos para evitar regresiones.
- Primario corporativo basado en `oklch(0.609 0.126 221.723)` y equivalentes `#0891B2`, `#06B6D4` y `#0E7490`.
- Estados semánticos: éxito `#10B981`, advertencia `#F59E0B` y error `#EF4444`/token OKLCH equivalente.
- Stack tipográfico nativo de SpaceIA; jerarquía editorial más clara y menor densidad de tarjetas.
- Iconografía unificada con `@ng-icons/core` y `@ng-icons/lucide`. El wrapper `app-icon` conserva la API anterior de los templates.
- Icono oficial reutilizado en `public/images/spaceai-icon.png` y fotografía de campus en `public/images/campus-bg.jpg`.
- Se retiró un PNG de logotipo de 529 kB que no era consumido, para que no llegue al artefacto publicado.

## Cambios por vista

### Portada y acceso

- Hero editorial corporativo, simulación de escáner y beneficios compactos.
- Login split con fotografía institucional, marca oficial, etiquetas externas y formulario sobrio.
- Versiones móviles de una columna, controles de 44 px y texto que fluye sin recortes.

### Navegación

- Sidebar de 232 px en escritorio, rail de 76 px en tablet y barra inferior en móvil.
- Topbar de 64 px con contexto de trabajo, reloj y tema.
- Cierre de sesión disponible también en tablet y móvil; diálogo responsive con confirmación explícita.

### Inicio

- Estado del servicio, contexto de guardia/caseta, alerta de contraseña temporal y CTA prioritario para escaneo.
- Resumen diario, actividad reciente y accesos rápidos con menor ruido visual.

### Escáner

- Consola visual de validación con estados autorizado, duplicado y denegado.
- Selección/cambio de cámara, sonido opcional, vibración existente e ingreso manual de respaldo.
- Estado de permiso denegado probado sin conceder acceso a la cámara durante QA.

### Bitácora

- Toolbar y filtros compactos; panel colapsable en móvil.
- Tabla de escritorio y tarjetas móviles con estados, zona horaria y paginación accesible.

### Análisis general

- KPIs compactos y una tendencia principal dominante.
- Gráficas del total por periodo, hora, día de semana y grupo.
- Se retiró la gráfica por caseta. El endpoint sigue validando que el usuario sea un guardia activo y asignado, pero agrega todos los accesos autorizados del campus.
- El campo `byGate` se conserva en la respuesta por compatibilidad, aunque la UI no lo utiliza.

### Perfil

- Identidad y datos sincronizados en una superficie de lectura clara.
- Seguridad como bloque principal, reglas de contraseña visibles y feedback semántico.

## Responsive y estados verificados

Se recorrieron portada, login, inicio, escáner, accesos, dashboard y perfil en estos anchos exactos:

`320`, `375`, `390`, `430`, `768`, `820`, `1024`, `1280` y `1440` px.

Resultado: 63 combinaciones sin scroll horizontal. También se verificaron:

- Sidebar, rail y barra inferior en sus breakpoints.
- Controles táctiles; los inputs internos de Material miden 24 px, pero su contenedor interactivo completo conserva 56 px.
- Estado vacío del dashboard mediante un grupo inexistente y recuperación posterior de los datos.
- Estado sin permiso de cámara, diálogo de cierre, filtros, KPIs, gráficas y datos reales.
- Safe areas, textos largos presentes, tablas/tarjetas y alturas controladas de canvas.

Hallazgos corregidos durante QA: cierre de sesión inaccesible fuera de escritorio, superposición del botón/indicador en el CTA de inicio y desbordamiento decorativo de 7 px en la portada a 320 px.

## Capturas

- [Portada corporativa, 1440 px](capturas/portada-corporativa-1440.png)
- [Login corporativo, 1440 px](capturas/login-corporativo-1440.png)
- [Login móvil, 390 px](capturas/login-movil-390.png)
- [Inicio operativo, 1440 px](capturas/inicio-corporativo-1440.png)
- [Dashboard general, 1440 px](capturas/dashboard-general-1440.png)
- [Dashboard general móvil, 390 px](capturas/dashboard-general-movil-390.png)
- [Escáner móvil sin permiso, 390 px](capturas/escaner-movil-390.png)

## Archivos y dependencias

Los cambios principales están en `src/styles.scss`, `src/app/shared/ui`, `src/app/layout/shell` y las siete carpetas de `src/app/features`. Se añadieron `@ng-icons/core` y `@ng-icons/lucide`; no se agregó ningún framework visual redundante.

En el backend se ajustaron:

- `SmartSpaces.Application/Features/Gate/Dashboard/GetGateDashboard.cs`
- `SmartSpaces.UnitTests/GatePortalTests.cs`

## Validación técnica

- `npm run lint`: correcto, sin errores.
- `npm test -- --watch=false`: 5/5 pruebas frontend correctas.
- `npm run build`: correcto; bundle inicial 437.35 kB raw y 109.64 kB estimados transferidos.
- `dotnet test SmartSpaces.UnitTests/SmartSpaces.UnitTests.csproj --no-restore`: 22/22 pruebas backend correctas.
- Swagger local: HTTP 200 en `http://localhost:5043/swagger/index.html`.

La compilación conserva dos advertencias no bloqueantes de presupuesto por estilos de componente: `home.scss` (7.62 kB frente a 7 kB) y `qr-scanner.scss` (9.07 kB frente a 7 kB). Ninguno supera el límite de error de 10 kB y no hay pendientes funcionales conocidos.
