// Datos no traducibles de la ruta y la chuleta. Los textos viven en src/messages/<lang>.json
// bajo la misma clave (nodes.<id>, commands.<id>, shortcuts.<id>).
import type { FeatureId, ModelId, UseId } from "./estimate";

const DOCS = "https://code.claude.com/docs/en/";

export type Phase = "start" | "habits" | "extend" | "pro";
export const PHASES: Phase[] = ["start", "habits", "extend", "pro"];

export type Node = {
  id: string;
  phase: Phase;
  doc: string;
  code?: string;        // comando o config, igual en todos los idiomas
  feature?: FeatureId;  // se enciende en el estimador
  uses?: UseId[];       // a quién le sirve más (sin valor = a todos)
};

export const NODES: Node[] = [
  { id: "install", phase: "start", doc: "quickstart", code: "curl -fsSL https://claude.ai/install.sh | bash\nclaude" },
  { id: "init", phase: "start", doc: "memory", code: "/init" },
  { id: "prompting", phase: "start", doc: "best-practices" },
  { id: "modes", phase: "start", doc: "permission-modes", code: "Shift+Tab" },
  { id: "mentions", phase: "start", doc: "interactive-mode", code: "@src/app/page.tsx\n! npm test" },
  { id: "interrupt", phase: "start", doc: "checkpointing", code: "Esc  ·  Esc Esc  ·  /rewind" },
  { id: "context", phase: "start", doc: "costs", code: "/clear\n/compact keep the API decisions\n/context", feature: "clear" },
  { id: "usage", phase: "start", doc: "costs", code: "/usage" },

  { id: "planmode", phase: "habits", doc: "best-practices", code: "/plan add Google login", feature: "plan" },
  { id: "verify", phase: "habits", doc: "best-practices" },
  { id: "runverify", phase: "habits", doc: "skills", code: "/run\n/verify\n/run-skill-generator", uses: ["fullstack", "fixes", "content"] },
  { id: "models", phase: "habits", doc: "model-config", code: "/model sonnet\n/effort high\nultrathink" },
  { id: "sessions", phase: "habits", doc: "sessions", code: "claude --continue\n/resume\n/rename\n/branch" },
  { id: "btw", phase: "habits", doc: "interactive-mode", code: "/btw what does this regex match?" },
  { id: "images", phase: "habits", doc: "interactive-mode", code: "Ctrl+V", uses: ["fullstack", "fixes", "content"] },
  { id: "review", phase: "habits", doc: "code-review-local", code: "/diff\n/code-review high\n/security-review" },
  { id: "simplify", phase: "habits", doc: "skills", code: "/simplify" },
  { id: "automode", phase: "habits", doc: "permission-modes", code: "claude --permission-mode auto" },

  { id: "claudemd", phase: "extend", doc: "memory", code: "/memory" },
  { id: "skills", phase: "extend", doc: "skills", code: ".claude/skills/deploy/SKILL.md", feature: "skills" },
  { id: "skilldoctor", phase: "extend", doc: "skills", code: "/skill-doctor\n/skills" },
  { id: "fewerprompts", phase: "extend", doc: "permissions", code: "/fewer-permission-prompts" },
  { id: "debug", phase: "extend", doc: "debug-your-config", code: "/debug\n/doctor" },
  { id: "mcp", phase: "extend", doc: "mcp", code: "claude mcp add --transport http notion https://mcp.notion.com/mcp", feature: "mcp" },
  { id: "hooks", phase: "extend", doc: "hooks-guide", code: "/hooks", feature: "hooks" },
  { id: "subagents", phase: "extend", doc: "sub-agents", code: ".claude/agents/reviewer.md", feature: "subagents" },
  { id: "plugins", phase: "extend", doc: "plugins/overview", code: "/plugin" },
  { id: "codeintel", phase: "extend", doc: "plugins/code-intelligence", code: "/plugin", feature: "codeintel", uses: ["fullstack", "refactor", "fixes"] },
  { id: "mods", phase: "extend", doc: "plugins/mods/overview", code: "/plugin-authoring" },
  { id: "styles", phase: "extend", doc: "output-styles", code: "/output-style concise" },
  { id: "statusline", phase: "extend", doc: "statusline", code: "/statusline show model, context % and cost" },

  { id: "advisor", phase: "pro", doc: "advisor", code: "claude --advisor opus", feature: "advisor" },
  { id: "subagentModel", phase: "pro", doc: "model-config", code: "CLAUDE_CODE_SUBAGENT_MODEL=haiku claude --advisor opus", feature: "subagents" },
  { id: "opusplan", phase: "pro", doc: "model-config", code: "/model opusplan" },
  { id: "loop", phase: "pro", doc: "scheduled-tasks", code: "/loop 10m check the deploy and tell me if it fails", feature: "loop", uses: ["automation", "fullstack"] },
  { id: "routines", phase: "pro", doc: "routines", code: "/schedule every weekday at 9 review open PRs", uses: ["automation"] },
  { id: "background", phase: "pro", doc: "agent-view", code: "/background\n/fork\n/subtask write the tests\nclaude agents" },
  { id: "worktrees", phase: "pro", doc: "worktrees", code: "claude --worktree feature-auth", uses: ["fullstack", "refactor"] },
  { id: "goal", phase: "pro", doc: "goal", code: "/goal all tests in src/billing pass" },
  { id: "deepresearch", phase: "pro", doc: "workflows", code: "/deep-research which auth library fits Next.js 16?" },
  { id: "ultrareview", phase: "pro", doc: "ultrareview", code: "/code-review ultra\n/autofix-pr", uses: ["fullstack", "refactor", "automation"] },
  { id: "workflows", phase: "pro", doc: "workflows", code: "/effort ultracode\n/batch migrate every API route to zod", feature: "ultracode", uses: ["refactor"] },
  { id: "teams", phase: "pro", doc: "agent-teams", code: "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1", feature: "teams", uses: ["refactor"] },
  { id: "headless", phase: "pro", doc: "headless", code: "claude -p \"summarize today's errors\" --output-format json", uses: ["automation"] },
  { id: "github", phase: "pro", doc: "github-actions", code: "/install-github-app", uses: ["automation", "fullstack"] },
  { id: "chrome", phase: "pro", doc: "chrome", code: "claude --chrome", uses: ["fullstack", "fixes", "content"] },
  { id: "insights", phase: "pro", doc: "costs", code: "/insights" },
  { id: "remote", phase: "pro", doc: "remote-control", code: "/remote-control\n/teleport\n/desktop" },
].map((n) => ({ ...n, doc: DOCS + n.doc })) as Node[];

