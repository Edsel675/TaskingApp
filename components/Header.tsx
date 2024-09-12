import Link from "next/link";
import { Button } from "@/components/ui/button";
import AuthButton from "@/components/AuthButton";

export default function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b">
      <Link href="#" className="flex items-center gap-2" prefetch={false}>
        <CheckIcon className="w-6 h-6 text-primary" />
        <span className="font-medium text-lg">Tasking</span>
      </Link>
      <div className="flex items-center gap-4">
        <Link
          href={"/login"}
          className="text-sm font-medium hover:underline underline-offset-4"
          prefetch={false}
        >
          <AuthButton />
        </Link>
      </div>
    </header>
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
