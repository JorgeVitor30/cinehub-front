import Cookies from 'js-cookie'

interface LoginCredentials {
  email: string
  password: string
}

interface LoginResponse {
  token: string
  user: {
    id: string
    name: string
    email: string
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5129/api'

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Email ou senha inválidos')
        }
        throw new Error('Erro ao fazer login')
      }

      const data = await response.json()
      
      // Salva o token em um cookie HTTP-only
      document.cookie = `auth_token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict; Secure`
      
      return data
    } catch (error) {
      console.error('Erro no login:', error)
      throw error
    }
  },

  logout() {
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
  },

  getToken(): string | null {
    const cookies = document.cookie.split(';')
    const authCookie = cookies.find(cookie => cookie.trim().startsWith('auth_token='))
    return authCookie ? authCookie.split('=')[1] : null
  },

  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false
    return !!this.getToken()
  },

  async getUserFromToken() {
    const token = this.getToken()
    if (!token) return null

    try {
      const response = await fetch(`${API_URL}/auth/decode`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      })

      if (!response.ok) {
        console.error('Erro ao decodificar token')
        return null
      }

      const data = await response.json()
      return data
    } catch (err) {
      console.error('Erro na requisição de decodificação:', err)
      return null
    }
  }
}
