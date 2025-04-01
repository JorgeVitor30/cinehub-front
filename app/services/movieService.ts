const API_BASE_URL = 'http://localhost:5129/api'

export interface MovieResponse {
  content: Movie[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
}

export interface Movie {
  id: string
  title: string
  overview: string
  voteCount: number
  voteAverage: number
  releaseDate: string
  revenue: number
  runTime: number
  adult: boolean
  budget: number
  posterPhotoUrl: string
  backPhotoUrl: string
  originalLanguage: string
  popularity: number
  tagline: string
  keyWords: string
  productions: string
  genres: string
}

export const movieService = {
  async getHomeMovies(): Promise<MovieResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/movies/home`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('Dados recebidos da API:', data) // Log para debug
      return data
    } catch (error) {
      console.error('Erro no serviço de filmes:', error)
      throw error
    }
  },

  async getAllMoviesPage(page: number = 1, size: number = 20, title: string = ''): Promise<MovieResponse> {
    try {
      const params = new URLSearchParams({
        page: (page - 1).toString(),
        size: size.toString()
      })
      
      if (title) {
        params.append('title', title)
      }
  
      const url = `${API_BASE_URL}/movies?${params.toString()}`
      console.log('URL da requisição:', url)
      
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
  
      const data = await response.json()
      console.log('Resposta da API:', data) // Debug da resposta
      
      return data as MovieResponse // Garantir que o tipo da resposta seja compatível com MovieResponse
    } catch (error) {
      console.error('Erro ao buscar filmes:', error)
      throw error
    }
  }
}