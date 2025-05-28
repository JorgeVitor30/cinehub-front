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

export interface NovoFilme {
  title: string
  overview: string
  releaseDate: string
  runTime: number
  adult: boolean
  budget: number
  originalLanguage: string
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
  },

  async uploadMoviePhotos(movieId: string, posterPhoto: File, backPhoto: File): Promise<void> {
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth_token='))
        ?.split('=')[1]

      const formData = new FormData()
      formData.append('PosterPhoto', posterPhoto)
      formData.append('BackPhoto', backPhoto)

      const response = await fetch(`${API_BASE_URL}/movies/${movieId}/photo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token ?? ''}`,
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error('Falha ao fazer upload das fotos')
      }
    } catch (error) {
      console.error('Erro ao fazer upload das fotos:', error)
      throw error
    }
  },

  async createMovie(movie: NovoFilme): Promise<Movie> {
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth_token='))
      ?.split('=')[1]

    const response = await fetch(`${API_BASE_URL}/movies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token ?? ''}`
      },
      body: JSON.stringify(movie)
    })

    if (!response.ok) {
      throw new Error('Erro ao criar filme')
    }

    return response.json()
  }
}