"use client"

import Image from "next/image"
import {
  Mail,
  Calendar,
  Film,
  Clock,
  Edit,
  Camera,
  LogOut,
  Lock,
  Heart,
  Star,
  ChevronRight,
  BarChart3,
  Upload,
  Sparkles,
  FileText,
  Send,
  Bot,
  User as UserIcon,
} from "lucide-react"
import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import FilmeModal, { type FilmeDetalhado } from "@/components/filme-modal"
import EditarPerfilModal from "@/components/editar-perfil-modal"
import AlterarSenhaModal from "@/components/alterar-senha-modal"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { authService } from "@/app/services/authService"
import { useState, useEffect } from "react"
import { userService } from "@/app/services/userService"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { type Movie, movieService } from "@/app/services/movieService"
import { type User } from "@/app/services/userService"
import { rateService } from "@/app/services/rateService"

// Função para mapear os filmes da API para o formato esperado pelo componente
const mapMovieToFilmeDetalhado = (movie: Movie, userRating?: { id?: string, rate: number, comment: string }): FilmeDetalhado => {
  // Função auxiliar para extrair valor numérico
  const extractNumericValue = (value: number | { source: string; parsedValue: number }): number => {
    if (typeof value === 'number') return value
    return value.parsedValue
  }

  return {
    id: movie.id,
    titulo: movie.title,
    capa: movie.posterPhotoUrl,
    banner: movie.backPhotoUrl,
    avaliacao: extractNumericValue(movie.voteAverage),
    duracao: `${Math.floor(movie.runTime / 60)}h ${movie.runTime % 60}m`,
    ano: new Date(movie.releaseDate).getFullYear(),
    generos: movie.genres.split(',').map(g => g.trim()),
    lingua: movie.originalLanguage,
    orcamento: `$${(Number(movie.budget) / 1000000).toFixed(0)} milhões`,
    descricao: movie.overview,
    producoes: movie.productions.split(',').map(p => ({ nome: p.trim() })),
    userRating: userRating && userRating.id ? {
      id: userRating.id,
      rate: userRating.rate,
      comment: userRating.comment
    } : undefined,
    voteCount: movie.voteCount
  }
}

