# Procode

Juego gratis para pasar de cero a pro en Claude Code. Tilde, la gatita, hace siete preguntas (uso, rol, experiencia, horas, modelo, funciones) y arma:

- una ruta de 48 pasos en cuatro tramos, todos abiertos para hacer en cualquier orden. Cada paso es una lección propia (`/leccion/<id>`) con Tilde explicando, una terminal simulada para practicar y una prueba de 3 preguntas; aprobarla marca el paso;
- un examen final de 20 preguntas al azar (`/examen`) con certificado «Claude Code Pro»;
- XP por paso, 5 niveles, racha de días y 12 stickers; Tilde celebra cada logro. Con cuenta, aviso opcional por correo si pasan 2 días sin entrar;
- en `/consumo`, una estimación de tokens y US$ por día, semana y mes con el plan sugerido (Pro, Max 5x, Max 20x) y gráficos: el mismo uso con cada modelo, combinaciones de modelos (Sonnet + subagentes Haiku + asesor Opus) y tokens contra costo;
- recomendaciones por rol (frontend, diseño, video, datos, PM y más) con el comando para instalar cada skill, plugin o repo;
- una chuleta (`/chuleta`): 65 comandos, las 21 skills incluidas, las 19 de anthropics/skills, repos famosos de la comunidad (incluidos los que ahorran tokens), plugins por área, atajos, modos de permiso, mods y plugins del marketplace oficial.

En 9 idiomas: es, en, pt, fr, de, it, ja, zh, ko. Sin cuenta el progreso vive en la pestaña y se borra al cerrarla; con cuenta (email y contraseña, GitHub, Google, Discord o GitLab) se guarda en la cuenta y se sincroniza entre dispositivos.

Proyecto independiente, no afiliado a Anthropic. Datos verificados en code.claude.com/docs y platform.claude.com/docs/en/about-claude/pricing el 2026-10-18.

## Stack

Next.js 16, React 19, Tailwind 4, Auth.js v5 (email y contraseña, GitHub, Google, Discord y GitLab; sesión JWT), Postgres con `postgres` y `motion` para las animaciones.

## Correr en local

```bash
npm install
cp .env.example .env.local   # opcional: login y base de datos
npm run dev
```

Cada proveedor OAuth aparece solo si tiene su `AUTH_<GITHUB|GOOGLE|DISCORD|GITLAB>_ID`, y email y contraseña solo con `DATABASE_URL`; sin ninguno no aparece el botón de entrar. Sin `DATABASE_URL` el progreso queda solo en la pestaña. Sin `RESEND_API_KEY`, `MAIL_FROM` y `CRON_SECRET` no se mandan avisos de racha (`/api/cron/streak` responde 503). Sin `CONTACT_TO` (además de `RESEND_API_KEY` y `MAIL_FROM`) el formulario de `/contacto` avisa que no está disponible. Con `next start` en local hace falta `AUTH_TRUST_HOST=true`; en Vercel no.

## Tests

```bash
npm test   # estimador, juego (XP, niveles, racha, stickers, paso en curso), lecciones y paridad de idiomas
```

## Dónde está cada cosa

- `src/lib/estimate.ts`: precios por modelo y el modelo de consumo. Las constantes marcadas como estimación propia están comentadas.
- `src/lib/content.ts`: nodos de la ruta, comandos y atajos (datos no traducibles).
- `src/lib/lessons.ts`: lo que acepta la terminal de cada lección y las respuestas correctas. Los textos de las lecciones están en `src/lessons/<idioma>.json`, con la opción correcta primera.
- `src/messages/<idioma>.json`: todos los textos. `es.json` es el original; el test exige las mismas claves en todos.
- `src/components/Mascot.tsx`: Tilde. El arte es de Nelson y no se redibuja: 5 colores y 40 trajes por color, que se eligen gratis en Ajustes. Las capas (`public/tilde/<color>[/<traje>]/head.webp` y `body.webp`) y el logo salen del arte fuente en `art/tilde/` (fuera de git) con `python3 scripts/tilde.py [colores] [--icons]`.

## Deploy en Vercel

1. Importar el repo en Vercel.
2. Opcional, para el login: crear la base en Neon (Vercel → Storage), que ya habilita email y contraseña, y las apps OAuth que se quieran (GitHub, Google, Discord, GitLab) con el dominio de producción en el callback. Cargar las variables de `.env.example`.
3. Opcional, para correos: cuenta en Resend con el dominio del remitente verificado, y `RESEND_API_KEY` y `MAIL_FROM` en Vercel. Para el aviso de racha, además `CRON_SECRET` (el cron diario ya está en `vercel.json`); para el contacto, `CONTACT_TO`.
