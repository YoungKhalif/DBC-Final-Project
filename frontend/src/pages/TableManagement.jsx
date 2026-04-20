import { useState } from 'react'
import { Card, Button, Modal } from '../components/atoms'
import { TableCard } from '../components/molecules'

export default function TableManagement() {
  const [tables, setTables] = useState([
    { id: 1, name: 'Table 1', capacity: 4, status: 'available', seatsOccupied: 0 },
    { id: 2, name: 'Table 2', capacity: 6, status: 'occupied', seatsOccupied: 4 },
    { id: 3, name: 'Table 3', capacity: 2, status: 'reserved', seatsOccupied: 0 }
  ])
  const [selectedTable, setSelectedTable] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleTableSelect = (table) => {
    setSelectedTable(table)
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Table Management</h1>
        <Button>Add Table</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tables.map((table) => (
          <TableCard
            key={table.id}
            {...table}
            onSelect={() => handleTableSelect(table)}
          />
        ))}
      </div>

      {selectedTable && (
        <Modal
          isOpen={isModalOpen}
          title={`Table ${selectedTable.id}`}
          onClose={() => setIsModalOpen(false)}
          actions={
            <>
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                Close
              </Button>
              <Button>Open Order</Button>
            </>
          }
        >
          <div className="space-y-2">
            <p>
              <strong>Capacity:</strong> {selectedTable.capacity} seats
            </p>
            <p>
              <strong>Status:</strong> {selectedTable.status}
            </p>
            <p>
              <strong>Occupied:</strong> {selectedTable.seatsOccupied} seats
            </p>
          </div>
        </Modal>
      )}
    </div>
  )
}