export default function PerfilPage() {
  const [filmeAberto, setFilmeAberto] = useState<FilmeDetalhado | null>(null)
  const [editarPerfilAberto, setEditarPerfilAberto] = useState(false)
  const [alterarSenhaAberto, setAlterarSenhaAberto] = useState(false)
  const [abaAtual, setAbaAtual] = useState("favoritos")
  const [fotoModalAberto, setFotoModalAberto] = useState(false)
  const [userData, setUserData] = useState<User | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [filmesRecomendados, setFilmesRecomendados] = useState<Movie[]>([])
  const [loadingRecomendacoes, setLoadingRecomendacoes] = useState(false)
  const [erroRecomendacoes, setErroRecomendacoes] = useState<string | null>(null)
  const [chatMessages, setChatMessages] = useState<Array<{ type: 'user' | 'bot', content: string }>>([
    {
      type: 'bot',
      content: `Olá! 👋 Sou o assistente de filmes do CineHub. 

Posso te ajudar com:
🎬 Recomendações personalizadas de filmes
📝 Informações sobre filmes, diretores e atores  
🎭 Análises e críticas cinematográficas
🎪 Dicas sobre gêneros e tendências
💬 Discussões sobre cinema e cultura pop

Como posso te ajudar hoje?`
    }
  ])
  const [chatInput, setChatInput] = useState('')
  const [loadingChat, setLoadingChat] = useState(false)

  // Função para atualizar a avaliação na lista
  const handleRatingUpdate = async (movieId: string, newRating: number, newComment: string) => {
    if (!userData) return

    try {
      // Encontrar a avaliação existente
      const existingRating = userData.ratedList?.find(rated => rated.movie.id === movieId)

      if (existingRating) {
        // Se existe uma avaliação, atualiza mantendo a nota atual se ela não mudou
        const currentRating = existingRating.rate
        // Se newRating é igual à avaliação atual, mantemos a mesma nota
        const rateToUpdate = newRating === currentRating ? currentRating : newRating
        await rateService.updateRate(existingRating.id, rateToUpdate, newComment)
      } else {
        // Se não existe, cria uma nova
        await rateService.createRate({
          movieId,
          userId: userData.id,
          rateValue: newRating,
          comment: newComment
        })
      }

      // Atualizar o estado local do userData com a nova avaliação
      setUserData(prevData => {
        if (!prevData?.ratedList) return prevData

        const updatedRatedList = prevData.ratedList.map(rated => {
          if (rated.movie.id === movieId) {
            return {
              ...rated,
              rate: newRating,
              comment: newComment,
              id: rated.id,
              movie: rated.movie
            }
          }
          return rated
        })

        return {
          ...prevData,
          ratedList: updatedRatedList
        }
      })

      // Atualizar o filme aberto no modal se necessário
      setFilmeAberto(prev => {
        if (prev && prev.id === movieId && prev.userRating?.id) {
          return {
            ...prev,
            userRating: {
              id: prev.userRating.id,
              rate: newRating,
              comment: newComment
            }
          }
        }
        return prev
      })

      // Forçar uma re-renderização do componente
      setAbaAtual(prevTab => prevTab)
    } catch (error) {
      console.error('Erro ao atualizar avaliação:', error)
    }
  }

  // Função para remover a avaliação da lista
  const handleRatingDelete = async (movieId: string) => {
    if (!userData) return

    try {
      // Encontrar a avaliação existente
      const existingRating = userData.ratedList?.find(rated => rated.movie.id === movieId)

      if (existingRating) {
        // Deletar a avaliação
        await rateService.deleteRate(movieId, userData.id)

        // Atualizar o estado local do userData removendo a avaliação
        setUserData(prevData => {
          if (!prevData?.ratedList) return prevData

          const updatedRatedList = prevData.ratedList.filter(rated => rated.movie.id !== movieId)

          return {
            ...prevData,
            ratedList: updatedRatedList
          }
        })

        // Atualizar o filme aberto no modal se necessário
        setFilmeAberto(prev => {
          if (prev && prev.id === movieId) {
            return {
              ...prev,
              userRating: undefined
            }
          }
          return prev
        })

        // Fechar o modal após deletar
        setFilmeAberto(null)

        // Forçar uma re-renderização do componente
        setAbaAtual(prevTab => prevTab)
      }
    } catch (error) {
      console.error('Erro ao deletar avaliação:', error)
    }
  }

  // Função para encontrar o filme detalhado pelo ID
  const encontrarFilmeDetalhado = (id: string) => {
    const filmeEncontrado = userData?.favorites?.find((filme) => filme.id === id)
    return filmeEncontrado ? mapMovieToFilmeDetalhado(filmeEncontrado) : null
  }

  // Função para carregar filmes recomendados
  const carregarFilmesRecomendados = async (userId: string) => {
    try {
      setLoadingRecomendacoes(true)
      setErroRecomendacoes(null)
      const recomendacoes = await movieService.getRecommendedMovies(userId)
      setFilmesRecomendados(recomendacoes)
    } catch (error: any) {
      console.error('Erro ao carregar filmes recomendados:', error)
      
      // Verificar se é um erro 400 ou 404
      if (error.message && (error.message.includes('400') || error.message.includes('404'))) {
        setErroRecomendacoes('Para receber recomendações personalizadas, você precisa avaliar pelo menos 10 filmes.')
      } else {
        setErroRecomendacoes('Erro ao carregar recomendações. Tente novamente mais tarde.')
      }
      
      setFilmesRecomendados([])
    } finally {
      setLoadingRecomendacoes(false)
    }
  }

  // Função para enviar mensagem para o chatbot
  const enviarMensagemChat = async (mensagem: string) => {
    if (!mensagem.trim()) return

    // Adicionar mensagem do usuário
    const novaMensagem = { type: 'user' as const, content: mensagem }
    setChatMessages(prev => [...prev, novaMensagem])
    setChatInput('')
    setLoadingChat(true)

    try {
      // Obter token de autenticação
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth_token='))
        ?.split('=')[1]

      const response = await fetch('http://localhost:5129/api/Gemini/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token ?? ''}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: mensagem
        })
      })

      const data = await response.json()

      if (!response.ok) {
        // Tratar erros específicos
        if (data.error) {
          if (data.error.includes('Configuração da API não encontrada')) {
            throw new Error('Serviço de IA temporariamente indisponível. Tente novamente mais tarde.')
          } else if (data.error.includes('Erro na API do Gemini')) {
            throw new Error('Erro na comunicação com o serviço de IA. Tente novamente.')
          } else {
            throw new Error(data.error)
          }
        } else {
          throw new Error('Erro na requisição do chatbot')
        }
      }
      
      // Verificar se a resposta contém o campo response
      if (!data.response) {
        throw new Error('Resposta inválida do serviço de IA')
      }
      
      // Adicionar resposta do bot
      const respostaBot = { type: 'bot' as const, content: data.response }
      setChatMessages(prev => [...prev, respostaBot])
    } catch (error) {
      console.error('Erro ao enviar mensagem para o chatbot:', error)
      
      let mensagemErro = 'Desculpe, não consegui processar sua mensagem. Tente novamente.'
      
      if (error instanceof Error) {
        mensagemErro = error.message
      }
      
      const erroBot = { type: 'bot' as const, content: mensagemErro }
      setChatMessages(prev => [...prev, erroBot])
    } finally {
      setLoadingChat(false)
    }
  }

  // Função de Visualizar Photo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
  
    setSelectedFile(file);
  
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Função de Upload Photo
  const handleUpload = async () => {
    if (!selectedFile || !userData) return;
  
    try {
      await userService.postUserPhotoById(userData.id, selectedFile);
      const updatedUser = await userService.getUserById(userData.id);
      setUserData(updatedUser);
  
      setFotoModalAberto(false); // <-- fecha o modal após salvar com sucesso
    } catch (error) {
      console.error("Erro ao enviar a foto:", error);
      alert("Erro ao enviar a foto.");
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const decodedUser = await authService.getUserFromToken()

        if (decodedUser?.nameid) {
          const user = await userService.getUserById(decodedUser.nameid)
          setUserData(user)
          
          await carregarFilmesRecomendados(decodedUser.nameid)
        }
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error)
      }
    }

    fetchUser()
  }, [])

  // Scroll automático para a última mensagem do chat
  useEffect(() => {
    const chatContainer = document.querySelector('.chat-messages')
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight
    }
  }, [chatMessages])

  if (!userData) {
    return <div>Carregando dados do usuário...</div>
  }
  

  // Verificar se deve mostrar scroll
  const mostrarScrollFavoritos = (userData?.favorites?.length ?? 0) > 7
  const mostrarScrollRecomendados = filmesRecomendados.length > 7

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-zinc-900 text-white">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Coluna da esquerda - Informações do usuário */}
          <div className="space-y-6">
            <Card className="bg-zinc-900 border-zinc-800 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Perfil</CardTitle>
                <CardDescription className="text-zinc-400">Suas informações pessoais</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center mb-6">
                  <div className="relative mb-4">
                    <Avatar className="w-24 h-24 border-2 border-amber-500">
                      <AvatarImage src={userData.photo || undefined} alt={userData.name} />
                      <AvatarFallback className="bg-zinc-800 text-xl">{userData.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <Button
                      size="icon"
                      className="absolute bottom-0 right-0 rounded-full w-8 h-8 bg-amber-500 hover:bg-amber-600"
                      onClick={() => setFotoModalAberto(true)}
                    >
                      <Camera className="h-4 w-4" />
                      <span className="sr-only">Alterar foto</span>
                    </Button>
                  </div>
                  <h2 className="text-xl font-bold">{userData.name}</h2>
                  <p className="text-zinc-400 text-sm">{userData.email}</p>
                  {userData.description && (
                    <p className="text-zinc-300 text-sm text-center mt-1 max-w-xs">
                      {userData.description}
                    </p>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-zinc-800 p-2 rounded-full">
                      <Mail className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-sm text-zinc-400">Email</p>
                      <p className="font-medium">{userData.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-zinc-800 p-2 rounded-full">
                      <Calendar className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-sm text-zinc-400">Membro desde</p>
                      <p className="font-medium">{format(new Date(userData.createdAt), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-zinc-800 p-2 rounded-full">
                      <Film className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-sm text-zinc-400">Filmes assistidos</p>
                      <p className="font-medium">
                        {userData.ratedList?.length || 0} filmes avaliados
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-zinc-800 p-2 rounded-full">
                      <Clock className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-sm text-zinc-400">Gênero mais assistido</p>
                      <p className="font-medium">{userData.genre || 'Em breve'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Seu Ranking</CardTitle>
                <CardDescription className="text-zinc-400">Sua posição entre os avaliadores</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center mb-4">
                  <div className="bg-gradient-to-r from-amber-500 to-red-600 text-white text-2xl font-bold rounded-full w-16 h-16 flex items-center justify-center mb-2">
                    {userData.rankingUser?.currentRank || '-'}
                  </div>
                  <p className="text-sm text-zinc-400">de {userData.rankingUser?.totalUsers || 0} usuários</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">Nível</span>
                      <span className="text-sm text-amber-500 font-medium">{userData.ranking?.nivel || 'Iniciante'}</span>
                    </div>
                    <Progress
                      value={
                        userData.ranking?.proximoNivel
                          ? (userData.ranking.avaliacoes / userData.ranking.proximoNivel.avaliacoesNecessarias) * 100
                          : 0
                      }
                      className="h-2 bg-zinc-700"
                    />
                    <p className="text-xs text-zinc-500 mt-1">
                      {userData.ranking?.proximoNivel
                        ? `${userData.ranking.proximoNivel.avaliacoesNecessarias - userData.ranking.avaliacoes} avaliações para ${userData.ranking.proximoNivel.nome}`
                        : 'Informações de nível em breve'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-zinc-400">Total de avaliações</p>
                      <p className="text-lg font-bold">{userData.ranking?.avaliacoes || 0}</p>
                    </div>
                    <div className="bg-amber-500/20 text-amber-500 px-3 py-1 rounded-full text-sm font-medium">
                      Top {userData.ranking?.percentil ? (100 - userData.ranking.percentil).toFixed(1) : 100}%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Configurações</CardTitle>
                <CardDescription className="text-zinc-400">Gerencie sua conta</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full justify-between border-zinc-700 hover:bg-zinc-800 hover:text-amber-500"
                  onClick={() => setEditarPerfilAberto(true)}
                >
                  <div className="flex items-center">
                    <Edit className="mr-2 h-4 w-4" />
                    Editar perfil
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-between border-zinc-700 hover:bg-zinc-800 hover:text-amber-500"
                  onClick={() => setAlterarSenhaAberto(true)}
                >
                  <div className="flex items-center">
                    <Lock className="mr-2 h-4 w-4" />
                    Alterar senha
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-between border-zinc-700 hover:bg-zinc-800 hover:text-red-500"
                >
                  <div className="flex items-center">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Coluna da direita - Conteúdo principal */}
          <div className="md:col-span-2">
            <Tabs defaultValue="favoritos" className="space-y-6" onValueChange={setAbaAtual}>
              <TabsList className="bg-zinc-800 border-zinc-700 p-1">
                <TabsTrigger
                  value="favoritos"
                  className="data-[state=active]:bg-amber-500 data-[state=active]:text-black"
                >
                  Favoritos
                </TabsTrigger>
                <TabsTrigger
                  value="avaliados"
                  className="data-[state=active]:bg-amber-500 data-[state=active]:text-black"
                >
                  Avaliados
                </TabsTrigger>
                <TabsTrigger
                  value="recomendacoes"
                  className="data-[state=active]:bg-amber-500 data-[state=active]:text-black"
                >
                  Recomendações
                </TabsTrigger>
                <TabsTrigger
                  value="estatisticas"
                  className="data-[state=active]:bg-amber-500 data-[state=active]:text-black"
                >
                  Estatísticas
                </TabsTrigger>
              </TabsList>

              {/* Aba de Favoritos */}
              <TabsContent value="favoritos" className="space-y-6">
                <Card className="bg-zinc-900 border-zinc-800 text-white">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-xl">Filmes Favoritos</CardTitle>
                        <CardDescription className="text-zinc-400">Seus filmes marcados como favoritos</CardDescription>
                      </div>
                      <Badge className="bg-amber-500 text-black hover:bg-amber-600">
                        {userData?.favorites?.length} filmes
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {userData?.favorites?.length > 0 ? (
                      <div
                        className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 ${mostrarScrollFavoritos ? "overflow-x-auto" : ""}
                          ${mostrarScrollFavoritos ? "pb-4" : ""}`}
                      >
                        {userData?.favorites?.map((filme) => {
                          const filmeDetalhado = mapMovieToFilmeDetalhado(filme)
                          return (
                            <div
                              key={filme.id}
                              className="relative group cursor-pointer"
                              onClick={() => setFilmeAberto(filmeDetalhado)}
                            >
                              <Image
                                src={filmeDetalhado.capa || "/placeholder.svg"}
                                alt={filmeDetalhado.titulo}
                                width={500}
                                height={750}
                                className="w-full h-auto rounded-lg shadow-md transition-transform duration-300 group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-opacity duration-300 rounded-lg flex flex-col items-center justify-center gap-2">
                                <Heart className="text-red-500 fill-red-500 opacity-100 transition-opacity duration-300" />
                                <p className="text-white text-center text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-2">{filmeDetalhado.titulo}</p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-zinc-400">Você ainda não tem filmes favoritos.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>              </TabsContent>

              {/* Aba de Avaliados */}
              <TabsContent value="avaliados" className="space-y-6">
                <Card className="bg-zinc-900 border-zinc-800 text-white">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-xl">Filmes Avaliados</CardTitle>
                        <CardDescription className="text-zinc-400">Filmes que você avaliou</CardDescription>
                      </div>
                      <Badge className="bg-amber-500 text-black hover:bg-amber-600">
                        {userData?.ratedList?.length || 0} filmes
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {userData?.ratedList && userData.ratedList.length > 0 ? (
                      <div
                        className={`space-y-4 ${
                          userData.ratedList.length > 7 ? "max-h-[600px] overflow-y-auto pr-2 custom-scrollbar" : ""
                        }`}
                      >
                        {userData.ratedList.map((rated) => (
                          <div
                            key={rated.movie.id}
                            className="flex items-center gap-4 p-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors cursor-pointer"
                            onClick={() => setFilmeAberto(mapMovieToFilmeDetalhado(rated.movie, { 
                              id: rated.id,
                              rate: rated.rate, 
                              comment: rated.comment 
                            }))}
                          >
                            <div className="relative w-16 h-24 flex-shrink-0 overflow-hidden rounded">
                              <Image
                                src={rated.movie.posterPhotoUrl || "/placeholder.svg"}
                                alt={rated.movie.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-white truncate">{rated.movie.title}</h3>
                              <div className="flex items-center gap-2 text-sm text-zinc-400">
                                <span>{new Date(rated.movie.releaseDate).getFullYear()}</span>
                              </div>
                              <div className="flex items-center gap-4 mt-1">
                                <div className="flex items-center">
                                  <Star className="h-4 w-4 text-amber-500 fill-amber-500 mr-1" />
                                  <span className="text-sm font-medium">
                                    {(() => {
                                      const value = typeof rated.movie.voteAverage === 'number' 
                                        ? rated.movie.voteAverage 
                                        : rated.movie.voteAverage.parsedValue
                                      return value.toFixed(1)
                                    })()}
                                  </span>
                                  <span className="text-xs text-zinc-500 ml-1">global</span>
                                </div>
                                <div className="flex items-center">
                                  <Star className="h-4 w-4 text-green-500 fill-green-500 mr-1" />
                                  <span className="text-sm font-medium">{rated.rate}</span>
                                  <span className="text-xs text-zinc-500 ml-1">sua</span>
                                </div>
                              </div>
                              {rated.comment && (
                                <p className="text-sm text-zinc-400 mt-1 line-clamp-1">{rated.comment}</p>
                              )}
                            </div>
                            <div className="flex-shrink-0 flex gap-2">
                              <div className="bg-zinc-700 rounded-full px-3 py-1 text-sm font-bold text-amber-500">
                                {rated.rate}/10
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Star className="h-12 w-12 mx-auto text-zinc-700 mb-3" />
                        <h3 className="text-lg font-medium text-zinc-400">Nenhum filme avaliado</h3>
                        <p className="text-zinc-500 text-sm mt-1">Avalie filmes para vê-los aqui</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Aba de Recomendações */}
              <TabsContent value="recomendacoes" className="space-y-6">
                <Card className="bg-zinc-900 border-zinc-800 text-white">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-xl flex items-center">
                          <Sparkles className="h-5 w-5 mr-2 text-amber-500" />
                          Filmes Recomendados para Você
                        </CardTitle>
                        <CardDescription className="text-zinc-400">
                          Baseado nos filmes que você avaliou e favoritou
                        </CardDescription>
                      </div>
                      <Badge className="bg-amber-500 text-black hover:bg-amber-600">
                        {filmesRecomendados.length} filmes
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loadingRecomendacoes ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto mb-4"></div>
                        <p className="text-zinc-400">Carregando recomendações...</p>
                      </div>
                    ) : erroRecomendacoes ? (
                      <div className="text-center py-8">
                        <div className="bg-zinc-800 rounded-lg p-8 max-w-md mx-auto">
                          <div className="text-zinc-600 mb-4">
                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2" />
                            </svg>
                          </div>
                          <h3 className="text-lg font-semibold mb-2">Recomendações indisponíveis</h3>
                          <p className="text-zinc-400 text-sm">
                            {erroRecomendacoes}
                          </p>
                          {erroRecomendacoes.includes('10 filmes') && (
                            <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                              <p className="text-amber-500 text-sm font-medium">
                                Filmes avaliados: {userData?.ratedList?.length || 0}/10
                              </p>
                              <div className="mt-2">
                                <div className="w-full bg-zinc-700 rounded-full h-2">
                                  <div 
                                    className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${Math.min(((userData?.ratedList?.length || 0) / 10) * 100, 100)}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : filmesRecomendados.length > 0 ? (
                      <div
                        className={`space-y-4 ${
                          mostrarScrollRecomendados ? "max-h-[600px] overflow-y-auto pr-2 custom-scrollbar" : ""
                        }`}
                      >
                        {filmesRecomendados.map((filme) => (
                          <div
                            key={filme.id}
                            className="flex items-center gap-4 p-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors cursor-pointer"
                            onClick={() => setFilmeAberto(mapMovieToFilmeDetalhado(filme))}
                          >
                            <div className="relative w-16 h-24 flex-shrink-0 overflow-hidden rounded">
                              <Image
                                src={filme.posterPhotoUrl || "/placeholder.svg"}
                                alt={filme.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-white truncate">{filme.title}</h3>
                              <div className="flex items-center gap-2 text-sm text-zinc-400">
                                <span>{new Date(filme.releaseDate).getFullYear()}</span>
                                <span>•</span>
                                <span className="flex items-center">
                                  <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500 mr-1" />
                                  {typeof filme.voteAverage === 'number' ? filme.voteAverage.toFixed(1) : filme.voteAverage.parsedValue.toFixed(1)}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {filme.genres.split(", ").slice(0, 2).map((genero: string, index: number) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="bg-zinc-700 border-zinc-600 text-zinc-300 text-xs py-0"
                                  >
                                    {genero}
                                  </Badge>
                                ))}
                              </div>
                              <p className="text-xs text-amber-500/80 mt-1 line-clamp-2">{filme.overview}</p>
                            </div>
                            <div className="flex-shrink-0 flex gap-2">
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Sparkles className="h-12 w-12 mx-auto text-zinc-700 mb-3" />
                        <h3 className="text-lg font-medium text-zinc-400">Nenhuma recomendação disponível</h3>
                        <p className="text-zinc-500 text-sm mt-1">
                          Nenhuma recomendação foi encontrada para você no momento.
                        </p>
                      </div>
                    )}

                    {/* Chatbot de Recomendações */}
                    <div className="mt-8">
                      <Card className="bg-zinc-800 border-zinc-700">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center">
                            <Bot className="h-5 w-5 mr-2 text-amber-500" />
                            Assistente de Recomendações
                          </CardTitle>
                          <CardDescription className="text-zinc-400">
                            Faça perguntas sobre filmes e receba recomendações personalizadas
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {/* Área de mensagens */}
                          <div className="h-64 overflow-y-auto mb-4 p-3 bg-zinc-900 rounded-lg border border-zinc-700 chat-messages">
                            <div className="space-y-3">
                              {chatMessages.map((message, index) => (
                                <div
                                  key={index}
                                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                  <div
                                    className={`max-w-[80%] p-3 rounded-lg ${
                                      message.type === 'user'
                                        ? 'bg-amber-500 text-black'
                                        : 'bg-zinc-700 text-white'
                                    }`}
                                  >
                                    <div className="flex items-start gap-2">
                                      {message.type === 'bot' && (
                                        <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                      )}
                                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                      {message.type === 'user' && (
                                        <UserIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                              {loadingChat && (
                                <div className="flex justify-start">
                                  <div className="bg-zinc-700 text-white p-3 rounded-lg">
                                    <div className="flex items-center gap-2">
                                      <Bot className="h-4 w-4" />
                                      <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                        <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Input de mensagem */}
                          <div className="flex gap-2">
                            <Textarea
                              placeholder="Digite sua pergunta sobre filmes..."
                              value={chatInput}
                              onChange={(e) => setChatInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault()
                                  enviarMensagemChat(chatInput)
                                }
                              }}
                              className="flex-1 bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-400 resize-none"
                              rows={2}
                              disabled={loadingChat}
                            />
                            <Button
                              onClick={() => enviarMensagemChat(chatInput)}
                              disabled={loadingChat || !chatInput.trim()}
                              className="bg-amber-500 hover:bg-amber-600 text-black"
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Aba de Estatísticas */}
              <TabsContent value="estatisticas" className="space-y-6">
                {/* Cards de Resumo */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="bg-zinc-900 border-zinc-800 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-zinc-400">Total Avaliados</p>
                          <p className="text-2xl font-bold text-white">{userData.ratedList?.length || 0}</p>
                        </div>
                        <div className="bg-amber-500/20 p-3 rounded-full">
                          <Star className="h-6 w-6 text-amber-500" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-zinc-900 border-zinc-800 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-zinc-400">Favoritos</p>
                          <p className="text-2xl font-bold text-white">{userData.favorites?.length || 0}</p>
                        </div>
                        <div className="bg-red-500/20 p-3 rounded-full">
                          <Heart className="h-6 w-6 text-red-500" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-zinc-900 border-zinc-800 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-zinc-400">Ranking</p>
                          <p className="text-2xl font-bold text-white">#{userData.rankingUser?.currentRank || '-'}</p>
                        </div>
                        <div className="bg-blue-500/20 p-3 rounded-full">
                          <BarChart3 className="h-6 w-6 text-blue-500" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-zinc-900 border-zinc-800 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-zinc-400">Avaliação Média</p>
                          <p className="text-2xl font-bold text-white">
                            {userData.ratedList && userData.ratedList.length > 0
                              ? (userData.ratedList.reduce((acc, rated) => acc + rated.rate, 0) / userData.ratedList.length).toFixed(1)
                              : '0.0'}
                          </p>
                        </div>
                        <div className="bg-green-500/20 p-3 rounded-full">
                          <div className="h-6 w-6 text-green-500 flex items-center justify-center">
                            <span className="text-sm font-bold">★</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Gráficos */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Distribuição de Avaliações */}
                  <Card className="bg-zinc-900 border-zinc-800 text-white">
                    <CardHeader>
                      <CardTitle className="text-lg">Distribuição de Avaliações</CardTitle>
                      <CardDescription className="text-zinc-400">
                        Como você distribui suas notas
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {userData.ratedList && userData.ratedList.length > 0 ? (
                        <div className="space-y-3">
                          {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((rating) => {
                            const count = userData.ratedList?.filter(rated => rated.rate === rating).length || 0
                            const percentage = userData.ratedList ? (count / userData.ratedList.length) * 100 : 0
                            
                            return (
                              <div key={rating} className="flex items-center gap-3">
                                <div className="w-8 text-sm font-medium text-zinc-400">{rating}</div>
                                <div className="flex-1">
                                  <div className="w-full bg-zinc-800 rounded-full h-2">
                                    <div 
                                      className="bg-gradient-to-r from-amber-500 to-red-500 h-2 rounded-full transition-all duration-500"
                                      style={{ width: `${percentage}%` }}
                                    ></div>
                                  </div>
                                </div>
                                <div className="w-12 text-sm text-zinc-400 text-right">{count}</div>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Star className="h-12 w-12 mx-auto text-zinc-700 mb-3" />
                          <p className="text-zinc-400">Nenhuma avaliação ainda</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Gêneros Mais Avaliados */}
                  <Card className="bg-zinc-900 border-zinc-800 text-white">
                    <CardHeader>
                      <CardTitle className="text-lg">Gêneros Favoritos</CardTitle>
                      <CardDescription className="text-zinc-400">
                        Baseado nos filmes que você avaliou
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {userData.ratedList && userData.ratedList.length > 0 ? (
                        <div className="space-y-3">
                          {(() => {
                            const genreCount: { [key: string]: number } = {}
                            
                            userData.ratedList.forEach(rated => {
                              const genres = rated.movie.genres.split(',').map(g => g.trim())
                              genres.forEach(genre => {
                                genreCount[genre] = (genreCount[genre] || 0) + 1
                              })
                            })
                            
                            const sortedGenres = Object.entries(genreCount)
                              .sort(([,a], [,b]) => b - a)
                              .slice(0, 8)
                            
                            return sortedGenres.map(([genre, count]) => {
                              const percentage = (count / userData.ratedList!.length) * 100
                              
                              return (
                                <div key={genre} className="flex items-center gap-3">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-1">
                                      <span className="text-sm font-medium truncate">{genre}</span>
                                      <span className="text-xs text-zinc-400">{count}</span>
                                    </div>
                                    <div className="w-full bg-zinc-800 rounded-full h-2">
                                      <div 
                                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                                        style={{ width: `${percentage}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                </div>
                              )
                            })
                          })()}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Film className="h-12 w-12 mx-auto text-zinc-700 mb-3" />
                          <p className="text-zinc-400">Nenhum gênero analisado</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Análise Temporal */}
                <Card className="bg-zinc-900 border-zinc-800 text-white">
                  <CardHeader>
                    <CardTitle className="text-lg">Análise Temporal</CardTitle>
                    <CardDescription className="text-zinc-400">
                      Sua atividade ao longo do tempo
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Décadas */}
                      <div>
                        <h4 className="text-sm font-medium mb-3">Filmes por Década</h4>
                        {userData.ratedList && userData.ratedList.length > 0 ? (
                          <div className="space-y-2">
                            {(() => {
                              const decadeCount: { [key: string]: number } = {}
                              
                              userData.ratedList.forEach(rated => {
                                const year = new Date(rated.movie.releaseDate).getFullYear()
                                const decade = Math.floor(year / 10) * 10
                                const decadeLabel = `${decade}s`
                                decadeCount[decadeLabel] = (decadeCount[decadeLabel] || 0) + 1
                              })
                              
                              return Object.entries(decadeCount)
                                .sort(([a], [b]) => parseInt(a) - parseInt(b))
                                .map(([decade, count]) => (
                                  <div key={decade} className="flex justify-between items-center">
                                    <span className="text-sm text-zinc-400">{decade}</span>
                                    <Badge variant="outline" className="bg-zinc-800 border-zinc-700">
                                      {count}
                                    </Badge>
                                  </div>
                                ))
                            })()}
                          </div>
                        ) : (
                          <p className="text-zinc-500 text-sm">Nenhum dado disponível</p>
                        )}
                      </div>

                      {/* Anos Recentes */}
                      <div>
                        <h4 className="text-sm font-medium mb-3">Últimos 5 Anos</h4>
                        {userData.ratedList && userData.ratedList.length > 0 ? (
                          <div className="space-y-2">
                            {(() => {
                              const currentYear = new Date().getFullYear()
                              const yearCount: { [key: number]: number } = {}
                              
                              userData.ratedList.forEach(rated => {
                                const year = new Date(rated.movie.releaseDate).getFullYear()
                                if (year >= currentYear - 4) {
                                  yearCount[year] = (yearCount[year] || 0) + 1
                                }
                              })
                              
                              return Array.from({ length: 5 }, (_, i) => currentYear - 4 + i)
                                .map(year => (
                                  <div key={year} className="flex justify-between items-center">
                                    <span className="text-sm text-zinc-400">{year}</span>
                                    <Badge variant="outline" className="bg-zinc-800 border-zinc-700">
                                      {yearCount[year] || 0}
                                    </Badge>
                                  </div>
                                ))
                            })()}
                          </div>
                        ) : (
                          <p className="text-zinc-500 text-sm">Nenhum dado disponível</p>
                        )}
                      </div>

                      {/* Média por Ano */}
                      <div>
                        <h4 className="text-sm font-medium mb-3">Avaliação Média por Ano</h4>
                        {userData.ratedList && userData.ratedList.length > 0 ? (
                          <div className="space-y-2">
                            {(() => {
                              const yearRatings: { [key: number]: number[] } = {}
                              
                              userData.ratedList.forEach(rated => {
                                const year = new Date(rated.movie.releaseDate).getFullYear()
                                if (!yearRatings[year]) yearRatings[year] = []
                                yearRatings[year].push(rated.rate)
                              })
                              
                              return Object.entries(yearRatings)
                                .sort(([a], [b]) => parseInt(b) - parseInt(a))
                                .slice(0, 5)
                                .map(([year, ratings]) => {
                                  const average = (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
                                  return (
                                    <div key={year} className="flex justify-between items-center">
                                      <span className="text-sm text-zinc-400">{year}</span>
                                      <div className="flex items-center gap-1">
                                        <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                                        <span className="text-sm font-medium">{average}</span>
                                      </div>
                                    </div>
                                  )
                                })
                            })()}
                          </div>
                        ) : (
                          <p className="text-zinc-500 text-sm">Nenhum dado disponível</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Insights e Conquistas */}
                <Card className="bg-zinc-900 border-zinc-800 text-white">
                  <CardHeader>
                    <CardTitle className="text-lg">Insights e Conquistas</CardTitle>
                    <CardDescription className="text-zinc-400">
                      Dados interessantes sobre seus hábitos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium text-amber-500">Seus Destaques</h4>
                        <div className="space-y-3">
                          {userData.ratedList && userData.ratedList.length > 0 && (() => {
                            const insights = []
                            
                            // Filme com maior nota
                            const highestRated = userData.ratedList.reduce((max, rated) => 
                              rated.rate > max.rate ? rated : max
                            )
                            insights.push({
                              icon: "🏆",
                              title: "Maior Avaliação",
                              value: `${highestRated.movie.title} (${highestRated.rate}/10)`
                            })
                            
                            // Gênero mais avaliado
                            const genreCount: { [key: string]: number } = {}
                            userData.ratedList.forEach(rated => {
                              const genres = rated.movie.genres.split(',').map(g => g.trim())
                              genres.forEach(genre => {
                                genreCount[genre] = (genreCount[genre] || 0) + 1
                              })
                            })
                            const favoriteGenre = Object.entries(genreCount)
                              .sort(([,a], [,b]) => b - a)[0]
                            if (favoriteGenre) {
                              insights.push({
                                icon: "🎭",
                                title: "Gênero Favorito",
                                value: `${favoriteGenre[0]} (${favoriteGenre[1]} filmes)`
                              })
                            }
                            
                            // Década preferida
                            const decadeCount: { [key: string]: number } = {}
                            userData.ratedList.forEach(rated => {
                              const year = new Date(rated.movie.releaseDate).getFullYear()
                              const decade = Math.floor(year / 10) * 10
                              const decadeLabel = `${decade}s`
                              decadeCount[decadeLabel] = (decadeCount[decadeLabel] || 0) + 1
                            })
                            const favoriteDecade = Object.entries(decadeCount)
                              .sort(([,a], [,b]) => b - a)[0]
                            if (favoriteDecade) {
                              insights.push({
                                icon: "📅",
                                title: "Década Preferida",
                                value: `${favoriteDecade[0]} (${favoriteDecade[1]} filmes)`
                              })
                            }
                            
                            return insights.map((insight, index) => (
                              <div key={index} className="flex items-center gap-3 p-3 bg-zinc-800 rounded-lg">
                                <span className="text-2xl">{insight.icon}</span>
                                <div>
                                  <p className="text-sm font-medium">{insight.title}</p>
                                  <p className="text-xs text-zinc-400">{insight.value}</p>
                                </div>
                              </div>
                            ))
                          })()}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-sm font-medium text-amber-500">Progresso</h4>
                        <div className="space-y-4">
                          {/* Progresso para próximo nível */}
                          {userData.ranking?.proximoNivel && (
                            <div className="p-4 bg-zinc-800 rounded-lg">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium">Próximo Nível</span>
                                <span className="text-sm text-amber-500">{userData.ranking.proximoNivel.nome}</span>
                              </div>
                              <Progress
                                value={
                                  (userData.ranking.avaliacoes / userData.ranking.proximoNivel.avaliacoesNecessarias) * 100
                                }
                                className="h-2 bg-zinc-700"
                              />
                              <p className="text-xs text-zinc-400 mt-1">
                                {userData.ranking.proximoNivel.avaliacoesNecessarias - userData.ranking.avaliacoes} avaliações restantes
                              </p>
                            </div>
                          )}

                          {/* Ranking */}
                          {userData.rankingUser && (
                            <div className="p-4 bg-zinc-800 rounded-lg">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium">Posição no Ranking</span>
                                <span className="text-sm text-blue-500">#{userData.rankingUser.currentRank}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-zinc-700 rounded-full h-2">
                                  <div 
                                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                                    style={{ 
                                      width: `${((userData.rankingUser.totalUsers - userData.rankingUser.currentRank) / userData.rankingUser.totalUsers) * 100}%` 
                                    }}
                                  ></div>
                                </div>
                                <span className="text-xs text-zinc-400">
                                  Top {userData.ranking?.percentil ? (100 - userData.ranking.percentil).toFixed(1) : 100}%
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Meta de avaliações */}
                          <div className="p-4 bg-zinc-800 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium">Meta: 100 Avaliações</span>
                              <span className="text-sm text-green-500">
                                {userData.ratedList?.length || 0}/100
                              </span>
                            </div>
                            <Progress
                              value={((userData.ratedList?.length || 0) / 100) * 100}
                              className="h-2 bg-zinc-700"
                            />
                            <p className="text-xs text-zinc-400 mt-1">
                              {100 - (userData.ratedList?.length || 0)} avaliações para completar
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      {/* Modais */}
      {filmeAberto && (
        <FilmeModal
          filme={filmeAberto}
          aberto={!!filmeAberto}
          onClose={() => setFilmeAberto(null)}
          isFavorited={abaAtual === "favoritos"}
          onRatingUpdate={handleRatingUpdate}
          onRatingDelete={handleRatingDelete}
        />
      )}
      <EditarPerfilModal
        aberto={editarPerfilAberto}
        onClose={() => setEditarPerfilAberto(false)}
        usuario={userData}
        onProfileUpdate={async () => {
          // Recarregar os dados do usuário após atualização
          const decodedUser = await authService.getUserFromToken()
          if (decodedUser?.nameid) {
            const updatedUser = await userService.getUserById(decodedUser.nameid)
            setUserData(updatedUser)
          }
        }}
      />
      <AlterarSenhaModal aberto={alterarSenhaAberto} onClose={() => setAlterarSenhaAberto(false)} />
      {/* Modal de Upload de Foto */}
      <Dialog open={fotoModalAberto} onOpenChange={setFotoModalAberto}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Alterar foto de perfil</DialogTitle>
            <DialogDescription className="text-zinc-400">Escolha uma nova foto para o seu perfil</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center gap-6 py-4">
            <div className="relative w-32 h-32">
            <Avatar className="w-32 h-32 border-2 border-amber-500">
              <AvatarImage src={previewUrl || userData.photo || undefined} alt={userData.name} />
              <AvatarFallback className="bg-zinc-800 text-3xl">{userData.name.charAt(0)}</AvatarFallback>
            </Avatar>
            </div>

            <div className="grid w-full gap-4">
              <div className="flex flex-col items-center gap-1.5">
                <label
                  htmlFor="foto-perfil"
                  className="cursor-pointer bg-zinc-800 hover:bg-zinc-700 text-white py-2 px-4 rounded-md flex items-center gap-2 border border-zinc-700"
                >
                  <Upload className="h-4 w-4 text-amber-500" />
                  Escolher arquivo
                </label>
                <input id="foto-perfil" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                <p className="text-xs text-zinc-500">JPG, PNG ou GIF. Máximo 2MB.</p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setFotoModalAberto(false)} // fecha o modal no cancelar
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              Cancelar
            </Button>

            <Button
              className="bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-600 hover:to-red-700 text-white border-0"
              onClick={handleUpload} // chama upload ao clicar
            >
              Salvar foto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

