"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Film, Search, User, Menu, X, Home, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { authService } from "@/app/services/authService"
import { useAuth } from '@/contexts/AuthContext'

export default function Navbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated, setIsAuthenticated } = useAuth()

  const isActive = (path: string) => pathname === path

  const handleLogout = () => {
    authService.logout()
    setIsAuthenticated(false)
    router.push('/') // Redireciona para a página inicial após logout
  }

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-lg bg-black/70 border-b border-zinc-800">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 md:gap-6">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="bg-zinc-900 text-white border-zinc-800">
                <nav className="flex flex-col gap-6 mt-8">
                  <Link
                    href="/"
                    className="flex items-center gap-2 text-lg font-medium hover:text-amber-500 transition"
                  >
                    <Home className="h-5 w-5" />
                    Home
                  </Link>
                  <Link
                    href="/filmes"
                    className="flex items-center gap-2 text-lg font-medium hover:text-amber-500 transition"
                  >
                    <Film className="h-5 w-5" />
                    Filmes
                  </Link>
                  <Link
                    href="/perfil"
                    className="flex items-center gap-2 text-lg font-medium hover:text-amber-500 transition"
                  >
                    <User className="h-5 w-5" />
                    Meu Perfil
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>

            <Link href="/" className="flex items-center gap-2">
              <div className="relative w-8 h-8 bg-gradient-to-br from-amber-500 to-red-600 rounded-full flex items-center justify-center">
                <Film className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl hidden sm:inline-block">CineHub</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/"
                className={`text-sm font-medium hover:text-amber-500 transition pb-1 ${
                  isActive("/") ? "border-b-2 border-amber-500 text-white" : "text-zinc-400"
                }`}
              >
                Home
              </Link>
              <Link
                href="/filmes"
                className={`text-sm font-medium hover:text-amber-500 transition pb-1 ${
                  isActive("/filmes") ? "border-b-2 border-amber-500 text-white" : "text-zinc-400"
                }`}
              >
                Filmes
              </Link>
              <Link
                href="/perfil"
                className={`text-sm font-medium hover:text-amber-500 transition pb-1 ${
                  isActive("/perfil") ? "border-b-2 border-amber-500 text-white" : "text-zinc-400"
                }`}
              >
                Meu Perfil
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {isSearchOpen ? (
              <div className="relative flex items-center">
                <Input
                  type="search"
                  placeholder="Buscar filmes..."
                  className="w-full md:w-[300px] bg-zinc-800 border-zinc-700 focus-visible:ring-amber-500 text-white placeholder:text-zinc-400"
                  autoFocus
                />
                <Button variant="ghost" size="icon" className="absolute right-0" onClick={() => setIsSearchOpen(false)}>
                  <X className="h-4 w-4" />
                  <span className="sr-only">Fechar busca</span>
                </Button>
              </div>
            ) : (
              <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)}>
                <Search className="h-5 w-5" />
                <span className="sr-only">Buscar</span>
              </Button>
            )}

            <Button variant="ghost" size="icon" className="hidden md:flex" asChild>
              <Link href="/perfil">
                <User className="h-5 w-5" />
                <span className="sr-only">Perfil</span>
              </Link>
            </Button>

            {isAuthenticated ? (
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="text-zinc-400 hover:text-white gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            ) : (
              <Link href="/auth">
                <Button variant="outline">
                  Entrar
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

