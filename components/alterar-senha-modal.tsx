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
import { userService } from "@/app/services/userService" 
import { authService } from '../app/services/authService';

interface AlterarSenhaModalProps {
  aberto: boolean
  onClose: () => void
}
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5129/api'


export default function AlterarSenhaModal({ aberto, onClose }: AlterarSenhaModalProps) {
  const [senhaAtual, setSenhaAtual] = useState("")
  const [novaSenha, setNovaSenha] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState(false)
  const [mostrarSenhaAtual, setMostrarSenhaAtual] = useState(false)
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!senhaAtual || !novaSenha) {
      setErro("Preencha todos os campos")
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
      const decodedUser = await authService.getUserFromToken()
      console.log("Decoded user:", decodedUser)
      await userService.changePasswordById(decodedUser.nameid, {lastPassword: senhaAtual, newPassword: novaSenha})
      authService.logout()
      // Redireciona para login após logout
      window.location.href = '/login'
    }
    catch (error: any) {
      console.error("Erro ao alterar senha:", error)
      setErro(error.message || "Erro ao alterar senha")
    }
    finally {
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
