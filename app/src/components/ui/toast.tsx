import * as React from "react"
import { useToast } from "./use-toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm">
      {toasts.map(function ({ id, title, description, variant }) {
        return (
          <div
            key={id}
            className={`p-4 rounded-lg shadow-lg border text-sm transition-all ${
              variant === "destructive"
                ? "bg-red-900 border-red-700 text-red-100"
                : "bg-zinc-900 border-zinc-800 text-zinc-100"
            }`}
          >
            {title && <div className="font-semibold mb-1">{title}</div>}
            {description && <div className="text-zinc-400 text-xs">{description}</div>}
          </div>
        )
      })}
    </div>
  )
}