// Por dónde empieza cada nivel de experiencia.
export const START_PHASE: Record<"new" | "some" | "daily", Phase> = {
  new: "start", some: "habits", daily: "extend",
};

export const USES: UseId[] = ["learn", "fixes", "fullstack", "refactor", "automation", "content"];
export const MODELS: ModelId[] = ["haiku", "sonnet", "opus", "fable"];

// Funciones que se pueden encender en el estimador, en el orden en que se muestran.
export const FEATURES: { id: FeatureId; kind: "save" | "spend" }[] = [
  { id: "clear", kind: "save" },
  { id: "plan", kind: "save" },
  { id: "hooks", kind: "save" },
  { id: "codeintel", kind: "save" },
  { id: "skills", kind: "spend" },
  { id: "mcp", kind: "spend" },
  { id: "subagents", kind: "spend" },
  { id: "advisor", kind: "spend" },
  { id: "loop", kind: "spend" },
  { id: "ultracode", kind: "spend" },
  { id: "teams", kind: "spend" },
  { id: "fast", kind: "spend" },
];

// Chuleta: comandos, skills incluidas, mods y plugins verificados contra code.claude.com/docs (2026-10-18).
// Las descripciones van en messages bajo commands.<id> (comandos y skills) y plugins.<nombre>.
export const COMMANDS = [
  "init", "clear", "compact", "context", "usage", "model", "effort", "plan", "rewind", "resume",
  "rename", "branch", "btw", "focus", "recap", "copy", "diff", "security-review", "ultrareview", "autofix-pr",
  "memory", "skills", "skill-doctor", "reload-skills", "mcp", "hooks", "plugin", "reload-plugins", "agents",
  "list-agents", "advisor", "schedule", "goal", "background", "fork", "subtask", "tasks", "workflows",
  "output-style", "statusline", "config", "permissions", "auto-mode-setup", "sandbox", "autocompact",
  "add-dir", "cd", "import", "team-onboarding", "insights", "remote-control", "teleport", "desktop",
  "artifacts", "theme", "tui", "keybindings", "terminal-setup", "voice", "fast", "usage-credits",
  "rate-limit-options", "release-notes", "powerup", "export",
] as const;

// Skills que vienen con Claude Code (bundled). /deep-research es un workflow incluido.
export const SKILLS = [
  "batch", "code-review", "simplify", "verify", "run", "run-skill-generator", "debug", "doctor",
  "loop", "deep-research", "fewer-permission-prompts", "update-config", "claude-api", "claude-in-chrome",
  "dataviz", "design", "design-sync", "slides", "artifact-capabilities", "artifact-diagramming", "workflow-authoring",
] as const;

