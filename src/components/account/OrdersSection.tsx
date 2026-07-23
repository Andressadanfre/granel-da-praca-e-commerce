import { EmptyState } from '@/components/product/EmptyState'
import { OrderCard } from '@/components/account/OrderCard'
import type { AccountOrder } from '@/lib/account/types'

interface OrdersSectionProps {
  orders: AccountOrder[]
}

export function OrdersSection({ orders }: OrdersSectionProps) {
  return (
    <section id="pedidos">
      <h1 className="mb-1 text-xl font-bold text-t9 md:text-2xl">Meus Pedidos</h1>
      <p className="mb-5 text-[13.5px] text-t6">
        Acompanhe o status e histórico de todas as suas compras.
      </p>

      {orders.length === 0 ? (
        <div className="rounded-card bg-white py-6 shadow-card">
          <EmptyState context="orders" />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </section>
  )
}
