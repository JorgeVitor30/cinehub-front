"use client"

import { useState, useEffect } from "react"
import Navbar from "@/components/navbar"
import FilmeCard from "@/components/filme-card"
import FilmeModal, { type FilmeDetalhado } from "@/components/filme-modal"
import { Button } from "@/components/ui/button"
import { movieService, type Movie } from "@/app/services/movieService"
import React from "react"


// Dados simulados para demonstração - combinando todas as categorias
const todosFilmes: FilmeDetalhado[] = []

// Extrair todos os gêneros únicos para os filtros
const todosGeneros = Array.from(new Set(todosFilmes.flatMap((filme) => filme.generos))).sort()

// Número de filmes por página
const FILMES_POR_PAGINA = 10

export default function FilmesPage() {
  const [filmes, setFilmes] = useState<Movie[]>([])
  const [filmesFiltrados, setFilmesFiltrados] = useState<Movie[]>([])
  const [filmeAberto, setFilmeAberto] = useState<FilmeDetalhado | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [termoBusca, setTermoBusca] = useState("")
  const [generosSelecionados, setGenerosSelecionados] = useState<string[]>([])
  const [avaliacaoMinima, setAvaliacaoMinima] = useState(0)
  const [anoInicio, setAnoInicio] = useState(1970)
  const [anoFim, setAnoFim] = useState(2024)
  const [ordenarPor, setOrdenarPor] = useState<"recentes" | "avaliacao" | "titulo">("recentes")
  const [paginaAtual, setPaginaAtual] = useState(1)

  // Buscar filmes da API
  useEffect(() => {
    const fetchFilmes = async () => {
      try {
        setLoading(true)
        const data: Movie[] = await movieService.getAllMoviesPage()
        // Garante que data é um array
        const filmesArray = Array.isArray(data.content) ? data.content : []
        setFilmes(filmesArray)
        setFilmesFiltrados(filmesArray)
      } catch (err) {
        console.error("Erro ao carregar filmes:", err)
        setError(err instanceof Error ? err.message : "Erro ao carregar filmes")
        setFilmes([])
        setFilmesFiltrados([])
      } finally {
        setLoading(false)
      }
    }

    fetchFilmes()
  }, [])

  // Extrair gêneros únicos dos filmes carregados de forma segura
  const todosGeneros = React.useMemo(() => {
    if (!filmes || !Array.isArray(filmes)) return []
    
    return Array.from(
      new Set(
        filmes
          .filter(filme => filme && filme.genres)
          .flatMap(filme => filme.genres.split(", "))
          .filter(Boolean)
      )
    ).sort()
  }, [filmes])

  // Aplicar filtros e ordenação de forma segura
  useEffect(() => {
    if (!filmes || !Array.isArray(filmes)) {
      setFilmesFiltrados([])
      return
    }

    let resultado = [...filmes]

    // Filtrar por termo de busca
    if (termoBusca) {
      resultado = resultado.filter(
        (filme) =>
          filme?.title?.toLowerCase().includes(termoBusca.toLowerCase()) ||
          filme?.overview?.toLowerCase().includes(termoBusca.toLowerCase())
      )
    }

    // Filtrar por gêneros
    if (generosSelecionados.length > 0) {
      resultado = resultado.filter((filme) =>
        generosSelecionados.some((genero) => filme?.genres?.includes(genero))
      )
    }

    // Filtrar por avaliação mínima
    if (avaliacaoMinima > 0) {
      resultado = resultado.filter((filme) => filme.voteAverage >= avaliacaoMinima)
    }

    // Filtrar por intervalo de anos
    resultado = resultado.filter((filme) => {
      const ano = new Date(filme.releaseDate).getFullYear()
      return ano >= anoInicio && ano <= anoFim
    })

    // Ordenar resultados
    switch (ordenarPor) {
      case "recentes":
        resultado.sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime())
        break
      case "avaliacao":
        resultado.sort((a, b) => b.voteAverage - a.voteAverage)
        break
      case "titulo":
        resultado.sort((a, b) => a.title.localeCompare(b.title))
        break
    }

    setFilmesFiltrados(resultado)
    setPaginaAtual(1)
  }, [termoBusca, generosSelecionados, avaliacaoMinima, anoInicio, anoFim, ordenarPor, filmes])

  // Calcular filmes da página atual
  const FILMES_POR_PAGINA = 10
  const totalPaginas = Math.ceil(filmesFiltrados.length / FILMES_POR_PAGINA)
  const filmesPaginaAtual = filmesFiltrados.slice(
    (paginaAtual - 1) * FILMES_POR_PAGINA,
    paginaAtual * FILMES_POR_PAGINA
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-zinc-900 text-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto mb-2"></div>
            <p>Carregando filmes...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-zinc-900 text-white">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-red-500 p-4">
            <p>Erro: {error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4"
            >
              Tentar novamente
            </Button>
          </div>
        </div>
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
      avaliacao: filme.voteAverage,
      duracao: `${Math.floor(filme.runTime / 60)}h ${filme.runTime % 60}m`,
      ano: new Date(filme.releaseDate).getFullYear(),
      generos: filme.genres.split(", "),
      lingua: filme.originalLanguage,
      orcamento: filme.budget > 0 ? `$${filme.budget.toLocaleString()}` : "Não informado",
      producoes: filme.productions.split(", ").map(nome => ({ nome })),
      keywords: filme.keyWords.split(", ")
    }
    setFilmeAberto(filmeDetalhado)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-zinc-900 text-white">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <section className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Todos os Filmes</h1>
          <div className="flex flex-wrap gap-4 items-center">
            {/* ... seus controles de filtro ... */}
          </div>
        </section>

        {filmesPaginaAtual.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {filmesPaginaAtual.map((filme) => (
              <FilmeCard
                key={filme.id}
                id={filme.id}
                titulo={filme.title}
                capa={filme.posterPhotoUrl}
                avaliacao={filme.voteAverage}
                duracao={`${Math.floor(filme.runTime / 60)}h ${filme.runTime % 60}m`}
                ano={new Date(filme.releaseDate).getFullYear()}
                descricao={filme.overview}
                onClick={() => handleOpenFilme(filme)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-zinc-400 text-lg">Nenhum filme encontrado.</p>
          </div>
        )}
      </main>

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