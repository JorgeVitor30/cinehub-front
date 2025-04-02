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

  async getAllMoviesPage(
    page: number = 1, 
    size: number = 20, 
    title: string = '',
    genre: string = '',
    note: number = 0
  ): Promise<MovieResponse> {
    try {
      const params = new URLSearchParams({
        page: (page - 1).toString(),
        size: size.toString()
      })
      
      if (title) {
        params.append('title', title)
      }
      
      if (genre) {
        params.append('genre', genre)
      }
      
      if (note > 0) {
        params.append('note', note.toString())
      }

      const response = await fetch(`${API_BASE_URL}/movies?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Erro ao buscar filmes:', error)
      throw error
    }
  }
}