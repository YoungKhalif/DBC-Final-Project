export default function Modal({ isOpen, title, children, onClose, actions }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-6">{children}</div>

        {actions && (
          <div className="flex gap-3 p-6 border-t border-gray-200 justify-end">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}
