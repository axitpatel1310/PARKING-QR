import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

const authHandler = NextAuth({
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: { email: {}, password: {} },
      async authorize(creds) {
        if (!creds?.email || !creds?.password) return null;
        const admin = await prisma.admin.findUnique({ where: { email: creds.email }});
        if (!admin) return null;
        const ok = await bcrypt.compare(creds.password, admin.password);
        if (!ok) return null;
        return { id: admin.id, email: admin.email };
      },
    }),
  ],
  pages: { signIn: "/admin/login" },
});

export const { GET, POST } = authHandler;
