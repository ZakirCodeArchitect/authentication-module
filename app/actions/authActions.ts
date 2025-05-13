"use server";

import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { signInSchema } from "@/lib/zod";

const prisma = new PrismaClient();
import { PrismaClient } from "@prisma/client";
import { redirect } from "next/dist/client/components/navigation";

export async function handleCredentialsSignin({ email, password }: {
    email: string,
    password: string
}) {
    try {
        await signIn("credentials", { email, password, redirectTo: "/" });
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return {
                        message: 'Invalid credentials',
                    }
                default:
                    return {
                        message: 'Something went wrong.',
                    }
            }
        }
        throw error;
    }
}

export async function handleCredentialsSignup({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<{ success?: boolean; message?: string }>  {
    const validated = signInSchema.safeParse({ email, password });
    if (!validated.success) {
      return { message: "Invalid input" };
    }
  
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });
  
      if (existingUser) {
        return { message: "User already exists. Please sign in." };
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
        },
      });

      console.log("User created successfully");
      return { success: true };

    } catch (error) {
      return { message: "Signup failed. Please try again." };
    }
  }


export async function handleGithubSignin() {
    await signIn("github", { redirectTo: "/" });
}

export async function handleSignOut() {
    await signOut();
}