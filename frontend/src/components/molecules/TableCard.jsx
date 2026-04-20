import { Badge } from '../atoms'

export default function TableCard({ id, name, capacity, status, seatsOccupied, onSelect }) {
  const statusColor = {
    available: 'success',
    occupied: 'danger',
    reserved: 'warning'
  }

  return (
    <div
      onClick={onSelect}
      className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:shadow-lg cursor-pointer transition-shadow"
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold">{name}</h3>
        <Badge variant={statusColor[status] || 'info'}>{status}</Badge>
      </div>
      <div className="space-y-2 text-sm text-gray-600">
        <p>Capacity: {capacity} seats</p>
        <p>Occupied: {seatsOccupied || 0}</p>
      </div>
    </div>
  )
}
