"use client"

import { useState } from "react"
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

// Dados mockados para a lista de filmes
const filmesMock = [
  {
    id: "1",
    titulo: "Inception",
    capa: "https://image.tmdb.org/t/p/w500//oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
    banner: "https://image.tmdb.org/t/p/original/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg",
    avaliacao: 8.8,
    ano: 2010,
    generos: ["Ação", "Ficção Científica"],
    status: "publicado",
    dataCriacao: "10/07/2023",
    duracao: "2h 28m",
    lingua: "Inglês",
    orcamento: "$160 milhões",
    descricao: "Um ladrão que rouba segredos corporativos através do uso da tecnologia de compartilhamento de sonhos.",
    producoes: [{ nome: "Warner Bros. Pictures" }, { nome: "Legendary Pictures" }, { nome: "Syncopy" }],
    keywords: ["Sonhos", "Subconsciente", "Roubo", "Labirinto", "Arquitetura", "Tempo"],
  },
  {
    id: "2",
    titulo: "Interestellar",
    capa: "https://image.tmdb.org/t/p/w500/pbrkL804c8yAv3zBZR4QPEafpAR.jpg",
    banner: "https://image.tmdb.org/t/p/original/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg",
    avaliacao: 8.6,
    ano: 2023,
    generos: ["Drama", "Ficção Científica"],
    status: "publicado",
    dataCriacao: "15/08/2023",
    duracao: "3h 00m",
    lingua: "Inglês",
    orcamento: "$200 milhões",
    descricao:
      "A história do cientista americano J. Robert Oppenheimer e seu papel no desenvolvimento da bomba atômica.",
    producoes: [
      { nome: "Paramount Pictures" },
      { nome: "Warner Bros. Pictures" },
      { nome: "Legendary Pictures" },
      { nome: "Syncopy" },
    ],
    keywords: ["Espaço", "Buracos negros", "Viagem no tempo", "Relatividade", "Família"],
  },
  {
    id: "3",
    titulo: "Pobres Criaturas",
    capa: "https://image.tmdb.org/t/p/w500//oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
    banner: "https://image.tmdb.org/t/p/original/jkKVLzLWjSvTnc84VzeljhSy6j8.jpg",
    avaliacao: 8.5,
    ano: 2023,
    generos: ["Fantasia", "Comédia", "Drama"],
    status: "publicado",
    dataCriacao: "20/01/2024",
    duracao: "2h 21m",
    lingua: "Inglês",
    orcamento: "$35 milhões",
    descricao: "A jovem Bella é trazida de volta à vida pelo cientista Dr. Godwin Baxter.",
    producoes: [{ nome: "Searchlight Pictures" }, { nome: "Film4 Productions" }, { nome: "Element Pictures" }],
    keywords: ["Monstro", "Experimento", "Viagem", "Liberdade", "Descoberta"],
  },
  {
    id: "4",
    titulo: "Zona de Interesse",
    capa: "https://image.tmdb.org/t/p/w500//oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
    banner: "https://image.tmdb.org/t/p/original/A7EByudX0eOzlkQ2FIbogzyazm2.jpg",
    avaliacao: 7.6,
    ano: 2023,
    generos: ["Drama", "História", "Guerra"],
    status: "publicado",
    dataCriacao: "05/02/2024",
    duracao: "1h 45m",
    lingua: "Alemão",
    orcamento: "$15 milhões",
    descricao: "A vida familiar de um oficial nazista e sua esposa ao lado de um campo de concentração.",
    producoes: [{ nome: "A24" }, { nome: "Film4 Productions" }, { nome: "Extreme Emotions" }],
    keywords: ["Nazismo", "Segunda Guerra", "Holocausto", "Família", "Moral"],
  },
  {
    id: "5",
    titulo: "Anatomia de uma Queda",
    capa: "https://image.tmdb.org/t/p/w500/pbrkL804c8yAv3zBZR4QPEafpAR.jpg",
    banner: "https://image.tmdb.org/t/p/original/hYqOjJ7Gh1fbqXrxlIao1g8ZehF.jpg",
    avaliacao: 8.4,
    ano: 2023,
    generos: ["Drama", "Mistério", "Crime"],
    status: "publicado",
    dataCriacao: "12/12/2023",
    duracao: "2h 31m",
    lingua: "Francês",
    orcamento: "$6 milhões",
    descricao: "Uma mulher é suspeita de assassinar o marido e seu filho cego enfrenta um dilema moral.",
    producoes: [{ nome: "Les Films du Losange" }, { nome: "France 2 Cinéma" }, { nome: "Arte France Cinéma" }],
    keywords: ["Julgamento", "Investigação", "Morte", "Família", "Montanha"],
  },
]

export default function AdminFilmesPage() {
  const router = useRouter()
  const [filmes, setFilmes] = useState(filmesMock)
  const [termoBusca, setTermoBusca] = useState("")
  const [filmeParaExcluir, setFilmeParaExcluir] = useState<string | null>(null)
  const [filmeParaVisualizar, setFilmeParaVisualizar] = useState<FilmeDetalhado | null>(null)
  const [filmeParaEditar, setFilmeParaEditar] = useState<FilmeDetalhado | null>(null)

  // Filtrar filmes com base no termo de busca
  const filmesFiltrados = filmes.filter(
    (filme) =>
      filme.titulo.toLowerCase().includes(termoBusca.toLowerCase()) ||
      filme.generos.some((genero) => genero.toLowerCase().includes(termoBusca.toLowerCase())),
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
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
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
                                src={filme.capa || "/placeholder.svg"}
                                alt={filme.titulo}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-medium">{filme.titulo}</p>
                              <p className="text-xs text-zinc-400">Adicionado em {filme.dataCriacao}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {filme.generos.map((genero, index) => (
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
                              {filme.avaliacao.toFixed(1)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{filme.ano}</TableCell>
                        <TableCell className="text-center">
                          {filme.status === "publicado" ? (
                            <Badge className="bg-green-500/20 text-green-500 border-0">Publicado</Badge>
                          ) : (
                            <Badge className="bg-zinc-500/20 text-zinc-400 border-0">Rascunho</Badge>
                          )}
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
                                onClick={() => setFilmeParaVisualizar(filme as FilmeDetalhado)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                Visualizar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="hover:bg-zinc-700 cursor-pointer"
                                onClick={() => setFilmeParaEditar(filme as FilmeDetalhado)}
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
                Mostrando <span className="font-medium text-white">{filmesFiltrados.length}</span> de{" "}
                <span className="font-medium text-white">{filmes.length}</span> filmes
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-400 hover:bg-zinc-800">
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Página anterior</span>
                </Button>
                <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-400 hover:bg-zinc-800">
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

