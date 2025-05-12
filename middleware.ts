// export {auth as middleware} from "@/auth";

// export const config = {
//     matcher: [
//         "/((?!api|_next/static|_next/image|favicon.ico).*)",
//         "/auth/:path*",
//     ],
// };

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_ROUTES = ["/auth/signin", "/auth/signup"];

export async function middleware(req: NextRequest) {

    console.log("Middleware called");

  const { pathname } = req.nextUrl;

  // Allow public routes    
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.AUTH_SECRET });

  if (!token) {
    console.warn("❌ No token found.");
    return NextResponse.redirect(new URL("/auth/signin", req.url));
  }

  console.log("✅ Valid token found in middleware:", token);
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|auth/signin|auth/signup|api/auth).*)"],
};
