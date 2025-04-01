export interface Filme {
  id: string
  titulo: string
  capa: string
  banner?: string
  avaliacao: number
  duracao: string
  ano: number
  generos: string[]
  lingua: string
  orcamento: string
  descricao: string
  producoes: { nome: string }[]
}

