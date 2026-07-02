function SkeletonRow() {
  return (
    <tr className="border-b border-bd last:border-b-0">
      <td className="h-12 px-4" colSpan={8}>
        <div className="skeleton-shimmer h-4 w-full rounded-input" />
      </td>
    </tr>
  )
}

export default function Loading() {
  return (
    <div>
      <div className="skeleton-shimmer mb-6 h-8 w-40 rounded-input" />
      <div className="overflow-hidden rounded-card border border-bd bg-white shadow-card">
        <table className="w-full min-w-[860px] border-collapse">
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
