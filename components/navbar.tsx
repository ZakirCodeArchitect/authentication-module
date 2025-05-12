// "use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

// import { handleSignOut } from "@/app/actions/authActions";

import { auth } from "@/auth";  // for server-side authentication
import { useSession } from "next-auth/react";   // for client-side session management
import { handleSignOut } from "@/app/actions/authActions";

export default async function Navbar() {
    
    const session = await auth();  // for server-side authentication

    // for client-side session management
    // const { data: session } = useSession();
    // console.log("session", session);

    console.log({ session });
    return (
        <nav className="flex justify-between items-center py-3 px-4 bg-white shadow-md">
        <Link href="/" className="text-xl font-bold">
            Auth.js
        </Link>
        {!session ? (
            <Link href="/auth/signin">
            <Button variant="default">Sign In</Button>
            </Link>
        ) : ( 
            <form action={handleSignOut}>
            <Button variant="default" type="submit">
                Sign Out
            </Button>
            </form>
        )}
        </nav>
    );
}