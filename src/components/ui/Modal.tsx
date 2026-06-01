'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

import { cn } from '@/lib/utils'

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
  size?: ModalSize
  className?: string
}

const sizeWidths: Record<ModalSize, string> = {
  sm: 'w-full max-w-[400px]',
  md: 'w-full max-w-[560px]',
  lg: 'w-full max-w-[720px]',
  xl: 'w-full max-w-[872px]',
}

export const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  ({ isOpen, onClose, children, title, size = 'md', className }, ref) => {
    const titleId = React.useId()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
      setMounted(true)
    }, [])

    React.useEffect(() => {
      if (!isOpen) return

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose()
      }

      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'

      return () => {
        document.removeEventListener('keydown', handleKeyDown)
        document.body.style.overflow = ''
      }
    }, [isOpen, onClose])

    if (!mounted) return null

    return createPortal(
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            style={{ backgroundColor: 'rgba(0,0,0,0.50)' }}
            onClick={onClose}
            aria-hidden="true"
          >
            <motion.div
              ref={ref}
              role="dialog"
              aria-modal="true"
              aria-labelledby={title ? titleId : undefined}
              className={cn(
                'relative flex flex-col bg-white',
                'rounded-modal',
                sizeWidths[size],
                'max-h-[calc(100dvh-2rem)] overflow-y-auto',
                className,
              )}
              style={{ boxShadow: '0 0 40px rgba(0,0,0,0.15)' }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 pt-6 pb-4">
                {title ? (
                  <h2
                    id={titleId}
                    className="text-base font-semibold text-t9 leading-snug"
                  >
                    {title}
                  </h2>
                ) : (
                  <span />
                )}
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Fechar modal"
                  className={cn(
                    'flex items-center justify-center',
                    'w-11 h-11 rounded-full',
                    'text-t5 hover:text-t9 hover:bg-surface',
                    'transition-colors duration-150',
                    '-mr-2',
                  )}
                >
                  <X size={20} strokeWidth={1.6} aria-hidden />
                </button>
              </div>

              <div className="px-6 pb-6">{children}</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body,
    )
  },
)

Modal.displayName = 'Modal'
