import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-zinc-900 flex items-center justify-center">
      <div className="flex flex-col items-center">
        <Loader2 className="h-12 w-12 text-amber-500 animate-spin mb-4" />
        <p className="text-zinc-400">Carregando...</p>
      </div>
    </div>
  )
}

