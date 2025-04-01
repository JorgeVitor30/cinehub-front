"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { ChevronDown, Filter, Search, X } from "lucide-react"
import Navbar from "@/components/navbar"
import FilmeCard from "@/components/filme-card"
import FilmeModal, { type FilmeDetalhado } from "@/components/filme-modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { movieService, type Movie } from "@/app/services/movieService"
import React from "react"
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import debounce from 'lodash/debounce'

export default function FilmesPage() {
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const pageParam = searchParams.get('page')
  const searchParam = searchParams.get('title') || ""
  
  const [paginaAtual, setPaginaAtual] = useState(pageParam ? Number(pageParam) : 1)
  const [termoBusca, setTermoBusca] = useState(searchParam)
  const [valorInput, setValorInput] = useState(searchParam)
  const [filmes, setFilmes] = useState<Movie[]>([])
  const [filmesFiltrados, setFilmesFiltrados] = useState<Movie[]>([])
  const [filmeAberto, setFilmeAberto] = useState<FilmeDetalhado | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [generosSelecionados, setGenerosSelecionados] = useState<string[]>([])
  const [avaliacaoMinima, setAvaliacaoMinima] = useState(0)
  const [anoInicio, setAnoInicio] = useState(1970)
  const [anoFim, setAnoFim] = useState(2024)
  const [ordenarPor, setOrdenarPor] = useState<"recentes" | "avaliacao" | "titulo">("recentes")
  const [totalItems, setTotalItems] = useState(0)
  const ITEMS_POR_PAGINA = 20

  const debouncedSearch = useCallback(
    debounce((valor: string) => {
      setTermoBusca(valor)
      atualizarParametros(undefined, valor)
    }, 500),
    []
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value
    setValorInput(valor)
    debouncedSearch(valor)
  }

  const atualizarParametros = (novaPagina?: number, novoTermo?: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (novaPagina !== undefined) {
      params.set('page', novaPagina.toString())
    }
    
    if (novoTermo !== undefined) {
      if (novoTermo) {
        params.set('title', novoTermo)
      } else {
        params.delete('title')
      }
      params.set('page', '1')
    }
    
    router.push(`${pathname}?${params.toString()}`)
  }

  useEffect(() => {
    if (pageParam) {
      setPaginaAtual(Number(pageParam))
    }
  }, [pageParam])

  useEffect(() => {
    const fetchFilmes = async () => {
      try {
        setLoading(true)
        const response = await movieService.getAllMoviesPage(
          paginaAtual, 
          ITEMS_POR_PAGINA,
          termoBusca
        )
        
        setFilmes(response.content || [])
        setTotalItems(response.total || 0)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } catch (err) {
        console.error("Erro ao carregar filmes:", err)
        setError(err instanceof Error ? err.message : "Erro ao carregar filmes")
        setFilmes([])
        setTotalItems(0)
      } finally {
        setLoading(false)
      }
    }

    fetchFilmes()
  }, [paginaAtual, termoBusca])

  useEffect(() => {
    if (inputRef.current) {
      const length = inputRef.current.value.length
      inputRef.current.focus()
      inputRef.current.setSelectionRange(length, length)
    }
  }, [filmes])

  const todosGeneros = React.useMemo(() => {
    if (!filmes) return []
    return Array.from(
      new Set(
        filmes
          .filter(filme => filme.genres)
          .flatMap(filme => filme.genres.split(", "))
          .filter(Boolean)
      )
    ).sort()
  }, [filmes])

  useEffect(() => {
    let resultado = [...filmes]
    if (termoBusca) {
      resultado = resultado.filter(filme => 
        filme.title?.toLowerCase().includes(termoBusca.toLowerCase()) || 
        filme.overview?.toLowerCase().includes(termoBusca.toLowerCase())
      )
    }

    if (generosSelecionados.length > 0) {
      resultado = resultado.filter(filme =>
        generosSelecionados.some(genero => filme.genres?.includes(genero))
      )
    }

    if (avaliacaoMinima > 0) {
      resultado = resultado.filter(filme => filme.voteAverage >= avaliacaoMinima)
    }

    resultado = resultado.filter(filme => {
      const ano = new Date(filme.releaseDate).getFullYear()
      return ano >= anoInicio && ano <= anoFim
    })

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
  }, [termoBusca, generosSelecionados, avaliacaoMinima, anoInicio, anoFim, ordenarPor, filmes])

  const totalPaginas = Math.ceil(totalItems / ITEMS_POR_PAGINA) || 1

  const handlePaginaAnterior = () => {
    if (paginaAtual > 1) {
      atualizarParametros(paginaAtual - 1)
    }
  }
  
  const handleProximaPagina = () => {
    if (paginaAtual < totalPaginas) {
      atualizarParametros(paginaAtual + 1)
    }
  }

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
          <h1 className="text-4xl font-bold mb-4">Filmes</h1>
          
          <div className="flex gap-2 items-center mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-4 w-4" />
              <Input
                ref={inputRef}
                type="text"
                placeholder="Buscar filmes por título..."
                value={valorInput}
                onChange={handleInputChange}
                autoFocus
                className="pl-10 bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-400 w-full"
              />
              {valorInput && (
                <button
                  onClick={() => {
                    setValorInput("")
                    setTermoBusca("")
                    atualizarParametros(undefined, "")
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {filmesFiltrados.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {filmesFiltrados.map((filme) => (
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
              <p className="text-zinc-400 text-lg">
                {termoBusca ? "Nenhum filme encontrado para sua busca." : "Nenhum filme disponível."}
              </p>
            </div>
          )}
        </section>

        <div className="mt-8 flex justify-center items-center gap-4">
          <Button
            onClick={handlePaginaAnterior}
            disabled={paginaAtual === 1}
            variant="outline"
            className="px-4 py-2"
          >
            Anterior
          </Button>
          
          <span className="text-sm font-medium">
            Página {paginaAtual} de {totalPaginas}
          </span>

          <Button
            onClick={handleProximaPagina}
            disabled={paginaAtual === totalPaginas}
            variant="outline"
            className="px-4 py-2"
          >
            Próxima
          </Button>
        </div>
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