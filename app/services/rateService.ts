const API_BASE_URL = 'http://localhost:5129/api'
import { Movie } from "@/app/services/movieService"

export interface RateRequest {
  movieId: string
  userId: string
  rateValue: number
  comment: string
}

export interface RateResponse {
  movie: Movie
    rate: number
    comment: string
  }

class RateService {
  private baseUrl = `${API_BASE_URL}/rate`

  async createRate(rate: RateRequest): Promise<RateResponse | void> {
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth_token='))
      ?.split('=')[1]

    if (!token) {
      throw new Error('Token de autenticação não encontrado')
    }

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          movieId: rate.movieId,
          userId: rate.userId,
          rateValue: rate.rateValue,
          comment: rate.comment
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        console.error('Resposta da API:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        })
        throw new Error(`Falha ao criar avaliação: ${response.status} ${response.statusText}`)
      }

      // Verifica se há conteúdo na resposta
      const text = await response.text()
      if (!text) {
        // Se a resposta estiver vazia, apenas retorna (operação foi bem sucedida)
        return
      }

      try {
        // Tenta fazer o parse do JSON apenas se houver conteúdo
        return JSON.parse(text)
      } catch (e) {
        console.warn('Resposta não é um JSON válido:', text)
        // Se não for um JSON válido, apenas retorna (operação foi bem sucedida)
        return
      }
    } catch (error) {
      console.error('Erro detalhado ao criar avaliação:', error)
      throw error
    }
  }
  
  async updateRate(id: string, rateValue: number, comment: string): Promise<RateResponse | void> {
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth_token='))
      ?.split('=')[1]

    if (!token) {
      throw new Error('Token de autenticação não encontrado')
    }

    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rateValue,
          comment
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        console.error('Resposta da API:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        })
        throw new Error(`Falha ao atualizar avaliação: ${response.status} ${response.statusText}`)
      }

      // Verifica se há conteúdo na resposta
      const text = await response.text()
      if (!text) {
        // Se a resposta estiver vazia, apenas retorna (operação foi bem sucedida)
        return
      }

      try {
        // Tenta fazer o parse do JSON apenas se houver conteúdo
        return JSON.parse(text)
      } catch (e) {
        console.warn('Resposta não é um JSON válido:', text)
        // Se não for um JSON válido, apenas retorna (operação foi bem sucedida)
        return
      }
    } catch (error) {
      console.error('Erro detalhado ao atualizar avaliação:', error)
      throw error
    }
  }

  async deleteRate(movieId: string, userId: string): Promise<void> {
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth_token='))
      ?.split('=')[1]

    if (!token) {
      throw new Error('Token de autenticação não encontrado')
    }

    try {
      const response = await fetch(`${this.baseUrl}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          movieId: movieId,
          userId: userId
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        console.error('Resposta da API:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        })
        throw new Error(`Falha ao deletar avaliação: ${response.status} ${response.statusText}`)
      }
    } catch (error) {
      console.error('Erro detalhado ao deletar avaliação:', error)
      throw error
    }
  }
}

export const rateService = new RateService()