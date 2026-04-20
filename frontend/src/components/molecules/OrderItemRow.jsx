import { Badge } from '../atoms'

export default function OrderItemRow({ item, quantity, price, status, onRemove }) {
  return (
    <div className="flex items-center justify-between bg-white border border-gray-200 rounded p-3 hover:shadow-sm transition-shadow">
      <div className="flex-1">
        <p className="font-medium">{item}</p>
        <p className="text-sm text-gray-600">Qty: {quantity}</p>
      </div>
      <div className="flex items-center gap-4">
        <Badge variant={status === 'ready' ? 'success' : 'warning'}>{status}</Badge>
        <span className="font-semibold">${price}</span>
        <button
          onClick={onRemove}
          className="text-red-600 hover:text-red-800 font-semibold"
        >
          ×
        </button>
      </div>
    </div>
  )
}
