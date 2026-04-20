import { useState } from 'react'
import { Card, Button, Input, Modal, Badge } from '../components/atoms'

export default function PaymentProcessing() {
  const [bills, setBills] = useState([
    {
      id: 1,
      orderId: 1,
      tableId: 2,
      items: [
        { name: 'Pasta Carbonara', qty: 1, price: 12.99 },
        { name: 'Grilled Salmon', qty: 2, price: 37.98 }
      ],
      subtotal: 50.97,
      tax: 5.10,
      total: 56.07,
      status: 'pending'
    }
  ])
  const [selectedBill, setSelectedBill] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)

  const handlePayment = () => {
    if (selectedBill) {
      setBills(
        bills.map((bill) =>
          bill.id === selectedBill.id ? { ...bill, status: 'paid' } : bill
        )
      )
      setSelectedBill(null)
      setIsPaymentModalOpen(false)
    }
  }

  const statusColor = {
    pending: 'warning',
    paid: 'success',
    cancelled: 'danger'
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Payment Processing</h1>

      <div className="space-y-4">
        {bills.map((bill) => (
          <Card key={bill.id} className="p-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">Bill #{bill.id}</h3>
                <p className="text-sm text-gray-600">Order #{bill.orderId} - Table {bill.tableId}</p>
              </div>
              <Badge variant={statusColor[bill.status]}>{bill.status}</Badge>
            </div>

            {/* Items summary */}
            <div className="bg-gray-50 p-3 rounded mb-4 text-sm space-y-1">
              {bill.items.map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>{item.name} x{item.qty}</span>
                  <span>${item.price.toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t pt-3 space-y-2 mb-4 text-sm">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${bill.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>${bill.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total:</span>
                <span>${bill.total.toFixed(2)}</span>
              </div>
            </div>

            {bill.status === 'pending' && (
              <Button
                onClick={() => {
                  setSelectedBill(bill)
                  setIsPaymentModalOpen(true)
                }}
              >
                Process Payment
              </Button>
            )}
          </Card>
        ))}
      </div>

      {/* Payment Modal */}
      <Modal
        isOpen={isPaymentModalOpen && selectedBill}
        title="Process Payment"
        onClose={() => setIsPaymentModalOpen(false)}
        actions={
          <>
            <Button variant="secondary" onClick={() => setIsPaymentModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePayment}>Complete Payment</Button>
          </>
        }
      >
        {selectedBill && (
          <div className="space-y-4">
            <div className="bg-gray-100 p-4 rounded">
              <p className="text-sm text-gray-600">Amount Due</p>
              <p className="text-2xl font-bold">${selectedBill.total.toFixed(2)}</p>
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-2">Payment Method</label>
              <div className="space-y-2">
                {['cash', 'card', 'check'].map((method) => (
                  <label key={method} className="flex items-center">
                    <input
                      type="radio"
                      name="payment"
                      value={method}
                      checked={paymentMethod === method}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-2"
                    />
                    <span className="capitalize">{method}</span>
                  </label>
                ))}
              </div>
            </div>

            {paymentMethod === 'card' && (
              <>
                <Input label="Card Number" placeholder="1234 5678 9012 3456" />
                <div className="grid grid-cols-2 gap-2">
                  <Input label="Expiry" placeholder="MM/YY" />
                  <Input label="CVV" placeholder="123" />
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
