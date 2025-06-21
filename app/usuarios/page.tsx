"use client"

import { useState, useEffect } from "react"
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
import UsuarioPerfilModal from "@/components/usuario-perfil-modal"
import { userService, type ReadAllUserDto } from "@/app/services/userService"

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

export default function ComunidadePage() {
  const [usuarios, setUsuarios] = useState<ReadAllUserDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [termoBusca, setTermoBusca] = useState("")
  const [generosSelecionados, setGenerosSelecionados] = useState<string[]>([])
  const [compatibilidadeMinima, setCompatibilidadeMinima] = useState(0)
  const [avaliacoesMinimas, setAvaliacoesMinimas] = useState(0)
  const [ordenarPor, setOrdenarPor] = useState<"compatibilidade" | "avaliacoes" | "atividade">("compatibilidade")
  const [paginaAtual, setPaginaAtual] = useState(1)
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<string | null>(null)

  // Número de usuários por página
  const USUARIOS_POR_PAGINA = 6

  // Função para mapear ReadAllUserDto para o formato do UsuarioCard
  const mapearParaUsuarioCard = (user: ReadAllUserDto) => {
    // Calcular compatibilidade baseada nos gêneros selecionados
    const calcularCompatibilidade = () => {
      if (generosSelecionados.length === 0) return 85 // Valor padrão quando não há filtros
      const generosComuns = user.topGenres.filter(genero => generosSelecionados.includes(genero))
      return Math.round((generosComuns.length / generosSelecionados.length) * 100)
    }

    // Determinar nível baseado no número de avaliações
    const determinarNivel = (rateCount: number) => {
      if (rateCount >= 200) return "Crítica Master"
      if (rateCount >= 100) return "Cinéfilo Experiente"
      if (rateCount >= 50) return "Entusiasta de Cinema"
      if (rateCount >= 20) return "Cinéfilo Casual"
      return "Cinéfilo Novato"
    }

    // Calcular última atividade baseada na data de criação
    const calcularUltimaAtividade = (createdAt: string) => {
      const dataCriacao = new Date(createdAt)
      const agora = new Date()
      const diffDias = Math.floor((agora.getTime() - dataCriacao.getTime()) / (1000 * 60 * 60 * 24))
      
      if (diffDias === 0) return "Hoje"
      if (diffDias === 1) return "Ontem"
      if (diffDias < 7) return `${diffDias} dias atrás`
      if (diffDias < 30) return `${Math.floor(diffDias / 7)} semanas atrás`
      return `${Math.floor(diffDias / 30)} meses atrás`
    }

    // Obter filmes favoritos dos últimos 5 filmes avaliados
    const filmesFavoritos = user.ratedList
      .slice(0, 5)
      .map(rate => rate.movie.title)

    return {
      id: user.id,
      nome: user.name,
      avatar: user.photo || "/placeholder.svg?height=200&width=200",
      nivel: determinarNivel(user.rateCount),
      avaliacoes: user.rateCount,
      generosFavoritos: user.topGenres,
      filmesFavoritos: filmesFavoritos,
      compatibilidade: calcularCompatibilidade(),
      ultimaAtividade: calcularUltimaAtividade(user.createdAt),
      bio: `Cinéfilo com ${user.rateCount} avaliações. Gênero favorito: ${user.genre}.`
    }
  }

  // Carregar usuários da API
  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        setLoading(true)
        setError(null)
        const usuariosData = await userService.getAllUsers()
        setUsuarios(usuariosData)
      } catch (err) {
        console.error('Erro ao carregar usuários:', err)
        setError('Erro ao carregar usuários. Tente novamente.')
      } finally {
        setLoading(false)
      }
    }

    fetchUsuarios()
  }, [])

  // Aplicar filtros
  const usuariosFiltrados = (usuarios || []).filter((usuario) => {
    // Filtrar por termo de busca
    const matchBusca =
      usuario.name.toLowerCase().includes(termoBusca.toLowerCase()) ||
      usuario.topGenres.some((genero) => genero.toLowerCase().includes(termoBusca.toLowerCase())) ||
      usuario.ratedList.some((rate) => rate.movie.title.toLowerCase().includes(termoBusca.toLowerCase()))

    // Filtrar por gêneros
    const matchGeneros =
      generosSelecionados.length === 0 ||
      generosSelecionados.some((genero) => usuario.topGenres.includes(genero))

    // Calcular compatibilidade baseada nos gêneros em comum
    const calcularCompatibilidade = (userGenres: string[]) => {
      if (generosSelecionados.length === 0) return 100
      const generosComuns = userGenres.filter(genero => generosSelecionados.includes(genero))
      return Math.round((generosComuns.length / generosSelecionados.length) * 100)
    }
    
    const compatibilidade = calcularCompatibilidade(usuario.topGenres)
    const matchCompatibilidade = compatibilidade >= compatibilidadeMinima

    // Filtrar por avaliações mínimas
    const matchAvaliacoes = usuario.rateCount >= avaliacoesMinimas

    return matchBusca && matchGeneros && matchCompatibilidade && matchAvaliacoes
  })

  // Ordenar resultados
  const usuariosOrdenados = [...usuariosFiltrados].sort((a, b) => {
    switch (ordenarPor) {
      case "compatibilidade":
        const compatibilidadeA = generosSelecionados.length === 0 ? 100 : 
          Math.round((a.topGenres.filter(g => generosSelecionados.includes(g)).length / generosSelecionados.length) * 100)
        const compatibilidadeB = generosSelecionados.length === 0 ? 100 : 
          Math.round((b.topGenres.filter(g => generosSelecionados.includes(g)).length / generosSelecionados.length) * 100)
        return compatibilidadeB - compatibilidadeA
      case "avaliacoes":
        return b.rateCount - a.rateCount
      case "atividade":
        // Ordenação por data de criação (mais recente primeiro)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
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
    const usuario = (usuarios || []).find((usuario) => usuario.id === id)
    return usuario ? mapearParaUsuarioCard(usuario) : null
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
          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold mb-2">Carregando usuários...</h2>
              <p className="text-zinc-400">Buscando cinéfilos na comunidade</p>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <Users className="h-16 w-16 mx-auto text-red-500 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Erro ao carregar usuários</h2>
              <p className="text-zinc-400 max-w-md mx-auto mb-6">{error}</p>
              <Button 
                variant="outline" 
                className="border-zinc-700 hover:bg-zinc-800"
                onClick={() => window.location.reload()}
              >
                Tentar novamente
              </Button>
            </div>
          ) : usuariosOrdenados.length > 0 ? (
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
                  <UsuarioCard key={usuario.id} usuario={mapearParaUsuarioCard(usuario)} onClick={() => setUsuarioSelecionado(usuario.id)} />
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
