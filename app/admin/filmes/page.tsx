"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Plus, Search, Edit, Trash2, Eye, ChevronLeft, ChevronRight, ArrowUpDown, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import FilmeModal, { type FilmeDetalhado } from "@/components/filme-modal"
import EditarFilmeModal from "@/components/admin/editar-filme-modal"
import { movieService, type Movie } from "@/app/services/movieService"
import debounce from 'lodash/debounce'

export default function AdminFilmesPage() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [filmes, setFilmes] = useState<Movie[]>([])
  const [termoBusca, setTermoBusca] = useState("")
  const [valorInput, setValorInput] = useState("")
  const [filmeParaExcluir, setFilmeParaExcluir] = useState<string | null>(null)
  const [filmeParaVisualizar, setFilmeParaVisualizar] = useState<FilmeDetalhado | null>(null)
  const [filmeParaEditar, setFilmeParaEditar] = useState<FilmeDetalhado | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [paginaAtual, setPaginaAtual] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const ITEMS_POR_PAGINA = 5

  const debouncedSearch = useCallback(
    debounce((valor: string) => {
      setTermoBusca(valor)
    }, 500),
    []
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value
    setValorInput(valor)
    debouncedSearch(valor)
  }

  useEffect(() => {
    const fetchFilmes = async () => {
      try {
        setIsLoading(true)
        const response = await movieService.getAllMoviesPage(
          paginaAtual,
          ITEMS_POR_PAGINA,
          termoBusca
        )
        setFilmes(response.content || [])
        setTotalItems(response.totalElements || 0)
        setError(null)
      } catch (err) {
        console.error("Erro ao carregar filmes:", err)
        setError(err instanceof Error ? err.message : "Erro ao carregar filmes")
        setFilmes([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchFilmes()
  }, [paginaAtual, termoBusca])

  // Filtrar filmes com base no termo de busca
  const filmesFiltrados = filmes.filter(
    (filme) =>
      filme.title.toLowerCase().includes(termoBusca.toLowerCase()) ||
      filme.genres.split(", ").some((genero) => genero.toLowerCase().includes(termoBusca.toLowerCase())),
  )

  // Função para excluir um filme
  const excluirFilme = () => {
    if (filmeParaExcluir) {
      setFilmes(filmes.filter((filme) => filme.id !== filmeParaExcluir))
      setFilmeParaExcluir(null)
    }
  }

  // Função para salvar as alterações de um filme
  const salvarEdicaoFilme = async (filmeEditado: any) => {
    try {
      // Simulação de envio para API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Atualizar o filme na lista
      setFilmes(
        filmes.map((filme) =>
          filme.id === filmeEditado.id
            ? {
                ...filme,
                ...filmeEditado,
              }
            : filme,
        ),
      )

      // Fechar o modal após salvar
      setFilmeParaEditar(null)

      return Promise.resolve()
    } catch (error) {
      console.error("Erro ao salvar filme:", error)
      return Promise.reject(error)
    }
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
    return filmeDetalhado
  }

  const totalPaginas = Math.ceil(totalItems / ITEMS_POR_PAGINA)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-900 text-white">
        <div className="flex h-screen overflow-hidden">
          <main className="flex-1 overflow-y-auto bg-zinc-900">
            <div className="p-6 md:p-8">
              <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto mb-2"></div>
                  <p>Carregando filmes...</p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-900 text-white">
        <div className="flex h-screen overflow-hidden">
          <main className="flex-1 overflow-y-auto bg-zinc-900">
            <div className="p-6 md:p-8">
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
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar é renderizada pelo layout compartilhado */}

        {/* Conteúdo principal */}
        <main className="flex-1 overflow-y-auto bg-zinc-900">
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl font-bold">Gerenciar Filmes</h1>
                <p className="text-zinc-400">Adicione, edite ou remova filmes da plataforma</p>
                <div className="mt-2">
                  <Link href="/admin">
                    <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                      Voltar ao Dashboard
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/admin/filmes/novo">
                  <Button className="bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-600 hover:to-red-700 text-white border-0">
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Filme
                  </Button>
                </Link>
              </div>
            </div>

            {/* Barra de busca */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                type="search"
                placeholder="Buscar filmes por título ou gênero..."
                className="pl-10 bg-zinc-800 border-zinc-700 focus-visible:ring-amber-500 text-white placeholder:text-zinc-400"
                value={valorInput}
                onChange={handleInputChange}
                ref={inputRef}
              />
            </div>

            {/* Tabela de filmes */}
            <div className="bg-zinc-800 rounded-md border border-zinc-700 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-zinc-700/50 border-zinc-700">
                    <TableHead className="text-zinc-400 font-medium">
                      <div className="flex items-center">
                        Filme
                        <ArrowUpDown className="ml-1 h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead className="text-zinc-400 font-medium">Gêneros</TableHead>
                    <TableHead className="text-zinc-400 font-medium text-center">Avaliação</TableHead>
                    <TableHead className="text-zinc-400 font-medium text-center">Ano</TableHead>
                    <TableHead className="text-zinc-400 font-medium text-center">Status</TableHead>
                    <TableHead className="text-zinc-400 font-medium text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filmesFiltrados.length > 0 ? (
                    filmesFiltrados.map((filme) => (
                      <TableRow key={filme.id} className="hover:bg-zinc-700/50 border-zinc-700">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative w-12 h-16 overflow-hidden rounded">
                              <Image
                                src={filme.posterPhotoUrl || "/placeholder.svg"}
                                alt={filme.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-medium">{filme.title}</p>
                              <p className="text-xs text-zinc-400">
                                Lançado em {new Date(filme.releaseDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {filme.genres.split(", ").map((genero, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="bg-zinc-700 border-zinc-600 text-zinc-300"
                              >
                                {genero}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center">
                            <span className="bg-amber-500/20 text-amber-500 px-2 py-1 rounded-full text-xs font-medium">
                              {filme.voteAverage.toFixed(1)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {new Date(filme.releaseDate).getFullYear()}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className="bg-green-500/20 text-green-500 border-0">
                            Publicado
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Abrir menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-zinc-800 border-zinc-700 text-white">
                              <DropdownMenuLabel>Ações</DropdownMenuLabel>
                              <DropdownMenuSeparator className="bg-zinc-700" />
                              <DropdownMenuItem
                                className="hover:bg-zinc-700 cursor-pointer"
                                onClick={() => setFilmeParaVisualizar(handleOpenFilme(filme))}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                Visualizar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="hover:bg-zinc-700 cursor-pointer"
                                onClick={() => setFilmeParaEditar(handleOpenFilme(filme))}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-500 hover:bg-red-500/10 hover:text-red-500 cursor-pointer"
                                onClick={() => setFilmeParaExcluir(filme.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-zinc-400">
                        Nenhum filme encontrado com os critérios de busca.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Paginação */}
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-zinc-400">
                Mostrando <span className="font-medium text-white">{filmes.length}</span> de{" "}
                <span className="font-medium text-white">{totalItems}</span> filmes
              </p>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-zinc-700 text-zinc-400 hover:bg-zinc-800"
                  onClick={() => setPaginaAtual(prev => Math.max(1, prev - 1))}
                  disabled={paginaAtual === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Página anterior</span>
                </Button>
                <span className="text-sm text-zinc-400">
                  Página <span className="font-medium text-white">{paginaAtual}</span> de{" "}
                  <span className="font-medium text-white">{Math.ceil(totalItems / ITEMS_POR_PAGINA)}</span>
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-zinc-700 text-zinc-400 hover:bg-zinc-800"
                  onClick={() => setPaginaAtual(prev => Math.min(Math.ceil(totalItems / ITEMS_POR_PAGINA), prev + 1))}
                  disabled={paginaAtual === Math.ceil(totalItems / ITEMS_POR_PAGINA)}
                >
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">Próxima página</span>
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Diálogo de confirmação para excluir filme */}
      <AlertDialog open={!!filmeParaExcluir} onOpenChange={(open) => !open && setFilmeParaExcluir(null)}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Esta ação não pode ser desfeita. O filme será permanentemente removido da plataforma.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white" onClick={excluirFilme}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal para visualizar filme */}
      {filmeParaVisualizar && (
        <FilmeModal
          filme={filmeParaVisualizar}
          aberto={!!filmeParaVisualizar}
          onClose={() => setFilmeParaVisualizar(null)}
        />
      )}

      {/* Modal para editar filme */}
      {filmeParaEditar && (
        <EditarFilmeModal
          filme={filmeParaEditar}
          aberto={!!filmeParaEditar}
          onClose={() => setFilmeParaEditar(null)}
          onSave={salvarEdicaoFilme}
        />
      )}
    </div>
  )
}

