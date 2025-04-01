"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Save, Loader2, Globe, Mail, Shield, Database, Key } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"

export default function ConfiguracoesPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("geral")

  // Configurações gerais
  const [nomeDoSite, setNomeDoSite] = useState("CineHub")
  const [descricaoDoSite, setDescricaoDoSite] = useState("Sua plataforma de filmes e avaliações")
  const [emailContato, setEmailContato] = useState("contato@cinehub.com")
  const [manutencao, setManutencao] = useState(false)

  // Configurações de email
  const [emailsAtivados, setEmailsAtivados] = useState(true)
  const [emailBoasVindas, setEmailBoasVindas] = useState(true)
  const [emailAvaliacoes, setEmailAvaliacoes] = useState(true)
  const [emailNewsletter, setEmailNewsletter] = useState(false)

  // Configurações de segurança
  const [registroAberto, setRegistroAberto] = useState(true)
  const [verificacaoEmail, setVerificacaoEmail] = useState(true)
  const [autenticacaoDoisFatores, setAutenticacaoDoisFatores] = useState(false)
  const [tempoSessao, setTempoSessao] = useState("24h")

  // Função para salvar as configurações
  const salvarConfiguracoes = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsLoading(true)

    try {
      // Simulação de envio para API
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Aqui você faria a chamada real para a API
      console.log("Configurações salvas com sucesso!")
    } catch (error) {
      console.error("Erro ao salvar configurações:", error)
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
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold">Configurações</h1>
                <p className="text-zinc-400">Gerencie as configurações da plataforma</p>
                <div className="mt-2">
                  <Link href="/admin">
                    <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                      Voltar ao Dashboard
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            <form onSubmit={salvarConfiguracoes}>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-zinc-800 border-zinc-700 p-1 mb-6">
                  <TabsTrigger
                    value="geral"
                    className="data-[state=active]:bg-amber-500 data-[state=active]:text-black"
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    Geral
                  </TabsTrigger>
                  <TabsTrigger
                    value="email"
                    className="data-[state=active]:bg-amber-500 data-[state=active]:text-black"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </TabsTrigger>
                  <TabsTrigger
                    value="seguranca"
                    className="data-[state=active]:bg-amber-500 data-[state=active]:text-black"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Segurança
                  </TabsTrigger>
                  <TabsTrigger value="api" className="data-[state=active]:bg-amber-500 data-[state=active]:text-black">
                    <Key className="h-4 w-4 mr-2" />
                    API
                  </TabsTrigger>
                </TabsList>

                {/* Aba de Configurações Gerais */}
                <TabsContent value="geral" className="space-y-6">
                  <Card className="bg-zinc-800 border-zinc-700 text-white">
                    <CardHeader>
                      <CardTitle>Configurações Gerais</CardTitle>
                      <CardDescription className="text-zinc-400">
                        Configure as informações básicas da plataforma
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="nome-site">Nome do Site</Label>
                        <Input
                          id="nome-site"
                          value={nomeDoSite}
                          onChange={(e) => setNomeDoSite(e.target.value)}
                          className="bg-zinc-700 border-zinc-600 focus-visible:ring-amber-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="descricao-site">Descrição do Site</Label>
                        <Textarea
                          id="descricao-site"
                          value={descricaoDoSite}
                          onChange={(e) => setDescricaoDoSite(e.target.value)}
                          className="bg-zinc-700 border-zinc-600 focus-visible:ring-amber-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email-contato">Email de Contato</Label>
                        <Input
                          id="email-contato"
                          type="email"
                          value={emailContato}
                          onChange={(e) => setEmailContato(e.target.value)}
                          className="bg-zinc-700 border-zinc-600 focus-visible:ring-amber-500"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="manutencao">Modo de Manutenção</Label>
                          <p className="text-sm text-zinc-400">
                            Ative para mostrar uma página de manutenção para todos os usuários
                          </p>
                        </div>
                        <Switch id="manutencao" checked={manutencao} onCheckedChange={setManutencao} />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Aba de Configurações de Email */}
                <TabsContent value="email" className="space-y-6">
                  <Card className="bg-zinc-800 border-zinc-700 text-white">
                    <CardHeader>
                      <CardTitle>Configurações de Email</CardTitle>
                      <CardDescription className="text-zinc-400">Configure as notificações por email</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="emails-ativados">Emails Ativados</Label>
                          <p className="text-sm text-zinc-400">Ative para permitir o envio de emails pela plataforma</p>
                        </div>
                        <Switch id="emails-ativados" checked={emailsAtivados} onCheckedChange={setEmailsAtivados} />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="email-boas-vindas">Email de Boas-vindas</Label>
                          <p className="text-sm text-zinc-400">Enviar email de boas-vindas para novos usuários</p>
                        </div>
                        <Switch
                          id="email-boas-vindas"
                          checked={emailBoasVindas}
                          onCheckedChange={setEmailBoasVindas}
                          disabled={!emailsAtivados}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="email-avaliacoes">Notificações de Avaliações</Label>
                          <p className="text-sm text-zinc-400">Enviar email quando um filme receber novas avaliações</p>
                        </div>
                        <Switch
                          id="email-avaliacoes"
                          checked={emailAvaliacoes}
                          onCheckedChange={setEmailAvaliacoes}
                          disabled={!emailsAtivados}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="email-newsletter">Newsletter Semanal</Label>
                          <p className="text-sm text-zinc-400">
                            Enviar newsletter semanal com novos filmes e destaques
                          </p>
                        </div>
                        <Switch
                          id="email-newsletter"
                          checked={emailNewsletter}
                          onCheckedChange={setEmailNewsletter}
                          disabled={!emailsAtivados}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Aba de Configurações de Segurança */}
                <TabsContent value="seguranca" className="space-y-6">
                  <Card className="bg-zinc-800 border-zinc-700 text-white">
                    <CardHeader>
                      <CardTitle>Configurações de Segurança</CardTitle>
                      <CardDescription className="text-zinc-400">
                        Configure as opções de segurança da plataforma
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="registro-aberto">Registro Aberto</Label>
                          <p className="text-sm text-zinc-400">
                            Permitir que novos usuários se registrem na plataforma
                          </p>
                        </div>
                        <Switch id="registro-aberto" checked={registroAberto} onCheckedChange={setRegistroAberto} />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="verificacao-email">Verificação de Email</Label>
                          <p className="text-sm text-zinc-400">Exigir verificação de email para novos usuários</p>
                        </div>
                        <Switch
                          id="verificacao-email"
                          checked={verificacaoEmail}
                          onCheckedChange={setVerificacaoEmail}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="autenticacao-dois-fatores">Autenticação de Dois Fatores</Label>
                          <p className="text-sm text-zinc-400">
                            Permitir que usuários ativem a autenticação de dois fatores
                          </p>
                        </div>
                        <Switch
                          id="autenticacao-dois-fatores"
                          checked={autenticacaoDoisFatores}
                          onCheckedChange={setAutenticacaoDoisFatores}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="tempo-sessao">Tempo de Sessão</Label>
                        <Select value={tempoSessao} onValueChange={setTempoSessao}>
                          <SelectTrigger className="bg-zinc-700 border-zinc-600 focus:ring-amber-500">
                            <SelectValue placeholder="Selecione o tempo de sessão" />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                            <SelectItem value="1h">1 hora</SelectItem>
                            <SelectItem value="6h">6 horas</SelectItem>
                            <SelectItem value="12h">12 horas</SelectItem>
                            <SelectItem value="24h">24 horas</SelectItem>
                            <SelectItem value="7d">7 dias</SelectItem>
                            <SelectItem value="30d">30 dias</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-zinc-400">
                          Tempo que o usuário permanecerá logado antes de precisar fazer login novamente
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Aba de Configurações de API */}
                <TabsContent value="api" className="space-y-6">
                  <Card className="bg-zinc-800 border-zinc-700 text-white">
                    <CardHeader>
                      <CardTitle>Configurações de API</CardTitle>
                      <CardDescription className="text-zinc-400">
                        Configure as chaves de API e integrações
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="tmdb-api-key">TMDB API Key</Label>
                        <Input
                          id="tmdb-api-key"
                          type="password"
                          placeholder="••••••••••••••••••••••"
                          className="bg-zinc-700 border-zinc-600 focus-visible:ring-amber-500"
                        />
                        <p className="text-xs text-zinc-400">Chave de API para integração com The Movie Database</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="youtube-api-key">YouTube API Key</Label>
                        <Input
                          id="youtube-api-key"
                          type="password"
                          placeholder="••••••••••••••••••••••"
                          className="bg-zinc-700 border-zinc-600 focus-visible:ring-amber-500"
                        />
                        <p className="text-xs text-zinc-400">Chave de API para integração com YouTube</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="webhook-url">URL de Webhook</Label>
                        <Input
                          id="webhook-url"
                          placeholder="https://seu-webhook.com/endpoint"
                          className="bg-zinc-700 border-zinc-600 focus-visible:ring-amber-500"
                        />
                        <p className="text-xs text-zinc-400">URL para receber notificações de eventos da plataforma</p>
                      </div>

                      <div className="pt-4 border-t border-zinc-700">
                        <Button
                          type="button"
                          variant="outline"
                          className="border-zinc-600 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                        >
                          <Database className="mr-2 h-4 w-4" />
                          Gerar Nova Chave de API
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end mt-8 pt-6 border-t border-zinc-800">
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
                      Salvar Configurações
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}

