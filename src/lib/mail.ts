import "server-only";

export const mailReady = () => !!(process.env.RESEND_API_KEY && process.env.MAIL_FROM);

// Envío por la API HTTP de Resend.
export async function sendMail(to: string, subject: string, text: string, replyTo?: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${process.env.RESEND_API_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({ from: process.env.MAIL_FROM, to, subject, text, ...(replyTo && { reply_to: replyTo }) }),
  });
  return res.ok;
}
