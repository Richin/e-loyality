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
                    where: { email: credentials.email },
                    include: { role: true }
                })

                if (!user) return null;

                if (!user.password) return null;

                const isValid = await bcrypt.compare(credentials.password, user.password);

                if (!isValid) return null;

                // Ensure tokenVersion is present
                // @ts-ignore
                if (user.tokenVersion === undefined || user.tokenVersion === null) {
                    // @ts-ignore
                    user.tokenVersion = 0;
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
                token.role = user.role?.name || "USER";
                // @ts-ignore
                token.version = user.tokenVersion || 0;
            }

            // Verify token version on every request
            if (token.sub) {
                const dbUser = await prisma.user.findUnique({
                    where: { id: token.sub },
                    select: {
                        tokenVersion: true,
                        role: { select: { name: true } }
                    }
                });

                if (!dbUser) return {};

                if ((dbUser.tokenVersion || 0) !== (token.version || 0)) {
                    return {}; // Invalid token
                }

                // Refresh role
                token.role = dbUser.role?.name || "USER";
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
