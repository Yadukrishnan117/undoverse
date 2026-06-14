import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";

/**
 * Auth.js v5 configuration.
 *
 * GitHub OAuth is the only provider — this is a builder community, everyone
 * already has a GitHub account, and it lets us pull their handle + avatar for
 * free. On first sign-in we mirror the GitHub profile onto our User row so the
 * rest of the app can query a stable shape.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/", // we use a modal/CTA, not a dedicated page
  },
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
      profile(profile) {
        return {
          id: String(profile.id),
          githubId: String(profile.id),
          username: profile.login,
          displayName: profile.name ?? profile.login,
          name: profile.name ?? profile.login,
          email: profile.email,
          avatarUrl: profile.avatar_url,
          image: profile.avatar_url,
          bio: profile.bio ?? null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.uid = user.id;
        // @ts-expect-error — username is added by our profile() mapper
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.uid) {
        session.user.id = token.uid as string;
        // @ts-expect-error — surface the handle to the client
        session.user.username = token.username as string | undefined;
      }
      return session;
    },
  },
});
