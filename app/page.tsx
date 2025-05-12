"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useState } from "react";

export default function Home() {

  const [newName, setNewName] = useState("");

  const {data: session, status, update} = useSession();
  const user = session?.user;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <Card className="max-w-sm">
        <CardHeader>
          <Image
            className="rounded-lg"
            src={"https://images.pexels.com/photos/1374510/pexels-photo-1374510.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"}
            alt="img"
            width={500}
            height={500}
            priority
          />
        </CardHeader>
        <CardContent>
          <CardTitle className="mb-2 text-2xl font-bold">
            Welcome, {user?.name || "Guest"}!

            <label>Update Name</label>
            <input
              type="text"
              className="border border-gray-300 rounded-md p-2"
              placeholder="Enter your name"
              value={newName} 
              onChange={(e) => setNewName(e.target.value)}
            />
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-md mt-2"
              onClick={() => {
                if (user) {update({
                  ...user,
                  name: newName,
                })}
              }}
              >
              Update Name
            </button>
          </CardTitle>
          <p className="text-muted-foreground">
            {user?.email || "Please log in to see your profile."}
          </p>
        </CardContent>
      </Card>
    </main>
  );
}