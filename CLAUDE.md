# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

# Procode

App pública y **gratis** para pasar de cero a pro en Claude Code, en forma de juego. Tilde, la gatita gorda, hace 7 preguntas (uso, rol, experiencia, horas, modelo, funciones) y arma:
- el consumo estimado de tokens y US$ y el plan sugerido;
- gráficos comparativos;
- recomendaciones por rol;
- una ruta de 48 pasos con XP, niveles, racha y stickers.

Páginas: `/` (preguntas + ruta + logros), `/leccion/<id>` (lección con terminal y prueba), `/guia` y `/guia/<rol>` (guía por stack con prueba de lo básico), `/examen` (examen final y certificado), `/consumo`, `/chuleta`, `/estudiar`, `/prompts` (generador de prompts), `/contacto`, `/ajustes`, `/entrar` y `/terminos`. Repo: github.com/nelsonvis3/claude-guide.

## Reglas

- **Todo es gratis.** No hay rutas, trajes ni funciones pagas: no agregar pagos ni muros de pago.
- Los textos de la interfaz van en los 9 idiomas (es, en, pt, fr, de, it, ja, zh, ko). `src/messages/es.json` es el original; lo que falta en un idioma cae al inglés y después al español (`getMessages` en `src/lib/i18n-server.ts`). `npm test` exige las mismas claves en todos los idiomas y que todo lo que lista `src/lib/content.ts` tenga texto.
- **Tilde es arte de Nelson. No redibujarla ni generar arte nuevo** (tampoco párpados, cola aparte, etc.). Para algo que no exista, pedirle el archivo. Solo se mueven las dos capas: la cabeza se ladea y el cuerpo respira, lento (Nelson pidió movimientos suaves, no rápidos).
- Estilo: limpio y moderno, base lila (`--bg #f6f4fa`), acento violeta y sombras suaves (`shadow-soft`). Nada de bordes gruesos ni sombras duras. Los tokens están en `src/app/globals.css`.
- El juego (XP, nivel, racha, stickers) se calcula a partir de `done` y `days` en `src/lib/game.ts`; no se guarda aparte. El examen aprobado se guarda como `"exam"` en `done` y la prueba de cada guía como `"stack:<rol>"`. Cada 5 pruebas aprobadas (lecciones y guías, `passedTests`) sale el aviso «Apoyar a Tilde», que lleva a dejar una estrella en el repo (`REPO_URL`); nunca un pago.
- Las 48 lecciones están abiertas desde el principio y se hacen en cualquier orden (pedido de Nelson, 2026-10-23). `current` en `game.ts` marca el primer paso sin hacer; el examen se habilita con los 48 aprobados.
- Sin cuenta el progreso vive en `sessionStorage` y se borra al cerrar la pestaña (pedido de Nelson). Con sesión se guarda en Postgres.
- Lecciones: datos neutros en `src/lib/lessons.ts` y textos en `src/lessons/<idioma>.json`, con la opción correcta primera en cada pregunta. Las guías por stack siguen el mismo esquema: `src/lib/guides.ts` (comando de cada paso y respuestas) y `src/guides/<idioma>.json`, para los 12 roles de `ROLES`.
- Precios, estrellas de GitHub y catálogos son al 2026-10-18. Verificarlos contra la doc oficial antes de tocarlos.
- Verificar en el navegador a 1440 px y a 390 y 375 px, en claro y oscuro, sin scroll horizontal.

## Arquitectura

- `src/components/Shell.tsx` es el marco de todas las páginas (server component): lee idioma, preferencias y sesión, y arma header, footer e `I18nProvider`. Las páginas le pasan `children(user)`.
- Idioma y apariencia (tema, acento, color y traje de Tilde) van en cookies para pintar sin parpadeo: `src/lib/prefs.ts`, `getLang`/`getPrefs` en `i18n-server.ts`, server actions en `src/app/actions.ts`. El color y el traje llegan a los componentes por `CatProvider`/`useCatDir` (`src/lib/cat.tsx`), que devuelve `catDir(cat, suit)`. El traje es solo con cuenta: `Shell` pasa `suit="none"` sin sesión y `setPref` rechaza el traje sin sesión. Con sesión, color y traje se guardan también en la tabla `looks` y `getPrefs(userId)` los prefiere a la cookie, así siguen a la cuenta en cualquier dispositivo.
- `/ajustes` se abre sin cuenta (apariencia, color, Restaurar); perfil, trajes, avisos y seguridad piden sesión.
- Textos que usa una sola página (`PAGE_TEXTS` en `Shell.tsx`) viajan al navegador solo si la página los pide con `<Shell texts={[...]}>`. Si un componente nuevo usa uno de esos bloques en otra página, sumalo ahí.
- SEO: `pageMetadata` en `i18n-server.ts` arma título, descripción, canonical y Open Graph de cada página; `src/app/robots.ts`, `sitemap.ts` y `opengraph-image.tsx` (usa `public/tilde/full.png`). El dominio sale de `SITE_URL` o de `VERCEL_PROJECT_PRODUCTION_URL` (`src/lib/site.ts`). Cada idioma tiene su URL con `?lang=xx`: `src/proxy.ts` la pasa a `getLang` como header `x-lang` y a la cookie, y cada página declara las 9 con hreflang (`langAlternates`).
- Login con Auth.js v5 en `src/auth.ts`, sesión JWT sin adapter. Cada proveedor OAuth (GitHub, Google, Discord, GitLab) aparece solo si tiene su `AUTH_<PROV>_ID`; email y contraseña solo con `DATABASE_URL`. El id de usuario es `<proveedor>:<id>`.
- `src/lib/db.ts` crea las tablas solas (`profiles` con el progreso en `data jsonb`, `users` para email y contraseña). `src/app/api/profile` lee y guarda el perfil; `src/app/api/cron/streak` manda el aviso de racha (Vercel Cron en `vercel.json`).
- Datos no traducibles (nodos de la ruta, catálogos, comandos) en `src/lib/content.ts`; estimador de consumo en `src/lib/estimate.ts`.

