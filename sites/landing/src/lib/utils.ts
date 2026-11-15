import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** An entrance / reveal delay (globals.css reads `--d`). */
export function delay(ms: number) {
  return { "--d": `${ms}ms` } as React.CSSProperties
}
