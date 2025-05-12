import "next-auth";

import "next-auth/jwt"; 

declare module "next-auth" {

    interface Session {
        user: User;
    }
    interface User {
        id: string;
        role: string;
        name: string;
        email: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role: string;

    }
}