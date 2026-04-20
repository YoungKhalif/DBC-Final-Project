import { Badge } from '../atoms'

export default function MenuItemCard({ id, name, price, description, section, onAdd }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-base font-semibold flex-1">{name}</h3>
        <span className="text-lg font-bold text-green-600">${price}</span>
      </div>
      <Badge variant="info" className="mb-2 inline-block">
        {section}
      </Badge>
      <p className="text-sm text-gray-600 mb-3">{description}</p>
      <button
        onClick={onAdd}
        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition-colors text-sm font-medium"
      >
        Add to Order
      </button>
    </div>
  )
}
