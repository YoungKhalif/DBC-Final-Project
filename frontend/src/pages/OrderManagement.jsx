import { useState } from 'react'
import { Card, Button, Badge } from '../components/atoms'
import { OrderItemRow } from '../components/molecules'

export default function OrderManagement() {
  const [orders, setOrders] = useState([
    {
      id: 1,
      tableId: 2,
      status: 'in-progress',
      items: [
        { id: 1, name: 'Pasta Carbonara', quantity: 1, price: 12.99, status: 'preparing' },
        { id: 2, name: 'Grilled Salmon', quantity: 2, price: 37.98, status: 'ready' }
      ],
      total: 50.97
    }
  ])
  const [selectedOrder, setSelectedOrder] = useState(orders[0])

  const statusColor = {
    'pending': 'warning',
    'in-progress': 'info',
    'completed': 'success'
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Order Management</h1>
        <Button>New Order</Button>
      </div>

      {selectedOrder && (
        <Card>
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Order #{selectedOrder.id}</h2>
              <Badge variant={statusColor[selectedOrder.status]}>{selectedOrder.status}</Badge>
            </div>

            <div className="space-y-3 mb-6">
              {selectedOrder.items.map((item) => (
                <OrderItemRow
                  key={item.id}
                  {...item}
                  onRemove={() => console.log('Remove item:', item.id)}
                />
              ))}
            </div>

            <div className="border-t pt-4 mb-4">
              <div className="flex justify-between items-center text-xl font-bold">
                <span>Total:</span>
                <span>${selectedOrder.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="secondary">Print</Button>
              <Button variant="success">Submit Order</Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
