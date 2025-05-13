import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { signInSchema } from "./lib/zod";
import { error } from "console";
import GitHub from "next-auth/providers/github";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

export const {handlers, signIn, signOut, auth} = NextAuth({
    providers: [
        GitHub({
            profile(profile) {
                return {
                    id: profile.id,
                    name: profile.name,
                    email: profile.email,
                    image: profile.avatar_url,
                    role: "user"
                }
            }
        }),
        Credentials({
            name: "Credentials",
            credentials: {
              email: { label: "Email", type: "text" },
              password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
              const prisma = new PrismaClient(); // ensure this is not reused across requests
          
              if (!credentials?.email || !credentials?.password) {
                throw new Error("Missing email or password");
              }
          
              const user = await prisma.user.findUnique({
                where: { email: credentials.email },
              });
          
              if (!user || !user.password) {
                throw new Error("Invalid email or password");
              }
          
              const isValid = await bcrypt.compare(credentials.password, user.password);
          
              if (!isValid) {
                throw new Error("Invalid email or password");
              }
          
              return {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
              };
            }
          }),          

    ],
    callbacks: {
        // for all those requests for which middleware will be executed.
        authorized({request: {nextUrl}, auth}){

            const isLoggedIn = !!auth?.user; // return a boolean value in any case , when use is logged in or not
            const { pathname } = nextUrl;
            
            const role = auth?.user?.role || "user";

            if(pathname.startsWith('/page2') && role !== 'admin'){
                return Response.redirect(new URL('/', nextUrl));
            }

            if(pathname.startsWith('/auth/signin') && isLoggedIn){
                return Response.redirect(new URL('/', nextUrl));
            }

            return !!auth;
        },
        async jwt({token, user, trigger, session}) {

            console.log("JWT callback triggered:", { token, user, trigger, session });

            //pass in user-id to the token
            if(user) {return {
                ...token,
                id: user.id,
                role: user.role,
                email: user.email,
                }
        }

            if(trigger === 'update' && session?.name){
                token.name = session.name;
            }
            
            return token;
        },
        async session({session, token, user}) {
            console.log("Session callback triggered:", { session, token, user });

            //pass in user-id to the session
            return {
                ...session,
                user: {
                    ...session.user,
                    id: token.id,
                    role: token.role,
                    email: token.email,
                    name: token.name,
                }
            }

            return session;
        }
    },
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
        updateAge: 24 * 60 * 60, // 24 hours
    },
    pages: {
        signIn: "/auth/signin",
        signOut: "/auth/signout",
        error: "/auth/error", // Error code passed in query string as ?error=
        verifyRequest: "/auth/verify-request", // (used for check email message)
        newUser: "/" // Will disable the new account creation screen
    },
})