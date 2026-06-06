import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="bg-cream min-h-screen flex flex-col items-center justify-center gap-6 px-s5">
      <h1 className="text-2xl font-semibold text-t9">Produto não encontrado</h1>
      <p className="text-t6 text-sm">
        Este produto não está disponível ou foi removido.
      </p>
      <Link href="/loja" className="text-g font-medium hover:underline text-sm">
        ← Voltar para a loja
      </Link>
    </main>
  )
}
