import Image from "next/image"
import { ImageOff } from "lucide-react"
import { Badge } from "@/components/ui/Badge"
import type { ProductDetail } from "@/lib/products/product-detail"
import { formatBRL } from "@/lib/utils"

interface ProductDetailHeroProps {
  produto: ProductDetail
}

function getPriceLabel(productType: "granel" | "unit"): string {
  return productType === "granel" ? "Preço por 100 gr" : "Preço por unidade"
}

function calcPricePerKgCents(priceCents: number, incrementGrams: number): number {
  return Math.round((priceCents / incrementGrams) * 1000)
}

function calcDiscountPercent(priceCents: number, compareAtCents: number): number {
  if (compareAtCents <= 0) return 0
  return Math.round(((compareAtCents - priceCents) / compareAtCents) * 100)
}

export function ProductDetailHero({ produto }: ProductDetailHeroProps) {
  const compareAtCents = produto.compare_at_cents ?? 0
  const hasComparePrice = produto.compare_at_cents !== null && produto.compare_at_cents > 0
  const showPricePerKg =
    produto.product_type === "granel" &&
    typeof produto.increment_grams === "number" &&
    produto.increment_grams > 0

  return (
    <article className="flex flex-col gap-6">
      <div className="relative w-full aspect-square rounded-card bg-cream-img overflow-hidden">
        {produto.image_url ? (
          <Image
            src={produto.image_url}
            alt={produto.name}
            fill
            sizes="(max-width: 1024px) 100vw, 560px"
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full bg-cream-img rounded-card flex items-center justify-center">
            <ImageOff size={48} strokeWidth={1.6} className="text-t4" />
          </div>
        )}
        {produto.is_featured && (
          <Badge variant="featured" className="absolute top-3 left-3">
            Destaque
          </Badge>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-[9.5px] font-semibold text-t4 uppercase tracking-[0.08em]">
          {produto.category.name}
        </p>
        <h1 className="text-2xl font-bold text-t9 leading-tight">{produto.name}</h1>
        {produto.stock_status === "low_stock" && (
          <Badge variant="low-stock">Últimas unidades</Badge>
        )}
        {produto.stock_status === "out_of_stock" && (
          <p className="text-sm font-semibold text-danger">Produto esgotado</p>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-[10px] font-normal text-t4">
          {getPriceLabel(produto.product_type)}
        </p>
        <div className="flex items-baseline gap-2">
          <span className="text-[28px] font-bold text-gdeep tracking-[-0.02em] leading-none">
            {formatBRL(produto.price_cents)}
          </span>
          {hasComparePrice && (
            <span className="text-sm font-normal text-t5 line-through">
              {formatBRL(compareAtCents)}
            </span>
          )}
        </div>
        {showPricePerKg && (
          <p className="text-sm text-t7">
            {formatBRL(calcPricePerKgCents(produto.price_cents, produto.increment_grams))}/kg
          </p>
        )}
        {hasComparePrice && (
          <Badge variant="discount">
            {`${calcDiscountPercent(produto.price_cents, compareAtCents)}% OFF`}
          </Badge>
        )}
      </div>
    </article>
  )
}
