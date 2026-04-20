import { useState } from 'react'
import { Card, Button, Input, Badge } from '../components/atoms'

export default function ReservationManagement() {
  const [reservations, setReservations] = useState([
    {
      id: 1,
      guestName: 'John Doe',
      email: 'john@example.com',
      phone: '555-1234',
      tableId: 3,
      capacity: 4,
      date: '2024-04-20',
      time: '19:00',
      status: 'confirmed'
    }
  ])

  const statusColor = {
    confirmed: 'success',
    pending: 'warning',
    cancelled: 'danger'
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Reservation Management</h1>
        <Button>New Reservation</Button>
      </div>

      <div className="space-y-4">
        {reservations.map((reservation) => (
          <Card key={reservation.id}>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{reservation.guestName}</h3>
                  <p className="text-gray-600 text-sm">{reservation.email}</p>
                </div>
                <Badge variant={statusColor[reservation.status]}>
                  {reservation.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                <div>
                  <p className="text-gray-500">Date</p>
                  <p className="font-semibold">{reservation.date}</p>
                </div>
                <div>
                  <p className="text-gray-500">Time</p>
                  <p className="font-semibold">{reservation.time}</p>
                </div>
                <div>
                  <p className="text-gray-500">Party Size</p>
                  <p className="font-semibold">{reservation.capacity}</p>
                </div>
                <div>
                  <p className="text-gray-500">Phone</p>
                  <p className="font-semibold">{reservation.phone}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="secondary" size="sm">
                  Edit
                </Button>
                <Button variant="danger" size="sm">
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
