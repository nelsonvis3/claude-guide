# Ruta Claude Code

App para pasar de cero a pro en Claude Code. Tilde, la gatita con auriculares, hace siete preguntas (uso, rol, experiencia, horas, modelo, funciones) y arma:

- una estimación de tokens y US$ por día, semana y mes, con el plan sugerido (Pro, Max 5x, Max 20x);
- gráficos: el mismo uso con cada modelo, combinaciones de modelos (Sonnet + subagentes Haiku + asesor Opus) y tokens contra costo;
- una ruta de 48 pasos en cuatro tramos, con prompts copiables y links a la doc oficial;
- recomendaciones por rol (frontend, diseño, video, datos, PM y más) con el comando para instalar cada skill, plugin o repo;
- una chuleta (`/chuleta`): 65 comandos, las 21 skills incluidas, las 19 de anthropics/skills, repos famosos de la comunidad (incluidos los que ahorran tokens), plugins por área, atajos, modos de permiso, mods y plugins del marketplace oficial.

En 9 idiomas: es, en, pt, fr, de, it, ja, zh, ko. Sin cuenta: las respuestas y el progreso se guardan en el navegador (localStorage).

Proyecto independiente, no afiliado a Anthropic. Datos verificados en code.claude.com/docs y platform.claude.com/docs/en/about-claude/pricing el 2026-10-18.

## Stack

Next.js 16, React 19, Tailwind 4 y `motion` para la mascota. Sin backend, sin base de datos y sin variables de entorno.

## Correr en local

```bash
npm install
npm run dev
```

## Tests

```bash
npm test   # estimador + paridad de claves entre idiomas
```

## Dónde está cada cosa

- `src/lib/estimate.ts`: precios por modelo y el modelo de consumo. Las constantes marcadas como estimación propia están comentadas.
- `src/lib/content.ts`: nodos de la ruta, comandos y atajos (datos no traducibles).
- `src/messages/<idioma>.json`: todos los textos. `es.json` es el original; el test exige las mismas claves en todos.
- `src/components/Mascot.tsx`: Tilde. La ilustración es de Nelson; `public/tilde/head.png` y `body.png` salen de la imagen original con `python3 scripts/cut.py original.jpg cat.png && python3 scripts/split.py cat.png public/tilde`.

## Deploy en Vercel

Importar el repo en Vercel y deployar. No hace falta configurar nada más.

# claude-guide
