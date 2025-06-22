"use client"

import { useState, useEffect } from "react"
import type { FilmeDetalhado } from "./filme-modal"
import FilmeModal from "./filme-modal"

interface FilmeModalWrapperProps {
  filme: FilmeDetalhado | null
  aberto: boolean
  onClose: () => void
  isFavorited?: boolean
  onRatingUpdate?: (movieId: string, newRating: number, newComment: string) => void
  onRatingDelete?: (movieId: string) => void
}

export default function FilmeModalWrapper({ 
  filme, 
  aberto, 
  onClose, 
  isFavorited = false,
  onRatingUpdate,
  onRatingDelete 
}: FilmeModalWrapperProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <FilmeModal
      filme={filme}
      aberto={aberto}
      onClose={onClose}
      isFavorited={isFavorited}
      onRatingUpdate={onRatingUpdate}
      onRatingDelete={onRatingDelete}
    />
  )
}

