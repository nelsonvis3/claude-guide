// Parte de las lecciones que no se traduce: lo que acepta la terminal, lo que responde y las respuestas
// correctas de la prueba. Los textos (explicación, consigna, pista, preguntas) van en src/lessons/<idioma>.json.
// La salida imita la interfaz de Claude Code, que está en inglés en todos los idiomas.

export type Terminal = {
  accept?: string[]; // comandos exactos (sin distinguir mayúsculas ni espacios de más)
  match?: string; // o una expresión regular
  key?: string; // o un atajo de teclado, como "shift+tab"
  output: string[];
};
export type LessonData = { terminal: Terminal; answers: number[] };

export const LESSONS: Record<string, LessonData> = {
  install: { terminal: { accept: ["claude"], output: ["✻ Welcome to Claude Code!", "  /help for help, /status for your current setup", "  cwd: ~/my-project"] }, answers: [1, 0, 2] },
  init: { terminal: { accept: ["/init"], output: ["● Exploring the codebase…", "● Write(CLAUDE.md)", "  ⎿  Wrote 48 lines to CLAUDE.md"] }, answers: [2, 1, 0] },
  prompting: { terminal: { match: "(src/|\\.(ts|tsx|js|py|go|rb|java)\\b)", output: ["● Read(src/auth/session.ts)", "● Bash(npm test)", "  ⎿  1 failing: refresh token expired", "● Update(src/auth/session.ts)", "✓ Tests pass. The refresh now runs before the token expires."] }, answers: [1, 2, 0] },
  modes: { terminal: { key: "shift+tab", output: ["⏵⏵ accept edits on (shift+tab to cycle)"] }, answers: [0, 2, 1] },
  mentions: { terminal: { match: "^(@\\S+|!\\s*\\S+)", output: ["● Read(src/app/page.tsx)", "  ⎿  Read 64 lines"] }, answers: [1, 0, 1] },
  interrupt: { terminal: { accept: ["esc", "/rewind", "/undo", "/checkpoint"], key: "escape", output: ["⎿  Interrupted · What should Claude do instead?"] }, answers: [2, 0, 1] },
  context: { terminal: { accept: ["/clear", "/compact", "/context"], output: ["(no content)", "✻ Context cleared. Starting fresh."] }, answers: [0, 1, 2] },
  usage: { terminal: { accept: ["/usage", "/cost", "/stats"], output: ["Total cost:            $0.55", "Usage by model:", "   claude-sonnet-5-5:  1.2k input, 5.3k output, 940k cache read"] }, answers: [1, 2, 0] },
  planmode: { terminal: { match: "^/plan(\\s|$)", key: "shift+tab", output: ["⏸ plan mode on (shift+tab to cycle)", "● Exploring src/auth…", "● Here is my plan: 1. … 2. … 3. …  Approve?"] }, answers: [2, 1, 0] },
  verify: { terminal: { match: "(test|captura|screenshot|esperad|expected|verif)", output: ["● Write(src/validate.test.ts)", "● Bash(npm test)", "  ⎿  3 passed", "✓ validateEmail works for all three cases."] }, answers: [0, 2, 1] },
  runverify: { terminal: { accept: ["/verify", "/run", "/run-skill-generator"], output: ["● Building the app…", "● Launching http://localhost:3000", "✓ The new button saves the form and shows the toast."] }, answers: [1, 0, 2] },
  models: { terminal: { match: "^/(model|effort)\\b", output: ["✓ Set model to Sonnet 5.5 · with medium effort"] }, answers: [2, 1, 0] },
  sessions: { terminal: { accept: ["claude --continue", "claude -c", "/resume", "claude --resume", "/rename", "/branch"], output: ["✻ Resuming your last conversation…"] }, answers: [0, 2, 1] },
  btw: { terminal: { match: "^/btw\\s+\\S+", output: ["(side answer — not added to the conversation)", "It matches any email-like string with one @."] }, answers: [1, 0, 2] },
  images: { terminal: { key: "ctrl+v", accept: ["ctrl+v"], output: ["[Image #1]  Pasted screenshot (1440×900)"] }, answers: [2, 1, 0] },
  review: { terminal: { match: "^/(diff|code-review|review|security-review)\\b", output: ["● Reviewing the diff with 4 agents…", "  ⎿  2 findings: missing null check, unused import"] }, answers: [0, 1, 2] },
  simplify: { terminal: { accept: ["/simplify"], output: ["● 4 review agents running in parallel…", "  ⎿  Reused an existing helper, removed 23 lines"] }, answers: [1, 2, 0] },
  automode: { terminal: { match: "(--permission-mode\\s+auto)", key: "shift+tab", output: ["⏵⏵ auto mode on · safety checks run in the background"] }, answers: [2, 0, 1] },
  claudemd: { terminal: { accept: ["/memory"], output: ["Memory files:", "  ./CLAUDE.md  (project)", "  ~/.claude/CLAUDE.md  (user)"] }, answers: [0, 2, 1] },
  skills: { terminal: { match: "^/skills\\b", output: ["Skills (12):", "  deploy        Runs the deploy checklist", "  api-style     Our API conventions"] }, answers: [1, 0, 2] },
  skilldoctor: { terminal: { accept: ["/skill-doctor"], output: ["Skill            Tokens   Used (30d)", "deploy              180   14×", "old-helper          420    0×   ← consider turning off"] }, answers: [2, 1, 0] },
  fewerprompts: { terminal: { accept: ["/fewer-permission-prompts"], output: ["● Scanning your recent transcripts…", "  ⎿  Allowed: Bash(git status), Bash(ls:*), Bash(npm test)"] }, answers: [0, 1, 2] },
  debug: { terminal: { match: "^/(debug|doctor)\\b", output: ["● Reading the debug log…", "  ⎿  Hook 'lint' failed: command not found: eslint"] }, answers: [1, 2, 0] },
  mcp: { terminal: { match: "^(/mcp\\b|claude mcp add\\b)", output: ["Added HTTP MCP server notion", "  ⎿  /mcp to authenticate"] }, answers: [2, 0, 1] },
  hooks: { terminal: { accept: ["/hooks"], output: ["PostToolUse", "  Edit|Write  →  npx prettier --write $FILE"] }, answers: [0, 2, 1] },
  subagents: { terminal: { match: "^(/agents\\b|.*\\bsubagent)", output: ["● Explore(Find where sessions expire)", "  ⎿  Done · returned a 6-line summary"] }, answers: [1, 0, 2] },
  plugins: { terminal: { match: "^/plugin\\b", output: ["Discover · Installed · Marketplaces", "  claude-plugins-official · 315 plugins"] }, answers: [2, 1, 0] },
  codeintel: { terminal: { match: "^/plugin install \\S*-lsp", output: ["✓ Installed typescript-lsp", "  ⎿  Claude now sees type errors after each edit"] }, answers: [0, 1, 2] },
  mods: { terminal: { match: "^/(plugin-authoring|reload-plugins)\\b", output: ["● Loading the plugin-authoring skill…", "  ⎿  1 mod active · token-chart"] }, answers: [1, 2, 0] },
  styles: { terminal: { match: "^/output-style\\b", output: ["✓ Output style set to Concise"] }, answers: [2, 0, 1] },
  statusline: { terminal: { match: "^/statusline\\b", output: ["✓ Status line configured", "  Sonnet 5.5 · ctx 34% · $0.42 · main"] }, answers: [0, 2, 1] },
  advisor: { terminal: { match: "^(/advisor\\b|claude --advisor\\b)", output: ["Advisor set to Opus 5.5", "  ⎿  Advisor Tool (experimental) is on and may use more tokens"] }, answers: [1, 0, 2] },
  subagentModel: { terminal: { match: "CLAUDE_CODE_SUBAGENT_MODEL=haiku", output: ["✻ Session: Sonnet 5.5 · advisor: Opus 5.5 · subagents: Haiku 5.5"] }, answers: [2, 1, 0] },
  opusplan: { terminal: { accept: ["/model opusplan"], output: ["✓ Set model to opusplan (Opus in plan mode, Sonnet to execute)"] }, answers: [0, 1, 2] },
  loop: { terminal: { match: "^/loop\\s+\\S+", output: ["✓ Scheduled: every 10m · check the deploy"] }, answers: [1, 2, 0] },
  routines: { terminal: { match: "^/schedule\\b", output: ["● Creating a routine in the cloud…", "  ⎿  Runs weekdays at 09:00"] }, answers: [2, 0, 1] },
  background: { terminal: { match: "^(/background|/fork|/subtask|claude agents)\\b", output: ["✓ Detached · running as a background agent", "  ⎿  claude agents to check on it"] }, answers: [0, 2, 1] },
  worktrees: { terminal: { match: "^claude (--worktree|-w)\\b", output: ["✓ Created worktree .claude/worktrees/feature-auth", "✻ Welcome to Claude Code!"] }, answers: [1, 0, 2] },
  goal: { terminal: { match: "^/goal\\s+\\S+", output: ["✓ Goal set · Claude keeps working until it's met"] }, answers: [2, 1, 0] },
  deepresearch: { terminal: { match: "^/deep-research\\s+\\S+", output: ["● Fanning out 8 web searches…", "  ⎿  Report ready · 12 sources cited"] }, answers: [0, 1, 2] },
  ultrareview: { terminal: { match: "^/(code-review ultra|ultrareview|autofix-pr)\\b", output: ["● Launching a multi-agent review in the cloud…", "  ⎿  You'll get the findings when it finishes"] }, answers: [1, 2, 0] },
  workflows: { terminal: { match: "^/(batch|workflows|effort ultracode)\\b", output: ["● Planning: 18 independent units", "  ⎿  Approve to run them in parallel"] }, answers: [2, 0, 1] },
  teams: { terminal: { match: "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1", output: ["✓ Agent teams enabled for this session"] }, answers: [0, 2, 1] },
  headless: { terminal: { match: "^claude -p\\s+\\S+", output: ['{"type":"result","result":"3 errors today, all in /api/upload"}'] }, answers: [1, 0, 2] },
  github: { terminal: { accept: ["/install-github-app"], output: ["● Opening GitHub to install the Claude app…", "  ⎿  Mention @claude in an issue or PR to start"] }, answers: [2, 1, 0] },
  chrome: { terminal: { match: "^(claude --chrome|/chrome)\\b", output: ["✓ Connected to Chrome", "● Opening http://localhost:3000…"] }, answers: [0, 1, 2] },
  remote: { terminal: { match: "^/(remote-control|rc|teleport|tp|desktop)\\b", output: ["✓ This session is now available at claude.ai/code"] }, answers: [1, 2, 0] },
  insights: { terminal: { accept: ["/insights"], output: ["● Analyzing 64 sessions…", "  ⎿  Report saved to ~/.claude/usage-data/report.html"] }, answers: [2, 0, 1] },
};

const norm = (s: string) => s.trim().replace(/\s+/g, " ").toLowerCase();

// ¿Lo que escribió (o el atajo que apretó) resuelve la consigna?
export function solves(t: Terminal, input: { text?: string; key?: string }) {
  if (input.key) return !!t.key && norm(input.key) === t.key;
  const text = norm(input.text ?? "");
  if (!text) return false;
  if (t.accept?.some((a) => norm(a) === text)) return true;
  if (t.key && text === t.key) return true;
  return !!t.match && new RegExp(t.match, "i").test(input.text!.trim());
}
