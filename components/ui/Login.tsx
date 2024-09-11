"use client";

import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "@/lib/firebaseConfig"; // Ruta correcta de tu config de Firebase
import { useRouter } from "next/navigation"; // Para redirigir después del login

const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    console.log("Usuario autenticado:", user);
  } catch (error) {
    console.error("Error al autenticar con Google:", error);
  }
};

export default function Login() {
  const router = useRouter(); // Para redirigir después de iniciar sesión

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-6">Iniciar Sesión con Google</h1>
      <button
        className="bg-blue-500 text-white p-2 rounded"
        onClick={async () => {
          await signInWithGoogle();
          router.push("/"); // Redirigir a la página principal una vez autenticado
        }}
      >
        Iniciar sesión con Google
      </button>
    </div>
  );
}