// components/AuthButton.js
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebaseConfig";
import { Button } from "@/components/ui/button";

const AuthButton = () => {
  const [user, setUser] = useState(null);

  // Check for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in
        setUser(user);
      } else {
        // User is signed out
        setUser(null);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div>
      {user ? (
        <div className="flex items-center space-x-4">
          <span>Hello, {user.displayName || user.email}!</span>
          <Button onClick={handleLogout}>Logout</Button>
        </div>
      ) : (
        <Link href="/login" passHref>
          <Button>Login</Button>
        </Link>
      )}
    </div>
  );
};

export default AuthButton;
