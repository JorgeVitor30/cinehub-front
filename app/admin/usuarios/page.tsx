"use client"

import { useState } from "react"
import {
  Search,
  MoreHorizontal,
  Mail,
  Eye,
  Ban,
  UserCheck,
  Shield,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Filter,
} from "lucide-react"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"

// Dados mockados para a lista de usuários
const usuariosMock = [
  {
    id: 1,
    nome: "João Silva",
    email: "joao.silva@email.com",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "ativo",
    tipo: "admin",
    dataCadastro: "10/03/2023",
    ultimoAcesso: "Hoje, 10:45",
    avaliacoes: 127,
  },
  {
    id: 2,
    nome: "Maria Oliveira",
    email: "maria.oliveira@email.com",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "ativo",
    tipo: "usuario",
    dataCadastro: "15/04/2023",
    ultimoAcesso: "Ontem, 18:30",
    avaliacoes: 98,
  },
  {
    id: 3,
    nome: "Pedro Santos",
    email: "pedro.santos@email.com",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "ativo",
    tipo: "usuario",
    dataCadastro: "22/05/2023",
    ultimoAcesso: "Há 3 dias",
    avaliacoes: 85,
  },
  {
    id: 4,
    nome: "Ana Costa",
    email: "ana.costa@email.com",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "ativo",
    tipo: "usuario",
    dataCadastro: "05/06/2023",
    ultimoAcesso: "Há 1 semana",
    avaliacoes: 72,
  },
  {
    id: 5,
    nome: "Carlos Ferreira",
    email: "carlos.ferreira@email.com",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "inativo",
    tipo: "usuario",
    dataCadastro: "18/07/2023",
    ultimoAcesso: "Há 2 meses",
    avaliacoes: 64,
  },
  {
    id: 6,
    nome: "Fernanda Lima",
    email: "fernanda.lima@email.com",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "ativo",
    tipo: "moderador",
    dataCadastro: "30/08/2023",
    ultimoAcesso: "Hoje, 09:15",
    avaliacoes: 112,
  },
  {
    id: 7,
    nome: "Ricardo Gomes",
    email: "ricardo.gomes@email.com",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "ativo",
    tipo: "usuario",
    dataCadastro: "12/09/2023",
    ultimoAcesso: "Ontem, 14:20",
    avaliacoes: 43,
  },
  {
    id: 8,
    nome: "Juliana Martins",
    email: "juliana.martins@email.com",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "suspenso",
    tipo: "usuario",
    dataCadastro: "25/10/2023",
    ultimoAcesso: "Há 3 semanas",
    avaliacoes: 29,
  },
  {
    id: 9,
    nome: "Marcelo Alves",
    email: "marcelo.alves@email.com",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "ativo",
    tipo: "usuario",
    dataCadastro: "08/11/2023",
    ultimoAcesso: "Hoje, 08:30",
    avaliacoes: 51,
  },
  {
    id: 10,
    nome: "Camila Souza",
    email: "camila.souza@email.com",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "ativo",
    tipo: "usuario",
    dataCadastro: "14/12/2023",
    ultimoAcesso: "Há 2 dias",
    avaliacoes: 37,
  },
]

