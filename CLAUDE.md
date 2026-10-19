@AGENTS.md

# Procode

App pública para pasar de cero a pro en Claude Code, en forma de juego. Tilde, la gatita con auriculares, hace 7 preguntas (uso, rol, experiencia, horas, modelo, funciones) y arma:
- el consumo estimado de tokens y US$ y el plan sugerido;
- gráficos comparativos;
- recomendaciones por rol;
- una ruta de 48 pasos con XP, niveles, racha y stickers.

Páginas: `/` (preguntas + ruta + logros), `/leccion/<id>` (lección con terminal y prueba), `/examen` (examen final y certificado), `/consumo` (consumo estimado y gráficos), `/chuleta` y `/terminos`. Repo: github.com/nelsonvis3/claude-guide.

## Reglas

- Los textos de la interfaz van en los 9 idiomas (es, en, pt, fr, de, it, ja, zh, ko). `src/messages/es.json` es el original. `npm test` exige las mismas claves en todos los idiomas y que todo lo que lista `src/lib/content.ts` tenga texto.
- **Tilde es una ilustración de Nelson. No redibujarla nunca.** Se usa desde `public/tilde/head.png` y `body.png`, generadas con `scripts/cut.py` y `scripts/split.py`. Solo se anima la cabeza. Para arte nuevo, pedirle el archivo.
- Estilo: limpio y moderno, base lila (`--bg #f6f4fa`), acento violeta y sombras suaves (`shadow-soft`). Nada de bordes gruesos ni sombras duras. Los tokens están en `src/app/globals.css`.
- El juego (XP, nivel, racha, stickers) se calcula a partir de `done` y `days` en `src/lib/game.ts`; no se guarda aparte. El examen aprobado se guarda como `"exam"` en `done`.
- La ruta va en orden: cada lección se desbloquea al pasar la prueba de la anterior (`current`/`unlocked` en `game.ts`). El examen se habilita con los 48 pasos.
- Sin cuenta el progreso vive en `sessionStorage` y se borra al cerrar la pestaña (pedido de Nelson). Con sesión se guarda en Postgres.
- Lecciones: datos neutros en `src/lib/lessons.ts` y textos en `src/lessons/<idioma>.json`, con la opción correcta primera en cada pregunta.
- Precios, estrellas de GitHub y catálogos son al 2026-10-18. Verificarlos contra la doc oficial antes de tocarlos.
- Verificar en el navegador a 1440 px y a 390 y 375 px, en claro y oscuro, sin scroll horizontal.

## Comandos

- `npm run dev` levanta la app; `npm test` corre el estimador, el juego y la paridad de idiomas; `npm run build` compila.
- Variables, todas opcionales: `AUTH_SECRET`, `AUTH_GITHUB_ID`/`AUTH_GITHUB_SECRET`, `AUTH_GOOGLE_ID`/`AUTH_GOOGLE_SECRET`, `DATABASE_URL` (Postgres/Neon) y, para el aviso de racha, `RESEND_API_KEY`, `MAIL_FROM` y `CRON_SECRET` (Vercel Cron diario en `vercel.json`).
  - Sin proveedores no aparece el login.
  - Sin `DATABASE_URL` todo se guarda en el navegador.

## Próximo

Hecho el 2026-10-18: lecciones propias con terminal y prueba, bloqueo en orden, examen final con certificado, `/consumo` aparte, footer y términos, aviso de racha por correo (opt-in).

1. **Traducir las lecciones a ja, zh y ko** (`src/lessons/<idioma>.json`); hoy caen al inglés.
2. **Más contenido en la ruta, de noob a pro:** más pasos y lecciones más detalladas, sobre todo de plugins y skills, explicados para que cualquiera los entienda.
3. **Rutas especializadas de pago** por área (frontend, backend, etc.). Pagos con PayPal y Mercado Pago; falta definir precios.
4. **Menú de usuario con ajustes (con sesión):** colores de la página a gusto, foto de perfil, color del gato, cambiar de mascota y trajes de gato pagos. El arte de colores, mascotas y trajes lo pasa Nelson (no redibujar a Tilde). La contraseña la manejan GitHub y Google.
5. **Curso de inglés A1 → conversacional avanzado**, con pruebas reales y validación por micrófono. Arranca cuando Nelson diga «go english»; no empezar antes.
