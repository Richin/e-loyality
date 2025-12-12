import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const role = req.nextauth.token?.role as string | undefined;
        console.log("Middleware Debug:", {
            path: req.nextUrl.pathname,
            role: role,
            token: req.nextauth.token
        });

        // Allow generic ADMIN check, or specific roles. 
        // For now, assume any role containing "ADMIN" or "MANAGER" has access, 
        // or check against a list.
        const allowed = ["ADMIN", "SUPER ADMIN", "MANAGER", "SUPPORT"].includes(role?.toUpperCase() || "");

        if (req.nextUrl.pathname.startsWith("/admin") && !allowed) {
            console.log("Middleware REJECTING access.");
            return NextResponse.redirect(new URL("/", req.url));
        }
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
);

export const config = {
    matcher: ["/admin/:path*", "/settings/:path*"],
};
