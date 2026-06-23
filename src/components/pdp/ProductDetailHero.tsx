import Image from "next/image"
import { ImageOff } from "lucide-react"
import { Badge } from "@/components/ui/Badge"
import type { ProductDetail } from "@/lib/products/product-detail"

interface ProductDetailHeroProps {
  produto: ProductDetail
}

export function ProductDetailHero({ produto }: ProductDetailHeroProps) {
  return (
    <div className="relative w-full aspect-square lg:aspect-auto lg:h-[480px] rounded-card bg-cream-img overflow-hidden">
      {produto.imageUrl ? (
        <Image
          src={produto.imageUrl}
          alt={produto.name}
          fill
          sizes="(max-width: 1024px) 100vw, 480px"
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
  )
}
