import { Card, Button, Input, Badge } from '../atoms'

export default function OrderBoard({ orders = [] }) {
  const statusColor = {
    pending: 'warning',
    preparing: 'info',
    ready: 'success',
    served: 'info'
  }

  const handleStatusUpdate = (orderId, newStatus) => {
    console.log(`Update order ${orderId} to ${newStatus}`)
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold mb-4">Kitchen Orders Board</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {orders.map((order) => (
            <Card key={order.id} className="p-4 border-l-4 border-green-600">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-bold">Order #{order.id}</h3>
                  <p className="text-sm text-gray-600">Table {order.tableId}</p>
                </div>
                <Badge variant={statusColor[order.status] || 'info'}>
                  {order.status}
                </Badge>
              </div>

              <div className="space-y-2 mb-4 bg-gray-50 p-3 rounded">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="text-sm border-b pb-2 last:border-b-0 last:pb-0">
                    <div className="font-semibold">{item.name}</div>
                    <div className="text-gray-600">Qty: {item.quantity}</div>
                    {item.notes && <div className="text-yellow-700">Note: {item.notes}</div>}
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                {order.status === 'pending' && (
                  <Button
                    size="sm"
                    onClick={() => handleStatusUpdate(order.id, 'preparing')}
                  >
                    Start Cooking
                  </Button>
                )}
                {order.status === 'preparing' && (
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => handleStatusUpdate(order.id, 'ready')}
                  >
                    Ready to Serve
                  </Button>
                )}
                {order.status !== 'served' && (
                  <Button size="sm" variant="secondary">
                    Special Request
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
