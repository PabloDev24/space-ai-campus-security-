# Análisis previo al rediseño corporativo

Fecha: 4 de agosto de 2026.

## Proyectos revisados

La fuente visual principal es:

`C:\Proyectos-Universidad\Angular-Projects\SpaceAI-landing\spaceai-landing-web-frontend`

Es la aplicación corporativa más reciente porque contiene `DESIGN.md`, tokens activos, logotipos oficiales, portal de clientes, portal administrativo y la navegación pública de SpaceIA. Como referencia secundaria de superficies operativas se revisó:

`C:\Proyectos-Universidad\Angular-Projects\Space-AI`

Este segundo proyecto confirma patrones para control de acceso, tablas, perfil, sidebar y formularios, aunque conserva una generación anterior basada en Material Icons y Tailwind 3.

## Identidad encontrada

### Color

La implementación vigente usa OKLCH con el tono corporativo anclado en `221.7`:

| Rol | Token corporativo | Valor vigente |
|---|---|---|
| Fondo | `--background` | `oklch(0.985 0.003 221.7)` |
| Superficie | `--card` | `oklch(0.998 0.001 221.7)` |
| Primario | `--primary` | `oklch(0.609 0.126 221.723)` |
| Secundario | `--secondary` | `oklch(0.96 0.005 221.7)` |
| Muted | `--muted` | `oklch(0.96 0.005 221.7)` |
| Hover/activo | `--accent` | `oklch(0.93 0.014 221.7)` |
| Borde/input | `--border` | `oklch(0.912 0.006 221.7)` |
| Sidebar | `--sidebar` | `oklch(0.975 0.004 221.7)` |
| Error | `--destructive` | `oklch(0.577 0.215 25)` |

La familia anterior expresa el mismo primario como `#0891B2`, con variantes `#06B6D4` y `#0E7490`; semánticos: éxito `#10B981`, advertencia `#F59E0B` y error `#EF4444`. La regla corporativa es un solo acento para la interfaz y colores adicionales únicamente con significado semántico o en gráficas.

El modo oscuro ya tiene tokens coherentes en `styles.css`, aunque el sitio corporativo todavía no expone un control. Casetas conservará su selector existente, pero adoptará esos tokens oficiales.

### Tipografía e iconografía

- Tipografía actual: stack nativo `-apple-system`, Segoe UI, Roboto, Helvetica Neue, Arial.
- Iconos actuales: Lucide mediante `@ng-icons/core` y `@ng-icons/lucide`.
- Logotipo: `spaceai-logo.png`, variante oscura e icono `spaceai-icon.png`.
- La aplicación administrativa anterior usa Material Icons, pero no es la familia vigente; casetas migrará a Lucide para evitar mezclar estilos.

### Componentes y lenguaje visual

- Radio base de 10 px y jerarquía corta de radios.
- Fondos cool-slate casi neutros y tarjetas near-white para separación por capas.
- Sidebar inset/compacto, estados activos teñidos y encabezado de 64 px.
- Botones primarios sólidos; secundarios outline o ghost.
- Bordes finos, sombras contenidas y foco del color primario.
- Tablas dentro de una superficie con toolbar, filtros y paginación.
- Chips compactos para estados.
- Dashboards con KPIs y una pieza visual dominante, sin convertir todas las secciones en tarjetas idénticas.
- Movimiento mínimo: entrada corta, dropdown/dialog y animación deliberada de la visualización principal.

## Comparación con el portal de casetas anterior

| Área | Situación anterior | Corrección definida |
|---|---|---|
| Marca | Escudo SVG genérico y texto recreado | Icono oficial SpaceIA y lockup consistente |
| Iconos | Set SVG relleno creado dentro del portal | Una sola familia Lucide de trazo |
| Tokens | `#0092B8`, radios hasta 34 px y sombras amplias | Tokens OKLCH vigentes, radio 10–16 px y elevación contenida |
| Landing | Titular y mockup de gran escala | Hero editorial corporativo y visual operativo compacto |
| Login | Gradiente decorativo, tarjeta flotante redondeada | Split layout corporativo, campus/branding y formulario sobrio |
| Shell | Sidebar de 260 px y rail de 88 px | Sidebar inset de 232 px, rail de 76 px y topbar de 64 px |
| Inicio | CTA dominante y tarjetas visualmente aisladas | Resumen operativo compacto con jerarquía y panel de actividad |
| Escáner | Correcto funcionalmente, pero aislado del sistema | Consola de validación corporativa con controles y estados semánticos |
| Accesos móvil | Filtros completos siempre visibles | Panel colapsable y tarjetas de acceso compactas |
| Dashboard | Todas las gráficas con peso similar | Tendencia dominante, KPIs compactos y grid editorial |
| Perfil | Bloque de marca muy dominante | Perfil/sidebar informativo y seguridad como superficie principal |

## Hallazgos responsive medidos antes del cambio

La aplicación no tenía scroll horizontal de documento en las rutas principales, pero se detectaron:

- Acciones y botones de icono de 38–40 px en 320, 768 y 1024 px; el mínimo táctil será 44 px.
- Filtros de accesos demasiado largos en móvil, desplazando el contenido prioritario.
- Botones de periodo del dashboard de 38 px de alto.
- Sidebar completo a partir de 1024 px con demasiado consumo horizontal para tablet landscape.
- Exceso de radio y padding en móvil, especialmente en login, CTA de escaneo y perfil.
- El set de iconos rellenos no coincide con el trazo fino corporativo.

## Estrategia

1. Sustituir tokens globales por una capa `--space-*` basada en el CSS corporativo y mantener aliases internos durante la transición.
2. Reutilizar el icono oficial y migrar `app-icon` a Lucide sin alterar los templates consumidores.
3. Crear primitives globales reutilizables: botones, superficies, chips, encabezados, campos, skeletons y estados.
4. Rediseñar shell, landing y login primero para fijar marca y navegación.
5. Adaptar inicio, escáner, bitácora, dashboard y perfil conservando TypeScript, modelos, servicios y contratos.
6. Aplicar breakpoints móviles, tablet rail y escritorio, con objetivos táctiles de 44 px y safe areas.
7. Validar rutas y anchos 320, 375, 390, 430, 768, 820, 1024, 1280 y 1440 px con la API real.
