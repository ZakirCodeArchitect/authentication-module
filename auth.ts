import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { signInSchema } from "./lib/zod";
import { error } from "console";
import GitHub from "next-auth/providers/github";

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
            credentials: {
                email: { label: "Email", type: "text", placeholder: "email" },
                password: { label: "Password", type: "password", placeholder: "password" }
            },
            async authorize(credentials) {
                const parsedCredentials = signInSchema.safeParse(credentials);
              
                if (!parsedCredentials.success) {
                  console.log("❌ Invalid credentials format:", parsedCredentials.error.errors);
                  return null;
                }
              
                const { email, password } = parsedCredentials.data;
              
                // ✅ Only assign user if credentials match
                if (email === "zakir@gmail.com" && password === "zakir123") {
                  const user = {
                    id: 1,
                    name: "zakir",
                    email,
                    role: "user",
                    password
                  };
              
                  console.log("✅ User found");
                  return user;
                }
              
                console.log("❌ Invalid email or password");
                return null; // ⛔ Deny login
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
    secret: process.env.AUTH_SECRET,
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