const MODS_REPO = "https://github.com/anthropics/claude-code-playground/tree/main/claude-code/mods/";
export const SAMPLE_MODS = ["token-weather", "blast-radius", "replay-theater"].map((id) => ({ id, url: MODS_REPO + id }));

// Marketplace claude-plugins-official al 2026-10-18: 315 plugins, 39 de Anthropic.
export const PLUGIN_TOTALS = { total: 315, anthropic: 39 };
export const ANTHROPIC_PLUGINS = [
  "feature-dev", "code-review", "pr-review-toolkit", "commit-commands", "code-simplifier", "security-guidance",
  "claude-security", "frontend-design", "claude-code-setup", "claude-md-management", "hookify", "skill-creator",
  "plugin-dev", "mcp-server-dev", "agent-sdk-dev", "ralph-loop", "playground", "session-report", "receipts",
  "explanatory-output-style", "learning-output-style", "code-modernization", "project-artifact",
];
export const LSP_PLUGINS = [
  "typescript-lsp", "pyright-lsp", "gopls-lsp", "rust-analyzer-lsp", "jdtls-lsp", "kotlin-lsp",
  "csharp-lsp", "clangd-lsp", "php-lsp", "ruby-lsp", "swift-lsp", "lua-lsp",
];
export const PARTNER_PLUGINS = [
  "github", "figma", "context7", "playwright", "supabase", "vercel", "stripe", "sentry",
  "linear", "notion", "slack", "chrome-devtools-mcp", "firebase", "atlassian", "cloudflare", "datadog",
];

export const SHORTCUTS: { id: string; keys: string }[] = [
  { id: "cycleModes", keys: "Shift+Tab" },
  { id: "interrupt", keys: "Esc" },
  { id: "rewind", keys: "Esc Esc" },
  { id: "shell", keys: "!" },
  { id: "mention", keys: "@" },
  { id: "editor", keys: "Ctrl+G" },
  { id: "transcript", keys: "Ctrl+O" },
  { id: "history", keys: "Ctrl+R" },
  { id: "pasteImage", keys: "Ctrl+V" },
  { id: "background", keys: "Ctrl+B" },
  { id: "todo", keys: "Ctrl+T" },
  { id: "stash", keys: "Ctrl+S" },
  { id: "switchModel", keys: "Alt+P / Option+P" },
  { id: "fastToggle", keys: "Alt+O / Option+O" },
  { id: "help", keys: "?" },
];

export const PERMISSION_MODES = ["default", "acceptEdits", "plan", "auto", "dontAsk", "bypassPermissions"] as const;

export const LANGS = ["es", "en", "pt", "fr", "de", "it", "ja", "zh", "ko"] as const;
export type Lang = (typeof LANGS)[number];
export const LANG_NAMES: Record<Lang, string> = {
  es: "Español", en: "English", pt: "Português", fr: "Français", de: "Deutsch",
  it: "Italiano", ja: "日本語", zh: "中文", ko: "한국어",
};

// --- Catálogo extendido (verificado el 2026-10-18; estrellas desde la API de GitHub) ---

