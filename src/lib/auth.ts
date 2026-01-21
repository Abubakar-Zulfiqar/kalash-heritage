import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getDatabase } from "@/lib/db";
import type { User } from "@/entities/User";
import { UserRole } from "@/entities/User";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const startTime = Date.now();

          const db = await getDatabase();
          console.log(`⏱️ Database connection: ${Date.now() - startTime}ms`);

          const userRepo = db.getRepository("User");
          const queryStart = Date.now();
          const user = await userRepo.findOne({
            where: { email: credentials.email },
          }) as User | null;
          console.log(`⏱️ User query: ${Date.now() - queryStart}ms`);

          if (!user) {
            return null;
          }

          const bcryptStart = Date.now();
          const isValidPassword = await bcrypt.compare(
            credentials.password,
            user.password
          );
          console.log(`⏱️ Bcrypt compare: ${Date.now() - bcryptStart}ms`);
          console.log(`⏱️ Total auth time: ${Date.now() - startTime}ms`);

          if (!isValidPassword) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error("Auth error:", error);
          // Log more details for debugging
          if (error instanceof Error) {
            console.error("Auth error message:", error.message);
            console.error("Auth error stack:", error.stack);
          }
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};
