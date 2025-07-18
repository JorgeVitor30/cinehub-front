"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Star, Film, Clock, Calendar, BarChart3, MessageCircle, UserPlus, X } from "lucide-react"
import { userService, type User } from "@/app/services/userService"
import { authService } from "@/app/services/authService"

interface Usuario {
  id: string
  nome: string
  avatar: string
  nivel: string
  avaliacoes: number
  generosFavoritos: string[]
  filmesFavoritos: string[]
  compatibilidade: number
  ultimaAtividade: string
  bio: string
  createdAt?: string
  ratedList?: {
    id: string
    movie: {
      id: string
      title: string
      posterPhotoUrl: string
      releaseDate: string
      voteAverage: number | { source: string; parsedValue: number }
    }
    rate: number
    comment: string
  }[]
}

interface UsuarioPerfilModalProps {
  usuario: Usuario | null
  aberto: boolean
  onClose: () => void
}

export default function UsuarioPerfilModal({ usuario, aberto, onClose }: UsuarioPerfilModalProps) {
  const [activeTab, setActiveTab] = useState("perfil")
  const [usuarioLogado, setUsuarioLogado] = useState<User | null>(null)
  const [filmesEmComum, setFilmesEmComum] = useState<any[]>([])
  const [compatibilidadeGeneros, setCompatibilidadeGeneros] = useState<{genero: string, compatibilidade: number}[]>([])

  // Buscar usuário logado quando o modal abrir
  useEffect(() => {
    const fetchUsuarioLogado = async () => {
      if (aberto && usuario) {
        try {
          const decodedUser = await authService.getUserFromToken()
          if (decodedUser?.nameid) {
            const usuarioLogadoData = await userService.getUserById(decodedUser.nameid)
            setUsuarioLogado(usuarioLogadoData)
          }
        } catch (error) {
          console.error('Erro ao buscar usuário logado:', error)
        }
      }
    }

    fetchUsuarioLogado()
  }, [aberto, usuario])

  // Calcular filmes em comum e compatibilidade de gêneros
  useEffect(() => {
    if (usuarioLogado && usuario && usuario.ratedList) {
      // Calcular filmes em comum
      const filmesUsuarioLogado = new Set(usuarioLogado.ratedList?.map((rate: any) => rate.movie.id) || [])
      const filmesEmComumData = usuario.ratedList.filter(rate => 
        filmesUsuarioLogado.has(rate.movie.id)
      )
      setFilmesEmComum(filmesEmComumData)

      // Calcular compatibilidade de gêneros
      let generosUsuarioLogado: string[] = []
      
      if (usuarioLogado.filmesAssistidosPorGenero && usuarioLogado.filmesAssistidosPorGenero.length > 0) {
        generosUsuarioLogado = usuarioLogado.filmesAssistidosPorGenero
          .sort((a, b) => b.quantidade - a.quantidade)
          .slice(0, 3)
          .map(item => item.genero.trim())
      } else if (usuarioLogado.genre) {
        generosUsuarioLogado = [usuarioLogado.genre.trim()]
      }

      const generosUsuarioAtual = usuario.generosFavoritos.slice(0, 3).map(genero => genero.trim())
      
      const compatibilidadeData = generosUsuarioAtual.map((genero, index) => {
        const temGenero = generosUsuarioLogado.some(generoLogado => 
          generoLogado.toLowerCase() === genero.toLowerCase()
        )
        return {
          genero,
          compatibilidade: temGenero ? (index === 0 ? 90 : index === 1 ? 70 : 50) : 20
        }
      })
      
      setCompatibilidadeGeneros(compatibilidadeData)
    }
  }, [usuarioLogado, usuario])

  if (!usuario) {
    return null
  }

  // Determinar a cor da compatibilidade
  const getCompatibilidadeCor = (valor: number) => {
    if (valor >= 80) return "text-green-500"
    if (valor >= 60) return "text-amber-500"
    if (valor >= 40) return "text-orange-500"
    return "text-red-500"
  }

  // Função para extrair valor numérico da avaliação
  const extractNumericValue = (value: number | { source: string; parsedValue: number }): number => {
    if (typeof value === 'number') return value
    return value.parsedValue
  }

  return (
    <Dialog open={aberto} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl bg-zinc-900 text-white border-zinc-800 p-0 overflow-hidden">
        {/* Cabeçalho do perfil */}
        <div className="relative bg-gradient-to-b from-zinc-800 to-zinc-900 p-6">
          {/* Botão de fechar */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <Avatar className="h-24 w-24 border-2 border-amber-500">
              <AvatarImage src={usuario.avatar || undefined} alt={usuario.nome} />
              <AvatarFallback className="bg-zinc-800 text-2xl">{usuario.nome.charAt(0)}</AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold">{usuario.nome}</h2>
              <p className="text-zinc-400">{usuario.nivel}</p>

              <div className="flex flex-wrap gap-2 mt-2 justify-center md:justify-start">
                {usuario.generosFavoritos.map((genero, index) => (
                  <Badge key={index} variant="outline" className="bg-zinc-800 border-zinc-700 text-zinc-300">
                    {genero}
                  </Badge>
                ))}
              </div>

              <div className="mt-4 flex flex-col md:flex-row gap-4 md:items-center">
                <div className="flex items-center gap-2">
                  <div className={`text-lg font-bold ${getCompatibilidadeCor(usuario.compatibilidade)}`}>
                    {usuario.compatibilidade}%
                  </div>
                  <div className="text-sm text-zinc-400">compatibilidade</div>
                </div>

                <Separator className="hidden md:block h-6 w-px bg-zinc-700" />

                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-500" />
                  <div className="text-lg font-bold">{usuario.avaliacoes}</div>
                  <div className="text-sm text-zinc-400">avaliações</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo do perfil */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="p-6">
          <TabsList className="bg-zinc-800 border-zinc-700 p-1 mb-6">
            <TabsTrigger value="perfil" className="data-[state=active]:bg-amber-500 data-[state=active]:text-black">
              Perfil
            </TabsTrigger>
            <TabsTrigger value="avaliacoes" className="data-[state=active]:bg-amber-500 data-[state=active]:text-black">
              Avaliações
            </TabsTrigger>
            <TabsTrigger value="comum" className="data-[state=active]:bg-amber-500 data-[state=active]:text-black">
              Em Comum
            </TabsTrigger>
          </TabsList>

          {/* Aba de Perfil */}
          <TabsContent value="perfil" className="space-y-6">
            <div className="bg-zinc-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2">Sobre</h3>
              <p className="text-zinc-300">{usuario.bio}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-zinc-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Film className="h-5 w-5 mr-2 text-amber-500" />
                  Filmes Favoritos
                </h3>
                <ul className="space-y-2">
                  {usuario.filmesFavoritos.map((filme, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="bg-zinc-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">
                        {index + 1}
                      </div>
                      <span>{filme}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-zinc-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-amber-500" />
                  Estatísticas
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-zinc-400">Nível</span>
                      <span className="text-sm text-amber-500">{usuario.nivel}</span>
                    </div>
                    <Progress value={75} className="h-2 bg-zinc-700" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-zinc-700 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold">{usuario.avaliacoes}</div>
                      <p className="text-xs text-zinc-400">Avaliações</p>
                    </div>
                    <div className="bg-zinc-700 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold">
                        {usuario.ratedList && usuario.ratedList.length > 0 
                          ? (usuario.ratedList.reduce((sum, rated) => sum + rated.rate, 0) / usuario.ratedList.length).toFixed(1)
                          : '0.0'
                        }
                      </div>
                      <p className="text-xs text-zinc-400">Média</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-zinc-400" />
                      <span>
                        Membro desde {usuario.createdAt ? new Date(usuario.createdAt).getFullYear() : '2023'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-zinc-400" />
                      <span>Ativo {usuario.ultimaAtividade}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Aba de Avaliações */}
          <TabsContent value="avaliacoes" className="space-y-6">
            <div className="bg-zinc-800 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Avaliações Recentes</h3>
                <Badge className="bg-amber-500 text-black">{usuario.ratedList?.length || 0} filmes</Badge>
              </div>

              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {usuario.ratedList && usuario.ratedList.length > 0 ? (
                  usuario.ratedList.map((rated) => (
                    <div
                      key={rated.id}
                      className="flex items-center gap-4 p-3 rounded-lg bg-zinc-700 hover:bg-zinc-600 transition-colors cursor-pointer"
                    >
                      <div className="relative w-16 h-24 flex-shrink-0 overflow-hidden rounded">
                        <Image src={rated.movie.posterPhotoUrl || "/placeholder.svg"} alt={rated.movie.title} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-white truncate">{rated.movie.title}</h4>
                        <div className="flex items-center gap-2 text-sm text-zinc-400">
                          <span>{new Date(rated.movie.releaseDate).getFullYear()}</span>
                        </div>
                        <div className="flex items-center mt-1">
                          <Star className="h-4 w-4 text-amber-500 fill-amber-500 mr-1" />
                          <span className="text-sm font-medium">{extractNumericValue(rated.movie.voteAverage).toFixed(1)}</span>
                          <span className="text-xs text-zinc-500 ml-1">global</span>
                        </div>
                      </div>
                      <div className="flex-shrink-0 flex gap-2">
                        <div className="bg-zinc-800 rounded-full px-3 py-1 text-sm font-bold text-amber-500">
                          {rated.rate}/10
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Star className="h-12 w-12 mx-auto text-zinc-700 mb-3" />
                    <h3 className="text-lg font-medium text-zinc-400">Nenhuma avaliação</h3>
                    <p className="text-zinc-500 text-sm mt-1">Este usuário ainda não avaliou nenhum filme</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Aba de Em Comum */}
          <TabsContent value="comum" className="space-y-6">
            <div className="bg-zinc-800 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Filmes em Comum</h3>
                <Badge className="bg-amber-500 text-black">{filmesEmComum.length} filmes</Badge>
              </div>

              {filmesEmComum.length > 0 ? (
                <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                  {filmesEmComum.map((rated) => (
                    <div
                      key={rated.id}
                      className="flex items-center gap-3 p-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 transition-colors cursor-pointer"
                    >
                      <div className="relative w-12 h-16 flex-shrink-0 overflow-hidden rounded">
                        <Image src={rated.movie.posterPhotoUrl || "/placeholder.svg"} alt={rated.movie.title} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-white text-sm truncate">{rated.movie.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-zinc-400">
                          <span>{new Date(rated.movie.releaseDate).getFullYear()}</span>
                          <span>•</span>
                          <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                          <span>{extractNumericValue(rated.movie.voteAverage).toFixed(1)}</span>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <div className="bg-zinc-800 rounded-full px-2 py-1 text-xs font-bold text-amber-500">
                          {rated.rate}/10
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Film className="h-8 w-8 mx-auto text-zinc-700 mb-2" />
                  <h3 className="text-sm font-medium text-zinc-400">Nenhum filme em comum</h3>
                  <p className="text-zinc-500 text-xs mt-1">Vocês ainda não avaliaram os mesmos filmes</p>
                </div>
              )}
            </div>

            <div className="bg-zinc-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">Compatibilidade de Gêneros</h3>
              <div className="space-y-3">
                {compatibilidadeGeneros.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">{item.genero}</span>
                      <span className="text-xs text-zinc-400">
                        {item.compatibilidade}%
                      </span>
                    </div>
                    <Progress value={item.compatibilidade} className="h-2 bg-zinc-700" />
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
