"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { LayoutDashboard, Film, Users, LogOut, Menu, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import AdminDashboard from "@/components/admin/admin-dashboard"

export default function AdminPage() {
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Simular logout
  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn")
    localStorage.removeItem("userRole")
    router.push("/auth")
  }

  // Definir o usuário como admin para fins de demonstração
  useEffect(() => {
    localStorage.setItem("isLoggedIn", "true")
    localStorage.setItem("userRole", "admin")
  }, [])

  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar para desktop */}
        <aside className="hidden md:flex w-64 flex-col bg-zinc-800 border-r border-zinc-700">
          <div className="p-6 border-b border-zinc-700">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-red-600 rounded-full flex items-center justify-center">
                <LayoutDashboard className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-xl">CineHub Admin</span>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            <Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-zinc-700 text-white">
              <LayoutDashboard className="h-5 w-5 text-amber-500" />
              Dashboard
            </Link>
            <Link
              href="/admin/filmes"
              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-zinc-700 text-zinc-300 hover:text-white"
            >
              <Film className="h-5 w-5 text-amber-500" />
              Gerenciar Filmes
            </Link>
            <Link
              href="/admin/usuarios"
              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-zinc-700 text-zinc-300 hover:text-white"
            >
              <Users className="h-5 w-5 text-amber-500" />
              Usuários
            </Link>
          </nav>

          <div className="p-4 border-t border-zinc-700">
            <Button
              variant="ghost"
              className="w-full justify-start text-zinc-400 hover:text-white hover:bg-zinc-700"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-2" />
              Sair
            </Button>
            <div className="mt-4 px-3 py-2 bg-zinc-700/50 rounded-md">
              <p className="text-sm text-zinc-400">Logado como</p>
              <p className="font-medium">Administrador</p>
            </div>
          </div>
        </aside>

        {/* Menu mobile */}
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="md:hidden absolute top-4 left-4 z-50">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 bg-zinc-800 border-zinc-700">
            <div className="p-6 border-b border-zinc-700">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-red-600 rounded-full flex items-center justify-center">
                  <LayoutDashboard className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold text-xl">CineHub Admin</span>
              </div>
            </div>

            <nav className="flex-1 p-4 space-y-1">
              <Link
                href="/admin"
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-zinc-700 text-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <LayoutDashboard className="h-5 w-5 text-amber-500" />
                Dashboard
              </Link>
              <Link
                href="/admin/filmes"
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-zinc-700 text-zinc-300 hover:text-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Film className="h-5 w-5 text-amber-500" />
                Gerenciar Filmes
              </Link>
              <Link
                href="/admin/usuarios"
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-zinc-700 text-zinc-300 hover:text-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Users className="h-5 w-5 text-amber-500" />
                Usuários
              </Link>
            </nav>

            <div className="p-4 border-t border-zinc-700">
              <Button
                variant="ghost"
                className="w-full justify-start text-zinc-400 hover:text-white hover:bg-zinc-700"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5 mr-2" />
                Sair
              </Button>
              <div className="mt-4 px-3 py-2 bg-zinc-700/50 rounded-md">
                <p className="text-sm text-zinc-400">Logado como</p>
                <p className="font-medium">Administrador</p>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Conteúdo principal */}
        <main className="flex-1 overflow-y-auto bg-zinc-900">
          <div className="p-6 md:p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="text-zinc-400">Visão geral da plataforma</p>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/">
                  <Button
                    variant="outline"
                    className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                  >
                    Voltar ao site
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Conteúdo do Dashboard */}
            <AdminDashboard />
          </div>
        </main>
      </div>
    </div>
  )
}

