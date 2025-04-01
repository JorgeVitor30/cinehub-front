"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Film, Users, Star, Clock, TrendingUp, Activity } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// Dados mockados para o dashboard
const usuariosAtivos = [
  { name: "Jan", usuarios: 400 },
  { name: "Fev", usuarios: 450 },
  { name: "Mar", usuarios: 520 },
  { name: "Abr", usuarios: 590 },
  { name: "Mai", usuarios: 650 },
  { name: "Jun", usuarios: 710 },
]

const avaliacoesPorGenero = [
  { name: "Ação", value: 35 },
  { name: "Drama", value: 25 },
  { name: "Comédia", value: 20 },
  { name: "Ficção", value: 15 },
  { name: "Outros", value: 5 },
]

const COLORS = ["#f59e0b", "#ef4444", "#3b82f6", "#10b981", "#8b5cf6"]

const usuariosTopAvaliadores = [
  { id: 1, nome: "João Silva", email: "joao.silva@email.com", avaliacoes: 127, ultimaAtividade: "2 horas atrás" },
  {
    id: 2,
    nome: "Maria Oliveira",
    email: "maria.oliveira@email.com",
    avaliacoes: 98,
    ultimaAtividade: "5 horas atrás",
  },
  { id: 3, nome: "Pedro Santos", email: "pedro.santos@email.com", avaliacoes: 85, ultimaAtividade: "1 dia atrás" },
  { id: 4, nome: "Ana Costa", email: "ana.costa@email.com", avaliacoes: 72, ultimaAtividade: "3 dias atrás" },
  {
    id: 5,
    nome: "Carlos Ferreira",
    email: "carlos.ferreira@email.com",
    avaliacoes: 64,
    ultimaAtividade: "1 semana atrás",
  },
]

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-zinc-800 border-zinc-700 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm">Total de Usuários</p>
                <p className="text-3xl font-bold mt-1">2,547</p>
                <p className="text-green-500 text-xs mt-1 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12% este mês
                </p>
              </div>
              <div className="bg-zinc-700 p-3 rounded-full">
                <Users className="h-6 w-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-800 border-zinc-700 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm">Total de Filmes</p>
                <p className="text-3xl font-bold mt-1">1,283</p>
                <p className="text-green-500 text-xs mt-1 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +8% este mês
                </p>
              </div>
              <div className="bg-zinc-700 p-3 rounded-full">
                <Film className="h-6 w-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-800 border-zinc-700 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm">Avaliações</p>
                <p className="text-3xl font-bold mt-1">18,392</p>
                <p className="text-green-500 text-xs mt-1 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +24% este mês
                </p>
              </div>
              <div className="bg-zinc-700 p-3 rounded-full">
                <Star className="h-6 w-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-800 border-zinc-700 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm">Tempo Médio</p>
                <p className="text-3xl font-bold mt-1">24min</p>
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <Activity className="h-3 w-3 mr-1" />
                  -3% este mês
                </p>
              </div>
              <div className="bg-zinc-700 p-3 rounded-full">
                <Clock className="h-6 w-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-zinc-800 border-zinc-700 text-white">
          <CardHeader>
            <CardTitle>Usuários Ativos</CardTitle>
            <CardDescription className="text-zinc-400">Últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={usuariosAtivos} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="name" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#333", borderColor: "#555" }}
                    labelStyle={{ color: "#fff" }}
                  />
                  <Bar dataKey="usuarios" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-800 border-zinc-700 text-white">
          <CardHeader>
            <CardTitle>Avaliações por Gênero</CardTitle>
            <CardDescription className="text-zinc-400">Distribuição percentual</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={avaliacoesPorGenero}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {avaliacoesPorGenero.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#333", borderColor: "#555" }}
                    labelStyle={{ color: "#fff" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de usuários mais ativos */}
      <Card className="bg-zinc-800 border-zinc-700 text-white">
        <CardHeader>
          <CardTitle>Top Avaliadores</CardTitle>
          <CardDescription className="text-zinc-400">Usuários mais ativos na plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-700">
                  <th className="text-left py-3 px-4 text-zinc-400 font-medium">Usuário</th>
                  <th className="text-left py-3 px-4 text-zinc-400 font-medium">Email</th>
                  <th className="text-center py-3 px-4 text-zinc-400 font-medium">Avaliações</th>
                  <th className="text-right py-3 px-4 text-zinc-400 font-medium">Última Atividade</th>
                </tr>
              </thead>
              <tbody>
                {usuariosTopAvaliadores.map((usuario) => (
                  <tr key={usuario.id} className="border-b border-zinc-700 hover:bg-zinc-700/30">
                    <td className="py-3 px-4">{usuario.nome}</td>
                    <td className="py-3 px-4 text-zinc-400">{usuario.email}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="bg-amber-500/20 text-amber-500 px-2 py-1 rounded-full text-xs font-medium">
                        {usuario.avaliacoes}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-zinc-400">{usuario.ultimaAtividade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

