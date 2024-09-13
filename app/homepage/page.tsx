"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Pencil,
  Type,
  Trash,
  ChevronRight,
  Folder,
  Save,
  X,
  Edit,
  FileText,
} from "lucide-react";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  setDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import Weather from "@/components/Weather";
import Header from "@/components/Header";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebaseConfig";
import { User } from "firebase/auth";

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter(); // Inicializar useRouter para navegación

  const [tasks, setTasks] = useState<any[]>([]);
  const [mode, setMode] = useState("view");
  const [newNote, setNewNote] = useState("");
  const [newTaskTimer, setNewTaskTimer] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [drawings, setDrawings] = useState<
    { id: string; strokes: string[]; x: number; y: number; viewBox: string }[]
  >([]);
  const [textBoxes, setTextBoxes] = useState<
    { id: string; content: string; x: number; y: number }[]
  >([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStrokes, setCurrentStrokes] = useState<
    { x: number; y: number }[][]
  >([]);
  const [editingDrawing, setEditingDrawing] = useState<string | null>(null);

  const DRAWING_SIZE = 150;

  const handleTimeChange = (newTime: Date) => {
    console.log("handleTimeChange called", newTime);
    setCurrentTime(newTime);
    checkTimers(newTime);
  };

  const Clock = ({ onTimeChange }: { onTimeChange: (time: Date) => void }) => {
    const [time, setTime] = useState<Date | null>(null);

    useEffect(() => {
      const timer = setInterval(() => {
        const newTime = new Date();
        setTime(newTime);
        handleTimeChange(newTime);
      }, 1000);

      return () => clearInterval(timer);
    }, [onTimeChange]);

    if (time === null) return null; // Don't render anything on the server side

    return (
      <div className="fixed bottom-4 left-4 text-lg font-bold">
        {time.toLocaleTimeString()}
      </div>
    );
  };

  const fetchTasks = async () => {
    const querySnapshot = await getDocs(collection(db, "tasks"));
    const tasksArray = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      timer: doc.data().timer ? new Date(doc.data().timer) : null,
    }));
    setTasks(tasksArray);
  };

  const fetchDrawings = async () => {
    const querySnapshot = await getDocs(collection(db, "drawings"));
    const drawingsArray = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      strokes: doc.data().strokes || [], // Ensure strokes is an array
      x: doc.data().x || 0, // Default value for x
      y: doc.data().y || 0, // Default value for y
      viewBox: doc.data().viewBox || "0 0 100 100", // Default viewBox
    }));
    setDrawings(drawingsArray);
  };

  const handleTextClick = () => {
    if (workspaceRef.current) {
      const workspaceRect = workspaceRef.current.getBoundingClientRect();
      const newTextBox = {
        id: Date.now().toString(),
        content: "New text",
        x: Math.floor(Math.random() * (workspaceRect.width - 200)),
        y: Math.floor(Math.random() * (workspaceRect.height - 100)),
      };
      setTextBoxes((prev) => [...prev, newTextBox]);
    }
  };
  const handlePencilClick = () => {
    setMode("draw");
    setEditingDrawing(null);
  };

  const handleNotepadClick = () => setMode("write");

  const updateTextBox = async (id: string, newContent: string) => {
    setTextBoxes((prev) =>
      prev.map((box) => (box.id === id ? { ...box, content: newContent } : box))
    );
    try {
      await setDoc(doc(db, "textBoxes", id), { content: newContent });
    } catch (error) {
      console.error("Error updating text box: ", error);
    }
  };

  const moveTextBox = async (id: string, dx: number, dy: number) => {
    const updatedTextBoxes = textBoxes.map((box) =>
      box.id === id
        ? {
            ...box,
            x: Math.max(
              0,
              Math.min(box.x + dx, workspaceRef.current!.clientWidth - 200)
            ),
            y: Math.max(
              0,
              Math.min(box.y + dy, workspaceRef.current!.clientHeight - 100)
            ),
          }
        : box
    );
    setTextBoxes(updatedTextBoxes);

    const boxToUpdate = updatedTextBoxes.find((b) => b.id === id);
    if (boxToUpdate) {
      try {
        await setDoc(doc(db, "textBoxes", id), boxToUpdate);
      } catch (error) {
        console.error("Error updating text box position: ", error);
      }
    }
  };

  const deleteTextBox = async (id: string) => {
    try {
      await deleteDoc(doc(db, "textBoxes", id));
      setTextBoxes((prev) => prev.filter((box) => box.id !== id));
    } catch (error) {
      console.error("Error deleting text box: ", error);
    }
  };

  const fetchTextBoxes = async () => {
    const querySnapshot = await getDocs(collection(db, "textBoxes"));
    const textBoxesArray: {
      id: string;
      content: string;
      x: number;
      y: number;
    }[] = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        content: data.content || "", // Provide a default value if content is missing
        x: data.x || 0, // Provide a default value if x is missing
        y: data.y || 0, // Provide a default value if y is missing
      };
    });
    setTextBoxes(textBoxesArray);
  };

  const handleNoteSubmit = async () => {
    if (newNote.trim()) {
      try {
        const timerDate = newTaskTimer ? new Date(newTaskTimer) : null;
        await addDoc(collection(db, "tasks"), {
          title: newNote.split("\n")[0] || "New Note",
          description: newNote,
          createdAt: new Date(),
          timer: timerDate ? timerDate.toISOString() : null,
          timerExpired: false,
        });
        setNewNote("");
        setNewTaskTimer("");
        setMode("view");
        fetchTasks();
      } catch (error) {
        console.error("Error adding document: ", error);
      }
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteDoc(doc(db, "tasks", taskId));
      fetchTasks();
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };

  const checkTimers = (currentTime: Date) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (
          task.timer &&
          currentTime >= new Date(task.timer) &&
          !task.timerExpired
        ) {
          playAlertSound();
          updateTaskTimerExpired(task.id);
          return { ...task, timerExpired: true };
        }
        return task;
      })
    );
  };

  const playAlertSound = () => {
    const audio = new Audio("/alarm.mp3");
    audio.play().catch((error) => console.error("Error playing sound:", error));
  };

  const updateTaskTimerExpired = async (taskId: string) => {
    try {
      await setDoc(
        doc(db, "tasks", taskId),
        { timerExpired: true },
        { merge: true }
      );
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, timerExpired: true } : task
        )
      );
    } catch (error) {
      console.error("Error updating task timer status: ", error);
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      setCurrentStrokes((prev) => [
        ...prev,
        [{ x: e.clientX - rect.left, y: e.clientY - rect.top }],
      ]);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const newPoint = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      setCurrentStrokes((prev) => {
        const newStrokes = [...prev];
        newStrokes[newStrokes.length - 1].push(newPoint);
        return newStrokes;
      });

      const ctx = canvas.getContext("2d");
      if (ctx) {
        const currentStroke = currentStrokes[currentStrokes.length - 1];
        const prevPoint = currentStroke[currentStroke.length - 1];
        ctx.beginPath();
        ctx.moveTo(prevPoint.x, prevPoint.y);
        ctx.lineTo(newPoint.x, newPoint.y);
        ctx.stroke();
      }
    }
  };

  const endDrawing = () => {
    setIsDrawing(false);
  };

  const saveDrawing = async () => {
    if (currentStrokes.length > 0 && workspaceRef.current) {
      const workspaceRect = workspaceRef.current.getBoundingClientRect();
      const maxX = workspaceRect.width - DRAWING_SIZE;
      const maxY = workspaceRect.height - DRAWING_SIZE;

      // Calculate the bounding box of the entire drawing
      const allPoints = currentStrokes.flat();
      const xValues = allPoints.map((p) => p.x);
      const yValues = allPoints.map((p) => p.y);
      const minX = Math.min(...xValues);
      const maxDrawingX = Math.max(...xValues);
      const minY = Math.min(...yValues);
      const maxDrawingY = Math.max(...yValues);
      const drawingWidth = maxDrawingX - minX;
      const drawingHeight = maxDrawingY - minY;

      // Scale the drawing to fit within the frame
      const scale = Math.min(
        DRAWING_SIZE / drawingWidth,
        DRAWING_SIZE / drawingHeight
      );
      const scaledStrokes = currentStrokes.map((stroke) =>
        stroke.map((p) => ({
          x: (p.x - minX) * scale,
          y: (p.y - minY) * scale,
        }))
      );

      const newDrawing = {
        strokes: scaledStrokes.map((stroke) =>
          stroke.map((p) => `${p.x},${p.y}`).join(" ")
        ),
        x: Math.floor(Math.random() * maxX),
        y: Math.floor(Math.random() * maxY),
        viewBox: `0 0 ${DRAWING_SIZE} ${DRAWING_SIZE}`,
      };

      try {
        if (editingDrawing) {
          await setDoc(doc(db, "drawings", editingDrawing), newDrawing);
          setDrawings((prevDrawings) =>
            prevDrawings.map((d) =>
              d.id === editingDrawing
                ? { ...newDrawing, id: editingDrawing }
                : d
            )
          );
        } else {
          const docRef = await addDoc(collection(db, "drawings"), newDrawing);
          setDrawings((prevDrawings) => [
            ...prevDrawings,
            { ...newDrawing, id: docRef.id },
          ]);
        }
        setCurrentStrokes([]);
        setEditingDrawing(null);
        setMode("view");
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
          }
        }
      } catch (error) {
        console.error("Error saving drawing: ", error);
      }
    }
  };

  const moveDrawing = async (id: string, dx: number, dy: number) => {
    const updatedDrawings = drawings.map((drawing) =>
      drawing.id === id
        ? {
            ...drawing,
            x: Math.max(
              0,
              Math.min(
                drawing.x + dx,
                workspaceRef.current!.clientWidth - DRAWING_SIZE
              )
            ),
            y: Math.max(
              0,
              Math.min(
                drawing.y + dy,
                workspaceRef.current!.clientHeight - DRAWING_SIZE
              )
            ),
          }
        : drawing
    );
    setDrawings(updatedDrawings);

    const drawingToUpdate = updatedDrawings.find((d) => d.id === id);
    if (drawingToUpdate) {
      try {
        await setDoc(doc(db, "drawings", id), drawingToUpdate);
      } catch (error) {
        console.error("Error updating drawing position: ", error);
      }
    }
  };

  const editDrawing = (id: string) => {
    const drawingToEdit = drawings.find((d) => d.id === id);
    if (drawingToEdit) {
      setEditingDrawing(id);
      setMode("draw");
      setCurrentStrokes(
        drawingToEdit.strokes.map((stroke) =>
          stroke.split(" ").map((point) => {
            const [x, y] = point.split(",");
            return { x: parseFloat(x), y: parseFloat(y) };
          })
        )
      );
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          drawingToEdit.strokes.forEach((strokePath) => {
            ctx.beginPath();
            strokePath.split(" ").forEach((p, i) => {
              const [x, y] = p.split(",");
              if (i === 0) ctx.moveTo(parseFloat(x), parseFloat(y));
              else ctx.lineTo(parseFloat(x), parseFloat(y));
            });
            ctx.stroke();
          });
        }
      }
    }
  };

  const deleteDrawing = async (id: string) => {
    try {
      await deleteDoc(doc(db, "drawings", id));
      setDrawings((prevDrawings) => prevDrawings.filter((d) => d.id !== id));
    } catch (error) {
      console.error("Error deleting drawing: ", error);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchDrawings();
    fetchTextBoxes();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (!user) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <Header />
      <div className="flex h-screen bg-background text-foreground font-sans">
        {/* Tools Panel */}
        <div className="w-20 bg-secondary p-4 flex flex-col items-center space-y-6">
          <h2 className="text-sm font-bold mb-4">tools</h2>
          <Type
            size={24}
            onClick={handleTextClick}
            className="cursor-pointer"
          />
          <FileText
            size={24}
            onClick={handleNotepadClick}
            className="cursor-pointer"
          />
          <Pencil
            size={24}
            onClick={handlePencilClick}
            className="cursor-pointer"
          />
          {/* OpenWeatherMap API usage*/}
          <Weather city="Monterrey" />
        </div>

        {/* Workspace */}
        <div
          ref={workspaceRef}
          className="flex-grow bg-muted p-6 relative overflow-hidden"
        >
          <h2 className="text-sm font-bold absolute top-4 left-1/2 transform -translate-x-1/2">
            workspace
          </h2>
          {mode === "write" && (
            <div className="mt-12 flex flex-col items-center">
              <textarea
                className="w-full h-64 p-2 bg-card rounded shadow"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Write your note here..."
              />
              <button
                className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded"
                onClick={handleNoteSubmit}
              >
                Save Note
              </button>
            </div>
          )}
          {mode === "draw" && (
            <div className="mt-12">
              <canvas
                ref={canvasRef}
                width={800}
                height={600}
                className="border border-gray-300"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={endDrawing}
                onMouseLeave={endDrawing}
              />
              <button
                className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded"
                onClick={saveDrawing}
              >
                {editingDrawing ? "Update Drawing" : "Save Drawing"}
              </button>
            </div>
          )}
          {mode === "view" && (
            <div className="mt-12">
              {drawings.map((drawing) => (
                <div
                  key={drawing.id}
                  style={{
                    position: "absolute",
                    left: drawing.x,
                    top: drawing.y,
                    width: `${DRAWING_SIZE}px`,
                    height: `${DRAWING_SIZE}px`,
                    border: "2px solid #000",
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                    cursor: "move",
                  }}
                >
                  <svg
                    width={DRAWING_SIZE}
                    height={DRAWING_SIZE}
                    viewBox={drawing.viewBox}
                    onMouseDown={(e) => {
                      const startX = e.clientX;
                      const startY = e.clientY;
                      const moveHandler = (e: MouseEvent) => {
                        moveDrawing(
                          drawing.id,
                          e.clientX - startX,
                          e.clientY - startY
                        );
                      };
                      const upHandler = () => {
                        document.removeEventListener("mousemove", moveHandler);
                        document.removeEventListener("mouseup", upHandler);
                      };
                      document.addEventListener("mousemove", moveHandler);
                      document.addEventListener("mouseup", upHandler);
                    }}
                  >
                    {drawing.strokes.map((stroke, index) => (
                      <path
                        key={index}
                        d={`M ${stroke}`}
                        fill="none"
                        stroke="black"
                        strokeWidth="2"
                      />
                    ))}
                  </svg>
                  <div className="absolute bottom-0 left-0 right-0 flex justify-center p-1 bg-opacity-50 bg-white">
                    <button
                      onClick={() => editDrawing(drawing.id)}
                      className="mr-2"
                    >
                      <Edit size={16} />
                    </button>
                    <button onClick={() => deleteDrawing(drawing.id)}>
                      <Trash size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {textBoxes.map((box) => (
                <div
                  key={box.id}
                  style={{
                    position: "absolute",
                    left: box.x,
                    top: box.y,
                    minWidth: "200px",
                    minHeight: "100px",
                    padding: "10px",
                    border: "1px solid #000",
                    backgroundColor: "white",
                    cursor: "move",
                  }}
                  onMouseDown={(e) => {
                    const startX = e.clientX;
                    const startY = e.clientY;
                    const moveHandler = (e: MouseEvent) => {
                      moveTextBox(
                        box.id,
                        e.clientX - startX,
                        e.clientY - startY
                      );
                    };
                    const upHandler = () => {
                      document.removeEventListener("mousemove", moveHandler);
                      document.removeEventListener("mouseup", upHandler);
                    };
                    document.addEventListener("mousemove", moveHandler);
                    document.addEventListener("mouseup", upHandler);
                  }}
                >
                  <textarea
                    value={box.content}
                    onChange={(e) => updateTextBox(box.id, e.target.value)}
                    className="w-full h-full border-none resize-none focus:outline-none"
                  />
                  <button
                    onClick={() => deleteTextBox(box.id)}
                    className="absolute top-0 right-0 p-1 text-destructive hover:text-destructive-foreground"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tasks Panel */}
        <div className="w-64 bg-secondary p-4 overflow-y-auto">
          <h2 className="text-sm font-bold mb-4">tasks</h2>
          <div className="space-y-4">
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-2 rounded flex flex-col ${
                    task.timerExpired ? "bg-red-500" : "bg-card"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold">{task.title}</span>
                      <br />
                      {task.description}
                    </div>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-destructive hover:text-destructive-foreground"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  {task.timer && (
                    <div className="mt-2 text-sm">
                      {/* Remove the size prop if it's not supported */}
                      <Clock onTimeChange={handleTimeChange} />
                      {new Date(task.timer).toLocaleString()}
                      {task.timerExpired && (
                        <span className="ml-2 text-white font-bold">
                          {/* Additional content */}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p>No tasks available</p>
            )}
          </div>
        </div>

        {/* Add Task Modal */}
        {mode === "write" && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-background p-6 rounded-lg w-96">
              <h3 className="text-lg font-bold mb-4">Add New Task</h3>
              <textarea
                className="w-full h-32 p-2 bg-card rounded shadow mb-4"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Write your task here..."
              />
              <input
                type="datetime-local"
                className="w-full p-2 bg-card rounded shadow mb-4"
                value={newTaskTimer}
                onChange={(e) => setNewTaskTimer(e.target.value)}
              />
              <div className="flex justify-end">
                <button
                  className="px-4 py-2 bg-secondary text-secondary-foreground rounded mr-2"
                  onClick={() => setMode("view")}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-primary text-primary-foreground rounded"
                  onClick={handleNoteSubmit}
                >
                  Save Task
                </button>
              </div>
            </div>
          </div>
        )}
        <Clock onTimeChange={handleTimeChange || (() => {})} />
      </div>
    </div>
  );
}
