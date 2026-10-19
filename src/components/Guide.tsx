"use client";
import Link from "next/link";
import { useState } from "react";
import {
  ANTHROPIC_PLUGINS, ANTHROPIC_SKILLS, BUILTIN_MODS, COMMANDS, COMMUNITY, KNOWLEDGE_WORK, LSP_PLUGINS, PARTNER_PLUGINS,
  PERMISSION_MODES, PLUGIN_TOTALS, SAMPLE_MODS, SHORTCUTS, SKILLS, type Role,
} from "@/lib/content";
import { useI18n } from "@/lib/i18n";
import { Peek } from "./Mascot";
import { RecList, RoleRecs } from "./Recs";
import { Code, CopyButton } from "./Roadmap";

const SECTIONS = ["roles", "commands", "skills", "community", "askills", "knowledge", "shortcuts", "modes", "mods", "plugins"] as const;

function CommandList({ ids }: { ids: readonly string[] }) {
  const { t } = useI18n();
  return (
    <ul className="mt-4 grid gap-2 sm:grid-cols-2">
      {ids.map((c) => (
        <li key={c} className="flex items-start gap-3 rounded-2xl border border-line bg-surface px-4 py-3">
          <code className="max-w-[55%] rounded-lg bg-[#1d1830] px-2 py-0.5 font-mono text-[0.95rem] text-[#f1edf8] [overflow-wrap:anywhere]">/{c}</code>
          <span className="min-w-0 flex-1 [overflow-wrap:anywhere]">{t(`commands.${c}`)}</span>
          <CopyButton text={`/${c}`} />
        </li>
      ))}
    </ul>
  );
}

function PluginList({ ids, ns = "plugins" }: { ids: string[]; ns?: string }) {
  const { t } = useI18n();
  return (
    <ul className="mt-3 grid gap-2 sm:grid-cols-2">
      {ids.map((p) => (
        <li key={p} className="rounded-2xl border border-line bg-surface px-4 py-3">
          <code className="font-mono font-bold">{p}</code>
          <p className="text-ink-2">{t(`${ns}.${p}`)}</p>
        </li>
      ))}
    </ul>
  );
}

