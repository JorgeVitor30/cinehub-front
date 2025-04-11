"use client"

import { useState } from "react"
import { Search, Filter, Users, ChevronDown, X } from "lucide-react"
import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import UsuarioCard from "@/components/usuario-card"
import UsuarioPerfilModal from "@/components/usuario-perfil-modal";

// Dados mockados para demonstração
const generosMock = [
  "Ação",
  "Aventura",
  "Animação",
  "Comédia",
  "Crime",
  "Documentário",
  "Drama",
  "Fantasia",
  "Ficção Científica",
  "Guerra",
  "História",
  "Mistério",
  "Musical",
  "Romance",
  "Suspense",
  "Terror",
]

// Dados mockados de usuários
const usuariosMock = [
  {
    id: "1",
    nome: "João Silva",
    avatar: "/placeholder.svg?height=200&width=200",
    nivel: "Cinéfilo Experiente",
    avaliacoes: 127,
    generosFavoritos: ["Ficção Científica", "Ação", "Aventura"],
    filmesFavoritos: ["Inception", "Matrix", "Interestellar"],
    compatibilidade: 92,
    ultimaAtividade: "Hoje",
    bio: "Apaixonado por filmes de ficção científica e thrillers psicológicos. Sempre em busca da próxima obra-prima do cinema.",
  },
  {
    id: "2",
    nome: "Maria Oliveira",
    avatar: "/placeholder.svg?height=200&width=200",
    nivel: "Crítica Master",
    avaliacoes: 215,
    generosFavoritos: ["Drama", "Romance", "Comédia"],
    filmesFavoritos: ["Parasita", "Titanic", "Pulp Fiction"],
    compatibilidade: 78,
    ultimaAtividade: "Ontem",
    bio: "Estudante de cinema e apaixonada por narrativas que exploram a condição humana. Adoro descobrir filmes independentes.",
  },
  {
    id: "3",
    nome: "Pedro Santos",
    avatar: "/placeholder.svg?height=200&width=200",
    nivel: "Entusiasta de Cinema",
    avaliacoes: 85,
    generosFavoritos: ["Terror", "Suspense", "Mistério"],
    filmesFavoritos: ["O Iluminado", "Hereditário", "Corra!"],
    compatibilidade: 45,
    ultimaAtividade: "3 dias atrás",
    bio: "Fã de filmes de terror psicológico e suspense. Quanto mais perturbador, melhor!",
  },
  {
    id: "4",
    nome: "Ana Costa",
    avatar: "/placeholder.svg?height=200&width=200",
    nivel: "Cinéfila Casual",
    avaliacoes: 42,
    generosFavoritos: ["Animação", "Aventura", "Fantasia"],
    filmesFavoritos: ["Divertida Mente", "Spirited Away", "Shrek"],
    compatibilidade: 65,
    ultimaAtividade: "1 semana atrás",
    bio: "Adoro filmes de animação e fantasia que me fazem escapar da realidade. Pixar e Studio Ghibli são meus favoritos!",
  },
  {
    id: "5",
    nome: "Carlos Ferreira",
    avatar: "/placeholder.svg?height=200&width=200",
    nivel: "Historiador de Cinema",
    avaliacoes: 310,
    generosFavoritos: ["Clássicos", "Drama", "Guerra"],
    filmesFavoritos: ["O Poderoso Chefão", "Cidadão Kane", "Casablanca"],
    compatibilidade: 82,
    ultimaAtividade: "Hoje",
    bio: "Especialista em cinema clássico e história do cinema. Sempre disposto a discutir os grandes mestres da sétima arte.",
  },
  {
    id: "6",
    nome: "Fernanda Lima",
    avatar: "/placeholder.svg?height=200&width=200",
    nivel: "Crítica em Ascensão",
    avaliacoes: 112,
    generosFavoritos: ["Documentário", "Drama", "Biografia"],
    filmesFavoritos: ["Democracia em Vertigem", "Cidade de Deus", "Bacurau"],
    compatibilidade: 88,
    ultimaAtividade: "2 dias atrás",
    bio: "Apaixonada por cinema brasileiro e documentários que abordam questões sociais. Acredito no poder transformador do cinema.",
  },
  {
    id: "7",
    nome: "Ricardo Gomes",
    avatar: "/placeholder.svg?height=200&width=200",
    nivel: "Cinéfilo Novato",
    avaliacoes: 28,
    generosFavoritos: ["Ação", "Aventura", "Super-heróis"],
    filmesFavoritos: ["Vingadores: Ultimato", "Batman: O Cavaleiro das Trevas", "Homem-Aranha"],
    compatibilidade: 55,
    ultimaAtividade: "3 dias atrás",
    bio: "Fã de filmes de super-heróis e blockbusters de ação. Sempre ansioso pelos próximos lançamentos da Marvel e DC.",
  },
  {
    id: "8",
    nome: "Juliana Martins",
    avatar: "/placeholder.svg?height=200&width=200",
    nivel: "Especialista em Cult",
    avaliacoes: 175,
    generosFavoritos: ["Cult", "Indie", "Drama"],
    filmesFavoritos: ["Donnie Darko", "Clube da Luta", "Mulholland Drive"],
    compatibilidade: 70,
    ultimaAtividade: "Ontem",
    bio: "Apreciadora de cinema cult e filmes que desafiam as convenções narrativas. Quanto mais complexo e enigmático, melhor.",
  },
  {
    id: "9",
    nome: "Marcelo Alves",
    avatar: "/placeholder.svg?height=200&width=200",
    nivel: "Cinéfilo Clássico",
    avaliacoes: 95,
    generosFavoritos: ["Faroeste", "Noir", "Clássicos"],
    filmesFavoritos: ["Três Homens em Conflito", "Chinatown", "Casablanca"],
    compatibilidade: 60,
    ultimaAtividade: "5 dias atrás",
    bio: "Apaixonado por cinema clássico, especialmente faroestes e filmes noir. Acredito que o cinema atingiu seu auge nas décadas de 40 a 70.",
  },
  {
    id: "10",
    nome: "Camila Souza",
    avatar: "/placeholder.svg?height=200&width=200",
    nivel: "Crítica Internacional",
    avaliacoes: 203,
    generosFavoritos: ["Cinema Mundial", "Drama", "Comédia"],
    filmesFavoritos: ["Parasita", "O Fabuloso Destino de Amélie Poulain", "Cidade de Deus"],
    compatibilidade: 85,
    ultimaAtividade: "Hoje",
    bio: "Especialista em cinema internacional e produções de diferentes culturas. Adoro descobrir joias cinematográficas de todos os cantos do mundo.",
  },
]

