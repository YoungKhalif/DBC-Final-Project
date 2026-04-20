import { useState } from 'react'
import { Card, Button, Badge } from '../components/atoms'
import { ReservationForm } from '../components/molecules'
import { useNotification } from '../hooks'

export default function ReservationManagement() {
  const [reservations, setReservations] = useState([
    {
      id: 1,
      guestName: 'John Doe',
      email: 'john@example.com',
      phone: '555-1234',
      tableId: 3,
      partySize: 4,
      dateTime: '2024-04-20T19:00',
      notes: 'Window seat preferred',
      status: 'confirmed'
    },
    {
      id: 2,
      guestName: 'Jane Smith',
      email: 'jane@example.com',
      phone: '555-5678',
      tableId: 5,
      partySize: 2,
      dateTime: '2024-04-20T20:00',
      notes: '',
      status: 'pending'
    }
  ])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const { addNotification } = useNotification()

  const handleCreateReservation = (formData) => {
    const newReservation = {
      id: Math.max(...reservations.map(r => r.id), 0) + 1,
      ...formData,
      status: 'pending'
    }
    setReservations([...reservations, newReservation])
    addNotification(`Reservation created for ${formData.guestName}`, 'success')
    setIsFormOpen(false)
  }

  const handleCancelReservation = (id) => {
    setReservations(reservations.map(r =>
      r.id === id ? { ...r, status: 'cancelled' } : r
    ))
    addNotification('Reservation cancelled', 'warning')
  }

  const handleCheckIn = (id) => {
    setReservations(reservations.map(r =>
      r.id === id ? { ...r, status: 'checked-in' } : r
    ))
    addNotification('Guest checked in', 'success')
  }

  const statusColor = {
    confirmed: 'success',
    pending: 'warning',
    cancelled: 'danger',
    'checked-in': 'success'
  }

  const getTimeStatus = (dateTime) => {
    const now = new Date()
    const resTime = new Date(dateTime)
    const diffMinutes = Math.floor((resTime - now) / 60000)

    if (diffMinutes < 0) return 'past'
    if (diffMinutes <= 15) return 'arriving-soon'
    return 'upcoming'
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Reservation Management</h1>
        <Button onClick={() => setIsFormOpen(true)}>New Reservation</Button>
      </div>

      <div className="space-y-4">
        {reservations.map((reservation) => {
          const timeStatus = getTimeStatus(reservation.dateTime)
          return (
            <Card key={reservation.id} className={timeStatus === 'arriving-soon' ? 'border-l-4 border-red-500' : ''}>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{reservation.guestName}</h3>
                    <p className="text-gray-600 text-sm">{reservation.email} • {reservation.phone}</p>
                  </div>
                  <Badge variant={statusColor[reservation.status]}>
                    {reservation.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-gray-500">Date & Time</p>
                    <p className="font-semibold">{new Date(reservation.dateTime).toLocaleDateString()} {new Date(reservation.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Party Size</p>
                    <p className="font-semibold">{reservation.partySize} guests</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Table</p>
                    <p className="font-semibold">Table {reservation.tableId}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Status</p>
                    <p className="font-semibold capitalize">{timeStatus}</p>
                  </div>
                </div>

                {reservation.notes && (
                  <div className="bg-blue-50 p-3 rounded mb-4 text-sm">
                    <p className="text-gray-700"><strong>Notes:</strong> {reservation.notes}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  {reservation.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleCheckIn(reservation.id)}
                      >
                        Check In
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                      >
                        Edit
                      </Button>
                    </>
                  )}
                  {reservation.status !== 'cancelled' && (
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleCancelReservation(reservation.id)}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <ReservationForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreateReservation}
      />
    </div>
  )
}
