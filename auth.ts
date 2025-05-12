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
                    image: profile.avatar_url
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
            if(user){
                token.id = user.id as string;
                token.role = user.role as string;
            }

            if(trigger === 'update' && session){
                token = {...token, ...session};
            }
            
            return token;
        },
        async session({session, token}) {
            session.user.id = token.id;
            session.user.role = token.role;

            return session;
        }
    },
    pages: {
        signIn: "/auth/signin",
        signOut: "/auth/signout",
        error: "/auth/error", // Error code passed in query string as ?error=
        verifyRequest: "/auth/verify-request", // (used for check email message)
        newUser: "/" // Will disable the new account creation screen
    },
})