## Tilde: arte y capas

- Personaje desde el 2026-10-23: la gata gorda sin auriculares (la versión con auriculares quedó descartada). 5 colores (`CATS` en `src/lib/prefs.ts`) y 40 trajes por color (`SUIT_GROUPS`: anime, superhéroes y cine, selecciones), todos gratis y elegibles en Ajustes para quien tiene cuenta.
- El arte fuente está en `art/tilde/` (fuera de git y de `public/`): la gata base de cada color (`Blanco/Gatito blanco kawaii….png` y `<color>/Imagen de ChatGPT….png`, sobre fondo negro) y `estilos-<color>/0*/<n>_<Nombre>_original.png` para los trajes. Lo demás de esa carpeta (con/sin auriculares, zips, vistas previas, extras como Arch o Linux) no se usa.
- `python3 scripts/tilde.py [colores] [--icons]` genera `public/tilde/<color>[/<traje>]/head.webp` y `body.webp` (lienzo 208×242, la base al doble) y, con `--icons`, el logo (`public/tilde/icon.png`, `src/app/icon.png`, `apple-icon.png`) y `public/tilde/full.png`. Tarda ~1 min por color. El corte cabeza/cuerpo es una línea horizontal al 44 % del ancho desde abajo; la punta de la cola que queda arriba va con el cuerpo.
- `src/components/Mascot.tsx` gira la cabeza sobre (100, 160); cada `mood` es un movimiento (`sit`: sentada de frente en el footer, con la panza respirando; `play`: sigue al ratoncito 🐭 del aviso de apoyo) y `Peek` muestra la franja y=25–185. `prefs.test.ts` verifica que existan las capas de cada color y traje.
- Los trajes vienen de recortes chicos (~200 px): en tamaños grandes se ven algo blandos. Varios son personajes y escudos con marca registrada (anime, Marvel/DC, selecciones): decisión de Nelson antes del deploy.

## Comandos

- `npm run dev` levanta la app; `npm run build` compila; `npm run lint` corre ESLint.
- `npm test` corre todos los tests (`node --test` sobre `src/lib/*.test.ts`, sin framework). Uno solo: `node --test --no-warnings src/lib/game.test.ts`.
- Variables, todas opcionales (ver `.env.example`): `AUTH_SECRET`, `AUTH_<GITHUB|GOOGLE|DISCORD|GITLAB>_ID`/`_SECRET`, `DATABASE_URL` (Postgres/Neon), y para correos `RESEND_API_KEY`, `MAIL_FROM`, `CRON_SECRET` y `SITE_URL` (racha) y `CONTACT_TO` (contacto).
  - Sin proveedores ni base no aparece el login; sin `DATABASE_URL` todo se guarda en el navegador.
  - Con `next start` en local hace falta `AUTH_TRUST_HOST=true`.

## Próximo

Hecho hasta el 2026-10-19: lecciones con terminal y prueba, bloqueo en orden, examen final con certificado, `/consumo`, footer y términos, aviso de racha, ajustes (tema, acento, color de Tilde, foto de perfil), login con email y contraseña, `/estudiar`, `/prompts` y `/contacto`.
Hecho el 2026-10-23: la gata gorda como personaje y logo nuevo, 40 trajes gratis por color en Ajustes, animación más lenta con respiración, fuera la sección «Mascotas y trajes — Próximamente».

Hecho el 2026-10-23 (tarde): guías por stack para los 12 roles con prueba de lo básico (en los 9 idiomas), aviso de apoyo cada 5 pruebas, «Restaurar» (volver a las preguntas) movido del home a Ajustes, Tilde sentada en el footer, SEO (metadata por página, sitemap, robots, imagen para redes).

Con esto se cierra el proyecto:

1. **Traducir las lecciones a ja, zh y ko** (`src/lessons/<idioma>.json`); hoy caen al inglés. Las guías ya están en los 9 idiomas.
2. **Trajes con marca registrada** (anime, Marvel/DC, selecciones): decisión de Nelson.

Producción: proyecto `claude-guide` en Vercel, https://procode-guide.vercel.app, se publica con cada push a `main`. Ya tiene Neon, `AUTH_SECRET`, GitHub y Google, Resend, `MAIL_FROM`, `CONTACT_TO` y `CRON_SECRET`.

Para otra ocasión: el curso de inglés (A1 → conversacional). No empezar hasta que Nelson lo pida.