// Repos de la comunidad. install sale del README de cada uno.
export type CommunityItem = { id: string; repo: string; stars: number; install?: string; group: "tokens" | "workflow" | "video" };
export const COMMUNITY: CommunityItem[] = [
  { id: "caveman", repo: "JuliusBrussee/caveman", stars: 113460, group: "tokens", install: "claude plugin marketplace add JuliusBrussee/caveman\nclaude plugin install caveman@caveman" },
  { id: "rtk", repo: "rtk-ai/rtk", stars: 83864, group: "tokens", install: "brew install rtk" },
  { id: "headroom", repo: "headroomlabs-ai/headroom", stars: 75890, group: "tokens", install: 'pip install "headroom-ai[all]"' },
  { id: "context-mode", repo: "mksglu/context-mode", stars: 30729, group: "tokens", install: "/plugin marketplace add mksglu/context-mode\n/plugin install context-mode@context-mode" },
  { id: "claude-mem", repo: "thedotmack/claude-mem", stars: 101606, group: "tokens", install: "npx claude-mem install" },
  { id: "serena", repo: "oraios/serena", stars: 30368, group: "tokens", install: "/plugin install serena@claude-plugins-official" },
  { id: "ponytail", repo: "DietrichGebert/ponytail", stars: 166984, group: "tokens", install: "/plugin marketplace add DietrichGebert/ponytail\n/plugin install ponytail@ponytail" },
  { id: "ccusage", repo: "ccusage/ccusage", stars: 19058, group: "tokens", install: "npx ccusage" },
  { id: "codeburn", repo: "getagentseal/codeburn", stars: 11507, group: "tokens", install: "npx codeburn" },
  { id: "superpowers", repo: "obra/superpowers", stars: 301613, group: "workflow", install: "/plugin install superpowers@claude-plugins-official" },
  { id: "mattpocock-skills", repo: "mattpocock/skills", stars: 296109, group: "workflow", install: "claude plugin install mattpocock-skills@claude-plugins-official" },
  { id: "ecc", repo: "affaan-m/ECC", stars: 283221, group: "workflow", install: "npx ecc-universal@2.2.3 setup" },
  { id: "ui-ux-pro-max", repo: "nextlevelbuilder/ui-ux-pro-max-skill", stars: 137207, group: "workflow", install: "/plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill\n/plugin install ui-ux-pro-max@ui-ux-pro-max-skill" },
  { id: "awesome-claude-skills", repo: "ComposioHQ/awesome-claude-skills", stars: 77389, group: "workflow" },
  { id: "awesome-claude-code", repo: "hesreallyhim/awesome-claude-code", stars: 55963, group: "workflow" },
  { id: "wshobson-agents", repo: "wshobson/agents", stars: 41012, group: "workflow", install: "/plugin marketplace add wshobson/agents" },
  { id: "claude-code-router", repo: "musistudio/claude-code-router", stars: 37744, group: "workflow", install: "npm install -g @musistudio/claude-code-router" },
  { id: "claude-code-templates", repo: "davila7/claude-code-templates", stars: 32735, group: "workflow", install: "npx claude-code-templates@latest" },
  { id: "vercel-agent-skills", repo: "vercel-labs/agent-skills", stars: 32602, group: "workflow", install: "npx skills add vercel-labs/agent-skills" },
  { id: "hyperframes", repo: "heygen-com/hyperframes", stars: 66666, group: "video", install: "/plugin install hyperframes@claude-plugins-official" },
  { id: "remotion-skills", repo: "remotion-dev/skills", stars: 5328, group: "video", install: "npx skills add remotion-dev/skills" },
];

// Skills oficiales del repo anthropics/skills (marketplace anthropic-agent-skills).
export const ANTHROPIC_SKILLS: { id: string; plugin: string }[] = [
  ...["docx", "pdf", "pptx", "xlsx"].map((id) => ({ id, plugin: "document-skills" })),
  ...["canvas-design", "algorithmic-art", "theme-factory", "brand-guidelines", "frontend-design", "web-artifacts-builder",
    "webapp-testing", "mcp-builder", "skill-creator", "doc-coauthoring", "internal-comms", "slack-gif-creator"].map((id) => ({ id, plugin: "example-skills" })),
  ...["claude-api", "academy-guide", "discernment-nudge"].map((id) => ({ id, plugin: id })),
];

// Plugins por área de trabajo de anthropics/knowledge-work-plugins (123 en total; estos son los de Anthropic por rol).
export const KNOWLEDGE_WORK = [
  "productivity", "marketing", "brand-voice", "design", "data", "engineering", "product-management",
  "sales", "customer-support", "finance", "legal", "operations", "human-resources", "small-business",
];

export const BUILTIN_MODS = ["cc-plugin-diff", "cc-plugin-agents-md", "cc-plugin-plugin-authoring", "cc-plugin-you-should-know", "cc-plugin-sec-default", "cc-plugin-telemetry"];

