'use client'

import { useState, useTransition, type FormEvent, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Save, RefreshCw, Info, Pencil, Package, CircleDot } from 'lucide-react'

import { useToast } from '@/components/ui/ToastProvider'
import { updateProduct } from '@/lib/admin/product-actions'
import type { AdminProductForEdit, CategoriaOption, StockStatus } from '@/lib/admin/products'
import { formatBRL, formatGrams, cn } from '@/lib/utils'

/** Cores ERP (amber do mockup) — alinhadas a STOCK_STATUS_STYLES.low_stock / recebido. */
const ERP_BADGE = { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' } as const
const ERP_NOTICE = { bg: '#FFFBEB', border: '#FDE68A', text: '#78350F' } as const
const ERP_OVERLAY = { bg: 'rgba(254,243,199,0.4)', dash: '#FCD34D' } as const

const STOCK_BADGE: Record<StockStatus, { bg: string; text: string; label: string }> = {
  in_stock: { bg: '#EAF7EA', text: '#2C742F', label: 'Disponível' },
  low_stock: { bg: '#FEF3C7', text: '#92400E', label: 'Estoque baixo' },
  out_of_stock: { bg: '#FEE2E2', text: '#991B1B', label: 'Indisponível' },
}

interface ProductEditFormProps {
  product: AdminProductForEdit
  categorias: CategoriaOption[]
}

function parseOptionalInt(raw: string): number | null {
  const trimmed = raw.trim()
  if (trimmed === '') return null
  const n = Number.parseInt(trimmed, 10)
  return Number.isFinite(n) ? n : null
}

function ErpBadge() {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-pill border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide"
      style={{ backgroundColor: ERP_BADGE.bg, color: ERP_BADGE.text, borderColor: ERP_BADGE.border }}
    >
      <RefreshCw size={9} strokeWidth={2} aria-hidden />
      Futuro ERP
    </span>
  )
}

function ErpNotice({ children }: { children: ReactNode }) {
  return (
    <div
      className="mb-3.5 flex items-start gap-2.5 rounded-inner border px-3.5 py-3"
      style={{ backgroundColor: ERP_NOTICE.bg, borderColor: ERP_NOTICE.border }}
    >
      <RefreshCw size={15} strokeWidth={1.6} className="mt-0.5 flex-shrink-0" style={{ color: ERP_BADGE.text }} aria-hidden />
      <p className="text-[11px] leading-relaxed" style={{ color: ERP_NOTICE.text }}>
        {children}
      </p>
    </div>
  )
}

function ErpFieldWrap({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      {children}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-end rounded-input border-[1.5px] border-dashed pr-2.5"
        style={{ backgroundColor: ERP_OVERLAY.bg, borderColor: ERP_OVERLAY.dash }}
        aria-hidden
      >
        <span
          className="rounded-pill px-1.5 py-px text-[8px] font-bold uppercase tracking-wide"
          style={{ backgroundColor: ERP_BADGE.bg, color: ERP_BADGE.text }}
        >
          Futuro ERP
        </span>
      </div>
    </div>
  )
}

function ToggleSwitch({
  checked,
  onChange,
  id,
}: {
  checked: boolean
  onChange: (next: boolean) => void
  id: string
}) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-[22px] w-10 flex-shrink-0 rounded-pill transition-colors',
        checked ? 'bg-g' : 'bg-bd',
      )}
    >
      <span
        className={cn(
          'absolute left-[3px] top-[3px] h-4 w-4 rounded-pill bg-white shadow transition-transform',
          checked ? 'translate-x-[18px]' : 'translate-x-0',
        )}
      />
    </button>
  )
}

const inputClass =
  'h-[38px] w-full rounded-input border border-bd bg-white px-3 text-[12.5px] text-t9 outline-none transition-colors placeholder:text-t4 focus:border-g focus:shadow-[0_0_0_3px_rgba(0,178,7,0.08)] disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-t4'

const labelClass = 'flex items-center gap-1.5 text-[10.5px] font-semibold text-t6'

