import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";

// Solo se ofrecen los proveedores que tienen credenciales cargadas.
export const providers = [
  ...(process.env.AUTH_GITHUB_ID ? [{ id: "github", provider: GitHub }] : []),
  ...(process.env.AUTH_GOOGLE_ID ? [{ id: "google", provider: Google }] : []),
];
export const providerIds = providers.map((p) => p.id);

// Sesión JWT sin adapter. El id de usuario es "<proveedor>:<id>", así GitHub y Google no se pisan.
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: providers.map((p) => p.provider),
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, account }) {
      if (account) token.uid = `${account.provider}:${account.providerAccountId}`;
      return token;
    },
    session({ session, token }) {
      if (typeof token.uid === "string") session.user.id = token.uid;
      return session;
    },
  },
});
