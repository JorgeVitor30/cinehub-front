"use client"

import { useEffect, useState } from "react"
import FilmeCard from "./filme-card"
import FilmeModal, { type FilmeDetalhado } from "./filme-modal"
import { movieService, type Movie, extractValue } from "@/app/services/movieService"
import Image from "next/image"

interface FilmesGridProps {
  categoria: "trending" | "new" | "classics"
}

export default function FilmesGrid({ categoria }: FilmesGridProps) {
  const [filmes, setFilmes] = useState<Movie[]>([])
  const [filmeAberto, setFilmeAberto] = useState<FilmeDetalhado | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFilmes = async () => {
      try {
        setLoading(true)
        const data = await movieService.getHomeMovies()

        let filmesDaCategoria: Movie[] = []
        switch (categoria) {
          case "trending":
            filmesDaCategoria = data.popularMovies || []
            break
          case "new":
            filmesDaCategoria = data.newReleaseMovies || []
            break
          case "classics":
            filmesDaCategoria = data.classicMovies || []
            break
        }

        setFilmes(filmesDaCategoria)
      } catch (err) {
        console.error("Erro detalhado:", err)
        setError(err instanceof Error ? err.message : "Erro ao carregar filmes")
      } finally {
        setLoading(false)
      }
    }

    fetchFilmes()
  }, [categoria])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto mb-2"></div>
          <p>Carregando filmes...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        <p>Erro: {error}</p>
      </div>
    )
  }

  if (!filmes?.length) {
    return (
      <div className="text-center p-4">
        <p>Nenhum filme encontrado para esta categoria.</p>
      </div>
    )
  }

  const handleOpenFilme = (filme: Movie) => {
    const filmeDetalhado: FilmeDetalhado = {
      id: filme.id,
      titulo: filme.title,
      capa: filme.posterPhotoUrl,
      banner: filme.backPhotoUrl,
      descricao: filme.overview,
      avaliacao: extractValue(filme.voteAverage),
      duracao: `${Math.floor(filme.runTime / 60)}h ${filme.runTime % 60}m`,
      ano: new Date(filme.releaseDate).getFullYear(),
      generos: filme.genres.split(", "),
      lingua: filme.originalLanguage,
      orcamento: extractValue(filme.budget) > 0 ? `$${extractValue(filme.budget).toLocaleString()}` : "Não informado",
      producoes: filme.productions.split(", ").map(nome => ({ nome })),
      keywords: filme.keyWords.split(", ")
    }
    setFilmeAberto(filmeDetalhado)
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
      {filmes.map((filme) => (
        <FilmeCard
          key={filme.id}
          id={filme.id}
          titulo={filme.title}
          capa={filme.posterPhotoUrl}
          avaliacao={extractValue(filme.voteAverage)}
          duracao={`${Math.floor(filme.runTime / 60)}h ${filme.runTime % 60}m`}
          ano={new Date(filme.releaseDate).getFullYear()}
          descricao={filme.overview}
          onClick={() => handleOpenFilme(filme)}
        >
          <Image
            src={filme.posterPhotoUrl || "/placeholder.svg"}
            alt={filme.title}
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg"
            }}
          />
        </FilmeCard>
      ))}

      {filmeAberto && (
        <FilmeModal
          filme={filmeAberto}
          aberto={!!filmeAberto}
          onClose={() => setFilmeAberto(null)}
        />
      )}
    </div>
  )
}