export default function ComunidadePage() {
  const [termoBusca, setTermoBusca] = useState("")
  const [generosSelecionados, setGenerosSelecionados] = useState<string[]>([])
  const [compatibilidadeMinima, setCompatibilidadeMinima] = useState(0)
  const [avaliacoesMinimas, setAvaliacoesMinimas] = useState(0)
  const [ordenarPor, setOrdenarPor] = useState<"compatibilidade" | "avaliacoes" | "atividade">("compatibilidade")
  const [paginaAtual, setPaginaAtual] = useState(1)
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<string | null>(null)

  // Número de usuários por página
  const USUARIOS_POR_PAGINA = 6

  // Aplicar filtros
  const usuariosFiltrados = usuariosMock.filter((usuario) => {
    // Filtrar por termo de busca
    const matchBusca =
      usuario.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
      usuario.bio.toLowerCase().includes(termoBusca.toLowerCase()) ||
      usuario.generosFavoritos.some((genero) => genero.toLowerCase().includes(termoBusca.toLowerCase())) ||
      usuario.filmesFavoritos.some((filme) => filme.toLowerCase().includes(termoBusca.toLowerCase()))

    // Filtrar por gêneros
    const matchGeneros =
      generosSelecionados.length === 0 ||
      generosSelecionados.some((genero) => usuario.generosFavoritos.includes(genero))

    // Filtrar por compatibilidade mínima
    const matchCompatibilidade = usuario.compatibilidade >= compatibilidadeMinima

    // Filtrar por avaliações mínimas
    const matchAvaliacoes = usuario.avaliacoes >= avaliacoesMinimas

    return matchBusca && matchGeneros && matchCompatibilidade && matchAvaliacoes
  })

  // Ordenar resultados
  const usuariosOrdenados = [...usuariosFiltrados].sort((a, b) => {
    switch (ordenarPor) {
      case "compatibilidade":
        return b.compatibilidade - a.compatibilidade
      case "avaliacoes":
        return b.avaliacoes - a.avaliacoes
      case "atividade":
        // Ordenação simplificada por atividade (na vida real seria por data)
        const atividadeValor = (atividade: string) => {
          if (atividade === "Hoje") return 4
          if (atividade === "Ontem") return 3
          if (atividade.includes("dias")) return 2
          return 1
        }
        return atividadeValor(b.ultimaAtividade) - atividadeValor(a.ultimaAtividade)
      default:
        return 0
    }
  })

  // Paginação
  const totalPaginas = Math.ceil(usuariosOrdenados.length / USUARIOS_POR_PAGINA)
  const usuariosPaginaAtual = usuariosOrdenados.slice(
    (paginaAtual - 1) * USUARIOS_POR_PAGINA,
    paginaAtual * USUARIOS_POR_PAGINA,
  )

  const limparFiltros = () => {
    setTermoBusca("")
    setGenerosSelecionados([])
    setCompatibilidadeMinima(0)
    setAvaliacoesMinimas(0)
    setOrdenarPor("compatibilidade")
  }

  const toggleGenero = (genero: string) => {
    setGenerosSelecionados((prev) => (prev.includes(genero) ? prev.filter((g) => g !== genero) : [...prev, genero]))
  }

  // Encontrar usuário pelo ID
  const getUsuarioById = (id: string) => {
    return usuariosMock.find((usuario) => usuario.id === id) || null
  }

  // Função para gerar os links de paginação
  const renderPaginationLinks = () => {
    const links = []

    // Sempre mostrar a primeira página
    links.push(
      <PaginationItem key="first">
        <PaginationLink isActive={paginaAtual === 1} onClick={() => setPaginaAtual(1)}>
          1
        </PaginationLink>
      </PaginationItem>,
    )

    // Se houver muitas páginas, mostrar reticências após a primeira página
    if (paginaAtual > 3) {
      links.push(
        <PaginationItem key="ellipsis1">
          <PaginationEllipsis />
        </PaginationItem>,
      )
    }

    // Mostrar páginas ao redor da página atual
    for (let i = Math.max(2, paginaAtual - 1); i <= Math.min(totalPaginas - 1, paginaAtual + 1); i++) {
      if (i === 1 || i === totalPaginas) continue // Pular primeira e última página, já que são tratadas separadamente

      links.push(
        <PaginationItem key={i}>
          <PaginationLink isActive={paginaAtual === i} onClick={() => setPaginaAtual(i)}>
            {i}
          </PaginationLink>
        </PaginationItem>,
      )
    }

    // Se houver muitas páginas, mostrar reticências antes da última página
    if (paginaAtual < totalPaginas - 2) {
      links.push(
        <PaginationItem key="ellipsis2">
          <PaginationEllipsis />
        </PaginationItem>,
      )
    }

    // Sempre mostrar a última página, se houver mais de uma página
    if (totalPaginas > 1) {
      links.push(
        <PaginationItem key="last">
          <PaginationLink isActive={paginaAtual === totalPaginas} onClick={() => setPaginaAtual(totalPaginas)}>
            {totalPaginas}
          </PaginationLink>
        </PaginationItem>,
      )
    }

    return links
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-zinc-900 text-white">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <section className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Usuários</h1>
          <p className="text-zinc-400">
            Encontre outros cinéfilos com gostos semelhantes e descubra novas recomendações
          </p>
        </section>

        {/* Barra de busca e filtros */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              type="search"
              placeholder="Buscar por nome, gêneros favoritos ou filmes..."
              className="pl-10 bg-zinc-800 border-zinc-700 focus-visible:ring-amber-500 text-white placeholder:text-zinc-400"
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            {/* Dropdown de ordenação */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700">
                  Ordenar por
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-zinc-800 border-zinc-700 text-white">
                <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-zinc-700" />
                <DropdownMenuCheckboxItem
                  checked={ordenarPor === "compatibilidade"}
                  onCheckedChange={() => setOrdenarPor("compatibilidade")}
                >
                  Compatibilidade
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={ordenarPor === "avaliacoes"}
                  onCheckedChange={() => setOrdenarPor("avaliacoes")}
                >
                  Mais avaliações
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={ordenarPor === "atividade"}
                  onCheckedChange={() => setOrdenarPor("atividade")}
                >
                  Atividade recente
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Painel de filtros (mobile) */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700">
                  <Filter className="mr-2 h-4 w-4" />
                  Filtros
                  {(generosSelecionados.length > 0 || compatibilidadeMinima > 0 || avaliacoesMinimas > 0) && (
                    <span className="ml-2 bg-amber-500 text-black text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {generosSelecionados.length +
                        (compatibilidadeMinima > 0 ? 1 : 0) +
                        (avaliacoesMinimas > 0 ? 1 : 0)}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="bg-zinc-900 text-white border-zinc-800">
                <SheetHeader>
                  <SheetTitle className="text-white">Filtros</SheetTitle>
                  <SheetDescription className="text-zinc-400">Refine sua busca por outros usuários</SheetDescription>
                </SheetHeader>

                <div className="py-6 space-y-6">
                  {/* Filtro por gênero */}
                  <div>
                    <h3 className="text-sm font-medium mb-3">Gêneros favoritos</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {generosMock.map((genero) => (
                        <div key={genero} className="flex items-center space-x-2">
                          <Checkbox
                            id={`genero-${genero}`}
                            checked={generosSelecionados.includes(genero)}
                            onCheckedChange={() => toggleGenero(genero)}
                            className="data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                          />
                          <Label htmlFor={`genero-${genero}`} className="text-sm text-zinc-300">
                            {genero}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Filtro por compatibilidade */}
                  <div>
                    <h3 className="text-sm font-medium mb-3">Compatibilidade mínima: {compatibilidadeMinima}%</h3>
                    <Slider
                      min={0}
                      max={100}
                      step={5}
                      value={[compatibilidadeMinima]}
                      onValueChange={(value) => setCompatibilidadeMinima(value[0])}
                      className="w-full"
                    />
                  </div>

                  {/* Filtro por avaliações */}
                  <div>
                    <h3 className="text-sm font-medium mb-3">Avaliações mínimas: {avaliacoesMinimas}</h3>
                    <Slider
                      min={0}
                      max={300}
                      step={10}
                      value={[avaliacoesMinimas]}
                      onValueChange={(value) => setAvaliacoesMinimas(value[0])}
                      className="w-full"
                    />
                  </div>
                </div>

                <SheetFooter>
                  <Button
                    variant="outline"
                    className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                    onClick={limparFiltros}
                  >
                    Limpar filtros
                  </Button>
                  <SheetClose asChild>
                    <Button className="w-full bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-600 hover:to-red-700 text-white border-0">
                      Aplicar filtros
                    </Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>

            {/* Botão para limpar filtros */}
            {(generosSelecionados.length > 0 || compatibilidadeMinima > 0 || avaliacoesMinimas > 0 || termoBusca) && (
              <Button variant="ghost" className="text-zinc-400 hover:text-white" onClick={limparFiltros}>
                <X className="mr-2 h-4 w-4" />
                Limpar
              </Button>
            )}
          </div>
        </div>

        {/* Filtros ativos */}
        {generosSelecionados.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {generosSelecionados.map((genero) => (
              <div key={genero} className="bg-zinc-800 text-zinc-200 text-xs rounded-full px-3 py-1 flex items-center">
                {genero}
                <button onClick={() => toggleGenero(genero)} className="ml-2 text-zinc-400 hover:text-white">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Resultados */}
        <div className="mt-6">
          {usuariosOrdenados.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-zinc-400">
                  {usuariosOrdenados.length} usuários encontrados • Mostrando{" "}
                  {(paginaAtual - 1) * USUARIOS_POR_PAGINA + 1}-
                  {Math.min(paginaAtual * USUARIOS_POR_PAGINA, usuariosOrdenados.length)} de {usuariosOrdenados.length}
                </p>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-amber-500" />
                  <span className="text-sm font-medium">Encontre cinéfilos com gostos semelhantes</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {usuariosPaginaAtual.map((usuario) => (
                  <UsuarioCard key={usuario.id} usuario={usuario} onClick={() => setUsuarioSelecionado(usuario.id)} />
                ))}
              </div>

              {/* Paginação */}
              {totalPaginas > 1 && (
                <div className="mt-8">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setPaginaAtual((prev) => Math.max(prev - 1, 1))}
                          className={paginaAtual === 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>

                      {renderPaginationLinks()}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setPaginaAtual((prev) => Math.min(prev + 1, totalPaginas))}
                          className={paginaAtual === totalPaginas ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <Users className="h-16 w-16 mx-auto text-zinc-700 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Nenhum usuário encontrado</h2>
              <p className="text-zinc-400 max-w-md mx-auto mb-6">
                Não encontramos usuários que correspondam aos seus filtros. Tente ajustar seus critérios de busca.
              </p>
              <Button variant="outline" className="border-zinc-700 hover:bg-zinc-800" onClick={limparFiltros}>
                Limpar todos os filtros
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Modal de perfil de usuário */}
      {usuarioSelecionado && (
        <UsuarioPerfilModal
          usuario={getUsuarioById(usuarioSelecionado)}
          aberto={!!usuarioSelecionado}
          onClose={() => setUsuarioSelecionado(null)}
        />
      )}
    </div>
  )
}