export default function AdminUsuariosPage() {
  const [usuarios, setUsuarios] = useState(usuariosMock)
  const [termoBusca, setTermoBusca] = useState("")
  const [filtroStatus, setFiltroStatus] = useState<string>("todos")
  const [filtroTipo, setFiltroTipo] = useState<string>("todos")
  const [usuarioParaAcao, setUsuarioParaAcao] = useState<{ id: number; acao: string } | null>(null)

  // Filtrar usuários com base nos critérios
  const usuariosFiltrados = usuarios.filter((usuario) => {
    // Filtro de busca
    const matchBusca =
      usuario.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
      usuario.email.toLowerCase().includes(termoBusca.toLowerCase())

    // Filtro de status
    const matchStatus = filtroStatus === "todos" || usuario.status === filtroStatus

    // Filtro de tipo
    const matchTipo = filtroTipo === "todos" || usuario.tipo === filtroTipo

    return matchBusca && matchStatus && matchTipo
  })

  // Função para alterar o status de um usuário
  const alterarStatusUsuario = () => {
    if (!usuarioParaAcao) return

    setUsuarios(
      usuarios.map((usuario) => {
        if (usuario.id === usuarioParaAcao.id) {
          let novoStatus = usuario.status

          switch (usuarioParaAcao.acao) {
            case "ativar":
              novoStatus = "ativo"
              break
            case "suspender":
              novoStatus = "suspenso"
              break
            case "desativar":
              novoStatus = "inativo"
              break
          }

          return { ...usuario, status: novoStatus }
        }
        return usuario
      }),
    )

    setUsuarioParaAcao(null)
  }

  // Função para promover um usuário a administrador
  const promoverUsuario = () => {
    if (!usuarioParaAcao) return

    setUsuarios(
      usuarios.map((usuario) => {
        if (usuario.id === usuarioParaAcao.id) {
          return { ...usuario, tipo: "admin" }
        }
        return usuario
      }),
    )

    setUsuarioParaAcao(null)
  }

  // Função para lidar com ações do menu
  const handleMenuAction = (userId: number, acao: string) => {
    setUsuarioParaAcao({ id: userId, acao })
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
                <h1 className="text-2xl font-bold">Gerenciar Usuários</h1>
                <p className="text-zinc-400">Visualize e gerencie os usuários da plataforma</p>
                <div className="mt-2">
                  <Link href="/admin">
                    <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                      Voltar ao Dashboard
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                  onClick={() => {
                    setTermoBusca("")
                    setFiltroStatus("todos")
                    setFiltroTipo("todos")
                  }}
                >
                  Limpar Filtros
                </Button>
              </div>
            </div>

            {/* Barra de busca e filtros */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="md:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  type="search"
                  placeholder="Buscar por nome ou email..."
                  className="pl-10 bg-zinc-800 border-zinc-700 focus-visible:ring-amber-500 text-white placeholder:text-zinc-400"
                  value={termoBusca}
                  onChange={(e) => setTermoBusca(e.target.value)}
                />
              </div>

              <div>
                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 focus:ring-amber-500">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-zinc-400" />
                      <SelectValue placeholder="Status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectItem value="todos">Todos os status</SelectItem>
                    <SelectItem value="ativo">Ativos</SelectItem>
                    <SelectItem value="inativo">Inativos</SelectItem>
                    <SelectItem value="suspenso">Suspensos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 focus:ring-amber-500">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-zinc-400" />
                      <SelectValue placeholder="Tipo" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectItem value="todos">Todos os tipos</SelectItem>
                    <SelectItem value="admin">Administradores</SelectItem>
                    <SelectItem value="moderador">Moderadores</SelectItem>
                    <SelectItem value="usuario">Usuários</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tabela de usuários */}
            <div className="bg-zinc-800 rounded-md border border-zinc-700 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-zinc-700/50 border-zinc-700">
                    <TableHead className="text-zinc-400 font-medium">
                      <div className="flex items-center">
                        Usuário
                        <ArrowUpDown className="ml-1 h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead className="text-zinc-400 font-medium">Status</TableHead>
                    <TableHead className="text-zinc-400 font-medium">Tipo</TableHead>
                    <TableHead className="text-zinc-400 font-medium">Cadastro</TableHead>
                    <TableHead className="text-zinc-400 font-medium">Último Acesso</TableHead>
                    <TableHead className="text-zinc-400 font-medium text-center">Avaliações</TableHead>
                    <TableHead className="text-zinc-400 font-medium text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usuariosFiltrados.length > 0 ? (
                    usuariosFiltrados.map((usuario) => (
                      <TableRow key={usuario.id} className="hover:bg-zinc-700/50 border-zinc-700">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={usuario.avatar || undefined} alt={usuario.nome} />
                              <AvatarFallback className="bg-zinc-700">{usuario.nome.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{usuario.nome}</p>
                              <p className="text-xs text-zinc-400">{usuario.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {usuario.status === "ativo" ? (
                            <Badge className="bg-green-500/20 text-green-500 border-0">Ativo</Badge>
                          ) : usuario.status === "inativo" ? (
                            <Badge className="bg-zinc-500/20 text-zinc-400 border-0">Inativo</Badge>
                          ) : (
                            <Badge className="bg-red-500/20 text-red-500 border-0">Suspenso</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {usuario.tipo === "admin" ? (
                            <Badge className="bg-amber-500/20 text-amber-500 border-0">Admin</Badge>
                          ) : usuario.tipo === "moderador" ? (
                            <Badge className="bg-blue-500/20 text-blue-500 border-0">Moderador</Badge>
                          ) : (
                            <Badge className="bg-zinc-500/20 text-zinc-400 border-0">Usuário</Badge>
                          )}
                        </TableCell>
                        <TableCell>{usuario.dataCadastro}</TableCell>
                        <TableCell>{usuario.ultimoAcesso}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center">
                            <span className="bg-amber-500/20 text-amber-500 px-2 py-1 rounded-full text-xs font-medium">
                              {usuario.avaliacoes}
                            </span>
                          </div>
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
                              <DropdownMenuItem className="hover:bg-zinc-700 cursor-pointer">
                                <Eye className="mr-2 h-4 w-4" />
                                Ver perfil
                              </DropdownMenuItem>
                              <DropdownMenuItem className="hover:bg-zinc-700 cursor-pointer">
                                <Mail className="mr-2 h-4 w-4" />
                                Enviar mensagem
                              </DropdownMenuItem>

                              <DropdownMenuSeparator className="bg-zinc-700" />

                              {usuario.status !== "ativo" && (
                                <DropdownMenuItem
                                  className="text-green-500 hover:bg-green-500/10 hover:text-green-500 cursor-pointer"
                                  onSelect={() => handleMenuAction(usuario.id, "ativar")}
                                >
                                  <UserCheck className="mr-2 h-4 w-4" />
                                  Ativar usuário
                                </DropdownMenuItem>
                              )}

                              {usuario.status !== "suspenso" && (
                                <DropdownMenuItem
                                  className="text-orange-500 hover:bg-orange-500/10 hover:text-orange-500 cursor-pointer"
                                  onSelect={() => handleMenuAction(usuario.id, "suspender")}
                                >
                                  <Ban className="mr-2 h-4 w-4" />
                                  Suspender usuário
                                </DropdownMenuItem>
                              )}

                              {usuario.status !== "inativo" && (
                                <DropdownMenuItem
                                  className="text-red-500 hover:bg-red-500/10 hover:text-red-500 cursor-pointer"
                                  onSelect={() => handleMenuAction(usuario.id, "desativar")}
                                >
                                  <Ban className="mr-2 h-4 w-4" />
                                  Desativar usuário
                                </DropdownMenuItem>
                              )}

                              {usuario.tipo !== "admin" && (
                                <>
                                  <DropdownMenuSeparator className="bg-zinc-700" />
                                  <DropdownMenuItem
                                    className="text-amber-500 hover:bg-amber-500/10 hover:text-amber-500 cursor-pointer"
                                    onSelect={() => handleMenuAction(usuario.id, "promover")}
                                  >
                                    <Shield className="mr-2 h-4 w-4" />
                                    Promover a admin
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-zinc-400">
                        Nenhum usuário encontrado com os critérios de busca.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Paginação */}
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-zinc-400">
                Mostrando <span className="font-medium text-white">{usuariosFiltrados.length}</span> de{" "}
                <span className="font-medium text-white">{usuarios.length}</span> usuários
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

      {/* Diálogo de confirmação para alterar status do usuário */}
      <AlertDialog
        open={usuarioParaAcao !== null && ["ativar", "suspender", "desativar"].includes(usuarioParaAcao?.acao || "")}
        onOpenChange={(open) => !open && setUsuarioParaAcao(null)}
      >
        <AlertDialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {usuarioParaAcao?.acao === "ativar"
                ? "Ativar usuário"
                : usuarioParaAcao?.acao === "suspender"
                  ? "Suspender usuário"
                  : "Desativar usuário"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              {usuarioParaAcao?.acao === "ativar"
                ? "Tem certeza que deseja ativar este usuário? Ele poderá acessar a plataforma normalmente."
                : usuarioParaAcao?.acao === "suspender"
                  ? "Tem certeza que deseja suspender este usuário? Ele não poderá acessar a plataforma temporariamente."
                  : "Tem certeza que deseja desativar este usuário? Ele não poderá acessar a plataforma até ser reativado."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className={
                usuarioParaAcao?.acao === "ativar"
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : usuarioParaAcao?.acao === "suspender"
                    ? "bg-orange-600 hover:bg-orange-700 text-white"
                    : "bg-red-600 hover:bg-red-700 text-white"
              }
              onClick={alterarStatusUsuario}
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo de confirmação para promover usuário */}
      <AlertDialog
        open={usuarioParaAcao !== null && usuarioParaAcao?.acao === "promover"}
        onOpenChange={(open) => !open && setUsuarioParaAcao(null)}
      >
        <AlertDialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Promover a Administrador</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Tem certeza que deseja promover este usuário a administrador? Ele terá acesso completo ao painel
              administrativo e todas as funcionalidades da plataforma.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction className="bg-amber-600 hover:bg-amber-700 text-white" onClick={promoverUsuario}>
              Promover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