export function ProductEditForm({ product, categorias }: ProductEditFormProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const isGranel = product.productType === 'granel'

  const [name, setName] = useState(product.name)
  const [categoryId, setCategoryId] = useState(String(product.categoryId))
  const [description, setDescription] = useState(product.description ?? '')
  const [priceCents, setPriceCents] = useState(String(product.priceCents))
  const [compareAtCents, setCompareAtCents] = useState(
    product.compareAtCents != null ? String(product.compareAtCents) : '',
  )
  const [stockQty, setStockQty] = useState(
    isGranel
      ? product.stockQuantityGrams != null
        ? String(product.stockQuantityGrams)
        : ''
      : product.stockQuantityUnits != null
        ? String(product.stockQuantityUnits)
        : '',
  )
  const [threshold, setThreshold] = useState(
    isGranel ? String(product.lowStockThresholdGrams) : String(product.lowStockThresholdUnits),
  )
  const [isActive, setIsActive] = useState(product.isActive)
  const [isFeatured, setIsFeatured] = useState(product.isFeatured)

  const priceNum = Number.parseInt(priceCents, 10)
  const priceValid = Number.isFinite(priceNum) && priceNum > 0

  const preview100gr = priceValid ? formatBRL(Math.round(priceNum / 10)) : '—'
  const previewKg = priceValid ? formatBRL(priceNum) : '—'
  const preview500 = priceValid ? formatBRL(Math.round((priceNum * 500) / 1000)) : '—'

  const stockBadge = STOCK_BADGE[product.stockStatus]
  const stockDisplayQty = isGranel
    ? product.stockQuantityGrams != null
      ? formatGrams(product.stockQuantityGrams)
      : 'Não conferido'
    : product.stockQuantityUnits != null
      ? `${product.stockQuantityUnits} un`
      : 'Não conferido'

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    const parsedPrice = Number.parseInt(priceCents, 10)
    const parsedCompare = parseOptionalInt(compareAtCents)
    const parsedStock = parseOptionalInt(stockQty)
    const parsedCategoryId = Number.parseInt(categoryId, 10)
    const originalThreshold = isGranel
      ? product.lowStockThresholdGrams
      : product.lowStockThresholdUnits
    const thresholdTrimmed = threshold.trim()
    let parsedThreshold: number
    if (thresholdTrimmed === '') {
      // Campo limpo sem intenção — reverte ao valor do banco, sem bloquear o submit
      parsedThreshold = originalThreshold
      setThreshold(String(originalThreshold))
    } else {
      parsedThreshold = Number.parseInt(thresholdTrimmed, 10)
      if (!Number.isFinite(parsedThreshold) || parsedThreshold < 0) {
        setError('Informe um threshold de alerta válido')
        return
      }
    }

    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setError('Informe um preço válido (centavos > 0)')
      return
    }
    if (!Number.isFinite(parsedCategoryId) || parsedCategoryId <= 0) {
      setError('Selecione uma categoria')
      return
    }

    startTransition(async () => {
      const result = await updateProduct(product.id, {
        name: name.trim(),
        categoryId: parsedCategoryId,
        description: description.trim() || null,
        priceCents: parsedPrice,
        compareAtCents: parsedCompare,
        stockQuantityGrams: isGranel ? parsedStock : product.stockQuantityGrams,
        stockQuantityUnits: isGranel ? product.stockQuantityUnits : parsedStock,
        lowStockThresholdGrams: isGranel ? parsedThreshold : product.lowStockThresholdGrams,
        lowStockThresholdUnits: isGranel ? product.lowStockThresholdUnits : parsedThreshold,
        isActive,
        isFeatured,
      })

      if (!result.success) {
        setError(result.error)
        return
      }

      showToast('Produto atualizado com sucesso', 'success')
      router.push(`/admin/produtos/${product.id}/editar`)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/admin/produtos" className="flex items-center gap-1.5 text-xs font-medium text-t4 hover:text-gd">
          <span aria-hidden>‹</span>
          Produtos
        </Link>
        <span className="h-[18px] w-px bg-bd" aria-hidden />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[15px] font-semibold text-t9">{product.name}</h1>
          {product.categoryName && <p className="text-[11px] text-t4">{product.categoryName}</p>}
        </div>
        <Link
          href="/admin/produtos"
          className="inline-flex h-[34px] items-center gap-1.5 rounded-input border border-bd bg-white px-3.5 text-xs font-medium text-t6 transition-colors hover:bg-gray-100"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-[34px] items-center gap-1.5 rounded-input bg-g px-[18px] text-xs font-semibold text-white transition-colors hover:bg-ghover disabled:opacity-60"
        >
          <Save size={14} strokeWidth={1.6} aria-hidden />
          {isPending ? 'Salvando…' : 'Salvar alterações'}
        </button>
      </div>

      {error && (
        <div className="rounded-inner border border-danger/30 bg-danger/5 px-4 py-3 text-[13px] font-medium text-danger" role="alert">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-4">
          {/* Dados básicos */}
          <section className="overflow-hidden rounded-card border border-bd bg-white shadow-card">
            <div className="flex items-center gap-2.5 border-b border-bd px-[18px] py-3.5">
              <Pencil size={15} strokeWidth={1.6} className="text-gd" aria-hidden />
              <h2 className="flex-1 text-[13px] font-semibold text-t9">Dados básicos</h2>
            </div>
            <div className="grid grid-cols-1 gap-3.5 p-[18px] md:grid-cols-2">
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label htmlFor="product-name" className={labelClass}>
                  Nome do produto
                  <span className="text-danger">*</span>
                </label>
                <input
                  id="product-name"
                  className={inputClass}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  maxLength={200}
                />
                <p className="text-[10px] leading-snug text-t4">
                  Use o nome correto com acento. Ex: Castanha-do-Pará, Chia Preta.
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="product-category" className={labelClass}>
                  Categoria
                  <span className="text-danger">*</span>
                </label>
                <select
                  id="product-category"
                  className={inputClass}
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                >
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="product-type" className={labelClass}>
                  Tipo
                </label>
                <select id="product-type" className={inputClass} disabled value={product.productType}>
                  <option value="granel">Granel</option>
                  <option value="unit">Unitário</option>
                </select>
                <p className="text-[10px] leading-snug text-t4">Tipo não pode ser alterado após o cadastro.</p>
              </div>

              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label htmlFor="product-description" className={labelClass}>
                  Descrição
                </label>
                <textarea
                  id="product-description"
                  className="min-h-[80px] w-full resize-y rounded-input border border-bd bg-white px-3 py-2.5 text-[12.5px] text-t9 outline-none transition-colors placeholder:text-t4 focus:border-g focus:shadow-[0_0_0_3px_rgba(0,178,7,0.08)]"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={2000}
                  placeholder="Descrição do produto para a página de detalhes..."
                />
              </div>
            </div>
          </section>

          {/* Preço */}
          <section className="overflow-hidden rounded-card border border-bd bg-white shadow-card">
            <div className="flex flex-wrap items-center gap-2.5 border-b border-bd px-[18px] py-3.5">
              <span className="text-gd" aria-hidden>
                R$
              </span>
              <h2 className="flex-1 text-[13px] font-semibold text-t9">Preço</h2>
              <ErpBadge />
            </div>
            <div className="p-[18px]">
              <ErpNotice>
                <strong className="font-bold">Campo futuro ERP Explend:</strong> após a integração com o Explend, o preço
                será sincronizado automaticamente e este campo ficará somente leitura. Por enquanto, edite manualmente.
              </ErpNotice>

              <div className="mb-3.5 flex items-start gap-2.5 rounded-inner border border-indigo/20 bg-indigo-bg px-3.5 py-3">
                <Info size={15} strokeWidth={1.6} className="mt-0.5 flex-shrink-0 text-indigo" aria-hidden />
                <p className="text-[11px] leading-relaxed text-indigo">
                  <strong className="font-bold">Regra crítica de preço:</strong> o campo armazena o preço por{' '}
                  {isGranel ? 'kg' : 'unidade'} em centavos. O sistema converte automaticamente para exibir no catálogo. O
                  preview abaixo confirma o valor antes de salvar.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="price-cents" className={labelClass}>
                    {isGranel ? 'Preço por kg (centavos)' : 'Preço por unidade (centavos)'}
                    <span className="text-danger">*</span>
                  </label>
                  <ErpFieldWrap>
                    <input
                      id="price-cents"
                      type="number"
                      min={1}
                      step={1}
                      className={cn(inputClass, 'font-variant-numeric tabular-nums')}
                      value={priceCents}
                      onChange={(e) => setPriceCents(e.target.value)}
                      required
                    />
                  </ErpFieldWrap>
                  <p className="text-[10px] leading-snug text-t4">
                    {priceValid
                      ? `${priceNum} centavos = ${formatBRL(priceNum)}${isGranel ? '/kg' : '/un'}`
                      : 'Informe o valor em centavos (ex: 14900 = R$ 149,00)'}
                  </p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="compare-at-cents" className={labelClass}>
                    Preço original (antes do desconto)
                  </label>
                  <ErpFieldWrap>
                    <input
                      id="compare-at-cents"
                      type="number"
                      min={1}
                      step={1}
                      className={cn(inputClass, 'font-variant-numeric tabular-nums')}
                      value={compareAtCents}
                      onChange={(e) => setCompareAtCents(e.target.value)}
                      placeholder="Opcional"
                    />
                  </ErpFieldWrap>
                  <p className="text-[10px] leading-snug text-t4">
                    Deixar vazio se não houver desconto. Deve ser maior que o preço atual (aparece riscado no catálogo).
                  </p>
                </div>
              </div>

              {isGranel && (
                <div className="mt-2.5 rounded-inner border border-bd bg-cream px-3.5 py-2.5">
                  <p className="mb-1 text-[9.5px] font-semibold uppercase tracking-wider text-t4">
                    Pré-visualização no catálogo
                  </p>
                  <div className="flex flex-wrap gap-5">
                    <div>
                      <p className="text-[10px] text-t6">Exibido no card</p>
                      <p className="text-sm font-bold tabular-nums text-gdeep">{preview100gr} / 100 gr</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-t6">Preço por kg</p>
                      <p className="text-xs font-medium tabular-nums text-t6">{previewKg} / kg</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-t6">Exemplo — 500 gr</p>
                      <p className="text-sm font-bold tabular-nums text-gd">{preview500}</p>
                    </div>
                  </div>
                </div>
              )}

              {!isGranel && (
                <div className="mt-2.5 rounded-inner border border-bd bg-cream px-3.5 py-2.5">
                  <p className="mb-1 text-[9.5px] font-semibold uppercase tracking-wider text-t4">
                    Pré-visualização no catálogo
                  </p>
                  <div>
                    <p className="text-[10px] text-t6">Exibido no card</p>
                    <p className="text-sm font-bold tabular-nums text-gdeep">{previewKg} / un</p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Estoque */}
          <section className="overflow-hidden rounded-card border border-bd bg-white shadow-card">
            <div className="flex flex-wrap items-center gap-2.5 border-b border-bd px-[18px] py-3.5">
              <Package size={15} strokeWidth={1.6} className="text-gd" aria-hidden />
              <h2 className="flex-1 text-[13px] font-semibold text-t9">Estoque</h2>
              <ErpBadge />
            </div>
            <div className="p-[18px]">
              <ErpNotice>
                <strong className="font-bold">Campo futuro ERP Explend:</strong> após a integração, o estoque será
                atualizado automaticamente a cada venda no PDV e no e-commerce. Por enquanto, atualize manualmente.
              </ErpNotice>

              <div className="mb-3.5 flex items-center gap-3 rounded-inner border border-bd bg-cream px-3.5 py-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-t4">Estoque atual</p>
                  <p
                    className={cn(
                      'text-[22px] font-bold tabular-nums',
                      product.stockStatus === 'out_of_stock' || product.stockStatus === 'low_stock'
                        ? 'text-danger'
                        : 'text-gdeep',
                    )}
                  >
                    {stockDisplayQty}
                  </p>
                  <p className="text-xs text-t6">
                    {product.name} · {isGranel ? 'Granel' : 'Unitário'}
                  </p>
                </div>
                <div className="ml-auto">
                  <span
                    className="inline-flex rounded-pill px-2.5 py-1 text-[10px] font-bold"
                    style={{ backgroundColor: stockBadge.bg, color: stockBadge.text }}
                  >
                    {stockBadge.label}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="stock-qty" className={labelClass}>
                    {isGranel ? 'Estoque atual (gramas)' : 'Estoque atual (unidades)'}
                  </label>
                  <ErpFieldWrap>
                    <input
                      id="stock-qty"
                      type="number"
                      min={0}
                      step={1}
                      className={cn(inputClass, 'font-variant-numeric tabular-nums')}
                      value={stockQty}
                      onChange={(e) => setStockQty(e.target.value)}
                      placeholder="Vazio = não conferido"
                    />
                  </ErpFieldWrap>
                  <p className="text-[10px] leading-snug text-t4">
                    Deixar vazio se a quantidade ainda não foi conferida.
                  </p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="stock-threshold" className={labelClass}>
                    {isGranel ? 'Threshold de alerta (gramas)' : 'Threshold de alerta (unidades)'}
                  </label>
                  <input
                    id="stock-threshold"
                    type="number"
                    min={0}
                    step={1}
                    className={cn(inputClass, 'font-variant-numeric tabular-nums')}
                    value={threshold}
                    onChange={(e) => setThreshold(e.target.value)}
                  />
                  <p className="text-[10px] leading-snug text-t4">
                    Configurado aqui — permanece mesmo após integração ERP.
                  </p>
                </div>

                {isGranel && (
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="increment-grams" className={labelClass}>
                      Incremento de compra (gramas)
                    </label>
                    <input
                      id="increment-grams"
                      type="number"
                      className={cn(inputClass, 'font-variant-numeric tabular-nums')}
                      value={product.incrementGrams}
                      disabled
                    />
                    <p className="text-[10px] leading-snug text-t4">Padrão granel: 100 gr. Não editável.</p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 border-t border-bd bg-gray-100 px-3.5 py-2.5">
              <div className="flex items-center gap-1.5 text-[10px] text-t6">
                <span className="h-2 w-2 rounded-pill bg-g" aria-hidden />
                Gerenciado manualmente agora
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-t6">
                <span
                  className="h-2 w-2 rounded-sm border-[1.5px] border-dashed"
                  style={{ backgroundColor: ERP_OVERLAY.dash, borderColor: ERP_BADGE.text }}
                  aria-hidden
                />
                Será sincronizado pelo ERP Explend
              </div>
            </div>
          </section>
        </div>

        {/* Coluna direita — Status */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-6">
          <section className="overflow-hidden rounded-card border border-bd bg-white shadow-card">
            <div className="flex items-center gap-2.5 border-b border-bd px-[18px] py-3.5">
              <CircleDot size={15} strokeWidth={1.6} className="text-gd" aria-hidden />
              <h2 className="flex-1 text-[13px] font-semibold text-t9">Status e visibilidade</h2>
            </div>
            <div className="px-[18px] py-2">
              <div className="flex items-center justify-between border-b border-bd py-3">
                <div>
                  <p className="text-[12.5px] font-medium text-t9">Produto ativo</p>
                  <p className="mt-0.5 text-[10.5px] text-t4">Visível no catálogo para os clientes</p>
                </div>
                <ToggleSwitch id="toggle-active" checked={isActive} onChange={setIsActive} />
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-[12.5px] font-medium text-t9">Produto em destaque</p>
                  <p className="mt-0.5 text-[10.5px] text-t4">Exibido na seção &quot;Produtos em Destaque&quot;</p>
                </div>
                <ToggleSwitch id="toggle-featured" checked={isFeatured} onChange={setIsFeatured} />
              </div>
            </div>
          </section>
        </div>
      </div>
    </form>
  )
}
