"use client"; // Esto indica que es un componente del cliente

import { useEffect, useState } from "react";
import Image from "next/image";
import { collection, getDocs } from "firebase/firestore"; // Firestore
import { db } from "@/lib/firebaseConfig"; // Correctamente configurado con Firestore

export default function Home() {
  const [tasks, setTasks] = useState<any[]>([]); // Estado para las tareas

  // Fetch tasks desde Firestore cuando el componente se monta
  useEffect(() => {
    const fetchTasks = async () => {
      // Asegúrate de que estás usando Firestore y no Realtime Database
      const querySnapshot = await getDocs(collection(db, "tasks"));
      const tasksArray = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTasks(tasksArray);
    };

    fetchTasks();
  }, []);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className="text-4xl font-bold">Bienvenido a TaskingApp Prueba</h1>

        <Image
          className="dark:invert"
          src="https://nextjs.org/icons/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <h2 className="text-2xl font-bold">Task List</h2>

        {/* Lista de tareas */}
        {tasks.length > 0 ? (
          <ul className="list-decimal text-sm font-[family-name:var(--font-geist-mono)]">
            {tasks.map((task) => (
              <li key={task.id} className="mb-2">
                <strong>{task.title}</strong>: {task.description}
              </li>
            ))}
          </ul>
        ) : (
          <p>No tasks available</p>
        )}
      </main>
    </div>
  );
}