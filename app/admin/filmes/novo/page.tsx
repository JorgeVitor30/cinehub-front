"use client"

import type React from "react"
import { useState, useEffect } from "react"
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
import { Switch } from "@/components/ui/switch"
import { movieService } from "@/app/services/movieService"

// Enum temporário de gêneros - substituir pelo seu enum quando criar
const GENRES = [
  "Ação",
  "Aventura",
  "Animação",
  "Comédia",
  "Crime",
  "Documentário",
  "Drama",
  "Família",
  "Fantasia",
  "História",
  "Terror",
  "Música",
  "Mistério",
  "Romance",
  "Ficção Científica",
  "Cinema TV",
  "Thriller",
  "Guerra",
  "Faroeste"
]

interface NovoFilme {
  title: string
  overview: string
  releaseDate: string
  runTime: number
  adult: boolean
  budget: number
  originalLanguage: string
  tagline: string
  keyWords: string
  productions: string
  genres: string
}

export default function NovoFilmePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("informacoes")
  const [generosSelecionados, setGenerosSelecionados] = useState<string[]>([])
  const [novaKeyword, setNovaKeyword] = useState("")
  const [keywords, setKeywords] = useState<string[]>([])
  const [novaProducao, setNovaProducao] = useState("")
  const [producoes, setProducoes] = useState<string[]>([])
  const [posterFile, setPosterFile] = useState<File | null>(null)
  const [backFile, setBackFile] = useState<File | null>(null)
  const [posterPreview, setPosterPreview] = useState<string>("")
  const [backPreview, setBackPreview] = useState<string>("")
  const [filme, setFilme] = useState<NovoFilme>({
    title: "",
    overview: "",
    releaseDate: "",
    runTime: 0,
    adult: false,
    budget: 0,
    originalLanguage: "",
    tagline: "",
    keyWords: "",
    productions: "",
    genres: ""
  })

  // Handler para atualizar o estado do filme
  const handleChange = (field: keyof NovoFilme, value: string | number | boolean) => {
    setFilme(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Função para adicionar uma nova keyword
  const adicionarKeyword = () => {
    if (novaKeyword.trim() && !keywords.includes(novaKeyword.trim())) {
      const newKeywords = [...keywords, novaKeyword.trim()]
      setKeywords(newKeywords)
      handleChange('keyWords', newKeywords.join(", "))
      setNovaKeyword("")
    }
  }

  // Função para remover uma keyword
  const removerKeyword = (keyword: string) => {
    const newKeywords = keywords.filter((k) => k !== keyword)
    setKeywords(newKeywords)
    handleChange('keyWords', newKeywords.join(", "))
  }

  // Função para adicionar uma nova produtora
  const adicionarProducao = () => {
    if (novaProducao.trim() && !producoes.includes(novaProducao.trim())) {
      const newProducoes = [...producoes, novaProducao.trim()]
      setProducoes(newProducoes)
      handleChange('productions', newProducoes.join(", "))
      setNovaProducao("")
    }
  }

  // Função para remover uma produtora
  const removerProducao = (producao: string) => {
    const newProducoes = producoes.filter((p) => p !== producao)
    setProducoes(newProducoes)
    handleChange('productions', newProducoes.join(", "))
  }

  // Handler para selecionar/deselecionar gêneros
  const toggleGenero = (genero: string) => {
    const newGeneros = generosSelecionados.includes(genero)
      ? generosSelecionados.filter(g => g !== genero)
      : [...generosSelecionados, genero]
    
    setGenerosSelecionados(newGeneros)
    handleChange('genres', newGeneros.join(", "))
  }

  // Função para formatar o valor em dólar
  const formatCurrency = (value: string) => {
    // Remove todos os caracteres não numéricos
    const numbers = value.replace(/\D/g, "")
    
    // Converte para número e formata como moeda
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Number(numbers))

    return formatted
  }

  // Handler para o campo de orçamento
  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "")
    handleChange("budget", parseInt(value) || 0)
  }

  // Handler para arquivos de imagem
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'poster' | 'back') => {
    const file = e.target.files?.[0]
    if (file) {
      if (type === 'poster') {
        setPosterFile(file)
        setPosterPreview(URL.createObjectURL(file))
      } else {
        setBackFile(file)
        setBackPreview(URL.createObjectURL(file))
      }
    }
  }

  // Limpar URLs de preview quando componente for desmontado
  useEffect(() => {
    return () => {
      if (posterPreview) URL.revokeObjectURL(posterPreview)
      if (backPreview) URL.revokeObjectURL(backPreview)
    }
  }, [posterPreview, backPreview])

  // Função para salvar o filme
  const salvarFilme = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // 1. Criar o filme primeiro
      const response = await fetch('http://localhost:5129/api/movies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${document.cookie.split('; ').find(row => row.startsWith('auth_token='))?.split('=')[1] ?? ''}`
        },
        body: JSON.stringify(filme)
      })

      if (!response.ok) {
        throw new Error('Erro ao criar filme')
      }

      const filmeCreated = await response.json()

      // 2. Se tiver arquivos de imagem, fazer o upload
      if (posterFile && backFile) {
        try {
          await movieService.uploadMoviePhotos(filmeCreated.id, posterFile, backFile)
          console.log('Fotos do filme enviadas com sucesso!')
        } catch (error) {
          console.error("Erro ao fazer upload das fotos:", error)
          // Não vamos impedir a navegação se o upload falhar
        }
      }

      // 3. Redirecionar após tudo concluído
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
                        <Label htmlFor="title">Título do Filme</Label>
                        <Input
                          id="title"
                          value={filme.title}
                          onChange={(e) => handleChange('title', e.target.value)}
                          placeholder="Digite o título do filme"
                          className="bg-zinc-800 border-zinc-700 focus-visible:ring-amber-500"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="overview">Sinopse</Label>
                        <Textarea
                          id="overview"
                          value={filme.overview}
                          onChange={(e) => handleChange('overview', e.target.value)}
                          placeholder="Digite a sinopse do filme"
                          className="bg-zinc-800 border-zinc-700 focus-visible:ring-amber-500 min-h-32"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="tagline">Tagline</Label>
                        <Input
                          id="tagline"
                          value={filme.tagline}
                          onChange={(e) => handleChange('tagline', e.target.value)}
                          placeholder="Digite a tagline do filme"
                          className="bg-zinc-800 border-zinc-700 focus-visible:ring-amber-500"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="releaseDate">Data de Lançamento</Label>
                          <Input
                            id="releaseDate"
                            type="date"
                            value={filme.releaseDate.split('T')[0]}
                            onChange={(e) => handleChange('releaseDate', new Date(e.target.value).toISOString())}
                            className="bg-zinc-800 border-zinc-700 focus-visible:ring-amber-500"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="runTime">Duração (em minutos)</Label>
                          <Input
                            id="runTime"
                            type="number"
                            value={filme.runTime}
                            onChange={(e) => handleChange('runTime', parseInt(e.target.value))}
                            placeholder="Ex: 120"
                            className="bg-zinc-800 border-zinc-700 focus-visible:ring-amber-500"
                            min="1"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Gêneros</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {GENRES.map((genero) => (
                            <div
                              key={genero}
                              className={`p-2 rounded cursor-pointer transition-colors ${
                                generosSelecionados.includes(genero)
                                  ? 'bg-amber-500 text-black'
                                  : 'bg-zinc-800 hover:bg-zinc-700'
                              }`}
                              onClick={() => toggleGenero(genero)}
                            >
                              {genero}
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>

                    {/* Aba de Detalhes Adicionais */}
                    <TabsContent value="detalhes" className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="originalLanguage">Idioma Principal</Label>
                        <Select 
                          value={filme.originalLanguage}
                          onValueChange={(value) => handleChange('originalLanguage', value)}
                        >
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
                        <Label htmlFor="budget">Orçamento</Label>
                        <div className="relative">
                        <Input
                            id="budget"
                            type="text"
                            value={formatCurrency(filme.budget.toString())}
                            onChange={handleBudgetChange}
                            placeholder="Ex: $150,000,000"
                            className="bg-zinc-800 border-zinc-700 focus-visible:ring-amber-500 pl-10"
                          />
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="adult"
                          checked={filme.adult}
                          onCheckedChange={(checked) => handleChange('adult', checked)}
                        />
                        <Label htmlFor="adult" className="flex items-center gap-2">
                          Conteúdo adulto
                          <span className="text-lg" role="img" aria-label="18 plus">🔞</span>
                        </Label>
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Upload do Pôster */}
                        <Card className="bg-zinc-800 border-zinc-700">
                          <CardContent className="p-6">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold">Pôster do Filme</h3>
                              </div>
                              <div className="border-2 border-dashed border-zinc-700 rounded-lg p-6 text-center">
                                {posterPreview ? (
                                  <div className="relative aspect-[2/3] w-full max-w-[200px] mx-auto">
                                    <img
                                      src={posterPreview}
                                      alt="Preview do pôster"
                                      className="rounded-lg object-cover w-full h-full"
                                    />
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="absolute top-2 right-2 bg-black/50 hover:bg-black/70"
                                      onClick={() => {
                                        setPosterFile(null)
                                        setPosterPreview("")
                                      }}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="py-4">
                                    <Upload className="h-8 w-8 mx-auto mb-2 text-zinc-500" />
                                    <Label htmlFor="poster" className="cursor-pointer">
                                      <span className="text-sm text-zinc-400">
                                        Clique para fazer upload do pôster
                                      </span>
                                      <Input
                                        id="poster"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => handleImageChange(e, 'poster')}
                                      />
                                    </Label>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Upload do Banner */}
                        <Card className="bg-zinc-800 border-zinc-700">
                          <CardContent className="p-6">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold">Banner do Filme</h3>
                              </div>
                              <div className="border-2 border-dashed border-zinc-700 rounded-lg p-6 text-center">
                                {backPreview ? (
                                  <div className="relative aspect-video w-full max-w-[400px] mx-auto">
                                    <img
                                      src={backPreview}
                                      alt="Preview do banner"
                                      className="rounded-lg object-cover w-full h-full"
                                    />
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="absolute top-2 right-2 bg-black/50 hover:bg-black/70"
                                      onClick={() => {
                                        setBackFile(null)
                                        setBackPreview("")
                                      }}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="py-4">
                                    <Upload className="h-8 w-8 mx-auto mb-2 text-zinc-500" />
                                    <Label htmlFor="banner" className="cursor-pointer">
                                      <span className="text-sm text-zinc-400">
                                        Clique para fazer upload do banner
                                      </span>
                                      <Input
                                        id="banner"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => handleImageChange(e, 'back')}
                                      />
                                    </Label>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
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
                      <h3 className="text-lg font-semibold mb-2">Preview dos Dados</h3>
                      <pre className="bg-zinc-900 p-4 rounded-lg overflow-auto text-xs">
                        {JSON.stringify(filme, null, 2)}
                      </pre>
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
                          <span>Informe a data de lançamento do filme.</span>
                        </li>
                        <li className="flex gap-2">
                          <DollarSign className="h-5 w-5 text-amber-500 flex-shrink-0" />
                          <span>O orçamento deve ser informado em dólares (ex: 150000000).</span>
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

