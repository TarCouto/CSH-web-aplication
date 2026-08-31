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

function EmptyPurchases() {
  return (
    <div className="rounded-3xl bg-neutral-50 px-5 py-10 ring-1 ring-neutral-950/5 sm:rounded-4xl sm:px-8 sm:py-12">
      <p className="font-display text-lg font-semibold text-neutral-950">
        No purchases yet
      </p>
      <p className="mt-3 max-w-xl text-sm text-neutral-600 sm:text-base">
        Each paid checkout appears here with the template, date, and amount.
      </p>
    </div>
  )
}

function PurchaseCard({ order }: { order: OrderWithProduct }) {
  return (
    <article className="rounded-3xl bg-white p-5 ring-1 ring-neutral-950/5">
      <h3 className="font-display text-base font-semibold text-neutral-950">
        {order.product.name}
      </h3>
      <dl className="mt-4 space-y-3 text-sm">
        <div className="flex items-center justify-between gap-4">
          <dt className="text-neutral-600">Date</dt>
          <dd className="font-medium text-neutral-950">
            {formatPurchaseDate(order.created_at)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-neutral-600">Amount</dt>
          <dd className="font-medium text-neutral-950">
            {formatPrice(order.amount_cents ?? 0, order.currency ?? 'usd')}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-neutral-600">Status</dt>
          <dd className="font-medium text-neutral-950">
            {statusLabel(order.status)}
          </dd>
        </div>
      </dl>
    </article>
  )
}

export function PurchasesTable({ orders }: { orders: OrderWithProduct[] }) {
  if (orders.length === 0) {
    return <EmptyPurchases />
  }

  return (
    <>
      <div className="space-y-4 sm:hidden">
        {orders.map((order) => (
          <PurchaseCard key={order.id} order={order} />
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-4xl ring-1 ring-neutral-950/5 sm:block">
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
    </>
  )
}
