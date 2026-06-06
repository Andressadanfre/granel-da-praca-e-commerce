interface ProductDescriptionProps {
  description: string | null
}

export function ProductDescription({
  description,
}: ProductDescriptionProps) {
  if (!description || description.trim() === '') {
    return null
  }

  const paragraphs = description
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  if (paragraphs.length === 0) {
    return null
  }

  return (
    <section aria-label="Descrição do produto">
      <h2 className="text-base font-semibold text-t9">Descrição</h2>
      <hr className="border-bd my-3" />

      <div>
        {paragraphs.map((paragraph, index) => (
          <p key={index} className="text-sm text-t6 leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  )
}
