'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'

import { tokens } from '@/lib/tokens'

interface WishlistButtonProps {
  id: number
  initialIsFavorited?: boolean
}

export function WishlistButton({ id, initialIsFavorited = false }: WishlistButtonProps) {
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited)
  const [isLoading,   setIsLoading]   = useState(false)

  async function handleToggle(e: React.MouseEvent) {
    e.stopPropagation()
    if (isLoading) return

    const previous = isFavorited
    setIsFavorited(!previous)
    setIsLoading(true)

    try {
      // TODO: await toggleWishlistInSupabase(id)
    } catch {
      setIsFavorited(previous)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      type="button"
      data-product-id={id}
      aria-label={isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
      onClick={handleToggle}
      className="absolute z-10 flex items-center justify-center"
      style={{
        top:          '12px',
        right:        '12px',
        width:        '44px',
        height:       '44px',
        borderRadius: tokens.radius.pill,
        background:   tokens.colors.cream,
        border:       `1px solid ${tokens.colors.bd}`,
        transition:   `background ${tokens.ease}`,
        cursor:       isLoading ? 'not-allowed' : 'pointer',
      }}
    >
      <Heart
        size={18}
        strokeWidth={1.6}
        stroke={isFavorited ? tokens.colors.promo : tokens.colors.t6}
        fill={isFavorited ? tokens.colors.promo : 'none'}
      />
    </button>
  )
}
