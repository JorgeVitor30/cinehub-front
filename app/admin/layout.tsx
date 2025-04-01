"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Shield, Loader2 } from "lucide-react"

// Layout para a área de administração com verificação de acesso
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)

  // Simulação de verificação de autorização
  useEffect(() => {
    // Para fins de desenvolvimento, vamos sempre autorizar o acesso
    setIsAuthorized(true)

    // Definir o usuário como admin no localStorage para que as funcionalidades funcionem
    localStorage.setItem("isLoggedIn", "true")
    localStorage.setItem("userRole", "admin")
  }, [])

  // Tela de carregamento enquanto verifica autorização
  if (isAuthorized === null) {
    return (
      <div className="min-h-screen bg-zinc-900 flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 text-amber-500 animate-spin mb-4" />
        <p className="text-zinc-400">Verificando permissões...</p>
      </div>
    )
  }

  // Tela de acesso negado
  if (isAuthorized === false) {
    return (
      <div className="min-h-screen bg-zinc-900 flex flex-col items-center justify-center text-center px-4">
        <Shield className="h-16 w-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Acesso Restrito</h1>
        <p className="text-zinc-400 mb-4">Você não tem permissão para acessar a área de administração.</p>
        <p className="text-zinc-500">Redirecionando para a página de login...</p>
      </div>
    )
  }

  // Renderiza o conteúdo da área de administração
  return <>{children}</>
}

