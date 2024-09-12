"use client";

import { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "@/lib/firebaseConfig";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false); // Alternar entre Login y SignUp
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  // Login con Google
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log("Usuario autenticado:", user);
      router.push("/"); // Redirigir a la página principal después del login
    } catch (error) {
      console.error("Error al autenticar con Google:", error);
      setError("Error al autenticar con Google");
    }
  };

  // Sign Up con email y password
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("User registered:", userCredential.user);
      router.push("/"); // Redirigir a la página principal después del registro
    } catch (error) {
      setError("Error registrando el usuario");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">
          {isSignUp ? "Registrarse" : "Iniciar Sesión"}
        </h1>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {isSignUp ? (
          <form onSubmit={handleSignUp} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border p-2 rounded"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border p-2 rounded"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
            >
              Registrarse
            </button>
          </form>
        ) : (
          <div className="flex flex-col items-center">
            <button
              className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition mb-4 w-full"
              onClick={signInWithGoogle}
            >
              Iniciar sesión con Google
            </button>
          </div>
        )}

        <div className="mt-4 text-center">
          <button
            className="text-blue-500 hover:underline"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp
              ? "¿Ya tienes cuenta? Iniciar sesión"
              : "¿No tienes cuenta? Registrarse"}
          </button>
        </div>
      </div>
    </div>
  );
}