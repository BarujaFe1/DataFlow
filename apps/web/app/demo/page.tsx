"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DemoPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/?demo=true");
  }, [router]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center font-sans">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm text-text-secondary font-medium animate-pulse">
          Inicializando ambiente de demonstração DataFlow...
        </span>
      </div>
    </div>
  );
}
