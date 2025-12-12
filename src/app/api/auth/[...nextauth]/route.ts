import NextAuth, { AuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import prisma from "@/lib/prisma"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

export const authOptions: AuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email }
                })

                if (!user) {
                    console.log("User not found:", credentials.email);
                    return null;
                }

                if (!user.password) {
                    console.log("User has no password set:", credentials.email);
                    return null;
                }

                const isValid = await bcrypt.compare(credentials.password, user.password);

                if (!isValid) {
                    console.log("Invalid password for user:", credentials.email);
                    return null;
                }

                return user;
            }
        })
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                // @ts-ignore
                token.role = user.role;
                // @ts-ignore
                token.version = user.tokenVersion || 0;
            }

            // Verify token version on every request
            if (token.sub) {
                const dbUser = await prisma.user.findUnique({
                    where: { id: token.sub },
                    select: { tokenVersion: true, role: true }
                });

                if (!dbUser || (dbUser.tokenVersion || 0) !== (token.version || 0)) {
                    return {}; // Invalid token
                }

                // Refresh role in case it changed in DB (e.g. promoted to admin)
                token.role = dbUser.role;
            }

            return token;
        },
        async session({ session, token }) {
            if (Object.keys(token).length === 0) {
                return null as any;
            }

            if (session.user && token.sub) {
                // @ts-ignore
                session.user.id = token.sub;
                // @ts-ignore
                session.user.role = token.role;
            }
            return session;
        },
    },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
