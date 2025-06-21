"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Clock, Calendar, Globe, Star, DollarSign, Check, X, Heart, Loader2, Tag, Pencil, Save } from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { VisuallyHidden } from "@/components/ui/visually-hidden"
import { movieService } from "@/app/services/movieService";
import { authService } from "@/app/services/authService";
import { userService } from "@/app/services/userService";
import { rateService } from "@/app/services/rateService"

export interface Producao {
  nome: string
  logo?: string
}

export interface FilmeDetalhado {
  id: string
  titulo: string
  capa: string
  banner?: string
  descricao: string
  avaliacao: number
  duracao: string
  ano: number
  generos: string[]
  lingua: string
  orcamento: string
  producoes: Producao[]
  keywords?: string[]
  userRating?: {
    id: string
    rate: number
    comment: string
  }
  voteCount: number
}

interface FilmeModalProps {
  filme: FilmeDetalhado | null
  aberto: boolean
  onClose: () => void
  isFavorited?: boolean
  onRatingUpdate?: (movieId: string, newRating: number, newComment: string) => void
  onRatingDelete?: (movieId: string) => void
}

// Palavras-chave mockadas para filmes que não têm
const keywordsMock: Record<string, string[]> = {
  "1": ["Sonhos", "Subconsciente", "Roubo", "Labirinto", "Arquitetura", "Tempo"],
  "2": ["Espaço", "Buracos negros", "Viagem no tempo", "Relatividade", "Família"],
  "3": ["Monstro", "Experimento", "Viagem", "Liberdade", "Descoberta"],
  "4": ["Nazismo", "Segunda Guerra", "Holocausto", "Família", "Moral"],
  "5": ["Julgamento", "Investigação", "Morte", "Família", "Montanha"],
  "6": ["Monstros", "Batalha", "Ilha", "Civilização", "Tecnologia"],
  "7": ["Artes marciais", "China", "Comida", "Amizade", "Treinamento"],
  "8": ["Fantasmas", "Sobrenatural", "Inverno", "Equipe", "Nova York"],
  "9": ["Deserto", "Vingança", "Sobrevivência", "Distopia", "Veículos"],
  "10": ["Evolução", "Conflito", "Sobrevivência", "Sociedade", "Liderança"],
  "11": ["Máfia", "Família", "Poder", "Lealdade", "Vingança", "Itália"],
  "12": ["Assassinos", "Histórias cruzadas", "Redenção", "Boxe", "Gangsters"],
  "13": ["Fantasia", "Guerra", "Amizade", "Jornada", "Magia", "Poder"],
  "14": ["Favela", "Violência", "Fotografia", "Rio de Janeiro", "Tráfico"],
  "15": ["Realidade virtual", "Inteligência artificial", "Distopia", "Rebelião", "Kung Fu"],
  "16": ["Boneca", "Feminismo", "Identidade", "Mundo real", "Patriarcado"],
  "17": ["Multiverso", "Família", "Imigrantes", "Kung Fu", "Absurdo"],
  "18": ["Deserto", "Política", "Religião", "Ecologia", "Profecia"],
  "19": ["Desigualdade", "Classe social", "Porão", "Infiltração", "Comédia negra"],
  "20": ["Gotham", "Doença mental", "Comédia", "Violência", "Sociedade"],
}

