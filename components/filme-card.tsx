"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { Clock, Star, Heart, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface FilmeCardProps {
  id: string
  titulo: string
  capa: string
  avaliacao: number
  duracao: string
  ano: number
  descricao: string
  onClick: () => void
  children?: React.ReactNode
}

const favoritarAPI = async (filmeId: string, favoritar: boolean): Promise<{ success: boolean }> => {
  const response = await fetch(`http://localhost:5129/api/movies/${filmeId}/favorite`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ favorited: favoritar }),
  })

  if (!response.ok) {
    throw new Error('Falha ao favoritar filme')
  }

  return { success: true }
}

export default function FilmeCard({
  id,
  titulo,
  capa,
  avaliacao,
  duracao,
  ano,
  descricao,
  onClick,
  children,
}: FilmeCardProps) {
  const [favorito, setFavorito] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFavoritar = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isLoading) return

    setIsLoading(true)
    setError(null)

    try {
      await favoritarAPI(id, !favorito)
      setFavorito(!favorito)
    } catch (err) {
      setError("Não foi possível atualizar favoritos")
      console.error("Erro ao favoritar:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-lg transition-all hover:scale-105 hover:shadow-xl cursor-pointer",
      )}
    >
      <div className="aspect-[2/3] w-full relative">
        <Image
          src={capa || "/placeholder.svg"}
          alt={titulo}
          fill
          className="object-cover transition-transform group-hover:scale-110"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
          {descricao && <p className="text-zinc-200 text-xs mb-1 line-clamp-2">{descricao}</p>}
          <h3 className="font-bold text-white line-clamp-2">{titulo}</h3>
          <p className="text-zinc-300 text-sm">{ano}</p>
        </div>
      </div>

      <div className="absolute top-2 left-2 right-2 flex justify-between items-center">
        <div className="flex items-center gap-1 bg-black/70 text-amber-500 text-sm font-medium px-2 py-1 rounded-md">
          <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
          <span>{avaliacao.toFixed(1)}</span>
        </div>

        <div className="flex items-center gap-1 bg-black/70 text-white text-sm px-2 py-1 rounded-md">
          <Clock className="h-3.5 w-3.5" />
          <span>{duracao}</span>
        </div>
      </div>


      {/* <button
        onClick={handleFavoritar}
        disabled={isLoading}
        className={`absolute bottom-2 right-2 z-10 p-2 rounded-full transition-all ${
          favorito
            ? "bg-white/10 text-red-500 opacity-100 hover:bg-white/20"
            : "bg-black/70 text-white opacity-0 group-hover:opacity-100 hover:bg-black/80"
        } ${error ? "bg-red-900/50" : ""} ${isLoading ? "cursor-wait" : ""}`}
        aria-label={favorito ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Heart
            className={`h-5 w-5 transition-all ${
              favorito ? "fill-red-500 stroke-red-500 scale-110" : "stroke-current hover:scale-110"
            }`}
          />
        )}
      </button> */}

      {/* Mensagem de erro (opcional) */}
      {error && (
        <div className="absolute bottom-12 right-2 bg-red-500 text-white text-xs py-1 px-2 rounded opacity-0 animate-fade-in">
          {error}
        </div>
      )}
    </div>
  )
}

