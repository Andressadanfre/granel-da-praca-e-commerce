// src/components/product/EmptyState.tsx
// Server Component — sem 'use client'

import type { ReactNode } from 'react'
import { Search, ShoppingCart, Heart, Package, SlidersHorizontal } from 'lucide-react'

import { tokens } from '@/lib/tokens'

type EmptyStateContext = 'filter' | 'search' | 'cart' | 'wishlist' | 'orders'

interface EmptyStateProps {
  context: EmptyStateContext
  searchTerm?: string
  ctaHref?: string
}

const config: Record<EmptyStateContext, {
  icon: ReactNode
  title: string
  description: string
  ctaLabel: string
  ctaHref: string
}> = {
  filter: {
    icon: <SlidersHorizontal size={32} strokeWidth={1.6} />,
    title: 'Nenhum produto encontrado',
    description: 'Tente ampliar o intervalo de preço ou remover alguns filtros.',
    ctaLabel: 'Limpar filtros',
    ctaHref: '/loja',
  },
  search: {
    icon: <Search size={32} strokeWidth={1.6} />,
    title: 'Nenhum resultado para sua busca',
    description: 'Verifique a ortografia ou tente um termo mais genérico.',
    ctaLabel: 'Ver todas as categorias',
    ctaHref: '/loja',
  },
  cart: {
    icon: <ShoppingCart size={32} strokeWidth={1.6} />,
    title: 'Seu carrinho está vazio',
    description: 'Adicione produtos frescos e naturais direto do granel para o seu carrinho.',
    ctaLabel: 'Explorar produtos',
    ctaHref: '/loja',
  },
  wishlist: {
    icon: <Heart size={32} strokeWidth={1.6} />,
    title: 'Nenhum favorito ainda',
    description: 'Salve os produtos que você mais gosta para encontrá-los rapidamente.',
    ctaLabel: 'Descobrir produtos',
    ctaHref: '/loja',
  },
  orders: {
    icon: <Package size={32} strokeWidth={1.6} />,
    title: 'Nenhum pedido realizado',
    description: 'Seus pedidos aparecerão aqui após a primeira compra.',
    ctaLabel: 'Fazer meu primeiro pedido',
    ctaHref: '/loja',
  },
}

export function EmptyState({ context, searchTerm, ctaHref: ctaHrefOverride }: EmptyStateProps) {
  const { icon, title, description, ctaLabel, ctaHref: ctaHrefDefault } = config[context]
  const ctaHref = ctaHrefOverride ?? ctaHrefDefault

  const resolvedDescription =
    context === 'search' && searchTerm
      ? `Nenhum resultado para "${searchTerm}". Verifique a ortografia ou tente um termo mais genérico.`
      : description

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        textAlign: 'center',
        gap: '16px',
      }}
    >
      {/* Ícone */}
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '36px',
          backgroundColor: '#F0FDF4',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: tokens.colors.gd,
        }}
      >
        {icon}
      </div>

      {/* Título */}
      <p
        style={{
          fontSize: '16px',
          fontWeight: 600,
          color: tokens.colors.t9,
          margin: 0,
        }}
      >
        {title}
      </p>

      {/* Descrição */}
      <p
        style={{
          fontSize: '13px',
          fontWeight: 400,
          color: tokens.colors.t6,
          margin: 0,
          maxWidth: '320px',
          lineHeight: 1.6,
        }}
      >
        {resolvedDescription}
      </p>

      {/* CTA */}
      <a
        href={ctaHref}
        className="hover:bg-ghover transition-[background-color] duration-[180ms] ease-[cubic-bezier(.4,0,.2,1)]"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '40px',
          padding: '0 24px',
          borderRadius: tokens.radius.sel,
          backgroundColor: tokens.colors.g,
          color: tokens.colors.white,
          fontSize: '13px',
          fontWeight: 600,
          textDecoration: 'none',
          marginTop: '8px',
        }}
      >
        {ctaLabel}
      </a>
    </div>
  )
}
