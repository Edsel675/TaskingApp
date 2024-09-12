"use client";
import { useState } from "react";
import { 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from "firebase/auth";
import { auth, provider, db } from "@/lib/firebaseConfig";  // Importa tu configuración de Firebase
import { useRouter } from "next/navigation";
import { doc, setDoc } from "firebase/firestore";  // Para almacenar los usuarios en Firestore
import { getAdditionalUserInfo } from "firebase/auth";  // Importa para obtener la información adicional del usuario

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);  // Alternar entre inicio de sesión y registro
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");  // Agregar nombre de usuario en el formulario de registro
  const [error, setError] = useState("");
  const router = useRouter();

  // Login con Google
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const additionalUserInfo = getAdditionalUserInfo(result); // Aquí obtienes la información adicional

      console.log("Usuario autenticado:", user);

      // Si el usuario es nuevo, agregamos su información a Firestore
      if (additionalUserInfo?.isNewUser) {
        await setDoc(doc(db, "users", user.uid), {
          name: user.displayName || "Nuevo usuario",
          email: user.email,
          createdAt: new Date(),
        });
      }

      router.push("/"); // Redirigir a la página principal después del login
    } catch (error) {
      console.error("Error al autenticar con Google:", error);
      setError("Error al autenticar con Google");
    }
  };

  // Función para registro con email y password
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Agregar el usuario a Firestore
      await setDoc(doc(db, "users", user.uid), {
        name,
        email: user.email,
        createdAt: new Date(),
      });

      console.log("Usuario registrado:", user);
      router.push("/");  // Redirigir a la página principal después del registro
    } catch (error) {
      console.error("Error registrando el usuario:", error);
      setError("Error registrando el usuario");
    }
  };

  // Función para iniciar sesión con email y password
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("Usuario inició sesión:", user);
      router.push("/");  // Redirigir a la página principal después del inicio de sesión
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      setError("Error al iniciar sesión");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">Bienvenido</h1>
        {error && <p className="text-red-500 mb-4">Error: {error}</p>}
        <div className="flex justify-center mb-4">
          <button
            onClick={() => setIsSignUp(false)}
            className={`mr-2 ${!isSignUp ? "font-bold" : ""}`}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => setIsSignUp(true)}
            className={`${isSignUp ? "font-bold" : ""}`}
          >
            Registrarse
          </button>
        </div>

        {isSignUp ? (
          <form onSubmit={handleSignUp} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border p-2 rounded"
              required
            />
            <input
              type="email"
              placeholder="Correo Electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border p-2 rounded"
              required
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border p-2 rounded"
              required
            />
            <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition">
              Registrarse
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignIn} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Correo Electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border p-2 rounded"
              required
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border p-2 rounded"
              required
            />
            <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition">
              Iniciar sesión
            </button>
          </form>
        )}

        <div className="mt-4 text-center">
          <p className="mb-2">o</p>
          <button
            onClick={signInWithGoogle}
            className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition"
          >
            Iniciar sesión con Google
          </button>
        </div>
      </div>
    </div>
  );
}