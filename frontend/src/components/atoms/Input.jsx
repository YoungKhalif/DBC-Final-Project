export default function Input({ label, type = 'text', placeholder, value, onChange, error, required = false, className = '' }) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label className="font-medium text-gray-700">
          {label} {required && <span className="text-red-600">*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`px-4 py-2 border-2 rounded transition-colors duration-200 ${
          error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
        } focus:outline-none focus:ring-2`}
      />
      {error && <span className="text-sm text-red-600">{error}</span>}
    </div>
  )
}
