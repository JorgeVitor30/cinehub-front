"use client"

import { useState, useEffect } from "react"
import type { FilmeDetalhado } from "./filme-modal"
import { SafeDialog } from "./safe-dialog"

interface FilmeModalWrapperProps {
  filme: FilmeDetalhado | null
  aberto: boolean
  onClose: () => void
}

export default function FilmeModalWrapper({ filme, aberto, onClose }: FilmeModalWrapperProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [])

  if (!isMounted || !filme) {
    return null
  }

  return (
    <SafeDialog
      open={aberto}
      onOpenChange={(open) => !open && onClose()}
      className="max-w-4xl bg-zinc-900 text-white border-zinc-800 p-0 overflow-hidden"
    >
      {filme && (
        <>
          {/* Conteúdo do modal */}
          {/* Aqui você pode renderizar o conteúdo do FilmeModal diretamente */}
          {/* Ou passar o filme para um componente interno */}
          <div className="p-6">
            <h2 className="text-2xl font-bold">{filme.titulo}</h2>
            <p className="text-zinc-300 mt-2">{filme.descricao}</p>
            {/* Resto do conteúdo do modal */}
          </div>
        </>
      )}
    </SafeDialog>
  )
}

