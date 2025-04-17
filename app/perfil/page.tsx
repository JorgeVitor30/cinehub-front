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
} from "lucide-react"
import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
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

// Dados mockados do usuário
const usuarioMock = {
  id: "1",
  nome: "TESTE",
  email: "teste@email.com",
  avatar: "/placeholder.svg?height=200&width=200",
  dataCadastro: "Março 2023",
  totalFilmesAssistidos: 45,
  totalFilmes: 50000,
  generoMaisAssistido: "Ficção Científica",
  filmesAssistidosPorGenero: [
    { genero: "Ficção Científica", quantidade: 15 },
    { genero: "Ação", quantidade: 12 },
    { genero: "Drama", quantidade: 8 },
    { genero: "Comédia", quantidade: 6 },
    { genero: "Aventura", quantidade: 4 },
  ],
  ranking: {
    posicao: 42,
    total: 5782,
    percentil: 99.3,
    avaliacoes: 127,
    nivel: "Cinéfilo Experiente",
    proximoNivel: {
      nome: "Crítico Master",
      avaliacoesNecessarias: 150,
    },
  },
}

import { type Movie } from "@/app/services/userService"

export interface User {
  id: string
  name: string
  email: string
  photo?: string
  role: string
  visibilityPublic: boolean
  createdAt: string
  favorites: Movie[]
}

  
// Filmes avaliados mockados
const filmesAvaliadosMock = [
  {
    id: "1",
    titulo: "Inception",
    capa: "https://image.tmdb.org/t/p/w500//oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
    avaliacaoUsuario: 9,
    avaliacao: 8.8,
    ano: 2010,
  },
  {
    id: "13",
    titulo: "O Senhor dos Anéis: O Retorno do Rei",
    capa: "https://image.tmdb.org/t/p/w500/pbrkL804c8yAv3zBZR4QPEafpAR.jpg",
    avaliacaoUsuario: 10,
    avaliacao: 9.0,
    ano: 2003,
  },
  {
    id: "17",
    titulo: "Tudo em Todo Lugar ao Mesmo Tempo",
    capa: "https://image.tmdb.org/t/p/w500/pbrkL804c8yAv3zBZR4QPEafpAR.jpg",
    avaliacaoUsuario: 8,
    avaliacao: 8.7,
    ano: 2022,
  },
  {
    id: "19",
    titulo: "Parasita",
    capa: "https://image.tmdb.org/t/p/w500/pbrkL804c8yAv3zBZR4QPEafpAR.jpg",
    avaliacaoUsuario: 9,
    avaliacao: 8.9,
    ano: 2019,
  },
  {
    id: "3",
    titulo: "Pobres Criaturas",
    capa: "https://image.tmdb.org/t/p/w500//oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
    avaliacaoUsuario: 7,
    avaliacao: 8.5,
    ano: 2023,
  },
  {
    id: "11",
    titulo: "O Poderoso Chefão",
    capa: "https://image.tmdb.org/t/p/w500/pbrkL804c8yAv3zBZR4QPEafpAR.jpg",
    avaliacaoUsuario: 10,
    avaliacao: 9.2,
    ano: 1972,
  },
  {
    id: "12",
    titulo: "Pulp Fiction",
    capa: "https://image.tmdb.org/t/p/w500/pbrkL804c8yAv3zBZR4QPEafpAR.jpg",
    avaliacaoUsuario: 9,
    avaliacao: 8.9,
    ano: 1994,
  },
  {
    id: "6",
    titulo: "Godzilla e Kong: O Novo Império",
    capa: "https://image.tmdb.org/t/p/w500/pbrkL804c8yAv3zBZR4QPEafpAR.jpg",
    avaliacaoUsuario: 7,
    avaliacao: 7.2,
    ano: 2024,
  },
  {
    id: "7",
    titulo: "Kung Fu Panda 4",
    capa: "https://image.tmdb.org/t/p/w500/pbrkL804c8yAv3zBZR4QPEafpAR.jpg",
    avaliacaoUsuario: 8,
    avaliacao: 7.0,
    ano: 2024,
  },
]

