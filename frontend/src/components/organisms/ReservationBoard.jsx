import { Card, Button, Badge } from '../atoms'

export default function ReservationBoard({ reservations = [] }) {
  const getTimeStatus = (reservationTime) => {
    const now = new Date()
    const resTime = new Date(reservationTime)
    const diffMinutes = Math.floor((resTime - now) / 60000)

    if (diffMinutes < 0) return 'expired'
    if (diffMinutes <= 15) return 'arriving-soon'
    return 'upcoming'
  }

  const statusVariant = {
    'arriving-soon': 'danger',
    'upcoming': 'warning',
    'expired': 'info'
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Reservations Today</h2>
      <div className="space-y-3">
        {reservations.map((res) => {
          const status = getTimeStatus(res.dateTime)
          return (
            <Card key={res.id} className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold">{res.guestName}</h3>
                  <p className="text-sm text-gray-600">{res.email}</p>
                  <div className="flex gap-4 text-sm text-gray-600 mt-2">
                    <span>📅 {new Date(res.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span>👥 {res.partySize} guests</span>
                    <span>🚪 Table {res.tableId}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <Badge variant={statusVariant[status] || 'info'}>{status}</Badge>
                  <Button size="sm" variant="secondary">Check In</Button>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
