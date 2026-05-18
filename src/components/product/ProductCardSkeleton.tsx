// src/components/product/ProductCardSkeleton.tsx
// Server Component — sem 'use client' — animação via CSS puro

function SkeletonBlock({ className, style }: { className?: string; style: React.CSSProperties }) {
  return <div className={`skeleton-shimmer ${className ?? ''}`} style={style} />
}

function SingleSkeleton() {
  return (
    <div
      style={{
        width: '302px',
        borderRadius: '20px',
        backgroundColor: '#FFFFFF',
        boxShadow: '0 10px 30px rgba(0,0,0,.05)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <div
        className="skeleton-shimmer"
        style={{ height: '200px', borderRadius: '20px 20px 0 0', backgroundColor: '#E5E7EB' }}
      />

      <div style={{ padding: '16px 18px 20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <SkeletonBlock style={{ height: '10px', width: '60px', borderRadius: '100px' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '2px' }}>
          <SkeletonBlock style={{ height: '13px', width: '100%', borderRadius: '4px' }} />
          <SkeletonBlock style={{ height: '13px', width: '85%', borderRadius: '4px' }} />
          <SkeletonBlock style={{ height: '13px', width: '65%', borderRadius: '4px' }} />
        </div>

        <SkeletonBlock style={{ height: '11px', width: '80px', borderRadius: '4px', marginTop: '2px' }} />

        <div style={{ minHeight: '72px', display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
          <SkeletonBlock style={{ height: '10px', width: '90px', borderRadius: '4px' }} />
          <SkeletonBlock style={{ height: '20px', width: '110px', borderRadius: '4px' }} />
          <SkeletonBlock style={{ height: '11px', width: '70px', borderRadius: '4px' }} />
        </div>

        <div style={{ flex: 1 }} />

        <SkeletonBlock style={{ height: '40px', width: '100%', borderRadius: '10px', marginTop: '4px' }} />
      </div>
    </div>
  )
}

interface ProductCardSkeletonProps {
  count?: number
}

export function ProductCardSkeleton({ count = 1 }: ProductCardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <SingleSkeleton key={i} />
      ))}
    </>
  )
}
