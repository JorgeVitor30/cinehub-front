"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, X, Upload, Loader2, Save, Film, Clock, Calendar, DollarSign, Globe, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

export default function NovoFilmePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("informacoes")
  const [novoGenero, setNovoGenero] = useState("")
  const [generos, setGeneros] = useState<string[]>([])
  const [novaKeyword, setNovaKeyword] = useState("")
  const [keywords, setKeywords] = useState<string[]>([])
  const [novaProducao, setNovaProducao] = useState("")
  const [producoes, setProducoes] = useState<string[]>([])

  // Função para adicionar um novo gênero
  const adicionarGenero = () => {
    if (novoGenero.trim() && !generos.includes(novoGenero.trim())) {
      setGeneros([...generos, novoGenero.trim()])
      setNovoGenero("")
    }
  }

  // Função para remover um gênero
  const removerGenero = (genero: string) => {
    setGeneros(generos.filter((g) => g !== genero))
  }

  // Função para adicionar uma nova keyword
  const adicionarKeyword = () => {
    if (novaKeyword.trim() && !keywords.includes(novaKeyword.trim())) {
      setKeywords([...keywords, novaKeyword.trim()])
      setNovaKeyword("")
    }
  }

  // Função para remover uma keyword
  const removerKeyword = (keyword: string) => {
    setKeywords(keywords.filter((k) => k !== keyword))
  }

  // Função para adicionar uma nova produtora
  const adicionarProducao = () => {
    if (novaProducao.trim() && !producoes.includes(novaProducao.trim())) {
      setProducoes([...producoes, novaProducao.trim()])
      setNovaProducao("")
    }
  }

  // Função para remover uma produtora
  const removerProducao = (producao: string) => {
    setProducoes(producoes.filter((p) => p !== producao))
  }

  // Função para salvar o filme
  const salvarFilme = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsLoading(true)

    try {
      // Simulação de envio para API
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Aqui você faria a chamada real para a API
      console.log("Filme salvo com sucesso!")

      // Redirecionar para a lista de filmes
      router.push("/admin/filmes")
    } catch (error) {
      console.error("Erro ao salvar filme:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar é renderizada pelo layout compartilhado */}

        {/* Conteúdo principal */}
        <main className="flex-1 overflow-y-auto bg-zinc-900">
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push("/admin/filmes")}
                  className="hover:bg-zinc-800"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span className="sr-only">Voltar</span>
                </Button>
                <Link href="/admin">
                  <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                    Voltar ao Dashboard
                  </Button>
                </Link>
              </div>
              <div>
                <h1 className="text-2xl font-bold">Adicionar Novo Filme</h1>
                <p className="text-zinc-400">Preencha os detalhes do filme</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Formulário principal */}
              <div className="lg:col-span-2">
                <form onSubmit={salvarFilme}>
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="bg-zinc-800 border-zinc-700 p-1 mb-6">
                      <TabsTrigger
                        value="informacoes"
                        className="data-[state=active]:bg-amber-500 data-[state=active]:text-black"
                      >
                        Informações Básicas
                      </TabsTrigger>
                      <TabsTrigger
                        value="detalhes"
                        className="data-[state=active]:bg-amber-500 data-[state=active]:text-black"
                      >
                        Detalhes Adicionais
                      </TabsTrigger>
                      <TabsTrigger
                        value="midia"
                        className="data-[state=active]:bg-amber-500 data-[state=active]:text-black"
                      >
                        Mídia
                      </TabsTrigger>
                    </TabsList>

                    {/* Aba de Informações Básicas */}
                    <TabsContent value="informacoes" className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="titulo">Título do Filme</Label>
                        <Input
                          id="titulo"
                          placeholder="Digite o título do filme"
                          className="bg-zinc-800 border-zinc-700 focus-visible:ring-amber-500"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="descricao">Sinopse</Label>
                        <Textarea
                          id="descricao"
                          placeholder="Digite a sinopse do filme"
                          className="bg-zinc-800 border-zinc-700 focus-visible:ring-amber-500 min-h-32"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="ano">Ano de Lançamento</Label>
                          <Input
                            id="ano"
                            type="number"
                            placeholder="Ex: 2024"
                            className="bg-zinc-800 border-zinc-700 focus-visible:ring-amber-500"
                            min="1900"
                            max="2099"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="duracao">Duração (em minutos)</Label>
                          <Input
                            id="duracao"
                            type="number"
                            placeholder="Ex: 120"
                            className="bg-zinc-800 border-zinc-700 focus-visible:ring-amber-500"
                            min="1"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Gêneros</Label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {generos.map((genero) => (
                            <Badge key={genero} className="bg-zinc-700 hover:bg-zinc-600 text-white">
                              {genero}
                              <button
                                type="button"
                                onClick={() => removerGenero(genero)}
                                className="ml-1 hover:text-red-400"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Adicionar gênero"
                            value={novoGenero}
                            onChange={(e) => setNovoGenero(e.target.value)}
                            className="bg-zinc-800 border-zinc-700 focus-visible:ring-amber-500"
                            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), adicionarGenero())}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={adicionarGenero}
                            className="border-zinc-700 hover:bg-zinc-800"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Aba de Detalhes Adicionais */}
                    <TabsContent value="detalhes" className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="lingua">Idioma Principal</Label>
                        <Select defaultValue="pt-BR">
                          <SelectTrigger className="bg-zinc-800 border-zinc-700 focus:ring-amber-500">
                            <SelectValue placeholder="Selecione o idioma" />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                            <SelectItem value="pt-BR">Português</SelectItem>
                            <SelectItem value="en-US">Inglês</SelectItem>
                            <SelectItem value="es">Espanhol</SelectItem>
                            <SelectItem value="fr">Francês</SelectItem>
                            <SelectItem value="de">Alemão</SelectItem>
                            <SelectItem value="ja">Japonês</SelectItem>
                            <SelectItem value="ko">Coreano</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="orcamento">Orçamento (em milhões de dólares)</Label>
                        <Input
                          id="orcamento"
                          type="number"
                          placeholder="Ex: 150"
                          className="bg-zinc-800 border-zinc-700 focus-visible:ring-amber-500"
                          min="0"
                          step="0.1"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Palavras-chave</Label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {keywords.map((keyword) => (
                            <Badge
                              key={keyword}
                              variant="outline"
                              className="bg-zinc-700 border-zinc-600 text-zinc-300"
                            >
                              {keyword}
                              <button
                                type="button"
                                onClick={() => removerKeyword(keyword)}
                                className="ml-1 hover:text-red-400"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Adicionar palavra-chave"
                            value={novaKeyword}
                            onChange={(e) => setNovaKeyword(e.target.value)}
                            className="bg-zinc-800 border-zinc-700 focus-visible:ring-amber-500"
                            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), adicionarKeyword())}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={adicionarKeyword}
                            className="border-zinc-700 hover:bg-zinc-800"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Produtoras</Label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {producoes.map((producao) => (
                            <Badge key={producao} className="bg-zinc-700 hover:bg-zinc-600 text-white">
                              {producao}
                              <button
                                type="button"
                                onClick={() => removerProducao(producao)}
                                className="ml-1 hover:text-red-400"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Adicionar produtora"
                            value={novaProducao}
                            onChange={(e) => setNovaProducao(e.target.value)}
                            className="bg-zinc-800 border-zinc-700 focus-visible:ring-amber-500"
                            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), adicionarProducao())}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={adicionarProducao}
                            className="border-zinc-700 hover:bg-zinc-800"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Aba de Mídia */}
                    <TabsContent value="midia" className="space-y-6">
                      <div className="space-y-2">
                        <Label>Imagem de Capa</Label>
                        <div className="border-2 border-dashed border-zinc-700 rounded-lg p-6 text-center">
                          <div className="flex flex-col items-center">
                            <Upload className="h-10 w-10 text-zinc-500 mb-2" />
                            <p className="text-zinc-400 mb-2">Arraste e solte uma imagem ou</p>
                            <Button type="button" variant="outline" className="border-zinc-700 hover:bg-zinc-800">
                              Selecionar arquivo
                            </Button>
                            <p className="text-xs text-zinc-500 mt-2">PNG, JPG ou WEBP (máx. 2MB)</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Imagem de Banner</Label>
                        <div className="border-2 border-dashed border-zinc-700 rounded-lg p-6 text-center">
                          <div className="flex flex-col items-center">
                            <Upload className="h-10 w-10 text-zinc-500 mb-2" />
                            <p className="text-zinc-400 mb-2">Arraste e solte uma imagem ou</p>
                            <Button type="button" variant="outline" className="border-zinc-700 hover:bg-zinc-800">
                              Selecionar arquivo
                            </Button>
                            <p className="text-xs text-zinc-500 mt-2">PNG, JPG ou WEBP (máx. 4MB)</p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div className="flex justify-end mt-8 pt-6 border-t border-zinc-800">
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push("/admin/filmes")}
                        className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                        disabled={isLoading}
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        className="bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-600 hover:to-red-700 text-white border-0"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Salvando...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Salvar Filme
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Painel lateral com preview e dicas */}
              <div className="lg:col-span-1">
                <Card className="bg-zinc-800 border-zinc-700 text-white sticky top-8">
                  <CardContent className="p-6 space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Preview</h3>
                      <div className="aspect-[2/3] bg-zinc-700 rounded-lg flex items-center justify-center">
                        <Film className="h-12 w-12 text-zinc-500" />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Dicas</h3>
                      <ul className="space-y-3 text-sm text-zinc-400">
                        <li className="flex gap-2">
                          <Film className="h-5 w-5 text-amber-500 flex-shrink-0" />
                          <span>Adicione um título descritivo e atraente para o filme.</span>
                        </li>
                        <li className="flex gap-2">
                          <Clock className="h-5 w-5 text-amber-500 flex-shrink-0" />
                          <span>A duração deve ser informada em minutos (ex: 120 para 2 horas).</span>
                        </li>
                        <li className="flex gap-2">
                          <Calendar className="h-5 w-5 text-amber-500 flex-shrink-0" />
                          <span>Informe o ano de lançamento original do filme.</span>
                        </li>
                        <li className="flex gap-2">
                          <DollarSign className="h-5 w-5 text-amber-500 flex-shrink-0" />
                          <span>O orçamento deve ser informado em milhões de dólares.</span>
                        </li>
                        <li className="flex gap-2">
                          <Globe className="h-5 w-5 text-amber-500 flex-shrink-0" />
                          <span>Selecione o idioma principal em que o filme foi produzido.</span>
                        </li>
                        <li className="flex gap-2">
                          <Tag className="h-5 w-5 text-amber-500 flex-shrink-0" />
                          <span>Adicione palavras-chave relevantes para melhorar a busca.</span>
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

