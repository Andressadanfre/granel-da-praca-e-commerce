'use client'

import { useEffect, useState, useTransition, type ChangeEvent, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Info, Pencil, Package, CircleDot, ImagePlus } from 'lucide-react'

import { useToast } from '@/components/ui/ToastProvider'
import { createProduct } from '@/lib/admin/product-actions'
import type { CategoriaOption } from '@/lib/admin/products'
import { formatBRL, generateSlug, cn } from '@/lib/utils'

const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const ALLOWED_IMAGE_MIME = new Set(['image/jpeg', 'image/png', 'image/webp'])

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

function validateClientImage(file: File): string | null {
  if (!ALLOWED_IMAGE_MIME.has(file.type)) {
    return 'Formato inválido. Use JPG, PNG ou WebP.'
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return 'Imagem deve ter no máximo 5MB'
  }
  return null
}

interface ProductCreateFormProps {
  categorias: CategoriaOption[]
}

export function ProductCreateForm({ categorias }: ProductCreateFormProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [productType, setProductType] = useState<'granel' | 'unit'>('granel')
  const isGranel = productType === 'granel'

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [categoryId, setCategoryId] = useState(categorias[0] ? String(categorias[0].id) : '')
  const [description, setDescription] = useState('')
  const [priceCents, setPriceCents] = useState('')
  const [compareAtCents, setCompareAtCents] = useState('')
  const [stockQty, setStockQty] = useState('')
  const [threshold, setThreshold] = useState('0')
  const [isActive, setIsActive] = useState(true)
  const [isFeatured, setIsFeatured] = useState(false)

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [nutritionalImageFile, setNutritionalImageFile] = useState<File | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
  const [nutritionalPreviewUrl, setNutritionalPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!imageFile) {
      setImagePreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(imageFile)
    setImagePreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [imageFile])

  useEffect(() => {
    if (!nutritionalImageFile) {
      setNutritionalPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(nutritionalImageFile)
    setNutritionalPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [nutritionalImageFile])

  const priceNum = Number.parseInt(priceCents, 10)
  const priceValid = Number.isFinite(priceNum) && priceNum > 0

  const preview100gr = priceValid ? formatBRL(Math.round(priceNum / 10)) : '—'
  const previewKg = priceValid ? formatBRL(priceNum) : '—'
  const preview500 = priceValid ? formatBRL(Math.round((priceNum * 500) / 1000)) : '—'

  function handleNameChange(value: string) {
    setName(value)
    if (!slugTouched) {
      setSlug(generateSlug(value))
    }
  }

  function handleSlugChange(value: string) {
    setSlugTouched(true)
    setSlug(value)
  }

  function handleProductTypeChange(next: 'granel' | 'unit') {
    setProductType(next)
    setStockQty('')
  }

  function handleImageChange(
    e: ChangeEvent<HTMLInputElement>,
    kind: 'image' | 'nutritional',
  ) {
    const file = e.target.files?.[0] ?? null
    if (!file) {
      if (kind === 'image') setImageFile(null)
      else setNutritionalImageFile(null)
      return
    }

    const validationError = validateClientImage(file)
    if (validationError) {
      setError(validationError)
      e.target.value = ''
      return
    }

    setError(null)
    if (kind === 'image') setImageFile(file)
    else setNutritionalImageFile(file)
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    const parsedPrice = Number.parseInt(priceCents, 10)
    const parsedCategoryId = Number.parseInt(categoryId, 10)
    const thresholdTrimmed = threshold.trim()
    let parsedThreshold: number
    if (thresholdTrimmed === '') {
      // Campo limpo sem intenção — assume padrão sensato (produto ainda não existe)
      parsedThreshold = isGranel ? 500 : 5
      setThreshold(String(parsedThreshold))
    } else {
      parsedThreshold = Number.parseInt(thresholdTrimmed, 10)
      if (!Number.isFinite(parsedThreshold) || parsedThreshold < 0) {
        setError('Informe um threshold de alerta válido')
        return
      }
    }

    if (!name.trim()) {
      setError('Informe o nome do produto')
      return
    }
    if (!slug.trim()) {
      setError('Informe o identificador (slug)')
      return
    }
    if (!Number.isFinite(parsedCategoryId) || parsedCategoryId <= 0) {
      setError('Selecione uma categoria')
      return
    }
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setError('Informe um preço válido (centavos > 0)')
      return
    }

    if (imageFile) {
      const imageError = validateClientImage(imageFile)
      if (imageError) {
        setError(imageError)
        return
      }
    }
    if (nutritionalImageFile) {
      const nutritionalError = validateClientImage(nutritionalImageFile)
      if (nutritionalError) {
        setError(nutritionalError)
        return
      }
    }

    const formData = new FormData()
    formData.append('name', name.trim())
    formData.append('slug', slug.trim())
    formData.append('categoryId', String(parsedCategoryId))
    formData.append('productType', productType)
    formData.append('description', description.trim())
    formData.append('priceCents', String(parsedPrice))
    formData.append('compareAtCents', compareAtCents.trim())
    formData.append('stockQuantityGrams', isGranel ? stockQty.trim() : '')
    formData.append('stockQuantityUnits', isGranel ? '' : stockQty.trim())
    formData.append('lowStockThresholdGrams', isGranel ? String(parsedThreshold) : '')
    formData.append('lowStockThresholdUnits', isGranel ? '' : String(parsedThreshold))
    formData.append('isActive', isActive ? 'true' : 'false')
    formData.append('isFeatured', isFeatured ? 'true' : 'false')

    if (imageFile) formData.append('image', imageFile)
    if (nutritionalImageFile) formData.append('nutritionalImage', nutritionalImageFile)

    startTransition(async () => {
      const result = await createProduct(formData)

      if (!result.success) {
        setError(result.error)
        return
      }

      showToast('Produto criado com sucesso', 'success')
      router.push(`/admin/produtos/${result.productId}/editar`)
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
          <h1 className="truncate text-[15px] font-semibold text-t9">Novo produto</h1>
          <p className="text-[11px] text-t4">Cadastro manual — campos essenciais para o catálogo</p>
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
          <Plus size={14} strokeWidth={1.6} aria-hidden />
          {isPending ? 'Criando…' : 'Criar produto'}
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
                <label htmlFor="create-product-name" className={labelClass}>
                  Nome do produto
                  <span className="text-danger">*</span>
                </label>
                <input
                  id="create-product-name"
                  className={inputClass}
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                  maxLength={200}
                />
                <p className="text-[10px] leading-snug text-t4">
                  Use o nome correto com acento. Ex: Castanha-do-Pará, Chia Preta.
                </p>
              </div>

              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label htmlFor="create-product-slug" className={labelClass}>
                  Identificador (slug)
                  <span className="text-danger">*</span>
                </label>
                <input
                  id="create-product-slug"
                  className={cn(inputClass, 'font-mono')}
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  required
                  maxLength={200}
                />
                <p className="text-[10px] leading-snug text-t4">
                  Gerado automaticamente a partir do nome. Você pode editar se quiser um identificador diferente.
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="create-product-category" className={labelClass}>
                  Categoria
                  <span className="text-danger">*</span>
                </label>
                <select
                  id="create-product-category"
                  className={inputClass}
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                >
                  {categorias.length === 0 && <option value="">Nenhuma categoria ativa</option>}
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="create-product-type" className={labelClass}>
                  Tipo
                  <span className="text-danger">*</span>
                </label>
                <select
                  id="create-product-type"
                  className={inputClass}
                  value={productType}
                  onChange={(e) => handleProductTypeChange(e.target.value as 'granel' | 'unit')}
                  required
                >
                  <option value="granel">Granel</option>
                  <option value="unit">Unitário</option>
                </select>
                <p className="text-[10px] leading-snug text-t4">Tipo não pode ser alterado após o cadastro.</p>
              </div>

              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label htmlFor="create-product-description" className={labelClass}>
                  Descrição
                </label>
                <textarea
                  id="create-product-description"
                  className="min-h-[80px] w-full resize-y rounded-input border border-bd bg-white px-3 py-2.5 text-[12.5px] text-t9 outline-none transition-colors placeholder:text-t4 focus:border-g focus:shadow-[0_0_0_3px_rgba(0,178,7,0.08)]"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={2000}
                  placeholder="Descrição do produto para a página de detalhes..."
                />
              </div>
            </div>
          </section>

          {/* Imagens */}
          <section className="overflow-hidden rounded-card border border-bd bg-white shadow-card">
            <div className="flex items-center gap-2.5 border-b border-bd px-[18px] py-3.5">
              <ImagePlus size={15} strokeWidth={1.6} className="text-gd" aria-hidden />
              <h2 className="flex-1 text-[13px] font-semibold text-t9">Imagens</h2>
            </div>
            <div className="grid grid-cols-1 gap-3.5 p-[18px] md:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="create-product-image" className={labelClass}>
                  Foto do produto
                </label>
                {imagePreviewUrl && (
                  <div className="relative mb-1 h-28 w-28 overflow-hidden rounded-inner border border-bd bg-cream-img">
                    <Image
                      src={imagePreviewUrl}
                      alt="Preview da foto do produto"
                      fill
                      unoptimized
                      className="object-cover"
                      sizes="112px"
                    />
                  </div>
                )}
                <input
                  id="create-product-image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="block w-full text-[12px] text-t6 file:mr-3 file:rounded-input file:border-0 file:bg-g-light file:px-3 file:py-1.5 file:text-[11px] file:font-semibold file:text-gd"
                  onChange={(e) => handleImageChange(e, 'image')}
                />
                <p className="text-[10px] leading-snug text-t4">
                  Opcional — pode adicionar depois editando o produto. Formatos aceitos: JPG, PNG, WebP. Máximo 5MB.
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="create-product-nutritional" className={labelClass}>
                  Foto da tabela nutricional
                </label>
                {nutritionalPreviewUrl && (
                  <div className="relative mb-1 h-28 w-28 overflow-hidden rounded-inner border border-bd bg-cream-img">
                    <Image
                      src={nutritionalPreviewUrl}
                      alt="Preview da tabela nutricional"
                      fill
                      unoptimized
                      className="object-cover"
                      sizes="112px"
                    />
                  </div>
                )}
                <input
                  id="create-product-nutritional"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="block w-full text-[12px] text-t6 file:mr-3 file:rounded-input file:border-0 file:bg-g-light file:px-3 file:py-1.5 file:text-[11px] file:font-semibold file:text-gd"
                  onChange={(e) => handleImageChange(e, 'nutritional')}
                />
                <p className="text-[10px] leading-snug text-t4">
                  Opcional — pode adicionar depois editando o produto. Formatos aceitos: JPG, PNG, WebP. Máximo 5MB.
                </p>
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
            </div>
            <div className="p-[18px]">
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
                  <label htmlFor="create-price-cents" className={labelClass}>
                    {isGranel ? 'Preço por kg (centavos)' : 'Preço por unidade (centavos)'}
                    <span className="text-danger">*</span>
                  </label>
                  <input
                    id="create-price-cents"
                    type="number"
                    min={1}
                    step={1}
                    className={cn(inputClass, 'font-variant-numeric tabular-nums')}
                    value={priceCents}
                    onChange={(e) => setPriceCents(e.target.value)}
                    required
                  />
                  <p className="text-[10px] leading-snug text-t4">
                    {priceValid
                      ? `${priceNum} centavos = ${formatBRL(priceNum)}${isGranel ? '/kg' : '/un'}`
                      : 'Informe o valor em centavos (ex: 14900 = R$ 149,00)'}
                  </p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="create-compare-at-cents" className={labelClass}>
                    Preço original (antes do desconto)
                  </label>
                  <input
                    id="create-compare-at-cents"
                    type="number"
                    min={1}
                    step={1}
                    className={cn(inputClass, 'font-variant-numeric tabular-nums')}
                    value={compareAtCents}
                    onChange={(e) => setCompareAtCents(e.target.value)}
                    placeholder="Opcional"
                  />
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
            </div>
            <div className="p-[18px]">
              <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="create-stock-qty" className={labelClass}>
                    {isGranel ? 'Estoque atual (gramas)' : 'Estoque atual (unidades)'}
                  </label>
                  <input
                    id="create-stock-qty"
                    type="number"
                    min={0}
                    step={1}
                    className={cn(inputClass, 'font-variant-numeric tabular-nums')}
                    value={stockQty}
                    onChange={(e) => setStockQty(e.target.value)}
                    placeholder="Vazio = não conferido"
                  />
                  <p className="text-[10px] leading-snug text-t4">
                    Deixar vazio se a quantidade ainda não foi conferida.
                  </p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="create-stock-threshold" className={labelClass}>
                    {isGranel ? 'Threshold de alerta (gramas)' : 'Threshold de alerta (unidades)'}
                  </label>
                  <input
                    id="create-stock-threshold"
                    type="number"
                    min={0}
                    step={1}
                    className={cn(inputClass, 'font-variant-numeric tabular-nums')}
                    value={threshold}
                    onChange={(e) => setThreshold(e.target.value)}
                  />
                  <p className="text-[10px] leading-snug text-t4">
                    Abaixo deste valor o produto aparece como estoque baixo.
                  </p>
                </div>

                {isGranel && (
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="create-increment-grams" className={labelClass}>
                      Incremento de compra (gramas)
                    </label>
                    <input
                      id="create-increment-grams"
                      type="number"
                      className={cn(inputClass, 'font-variant-numeric tabular-nums')}
                      value={100}
                      disabled
                    />
                    <p className="text-[10px] leading-snug text-t4">Padrão granel: 100 gr. Definido automaticamente.</p>
                  </div>
                )}
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
                <ToggleSwitch id="create-toggle-active" checked={isActive} onChange={setIsActive} />
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-[12.5px] font-medium text-t9">Produto em destaque</p>
                  <p className="mt-0.5 text-[10.5px] text-t4">Exibido na seção &quot;Produtos em Destaque&quot;</p>
                </div>
                <ToggleSwitch id="create-toggle-featured" checked={isFeatured} onChange={setIsFeatured} />
              </div>
            </div>
          </section>
        </div>
      </div>
    </form>
  )
}