// Filmes recomendados mockados
const filmesRecomendadosMock = [
  {
    id: "21",
    titulo: "Vingadores: Ultimato",
    capa: "https://image.tmdb.org/t/p/w500/q6725aR8Zs4IwGMXzZT8aC8lh41.jpg",
    avaliacao: 8.4,
    ano: 2019,
    generos: ["Ação", "Aventura", "Ficção Científica"],
    similaridade: 92,
    motivo: "Baseado em sua avaliação de Inception",
  },
  {
    id: "18",
    titulo: "Duna: Parte 2",
    capa: "https://image.tmdb.org/t/p/w500//oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
    avaliacao: 8.6,
    ano: 2024,
    generos: ["Ficção Científica", "Aventura"],
    similaridade: 89,
    motivo: "Baseado em sua avaliação de Interestellar",
  },
  {
    id: "23",
    titulo: "Oppenheimer",
    capa: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    avaliacao: 8.2,
    ano: 2023,
    generos: ["Drama", "História"],
    similaridade: 85,
    motivo: "Baseado em filmes históricos que você assistiu",
  },
  {
    id: "24",
    titulo: "Blade Runner 2049",
    capa: "https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg",
    avaliacao: 8.0,
    ano: 2017,
    generos: ["Ficção Científica", "Drama"],
    similaridade: 82,
    motivo: "Baseado em sua avaliação de Matrix",
  },
  {
    id: "25",
    titulo: "Bacurau",
    capa: "https://image.tmdb.org/t/p/w500/hu5RpvEdLjJ2sLGkAMzRjoNWbMj.jpg",
    avaliacao: 7.8,
    ano: 2019,
    generos: ["Mistério", "Faroeste", "Thriller"],
    similaridade: 78,
    motivo: "Baseado em sua avaliação de Parasita",
  },
  {
    id: "26",
    titulo: "Divertida Mente 2",
    capa: "https://image.tmdb.org/t/p/w500/7qwE5ZQDxwAqYHJMIAK9dtxJlXf.jpg",
    avaliacao: 7.9,
    ano: 2023,
    generos: ["Animação", "Comédia", "Família"],
    similaridade: 75,
    motivo: "Baseado em filmes de animação que você gostou",
  },
  {
    id: "27",
    titulo: "Duna",
    capa: "https://image.tmdb.org/t/p/w500/s9E9W77HS8zEQvsrpz5aEUTKnvD.jpg",
    avaliacao: 7.9,
    ano: 2021,
    generos: ["Ficção Científica", "Aventura"],
    similaridade: 90,
    motivo: "Baseado em sua avaliação de O Senhor dos Anéis",
  },
]

// Função para mapear os filmes da API para o formato esperado pelo componente
const mapMovieToFilmeDetalhado = (movie: Movie): FilmeDetalhado => {
  return {
    id: movie.id,
    titulo: movie.title,
    capa: movie.posterPhotoUrl,
    banner: movie.backPhotoUrl,
    avaliacao: movie.voteAverage,
    duracao: `${Math.floor(movie.runTime / 60)}h ${movie.runTime % 60}m`,
    ano: new Date(movie.releaseDate).getFullYear(),
    generos: movie.genres.split(',').map(g => g.trim()),
    lingua: movie.originalLanguage,
    orcamento: `$${(movie.budget / 1000000).toFixed(0)} milhões`,
    descricao: movie.overview,
    producoes: movie.productions.split(',').map(p => ({ nome: p.trim() })),
  }
}

