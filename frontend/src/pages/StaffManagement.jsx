import { useState } from 'react'
import { Card, Button, Input, Modal, Badge } from '../components/atoms'

export default function StaffManagement() {
  const [staff, setStaff] = useState([
    { id: 1, name: 'John Doe', role: 'waiter', status: 'on-duty', phone: '555-0001' },
    { id: 2, name: 'Jane Smith', role: 'chef', status: 'on-duty', phone: '555-0002' },
    { id: 3, name: 'Bob Johnson', role: 'manager', status: 'on-duty', phone: '555-0003' }
  ])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({ name: '', role: 'waiter', phone: '' })

  const handleAddStaff = () => {
    if (formData.name && formData.phone) {
      const newStaff = {
        id: Math.max(...staff.map(s => s.id), 0) + 1,
        ...formData,
        status: 'on-duty'
      }
      setStaff([...staff, newStaff])
      setFormData({ name: '', role: 'waiter', phone: '' })
      setIsModalOpen(false)
    }
  }

  const handleRemoveStaff = (id) => {
    setStaff(staff.filter(s => s.id !== id))
  }

  const roleColors = {
    waiter: 'info',
    chef: 'warning',
    manager: 'success',
    receptionist: 'primary'
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Staff Management</h1>
        <Button onClick={() => setIsModalOpen(true)}>Add Staff Member</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {staff.map((member) => (
          <Card key={member.id} className="p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-lg">{member.name}</h3>
                <p className="text-sm text-gray-600">{member.phone}</p>
              </div>
              <Badge variant={roleColors[member.role]}>{member.role}</Badge>
            </div>
            <div className="mb-4">
              <span className="text-sm px-2 py-1 bg-green-100 text-green-800 rounded">
                {member.status}
              </span>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary">Edit</Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => handleRemoveStaff(member.id)}
              >
                Remove
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        title="Add Staff Member"
        onClose={() => setIsModalOpen(false)}
        actions={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddStaff}>Add</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Name"
            placeholder="John Doe"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <div>
            <label className="block font-medium text-gray-700 mb-2">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="waiter">Waiter</option>
              <option value="chef">Chef</option>
              <option value="receptionist">Receptionist</option>
              <option value="manager">Manager</option>
            </select>
          </div>
          <Input
            label="Phone"
            type="tel"
            placeholder="555-0000"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />
        </div>
      </Modal>
    </div>
  )
}
