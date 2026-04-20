import { useState } from 'react'
import { Input, Button, Modal } from '../atoms'

export default function ReservationForm({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    guestName: '',
    email: '',
    phone: '',
    partySize: 2,
    dateTime: '',
    notes: ''
  })

  const handleSubmit = () => {
    if (formData.guestName && formData.email && formData.dateTime) {
      onSubmit(formData)
      setFormData({
        guestName: '',
        email: '',
        phone: '',
        partySize: 2,
        dateTime: '',
        notes: ''
      })
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      title="Create Reservation"
      onClose={onClose}
      actions={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Create</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label="Guest Name"
          placeholder="John Doe"
          value={formData.guestName}
          onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
          required
        />
        <Input
          label="Email"
          type="email"
          placeholder="john@example.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        <Input
          label="Phone"
          type="tel"
          placeholder="+1 (555) 000-0000"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium text-gray-700 mb-2">Party Size</label>
            <select
              value={formData.partySize}
              onChange={(e) => setFormData({ ...formData, partySize: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((size) => (
                <option key={size} value={size}>
                  {size} {size === 1 ? 'guest' : 'guests'}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Date & Time"
            type="datetime-local"
            value={formData.dateTime}
            onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block font-medium text-gray-700 mb-2">Special Requests</label>
          <textarea
            placeholder="Any dietary restrictions or special requirements..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            rows="3"
          />
        </div>
      </div>
    </Modal>
  )
}
