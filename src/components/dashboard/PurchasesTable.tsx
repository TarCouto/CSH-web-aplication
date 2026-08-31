import { formatPrice } from '@/lib/money'
import { type OrderWithProduct } from '@/server/services/orders'

function formatPurchaseDate(value: string) {
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function statusLabel(status: OrderWithProduct['status']) {
  if (status === 'paid') return 'Paid'
  if (status === 'refunded') return 'Refunded'
  return 'Pending'
}

export function PurchasesTable({ orders }: { orders: OrderWithProduct[] }) {
  if (orders.length === 0) {
    return (
      <div className="rounded-4xl bg-neutral-50 px-8 py-12 ring-1 ring-neutral-950/5">
        <p className="font-display text-lg font-semibold text-neutral-950">
          No purchases yet
        </p>
        <p className="mt-3 max-w-xl text-base text-neutral-600">
          Each paid checkout appears here with the template, date, and amount.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-4xl ring-1 ring-neutral-950/5">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-neutral-950/5 bg-neutral-50">
          <tr>
            <th className="px-6 py-4 font-display font-semibold text-neutral-950">
              Template
            </th>
            <th className="px-6 py-4 font-display font-semibold text-neutral-950">
              Date
            </th>
            <th className="px-6 py-4 font-display font-semibold text-neutral-950">
              Amount
            </th>
            <th className="px-6 py-4 font-display font-semibold text-neutral-950">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-950/5 bg-white">
          {orders.map((order) => (
            <tr key={order.id}>
              <td className="px-6 py-5 font-semibold text-neutral-950">
                {order.product.name}
              </td>
              <td className="px-6 py-5 text-neutral-600">
                {formatPurchaseDate(order.created_at)}
              </td>
              <td className="px-6 py-5 text-neutral-950">
                {formatPrice(order.amount_cents ?? 0, order.currency ?? 'usd')}
              </td>
              <td className="px-6 py-5 text-neutral-600">
                {statusLabel(order.status)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
