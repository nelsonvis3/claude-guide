import "server-only";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
// Sin DATABASE_URL la app funciona igual y guarda todo en el navegador.
export const sql = url ? postgres(url, { max: 5 }) : null;

let ready: Promise<unknown> | null = null;
// email, lang, seen_at y reminded_at son para el aviso de racha: seen_at es la última vez que entró con sesión.
function ensureSchema() {
  ready ??= (async () => {
    await sql!`
      create table if not exists profiles (
        user_id text primary key,
        data jsonb not null,
        updated_at timestamptz not null default now()
      )`;
    await sql!`
      alter table profiles
        add column if not exists email text,
        add column if not exists lang text,
        add column if not exists seen_at timestamptz not null default now(),
        add column if not exists reminded_at timestamptz`;
  })();
  return ready;
}

// Leer el perfil cuenta como visita.
export async function loadProfile(userId: string) {
  if (!sql) return null;
  await ensureSchema();
  const [row] = await sql`update profiles set seen_at = now() where user_id = ${userId} returning data`;
  return (row?.data as unknown) ?? null;
}

export async function saveProfile(userId: string, data: unknown, email: string | null, lang: string) {
  if (!sql) return false;
  await ensureSchema();
  await sql`
    insert into profiles (user_id, data, email, lang) values (${userId}, ${sql.json(data as postgres.JSONValue)}, ${email}, ${lang})
    on conflict (user_id) do update
      set data = excluded.data, email = excluded.email, lang = excluded.lang, updated_at = now(), seen_at = now()`;
  return true;
}

// Quienes aceptaron el aviso, llevan 2 días sin entrar y no recibieron aviso desde su última visita.
export async function dueReminders() {
  if (!sql) return [];
  await ensureSchema();
  return sql<{ user_id: string; email: string; lang: string | null; name: string | null }[]>`
    select user_id, email, lang, data->>'name' as name from profiles
    where data->>'remind' = 'true' and email is not null
      and seen_at < now() - interval '2 days'
      and (reminded_at is null or reminded_at < seen_at)
    limit 200`;
}

export async function markReminded(userId: string) {
  await sql!`update profiles set reminded_at = now() where user_id = ${userId}`;
}