export default function PerfilPage() {
  const [filmeAberto, setFilmeAberto] = useState<FilmeDetalhado | null>(null)
  const [editarPerfilAberto, setEditarPerfilAberto] = useState(false)
  const [alterarSenhaAberto, setAlterarSenhaAberto] = useState(false)
  const [fotoModalAberto, setFotoModalAberto] = useState(false)
  const [userData, setUserData] = useState<User | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);


  // Função para encontrar o filme detalhado pelo ID
  const encontrarFilmeDetalhado = (id: string) => {
    const filmeEncontrado = userData?.favorites?.find((filme) => filme.id === id)
    return filmeEncontrado ? mapMovieToFilmeDetalhado(filmeEncontrado) : null
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
        }
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error)
      }
    }

    fetchUser()
  }, [])

  if (!userData) {
    return <div>Carregando dados do usuário...</div>
  }
  

  // Verificar se deve mostrar scroll
  const mostrarScrollFavoritos = (userData?.favorites?.length ?? 0) > 7
  const mostrarScrollAvaliados = filmesAvaliadosMock.length > 7
  const mostrarScrollRecomendados = filmesRecomendadosMock.length > 7

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
                      <AvatarImage src={userData.photo} alt={userData.name} />
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
                        {usuarioMock.totalFilmesAssistidos} de {usuarioMock.totalFilmes}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-zinc-800 p-2 rounded-full">
                      <Clock className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-sm text-zinc-400">Gênero mais assistido</p>
                      <p className="font-medium">{usuarioMock.generoMaisAssistido}</p>
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
                    {usuarioMock.ranking.posicao}
                  </div>
                  <p className="text-sm text-zinc-400">de {usuarioMock.ranking.total} usuários</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">Nível</span>
                      <span className="text-sm text-amber-500 font-medium">{usuarioMock.ranking.nivel}</span>
                    </div>
                    <Progress
                      value={
                        (usuarioMock.ranking.avaliacoes / usuarioMock.ranking.proximoNivel.avaliacoesNecessarias) * 100
                      }
                      className="h-2 bg-zinc-700"
                    />
                    <p className="text-xs text-zinc-500 mt-1">
                      {usuarioMock.ranking.proximoNivel.avaliacoesNecessarias - usuarioMock.ranking.avaliacoes}{" "}
                      avaliações para {usuarioMock.ranking.proximoNivel.nome}
                    </p>
                  </div>

                  <div className="bg-zinc-800 rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-zinc-400">Total de avaliações</p>
                      <p className="text-lg font-bold">{usuarioMock.ranking.avaliacoes}</p>
                    </div>
                    <div className="bg-amber-500/20 text-amber-500 px-3 py-1 rounded-full text-sm font-medium">
                      Top {100 - usuarioMock.ranking.percentil.toFixed(1)}%
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
            <Tabs defaultValue="favoritos" className="space-y-6">
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
                  value="estatísticas"
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
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                                <Heart className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
                </Card>
              </TabsContent>

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
                        {filmesAvaliadosMock.length} filmes
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {filmesAvaliadosMock.length > 0 ? (
                      <div
                        className={`space-y-4 ${
                          mostrarScrollAvaliados ? "max-h-[600px] overflow-y-auto pr-2 custom-scrollbar" : ""
                        }`}
                      >
                        {filmesAvaliadosMock.map((filme) => (
                          <div
                            key={filme.id}
                            className="flex items-center gap-4 p-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors cursor-pointer"
                            onClick={() => setFilmeAberto(encontrarFilmeDetalhado(filme.id))}
                          >
                            <div className="relative w-16 h-24 flex-shrink-0 overflow-hidden rounded">
                              <Image
                                src={filme.capa || "/placeholder.svg"}
                                alt={filme.titulo}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-white truncate">{filme.titulo}</h3>
                              <div className="flex items-center gap-2 text-sm text-zinc-400">
                                <span>{filme.ano}</span>
                              </div>
                              <div className="flex items-center gap-4 mt-1">
                                <div className="flex items-center">
                                  <Star className="h-4 w-4 text-amber-500 fill-amber-500 mr-1" />
                                  <span className="text-sm font-medium">{filme.avaliacao.toFixed(1)}</span>
                                  <span className="text-xs text-zinc-500 ml-1">global</span>
                                </div>
                                <div className="flex items-center">
                                  <Star className="h-4 w-4 text-green-500 fill-green-500 mr-1" />
                                  <span className="text-sm font-medium">{filme.avaliacaoUsuario}</span>
                                  <span className="text-xs text-zinc-500 ml-1">sua</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex-shrink-0 flex gap-2">
                              <div className="bg-zinc-700 rounded-full px-3 py-1 text-sm font-bold text-amber-500">
                                {filme.avaliacaoUsuario}/10
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
                        {filmesRecomendadosMock.length} filmes
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {filmesRecomendadosMock.length > 0 ? (
                      <div
                        className={`space-y-4 ${
                          mostrarScrollRecomendados ? "max-h-[600px] overflow-y-auto pr-2 custom-scrollbar" : ""
                        }`}
                      >
                        {filmesRecomendadosMock.map((filme) => (
                          <div
                            key={filme.id}
                            className="flex items-center gap-4 p-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors cursor-pointer"
                            onClick={() => setFilmeAberto(encontrarFilmeDetalhado(filme.id))}
                          >
                            <div className="relative w-16 h-24 flex-shrink-0 overflow-hidden rounded">
                              <Image
                                src={filme.capa || "/placeholder.svg"}
                                alt={filme.titulo}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-white truncate">{filme.titulo}</h3>
                              <div className="flex items-center gap-2 text-sm text-zinc-400">
                                <span>{filme.ano}</span>
                                <span>•</span>
                                <span className="flex items-center">
                                  <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500 mr-1" />
                                  {filme.avaliacao.toFixed(1)}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {filme.generos.slice(0, 2).map((genero, index) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="bg-zinc-700 border-zinc-600 text-zinc-300 text-xs py-0"
                                  >
                                    {genero}
                                  </Badge>
                                ))}
                              </div>
                              <p className="text-xs text-amber-500/80 mt-1">{filme.motivo}</p>
                            </div>
                            <div className="flex-shrink-0 flex gap-2">
                              <div className="bg-amber-500/20 text-amber-500 px-3 py-1 rounded-full text-sm font-bold">
                                {filme.similaridade}%
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Sparkles className="h-12 w-12 mx-auto text-zinc-700 mb-3" />
                        <h3 className="text-lg font-medium text-zinc-400">Nenhuma recomendação disponível</h3>
                        <p className="text-zinc-500 text-sm mt-1">
                          Avalie mais filmes para receber recomendações personalizadas
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Aba de Estatísticas */}
              <TabsContent value="estatisticas" className="space-y-6">
                <Card className="bg-zinc-900 border-zinc-800 text-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl">Estatísticas de Filmes</CardTitle>
                    <CardDescription className="text-zinc-400">Seus hábitos de visualização</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-medium">Progresso de filmes assistidos</h3>
                        <span className="text-xs text-zinc-400">
                          {usuarioMock.totalFilmesAssistidos} de {usuarioMock.totalFilmes}
                        </span>
                      </div>
                      <Progress
                        value={(usuarioMock.totalFilmesAssistidos / usuarioMock.totalFilmes) * 100}
                        className="h-2 bg-zinc-700"
                      />
                      <p className="text-xs text-zinc-500 mt-1">
                        Você assistiu {((usuarioMock.totalFilmesAssistidos / usuarioMock.totalFilmes) * 100).toFixed(4)}
                        % de todos os filmes
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium mb-3">Filmes por gênero</h3>
                      <div className="space-y-3">
                        {usuarioMock.filmesAssistidosPorGenero.map((item) => (
                          <div key={item.genero}>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm">{item.genero}</span>
                              <span className="text-xs text-zinc-400">{item.quantidade} filmes</span>
                            </div>
                            <Progress
                              value={(item.quantidade / usuarioMock.totalFilmesAssistidos) * 100}
                              className="h-2 bg-zinc-700"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator className="bg-zinc-800" />

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-zinc-800 rounded-lg p-4 text-center">
                        <BarChart3 className="h-8 w-8 mx-auto text-amber-500 mb-2" />
                        <h3 className="text-lg font-bold">8.7</h3>
                        <p className="text-xs text-zinc-400">Avaliação média</p>
                      </div>
                      <div className="bg-zinc-800 rounded-lg p-4 text-center">
                        <Clock className="h-8 w-8 mx-auto text-amber-500 mb-2" />
                        <h3 className="text-lg font-bold">112h</h3>
                        <p className="text-xs text-zinc-400">Tempo total assistido</p>
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
      {filmeAberto && <FilmeModal filme={filmeAberto} aberto={!!filmeAberto} onClose={() => setFilmeAberto(null)} />}
      <EditarPerfilModal
        aberto={editarPerfilAberto}
        onClose={() => setEditarPerfilAberto(false)}
        usuario={usuarioMock}
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
              <AvatarImage src={previewUrl || userData.photo} alt={userData.name} />
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

