const API_BASE_URL = 'http://localhost:5129/api/movies'

export interface MovieResponse {
  popularMovies: Movie[]
  newReleaseMovies: Movie[]
  classicMovies: Movie[]
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
      const response = await fetch(`${API_BASE_URL}/home`)
      
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

  async getAllMoviesPage(): Promise<Movie[]> {
    try {
      const response = await fetch(`${API_BASE_URL}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Erro ao buscar todos os filmes:', error)
      throw error
    }
  }
}