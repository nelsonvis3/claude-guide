// Guías por stack: el comando de cada paso (igual en todos los idiomas) y la posición de la respuesta correcta
// en cada pregunta de la prueba. Los textos van en src/guides/<idioma>.json, con la opción correcta primera.
import type { Role } from "./content";

export type GuideData = { code: (string | null)[]; answers: number[] };

export const GUIDE_PASS = 5; // de 6 preguntas
// En `done` la prueba aprobada se guarda como "stack:<rol>".
export const stackId = (role: Role) => `stack:${role}`;

const OFFICIAL = (p: string) => `/plugin install ${p}@claude-plugins-official`;
const ASKILLS = "/plugin marketplace add anthropics/skills\n/plugin install example-skills@anthropic-agent-skills";
const DOCS = "/plugin marketplace add anthropics/skills\n/plugin install document-skills@anthropic-agent-skills";
const KW = (p: string) => `/plugin marketplace add anthropics/knowledge-work-plugins\n/plugin install ${p}@knowledge-work-plugins`;

export const GUIDES: Record<Role, GuideData> = {
  frontend: {
    code: ["/init", OFFICIAL("typescript-lsp"), OFFICIAL("context7"), "Ctrl+V", "claude --chrome\n/verify"],
    answers: [1, 0, 2, 1, 0, 2],
  },
  backend: {
    code: ["/init", "/plan add rate limiting to the login endpoint", "write a failing test for the bug, then fix it", "/security-review", OFFICIAL("sentry")],
    answers: [2, 1, 0, 1, 2, 0],
  },
  fullstack: {
    code: ["/plan add Google login", "/run\n/verify", OFFICIAL("commit-commands") + "\n/install-github-app", "claude --worktree feature-auth", "/diff\n/code-review high"],
    answers: [0, 2, 1, 2, 0, 1],
  },
  mobile: {
    code: ["/init", OFFICIAL("swift-lsp") + "\n" + OFFICIAL("kotlin-lsp"), OFFICIAL("expo"), "Ctrl+V", OFFICIAL("firebase")],
    answers: [1, 2, 0, 0, 1, 2],
  },
  devops: {
    code: ["/hooks", "/loop 10m check the deploy and tell me if it fails\n/schedule every weekday at 9 review open PRs", 'claude -p "summarize today\'s errors" --output-format json', OFFICIAL("datadog") + "\n" + OFFICIAL("cloudflare"), "/sandbox\n/permissions"],
    answers: [2, 0, 1, 1, 2, 0],
  },
  data: {
    code: [OFFICIAL("duckdb-skills"), DOCS, "/dataviz", "/deep-research which churn metrics do SaaS companies report?", null],
    answers: [0, 1, 2, 2, 0, 1],
  },
  designer: {
    code: [OFFICIAL("figma"), "/design", ASKILLS, OFFICIAL("canva"), "claude --chrome"],
    answers: [1, 0, 2, 0, 2, 1],
  },
  video: {
    code: ["npx skills add remotion-dev/skills", OFFICIAL("hyperframes"), ASKILLS, "! ffmpeg -i in.mp4 -vf scale=1280:-2 out.mp4", null],
    answers: [2, 1, 0, 1, 0, 2],
  },
  marketing: {
    code: [KW("brand-voice"), "/deep-research how do B2B buyers compare project management tools?", DOCS + "\n/slides", OFFICIAL("canva"), null],
    answers: [0, 2, 1, 0, 1, 2],
  },
  pm: {
    code: [OFFICIAL("linear") + "\n" + OFFICIAL("atlassian"), "/btw where is the checkout flow implemented?", DOCS, KW("product-management"), "/slides"],
    answers: [1, 0, 2, 2, 1, 0],
  },
  qa: {
    code: [OFFICIAL("playwright"), "write a failing test that reproduces the bug", OFFICIAL("chrome-devtools-mcp"), "/code-review high", "/verify"],
    answers: [2, 1, 0, 0, 2, 1],
  },
  student: {
    code: [OFFICIAL("learning-output-style"), null, "/powerup", "/usage", "/init"],
    answers: [0, 2, 1, 1, 0, 2],
  },
};
