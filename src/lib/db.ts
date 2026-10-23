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
    // Cuentas con email y contraseña. failed/locked_until frenan los intentos por fuerza bruta.
    await sql!`
      create table if not exists users (
        id uuid primary key default gen_random_uuid(),
        email text not null unique,
        name text not null,
        password_hash text not null,
        failed int not null default 0,
        locked_until timestamptz,
        created_at timestamptz not null default now()
      )`;
    // Color y traje de Tilde de cada cuenta, para que la sigan a cualquier dispositivo (la cookie es el respaldo).
    await sql!`
      create table if not exists looks (
        user_id text primary key,
        cat text,
        suit text,
        updated_at timestamptz not null default now()
      )`;
    // Foto de perfil: un avatar prearmado ("preset:<id>") o una imagen chica subida (data URL).
    await sql!`
      create table if not exists avatars (
        user_id text primary key,
        image text not null,
        updated_at timestamptz not null default now()
      )`;
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

type UserRow = { id: string; email: string; name: string; password_hash: string; failed: number; locked_until: Date | null };

// Devuelve null si el email ya está registrado.
export async function createUser(email: string, name: string, passwordHash: string) {
  await ensureSchema();
  const [row] = await sql!<{ id: string }[]>`
    insert into users (email, name, password_hash) values (${email}, ${name}, ${passwordHash})
    on conflict (email) do nothing returning id`;
  return row?.id ?? null;
}

export async function findUser(by: { email: string } | { id: string }) {
  await ensureSchema();
  const [row] = "email" in by
    ? await sql!<UserRow[]>`select * from users where email = ${by.email}`
    : await sql!<UserRow[]>`select * from users where id = ${by.id}`;
  return row ?? null;
}

const MAX_FAILED = 5;
// Tras 5 intentos fallidos la cuenta queda bloqueada 15 minutos.
export async function recordLogin(id: string, ok: boolean) {
  if (ok) {
    await sql!`update users set failed = 0, locked_until = null where id = ${id}`;
    return;
  }
  await sql!`
    update users set
      failed = case when failed + 1 >= ${MAX_FAILED} then 0 else failed + 1 end,
      locked_until = case when failed + 1 >= ${MAX_FAILED} then now() + interval '15 minutes' else locked_until end
    where id = ${id}`;
}

export async function setPassword(id: string, passwordHash: string) {
  await sql!`update users set password_hash = ${passwordHash} where id = ${id}`;
}

export async function getAvatar(userId: string) {
  if (!sql) return null;
  await ensureSchema();
  const [row] = await sql<{ image: string }[]>`select image from avatars where user_id = ${userId}`;
  return row?.image ?? null;
}

export async function setAvatar(userId: string, image: string | null) {
  await ensureSchema();
  if (image === null) await sql!`delete from avatars where user_id = ${userId}`;
  else
    await sql!`
      insert into avatars (user_id, image) values (${userId}, ${image})
      on conflict (user_id) do update set image = excluded.image, updated_at = now()`;
}

export async function getLook(userId: string) {
  if (!sql) return null;
  await ensureSchema();
  const [row] = await sql<{ cat: string | null; suit: string | null }[]>`select cat, suit from looks where user_id = ${userId}`;
  return row ?? null;
}

// key ya validada contra PREFS en setPref.
export async function setLook(userId: string, key: "cat" | "suit", value: string) {
  if (!sql) return;
  await ensureSchema();
  const cat = key === "cat" ? value : null;
  const suit = key === "suit" ? value : null;
  await sql`
    insert into looks (user_id, cat, suit) values (${userId}, ${cat}, ${suit})
    on conflict (user_id) do update
      set cat = coalesce(${cat}, looks.cat), suit = coalesce(${suit}, looks.suit), updated_at = now()`;
}
