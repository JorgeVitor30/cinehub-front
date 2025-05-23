const API_BASE_URL = 'http://localhost:5129/api'

export interface MovieResponse {
  content: Movie[]
  total: number
  currentPage: number
  size: number
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
  async addFavorite(userId: string, movieId: string): Promise<void> {
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth_token='))
      ?.split('=')[1]

    const response = await fetch(`${API_BASE_URL}/favorite`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token ?? ''}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userId,
        movieId: movieId
      }),
    })

    if (!response.ok) {
      throw new Error('Falha ao adicionar aos favoritos')
    }
  },

  async removeFavorite(userId: string, movieId: string): Promise<void> {
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth_token='))
      ?.split('=')[1]

    const response = await fetch(`${API_BASE_URL}/favorite`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token ?? ''}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userId,
        movieId: movieId
      }),
    })

    if (!response.ok) {
      throw new Error('Falha ao remover dos favoritos')
    }
  },

  async getHomeMovies(): Promise<MovieResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/movies/home`)
      
      if (!response.ok) {
        throw new Error(`User not Authenticated! status: ${response.status}`)
      }

      const data = await response.json()
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

      const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth_token='))
      ?.split('=')[1]

      const response = await fetch(`${API_BASE_URL}/movies?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token ?? ''}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`User not Authenticated! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Erro ao buscar filmes:', error)
      throw error
    }
  }
}