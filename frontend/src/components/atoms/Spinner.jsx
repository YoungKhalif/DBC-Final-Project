export default function Spinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  return (
    <div className={`inline-block ${sizes[size]} ${className}`}>
      <div className="animate-spin rounded-full h-full w-full border-4 border-gray-300 border-t-green-600"></div>
    </div>
  )
}
