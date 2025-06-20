"use client"

import type React from "react"
import { useState } from "react"
import { Check, Loader2, Mail, User, X } from "lucide-react"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { userService } from "@/app/services/userService"
import { Switch } from "@/components/ui/switch"

interface EditarPerfilModalProps {
  aberto: boolean
  onClose: () => void
  usuario: {
    id: string
    name: string
    email: string
    photo?: string
    visibilityPublic: boolean
  }
  onProfileUpdate?: () => void
}

export default function EditarPerfilModal({ aberto, onClose, usuario, onProfileUpdate }: EditarPerfilModalProps) {
  const [nome, setNome] = useState(usuario.name)
  const [email, setEmail] = useState(usuario.email)
  const [visibilityPublic, setVisibilityPublic] = useState(usuario.visibilityPublic)
  const [isLoading, setIsLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!nome.trim() || !email.trim()) {
      setErro("Preencha todos os campos obrigatórios")
      return
    }

    if (!email.includes("@") || !email.includes(".")) {
      setErro("Email inválido")
      return
    }

    setIsLoading(true)
    setErro(null)
    setSucesso(false)

    try {
      await userService.updateProfile(usuario.id, {
        name: nome,
        email: email,
        visibilityPublic: visibilityPublic
      })

      setSucesso(true)
      
      // Chamar o callback de atualização se existir
      if (onProfileUpdate) {
        onProfileUpdate()
      }

      // Fechar o modal após 1.5 segundos
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (error: any) {
      setErro(error.message || "Erro ao atualizar perfil. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={aberto} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Editar perfil</DialogTitle>
          <DialogDescription className="text-zinc-400">Atualize suas informações pessoais</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="flex justify-center mb-6">
            <Avatar className="w-20 h-20 border-2 border-amber-500">
              <AvatarImage src={usuario.photo || undefined} alt={usuario.name} />
              <AvatarFallback className="bg-zinc-800 text-xl">{usuario.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome" className="text-white">
                Nome
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="pl-10 bg-zinc-800 border-zinc-700 text-white focus-visible:ring-amber-500"
                  placeholder="Seu nome completo"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-zinc-800 border-zinc-700 text-white focus-visible:ring-amber-500"
                  placeholder="seu.email@exemplo.com"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="visibility" className="text-white">
                Perfil público
              </Label>
              <Switch
                id="visibility"
                checked={visibilityPublic}
                onCheckedChange={setVisibilityPublic}
              />
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
              Perfil atualizado com sucesso!
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
                  Salvando...
                </>
              ) : (
                "Salvar alterações"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