export default function Guide() {
  const { t, list } = useI18n();
  const [q, setQ] = useState("");
  const [role, setRole] = useState<Role>("frontend");
  const needle = q.trim().toLowerCase();
  const match = (c: string) => !needle || c.includes(needle) || t(`commands.${c}`).toLowerCase().includes(needle);
  const commands = COMMANDS.filter(match);
  const skills = SKILLS.filter(match);
  const h2 = "display text-[1.8rem] sm:text-[2.2rem] scroll-mt-20";
  const h3 = "mt-6 text-[1.2rem] font-bold";
  return (
    <main id="main" className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)] gap-12 px-4 py-12">
      <div className="relative">
        <Peek size={110} className="absolute -top-[30px] right-0 hidden sm:block" />
        <h1 className="display text-[2.6rem] sm:text-[3.6rem]">{t("guide.title")}</h1>
        <p className="mt-3 max-w-[60ch] text-[1.15rem] text-ink-2">{t("guide.lead")}</p>
        <Link href="/#ruta" className="mt-4 inline-block font-bold text-cobalt underline underline-offset-4">{t("guide.back")}</Link>
        <nav aria-label={t("guide.jump")} className="mt-6 flex flex-wrap gap-2">
          {SECTIONS.map((s) => (
            <a key={s} href={`#${s}`} className="rounded-full bg-surface px-4 py-1.5 font-bold shadow-soft hover:bg-cobalt hover:text-cobalt-ink">
              {t(`guide.${s}`)}
            </a>
          ))}
        </nav>
      </div>

      <section>
        <h2 id="roles" className={h2}>{t("guide.roles")}</h2>
        <p className="mt-2 mb-4 max-w-[65ch] text-ink-2">{t("recs.lead")}</p>
        <RoleRecs role={role} onRole={setRole} />
      </section>

      <label className="grid max-w-sm gap-1">
        <span className="font-bold">{t("guide.filter")}</span>
        <input value={q} onChange={(e) => setQ(e.target.value)} className="rounded-full border border-line bg-surface px-4 py-2 outline-none focus:border-cobalt" />
      </label>

      <section>
        <h2 id="commands" className={h2}>{t("guide.commands")}</h2>
        {commands.length === 0 ? <p className="mt-4 text-ink-2">{t("guide.empty", { q })}</p> : <CommandList ids={commands} />}
      </section>

      <section>
        <h2 id="skills" className={h2}>{t("guide.skills")}</h2>
        <p className="mt-2 max-w-[65ch] text-ink-2">{t("guide.skillsLead")}</p>
        {skills.length === 0 ? <p className="mt-4 text-ink-2">{t("guide.empty", { q })}</p> : <CommandList ids={skills} />}
      </section>

      <section>
        <h2 id="community" className={h2}>{t("guide.community")}</h2>
        <p className="mt-2 max-w-[65ch] text-ink-2">{t("guide.communityLead")}</p>
        {(["tokens", "workflow", "video"] as const).map((g) => (
          <div key={g}>
            <h3 className={h3}>{t(`guide.group.${g}`)}</h3>
            <div className="mt-3"><RecList keys={COMMUNITY.filter((c) => c.group === g).map((c) => `community:${c.id}`)} /></div>
          </div>
        ))}
      </section>

      <section>
        <h2 id="askills" className={h2}>{t("guide.askills")}</h2>
        <p className="mt-2 max-w-[65ch] text-ink-2">{t("guide.askillsLead")}</p>
        <div className="mt-2 max-w-2xl"><Code text={"/plugin marketplace add anthropics/skills\n/plugin install document-skills@anthropic-agent-skills\n/plugin install example-skills@anthropic-agent-skills"} /></div>
        <PluginList ids={ANTHROPIC_SKILLS.map((s) => s.id)} ns="askills" />
      </section>

      <section>
        <h2 id="knowledge" className={h2}>{t("guide.knowledge")}</h2>
        <p className="mt-2 max-w-[65ch] text-ink-2">{t("guide.knowledgeLead")}</p>
        <div className="mt-2 max-w-2xl"><Code text={"/plugin marketplace add anthropics/knowledge-work-plugins\n/plugin install marketing@knowledge-work-plugins"} /></div>
        <PluginList ids={KNOWLEDGE_WORK} ns="kw" />
      </section>

      <section>
        <h2 id="shortcuts" className={h2}>{t("guide.shortcuts")}</h2>
        <dl className="mt-4 grid gap-2 sm:grid-cols-2">
          {SHORTCUTS.map((s) => (
            <div key={s.id} className="flex items-start gap-3 rounded-2xl border border-line bg-surface px-4 py-3">
              <dt className="shrink-0">
                {s.keys.split(" / ").map((k) => (
                  <kbd key={k} className="mr-1 inline-block rounded-md border border-b-2 border-line bg-surface-2 px-1.5 font-mono text-[0.9rem]">{k}</kbd>
                ))}
              </dt>
              <dd>{t(`shortcuts.${s.id}`)}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section>
        <h2 id="modes" className={h2}>{t("guide.modes")}</h2>
        <ol className="mt-4 grid gap-2">
          {PERMISSION_MODES.map((mode) => (
            <li key={mode} className="grid gap-1 rounded-2xl border border-line bg-surface px-4 py-3 sm:grid-cols-[12rem_1fr] sm:gap-4">
              <code className="font-mono font-bold">{mode}</code>
              <span>{t(`modes.${mode}`)}</span>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h2 id="mods" className={h2}>{t("guide.mods")}</h2>
        <p className="mt-2 max-w-[65ch] text-ink-2">{t("modGuide.lead")}</p>
        <h3 className={h3}>{t("modGuide.canTitle")}</h3>
        <ul className="mt-2 grid max-w-[70ch] gap-2">
          {list("modGuide.can").map((c) => (
            <li key={c} className="flex gap-2">
              <span aria-hidden="true" className="mt-2.5 size-2 shrink-0 rounded-full bg-cobalt" />
              {c}
            </li>
          ))}
        </ul>
        <h3 className={h3}>{t("modGuide.samplesTitle")}</h3>
        <ul className="mt-2 grid gap-2 sm:grid-cols-3">
          {SAMPLE_MODS.map((m) => (
            <li key={m.id} className="rounded-2xl border border-line bg-surface px-4 py-3">
              <a href={m.url} target="_blank" rel="noreferrer" className="font-mono font-bold text-cobalt underline underline-offset-4">{m.id}</a>
              <p className="text-ink-2">{t(`modGuide.samples.${m.id}`)}</p>
            </li>
          ))}
        </ul>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="text-[1.2rem] font-bold">{t("modGuide.createTitle")}</h3>
            <p className="mt-1 text-ink-2">{t("modGuide.create")}</p>
            <div className="mt-2"><Code text={"/plugin-authoring\n/reload-plugins"} /></div>
            <p className="mt-3 text-ink-2">{t("modGuide.builtin")}</p>
            <ul className="mt-2 grid gap-1">
              {BUILTIN_MODS.map((m) => (
                <li key={m}><code className="font-mono font-bold">{m}</code> <span className="text-ink-2">{t(`builtinMods.${m}`)}</span></li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl bg-[var(--glow)] p-5">
            <h3 className="text-[1.2rem] font-bold">{t("modGuide.safetyTitle")}</h3>
            <p className="mt-1">{t("modGuide.safety")}</p>
            <div className="mt-2"><Code text="claude plugin validate ./some-mod" /></div>
          </div>
        </div>
      </section>

      <section>
        <h2 id="plugins" className={h2}>{t("guide.plugins")}</h2>
        <p className="mt-2 max-w-[65ch] text-ink-2">{t("pluginGuide.lead", PLUGIN_TOTALS)}</p>
        <p className="mt-3 max-w-[65ch]">{t("pluginGuide.install")}</p>
        <div className="mt-2 max-w-2xl"><Code text={"/plugin\n/plugin install commit-commands@claude-plugins-official"} /></div>
        <h3 className={h3}>{t("pluginGuide.anthropicTitle")}</h3>
        <PluginList ids={ANTHROPIC_PLUGINS} />
        <h3 className={h3}>{t("pluginGuide.lspTitle")}</h3>
        <p className="mt-1 text-ink-2">{t("pluginGuide.lsp")}</p>
        <ul className="mt-2 flex flex-wrap gap-2">
          {LSP_PLUGINS.map((p) => (
            <li key={p}><code className="rounded-full border border-line bg-surface px-3 py-0.5 font-mono">{p}</code></li>
          ))}
        </ul>
        <h3 className={h3}>{t("pluginGuide.partnersTitle")}</h3>
        <PluginList ids={PARTNER_PLUGINS} />
        <p className="mt-6 max-w-[65ch] text-ink-2">{t("pluginGuide.community")}</p>
        <p className="mt-2 text-[0.95rem] text-ink-2">{t("pluginGuide.snapshot")}</p>
      </section>
    </main>
  );
}
