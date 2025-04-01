"use client"

import { useState, useEffect } from "react"
import { X, Plus, Save, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Producao {
  nome: string
  logo?: string
}

interface FilmeEditavel {
  id: string
  titulo: string
  descricao: string
  ano: number
  duracao: string
  generos: string[]
  lingua: string
  orcamento: string
  producoes: Producao[] | string[]
  keywords?: string[]
  capa: string
  banner?: string
  avaliacao: number
  status?: string
  dataCriacao?: string
}

interface EditarFilmeModalProps {
  filme: FilmeEditavel | null
  aberto: boolean
  onClose: () => void
  onSave: (filme: FilmeEditavel) => Promise<void>
}

export default function EditarFilmeModal({ filme, aberto, onClose, onSave }: EditarFilmeModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("informacoes")

  const [filmeEditado, setFilmeEditado] = useState<FilmeEditavel | null>(null)
  const [novoGenero, setNovoGenero] = useState("")
  const [novaKeyword, setNovaKeyword] = useState("")
  const [novaProducao, setNovaProducao] = useState("")

  // Inicializar o estado com os dados do filme quando o modal é aberto
  useEffect(() => {
    if (filme) {
      setFilmeEditado({
        ...filme,
        keywords: filme.keywords || [],
      })
    }
  }, [filme])

  if (!filmeEditado) return null

  // Função para adicionar um novo gênero
  const adicionarGenero = () => {
    if (novoGenero.trim() && !filmeEditado.generos.includes(novoGenero.trim())) {
      setFilmeEditado({
        ...filmeEditado,
        generos: [...filmeEditado.generos, novoGenero.trim()],
      })
      setNovoGenero("")
    }
  }

  // Função para remover um gênero
  const removerGenero = (genero: string) => {
    setFilmeEditado({
      ...filmeEditado,
      generos: filmeEditado.generos.filter((g) => g !== genero),
    })
  }

  // Função para adicionar uma nova keyword
  const adicionarKeyword = () => {
    if (novaKeyword.trim() && !filmeEditado.keywords?.includes(novaKeyword.trim())) {
      setFilmeEditado({
        ...filmeEditado,
        keywords: [...(filmeEditado.keywords || []), novaKeyword.trim()],
      })
      setNovaKeyword("")
    }
  }

  // Função para remover uma keyword
  const removerKeyword = (keyword: string) => {
    setFilmeEditado({
      ...filmeEditado,
      keywords: filmeEditado.keywords?.filter((k) => k !== keyword) || [],
    })
  }

  // Função para adicionar uma nova produtora
  const adicionarProducao = () => {
    if (novaProducao.trim()) {
      // Verificar se já existe uma produtora com esse nome
      const jaExiste =
        Array.isArray(filmeEditado.producoes) &&
        filmeEditado.producoes.some((p) =>
          typeof p === "string" ? p === novaProducao.trim() : p.nome === novaProducao.trim(),
        )

      if (!jaExiste) {
        const novaProducaoObj = { nome: novaProducao.trim() }
        setFilmeEditado({
          ...filmeEditado,
          producoes: [...filmeEditado.producoes, novaProducaoObj],
        })
        setNovaProducao("")
      }
    }
  }

  // Função para remover uma produtora
  const removerProducao = (producao: string | Producao) => {
    const nomeProducao = typeof producao === "string" ? producao : producao.nome

    setFilmeEditado({
      ...filmeEditado,
      producoes: filmeEditado.producoes.filter((p) =>
        typeof p === "string" ? p !== nomeProducao : p.nome !== nomeProducao,
      ),
    })
  }

  // Função para salvar as alterações
  const handleSave = async () => {
    setIsLoading(true)
    try {
      await onSave(filmeEditado)
      onClose()
    } catch (error) {
      console.error("Erro ao salvar filme:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog
      open={aberto}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent className="max-w-4xl bg-zinc-900 border-zinc-800 text-white">
        <DialogHeader>
          <DialogTitle>Editar Filme</DialogTitle>
          <DialogDescription className="text-zinc-400">Edite as informações do filme</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-zinc-800 border-zinc-700 p-1 mb-6">
            <TabsTrigger
              value="informacoes"
              className="data-[state=active]:bg-amber-500 data-[state=active]:text-black"
            >
              Informações Básicas
            </TabsTrigger>
            <TabsTrigger value="detalhes" className="data-[state=active]:bg-amber-500 data-[state=active]:text-black">
              Detalhes Adicionais
            </TabsTrigger>
          </TabsList>

          {/* Aba de Informações Básicas */}
          <TabsContent value="informacoes" className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título do Filme</Label>
              <Input
                id="titulo"
                value={filmeEditado.titulo}
                onChange={(e) => setFilmeEditado({ ...filmeEditado, titulo: e.target.value })}
                className="bg-zinc-800 border-zinc-700 focus-visible:ring-amber-500"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Sinopse</Label>
              <Textarea
                id="descricao"
                value={filmeEditado.descricao}
                onChange={(e) => setFilmeEditado({ ...filmeEditado, descricao: e.target.value })}
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
                  value={filmeEditado.ano}
                  onChange={(e) => setFilmeEditado({ ...filmeEditado, ano: Number.parseInt(e.target.value) })}
                  className="bg-zinc-800 border-zinc-700 focus-visible:ring-amber-500"
                  min="1900"
                  max="2099"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duracao">Duração</Label>
                <Input
                  id="duracao"
                  value={filmeEditado.duracao}
                  onChange={(e) => setFilmeEditado({ ...filmeEditado, duracao: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 focus-visible:ring-amber-500"
                  placeholder="Ex: 2h 30m"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Gêneros</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {filmeEditado.generos.map((genero) => (
                  <Badge key={genero} className="bg-zinc-700 hover:bg-zinc-600 text-white">
                    {genero}
                    <button type="button" onClick={() => removerGenero(genero)} className="ml-1 hover:text-red-400">
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
              <Select
                value={filmeEditado.lingua}
                onValueChange={(value) => setFilmeEditado({ ...filmeEditado, lingua: value })}
              >
                <SelectTrigger className="bg-zinc-800 border-zinc-700 focus:ring-amber-500">
                  <SelectValue placeholder="Selecione o idioma" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectItem value="Português">Português</SelectItem>
                  <SelectItem value="Inglês">Inglês</SelectItem>
                  <SelectItem value="Espanhol">Espanhol</SelectItem>
                  <SelectItem value="Francês">Francês</SelectItem>
                  <SelectItem value="Alemão">Alemão</SelectItem>
                  <SelectItem value="Japonês">Japonês</SelectItem>
                  <SelectItem value="Coreano">Coreano</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="orcamento">Orçamento</Label>
              <Input
                id="orcamento"
                value={filmeEditado.orcamento}
                onChange={(e) => setFilmeEditado({ ...filmeEditado, orcamento: e.target.value })}
                className="bg-zinc-800 border-zinc-700 focus-visible:ring-amber-500"
                placeholder="Ex: $150 milhões"
              />
            </div>

            <div className="space-y-2">
              <Label>Palavras-chave</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {filmeEditado.keywords?.map((keyword) => (
                  <Badge key={keyword} variant="outline" className="bg-zinc-700 border-zinc-600 text-zinc-300">
                    {keyword}
                    <button type="button" onClick={() => removerKeyword(keyword)} className="ml-1 hover:text-red-400">
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
                {filmeEditado.producoes.map((producao, index) => (
                  <Badge key={index} className="bg-zinc-700 hover:bg-zinc-600 text-white">
                    {typeof producao === "string" ? producao : producao.nome}
                    <button type="button" onClick={() => removerProducao(producao)} className="ml-1 hover:text-red-400">
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
        </Tabs>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSave}
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
                Salvar Alterações
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

