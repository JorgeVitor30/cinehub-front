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

  async createRate(rate: RateRequest): Promise<RateResponse> {
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth_token='))
      ?.split('=')[1]

    try {
        const response = await fetch(`${API_BASE_URL}/favorite`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token ?? ''}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rate),
      })

      if (!response.ok) {
        throw new Error('Falha ao criar avaliação')
      }

      return await response.json()
    } catch (error) {
      console.error('Erro ao criar avaliação:', error)
      throw error
    }
  }
}

export const rateService = new RateService()