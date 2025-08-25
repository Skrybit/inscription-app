import { cn } from "@/lib/utils";

interface SpinnerProps {
  className?: string;
}

export function Spinner({ className }: SpinnerProps) {
  return (
    <div
      className={cn(
        "animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full",
        className
      )}
    />
  );
}