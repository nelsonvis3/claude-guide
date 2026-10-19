import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Discord from "next-auth/providers/discord";
import GitHub from "next-auth/providers/github";
import GitLab from "next-auth/providers/gitlab";
import Google from "next-auth/providers/google";
import { findUser, recordLogin } from "@/lib/db";
import { verifyPassword } from "@/lib/password";

// Solo se ofrecen los proveedores que tienen credenciales cargadas.
const oauth = [
  ...(process.env.AUTH_GITHUB_ID ? [{ id: "github", provider: GitHub }] : []),
  ...(process.env.AUTH_GOOGLE_ID ? [{ id: "google", provider: Google }] : []),
  ...(process.env.AUTH_DISCORD_ID ? [{ id: "discord", provider: Discord }] : []),
  ...(process.env.AUTH_GITLAB_ID ? [{ id: "gitlab", provider: GitLab }] : []),
];
export const providerIds = oauth.map((p) => p.id);
// Email y contraseña necesitan la base de datos.
export const passwordLogin = !!process.env.DATABASE_URL;
export const canLogin = providerIds.length > 0 || passwordLogin;

const password = Credentials({
  credentials: { email: {}, password: {} },
  async authorize(c) {
    const email = String(c.email ?? "").trim().toLowerCase();
    const pw = String(c.password ?? "");
    const user = email && pw ? await findUser({ email }) : null;
    if (!user || (user.locked_until && user.locked_until > new Date())) return null;
    const ok = await verifyPassword(pw, user.password_hash);
    await recordLogin(user.id, ok);
    return ok ? { id: user.id, name: user.name, email: user.email } : null;
  },
});

// Sesión JWT sin adapter. El id de usuario es "<proveedor>:<id>", así las cuentas de cada proveedor no se pisan.
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [...oauth.map((p) => p.provider), ...(passwordLogin ? [password] : [])],
  session: { strategy: "jwt" },
  pages: { signIn: "/entrar" },
  callbacks: {
    jwt({ token, account }) {
      if (account) {
        token.uid = `${account.provider}:${account.providerAccountId}`;
        token.provider = account.provider;
      }
      return token;
    },
    session({ session, token }) {
      if (typeof token.uid === "string") session.user.id = token.uid;
      return session;
    },
  },
});
