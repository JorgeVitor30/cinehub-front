"use client"

import { Star, Film, Users, Clock } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface Usuario {
  id: string
  nome: string
  avatar: string
  nivel: string
  avaliacoes: number
  generosFavoritos: string[]
  filmesFavoritos: string[]
  compatibilidade: number
  ultimaAtividade: string
  bio: string
}

interface UsuarioCardProps {
  usuario: Usuario
  onClick: () => void
}

export default function UsuarioCard({ usuario, onClick }: UsuarioCardProps) {
  // Determinar a cor da compatibilidade
  const getCompatibilidadeCor = (valor: number) => {
    if (valor >= 80) return "text-green-500"
    if (valor >= 60) return "text-amber-500"
    if (valor >= 40) return "text-orange-500"
    return "text-red-500"
  }

  return (
    <div
      className="bg-zinc-800 rounded-lg border border-zinc-700 hover:border-zinc-600 transition-all hover:shadow-lg cursor-pointer"
      onClick={onClick}
    >
      <div className="p-5">
        <div className="flex items-center gap-4 mb-4">
          <Avatar className="h-16 w-16 border-2 border-amber-500">
            <AvatarImage src={usuario.avatar || undefined} alt={usuario.nome} />
            <AvatarFallback className="bg-zinc-700 text-lg">{usuario.nome.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-bold text-lg">{usuario.nome}</h3>
            <p className="text-zinc-400 text-sm">{usuario.nivel}</p>
            <div className="flex items-center mt-1">
              <div className={`font-bold text-sm ${getCompatibilidadeCor(usuario.compatibilidade)}`}>
                {usuario.compatibilidade}% compatível
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="bg-zinc-700 p-1.5 rounded-full">
              <Star className="h-4 w-4 text-amber-500" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-zinc-400">Avaliações</span>
                <span className="font-medium">{usuario.avaliacoes}</span>
              </div>
              <Progress value={Math.min((usuario.avaliacoes / 300) * 100, 100)} className="h-1.5 bg-zinc-700" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-zinc-700 p-1.5 rounded-full">
              <Film className="h-4 w-4 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-zinc-400">Gêneros favoritos</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {usuario.generosFavoritos.map((genero, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="bg-zinc-700 border-zinc-600 text-zinc-300 text-xs py-0"
                  >
                    {genero}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="text-sm text-zinc-300 line-clamp-2 mb-3">{usuario.bio}</div>

        <div className="flex justify-between items-center text-xs text-zinc-400 pt-3 border-t border-zinc-700">
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span>Ativo {usuario.ultimaAtividade}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            <span>Ver perfil</span>
          </div>
        </div>
      </div>
    </div>
  )
}
