function SkeletonRow() {
  return (
    <tr className="border-b border-bd last:border-b-0">
      <td className="h-12 px-4" colSpan={7}>
        <div className="skeleton-shimmer h-4 w-full rounded-input" />
      </td>
    </tr>
  )
}

export default function Loading() {
  return (
    <div>
      <div className="skeleton-shimmer mb-6 h-8 w-40 rounded-input" />

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton-shimmer h-16 rounded-inner" />
        ))}
      </div>

      <div className="mb-3.5 flex gap-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton-shimmer h-7 w-20 rounded-sel" />
        ))}
      </div>

      <div className="mb-4 skeleton-shimmer h-9 w-full rounded-input" />

      <div className="overflow-hidden rounded-card border border-bd bg-white shadow-card">
        <table className="w-full min-w-[900px] border-collapse">
          <tbody>
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
