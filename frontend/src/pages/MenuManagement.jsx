import { useState } from 'react'
import { Card, Button } from '../components/atoms'
import { MenuItemCard } from '../components/molecules'

export default function MenuManagement() {
  const [menu, setMenu] = useState({
    sections: [
      {
        id: 1,
        name: 'Starters',
        items: [
          { id: 1, name: 'Bruschetta', price: 5.99, description: 'Toasted bread with tomato' },
          { id: 2, name: 'Calamari', price: 7.99, description: 'Fried squid rings' }
        ]
      },
      {
        id: 2,
        name: 'Main Course',
        items: [
          { id: 3, name: 'Pasta Carbonara', price: 12.99, description: 'Classic Italian pasta' },
          { id: 4, name: 'Grilled Salmon', price: 18.99, description: 'Fresh salmon fillet' }
        ]
      }
    ]
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Menu Management</h1>
        <Button>Add Section</Button>
      </div>

      {menu.sections.map((section) => (
        <div key={section.id}>
          <h2 className="text-2xl font-semibold mb-4">{section.name}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {section.items.map((item) => (
              <MenuItemCard
                key={item.id}
                {...item}
                section={section.name}
                onAdd={() => console.log('Add to order:', item.name)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
