import * as React from 'react'
import { cn } from '@/lib/utils'

export type CardPadding = 'none' | 'sm' | 'md' | 'lg'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean
  padding?: CardPadding
}

const paddingMap: Record<CardPadding, string> = {
  none: '',
  sm:   'p-3',
  md:   'p-4',
  lg:   'p-5',
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ hoverable = false, padding = 'none', className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-card bg-white shadow-card',
          'transition-[transform,box-shadow] duration-[180ms] ease-[cubic-bezier(.4,0,.2,1)]',
          hoverable && 'hover:-translate-y-1 hover:shadow-card-hover',
          paddingMap[padding],
          className,
        )}
        {...props}
      >
        {children}
      </div>
    )
  },
)

Card.displayName = 'Card'
