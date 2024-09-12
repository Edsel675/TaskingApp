import Link from "next/link";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";

export default function LandingPage() {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 sm:px-8 md:px-12 lg:px-16">
        <div className="max-w-3xl text-center space-y-4">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Stay on top of your tasks with our powerful app
          </h1>
          <p className="text-muted-foreground text-lg">
            Our task manager app helps you organize your work, stay focused, and
            achieve your goals. With a clean, intuitive interface and powerful
            features, it's the perfect tool to boost your productivity.
          </p>
          <div className="flex justify-center gap-4">
            <Link href={"/homepage"}>
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
        <div className="mt-12 w-full max-w-4xl">
          <img
            src="/thephoto.png"
            width="1200"
            height="675"
            alt="Task Manager App"
            className="rounded-xl shadow-lg"
            style={{ aspectRatio: "1200/675", objectFit: "cover" }}
          />
        </div>
      </main>
      <footer className="flex items-center justify-between px-6 py-4 border-t">
        <p className="text-sm text-muted-foreground">
          &copy; 2024 Tasking. All rights reserved.
        </p>
        <nav className="flex items-center gap-4">
          <Link
            href="#"
            className="text-sm font-medium hover:underline underline-offset-4"
            prefetch={false}
          >
            Privacy
          </Link>
          <Link
            href="#"
            className="text-sm font-medium hover:underline underline-offset-4"
            prefetch={false}
          >
            Terms
          </Link>
          <Link
            href="#"
            className="text-sm font-medium hover:underline underline-offset-4"
            prefetch={false}
          >
            Contact
          </Link>
        </nav>
      </footer>
    </div>
  );
}

function CheckIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
