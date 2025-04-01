"use client"

import FilmesGrid from "@/components/filmes-grid"
import Navbar from "@/components/navbar"
import FilmeModalWrapper from "@/components/filme-modal-wrapper"
import { useState } from "react"
import type { Filme } from "@/types/filme"

export default function Home() {
  const [filmeAberto, setFilmeAberto] = useState<Filme | null>(null)

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-zinc-900 text-white">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <section className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-red-600">
            Descubra novos filmes
          </h1>
          <p className="text-zinc-400">
            Explore nossa coleção de filmes e encontre sua próxima aventura cinematográfica
          </p>
        </section>

        <div className="grid gap-10">
          <section>
            <div className="mb-4">
              <h2 className="text-2xl font-semibold">Em Alta</h2>
              <FilmesGrid categoria="trending" />
            </div>
          </section>

          <section>
            <div className="mb-4">
              <h2 className="text-2xl font-semibold">Lançamentos</h2>
              <FilmesGrid categoria="new" />
            </div>
          </section>

          <section>
            <div className="mb-4">
              <h2 className="text-2xl font-semibold">Clássicos</h2>
              <FilmesGrid categoria="classics" />
            </div>
          </section>
        </div>
      </main>
      <FilmeModalWrapper filme={filmeAberto} aberto={!!filmeAberto} onClose={() => setFilmeAberto(null)} />
    </div>
  )
}
