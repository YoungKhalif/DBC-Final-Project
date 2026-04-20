import { Card, Button, Input, Badge } from '../atoms'

export default function OrderBoard({ orders = [] }) {
  const statusSteps = ['pending', 'preparing', 'ready', 'served']

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Active Orders</h2>
      <div className="grid grid-cols-1 gap-4">
        {orders.map((order) => (
          <Card key={order.id} className="p-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">Order #{order.id}</h3>
                <p className="text-sm text-gray-600">Table {order.tableId}</p>
              </div>
              <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
            </div>

            {/* Progress bar */}
            <div className="mb-4">
              <div className="flex gap-2">
                {statusSteps.map((step, idx) => (
                  <div
                    key={step}
                    className={`flex-1 h-1 rounded ${
                      statusSteps.indexOf(order.status) >= idx
                        ? 'bg-green-600'
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              <div className="text-xs text-gray-500 mt-1 capitalize">{order.status}</div>
            </div>

            {/* Order items */}
            <div className="space-y-2 mb-4">
              {order.items?.map((item) => (
                <div key={item.id} className="text-sm flex justify-between">
                  <span>{item.name}</span>
                  <span className="text-gray-600">x{item.quantity}</span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {order.status === 'pending' && <Button size="sm">Start Preparing</Button>}
              {order.status === 'preparing' && <Button size="sm">Mark Ready</Button>}
              {order.status === 'ready' && <Button size="sm" variant="secondary">Confirm Served</Button>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

function getStatusVariant(status) {
  const variants = {
    pending: 'warning',
    preparing: 'info',
    ready: 'success',
    served: 'success'
  }
  return variants[status] || 'info'
}
