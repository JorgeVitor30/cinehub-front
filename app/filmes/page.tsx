"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { ChevronDown, Filter, Search, X } from "lucide-react"
import Navbar from "@/components/navbar"
import FilmeCard from "@/components/filme-card"
import FilmeModal, { type FilmeDetalhado } from "@/components/filme-modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Slider } from "@/components/ui/slider"
import { movieService, type Movie, extractValue } from "@/app/services/movieService"
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
  const sortByParam = searchParams.get('sortBy')
  
  const [paginaAtual, setPaginaAtual] = useState(pageParam ? Number(pageParam) : 1)
  const [termoBusca, setTermoBusca] = useState(searchParam)
  const [valorInput, setValorInput] = useState(searchParam)
  const [filmes, setFilmes] = useState<Movie[]>([])
  const [filmesFiltrados, setFilmesFiltrados] = useState<Movie[]>([])
  const [filmeAberto, setFilmeAberto] = useState<FilmeDetalhado | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [generosSelecionados, setGenerosSelecionados] = useState<string[]>([])
  const [avaliacaoMinima, setAvaliacaoMinima] = useState(0)
  const [anoInicio, setAnoInicio] = useState(1970)
  const [anoFim, setAnoFim] = useState(2030)
  const [ordenarPor, setOrdenarPor] = useState<"recentes" | "avaliacao" | "titulo">(() => {
    switch (sortByParam) {
      case "voteaverage":
        return "avaliacao"
      case "title":
        return "titulo"
      default:
        return "recentes"
    }
  })
  const [totalItems, setTotalItems] = useState(0)
  const ITEMS_POR_PAGINA = 20
  const [generoSelecionado, setGeneroSelecionado] = useState<string>("")
  const [notaMinima, setNotaMinima] = useState<number>(0)
  const [isSliderMoving, setIsSliderMoving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const debouncedSearch = useCallback(
    debounce((valor: string) => {
      setTermoBusca(valor)
      if (valor) {
        atualizarParametros(undefined, valor, undefined, undefined, "")
      } else {
        atualizarParametros(undefined, valor, undefined, undefined, "releasedate")
      }
    }, 500),
    []
  )

  const debouncedNoteChange = useCallback(
    debounce((value: number) => {
      atualizarParametros(undefined, undefined, undefined, value)
    }, 500),
    []
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value
    setValorInput(valor)
    if (valor) {
      setOrdenarPor("recentes")
    }
    debouncedSearch(valor)
  }

  const handleNoteChange = (value: number[]) => {
    setNotaMinima(value[0])
    debouncedNoteChange(value[0])
  }

  const atualizarParametros = (novaPagina?: number, novoTermo?: string, novoGenero?: string, novaNota?: number, novaOrdenacao?: string) => {
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

    if (novoGenero !== undefined) {
      if (novoGenero) {
        params.set('genrer', novoGenero)
      } else {
        params.delete('genrer')
      }
      params.set('page', '1')
    }

    if (novaNota !== undefined) {
      if (novaNota > 0) {
        params.set('note', novaNota.toString())
      } else {
        params.delete('note')
      }
      params.set('page', '1')
    }

    if (novaOrdenacao !== undefined) {
      if (novaOrdenacao) {
        params.set('sortBy', novaOrdenacao)
      } else {
        params.delete('sortBy')
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
        setIsLoading(true)
        let sortByValue = ''
        switch (ordenarPor) {
          case "recentes":
            sortByValue = 'releasedate'
            break
          case "avaliacao":
            sortByValue = 'voteaverage'
            break
          case "titulo":
            sortByValue = 'title'
            break
        }

        const response = await movieService.getAllMoviesPage(
          paginaAtual, 
          ITEMS_POR_PAGINA,
          termoBusca,
          generoSelecionado,
          notaMinima,
          sortByValue
        )
        
        if (response && Array.isArray(response.content)) {
          setFilmes(response.content)
          setTotalItems(response.total || 0)
        } else {
          console.error("Resposta inválida da API:", response)
          setFilmes([])
          setTotalItems(0)
        }
      } catch (err) {
        console.error("Erro ao carregar filmes:", err)
        setError(err instanceof Error ? err.message : "Erro ao carregar filmes")
        setFilmes([])
        setTotalItems(0)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFilmes()
  }, [paginaAtual, termoBusca, generoSelecionado, notaMinima, ordenarPor])

  useEffect(() => {
    if (inputRef.current) {
      const length = inputRef.current.value.length
      inputRef.current.focus()
      inputRef.current.setSelectionRange(length, length)
    }
  }, [filmes])

  const todosGeneros = React.useMemo(() => {
    const generosFixos = ["Animation", "Science Fiction", "War"]
    if (!filmes) return generosFixos

    const generosDoFilme = Array.from(
      new Set(
        filmes
          .filter(filme => filme.genres)
          .flatMap(filme => filme.genres.split(", "))
          .filter(Boolean)
      )
    )

    // Combina os gêneros fixos com os gêneros dos filmes e remove duplicatas
    return Array.from(new Set([...generosFixos, ...generosDoFilme])).sort()
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
      resultado = resultado.filter(filme => extractValue(filme.voteAverage) >= avaliacaoMinima)
    }

    resultado = resultado.filter(filme => {
      const ano = new Date(filme.releaseDate).getFullYear()
      const dentroDoIntervalo = ano >= anoInicio && ano <= anoFim
      return dentroDoIntervalo
    })

    setFilmesFiltrados(resultado)
  }, [termoBusca, generosSelecionados, avaliacaoMinima, anoInicio, anoFim, filmes])

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

  const limparFiltros = () => {
    setValorInput("")
    setTermoBusca("")
    setGeneroSelecionado("")
    setNotaMinima(0)
    setOrdenarPor("recentes")
    atualizarParametros(1, "", "", 0, "") // Reseta página para 1 e limpa todos os filtros
  }

  if (isLoading) {
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
    <div className="min-h-screen bg-gradient-to-b from-black to-zinc-900 text-white">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <section className="mb-8">
          <div className="flex items-baseline justify-between mb-4">
            <h1 className="text-4xl font-bold">Filmes</h1>
            <p className="text-zinc-400">
              {totalItems === 0 ? (
                'Nenhum filme encontrado'
              ) : totalItems === 1 ? (
                '1 filme encontrado'
              ) : (
                `${totalItems.toLocaleString()} filmes encontrados`
              )}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2 items-center mb-6">
            <div className="relative w-[300px] sm:w-[550px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-4 w-4" />
              <Input
                ref={inputRef}
                type="text"
                placeholder="Buscar filmes por título..."
                value={valorInput}
                onChange={handleInputChange}
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

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 w-[180px] justify-between">
                  <span className="flex items-center gap-2">
                    <ChevronDown className="h-4 w-4" />
                    {ordenarPor === "recentes" && "Mais recentes"}
                    {ordenarPor === "avaliacao" && "Melhor avaliados"}
                    {ordenarPor === "titulo" && "Título (A-Z)"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-zinc-900 border-zinc-700 w-[180px]">
                <DropdownMenuItem
                  className="text-white hover:bg-zinc-800"
                  onClick={() => {
                    setOrdenarPor("recentes")
                    atualizarParametros(undefined, undefined, undefined, undefined, "releasedate")
                  }}
                >
                  Mais recentes
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-white hover:bg-zinc-800"
                  onClick={() => {
                    setOrdenarPor("avaliacao")
                    atualizarParametros(undefined, undefined, undefined, undefined, "voteaverage")
                  }}
                >
                  Melhor avaliados
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-white hover:bg-zinc-800"
                  onClick={() => {
                    setOrdenarPor("titulo")
                    atualizarParametros(undefined, undefined, undefined, undefined, "title")
                  }}
                >
                  Título (A-Z)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 w-[160px] justify-between">
                  <span className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    {generoSelecionado || "Gênero"}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-zinc-900 border-zinc-700 w-[160px]">
                <DropdownMenuItem
                  className="text-white hover:bg-zinc-800"
                  onClick={() => {
                    setGeneroSelecionado("")
                    atualizarParametros(undefined, undefined, "")
                  }}
                >
                  Todos os gêneros
                </DropdownMenuItem>
                {todosGeneros.map((genero) => (
                  <DropdownMenuItem
                    key={genero}
                    className="text-white hover:bg-zinc-800"
                    onClick={() => {
                      setGeneroSelecionado(genero)
                      atualizarParametros(undefined, undefined, genero)
                    }}
                  >
                    {genero}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <div 
              className="flex items-center gap-3 bg-zinc-900 rounded-md p-3 border border-zinc-700 w-[280px]"
              onMouseEnter={() => setIsSliderMoving(true)}
              onMouseLeave={() => setIsSliderMoving(false)}
              onTouchStart={() => setIsSliderMoving(true)}
              onTouchEnd={() => setIsSliderMoving(false)}
            >
              <span className="text-sm whitespace-nowrap font-medium">Nota mínima:</span>
              <Slider
                min={0}
                max={10}
                step={0.5}
                value={[notaMinima]}
                onValueChange={(value) => {
                  setNotaMinima(value[0])
                  if (!isSliderMoving) {
                    debouncedNoteChange(value[0])
                  }
                }}
                onValueCommit={(value) => {
                  if (isSliderMoving) {
                    debouncedNoteChange(value[0])
                  }
                }}
                className="w-40"
              />
              <span className="text-sm font-medium w-10 text-center">{notaMinima}</span>
            </div>

            {(valorInput || generoSelecionado || notaMinima > 0 || ordenarPor !== "recentes") && (
              <Button
                variant="ghost"
                onClick={limparFiltros}
                className="gap-2 text-zinc-400 hover:text-white"
              >
                <X className="h-4 w-4" />
                Limpar filtros
              </Button>
            )}
          </div>

          <div className="transition-opacity duration-200 ease-in-out">
            {filmesFiltrados.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                {filmesFiltrados.map((filme) => (
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
          </div>
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