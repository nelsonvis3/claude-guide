import { dueReminders, markReminded } from "@/lib/db";
import { getMessages } from "@/lib/i18n-server";
import { mailReady, sendMail } from "@/lib/mail";
import { LANGS, type Lang } from "@/lib/content";

// Lo llama Vercel Cron una vez por día (vercel.json) con el CRON_SECRET en el header.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return Response.json({ error: "Falta CRON_SECRET." }, { status: 503 });
  if (req.headers.get("authorization") !== `Bearer ${secret}`) return Response.json({ error: "No autorizado." }, { status: 401 });
  if (!mailReady()) return Response.json({ error: "Falta RESEND_API_KEY o MAIL_FROM." }, { status: 503 });
  const url = process.env.SITE_URL ?? new URL(req.url).origin;
  let sent = 0;
  for (const r of await dueReminders()) {
    const lang = (LANGS.includes(r.lang as Lang) ? r.lang : "es") as Lang;
    const m = (await getMessages(lang)).mail;
    const name = r.name || "👋";
    const fill = (s: string) => s.replaceAll("{name}", name).replaceAll("{url}", url);
    // Se marca aunque falle el envío, para no reintentar en loop a un correo que rebota.
    if (await sendMail(r.email, fill(m.subject), fill(m.body))) sent++;
    await markReminded(r.user_id);
  }
  return Response.json({ sent });
}