export default function FilmeModal({ filme, aberto, onClose, isFavorited = false, onRatingUpdate, onRatingDelete }: FilmeModalProps) {
  const [avaliacaoUsuario, setAvaliacaoUsuario] = useState<number | null>(null)
  const [avaliacaoTemporaria, setAvaliacaoTemporaria] = useState<number>(0)
  const [isAvaliando, setIsAvaliando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [sucessoAvaliacao, setSucessoAvaliacao] = useState(false)
  const [favorito, setFavorito] = useState(isFavorited)
  const [anotacao, setAnotacao] = useState<string>("")
  const [anotacaoSalva, setAnotacaoSalva] = useState<string>("")
  const [editandoAnotacao, setEditandoAnotacao] = useState(false)
  const [initialLoad, setInitialLoad] = useState(true)

  const handleFavoritar = async () => {
    if (!filme) return;
    setIsAvaliando(true);
    try {
      const user = await authService.getUserFromToken();
      if (!user) {throw new Error("Usuário não autenticado")};
      if (favorito) {
        await movieService.removeFavorite(user.nameid, filme.id);
        setFavorito(false);
        // Após remover o favorito, recarregar os dados do usuário e fechar o modal
        const updatedUser = await userService.getUserById(user.nameid);
        if (updatedUser) {
          // Atualizar o estado global do usuário (você precisará implementar isso)
          // Por exemplo, usando um contexto ou estado global
          onClose(); // Fechar o modal
          window.location.reload(); // Recarregar a página para atualizar a lista
        }
      } else {
        await movieService.addFavorite(user.nameid, filme.id);
        setFavorito(true);
      }
      setErro(null);
    } catch (err: any) {
      setErro(err.message || "Erro ao favoritar/desfavoritar filme");
    } finally {
      setIsAvaliando(false);
    }
  };

  // Atualizar estado inicial com a avaliação do usuário se existir
  useEffect(() => {
    if (filme) {
      setFavorito(isFavorited)
      setInitialLoad(false)
      
      if (filme.userRating) {
        setAvaliacaoUsuario(filme.userRating.rate)
        setAvaliacaoTemporaria(filme.userRating.rate)
        // Atualizar o comentário se existir na avaliação do usuário
        if (filme.userRating.comment) {
          setAnotacao(filme.userRating.comment)
          setAnotacaoSalva(filme.userRating.comment)
          setEditandoAnotacao(false)
        }
      } else {
        setAvaliacaoUsuario(null)
        setAvaliacaoTemporaria(5)
        setAnotacao("")
        setAnotacaoSalva("")
      }

      // Resetar estados de erro e sucesso
      setErro(null)
      setSucessoAvaliacao(false)
    }
  }, [filme])

  if (!filme) {
    return null
  }

  // Obter palavras-chave do filme ou usar mock se não existirem
  const keywords = filme.keywords || keywordsMock[filme.id] || []

  const handleAvaliar = async () => {
    setIsAvaliando(true)
    setErro(null)
    setSucessoAvaliacao(false)

    try {
      const user = await authService.getUserFromToken()
      if (!user?.nameid) {
        setErro("Você precisa estar logado para avaliar um filme.")
        return
      }

      // Se já existe uma avaliação (userRating), usa updateRate
      if (filme.userRating?.id) {
        await rateService.updateRate(
          filme.userRating.id,
          avaliacaoTemporaria,
          anotacao || ""
        )
      } else {
        // Se não existe avaliação, cria uma nova
        await rateService.createRate({
          movieId: filme.id,
          userId: user.nameid,
          rateValue: avaliacaoTemporaria,
          comment: anotacao || ""
        })
      }

      // Se chegou aqui, a avaliação foi bem sucedida
      setAvaliacaoUsuario(avaliacaoTemporaria)
      setSucessoAvaliacao(true)

      // Salvar o comentário junto com a avaliação
      if (anotacao) {
        setAnotacaoSalva(anotacao)
      }

      // Chamar o callback de atualização se existir
      onRatingUpdate?.(filme.id, avaliacaoTemporaria, anotacao || "")

      setTimeout(() => {
        setSucessoAvaliacao(false)
      }, 3000)
    } catch (err) {
      console.error('Erro ao avaliar:', err)
      if (err instanceof Error) {
        setErro(err.message)
      } else {
      setErro("Não foi possível registrar sua avaliação. Tente novamente.")
      }
    } finally {
      setIsAvaliando(false)
    }
  }

  const salvarAnotacao = async () => {
    try {
      if (!filme.userRating?.id) {
        setErro("Não é possível salvar anotação sem uma avaliação")
        return
      }

      setIsAvaliando(true)
      setErro(null)

      // Atualiza apenas o comentário, mantendo a mesma nota
      await rateService.updateRate(
        filme.userRating.id,
        filme.userRating.rate,
        anotacao
      )

      setAnotacaoSalva(anotacao)
      setEditandoAnotacao(false)
      setSucessoAvaliacao(true)

      // Chamar o callback de atualização se existir
      onRatingUpdate?.(filme.id, filme.userRating.rate, anotacao)

      setTimeout(() => {
        setSucessoAvaliacao(false)
      }, 3000)
    } catch (err) {
      console.error('Erro ao salvar anotação:', err)
      if (err instanceof Error) {
        setErro(err.message)
      } else {
        setErro("Não foi possível salvar sua anotação. Tente novamente.")
      }
    } finally {
      setIsAvaliando(false)
    }
  }

  const handleDeleteRating = async () => {
    if (!filme) return

    try {
      setIsAvaliando(true)
      setErro(null)

      // Chamar o callback de remoção se existir
      onRatingDelete?.(filme.id)

      // Resetar estados locais
      setAvaliacaoUsuario(null)
      setAvaliacaoTemporaria(5)
      setAnotacao("")
      setAnotacaoSalva("")
      setEditandoAnotacao(false)
      setSucessoAvaliacao(true)

      setTimeout(() => {
        setSucessoAvaliacao(false)
      }, 3000)
    } catch (err) {
      console.error('Erro ao deletar avaliação:', err)
      if (err instanceof Error) {
        setErro(err.message)
      } else {
        setErro("Não foi possível deletar sua avaliação. Tente novamente.")
      }
    } finally {
      setIsAvaliando(false)
    }
  }

  return (
    <Dialog open={aberto} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95%] max-w-4xl bg-zinc-900 text-white border-zinc-800 p-0 overflow-hidden">
        <VisuallyHidden>
          <DialogTitle>Detalhes do filme {filme.titulo}</DialogTitle>
        </VisuallyHidden>
        
        <div className="max-h-[85vh] overflow-hidden flex flex-col">
          {/* Banner do filme - Ajustado para melhor responsividade */}
          <div className="relative w-full h-[250px] flex-shrink-0">
            <div className="absolute inset-0">
              <Image
                src={filme.banner || filme.capa}
                alt={filme.titulo}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1200px"
                quality={85}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/60 to-transparent" />

            {/* Botão de fechar */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Título do filme no canto superior esquerdo */}
            <div className="absolute top-4 left-4 z-50 max-w-[70%]">
              <h1 className="text-xl md:text-2xl font-bold text-white drop-shadow-lg">
                {filme.titulo}
              </h1>
            </div>
          </div>

          {/* Conteúdo com scroll */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="relative -mt-20 px-6 pb-6">
              {/* Metadados do filme */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-zinc-300 mb-4">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{filme.duracao}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{filme.ano}</span>
                </div>
                <div className="flex items-center">
                  <Globe className="h-4 w-4 mr-1" />
                  <span>{filme.lingua}</span>
                </div>
                <div className="flex items-center text-amber-500">
                  <Star className="h-4 w-4 mr-1 fill-amber-500" />
                  <span>{filme.avaliacao.toFixed(1)}/10</span>
                  <span className="text-zinc-400 ml-1">({filme.voteCount.toLocaleString()} votos)</span>
                </div>
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-1" />
                  <span>{filme.orcamento}</span>
                </div>
              </div>

              {/* Grid de conteúdo principal */}
              <div className="grid gap-6 md:grid-cols-3">
                {/* Coluna da esquerda: Descrição e Avaliação */}
                <div className="md:col-span-2 space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Sinopse</h3>
                    <p className="text-zinc-300">{filme.descricao}</p>
                  </div>

                  {/* Seção de palavras-chave */}
                  {keywords.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2 flex items-center">
                        <Tag className="h-5 w-5 mr-2 text-amber-500" />
                        Palavras-chave
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {keywords.map((keyword, index) => (
                          <Badge key={index} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Seção de anotações */}
                  <div className="bg-zinc-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold flex items-center">
                        <Pencil className="h-5 w-5 mr-2 text-amber-500" />
                        Minhas anotações
                      </h3>
                      {!editandoAnotacao && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditandoAnotacao(true)}
                          className="text-zinc-400 hover:text-white"
                        >
                          {anotacao ? "Editar" : "Adicionar"}
                        </Button>
                      )}
                    </div>

                    {editandoAnotacao ? (
                      <div className="space-y-2">
                        <Textarea
                          placeholder="Escreva uma anotação curta sobre este filme..."
                          value={anotacao}
                          onChange={(e) => setAnotacao(e.target.value)}
                          className="bg-zinc-700 border-zinc-600 focus-visible:ring-amber-500"
                        />
                        <div className="flex justify-end items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditandoAnotacao(false)
                              setErro(null)
                            }}
                            className="border-zinc-600 text-zinc-300 hover:bg-zinc-700"
                          >
                            Cancelar
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={() => {
                              salvarAnotacao()
                            }}
                            className="bg-amber-500 hover:bg-amber-600 text-black"
                          >
                            Confirmar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        {anotacao ? (
                          <p className="text-zinc-300 whitespace-pre-line">{anotacao}</p>
                        ) : (
                          <p className="text-zinc-500 italic">Nenhuma anotação para este filme.</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Seção de avaliação */}
                  <div className="bg-zinc-800 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      Sua avaliação
                      {avaliacaoUsuario !== null && (
                        <span className="ml-2 bg-green-500/20 text-green-500 text-xs rounded-full px-2 py-0.5 flex items-center">
                          <Check className="h-3 w-3 mr-1" />
                          Avaliado
                        </span>
                      )}
                    </h3>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {[...Array(10)].map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                "h-5 w-5 cursor-pointer transition-all",
                                i < avaliacaoTemporaria ? "text-amber-500 fill-amber-500" : "text-zinc-600"
                              )}
                              onClick={() => setAvaliacaoTemporaria(i + 1)}
                            />
                          ))}
                        </div>
                        <span className="text-2xl font-bold text-amber-500">{avaliacaoTemporaria}/10</span>
                      </div>

                      <Slider
                        min={1}
                        max={10}
                        step={1}
                        value={[avaliacaoTemporaria]}
                        onValueChange={(value) => setAvaliacaoTemporaria(value[0])}
                        className="w-full"
                      />

                      <div className="flex justify-between items-center">
                        <div>
                          {erro && <p className="text-red-500 text-sm">{erro}</p>}
                          {sucessoAvaliacao && (
                            <p className="text-green-500 text-sm flex items-center">
                              <Check className="h-3 w-3 mr-1" />
                              Avaliação registrada com sucesso!
                            </p>
                          )}
                        </div>

                        <div className="flex gap-2">
                          {avaliacaoUsuario !== null && (
                            <Button
                              variant="outline"
                              onClick={handleDeleteRating}
                              disabled={isAvaliando}
                              className="border-red-500/50 text-red-500 hover:bg-red-500/10"
                            >
                              {isAvaliando ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Removendo...
                                </>
                              ) : (
                                "Remover avaliação"
                              )}
                            </Button>
                          )}
                          <Button
                            onClick={handleAvaliar}
                            disabled={isAvaliando || avaliacaoTemporaria === avaliacaoUsuario}
                            className="bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-600 hover:to-red-700 text-white"
                          >
                            {isAvaliando ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Enviando...
                              </>
                            ) : avaliacaoUsuario !== null ? (
                              "Atualizar avaliação"
                            ) : (
                              "Avaliar filme"
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Coluna da direita: Favoritar e outras informações */}
                <div className="space-y-6">
                  <Button
                    variant="outline"
                    onClick={handleFavoritar}
                    disabled={isAvaliando}
                    className={cn(
                      "w-full border-zinc-700 flex items-center justify-center gap-2",
                      favorito ? "bg-red-500/10 border-red-500/50 text-red-500 hover:bg-red-500/20" : "hover:bg-zinc-800"
                    )}
                  >
                    <Heart className={cn("h-5 w-5", favorito && "fill-red-500")} />
                    {isAvaliando ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      favorito ? "Remover dos favoritos" : "Adicionar aos favoritos"
                    )}
                  </Button>

                  {/* Estatísticas do Filme */}
                  <div className="bg-zinc-800/50 rounded-lg p-4 space-y-4">                   
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-400">Avaliação</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                          <span className="font-medium">{filme.avaliacao.toFixed(1)}/10</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-zinc-400">Total de votos</span>
                        <span className="font-medium">{filme.voteCount.toLocaleString()}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-zinc-400">Idioma original</span>
                        <span className="font-medium uppercase">{filme.lingua}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-zinc-400">Orçamento</span>
                        <span className="font-medium">{filme.orcamento}</span>
                      </div>
                    </div>
                  </div>

                  {/* Gêneros */}
                  {filme.generos && filme.generos.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-400 mb-2">Gêneros</h3>
                      <div className="flex flex-wrap gap-2">
                        {filme.generos.map((genero, index) => (
                          <Badge 
                            key={index}
                            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
                          >
                            {genero}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Produtoras */}
                  {filme.producoes && filme.producoes.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-400 mb-2">Produção</h3>
                      <div className="space-y-2">
                        {filme.producoes.map((producao, index) => (
                          <div 
                            key={index}
                            className="flex items-center gap-2 bg-zinc-800/50 p-2 rounded-md"
                          >
                            {producao.logo ? (
                              <img 
                                src={producao.logo || undefined} 
                                alt={producao.nome}
                                className="w-8 h-8 object-contain"
                              />
                            ) : (
                              <div className="w-8 h-8 bg-zinc-700 rounded-md flex items-center justify-center text-zinc-400">
                                {producao.nome.charAt(0)}
                              </div>
                            )}
                            <span className="text-sm text-zinc-300">{producao.nome}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
