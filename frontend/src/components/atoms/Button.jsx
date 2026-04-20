export default function Button({ children, variant = 'primary', size = 'md', onClick, disabled = false, className = '' }) {
  const baseStyles = 'font-semibold rounded transition-colors duration-200 cursor-pointer'

  const variants = {
    primary: 'bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 disabled:bg-gray-100',
    danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-400',
    outline: 'border-2 border-gray-400 text-gray-900 hover:border-gray-600 disabled:opacity-50'
  }

  const sizes = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  )
}
