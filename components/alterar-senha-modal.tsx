"use client"

import type React from "react"

import { useState } from "react"
import { Check, Eye, EyeOff, Key, Loader2, X } from "lucide-react"
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

interface AlterarSenhaModalProps {
  aberto: boolean
  onClose: () => void
}

export default function AlterarSenhaModal({ aberto, onClose }: AlterarSenhaModalProps) {
  const [senhaAtual, setSenhaAtual] = useState("")
  const [novaSenha, setNovaSenha] = useState("")
  const [confirmarSenha, setConfirmarSenha] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState(false)
  const [mostrarSenhaAtual, setMostrarSenhaAtual] = useState(false)
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false)
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validações
    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      setErro("Preencha todos os campos")
      return
    }

    if (novaSenha !== confirmarSenha) {
      setErro("As senhas não coincidem")
      return
    }

    if (novaSenha.length < 6) {
      setErro("A nova senha deve ter pelo menos 6 caracteres")
      return
    }

    setIsLoading(true)
    setErro(null)
    setSucesso(false)

    try {
      // Simulação de chamada de API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Aqui você faria a chamada real para alterar a senha
      console.log("Senha alterada com sucesso")

      setSucesso(true)

      // Limpar campos
      setSenhaAtual("")
      setNovaSenha("")
      setConfirmarSenha("")

      // Fechar o modal após 1.5 segundos
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (error) {
      setErro("Erro ao alterar senha. Verifique se a senha atual está correta.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={aberto} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Alterar senha</DialogTitle>
          <DialogDescription className="text-zinc-400">Crie uma nova senha para sua conta</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="senha-atual" className="text-white">
                Senha atual
              </Label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  id="senha-atual"
                  type={mostrarSenhaAtual ? "text" : "password"}
                  value={senhaAtual}
                  onChange={(e) => setSenhaAtual(e.target.value)}
                  className="pl-10 pr-10 bg-zinc-800 border-zinc-700 text-white focus-visible:ring-amber-500"
                  placeholder="Digite sua senha atual"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 text-zinc-400"
                  onClick={() => setMostrarSenhaAtual(!mostrarSenhaAtual)}
                >
                  {mostrarSenhaAtual ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span className="sr-only">{mostrarSenhaAtual ? "Esconder senha" : "Mostrar senha"}</span>
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nova-senha" className="text-white">
                Nova senha
              </Label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  id="nova-senha"
                  type={mostrarNovaSenha ? "text" : "password"}
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  className="pl-10 pr-10 bg-zinc-800 border-zinc-700 text-white focus-visible:ring-amber-500"
                  placeholder="Digite sua nova senha"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 text-zinc-400"
                  onClick={() => setMostrarNovaSenha(!mostrarNovaSenha)}
                >
                  {mostrarNovaSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span className="sr-only">{mostrarNovaSenha ? "Esconder senha" : "Mostrar senha"}</span>
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmar-senha" className="text-white">
                Confirmar nova senha
              </Label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  id="confirmar-senha"
                  type={mostrarConfirmarSenha ? "text" : "password"}
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  className="pl-10 pr-10 bg-zinc-800 border-zinc-700 text-white focus-visible:ring-amber-500"
                  placeholder="Confirme sua nova senha"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 text-zinc-400"
                  onClick={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
                >
                  {mostrarConfirmarSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span className="sr-only">{mostrarConfirmarSenha ? "Esconder senha" : "Mostrar senha"}</span>
                </Button>
              </div>
            </div>
          </div>

          {erro && (
            <div className="bg-red-500/20 text-red-400 px-4 py-2 rounded-md flex items-center text-sm">
              <X className="h-4 w-4 mr-2" />
              {erro}
            </div>
          )}

          {sucesso && (
            <div className="bg-green-500/20 text-green-400 px-4 py-2 rounded-md flex items-center text-sm">
              <Check className="h-4 w-4 mr-2" />
              Senha alterada com sucesso!
            </div>
          )}

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
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-600 hover:to-red-700 text-white border-0"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Alterando...
                </>
              ) : (
                "Alterar senha"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

