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
  keywords?: string[] // Nova propriedade para palavras-chave
}

interface FilmeModalProps {
  filme: FilmeDetalhado | null
  aberto: boolean
  onClose: () => void
  isFavorited?: boolean
}

const avaliarAPI = async (filmeId: string, nota: number): Promise<{ success: boolean }> => {
  const response = await fetch(`http://localhost:5129/api/movies/${filmeId}/rate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ rating: nota }),
  })

  if (!response.ok) {
    throw new Error('Falha ao avaliar filme')
  }

  return { success: true }
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

export default function FilmeModal({ filme, aberto, onClose, isFavorited = false }: FilmeModalProps) {
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

  // Atualizar estado inicial
  useEffect(() => {
    if (filme) {
      setFavorito(isFavorited)
      setInitialLoad(false)
      // Aqui você poderia buscar a avaliação do usuário de uma API
      // Por enquanto, vamos simular aleatoriamente se o usuário já avaliou ou não
      const jaAvaliou = Math.random() > 0.7
      const avaliacaoAleatoria = jaAvaliou ? Math.floor(Math.random() * 10) + 1 : null
      setAvaliacaoUsuario(avaliacaoAleatoria)
      setAvaliacaoTemporaria(avaliacaoAleatoria || 5)

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
      await avaliarAPI(filme.id, avaliacaoTemporaria)
      setAvaliacaoUsuario(avaliacaoTemporaria)
      setSucessoAvaliacao(true)

      setTimeout(() => {
        setSucessoAvaliacao(false)
      }, 3000)
    } catch (err) {
      setErro("Não foi possível registrar sua avaliação. Tente novamente.")
    } finally {
      setIsAvaliando(false)
    }
  }

  const salvarAnotacao = () => {
    setAnotacaoSalva(anotacao)
    setEditandoAnotacao(false)

    // Aqui você poderia salvar a anotação em um banco de dados ou localStorage
    localStorage.setItem(`anotacao-filme-${filme.id}`, anotacao)
  }

  // Carregar anotação salva quando o filme mudar
  useEffect(() => {
    if (filme) {
      // Carregar do localStorage ou de uma API
      const anotacaoSalva = localStorage.getItem(`anotacao-filme-${filme.id}`) || ""
      setAnotacao(anotacaoSalva)
      setAnotacaoSalva(anotacaoSalva)
      setEditandoAnotacao(false)
    }
  }, [filme])

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
          </div>

          {/* Conteúdo com scroll */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="relative -mt-20 px-6 pb-6">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">{filme.titulo}</h2>
              
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
                          {anotacaoSalva ? "Editar" : "Adicionar"}
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
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setAnotacao(anotacaoSalva)
                              setEditandoAnotacao(false)
                            }}
                            className="border-zinc-600 text-zinc-300 hover:bg-zinc-700"
                          >
                            Cancelar
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={salvarAnotacao}
                            className="bg-amber-500 hover:bg-amber-600 text-black"
                          >
                            <Save className="h-4 w-4 mr-1" />
                            Salvar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        {anotacaoSalva ? (
                          <p className="text-zinc-300 whitespace-pre-line">{anotacaoSalva}</p>
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
                <div className="flex items-center gap-2 mt-4">
                <Star className="w-5 h-5 text-yellow-400" />
                <span className="text-base font-semibold text-white">
                  <span className="text-yellow-400">{filme.avaliacao.toFixed(1)}</span>
                  <span className="text-zinc-400"> / 10</span>
                </span>
              </div>


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
                                src={producao.logo} 
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
