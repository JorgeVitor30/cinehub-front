"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { authService } from "@/app/services/authService"
import { useAuth } from "@/hooks/useAuth"

export default function AuthPage() {
  const router = useRouter()
  const { setIsAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"login" | "register">("login")

  // Estado para formulário de login
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  })

  // Estado para formulário de cadastro
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  // Manipuladores de formulário de login
  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setLoginData((prev) => ({ ...prev, [name]: value }))
  }

  // Manipuladores de formulário de cadastro
  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setRegisterData((prev) => ({ ...prev, [name]: value }))
  }

  // Envio do formulário de login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    // Validação básica
    if (!loginData.email || !loginData.password) {
      setFormError("Preencha todos os campos obrigatórios")
      return
    }

    try {
      setIsLoading(true)
      
      await authService.login({
        email: loginData.email,
        password: loginData.password
      })

      setIsAuthenticated(true) // Atualiza o estado global
      router.push("/filmes")
    } catch (error) {
      console.error("Erro ao fazer login:", error)
      setFormError("Email ou senha inválidos")
    } finally {
      setIsLoading(false)
    }
  }

  // Envio do formulário de cadastro
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    // Validação básica
    if (!registerData.name || !registerData.email || !registerData.password) {
      setFormError("Preencha todos os campos obrigatórios")
      return
    }

    if (registerData.password !== registerData.confirmPassword) {
      setFormError("As senhas não coincidem")
      return
    }

    if (registerData.password.length < 6) {
      setFormError("A senha deve ter pelo menos 6 caracteres")
      return
    }

    try {
      setIsLoading(true)

      // Simulação de cadastro (aqui você implementaria a chamada real à API)
      await new Promise((resolve) => setTimeout(resolve, 1500))

      console.log("Cadastro realizado com sucesso:", registerData)

      // Redirecionar para a página inicial após cadastro bem-sucedido
      router.push("/")
    } catch (error) {
      console.error("Erro ao cadastrar:", error)
      setFormError("Falha no cadastro. Tente novamente mais tarde.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-zinc-900 flex flex-col">
      <div className="container mx-auto px-4 py-8 flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <button onClick={() => router.push("/")} className="text-zinc-400 hover:text-white flex items-center mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para a página inicial
            </button>

            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-red-600">
                CineHub
              </h1>
              <p className="text-zinc-400 mt-2">Sua plataforma de filmes e avaliações</p>
            </div>
          </div>

          {/* Tabs customizadas */}
          <div className="w-full mb-6">
            <div className="grid grid-cols-2 w-full bg-zinc-800 border-zinc-700 rounded-md overflow-hidden">
              <button
                onClick={() => setActiveTab("login")}
                className={`py-2 px-4 text-sm font-medium transition-colors ${
                  activeTab === "login" ? "bg-amber-500 text-black" : "bg-transparent text-zinc-400 hover:text-white"
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setActiveTab("register")}
                className={`py-2 px-4 text-sm font-medium transition-colors ${
                  activeTab === "register" ? "bg-amber-500 text-black" : "bg-transparent text-zinc-400 hover:text-white"
                }`}
              >
                Cadastro
              </button>
            </div>
          </div>

          {/* Formulário de Login */}
          {activeTab === "login" && (
            <Card className="bg-zinc-900 border-zinc-800 text-white">
              <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription className="text-zinc-400">
                  Entre com sua conta para acessar a plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      name="email"
                      type="email"
                      placeholder="seu.email@exemplo.com"
                      value={loginData.email}
                      onChange={handleLoginChange}
                      className="bg-zinc-800 border-zinc-700 text-white"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="login-password">Senha</Label>
                      <Link href="#" className="text-xs text-amber-500 hover:text-amber-400">
                        Esqueceu a senha?
                      </Link>
                    </div>
                    <div className="relative">
                      <Input
                        id="login-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={loginData.password}
                        onChange={handleLoginChange}
                        className="bg-zinc-800 border-zinc-700 text-white pr-10"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-0 top-0 h-full px-3 text-zinc-400 hover:text-white"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        <span className="sr-only">{showPassword ? "Esconder senha" : "Mostrar senha"}</span>
                      </button>
                    </div>
                  </div>

                  {formError && <div className="bg-red-500/20 text-red-400 p-3 rounded-md text-sm">{formError}</div>}

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-600 hover:to-red-700 text-white border-0 mt-4"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Entrando...
                      </>
                    ) : (
                      "Entrar"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Formulário de Cadastro */}
          {activeTab === "register" && (
            <Card className="bg-zinc-900 border-zinc-800 text-white">
              <CardHeader>
                <CardTitle>Cadastro</CardTitle>
                <CardDescription className="text-zinc-400">
                  Crie sua conta para começar a usar a plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Nome</Label>
                    <Input
                      id="register-name"
                      name="name"
                      type="text"
                      placeholder="Seu nome completo"
                      value={registerData.name}
                      onChange={handleRegisterChange}
                      className="bg-zinc-800 border-zinc-700 text-white"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      name="email"
                      type="email"
                      placeholder="seu.email@exemplo.com"
                      value={registerData.email}
                      onChange={handleRegisterChange}
                      className="bg-zinc-800 border-zinc-700 text-white"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password">Senha</Label>
                    <div className="relative">
                      <Input
                        id="register-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={registerData.password}
                        onChange={handleRegisterChange}
                        className="bg-zinc-800 border-zinc-700 text-white pr-10"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-0 top-0 h-full px-3 text-zinc-400 hover:text-white"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        <span className="sr-only">{showPassword ? "Esconder senha" : "Mostrar senha"}</span>
                      </button>
                    </div>
                    <p className="text-xs text-zinc-500">A senha deve ter pelo menos 6 caracteres</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-confirm-password">Confirmar senha</Label>
                    <Input
                      id="register-confirm-password"
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={registerData.confirmPassword}
                      onChange={handleRegisterChange}
                      className="bg-zinc-800 border-zinc-700 text-white"
                      required
                    />
                  </div>

                  {formError && <div className="bg-red-500/20 text-red-400 p-3 rounded-md text-sm">{formError}</div>}

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-600 hover:to-red-700 text-white border-0 mt-4"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Cadastrando...
                      </>
                    ) : (
                      "Cadastrar"
                    )}
                  </Button>

                  <p className="text-xs text-zinc-500 text-center mt-4">
                    Ao se cadastrar, você concorda com nossos{" "}
                    <Link href="#" className="text-amber-500 hover:text-amber-400">
                      Termos de Serviço
                    </Link>{" "}
                    e{" "}
                    <Link href="#" className="text-amber-500 hover:text-amber-400">
                      Política de Privacidade
                    </Link>
                  </p>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

