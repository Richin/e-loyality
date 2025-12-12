import NextAuth, { AuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import prisma from "@/lib/prisma"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

console.error("🚀 LOADED route.ts for NextAuth");

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
                console.error("🔍 Authorize called with:", credentials?.email);
                if (!credentials?.email || !credentials?.password) {
                    console.error("❌ Missing credentials");
                    return null;
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                    include: { role: true }
                })

                if (!user) {
                    console.log("❌ User not found:", credentials.email);
                    return null;
                }

                if (!user.password) {
                    console.log("❌ User has no password set:", credentials.email);
                    return null;
                }

                const isValid = await bcrypt.compare(credentials.password, user.password);

                if (!isValid) {
                    console.log("❌ Invalid password for:", credentials.email);
                    return null;
                }

                console.log("✅ User authenticated in authorize:", credentials.email);
                // Ensure tokenVersion is present
                // @ts-ignore
                if (user.tokenVersion === undefined || user.tokenVersion === null) {
                    console.log("⚠️ User missing tokenVersion, defaulting to 0");
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
            console.log("🔍 JWT callback. Token sub:", token?.sub, "User present:", !!user);
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

                if (!dbUser) {
                    console.log("❌ DB User not found in JWT:", token.sub);
                    return {};
                }

                if ((dbUser.tokenVersion || 0) !== (token.version || 0)) {
                    console.log("❌ Token version mismatch. DB:", dbUser.tokenVersion, "Token:", token.version);
                    return {}; // Invalid token
                }

                // Refresh role
                token.role = dbUser.role?.name || "USER";
            }

            return token;
        },
        async session({ session, token }) {
            console.log("🔍 Session callback. Token keys:", Object.keys(token));
            if (Object.keys(token).length === 0) {
                console.log("❌ Empty token in session callback");
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
