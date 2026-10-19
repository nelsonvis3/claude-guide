import { auth } from "@/auth";
import { loadProfile, saveProfile } from "@/lib/db";
import { getLang } from "@/lib/i18n-server";
import { parseProfile } from "@/lib/profile";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Iniciá sesión para ver tu perfil." }, { status: 401 });
  const data = await loadProfile(session.user.id);
  return Response.json({ profile: data ? parseProfile(data) : null });
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Iniciá sesión para guardar tu perfil." }, { status: 401 });
  const text = await req.text();
  if (text.length > 20_000) return Response.json({ error: "El perfil supera los 20 KB." }, { status: 413 });
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return Response.json({ error: "El cuerpo no es JSON válido." }, { status: 400 });
  }
  const profile = parseProfile(body);
  if (!profile) return Response.json({ error: "Falta el perfil." }, { status: 400 });
  const saved = await saveProfile(session.user.id, profile, session.user.email ?? null, await getLang());
  if (!saved) return Response.json({ error: "No hay base de datos configurada (DATABASE_URL)." }, { status: 503 });
  return Response.json({ profile });
}