// Recomendaciones por rol. Claves: "<espacio>:<id>" — commands (incluido en Claude Code), plugins (marketplace oficial),
// askills (anthropics/skills), kw (knowledge-work-plugins), community (COMMUNITY).
export const ROLES = {
  frontend: ["plugins:frontend-design", "community:ui-ux-pro-max", "community:vercel-agent-skills", "askills:webapp-testing", "plugins:playwright", "plugins:chrome-devtools-mcp", "plugins:figma", "plugins:context7", "commands:verify", "commands:design"],
  backend: ["community:serena", "plugins:context7", "plugins:supabase", "plugins:sentry", "plugins:security-guidance", "plugins:claude-security", "askills:mcp-builder", "plugins:pr-review-toolkit", "commands:simplify"],
  fullstack: ["community:superpowers", "community:mattpocock-skills", "plugins:feature-dev", "plugins:commit-commands", "plugins:github", "plugins:vercel", "community:claude-mem", "commands:run", "commands:code-review"],
  mobile: ["plugins:expo", "plugins:swift-lsp", "plugins:kotlin-lsp", "plugins:firebase", "plugins:sentry", "plugins:context7", "commands:verify"],
  devops: ["plugins:aws-core", "plugins:cloudflare", "plugins:datadog", "plugins:grafana-mcp", "plugins:github", "plugins:hookify", "commands:schedule", "commands:autofix-pr", "commands:sandbox"],
  data: ["kw:data", "plugins:duckdb-skills", "plugins:databricks", "askills:xlsx", "askills:pdf", "commands:dataviz", "commands:deep-research"],
  designer: ["askills:canvas-design", "askills:algorithmic-art", "askills:theme-factory", "askills:brand-guidelines", "plugins:canva", "plugins:adobe-for-creativity", "plugins:figma", "kw:design", "community:ui-ux-pro-max", "commands:design"],
  video: ["community:remotion-skills", "community:hyperframes", "plugins:adobe-for-creativity", "plugins:canva", "askills:slack-gif-creator", "askills:algorithmic-art"],
  marketing: ["kw:marketing", "kw:brand-voice", "askills:docx", "askills:pptx", "askills:doc-coauthoring", "plugins:canva", "commands:slides", "commands:deep-research"],
  pm: ["kw:product-management", "plugins:linear", "plugins:atlassian", "plugins:notion", "askills:pptx", "askills:doc-coauthoring", "askills:internal-comms", "commands:slides"],
  qa: ["askills:webapp-testing", "plugins:playwright", "plugins:chrome-devtools-mcp", "plugins:pr-review-toolkit", "plugins:sentry", "commands:verify", "commands:code-review"],
  student: ["plugins:learning-output-style", "plugins:explanatory-output-style", "askills:academy-guide", "commands:powerup", "community:ccusage"],
} as const;
export type Role = keyof typeof ROLES;
export const ROLE_IDS = Object.keys(ROLES) as Role[];
// Sirve a cualquiera: lo que más tokens ahorra.
export const TOKEN_SAVERS = ["community:caveman", "community:rtk", "community:context-mode", "community:ponytail"];

export type Rec = { key: string; ns: string; id: string; install?: string; url?: string; stars?: number };
// Resuelve una clave de ROLES a su texto (messages[ns][id]) y a cómo se instala.
export function resolve(key: string): Rec {
  const [ns, id] = key.split(":");
  if (ns === "community") {
    const c = COMMUNITY.find((x) => x.id === id)!;
    return { key, ns, id, install: c.install, url: `https://github.com/${c.repo}`, stars: c.stars };
  }
  if (ns === "plugins") return { key, ns, id, install: `/plugin install ${id}@claude-plugins-official` };
  if (ns === "askills") {
    const plugin = ANTHROPIC_SKILLS.find((x) => x.id === id)!.plugin;
    return { key, ns, id, install: `/plugin marketplace add anthropics/skills\n/plugin install ${plugin}@anthropic-agent-skills`, url: `https://github.com/anthropics/skills/tree/main/skills/${id}` };
  }
  if (ns === "kw") return { key, ns, id, install: `/plugin marketplace add anthropics/knowledge-work-plugins\n/plugin install ${id}@knowledge-work-plugins` };
  return { key, ns, id, install: `/${id}` };
}

// Página /estudiar: textos en study.learn.<id>, study.grit.<id> y study.books.<id>.
export const LEARN_TIPS = ["recall", "spaced", "focus", "build", "explain", "rest"];
export const GRIT_TIPS = ["valley", "struggle", "impostor", "ask", "small", "away"];
// Títulos en su idioma original para que se encuentren en cualquier librería.
export const BOOKS: { id: string; title: string; author: string; year: number }[] = [
  { id: "mind", title: "A Mind for Numbers", author: "Barbara Oakley", year: 2014 },
  { id: "stick", title: "Make It Stick", author: "Peter C. Brown, Henry L. Roediger III, Mark A. McDaniel", year: 2014 },
  { id: "mindset", title: "Mindset", author: "Carol S. Dweck", year: 2006 },
  { id: "atomic", title: "Atomic Habits", author: "James Clear", year: 2018 },
  { id: "deep", title: "Deep Work", author: "Cal Newport", year: 2016 },
  { id: "grit", title: "Grit", author: "Angela Duckworth", year: 2016 },
  { id: "ultra", title: "Ultralearning", author: "Scott H. Young", year: 2019 },
  { id: "brain", title: "The Programmer's Brain", author: "Felienne Hermans", year: 2021 },
  { id: "pragmatic", title: "The Pragmatic Programmer", author: "David Thomas, Andrew Hunt", year: 2019 },
  { id: "apprentice", title: "Apprenticeship Patterns", author: "Dave H. Hoover, Adewale Oshineye", year: 2009 },
];
